import React from "react"
import PropTypes from "prop-types"
import Select from "react-select"
import {Mutation} from "react-apollo"
import _ from "underscore"
import {updatePartMutation} from "../../../apollo/queries"
import {FormObject, ConversionLogic} from "./proposal_change_helpers"
import EditRoleNameSection from "./sections/edit_role_name_section.jsx"
import EditRolePurposeSection from "./sections/edit_role_purpose_section.jsx"
import EditRoleDomainsSection from "./sections/edit_role_domains_section.jsx"
import EditRoleAcctsSection from "./sections/edit_role_accts_section.jsx"
import ExpandOrCollapseRoleSection from "./sections/expand_or_collapse_role_section.jsx"
import DeleteRoleSection from "./sections/delete_role_section.jsx"
import MoveRolesSection from "./sections/move_roles_section.jsx"

const raise = (message) => { console.error(message); abort() }
const randomUuid = () => Math.random().toString(36).substring(7)

class UpdateRolePart extends React.Component {
  constructor(props) {
    super(props)

    // The target role of this ProposalPart (ie. the main role being changed)
    this.partRole = this.lookupPartRole(props)

    // We track the state of this proposal builder section by using two form objects:
    // one to represent the "pristine" state of this ProposalPart and one to represent
    // the latest state given all of the user's proposed changes (within this part).
    // TODO: Consider making origForm simply a property on the Form, so I can ask the form
    // to compare values internally and I don't have to juggle two different form objects.
    let origForm = new FormObject
    origForm.setInitialData("update_role", this.partRole)
    let currentForm = ConversionLogic.applyChanges(origForm, props.part.changes)
    this.state = {origForm, currentForm}

    // Any of the event handlers below can trigger a debounced mutation by calling this.
    this.queueSaveProposalPart = _.debounce(this.saveProposalPart, 500).bind(this)
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

      <EditRoleNameSection
        roleId={this.partRole.id}
        currentName={this.getFormField("roleName")}
        origName={this.state.origForm.get("roleName")}
        updateForm={this.updateForm.bind(this)}
        queueSaveProposalPart={this.queueSaveProposalPart}
      />

      <EditRolePurposeSection
        roleId={this.partRole.id}
        currentPurpose={this.getFormField("rolePurpose")}
        origPurpose={this.state.origForm.get("rolePurpose")}
        updateForm={this.updateForm.bind(this)}
        queueSaveProposalPart={this.queueSaveProposalPart}
      />

      <EditRoleDomainsSection
        domains={this.getFormField("domains")}
        updateForm={this.updateForm.bind(this)}
        queueSaveProposalPart={this.queueSaveProposalPart}
      />

      <EditRoleAcctsSection
        accts={this.getFormField("accts")}
        updateForm={this.updateForm.bind(this)}
        queueSaveProposalPart={this.queueSaveProposalPart}
      />

      <hr />

      <ExpandOrCollapseRoleSection
        isCircle={this.partRole.isCircle}
        getFormField={this.getFormField.bind(this)}
        updateForm={this.updateForm.bind(this)}
        queueSaveProposalPart={this.queueSaveProposalPart}
      />

      <DeleteRoleSection
        isChecked={this.getFormField("deleteRole")}
        updateForm={this.updateForm.bind(this)}
        queueSaveProposalPart={this.queueSaveProposalPart}
      />

      <MoveRolesSection
        proposalCircle={this.props.proposal.circle}
        partRole={this.partRole}
        getFormField={this.getFormField.bind(this)}
        updateForm={this.updateForm.bind(this)}
        queueSaveProposalPart={this.queueSaveProposalPart}
      />
    </div>
  }

  lookupPartRole(props) {
    let roleId = props.part.targetId || raise("targetId is required, but is blank!")
    return props.proposal.circle.children.find((r) => r.id == roleId) ||
      raise("Can't find child role by id: "+roleId)
  }

  saveProposalPart() {
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
