import React from "react"
import PropTypes from "prop-types"

class ProposalPartContent extends React.Component {
  render() {
    return <div>
      <h4>{this.title()}</h4>
      <div>type: {this.props.part.type}</div>
      <div>targetId: {this.props.part.targetId}</div>
    </div>
  }

  title() {
    const type = this.props.part.type
    if (type == "create_role") {
      return "New role"
    } else if (type == "update_role") {
      const role = this.findTargetRole()
      return "Update role: "+role.name
    } else {
      raise("Unknown type: "+type)
    }
  }

  findTargetRole() {
    const roleId = this.props.part.targetId || raise("targetId is required, but blank!")
    const role = this.props.currentState.children.find((r) => r.id == roleId)
    return role || raise("No child role found for roleId "+roleId)
  }
}

ProposalPartContent.propTypes = {
  proposalId: PropTypes.string.isRequired,
  part: PropTypes.object.isRequired,
  currentState: PropTypes.object.isRequired
}

const raise = (message) => console.error(message)

export default ProposalPartContent
