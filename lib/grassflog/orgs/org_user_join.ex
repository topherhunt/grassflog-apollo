defmodule Grassflog.Orgs.OrgUserJoin do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Grassflog.Orgs

  schema "org_user_joins" do
    belongs_to :org, Orgs.Org
    belongs_to :user, Orgs.User
    field :is_admin, :boolean
    timestamps()
  end

  def changeset(join, attrs) do
    join
    |> cast(attrs, [:is_admin])
    |> validate_required([:org_id, :user_id])
  end

  #
  # Filters
  #

  def filter(starting_query, filters) do
    Enum.reduce(filters, starting_query, fn {k, v}, query -> filter(query, k, v) end)
  end
end
