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

  def changeset(org, attrs) do
    org
    |> cast(attrs, [:org_id, :user_id, :is_admin])
    |> validate_required([:org_id, :user_id])
  end
end
