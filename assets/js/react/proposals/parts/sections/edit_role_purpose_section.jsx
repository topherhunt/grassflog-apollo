import React from "react"
import PropTypes from "prop-types"
const randomUuid = () => Math.random().toString(36).substring(7)

class EditRolePurposeSection extends React.Component {
  render() {
    let label = "role_name_"+randomUuid()
    let toUpdate = (this.props.currentPurpose != this.props.origPurpose)
    return <div className="form-group">
      <label htmlFor={label}>Purpose</label>
      <input type="text"
        id={label}
        className={"form-control" + (toUpdate ? " u-to-update" : "")}
        value={this.props.currentPurpose}
        onChange={(e) => {
          let name = e.target.value
          this.props.updateForm((f) => f.setRolePurpose(name))
          this.props.queueSaveProposalPart()
        }} />
    </div>
  }
}

EditRolePurposeSection.propTypes = {
  currentPurpose: PropTypes.string.isRequired,
  origPurpose: PropTypes.string.isRequired,
  updateForm: PropTypes.func.isRequired,
  queueSaveProposalPart: PropTypes.func.isRequired
}

export default EditRolePurposeSection
