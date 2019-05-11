import React from "react"
import PropTypes from "prop-types"
import {Mutation} from "react-apollo"
import {updatePartMutation} from "../../../apollo/queries"

const random_uuid = () => Math.random().toString(36).substring(7)

// TODO: Once I've implemented UpdateRolePart, I should extract the common logic into a PartContentWrapper to house the global mutation stuff.

class UpdateRolePart extends React.Component {
  constructor(props) {
    super(props)

    // Make an in-memory copy of this Part's changes so we can track the user actions
    // without relying on the whims of the Apollo mutation / persistence lifecycle.
    // We'll transform this changeList whenever the user makes changes in this part's UI.
    // When rendering, we reference changes only from this changeList, never directly from
    // the Apollo-cached changes.
    // IMPORTANT: This is a plain property on the component, NOT part of the React State.
    // We don't want to re-render when this changeList is updated. It's purely used to
    // keep track of what changes we'll need to persist.
    this.changeList = props.part.changes.map((chg) => {
      console.log("Parsing change: ", chg)
      return {
        type: chg.type,
        targetId: chg.targetId,
        params: JSON.parse(chg.params),
        // I only really need locator in case of adding new records.
        locator: chg.type+"/"+(chg.targetId || random_uuid())
      }
    })

    // Look up the role that's the scope for this Part
    const contextRoleId = props.part.targetId || raise("targetId is required, but blank!")
    this.contextRole = props.proposal.circle.children.find((r) => r.id == contextRoleId) ||
      raise("Can't find child role by id: "+contextRoleId)
  }

  render() {
    const part = this.props.part
    return <Mutation mutation={updatePartMutation}>
      {(runMutation, {called, loading, data}) => (
        <div>
          <h4>Update role: {this.contextRole.name}</h4>
          <div className="small text-muted">Part ID: {part.id}, type: {part.type}, targetId: {part.targetId}</div>

          {this.renderNameField({runMutation})}

          <div className="form-group">
            <label htmlFor={"role_"+this.targetRole.id+"_purpose"}>Purpose</label>
            <input
              id={"role_"+this.targetRole.id+"_purpose"}
              className="form-control"
              type="text"
              value={this.populateRolePurpose()}
              onChange={() => {}} />
          </div>
        </div>
      )}
    </Mutation>
  }

  renderNameField({runMutation}) {
    let role = this.contextRole
    let locator = "update_role/"+role.id
    let change = this.getChangeByLocator(locator)
    let defaultValue = change ? change.params.name : role.name

    return <div className="form-group">
      <label htmlFor={"role_"+role.id+"_name"}>Name</label>
      <input type="text"
        id={"role_"+role.id+"_name"}
        className="form-control"
        value={defaultValue}
        onChange={(e) => {
          // The approach here is:
          // - Locate the in-memory Change object corresponding to this field
          //   (or generate a new one)
          // - Update it (since a Change can be associated w multiple fields)
          // - Upsert it back into the list
          //
          // Needless to say this is messy and smells of wrong mental model.
          //
          // TODO: Do I need to re-lookup the change here? or can I safely use the
          // one defined at the top of this function?
          let change = this.getChangeByLocator(locator) ||
            {type: "update_role", targetId: role.id, params: {}, locator: locator, }
          change.params.name = e.target.value
          this.upsertChangeByLocator(locator, change)
        }} />
    </div>
  }

  getChangeByLocator(locator) {
    return this.changeList.find((chg) => (chg.locator == locator))
  }

  getAllChangesByType(type) {
    return this.changeList.filter((chg) => (chg.type == type))
  }
}

UpdateRolePart.propTypes = {
  proposal: PropTypes.object.isRequired,
  part: PropTypes.object.isRequired
}

const raise = (message) => console.error(message)

export default UpdateRolePart
