import {gql} from "apollo-boost"

const allUsersQuery = gql`
  query Users {
    users { id email lastSignedInAt name }
  }
`

// Fetch the proposal for the proposal builder UI.
// Considerations:
// * Need the context circle and thorough information on all child roles
// * Need basic info on grandchild roles (so the user can move them up)
// * The ProposalChange params is a serialized JSON string. We manually de/encode it.
const proposalQuery = gql`
  query Proposal($id: ID!) {
    proposal(id: $id) {
      id
      tension
      insertedAt
      circle {
        id
        name
        children {
          id
          name
          parent_id
          purpose
          isCircle
          domains { id role_id name }
          accts { id role_id name }
          children {
            id
            name
          }
        }
      }
      proposer { id name email }
      parts {
        id
        type
        targetId
        changes {
          id
          type
          params
        }
      }
    }
  }
`

const updateProposalMutation = gql`
  mutation UpdateProposal($id: ID!, $tension: String!) {
    update_proposal(id: $id, tension: $tension) {
      id
      tension
    }
  }
`

const createPartMutation = gql`
  mutation CreatePart($proposalId: ID!, $type: String!, $targetId: Int) {
    create_proposal_part(proposalId: $proposalId, type: $type, targetId: $targetId) {
      id
      type
      targetId
      changes {
        id
        type
        params
      }
    }
  }
`

const updatePartMutation = gql`
  mutation UpdateProposalPart($id: ID!, $changes_json: String!) {
    update_proposal_part(id: $id, changes_json: $changes_json) {
      id
      type
      targetId
      changes {
        id
        type
        params
      }
    }
  }
`

const deletePartMutation = gql`
  mutation DeletePart($id: ID!) {
    delete_proposal_part(id: $id) {
      id
    }
  }
`

export {
  allUsersQuery,
  proposalQuery,
  updateProposalMutation,
  createPartMutation,
  updatePartMutation,
  deletePartMutation
}
