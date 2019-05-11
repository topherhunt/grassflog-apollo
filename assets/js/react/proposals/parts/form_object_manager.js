import _ from "underscore"

const randomUuid = () => Math.random().toString(36).substring(7)
const clone = (object) => JSON.parse(JSON.stringify(object))

// TODO: Review this code. How much of it assumes the ProposalPart is of type update_role?
// How much can be applied to any ProposalPart type?
const FormObjectManager = {

  // Instantiate a Form Object representing the initial state of this proposal part.
  newFormObjectForUpdateRolePart: function(role) {
    return {
      type: "update_role",
      targetId: role.id,
      attrs: {
        name: role.name || "",
        purpose: role.purpose || ""
      },
      expandRole: false,
      collapseRole: false,
      deleteRole: false,
      moveRoles: [],
      domains: role.domains.map((d) => this.domain(d.id, d.name)),
      accts:   role.accts.map((a)   => this.acct(a.id,a.name))
    }
  },

  domain: function(id, name) {
    return {id: id, uuid: randomUuid(), name: name}
  },

  acct: function(id, name) {
    return {id: id, uuid: randomUuid(), name: name}
  },

  // This sample shows the expected form object shape for an UpdateRole proposal part.
  // It should closely mirror the UI and form elements, to make the event listeners as
  // simple as possible.
  // Some of the form's contents look like change instructions but others look more like
  // representations of db records.
  // Each subrecord (domain and uuid) has a uuid so it's easy to fetch the right item
  // from the formObject corresponding to a dom event.
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
      {id: 1, uuid: "e83n", name: "a domain"},
      {id: 2, uuid: "e83n", name: "blah updated", update: true},
      {id: null, uuid: "e83n", name: "a new domain", create: true},
      {id: 4, uuid: "e83n", name: "blah deleted", delete: true},
    ],
    accts: [
      {id: 1, uuid: "e83n", name: "an acct"},
      {id: 2, uuid: "e83n", name: "blah updated", update: true},
      {id: null, uuid: "e83n", name: "a new acct", create: true},
      {id: 4, uuid: "e83n", name: "blah deleted", delete: true},
    ]
  },

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
      {id: 1, uuid: "e83n", name: "an existing domain"}
    ],
    accts: [
      {id: 1, uuid: "2no8", name: "an existing acct"}
    ]
  },

  // Given a starting Form object and a list of changes, execute each change and return
  // the resulting form object.
  simulateChanges: function(origForm, changes) {
    let startingForm = clone(origForm) // make sure we don't mutate currentState itself
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
      domain = form.domains.find((d) => d.id == change.targetId)
      domain.name = change.params.name
      domain.update = true
    }
    else if (type == "delete_domain") {
      domain = form.domains.find((d) => d.id == change.targetId)
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
      acct = form.accts.find((d) => d.id == change.targetId)
      acct.name = change.params.name
      acct.update = true
    }
    else if (type == "delete_acct") {
      acct = form.accts.find((d) => d.id == change.targetId)
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

export default FormObjectManager
