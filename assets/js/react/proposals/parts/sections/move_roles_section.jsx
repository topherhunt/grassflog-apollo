import React from "react"
import PropTypes from "prop-types"
import Select from "react-select"

// TODO: I'd like to deduplicate the mutation into a ProposalPartMutationWrapper.
// Do that after I've proven out the basics with an UpdateRole part.

class MoveRolesSection extends React.Component {
  render() {
    let {canMoveStuffDown, canMoveStuffUp} = this.decideIfCanMoveStuff()
    // TODO: We want to show the div if there are currently moveRole changes,
    // even if those changes are invalid
    if (!canMoveStuffDown && !canMoveStuffUp) {
      return <div></div>
    }

    return <div>
      <hr />
      <h5>Move roles</h5>
      {this.renderMoveRolesSectionContent()}
    </div>
  }

  decideIfCanMoveStuff() {
    let isCircle = this.props.partRole.isCircle
    let expandRole = this.props.getFormField("expandRole")
    let collapseRole = this.props.getFormField("collapseRole")
    let deleteRole = this.props.getFormField("deleteRole")

    return {
      canMoveStuffDown: (isCircle || expandRole) && !collapseRole && !deleteRole,
      canMoveStuffUp: isCircle
    }
  }

  renderMoveRolesSectionContent() {
    let {canMoveStuffDown, canMoveStuffUp} = this.decideIfCanMoveStuff()
    return <div>
      <div className="row form-group">
        {canMoveStuffDown ? this.renderMoveRoleDownDropdown() : ""}
        {canMoveStuffUp   ? this.renderMoveRoleUpDropdown()   : ""}
      </div>
      {/* TODO: For better UI, the list of roles being moved should be divided into the in vs. out category and shown as part of that column, and hidden (reverted?) if that move-type is unavailable. */}
      <table className="table">
        <tbody>
          {this.props.getFormField("roleMoves").map((move) => {
            let targetRole = this.props.allKnownRoles.find((r) => +r.id == +move.targetId)
            let parentRole = this.props.allKnownRoles.find((r) => +r.id == +move.parentId)
            let direction = (parentRole.id == this.props.partRole.id ? "into" : "up to")
            return <tr key={"move-"+move.targetId+"-"+move.parentId}>
              <td>Move "{targetRole.name}" {direction} "{parentRole.name}"</td>
              <td>
                <a href="#" className="text-danger"
                  onClick={(e) => {
                    e.preventDefault()
                    this.props.updateForm((f) => f.deleteRoleMove(move.uuid))
                    this.props.queueSaveProposalPart()
                  }}
                >×</a>
              </td>
            </tr>
          })}
        </tbody>
      </table>
    </div>
  }

  renderMoveRoleDownDropdown() {
    return <div className="col-sm-6">
      Move a role <strong>down into</strong> "{this.props.partRole.name}":
      <Select
        placeholder="Select a role..."
        options={this.moveRoleDownOpts()}
        selected=""
        onChange={(selected) => {
          let roleId = parseInt(selected.value)
          let newParentId = this.props.partRole.id
          this.props.updateForm((f) => f.createRoleMove(roleId, newParentId))
          this.props.queueSaveProposalPart()
        }}
      />
    </div>
  }

  renderMoveRoleUpDropdown() {
    return <div className="col-sm-6">
      Move a role <strong>up to</strong> "{this.props.proposalCircle.name}":
      <Select
        placeholder="Select a role..."
        options={this.moveRoleUpOpts()}
        selected=""
        onChange={(selected) => {
          let roleId = parseInt(selected.value)
          let newParentId = this.props.proposalCircle.id
          this.props.updateForm((f) => f.createRoleMove(roleId, newParentId))
          this.props.queueSaveProposalPart()
        }}
      />
    </div>
  }

  // You may move DOWN any child of the proposal's circle, except the part target role,
  // unless you've already moved that role in this proposal part.
  moveRoleDownOpts() {
    let alreadyMovedRoleIds = this.props.getFormField("roleMoves").map((m) => +m.targetId)
    return this.props.proposalCircle.children
      .filter((r) => r.id != this.props.partRole.id)
      .filter((r) => alreadyMovedRoleIds.indexOf(+r.id) == -1)
      .map((r) => ({label: r.name, value: r.id}))
  }

  // You may move UP any child of the part target role,
  // unless you've already moved that role in this proposal part.
  moveRoleUpOpts() {
    let alreadyMovedRoleIds = this.props.getFormField("roleMoves").map((m) => +m.targetId)
    return this.props.partRole.children
      .filter((r) => alreadyMovedRoleIds.indexOf(+r.id) == -1)
      .map((r) => ({label: r.name, value: r.id}))
  }


}

MoveRolesSection.propTypes = {
  proposalCircle: PropTypes.object.isRequired,
  partRole: PropTypes.object.isRequired,
  allKnownRoles: PropTypes.array.isRequired,
  updateForm: PropTypes.func.isRequired,
  getFormField: PropTypes.func.isRequired,
  queueSaveProposalPart: PropTypes.func.isRequired,
}

const raise = (message) => console.error(message)

export default MoveRolesSection
