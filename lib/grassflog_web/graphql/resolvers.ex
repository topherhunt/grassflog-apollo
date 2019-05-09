defmodule GrassflogWeb.Graphql.Resolvers do
  alias Grassflog.Orgs

  def list_users(_parent, _args, _resolution) do
    {:ok, Orgs.get_users()}
  end

  def get_user(%Orgs.Proposal{} = parent, _args, _resolution) do
    {:ok, Orgs.get_user(parent.proposer_id)}
  end

  def get_role(%Orgs.Proposal{} = parent, _args, _resolution) do
    {:ok, Orgs.get_role(parent.circle_id)}
  end

  # Resolving a non-root field:
  # https://hexdocs.pm/absinthe/query-arguments.html#arguments-and-non-root-fields
  # def list_proposals(%Orgs.User{} = proposer, _args, _resolution) do
  #   {:ok, Orgs.Proposal.all(proposer: proposer)}
  # end

  def get_proposal(_parent, %{id: id}, _resolution) do
    case Orgs.Proposal.get(id) do
      # I could just return {:ok, nil} if absent, that's a design decision
      nil -> {:error, "Proposal #{id} not found"}
      proposal -> {:ok, proposal}
    end
  end

  def update_proposal(_parent, params, resolution) do
    # Resolution context: see https://hexdocs.pm/absinthe/mutations.html#authorization
    current_user = resolution.context.current_user
    proposal = Orgs.Proposal.get!(params.id, proposer: current_user)
    proposal = Orgs.Proposal.update!(proposal, %{tension: params.tension})
    {:ok, proposal}
  end
end
