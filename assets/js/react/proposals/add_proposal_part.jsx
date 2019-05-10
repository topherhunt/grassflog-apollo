import React from "react"
import PropTypes from "prop-types"
import Select from "react-select"
import {Mutation} from "react-apollo"
import {gql} from "apollo-boost"

const createPartMutation = gql`
  mutation CreatePart($proposalId: ID!, $type: String!, $targetId: Int) {
    create_proposal_part(proposalId: $proposalId, type: $type, targetId: $targetId) {
      id
      type
      targetId
    }
  }
`

// This query is used to load and update the cache after createPartMutation succeeds.
// It follows the same shape as ProposalBuilder.proposalQuery, but it's pruned since
// we only care about updating the proposal.parts list and can ignore the rest.
const cachedProposalPartsQuery = gql`
  query Proposal($id: ID!) {
    proposal(id: $id) {
      id
      parts { id type targetId }
    }
  }
`

class AddProposalPart extends React.Component {
  render() {
    return <Mutation
      mutation={createPartMutation}
      update={this.updateCache.bind(this)}>
      {(runMutation, {called, loading, data}) => (
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
                  runMutation({variables: {
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
                  runMutation({variables: {
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
  updateCache(cache, resp) {
    const proposalId = this.props.proposal.id
    const newPart = resp.data.create_proposal_part // The new record we need to cache

    // Load the relevant data from the cache (we can ignore fields that won't change)
    let cachedData = cache.readQuery({
      query: cachedProposalPartsQuery,
      variables: {id: proposalId}
    })

    // Update the cached response so it's correct
    cachedData.proposal.parts = cachedData.proposal.parts.concat(newPart)

    // Write that transformed data to the cache (will leave alone any unreferenced fields)
    cache.writeQuery({
      query: cachedProposalPartsQuery,
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
