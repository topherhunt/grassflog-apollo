// Proof-of-concept: connecting Apollo to gql, rendering a React component
// Creates a root-level component that knows how to serve Apollo queries from
// child components.

// TODO: Should this go in app.js? Where should this go?

import React from "react"
import UsersListComponent from "./components/users_list.jsx"
import { ApolloProvider } from "react-apollo"
import client from "./apollo_client.js"
import { render } from "react-dom"

const ApolloRoot = () => (
  <ApolloProvider client={client}>
    <div>
      <h2>My first Apollo app 🚀</h2>
      <UsersListComponent />
    </div>
  </ApolloProvider>
)

render(<ApolloRoot />, document.getElementById("react-root"))
