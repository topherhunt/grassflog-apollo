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
end
