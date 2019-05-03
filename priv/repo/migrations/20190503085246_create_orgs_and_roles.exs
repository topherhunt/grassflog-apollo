defmodule Grassflog.Repo.Migrations.CreateOrgsAndRoles do
  use Ecto.Migration

  def change do

    # First create the bare orgs table

    create table(:orgs) do
      add :name, :string, null: false
      timestamps()
    end

    # Next create the roles table, needed for the anchor_circle_id reference

    create table(:roles) do
      add :org_id, references(:orgs, on_delete: :delete_all), null: false
      # may be null (only for anchor circle)
      add :circle_id, references(:roles, on_delete: :nothing)
      add :name, :string, null: false
      add :is_circle, :bool, default: false
      timestamps()
    end

    create index(:roles, [:org_id])
    create index(:roles, [:circle_id])

    # Now that roles is created, I can add the org's anchor_circle_id reference

    alter table(:orgs) do
      # Allowing null to prevent circular locks when creating org & anchor circle
      add :anchor_circle_id, references(:roles, on_delete: :delete_all)
    end

    create index(:orgs, [:anchor_circle_id])
  end
end
