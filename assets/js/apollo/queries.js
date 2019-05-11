import {gql} from "apollo-boost"

const allUsersQuery = gql`
  query Users {
    users { id email lastSignedInAt name }
  }
`

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
          domains { id role_id name }
          accts { id role_id name }
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
          targetId
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
        targetId
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
        targetId
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
