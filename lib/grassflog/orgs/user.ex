defmodule Grassflog.Orgs.User do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Grassflog.Orgs

  schema "users" do
    field :name, :string
    field :email, :string
    field :auth0_uid, :string
    field :last_signed_in_at, :naive_datetime
    timestamps()

    has_many :org_user_joins, Orgs.OrgUserJoin
    has_many :orgs, through: [:org_user_joins, :org]
    has_many :proposals, Orgs.Proposal, foreign_key: :proposer_id
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email, :auth0_uid, :last_signed_in_at])
    |> validate_required([:name, :email])
    |> unique_constraint(:email)
    |> unique_constraint(:auth0_uid)
  end

  #
  # Filters
  #

  def filter(starting_query, filters) do
    Enum.reduce(filters, starting_query, fn {k, v}, query -> filter(query, k, v) end)
  end

  def filter(query, :id, id), do: where(query, [u], u.id == ^id)
  def filter(query, :email, email), do: where(query, [u], u.email == ^email)
  def filter(query, :auth0_uid, uid), do: where(query, [u], u.auth0_uid == ^uid)
  def filter(query, :order, :name), do: order_by(query, [u], asc: u.name)

end
