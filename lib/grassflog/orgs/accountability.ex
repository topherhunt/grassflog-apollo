defmodule Grassflog.Orgs.Accountability do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Grassflog.Orgs

  schema "accountabilities" do
    belongs_to :role, Orgs.Role
    field :name, :string
    timestamps()
  end

  def changeset(acct, attrs) do
    acct
    |> cast(attrs, [:role_id, :name])
    |> validate_required([:role_id, :name])
  end

  #
  # Filters
  #

  def filter(starting_query, filters) do
    Enum.reduce(filters, starting_query, fn {k, v}, query -> filter(query, k, v) end)
  end

  def filter(query, :id, id), do: where(query, [a], a.id == ^id)
  def filter(query, :role, role), do: where(query, [a], a.role_id == ^role.id)
  def filter(query, :role_ids, role_ids), do: where(query, [a], a.role_id in ^role_ids)
  def filter(query, :order, :id), do: order_by(query, [a], asc: a.id)
end
