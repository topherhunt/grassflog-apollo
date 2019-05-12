import React from "react"
import PropTypes from "prop-types"
import {Mutation} from "react-apollo"
import _ from "underscore"
import {updatePartMutation} from "../../../apollo/queries"
import {FormObject, ConversionLogic} from "./proposal_change_helpers"

const raise = (message) => { console.error(message); abort() }
const randomUuid = () => Math.random().toString(36).substring(7)

// TODO: Once I've implemented UpdateRolePart, I should extract the common logic into a PartContentWrapper to house the global mutation stuff.

class UpdateRolePart extends React.Component {
  constructor(props) {
    super(props)

    // Look up the role that's the scope for this Part
    const roleId = props.part.targetId || raise("targetId is required, but is blank!")
    this.role = props.proposal.circle.children.find((r) => r.id == roleId) ||
      raise("Can't find child role by id: "+roleId)

    // We track the state of this proposal builder section by using two form objects:
    // one to represent the "pristine" state of this ProposalPart and one to represent
    // the latest state given all of the user's proposed changes (within this part).
    // TODO: What do we use origForm for again? Is it used anywhere in the renderer, or
    // will we only need it when diffing to compute changes?
    let origForm = new FormObject
    origForm.setInitialData("update_role", this.role)
    let currentForm = ConversionLogic.applyChanges(origForm, props.part.changes)
    this.state = {origForm, currentForm}

    // Any of the event handlers below can trigger a debounced mutation by calling this.
    this.queueSaveProposalPart = _.debounce((runMutation) => {
      console.log("Running updatePartMutation.")
      const {origForm, currentForm} = this.state
      const changeList = ConversionLogic.computeChanges(origForm, currentForm)
      const changes_json = JSON.stringify(changeList.changes)
      console.log("changes_json is: ", changes_json)
      runMutation({variables: {id: this.props.part.id, changes_json: changes_json}})
      // this.setState({updatePending: false})
    }, 500).bind(this)
  }

  render() {
    console.log("currentForm is: ", this.state.currentForm)
    const part = this.props.part
    return <Mutation mutation={updatePartMutation}>
      {(runMutation, {called, loading, data}) => (
        <div>
          <h4>Update role: {this.role.name}</h4>
          <div className="small text-muted">
            Part ID: {part.id},
            type: {part.type},
            targetId: {part.targetId}
          </div>

          {this.renderNameField({runMutation})}
          {this.renderPurposeField({runMutation})}
          {this.renderDomainsSection({runMutation})}
        </div>
      )}
    </Mutation>
  }

  renderNameField({runMutation}) {
    let role = this.role
    return <div className="form-group">
      <label htmlFor={"role_"+role.id+"_name"}>Name</label>
      <input type="text"
        id={"role_"+role.id+"_name"}
        className="form-control"
        value={this.getFormField("roleName")}
        onChange={(e) => {
          let name = e.target.value
          this.updateForm((f) => f.setRoleName(name))
          this.queueSaveProposalPart(runMutation)
        }} />
    </div>
  }

  renderPurposeField({runMutation}) {
    let role = this.role
    return <div className="form-group">
      <label htmlFor={"role_"+role.id+"_purpose"}>Purpose</label>
      <input type="text"
        id={"role_"+role.id+"_purpose"}
        className="form-control"
        value={this.getFormField("rolePurpose")}
        onChange={(e) => {
          let purpose = e.target.value
          this.updateForm((f) => f.setRolePurpose(purpose))
          this.queueSaveProposalPart(runMutation)
        }} />
      <p>The latest purpose is: {this.getFormField("rolePurpose")}</p>
    </div>
  }

  renderDomainsSection({runMutation}) {
    let domains = this.getFormField("domains")
    let focusOn = (this.state.focusOn == "last_domain"
      ? domains[domains.length-1].uuid
      : null)
    return <div className="form-group">
      <h4>Domains</h4>
      {domains.map((domain) => {
        return <div key={domain.uuid} className="form-group u-relative">
          <input type="text"
            className={"form-control " + (domain.toDelete ? "u-input-delete" : "")}
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
              this.queueSaveProposalPart(runMutation)
            }} />
          <div className="u-abs-top-right">
            <a href="#" className={domain.toDelete ? "" : "text-danger"}
              onClick={(e) => {
                e.preventDefault()
                this.updateForm((f) => f.deleteDomain(domain.uuid))
                this.queueSaveProposalPart(runMutation)
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
          this.queueSaveProposalPart(runMutation)
        }} />
    </div>
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
  part: PropTypes.object.isRequired
}

export default UpdateRolePart
