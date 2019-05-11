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
  // Given a starting state and a list of changes, execute each change and return the
  // resulting state.
  runChanges: function(currentState, changes) {
    startingState = clone(currentState) // make sure we don't mutate currentState itself
    return _.reduce(changes, (memo, i) => this.simulateChange(memo, i), startingState)
  },

  // Execute a single change and return the transformed state.
  // This is basically a reducer.
  // Each of these functions should look very similar to my UI handlers, or
  // maybe even can be the same as them.
  simulateChange: function(state, change) {
    type = change.type
    if (type == "create_role") {
      TODO
    } else if (type == "blah") {

    } else {
      raise("Unknown type: "+type)
    }
  },

  // Given an old state and a new (or desired) state, compute what changes will bring you
  // from the old state to the new state.
  computeChanges: function(prevState, nextState) {
    let changes = []
    const nextRoles = nextState.filter((i) => (i.type == "role"))
    const nextDomains = nextState.filter((i) => (i.type == "domain"))
    const nextAccts = nextState.filter((i) => (i.type == "acct"))

    // Any newly created roles?
    nextRoles.filter(function(i) {
      prev = this.findRecord(prevState, "role", i.id)
      if (!prev) {
        changes.concat({
          type: "create_role",
          targetId: null,
          params: this.cleanParams(role, ["parent_id:req", "name:req", "purpose:opt"])
        })
      }
    }

    // Any updated roles?
    nextRoles.filter(function(role) {
      prev = this.findRecord(prevState, "role", role.id)
      if (prev && (prev.name != role.name || prev.purpose != role.purpose)) {
        let params = this.cleanParams(role, ["name:opt", "purpose:opt"])
        if (role.name == prev.name) { delete params.name }
        if (role.purpose == prev.purpose) { delete params.purpose }
        changes.concat({
          type: "update_role",
          targetId: role.id,
          params: params
        })
      }
    })

    // Any new domains?


    // ...
    return changes
  },

  findRecord: function(state, type, id) {
    return state.find((i) => (i.type == type && i.id == id))
  },

  //
  cleanParams: function(params, rules) {
    let cleaned = {}
    rules.map(function(rule){
      [field, setting] = rule.split(":")
      if (!["req", "opt"].includes(setting)) { raise("Unknown setting: "+setting) }
      if (setting == "req" && !params[field]) { raise("Required field is blank: "+field) }
      cleaned[field] = params[field]
    })
    return cleaned
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
