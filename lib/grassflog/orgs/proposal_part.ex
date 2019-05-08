# A ProposalPart is a step of a proposal which groups 1+ ProposalChanges related to a specific role. Each ProposalPart 1:1 corresponds with a section of the proposal in the UI. Each ProposalPart has a type and a target role id (which is nil if the role is being newly created).
defmodule Grassflog.Orgs.ProposalPart do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Grassflog.Orgs

  schema "proposal_parts" do
    belongs_to :proposal, Orgs.Proposal
    field :type, :string
    field :target_id, :integer
    timestamps()

    has_many :proposal_changes, Orgs.ProposalChange
  end

  @valid_types [~w(create_role update_role)]

  def changeset(proposal_change, attrs) do
    proposal_change
    |> cast(attrs, [:proposal_id, :type, :target_id])
    |> validate_required([:proposal_id, :type])
    |> validate_inclusion(:type, @valid_types)
    # TODO: Validate the target_id and the associated change types based on part type
  end
end
