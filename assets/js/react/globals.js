// Add all top-level components to the global scope so they're renderable from Phoenix
// Thanks to https://hexdocs.pm/react_phoenix/readme.html#usage

import ProposalBuilder from "./proposals/proposal_builder.jsx"
import ApolloTest from "./apollo_test.jsx"

window.Components = {
  ApolloTest,
  ProposalBuilder
}
