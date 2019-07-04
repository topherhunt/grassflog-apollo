import React from "react"
import PropTypes from "prop-types"
import Select from "react-select"
import {Mutation} from "react-apollo"
import {createPartMutation, proposalQuery} from "../../apollo/queries"

class AddProposalPart extends React.Component {
  render() {
    return <Mutation
      mutation={createPartMutation}
      update={this.updateCacheOnCreatePart.bind(this)}
    >
      {(runCreatePartMutation, {called, loading, data}) => (
        <div className="u-card u-box-shadow">
          <h3>Change something</h3>
          <p>Just as a reminder, the tension is: <em>{this.props.proposal.tension}</em></p>
          <div className="row">
            <div className="col-sm-4">
              <Select
                placeholder="Change a role..."
                options={this.roleOptions()}
                onChange={(selected) => {
                  const roleId = parseInt(selected.value)
                  runCreatePartMutation({variables: {
                    proposalId: this.props.proposal.id,
                    type: "update_role",
                    targetId: roleId
                  }})
                }} />
            </div>
            <div className="col-sm-4">
              <a
                href="#"
                className="btn btn-outline-primary"
                onClick={(e) => {
                  e.preventDefault()
                  runCreatePartMutation({variables: {
                    proposalId: this.props.proposal.id,
                    type: "create_role"
                  }})
                }}
              >Add a role</a>
            </div>
          </div>
        </div>
      )}
    </Mutation>
  }

  roleOptions() {
    return this.props.simulatedState.children.map((r) => ({label: r.name, value: r.id}))
  }

  // Tell Apollo how to update the cache to reflect this mutation
  // See https://www.apollographql.com/docs/react/essentials/mutations#update
  updateCacheOnCreatePart(cache, resp) {
    const proposalId = this.props.proposal.id
    const newPart = resp.data.create_proposal_part // The new record we need to cache

    // Load the data from the cache
    let cachedData = cache.readQuery({
      query: proposalQuery,
      variables: {id: proposalId}
    })

    // Update the cached response so it's correct (leave all other data untouched)
    cachedData.proposal.parts = cachedData.proposal.parts.concat(newPart)

    // Write that transformed data to the cache
    cache.writeQuery({
      query: proposalQuery,
      variables: {id: proposalId},
      data: cachedData
    })
  }
}

AddProposalPart.propTypes = {
  proposal: PropTypes.object.isRequired,
  simulatedState: PropTypes.object.isRequired
}

export default AddProposalPart
