import _ from "underscore"

const raise = (message) => { console.error(message); abort() }
const randomUuid = () => Math.random().toString(36).substring(7)
const clone = (object) => JSON.parse(JSON.stringify(object))

// A manager object for the list of changes.
class ChangeList {
  constructor() { this.changes = [] }

  // I can add some valiations here when I want to make the system sturdier.
  add(obj) { this.changes = this.changes.concat(obj) }
}

// A manager object for the state of this ProposalPart's form / UI.
// formObject.data should closely mirror the structure/shape of the UI,
// which ensures the React listeners are simple & easy to reason about.
// The complexity then will be in translating between this formObject (which mirrors the
// shape of the UI) and the changeList (which mirrors what's stored in the db / executed).
class FormObject {
  constructor() {
    // The initial data aren't set here, because we need to support manually cloning forms.
  }

  // Set up this formObject to represent the initial state of this proposal part
  // (prior to reflecting any changes contained in the part)
  setInitialData(partType, partTarget) {
    if (partType == "create_role") {
      this.data = {
        type: "create_role",
        targetId: null,
        roleName: "New role",
        rolePurpose: "",
        expandRole: false,
        collapseRole: false,
        deleteRole: false,
        roleMoves: [],
        domains: [],
        accts:   []
      }
    } else if (partType == "update_role") {
      const role = partTarget
      this.data = {
        type: "update_role",
        targetId: role.id,
        roleName: role.name || "",
        rolePurpose: role.purpose || "",
        expandRole: false,
        collapseRole: false,
        deleteRole: false,
        roleMoves: [],
        domains: role.domains.map((d) => this.dataForDomain(d.id, d.name)),
        accts:   role.accts.map((a)   => this.dataForAcct(a.id,a.name))
      }
    } else {
      raise("Unknown partType: "+partType)
    }
  }

  // Here's a sample update_role formObject with various updates applied to it.
  // Some of the form's contents look like change instructions but others look more like
  // representations of the desired db state.
  // Each subrecord (domain and uuid) has a uuid so it's easy to fetch the right item
  // from the formObject corresponding to a dom event.
  //
  // sampleUpdatedFormObject: {
  //   type: "update_role",
  //   targetId: 27,
  //   roleName: "blah",
  //   rolePurpose: "blah",
  //   expandRole: true,
  //   collapseRole: false,
  //   deleteRole: false,
  //   roleMoves: [
  //     {uuid: "94vj", targetId: 3, parentId: 5},
  //     {uuid: "5ve7", targetId: 43, parentId: 23}
  //   ],
  //   domains: [
  //     {uuid: "e83n", targetId: 1, name: "a domain"},
  //     {uuid: "e930", targetId: 4, name: "blah deleted", toDelete: true},
  //     {uuid: "49ut", targetId: 2, name: "blah updated", toUpdate: true},
  //     {uuid: "6h7u", targetId: null, name: "a new domain", toCreate: true},
  //   ],
  //   accts: [
  //     {uuid: "30k8", targetId: 1, name: "an acct"},
  //     {uuid: "2vj9", targetId: 2, name: "blah updated", toUpdate: true},
  //     {uuid: "eh40", targetId: 4, name: "blah deleted", toDelete: true},
  //     {uuid: "39k8", targetId: null, name: "a new acct", toCreate: true},
  //   ]
  // }

  clone() {
    let newForm = new FormObject
    newForm.data = clone(this.data)
    return newForm
  }

  dataForRoleMove(targetId, parentId) {
    return {targetId: targetId, uuid: randomUuid(), parentId: parentId}
  }

  dataForDomain(targetId, name) {
    return {targetId: targetId, uuid: randomUuid(), name: name}
  }

  dataForAcct(targetId, name) {
    return {targetId: targetId, uuid: randomUuid(), name: name}
  }

  //
  // Fetchers
  //

  get(field) {
    if (Object.keys(this.data).indexOf(field) >= 0) {
      return this.data[field]
    } else {
      raise("Unknown form field: "+field)
    }
  }

  getDomainById(id) { return this.data.domains.find((d) => d.targetId == id) }

  getAcctById(id) { return this.data.accts.find((d) => d.targetId == id) }

  //
  // Mutators
  //

  setRoleName(val) { this.data.roleName = val }

  setRolePurpose(val) { this.data.rolePurpose = val }

  setExpandRole(val) { this.data.expandRole = val }

  setCollapseRole(val) { this.data.collapseRole = val }

  setDeleteRole(val) { this.data.deleteRole = val }

  createRoleMove(id, parentId) {
    let move = this.dataForRoleMove(id, parentId)
    this.data.roleMoves = this.data.roleMoves.concat(move)
  }

  // Note: when the user clicks to delete a domain, the domain is retained in the form
  // state and simply marked as to-delete. But when the user deletes a roleMove, it
  // removes that record/change from this ProposalPart entirely.
  deleteRoleMove(uuid) {
    this.data.roleMoves = this.data.roleMoves.filter((m) => m.uuid != uuid)
  }

  createDomain() {
    let domain = this.dataForDomain(null, "")
    domain.toCreate = true
    this.data.domains = this.data.domains.concat(domain)
    return domain
  }

  updateDomain(uuid, name) {
    let domain = this.data.domains.find((d) => d.uuid == uuid)
    domain.name = name
    domain.toUpdate = true
  }

  deleteDomain(uuid) {
    let domain = this.data.domains.find((d) => d.uuid == uuid)
    domain.toDelete = !domain.toDelete
  }

  createAcct() {
    let acct = this.dataForAcct(null, "")
    acct.toCreate = true
    this.data.accts = this.data.accts.concat(acct)
    return acct
  }

  updateAcct(uuid, name) {
    let acct = this.data.accts.find((d) => d.uuid == uuid)
    acct.name = name
    acct.toUpdate = true
  }

  deleteAcct(uuid) {
    let acct = this.data.accts.find((d) => d.uuid == uuid)
    acct.toDelete = !acct.toDelete
  }
}

// TODO: Review this code. How much of it assumes the ProposalPart is of type update_role?
// How much can be applied to any ProposalPart type?
// TODO: Find a better name for this
const ConversionLogic = {
  // Given a starting Form object and a list of changes, execute each change and return
  // the resulting form object.
  applyChanges: function(origForm, changes) {
    let context = this
    let form = origForm.clone() // make sure we don't mutate origForm itself
    // TODO: Since applyChange mutates the form object in-place, I don't think we ned to reduce.
    // return _.reduce(changes, (f, chg) => context.applyChange(f, chg), form)
    changes.map((change) => context.applyChange(form, change))
    return form
  },

  // Execute a single change and return the transformed Form object.
  // This is basically a reducer.
  applyChange: function(form, change) {
    // console.log("Simulating change: ", change)
    const type = change.type
    // Graphql provides the params field as a string; we need to manually decode it.
    const params = JSON.parse(change.params)

    if (type == "create_role") {
      form.setRoleName(params.name)
      if (params.purpose) { form.setRolePurpose(params.purpose) }
    }
    else if (type == "update_role") {
      if (params.name) { form.setRoleName(params.name) }
      if (params.purpose) { form.setRolePurpose(params.purpose) }
    }
    else if (type == "expand_role") {
      form.setExpandRole(true)
    }
    else if (type == "collapse_role") {
      form.setCollapseRole(true)
    }
    else if (type == "delete_role") {
      form.setDeleteRole(true)
    }
    else if (type == "move_role") {
      form.createRoleMove(change.targetId, params.parent_id)
    }
    else if (type == "create_domain") {
      let domain = form.createDomain()
      form.updateDomain(domain.uuid, params.name)
    }
    else if (type == "update_domain") {
      let domain = form.getDomainById(change.targetId)
      form.updateDomain(domain.uuid, params.name)
    }
    else if (type == "delete_domain") {
      let domain = form.getDomainById(change.targetId)
      form.deleteDomain(domain.uuid)
    }
    else if (type == "create_acct") {
      let acct = form.createAcct()
      form.updateAcct(acct.uuid, params.name)
    }
    else if (type == "update_acct") {
      let acct = form.getAcctById(change.targetId)
      form.updateAcct(acct.uuid, params.name)
    }
    else if (type == "delete_acct") {
      let acct = form.getAcctById(change.targetId)
      form.deleteAcct(acct.uuid)
    }
    else {
      raise("Unknown ProposalChange type: "+type)
    }

    return form
  },

  // Given two form states (the original and the updated), compute what changes are needed
  // to transform form1 into form2. Return the list of changes.
  computeChanges: function(form1, form2) {
    let changeList = new ChangeList
    let roleId = form2.get("targetId")

    // Is the role updated?
    let roleName1    = form1.get("roleName")
    let roleName2    = form2.get("roleName")
    let rolePurpose1 = form1.get("rolePurpose")
    let rolePurpose2 = form2.get("rolePurpose")
    if (roleName1 != roleName2 || rolePurpose1 != rolePurpose2) {
      let type = form2.get("type") // create_role or update_role
      let params = {}
      if (roleName1 != roleName2) { params.name = roleName2 }
      if (rolePurpose1 != rolePurpose2) { params.purpose = rolePurpose2 }
      changeList.add({type: type, targetId: roleId, params: params})
    }

    // Is the role being expanded?
    if (form2.get("expandRole")) {
      changeList.add({type: "expand_role", targetId: roleId})
    }

    // Is the role being collapsed?
    if (form2.get("collapseRole")) {
      changeList.add({type: "collapse_role", targetId: roleId})
    }

    // Is the role being deleted?
    if (form2.get("deleteRole")) {
      changeList.add({type: "delete_role", targetId: roleId})
    }

    // Are roles being moved in or out?
    form2.get("roleMoves").map(function(move) {
      changeList.add({
        type: "move_role",
        targetId: move.targetId,
        params: {parentId: move.parentId}
      })
    })

    // Are new domains added?
    form2.get("domains").filter((i) => !!i.toCreate).map(function(domain) {
      if (domain.toDelete) { return } // Skip create if also deleted
      changeList.add({
        type: "create_domain",
        params: {roleId: roleId, name: domain.name}
      })
    })

    // Are existing domains updated?
    form2.get("domains").filter((i) => !!i.toUpdate).map(function(domain) {
      if (domain.toCreate) { return } // Skip update if newly created
      changeList.add({
        type: "update_domain",
        targetId: domain.targetId,
        params: {name: domain.name}
      })
    })

    // Are domains deleted?
    form2.get("domains").filter((i) => !!i.toDelete).map(function(domain) {
      if (domain.toCreate) { return } // Skip delete if newly created
      changeList.add({type: "delete_domain", targetId: domain.targetId})
    })

    // Are new accts added?
    form2.get("accts").filter((i) => !!i.toCreate).map(function(acct) {
      if (acct.toDelete) { return } // Skip create if also deleted
      changeList.add({
        type: "create_acct",
        params: {roleId: roleId, name: acct.name}
      })
    })

    // Are existing accts updated?
    form2.get("accts").filter((i) => !!i.toUpdate).map(function(acct) {
      if (acct.toCreate) { return } // Skip update if newly created
      changeList.add({
        type: "update_acct",
        targetId: acct.targetId,
        params: {name: acct.name}
      })
    })

    // Are accts deleted?
    form2.get("accts").filter((i) => !!i.toDelete).map(function(acct) {
      if (acct.toCreate) { return } // Skip delete if newly created
      changeList.add({type: "delete_acct", targetId: acct.targetId})
    })

    console.log("TODO: Run changes on form1 & confirm that we end up same as form2.")

    return changeList
  }
}

export {ChangeList, FormObject, ConversionLogic}
