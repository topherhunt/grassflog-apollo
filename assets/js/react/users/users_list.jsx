// A simple query component

import React from "react"
import { Query } from "react-apollo"
import {allUsersQuery} from "../../apollo/queries"

const UsersList = () => (
  <Query query={allUsersQuery}>
    {({loading, error, data}) => {
      if (loading) {
        return <p>Loading...</p>
      } else if (error) {
        return <p>Error: {error}</p>
      } else {
        return data.users.map((user) => (
          <div key={user.id} className="alert alert-success">
            <p><strong>{user.name}</strong></p>
            <p>Email: {user.email}</p>
            <p>Last signed in: {user.lastSignedInAt}</p>
          </div>
        ))
      }
    }}
  </Query>
)

export default UsersList
