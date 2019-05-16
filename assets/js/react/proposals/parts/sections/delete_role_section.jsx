import React from "react"
import PropTypes from "prop-types"

class DeleteRoleSection extends React.Component {
  render() {
    return <div>
      <label>
        <input type="checkbox" value="1"
          checked={this.props.isChecked}
          onChange={(e) => {
            let isChecked = e.target.checked
            this.props.updateForm((f) => f.setDeleteRole(isChecked))
            this.props.queueSaveProposalPart()
          }} />
        &nbsp; <span className="text-danger">Delete this role</span>
      </label>
    </div>
  }
}

DeleteRoleSection.propTypes = {
  isChecked: PropTypes.bool.isRequired,
  updateForm: PropTypes.func.isRequired,
  queueSaveProposalPart: PropTypes.func.isRequired
}

export default DeleteRoleSection
