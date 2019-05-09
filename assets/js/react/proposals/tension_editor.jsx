import React from "react"
import {Mutation} from "react-apollo"
import {gql} from "apollo-boost"
import _ from "underscore"

// As long as we request the mutation to return all fields that are being changed,
// Apollo will smartly update the cache, re-rendering any usages of that data.
// If we don't request both `id` and `tension` here, or in certain complex edge cases,
// we may need to tell Apollo how to update the cache to keep it in-sync.
const updateProposalMutation = gql`
  mutation UpdateProposal($id: ID!, $tension: String!) {
    update_proposal(id: $id, tension: $tension) {
      id
      tension
    }
  }
`

const TensionEditor = ({proposal}) => {
  return <Mutation mutation={updateProposalMutation}>
    {(runMutation, {called, loading, data}) => {
      // console.log("Mutation rendering with data: ", data)

      const updateTension = _.debounce((tension) => {
        console.log("Running updateProposalMutation.")
        runMutation({variables: {id: proposal.id, tension: tension}})
      }, 200)

      return <div className="form-group u-relative">
        <label htmlFor="proposal_tension">The tension:</label>
        <textarea
          id="proposal_tension"
          className="form-control"
          defaultValue={proposal.tension}
          placeholder="What's the pain you're feeling? Why bother making this change?"
          onChange={(e) => { updateTension(e.target.value) }}
        ></textarea>
      </div>
    }}
  </Mutation>
}

export default TensionEditor
