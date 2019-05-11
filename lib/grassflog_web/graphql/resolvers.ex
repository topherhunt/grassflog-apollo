defmodule GrassflogWeb.Graphql.Resolvers do
  alias Grassflog.Orgs

  #
  # Users
  #

  def get_user(%Orgs.Proposal{} = parent, _args, _resolution) do
    {:ok, Orgs.get_user(parent.proposer_id)}
  end

  def list_users(_parent, _args, _resolution) do
    {:ok, Orgs.get_users()}
  end

  #
  # Roles
  #

  def get_role(%Orgs.Proposal{} = parent, _args, _resolution) do
    {:ok, Orgs.get_role(parent.circle_id)}
  end

  def list_roles(%Orgs.Role{} = parent, _args, _resolution) do
    {:ok, Orgs.get_roles(parent: parent)}
  end

  #
  # Domains
  #

  def list_domains(%Orgs.Role{} = parent, _args, _resolution) do
    {:ok, Orgs.get_domains(role: parent)}
  end

  #
  # Accountabilities
  #

  def list_accts(%Orgs.Role{} = parent, _args, _resolution) do
    {:ok, Orgs.get_accts(role: parent)}
  end

  #
  # Proposals
  #

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
    # verify ownership
    proposal = Orgs.Proposal.get!(params.id, proposer: current_user)
    proposal = Orgs.Proposal.update!(proposal, %{tension: params.tension})
    {:ok, proposal}
  end

  #
  # ProposalParts
  #

  def list_proposal_parts(%Orgs.Proposal{} = parent, _args, _resolution) do
    {:ok, Orgs.ProposalPart.all(proposal: parent)}
  end

  def create_proposal_part(_parent, params, resolution) do
    current_user = resolution.context.current_user
    # verify ownership
    Orgs.Proposal.get!(params.proposal_id, proposer: current_user)
    part = Orgs.ProposalPart.insert!(params)
    {:ok, part}
  end

  def update_proposal_part(_parent, params, resolution) do
    current_user = resolution.context.current_user
    part = Orgs.ProposalPart.get!(params.id)
    # verify ownership
    Orgs.Proposal.get!(part.proposal_id, proposer: current_user)

    # Nuke then re-insert the list of changes for this ProposalPart
    # TODO: Pull this out into a helper on the Orgs context?
    Orgs.ProposalChange.delete_all!(part: part)
    # We expect params.changes_json to be a JSON-serialized list of change params for all
    # this Part's changes. Each params is a map shaped like %{"type", "instruction_data"}.
    # TODO: instruction_data will likely be a JSON string. Does this also need parsing?
    list_of_params_for_changes = Jason.decode!(params.changes_json)
    Enum.each(list_of_params_for_changes, fn(change_params) ->
      change_params = Map.merge(change_params, %{"part_id" => part.id})
      Orgs.ProposalChange.insert!(change_params)
    end)

    {:ok, part}
  end

  def delete_proposal_part(_parent, params, resolution) do
    current_user = resolution.context.current_user
    part = Orgs.ProposalPart.get!(params.id)
    # verify ownership
    Orgs.Proposal.get!(part.proposal_id, proposer: current_user)
    Orgs.ProposalPart.delete!(part)
    {:ok, part}
  end

  #
  # ProposalChanges
  #

  def list_proposal_changes(%Orgs.ProposalPart{} = parent, _args, _resolution) do
    {:ok, Orgs.ProposalChange.all(part: parent)}
  end

  # def create_proposal_change(_parent, params, resolution) do
  #   current_user = resolution.context.current_user
  #   part = Orgs.ProposalPart.get!(params.proposal_part_id)
  #   # verify ownership
  #   Orgs.Proposal.get!(part.proposal_id, proposer: current_user)
  #   change = Orgs.ProposalChange.insert!(params)
  #   {:ok, change}
  # end

  # def update_proposal_change(_parent, params, resolution) do
  #   current_user = resolution.context.current_user
  #   change = Orgs.ProposalChange.get!(params.id, preload: :part)
  #   # verify ownership
  #   Orgs.Proposal.get!(change.part.proposal_id, proposer: current_user)
  #   change = Orgs.ProposalChange.update!(params)
  #   {:ok, change}
  # end

  # def delete_proposal_change(_parent, params, resolution) do
  #   current_user = resolution.context.current_user
  #   change = Orgs.ProposalChange.get!(params.id, preload: :part)
  #   # verify ownership
  #   Orgs.Proposal.get!(change.part.proposal_id, proposer: current_user)
  #   Orgs.ProposalChange.delete!(change)
  #   {:ok, change}
  # end
end
