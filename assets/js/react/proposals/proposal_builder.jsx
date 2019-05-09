import React from "react"
import {Query} from "react-apollo"
import {gql} from "apollo-boost"
import { ApolloProvider } from "react-apollo"
import client from "../apollo_client.js"

const theQuery = gql`
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
  return <Query query={theQuery} variables={{id: props.proposal_id}}>
    {({loading, error, data}) => {
      if (loading) return <ShowLoading {...props} />
      else if (error) return <ShowError {...props} />
      else return <ProposalBuilder {...props} data={data} />
    }}
  </Query>
}

const ShowLoading = () => <div>Loading...</div>

const ShowError = () => <div>Error!</div>

const ProposalBuilder = ({proposal_id, data}) => {
  return <div className="u-card">
    <h1>Proposal for circle: {data.proposal.circle.name}</h1>
    <div className="small text-muted">proposal id: {data.proposal.id}, proposer email: {data.proposal.proposer.email}, started at: {data.proposal.inserted_at}</div>
    <hr />
    <label htmlFor="proposal_tension">The tension:</label>
    <textarea
      id="proposal_tension"
      className="form-control"
      defaultValue={data.proposal.tension}
      placeholder="What's the pain you're feeling? Why bother making this change?"></textarea>
    <hr />
    <div className="u-card">
      <h3>Change something</h3>
      <div>
        <a className="btn btn-outline-primary">Change a role</a>
        &nbsp;
        <a className="btn btn-outline-success">Add a role</a>
      </div>
    </div>
  </div>
}

export default ProviderWrapper
