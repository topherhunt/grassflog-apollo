import React from "react"

const AddProposalPartSection = ({proposal}) => {
  return <div className="u-card">
    <h3>Change something</h3>
    <p>Just as a reminder, the tension is: <em>{proposal.tension}</em></p>
    <div>
      <a className="btn btn-outline-primary">Change a role</a>
      &nbsp;
      <a className="btn btn-outline-success">Add a role</a>
    </div>
  </div>
}

export default AddProposalPartSection
