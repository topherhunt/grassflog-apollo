import React from "react"
import {ApolloProvider} from "react-apollo"
import client from "../../apollo/client"
import {Query} from "react-apollo"

import TensionEditor from "./tension_editor.jsx"
import ProposalPartContainer from "./proposal_part_container.jsx"
import AddProposalPart from "./add_proposal_part.jsx"

import {proposalQuery} from "../../apollo/queries"

// Wrap the component with an Apollo provider since this is the root
const ProviderWrapper = (props) => (
  <ApolloProvider client={client}>
    <QueryWrapper {...props} />
  </ApolloProvider>
)

// Wrap the component in a query
const QueryWrapper = (props) => {
  // console.log(props)
  return <Query query={proposalQuery} variables={{id: props.proposal_id}}>
    {({loading, error, data}) => {
      if (loading) return <ShowLoading {...props} />
      else if (error) return <ShowError {...props} />
      else return <ShowProposalBuilder proposal={data.proposal} />
    }}
  </Query>
}

const ShowLoading = () => <div>Loading...</div>

const ShowError = () => <div>Error!</div>

const ShowProposalBuilder = ({proposal}) => {
  console.log("The proposal received from apollo: ", proposal)
  // TODO: Compute the simulated state starting with the actual state and executing
  // each Part in sequence.
  // For now, I'll just use the actual state as the simulated state.
  return <div className="u-card">
    <h1>Proposal for circle: {proposal.circle.name}</h1>
    <div className="small text-muted">proposed by {proposal.proposer.name} ({proposal.proposer.email}), started at: {proposal.insertedAt}</div>
    <TensionEditor proposal={proposal} />
    {proposal.parts.map((part) =>
      <ProposalPartContainer
        key={part.id}
        part={part}
        proposalId={proposal.id}
        currentState={proposal.circle}
        simulatedState={proposal.circle} />
    )}
    <AddProposalPart
      proposal={proposal}
      simulatedState={proposal.circle} />
  </div>
}

export default ProviderWrapper
