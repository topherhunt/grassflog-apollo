import React from "react"
import PropTypes from "prop-types"

class EditRoleDomainsSection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    let domains = this.props.domains
    let focusOnUuid = (this.state.focusOnLastDomain && domains[domains.length-1].uuid)
    return <div className="form-group">
      <hr />
      <h5>Domains</h5>
      {domains.map((domain) => {
        return <div key={domain.uuid} className="form-group u-relative">
          <input type="text"
            className={"form-control" + (domain.toCreate ? " u-to-create" : "") + (domain.toUpdate ? " u-to-update" : "") + (domain.toDelete ? " u-to-delete" : "")}
            value={domain.name}
            ref={(input) => {
              if (input && focusOnUuid == domain.uuid) {
                input.focus()
                this.setState({focusOnLastDomain: false})
              }
            }}
            onChange={(e) => {
              let value = e.target.value
              this.props.updateForm((f) => f.updateDomain(domain.uuid, value))
              this.props.queueSaveProposalPart()
            }} />
          <div className="u-abs-top-right">
            <a href="#" className={domain.toDelete ? "" : "text-danger"}
              onClick={(e) => {
                e.preventDefault()
                this.props.updateForm((f) => f.deleteDomain(domain.uuid))
                this.props.queueSaveProposalPart()
              }}>
              <i className="icon">{domain.toDelete ? "delete_forever" : "delete"}</i>
            </a>
          </div>
        </div>
      })}

      <input type="text"
        className="form-control"
        placeholder="Add a domain..."
        defaultValue=""
        onClick={(e) => {
          this.props.updateForm((f) => f.createDomain())
          this.props.queueSaveProposalPart()
          this.setState({focusOnLastDomain: true})
        }} />
    </div>
  }
}

EditRoleDomainsSection.propTypes = {
  domains: PropTypes.array.isRequired,
  updateForm: PropTypes.func.isRequired,
  queueSaveProposalPart: PropTypes.func.isRequired
}

export default EditRoleDomainsSection
