import React from "react"
import PropTypes from "prop-types"
import {Mutation} from "react-apollo"
import {updatePartMutation} from "../../../apollo/queries"

// TODO: Once I've implemented UpdateRolePart, I should extract the common logic into a PartContentWrapper to house the global mutation stuff.

class UpdateRolePart extends React.Component {
  constructor(props) {
    super(props)

    // Compute an in-memory copy of this Part's changes so we can track the user actions
    // without relying on the whims of the Apollo mutation / persistence lifecycle.
    // We'll transform this changeList whenever the user makes changes in this part's UI.
    // IMPORTANT: This is a plain property on the component, NOT part of the React State.
    // We don't want to re-render when this changeList is updated, it's purely used to
    // keep track of what changes we want to persist.
    this.changeList = props.part.changes.map((chg) => ({
      type: chg.type,
      // TODO: Parse out this JSON string into a sub-object
      instruction_data: chg.instruction_data
    }))

    // Look up the target role for this change
    const roleId = props.part.targetId || raise("targetId is required, but blank!")
    this.targetRole = props.proposal.circle.children.find((r) => r.id == roleId) ||
      raise("Can't find child role by id: "+roleId)
  }

  render() {
    const part = this.props.part
    return <Mutation mutation={updatePartMutation}>
      {(runMutation, {called, loading, data}) => (
        <div>
          <h4>Update role: {this.targetRole.name}</h4>
          <div className="small text-muted">Part ID: {part.id}, type: {part.type}, targetId: {part.targetId}</div>

          <div className="form-group">
            <label htmlFor={"role_"+this.targetRole.id+"_name"}>Name</label>
            <input
              id={"role_"+this.targetRole.id+"_name"}
              type="text"
              value={"TODO: this.getChange('create_role')"} onChange={() => {}}
              className="form-control" />
          </div>
        </div>
      )}
    </Mutation>
  }
}

UpdateRolePart.propTypes = {
  proposal: PropTypes.object.isRequired,
  part: PropTypes.object.isRequired
}

const raise = (message) => console.error(message)

export default UpdateRolePart
