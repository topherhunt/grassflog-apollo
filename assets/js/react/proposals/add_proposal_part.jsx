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
      {(runMutation, {called, loading, data}) => {
        return <div className="u-card u-box-shadow">
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
      }}
    </Mutation>
  }

  // Once the mutation adds a ProposalPart, we need to manually update the cache so it
  // knows about the new record.
  // See https://www.apollographql.com/docs/react/essentials/mutations#update
  updateCache(cache, resp) {
    // First we fetch the new ProposalPart data from the mutation response.
    // Its shape & fields should match the parts list that we'll append it to.
    const newPart = resp.data.create_proposal_part
    // Next we load the current data from the cache, transform it, and write that data
    // back to the cache so it's up-to-date.
    // This query doesn't need to be complete; ie. if we ignore other Proposal fields,
    // those fields won't be removed by our writeQuery call below.
    let cachedData = cache.readQuery({
      query: cachedProposalPartsQuery,
      variables: {id: this.props.proposal.id}
    })
    // Transform the cachedData so it's up-to-date.
    cachedData.proposal.parts = cachedData.proposal.parts.concat(newPart)
    // Then load this updated cachedData back into the cache. (Any unreferenced fields
    // will be preserved, so eg. it won't clobber proposal.tension or proposal.circle.)
    cache.writeQuery({
      query: cachedProposalPartsQuery,
      variables: {id: this.props.proposal.id},
      data: cachedData
    })
  }

  roleOptions() {
    return this.props.simulatedState.children.map((r) => ({label: r.name, value: r.id}))
  }
}

AddProposalPart.propTypes = {
  proposal: PropTypes.object,
  simulatedState: PropTypes.object
}

export default AddProposalPart
