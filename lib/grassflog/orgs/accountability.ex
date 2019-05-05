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
end
