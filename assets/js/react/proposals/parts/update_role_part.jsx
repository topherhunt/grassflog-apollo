import React from "react"
import PropTypes from "prop-types"
import {Mutation} from "react-apollo"
import _ from "underscore"
import {updatePartMutation} from "../../../apollo/queries"

const clone = (object) => JSON.parse(JSON.stringify(object))

const random_uuid = () => Math.random().toString(36).substring(7)


const ConvertHolarchyToList = {
  run: function(role) {
    return [
      this.cleanRole(role),
      (role.accts || []).map((a) => this.cleanAcct(a)),
      (role.domains || []).map((d) => this.cleanAcct(d)),
      (role.children || []).map((child) => this.run(child))
    ].flat(9)
  },

  cleanRole: function(r) {
    return {
      type: "role",
      id: r.id,
      parent_id: r.parent_id,
      name: r.name,
      purpose: r.purpose
    }
  },

  cleanAcct: function(a) {
    return {
      type: "acct",
      id: a.id,
      role_id: a.role_id,
      name: a.name
    }
  },

  cleanDomain: function(d) {
    return {
      type: "domain",
      id: d.id,
      role_id: d.role_id,
      name: d.name
    }
  },
}

const Simulator = {
  sampleStartingFormObject: {
    type: "update_role",
    targetId: 27,
    attrs: {
      name: "the orig name",
      purpose: "the orig purpose"
    },
    expandRole: false,
    collapseRole: false,
    deleteRole: false,
    moveRoles: [],
    domains: [
      {id: 1, name: "an existing domain"}
    ],
    accts: [
      {id: 1, name: "an existing acct"}
    ]
  },

  // This sample shows the expected form object shape for an UpdateRole proposal part.
  // It should closely mirror the UI and form elements, to make the event listeners as
  // simple as possible.
  // Some of the form's contents look like change instructions but others look more like
  // representations of db records.
  sampleUpdatedFormObject: {
    type: "update_role",
    targetId: 27,
    attrs: {
      name: "blah",
      purpose: "blah"
    },
    expandRole: true,
    collapseRole: false,
    deleteRole: false,
    moveRoles: [{id: 3, parentId: 5}],
    domains: [
      {id: 1, name: "a domain"},
      {id: 2, name: "blah updated", update: true},
      {id: null, name: "a new domain", create: true},
      {id: 4, name: "blah deleted", delete: true},
    ],
    accts: [
      {id: 1, name: "an acct"},
      {id: 2, name: "blah updated", update: true},
      {id: null, name: "a new acct", create: true},
      {id: 4, name: "blah deleted", delete: true},
    ]
  },

  // Given a starting Form object and a list of changes, execute each change and return
  // the resulting form object.
  simulateChanges: function(form, changes) {
    startingForm = clone(currentState) // make sure we don't mutate currentState itself
    return _.reduce(changes, (memo, i) => this.simulateChange(memo, i), startingForm)
  },

  // Execute a single change and return the transformed Form object.
  // This is basically a reducer.
  simulateChange: function(form, change) {
    type = change.type
    if (type == "update_role") {
      if (change.params.name) { form.attrs.name = change.params.name }
      if (change.params.purpose) { form.attrs.purpose = change.params.purpose }
    }
    else if (type == "expand_role") {
      form.expandRole = true
    }
    else if (type == "collapse_role") {
      form.collapseRole = true
    }
    else if (type == "delete_role") {
      form.deleteRole = true
    }
    else if (type == "move_role") {
      if (!form.moveRoles) { form.moveRoles = [] }
      form.moveRoles.concat({id: change.targetId, parentId: change.params.parent_id})
    }
    else if (type == "create_domain") {
      form.domains.concat({
        roleId: change.params.role_id,
        name: change.params.name,
        create: true
      })
    }
    else if (type == "update_domain") {
      domain = form.domains.find((d) d.id == change.targetId)
      domain.name = change.params.name
      domain.update = true
    }
    else if (type == "delete_domain") {
      domain = form.domains.find((d) d.id == change.targetId)
      domain.delete = true
    }
    else if (type == "create_acct") {
      form.accts.concat({
        roleId: change.params.role_id,
        name: change.params.name,
        create: true
      })
    }
    else if (type == "update_acct") {
      acct = form.accts.find((d) d.id == change.targetId)
      acct.name = change.params.name
      acct.update = true
    }
    else if (type == "delete_acct") {
      acct = form.accts.find((d) d.id == change.targetId)
      acct.delete = true
    }
    else {
      raise("Unknown ProposalChange type: "+type)
    }

    return form
  },

  // Given two form states (orig and next), compute what changes are required to transform
  // orig into next. Return the list of changes.
  computeChanges: function(origForm, nextForm) {
    let changes = []
    let roleId = nextForm.targetId

    // Is the role updated?
    if (origForm.name != nextForm.name || origForm.purpose != nextForm.purpose) {
      let params = {}
      if (origForm.name != nextForm.name) { params.name = nextForm.name }
      if (origForm.purpose != nextForm.purpose) { params.purpose = nextForm.purpose }
      changes.concat({type: "update_role", targetId: roleId, params: params})
    }

    // Is the role being expanded?
    if (nextForm.expandRole) {
      changes.concat({type: "expand_role", targetId: roleId})
    }

    // Are roles being moved in or out?
    nextForm.moveRoles.map(function(move) {
      changes.concat({targetId: move.targetId, parentId: move.parentId})
    })

    // Is the role being collapsed?
    if (nextForm.collapseRole) {
      changes.concat({type: "collapse_role", targetId: roleId})
    }

    // Is the role being deleted?
    if (nextForm.deleteRole) {
      changes.concat({type: "delete_role", targetId: roleId})
    }

    // Are new domains added?
    nextForm.domains.filter((i) => !!i.create).map(function(domain) {
      changes.concat({type: "create_domain", params: {roleId: roleId, name: domain.name}})
    })

    // Are existing domains updated?
    nextForm.domains.filter((i) => !!i.update).map(function(domain) {
      changes.concat({type: "update_domain", targetId: domain.id, name: domain.name})
    })

    // Are domains removed?
    nextForm.domains.filter((i) => !!i.delete).map(function(domain) {
      changes.concat({type: "delete_domain", targetId: domain.id})
    })

    // Are new accts added?
    nextForm.accts.filter((i) => !!i.create).map(function(acct) {
      changes.concat({type: "create_acct", params: {roleId: roleId, name: acct.name}})
    })

    // Are existing accts updated?
    nextForm.accts.filter((i) => !!i.update).map(function(acct) {
      changes.concat({type: "update_acct", targetId: acct.id, name: acct.name})
    })

    // Are accts removed?
    nextForm.accts.filter((i) => !!i.delete).map(function(acct) {
      changes.concat({type: "delete_acct", targetId: acct.id})
    })

    console.log("TODO: Run changes on origForm to confirm that we end up identical to nextForm.")

    return changes
  }
}

// TODO: Once I've implemented UpdateRolePart, I should extract the common logic into a PartContentWrapper to house the global mutation stuff.

class UpdateRolePart extends React.Component {
  constructor(props) {
    super(props)

    // Make an in-memory copy of this Part's changes so we can track the user actions
    // without relying on the whims of the Apollo mutation / persistence lifecycle.
    // We'll transform this changeList whenever the user makes changes in this part's UI.
    // When rendering, we reference changes only from this changeList, never directly from
    // the Apollo-cached changes.
    // IMPORTANT: This is a plain property on the component, NOT part of the React State.
    // We don't want to re-render when this changeList is updated. It's purely used to
    // keep track of what changes we'll need to persist.
    // this.changeList = props.part.changes.map((chg) => {
    //   console.log("Parsing change: ", chg)
    //   return {
    //     type: chg.type,
    //     targetId: chg.targetId,
    //     params: JSON.parse(chg.params),
    //     // I only really need locator in case of adding new records.
    //     locator: chg.type+"/"+(chg.targetId || random_uuid())
    //   }
    // })

    // Look up the role that's the scope for this Part
    const contextRoleId = props.part.targetId || raise("targetId is required, but blank!")
    this.contextRole = props.proposal.circle.children.find((r) => r.id == contextRoleId) ||
      raise("Can't find child role by id: "+contextRoleId)
    // TODO: Why is contextRole not set?



    this.currentState = ConvertHolarchyToList.run(props.proposal.circle)
    console.log("Generated currentState: ", this.currentState)

    this.proposedState = Simulator.runChanges(this.currentState, props.part.changes)
  }




  render() {
    const part = this.props.part
    return <Mutation mutation={updatePartMutation}>
      {(runMutation, {called, loading, data}) => (
        <div>
          <h4>Update role: {this.contextRole.name}</h4>
          <div className="small text-muted">Part ID: {part.id}, type: {part.type}, targetId: {part.targetId}</div>

          {this.renderNameField({runMutation})}

          <div className="form-group">
            <label htmlFor={"role_"+this.targetRole.id+"_purpose"}>Purpose</label>
            <input
              id={"role_"+this.targetRole.id+"_purpose"}
              className="form-control"
              type="text"
              value={this.populateRolePurpose()}
              onChange={() => {}} />
          </div>
        </div>
      )}
    </Mutation>
  }

  renderNameField({runMutation}) {
    let role = this.contextRole
    let locator = "update_role/"+role.id
    let change = this.getChangeByLocator(locator)
    let defaultValue = change ? change.params.name : role.name

    return <div className="form-group">
      <label htmlFor={"role_"+role.id+"_name"}>Name</label>
      <input type="text"
        id={"role_"+role.id+"_name"}
        className="form-control"
        value={defaultValue}
        onChange={(e) => {
          // The approach here is:
          // - Locate the in-memory Change object corresponding to this field
          //   (or generate a new one)
          // - Update it (since a Change can be associated w multiple fields)
          // - Upsert it back into the list
          //
          // Needless to say this is messy and smells of wrong mental model.
          //
          // TODO: Do I need to re-lookup the change here? or can I safely use the
          // one defined at the top of this function?
          let change = this.getChangeByLocator(locator) ||
            {type: "update_role", targetId: role.id, params: {}, locator: locator, }
          change.params.name = e.target.value
          this.upsertChangeByLocator(locator, change)
        }} />
    </div>
  }

  getChangeByLocator(locator) {
    return this.changeList.find((chg) => (chg.locator == locator))
  }

  getAllChangesByType(type) {
    return this.changeList.filter((chg) => (chg.type == type))
  }
}

UpdateRolePart.propTypes = {
  proposal: PropTypes.object.isRequired,
  part: PropTypes.object.isRequired
}

const raise = (message) => console.error(message)

export default UpdateRolePart
