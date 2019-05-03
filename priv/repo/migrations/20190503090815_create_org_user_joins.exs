defmodule Grassflog.Repo.Migrations.CreateOrgUserJoins do
  use Ecto.Migration

  def change do
    create table(:org_user_joins) do
      add :org_id, references(:orgs, on_delete: :delete_all), null: false
      add :user_id, references(:users, on_delete: :delete_all), null: false
      add :is_admin, :bool, default: false
      timestamps()
    end

    create index(:org_user_joins, [:org_id])
    create index(:org_user_joins, [:user_id])
    create unique_index(:org_user_joins, [:org_id, :user_id])
  end
end
