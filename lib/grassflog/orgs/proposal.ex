defmodule Grassflog.Orgs.Proposal do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Grassflog.Orgs

  schema "proposals" do
    # Proposals need org_id because circle_id can't guarantee eternal history.
    belongs_to :org, Orgs.Org
    belongs_to :circle, Orgs.Role
    belongs_to :proposer, Orgs.User
    field :tension, :string
    field :enacted_at, :naive_datetime
    timestamps()

    has_many :proposal_changes, Orgs.ProposalChange
  end

  # TODO: Find a way to separate the "defining" fields vs the "mutable" fields.
  # Maybe create_changeset vs. update_changeset?
  def changeset(org, attrs) do
    org
    |> cast(attrs, [:org_id, :circle_id, :proposer_id, :tension, :enacted_at])
    |> validate_required([:org_id, :circle_id, :proposer_id, :tension])
  end
end
