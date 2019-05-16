import React from "react"
import PropTypes from "prop-types"

// TODO: Could I de-duplicate this with EditRoleDomainsSection?
class EditRoleAcctsSection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    let accts = this.props.accts
    let focusOnUuid = (this.state.focusOnLastAcct && accts[accts.length-1].uuid)
    return <div className="form-group">
      <hr />
      <h5>Accts</h5>
      {accts.map((acct) => {
        return <div key={acct.uuid} className="form-group u-relative">
          <input type="text"
            className={"form-control" + (acct.toCreate ? " u-to-create" : "") + (acct.toUpdate ? " u-to-update" : "") + (acct.toDelete ? " u-to-delete" : "")}
            value={acct.name}
            ref={(input) => {
              if (input && focusOnUuid == acct.uuid) {
                input.focus()
                this.setState({focusOnLastAcct: false})
              }
            }}
            onChange={(e) => {
              let value = e.target.value
              this.props.updateForm((f) => f.updateAcct(acct.uuid, value))
              this.props.queueSaveProposalPart()
            }} />
          <div className="u-abs-top-right">
            <a href="#" className={acct.toDelete ? "" : "text-danger"}
              onClick={(e) => {
                e.preventDefault()
                this.props.updateForm((f) => f.deleteAcct(acct.uuid))
                this.props.queueSaveProposalPart()
              }}>
              <i className="icon">{acct.toDelete ? "delete_forever" : "delete"}</i>
            </a>
          </div>
        </div>
      })}

      <input type="text"
        className="form-control"
        placeholder="Add an accountability..."
        defaultValue=""
        onClick={(e) => {
          this.props.updateForm((f) => f.createAcct())
          this.props.queueSaveProposalPart()
          this.setState({focusOnLastAcct: true})
        }} />
    </div>
  }
}

EditRoleAcctsSection.propTypes = {
  accts: PropTypes.array.isRequired,
  updateForm: PropTypes.func.isRequired,
  queueSaveProposalPart: PropTypes.func.isRequired
}

export default EditRoleAcctsSection
