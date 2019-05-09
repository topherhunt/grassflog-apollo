import React from "react"
import {ApolloProvider} from "react-apollo"
import client from "../apollo_client"
import {Query} from "react-apollo"
import {gql} from "apollo-boost"

import TensionEditor from "./tension_editor.jsx"
import AddProposalPartSection from "./add_proposal_part_section.jsx"

const proposalQuery = gql`
  query Proposal($id: ID!) {
    proposal(id: $id) {
      id
      tension
      inserted_at
      circle { id name }
      proposer { id name email }
    }
  }
`

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
      else return <ProposalBuilder proposal={data.proposal} />
    }}
  </Query>
}

const ShowLoading = () => <div>Loading...</div>

const ShowError = () => <div>Error!</div>

const ProposalBuilder = ({proposal}) => {
  return <div className="u-card">
    <h1>Proposal for circle: {proposal.circle.name}</h1>
    <div className="small text-muted">proposal id: {proposal.id}, proposer email: {proposal.proposer.email}, started at: {proposal.inserted_at}</div>
    <hr />
    <TensionEditor proposal={proposal} />
    <hr />
    <AddProposalPartSection proposal={proposal} />
  </div>
}

export default ProviderWrapper
