defmodule GrassflogWeb.Graphql.Resolvers do
  alias Grassflog.Orgs

  def get_user(%Orgs.Proposal{} = parent, _args, _resolution) do
    {:ok, Orgs.get_user(parent.proposer_id)}
  end

  def list_users(_parent, _args, _resolution) do
    {:ok, Orgs.get_users()}
  end

  def get_role(%Orgs.Proposal{} = parent, _args, _resolution) do
    {:ok, Orgs.get_role(parent.circle_id)}
  end

  def list_roles(%Orgs.Role{} = parent, _args, _resolution) do
    {:ok, Orgs.get_roles(parent: parent)}
  end

  def get_proposal(_parent, %{id: id}, _resolution) do
    if proposal = Orgs.Proposal.get(id) do
      {:ok, proposal}
    else
      # I could just return {:ok, nil} if absent, that's a design decision
      {:error, "Proposal #{id} not found"}
    end
  end

  def update_proposal(_parent, params, resolution) do
    # Auth context: see https://hexdocs.pm/absinthe/mutations.html#authorization
    current_user = resolution.context.current_user
    proposal = Orgs.Proposal.get!(params.id, proposer: current_user)
    proposal = Orgs.Proposal.update!(proposal, %{tension: params.tension})
    {:ok, proposal}
  end

  def list_proposal_parts(%Orgs.Proposal{} = parent, _args, _resolution) do
    {:ok, Orgs.ProposalPart.all(proposal: parent)}
  end

  def create_proposal_part(_parent, params, resolution) do
    current_user = resolution.context.current_user
    proposal = Orgs.Proposal.get!(params.proposal_id, proposer: current_user)
    proposal_part = Orgs.ProposalPart.insert!(params)
    {:ok, proposal_part}
  end
end
