defmodule Grassflog.Orgs.Role do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Grassflog.Orgs

  schema "roles" do
    belongs_to :org, Orgs.Org
    belongs_to :circle, Orgs.Role
    field :name, :string
    field :is_circle, :boolean
    timestamps()

    has_many :children, Orgs.Role, foreign_key: :circle_id
    has_many :accountabilities, Orgs.Accountability
    has_many :domains, Orgs.Domain
    has_many :proposals, Orgs.Proposal, foreign_key: :circle_id
  end

  # TODO: Split into user-facing vs. admin-facing changeset
  def changeset(org, attrs) do
    org
    |> cast(attrs, [:org_id, :circle_id, :name, :is_circle])
    |> validate_required([:org_id, :name])
  end
end
