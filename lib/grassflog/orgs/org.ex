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

    has_many :org_user_joins, Org.OrgUserJoin
    has_many :members, through: [:org_user_joins, :user]
    has_many :roles, Org.Role
    has_many :proposals, Org.Proposal
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

  # def filter(starting_query, filters) do
  #   Enum.reduce(filters, starting_query, fn {k, v}, query -> filter(query, k, v) end)
  # end
  #
  # def filter(query, :id, id), do: where(query, [u], u.id == ^id)
  # def filter(query, :email, email), do: where(query, [u], u.email == ^email)
  # def filter(query, :auth0_uid, uid), do: where(query, [u], u.auth0_uid == ^uid)
  # def filter(query, :order, :name), do: order_by(query, [u], asc: u.name)

end
