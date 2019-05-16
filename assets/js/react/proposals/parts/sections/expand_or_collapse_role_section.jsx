import React from "react"
import PropTypes from "prop-types"

class ExpandOrCollapseRoleSection extends React.Component {
  render() {
    if (this.props.isCircle) {
      return <div>
        <label>
          <input type="checkbox" value="1"
            checked={this.props.getFormField("collapseRole")}
            onChange={(e) => {
              let isChecked = e.target.checked
              this.props.updateForm((f) => f.setCollapseRole(isChecked))
              this.props.queueSaveProposalPart()
            }} />
          &nbsp; Collapse this circle
        </label>
      </div>
    } else {
      return <div>
        <label>
          <input type="checkbox" value="1"
            checked={this.props.getFormField("expandRole")}
            onChange={(e) => {
              let isChecked = e.target.checked
              this.props.updateForm((f) => f.setExpandRole(isChecked))
              this.props.queueSaveProposalPart()
            }} />
          &nbsp; Expand this role into a circle
        </label>
      </div>
    }
  }
}

ExpandOrCollapseRoleSection.propTypes = {
  isCircle: PropTypes.bool.isRequired,
  getFormField: PropTypes.func.isRequired,
  updateForm: PropTypes.func.isRequired,
  queueSaveProposalPart: PropTypes.func.isRequired
}

export default ExpandOrCollapseRoleSection
