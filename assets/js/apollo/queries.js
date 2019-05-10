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
        children { id name }
      }
      proposer { id name email }
      parts {
        id
        type
        targetId
        changes {
          id
          type
          instruction_data
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
        instruction_data
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
  deletePartMutation
}
