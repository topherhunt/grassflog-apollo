defmodule Grassflog.Repo.Migrations.CreateProposals do
  use Ecto.Migration

  def change do
    create table(:proposals) do
      add :org_id, references(:orgs, on_delete: :delete_all), null: false
      add :circle_id, references(:roles, on_delete: :delete_all), null: false
      add :proposer_id, references(:users, on_delete: :delete_all), null: false
      add :tension, :string, null: false
      timestamps()
      add :enacted_at, :naive_datetime
    end

    create index(:proposals, [:org_id])
    create index(:proposals, [:circle_id])
    create index(:proposals, [:proposer_id])
  end
end
