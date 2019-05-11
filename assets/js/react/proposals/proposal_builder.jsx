import React from "react"
import PropTypes from "prop-types"
import {ApolloProvider} from "react-apollo"
import client from "../../apollo/client"
import {Query} from "react-apollo"
import TensionEditor from "./tension_editor.jsx"
import ProposalPartContainer from "./proposal_part_container.jsx"
import AddProposalPart from "./add_proposal_part.jsx"
import {proposalQuery} from "../../apollo/queries"

class ProposalBuilder extends React.Component {
  render() {
    return <ApolloProvider client={client}>
      <Query query={proposalQuery} variables={{id: this.props.proposal_id}}>
        {({loading, error, data}) => {
          if (loading) return this.renderLoading()
          else if (error) return this.renderError()
          else return this.renderProposalBuilder(data.proposal)
        }}
      </Query>
    </ApolloProvider>
  }

  renderLoading() {
    return <div>Loading...</div>
  }

  renderError() {
    return <div>Error!</div>
  }

  renderProposalBuilder(proposal) {
    console.log("The proposal received from apollo: ", proposal)
    return <div className="u-card">
      <h1>Proposal for circle: {proposal.circle.name}</h1>
      <div className="small text-muted">Proposed by {proposal.proposer.name} ({proposal.proposer.email}), started at: {proposal.insertedAt}</div>
      <TensionEditor proposal={proposal} />
      <hr />
      {proposal.parts.map((part) =>
        <ProposalPartContainer
          key={part.id}
          proposal={proposal}
          part={part} />
      )}
      <AddProposalPart
        proposal={proposal}
        simulatedState={proposal.circle} />
    </div>
  }
}

ProposalBuilder.propTypes = {
  proposal_id: PropTypes.string.isRequired
}

export default ProposalBuilder
