defmodule Grassflog.Orgs.Domain do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Grassflog.Orgs

  schema "domains" do
    belongs_to :role, Orgs.Role
    field :name, :string
    timestamps()
  end

  def changeset(domain, attrs) do
    domain
    |> cast(attrs, [:role_id, :name])
    |> validate_required([:role_id, :name])
  end

  #
  # Filters
  #

  def filter(starting_query, filters) do
    Enum.reduce(filters, starting_query, fn {k, v}, query -> filter(query, k, v) end)
  end

  def filter(query, :id, id), do: where(query, [d], d.id == ^id)
  def filter(query, :role, role), do: where(query, [d], d.role_id == ^role.id)
  def filter(query, :order, :id), do: order_by(query, [d], asc: d.id)
end
