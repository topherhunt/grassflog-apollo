import React from "react"
import PropTypes from "prop-types"
import {Mutation} from "react-apollo"
import {updatePartMutation} from "../../../apollo/queries"
import FormObjectManager from "./form_object_manager"

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
    const origForm = FormObjectManager.newFormObjectForUpdateRolePart(this.role)
    const updatedForm = FormObjectManager.simulateChanges(origForm, props.part.changes)
    this.state = {origForm, updatedForm}
  }

  render() {
    console.log("updatedForm is: ", this.state.updatedForm)
    const part = this.props.part
    return <Mutation mutation={updatePartMutation}>
      {(runMutation, {called, loading, data}) => (
        <div>
          <h4>Update role: {this.role.name}</h4>
          <div className="small text-muted">Part ID: {part.id}, type: {part.type}, targetId: {part.targetId}</div>

          {this.renderNameField({runMutation})}

          {this.renderPurposeField({runMutation})}

          <div className="form-group">
            <h4>Domains</h4>
            {this.state.updatedForm.domains.map((domain) =>
              <div key={domain.uuid} className="form-group u-relative">
                <input type="text"
                  className={"form-control " + (domain.delete ? "u-input-delete" : "")}
                  value={domain.name}
                  ref={(input) => {
                    if (input && this.state.focusOnInput == domain.uuid) {
                      input.focus()
                      this.setState({focusOnInput: null})
                    }
                  }}
                  onChange={(e) => {
                    this.updateDomain(domain.uuid, e.target.value)
                    {/*this.runDebouncedMutation(runMutation)*/}
                  }} />
                <div className="u-abs-top-right">
                  <a href="#" className={domain.delete ? "" : "text-danger"}
                    onClick={(e) => {
                      console.log("Clicked!")
                      e.preventDefault()
                      this.deleteDomain(domain.uuid)
                    }}>
                    <i className="icon">{domain.delete ? "delete_forever" : "delete"}</i>
                  </a>
                </div>
              </div>
            )}
            {/* For each domain in this.latestForm, render a div for it */}

            <input type="text"
              className="form-control"
              placeholder="Add a domain..."
              defaultValue=""
              onClick={(e) => {
                this.createDomain()
              }} />
          </div>

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
        value={this.state.updatedForm.attrs.name}
        onChange={(e) => {
          this.updateRoleName(e.target.value)
          // TODO: Where is the best place to trigger the mutation?
          // I don't need to pass all params, the function has the this-context so it
          // can derive the changelist and the relevant ids as needed.
          // this.runDebouncedMutation(runMutation)
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
        value={this.state.updatedForm.attrs.purpose}
        onChange={(e) => {
          this.updateRolePurpose(e.target.value)
          // TODO: Where is the best place to trigger the mutation?
          // I don't need to pass all params, the function has the this-context so it
          // can derive the changelist and the relevant ids as needed.
          // this.runDebouncedMutation(runMutation)
        }} />
      <p>The latest purpose is: {this.state.updatedForm.attrs.purpose}</p>
    </div>
  }

  updateRoleName(newName) {
    this.setState((state, props) => {
      state.updatedForm.attrs.name = newName
      return state
    })
  }

  updateRolePurpose(newPurpose) {
    this.setState((state, props) => {
      state.updatedForm.attrs.purpose = newPurpose
      return state
    })
  }

  createDomain() {
    this.setState((state, props) => {
      const uuid = randomUuid()
      let newDomain = {id: null, uuid: uuid, name: "", create: true}
      state.updatedForm.domains = state.updatedForm.domains.concat(newDomain)
      state.focusOnInput = uuid
      return state
    })
  }

  updateDomain(uuid, newName) {
    this.setState((state, props) => {
      let domain = state.updatedForm.domains.find((d) => d.uuid == uuid)
      domain.name = newName
      if (!domain.create) { domain.update = true }
      return state
    })
  }

  deleteDomain(uuid) {
    this.setState((state, props) => {
      let domain = state.updatedForm.domains.find((d) => d.uuid == uuid)
      domain.delete = !domain.delete
      if (domain.create) {
        raise("TODO: If a created domain is deleted, remove it from the updatedForm")
      }
      return state
    })
  }
}

UpdateRolePart.propTypes = {
  proposal: PropTypes.object.isRequired,
  part: PropTypes.object.isRequired
}

export default UpdateRolePart
