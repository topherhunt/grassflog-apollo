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

  def changeset(org, attrs) do
    org
    |> cast(attrs, [:role_id, :name])
    |> validate_required([:role_id, :name])
  end
end
