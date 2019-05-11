import React from "react"
import PropTypes from "prop-types"
import {Mutation} from "react-apollo"
import CreateRolePart from "./parts/create_role_part.jsx"
import UpdateRolePart from "./parts/update_role_part.jsx"
import {deletePartMutation, proposalQuery} from "../../apollo/queries"

class ProposalPartContainer extends React.Component {
  render() {
    return <Mutation
      mutation={deletePartMutation}
      update={this.updateCache.bind(this)}
    >
      {(runMutation, {called, loading, data}) => (
        <div className="u-card u-relative">
          {this.renderPartContent(this.props.part.type)}
          <div className="u-abs-top-right">
            <a href="#" className="text-danger"
              onClick={(e) => {
                e.preventDefault()
                runMutation({variables: {id: this.props.part.id}})
              }}
            >×</a>
          </div>
        </div>
      )}
    </Mutation>
  }

  renderPartContent(type) {
    if (type == "create_role") {
      return <CreateRolePart {...this.props} />
    } else if (type == "update_role") {
      return <UpdateRolePart {...this.props} />
    } else {
      raise("Unknown ProposalPart type: "+type)
    }
  }

  // Tell Apollo how to update the cache to reflect this mutation
  // See https://www.apollographql.com/docs/react/essentials/mutations#update
  updateCache(cache, resp) {
    const proposalId = this.props.proposalId
    const deletedPartId = this.props.part.id // The record we need removed from the cache

    // Load the relevant data from the cache (we can ignore fields that won't change)
    let cachedData = cache.readQuery({
      query: proposalQuery,
      variables: {id: proposalId}
    })

    // Update the cached response so it's correct
    cachedData.proposal.parts =
      cachedData.proposal.parts.filter((part) => { return part.id != deletedPartId })

    // Write that transformed data to the cache (will leave alone any unreferenced fields)
    cache.writeQuery({
      query: proposalQuery,
      variables: {id: proposalId},
      data: cachedData
    })
  }
}

ProposalPartContainer.propTypes = {
  proposal: PropTypes.object.isRequired,
  part: PropTypes.object.isRequired
}

const raise = (message) => console.error(message)

export default ProposalPartContainer
