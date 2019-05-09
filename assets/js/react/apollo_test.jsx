import React from "react"
import { ApolloProvider } from "react-apollo"
import client from "./apollo_client.js"
import UsersList from "./users/users_list.jsx"

const ApolloTest = () => (
  <ApolloProvider client={client}>
    <div>
      <h2>My first Apollo app 🚀</h2>
      <UsersList />
    </div>
  </ApolloProvider>
)

export default ApolloTest
