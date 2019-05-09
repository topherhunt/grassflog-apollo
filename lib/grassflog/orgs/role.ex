defmodule Grassflog.Orgs.Role do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Grassflog.Orgs

  schema "roles" do
    belongs_to :org, Orgs.Org
    # TODO: I think this should be renamed to parent to minimize confusion
    belongs_to :parent, Orgs.Role
    field :name, :string
    field :purpose, :string
    field :is_circle, :boolean
    field :is_anchor, :boolean, virtual: true
    timestamps()

    has_many :children, Orgs.Role, foreign_key: :parent_id
    has_many :accountabilities, Orgs.Accountability
    has_many :domains, Orgs.Domain
    has_many :proposals, Orgs.Proposal, foreign_key: :circle_id
  end

  # TODO: Split into user-facing vs. admin-facing changeset
  def changeset(role, attrs) do
    role
    |> cast(attrs, [:parent_id, :name, :purpose, :is_circle, :is_anchor])
    |> validate_required([:org_id, :name])
    |> require_parent_id_unless_anchor()
    # TODO: Validate that there can only be one anchor circle per org?
  end

  defp require_parent_id_unless_anchor(changeset) do
    if get_field(changeset, :parent_id) || get_field(changeset, :is_anchor) do
      changeset
    else
      add_error(changeset, :parent_id, "is required (except for anchor circle)")
    end
  end

  #
  # Filters
  #

  def filter(starting_query, filters) do
    Enum.reduce(filters, starting_query, fn {k, v}, query -> filter(query, k, v) end)
  end

  def filter(query, :id, id), do: where(query, [r], r.id == ^id)
  def filter(query, :org, org), do: where(query, [r], r.org_id == ^org.id)
  def filter(query, :parent, parent), do: where(query, [r], r.parent_id == ^parent.id)
  def filter(query, :preload, preloads), do: preload(query, ^preloads)
  def filter(query, :order, :id), do: order_by(query, [r], asc: r.id)
end
