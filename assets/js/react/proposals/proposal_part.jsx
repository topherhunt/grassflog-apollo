import React from "react"
import PropTypes from "prop-types"
import {Mutation} from "react-apollo"
import {gql} from "apollo-boost"

const deletePartMutation = gql`
  mutation DeletePart($id: ID!) {
    delete_proposal_part(id: $id) {
      id
    }
  }
`

// Query used to fetch and update the cache after the mutation succeeds
const cachedProposalPartsQuery = gql`
  query Proposal($id: ID!) {
    proposal(id: $id) {
      id
      parts { id type targetId }
    }
  }
`

class ProposalPart extends React.Component {
  render() {
    return <Mutation
      mutation={deletePartMutation}
      update={this.updateCache.bind(this)}
    >
      {(runMutation, {called, loading, data}) => (
        <div className="u-card u-relative">
          <h4>{this.title()}</h4>
          <div>type: {this.props.part.type}</div>
          <div>targetId: {this.props.part.targetId}</div>
          <div style={{position: "absolute", right: "10px", top: "10px"}}>
            <a href="#" className="btn text-danger"
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

  title() {
    if (this.props.part.type == "create_role") {
      return "Add a role"
    } else {
      const role = this.findTargetRole()
      return "Update role: " + role.name
    }
  }

  findTargetRole() {
    const roleId = this.props.part.targetId || raise("targetId is required, but blank!")
    const role = this.props.currentState.children.find((r) => r.id == roleId)
    return role || raise("No child role found for roleId "+roleId)
  }

  // Tell Apollo how to update the cache to reflect this mutation
  // See https://www.apollographql.com/docs/react/essentials/mutations#update
  updateCache(cache, resp) {
    const proposalId = this.props.proposalId
    const deletedPartId = this.props.part.id // The record we need removed from the cache

    // Load the relevant data from the cache (we can ignore fields that won't change)
    let cachedData = cache.readQuery({
      query: cachedProposalPartsQuery,
      variables: {id: proposalId}
    })

    // Update the cached response so it's correct
    cachedData.proposal.parts =
      cachedData.proposal.parts.filter((part) => { return part.id != deletedPartId })

    // Write that transformed data to the cache (will leave alone any unreferenced fields)
    cache.writeQuery({
      query: cachedProposalPartsQuery,
      variables: {id: proposalId},
      data: cachedData
    })
  }
}

ProposalPart.propTypes = {
  proposalId: PropTypes.string.isRequired,
  part: PropTypes.object.isRequired,
  currentState: PropTypes.object.isRequired
}

const raise = (message) => console.error(message)

export default ProposalPart
