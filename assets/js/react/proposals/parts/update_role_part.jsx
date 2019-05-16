import React from "react"
import PropTypes from "prop-types"
import Select from "react-select"
import {Mutation} from "react-apollo"
import _ from "underscore"
import {updatePartMutation} from "../../../apollo/queries"
import {FormObject, ConversionLogic} from "./proposal_change_helpers"
import MoveRolesSection from "./sections/move_roles_section.jsx"

const raise = (message) => { console.error(message); abort() }
const randomUuid = () => Math.random().toString(36).substring(7)

class UpdateRolePart extends React.Component {
  constructor(props) {
    super(props)

    // The target role of this ProposalPart (ie. the main role being changed)
    this.partRole = this.lookupPartRole(props)

    // All roles potentially relevant to this Part (for easy name lookups)
    this.allKnownRoles = [props.proposal.circle].concat(
      props.proposal.circle.children,
      this.partRole.children)

    // We track the state of this proposal builder section by using two form objects:
    // one to represent the "pristine" state of this ProposalPart and one to represent
    // the latest state given all of the user's proposed changes (within this part).
    // TODO: What do we use origForm for again? Is it used anywhere in the renderer, or
    // will we only need it when diffing to compute changes?
    let origForm = new FormObject
    origForm.setInitialData("update_role", this.partRole)
    let currentForm = ConversionLogic.applyChanges(origForm, props.part.changes)
    this.state = {origForm, currentForm}

    // Any of the event handlers below can trigger a debounced mutation by calling this.
    this.queueSaveProposalPart = _.debounce(() => {
      let partId = this.props.part.id
      const {origForm, currentForm} = this.state
      const changeList = ConversionLogic.computeChanges(origForm, currentForm)
      const changesJson = JSON.stringify(changeList.changes)
      console.log("Saving ProposalPart "+partId+" with changes: ", changesJson)
      // Run the "Update ProposalPart" mutation func provided from ProposalPartContainer
      this.props.runUpdatePartMutation({
        variables: {id: this.props.part.id, changes_json: changesJson}
      })
      // this.setState({updatePending: false})
    }, 500).bind(this)
  }

  render() {
    // console.log("currentForm is: ", this.state.currentForm)
    return <div>
      <h4>Update role: {this.partRole.name}</h4>
      <div className="small text-muted">
        Part ID: {this.props.part.id},
        type: {this.props.part.type},
        targetId: {this.props.part.targetId}
      </div>

      {this.renderNameField()}
      {this.renderPurposeField()}
      {this.renderDomainsSection()}
      {this.renderAcctsSection()}
      <hr />
      {this.renderExpandOrCollapseRoleSection()}
      {this.renderDeleteRoleSection()}
      {this.renderMoveRolesSection()}
    </div>
  }

  renderNameField() {
    let role = this.partRole
    let name = this.getFormField("roleName")
    let origName = this.state.origForm.get("roleName")
    let toUpdate = (name != origName)
    return <div className="form-group">
      <label htmlFor={"role_"+role.id+"_name"}>Name</label>
      <input type="text"
        id={"role_"+role.id+"_name"}
        className={"form-control" + (toUpdate ? " u-to-update" : "")}
        value={name}
        onChange={(e) => {
          let name = e.target.value
          this.updateForm((f) => f.setRoleName(name))
          this.queueSaveProposalPart()
        }} />
    </div>
  }

  renderPurposeField() {
    let role = this.partRole
    let purpose = this.getFormField("rolePurpose")
    let origPurpose = this.state.origForm.get("rolePurpose")
    let toUpdate = (purpose != origPurpose)
    return <div className="form-group">
      <label htmlFor={"role_"+role.id+"_purpose"}>Purpose</label>
      <input type="text"
        id={"role_"+role.id+"_purpose"}
        className={"form-control" + (toUpdate ? " u-to-update" : "")}
        value={purpose}
        onChange={(e) => {
          let purpose = e.target.value
          this.updateForm((f) => f.setRolePurpose(purpose))
          this.queueSaveProposalPart()
        }} />
      <p>The latest purpose is: {purpose}</p>
    </div>
  }

  renderDomainsSection() {
    let domains = this.getFormField("domains")
    let focusOn = (this.state.focusOn == "last_domain"
      ? domains[domains.length-1].uuid
      : null)
    return <div className="form-group">
      <hr />
      <h5>Domains</h5>
      {domains.map((domain) => {
        return <div key={domain.uuid} className="form-group u-relative">
          <input type="text"
            className={"form-control" + (domain.toCreate ? " u-to-create" : "") + (domain.toUpdate ? " u-to-update" : "") + (domain.toDelete ? " u-to-delete" : "")}
            value={domain.name}
            ref={(input) => {
              if (input && focusOn == domain.uuid) {
                input.focus()
                this.setState({focusOn: null})
              }
            }}
            onChange={(e) => {
              let value = e.target.value
              this.updateForm((f) => f.updateDomain(domain.uuid, value))
              this.queueSaveProposalPart()
            }} />
          <div className="u-abs-top-right">
            <a href="#" className={domain.toDelete ? "" : "text-danger"}
              onClick={(e) => {
                e.preventDefault()
                this.updateForm((f) => f.deleteDomain(domain.uuid))
                this.queueSaveProposalPart()
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
          this.updateForm((f) => f.createDomain())
          this.setState({focusOn: "last_domain"})
          this.queueSaveProposalPart()
        }} />
    </div>
  }

  renderAcctsSection() {
    let accts = this.getFormField("accts")
    let focusOn = (this.state.focusOn == "last_acct"
      ? accts[accts.length-1].uuid
      : null)
    return <div className="form-group">
      <hr />
      <h5>Accountabilities</h5>
      {accts.map((acct) => {
        return <div key={acct.uuid} className="form-group u-relative">
          <input type="text"
            className={"form-control" + (acct.toCreate ? " u-to-create" : "") + (acct.toUpdate ? " u-to-update" : "") + (acct.toDelete ? " u-to-delete" : "")}
            value={acct.name}
            ref={(input) => {
              if (input && focusOn == acct.uuid) {
                input.focus()
                this.setState({focusOn: null})
              }
            }}
            onChange={(e) => {
              let value = e.target.value
              this.updateForm((f) => f.updateAcct(acct.uuid, value))
              this.queueSaveProposalPart()
            }} />
          <div className="u-abs-top-right">
            <a href="#" className={acct.toDelete ? "" : "text-danger"}
              onClick={(e) => {
                e.preventDefault()
                this.updateForm((f) => f.deleteAcct(acct.uuid))
                this.queueSaveProposalPart()
              }}>
              <i className="icon">{acct.toDelete ? "delete_forever" : "delete"}</i>
            </a>
          </div>
        </div>
      })}

      <input type="text"
        className="form-control"
        placeholder="Add a acct..."
        defaultValue=""
        onClick={(e) => {
          this.updateForm((f) => f.createAcct())
          this.setState({focusOn: "last_acct"})
          this.queueSaveProposalPart()
        }} />
    </div>
  }

  renderExpandOrCollapseRoleSection() {
    if (this.partRole.isCircle) {
      return <div>
        <label>
          <input type="checkbox" value="1"
            checked={this.getFormField("collapseRole")}
            onChange={(e) => {
              let isChecked = e.target.checked
              this.updateForm((f) => f.setCollapseRole(isChecked))
              this.queueSaveProposalPart()
            }} />
          &nbsp; Collapse this circle
        </label>
      </div>
    } else {
      return <div>
        <label>
          <input type="checkbox" value="1"
            checked={this.getFormField("expandRole")}
            onChange={(e) => {
              let isChecked = e.target.checked
              this.updateForm((f) => f.setExpandRole(isChecked))
              this.queueSaveProposalPart()
            }} />
          &nbsp; Expand this role into a circle
        </label>
      </div>
    }
  }

  renderDeleteRoleSection() {
    return <div>
      <label>
        <input type="checkbox" value="1"
          checked={this.getFormField("deleteRole")}
          onChange={(e) => {
            let isChecked = e.target.checked
            this.updateForm((f) => f.setDeleteRole(isChecked))
            this.queueSaveProposalPart()
          }} />
        &nbsp; <span className="text-danger">Delete this role</span>
      </label>
    </div>
  }

  // TODO: Some of these props feel redundant. Maybe this is the wrong boundary?
  renderMoveRolesSection() {
    return <MoveRolesSection
      proposalCircle={this.props.proposal.circle}
      partRole={this.partRole}
      allKnownRoles={this.allKnownRoles}
      updateForm={this.updateForm.bind(this)}
      getFormField={this.getFormField.bind(this)}
      queueSaveProposalPart={this.queueSaveProposalPart}
    />
  }

  lookupPartRole(props) {
    let roleId = props.part.targetId || raise("targetId is required, but is blank!")
    return props.proposal.circle.children.find((r) => r.id == roleId) ||
      raise("Can't find child role by id: "+roleId)
  }

  //
  // Helpers for accessing & managing the in-state currentForm
  //

  getFormField(field) {
    return this.state.currentForm.get(field)
  }

  updateForm(formUpdaterFunc) {
    this.setState((state) => {
      formUpdaterFunc(state.currentForm)
      return state
    })
  }
}

UpdateRolePart.propTypes = {
  proposal: PropTypes.object.isRequired,
  part: PropTypes.object.isRequired,
  runUpdatePartMutation: PropTypes.func.isRequired
}

export default UpdateRolePart
