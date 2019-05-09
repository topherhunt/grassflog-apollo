import React from "react"
import PropTypes from "prop-types"

class ProposalPart extends React.Component {
  render() {
    return <div className="u-card u-relative">
      <h4>{this.title()}</h4>
      <div>type: {this.props.part.type}</div>
      <div>targetId: {this.props.part.targetId}</div>
      <div style={{position: "absolute", right: "10px", top: "10px"}}>
        <a href="#" className="btn text-danger"
        >×</a>
      </div>
    </div>
  }

  title() {
    if (this.props.part.type == "create_role") {
      return "Add a role"
    } else {
      const role = this.findTargetRole()
      return "Update role: " + role.name
    }
  }

  findTargetRole() {
    const roleId = this.props.part.targetId || raise("targetId is required, but blank!")
    const role = this.props.currentState.children.find((r) => r.id == roleId)
    return role || raise("No child role found for roleId "+roleId)
  }
}

ProposalPart.propTypes = {
  part: PropTypes.object,
  currentState: PropTypes.object
}

const raise = (message) => console.error(message)

export default ProposalPart
