import React from "react"
import Select from "react-select"

const AddProposalPartSection = ({proposal, simulatedRoles}) => {
  console.log(proposal)
  return <div className="u-card">
    <h3>Change something</h3>
    <p>Just as a reminder, the tension is: <em>{proposal.tension}</em></p>
    <div className="row">
      <div className="col-sm-4">
        <Select placeholder="Change a role..." options={roleOptions(simulatedRoles)} />
      </div>
      <div className="col-sm-4">
        <a href="#" className="btn btn-outline-primary">Add a role</a>
      </div>
    </div>
  </div>
}

const roleOptions = (roles) => {
  return roles.map((r) => {return {label: r.name, value: r.id}})
}

export default AddProposalPartSection
