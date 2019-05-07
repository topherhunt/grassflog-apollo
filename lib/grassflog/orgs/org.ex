defmodule Grassflog.Orgs.Org do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Grassflog.Orgs

  # TODO: Consider implementing a custom slug using Phoenix.Param

  schema "orgs" do
    field :name, :string
    belongs_to :anchor_circle, Orgs.Role
    timestamps()

    has_many :org_user_joins, Orgs.OrgUserJoin
    has_many :members, through: [:org_user_joins, :user]
    has_many :roles, Orgs.Role
    has_many :proposals, Orgs.Proposal
  end

  def changeset(org, attrs) do
    org
    |> cast(attrs, [:name, :anchor_circle_id])
    # Not requiring anchor_circle_id to avoid circular lock when creating org
    |> validate_required([:name])
  end

  #
  # Filters
  #

  def filter(starting_query, filters) do
    Enum.reduce(filters, starting_query, fn {k, v}, query -> filter(query, k, v) end)
  end

  def filter(query, :id, id), do: where(query, [o], o.id == ^id)
  def filter(query, :order, :newest), do: order_by(query, [u], desc: u.id)
  def filter(query, :preload, :anchor_circle), do: preload(query, :anchor_circle)

  def filter(query, :having_member, user) do
    where(query, [o], fragment("EXISTS (SELECT * FROM org_user_joins WHERE org_id = ? AND user_id = ?)", o.id, ^user.id))
  end
end
