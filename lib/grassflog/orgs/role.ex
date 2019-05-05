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
  def changeset(role, attrs) do
    role
    |> cast(attrs, [:circle_id, :name, :is_circle])
    |> validate_required([:org_id, :name])
    # TODO: Validate that there can only be one anchor circle per org?
  end

  #
  # Filters
  #

  def filter(starting_query, filters) do
    Enum.reduce(filters, starting_query, fn {k, v}, query -> filter(query, k, v) end)
  end
end
