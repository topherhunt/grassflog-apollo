import React from "react"
import PropTypes from "prop-types"
import {Mutation} from "react-apollo"
import CreateRolePart from "./parts/create_role_part.jsx"
import UpdateRolePart from "./parts/update_role_part.jsx"
import {proposalQuery, updatePartMutation, deletePartMutation} from "../../apollo/queries"

class ProposalPartContainer extends React.Component {
  render() {
    return this.wrapInDeletePartMutation()
  }

  wrapInDeletePartMutation() {
    return <Mutation
      mutation={deletePartMutation}
      update={this.updateCacheOnDelete.bind(this)}
    >
      {(runDeletePartMutation, {called, loading, data}) => (
        <div className="u-card u-box-shadow u-relative">
          {this.wrapInUpdatePartMutation()}
          {this.renderDeletePartButton({runDeletePartMutation})}
        </div>
      )}
    </Mutation>
  }

  renderDeletePartButton({runDeletePartMutation}) {
    return <div className="u-abs-top-right">
      <a href="#" className="text-danger"
        onClick={(e) => {
          e.preventDefault()
          runDeletePartMutation({variables: {id: this.props.part.id}})
        }}
      >×</a>
    </div>
  }

  wrapInUpdatePartMutation() {
    return <Mutation mutation={updatePartMutation}>
      {(runUpdatePartMutation, {called, loading, data}) =>
        this.renderThisParticularPartType({runUpdatePartMutation})
      }
    </Mutation>
  }

  renderThisParticularPartType({runUpdatePartMutation}) {
    let type = this.props.part.type
    let passedProps = {...this.props, runUpdatePartMutation}

    if (type == "create_role") {
      return <CreateRolePart {...passedProps} />
    } else if (type == "update_role") {
      return <UpdateRolePart {...passedProps} />
    } else {
      raise("Unknown ProposalPart type: "+type)
    }
  }

  // Tell Apollo how to update the cache to reflect this mutation
  // See https://www.apollographql.com/docs/react/essentials/mutations#update
  updateCacheOnDelete(cache, resp) {
    let proposalId = this.props.proposal.id
    let deletedPartId = this.props.part.id // The record we need removed from the cache

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
