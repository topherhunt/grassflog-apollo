import React from "react"
import PropTypes from "prop-types"
const randomUuid = () => Math.random().toString(36).substring(7)

class EditRoleNameSection extends React.Component {
  render() {
    let label = "role_name_"+randomUuid()
    let toUpdate = (this.props.currentName != this.props.origName)
    return <div className="form-group">
      <label htmlFor={label}>Name</label>
      <input type="text"
        id={label}
        className={"form-control" + (toUpdate ? " u-to-update" : "")}
        value={this.props.currentName}
        onChange={(e) => {
          let name = e.target.value
          this.props.updateForm((f) => f.setRoleName(name))
          this.props.queueSaveProposalPart()
        }} />
    </div>
  }
}

EditRoleNameSection.propTypes = {
  currentName: PropTypes.string.isRequired,
  origName: PropTypes.string.isRequired,
  updateForm: PropTypes.func.isRequired,
  queueSaveProposalPart: PropTypes.func.isRequired
}

export default EditRoleNameSection
