import React from "react"
import PropTypes from "prop-types"
import {Mutation} from "react-apollo"
import {gql} from "apollo-boost"
import _ from "underscore"

// As long as we request the mutation to return all fields that are being changed,
// Apollo will smartly update the cache, re-rendering any usages of that data.
// If we don't request both `id` and `tension` here, or in certain complex edge cases,
// we may need to tell Apollo how to update the cache to keep it in-sync.
const updateProposalMutation = gql`
  mutation UpdateProposal($id: ID!, $tension: String!) {
    update_proposal(id: $id, tension: $tension) {
      id
      tension
    }
  }
`

class TensionEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}

    this.debounceTheUpdate = _.debounce((runMutation, tension) => {
      console.log("Running updateProposalMutation.")
      runMutation({variables: {id: props.proposal.id, tension: tension}})
      this.setState({updatePending: false})
    }, 200)
  }

  render() {
    return <Mutation mutation={updateProposalMutation}>
      {(runMutation, {called, loading, data}) => {
        // console.log("Mutation rendering with data: ", data)
        return <div className="u-card u-box-shadow form-group u-relative">
          <label htmlFor="proposal_tension">The tension:</label>
          <textarea
            id="proposal_tension"
            className="form-control"
            defaultValue={this.props.proposal.tension}
            placeholder="What's the pain you're feeling? Why bother making this change?"
            onChange={(e) => {
              this.setState({updatePending: true})
              this.debounceTheUpdate(runMutation, e.target.value)
            }}
          ></textarea>
          <div style={{position: "absolute", right: "10px", top: "10px"}}>
            {(this.state.updatePending
              ? <span className="text-warning">saving...</span>
              : <span className="text-success">√</span>)}
          </div>
        </div>
      }}
    </Mutation>
  }
}

TensionEditor.propTypes = {
  proposal: PropTypes.object.isRequired
}

export default TensionEditor
