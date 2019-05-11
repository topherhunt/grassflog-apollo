import React from "react"
import PropTypes from "prop-types"
import {Mutation} from "react-apollo"
import {updatePartMutation} from "../../../apollo/queries"

// TODO: I'd like to deduplicate the mutation into a ProposalPartMutationWrapper.
// Do that after I've proven out the basics with an UpdateRole part.

class CreateRolePart extends React.Component {
  render() {
    return <div>TODO: CreateRolePart</div>
  }
}

CreateRolePart.propTypes = {
  proposal: PropTypes.object.isRequired,
  part: PropTypes.object.isRequired
}

const raise = (message) => console.error(message)

export default CreateRolePart
