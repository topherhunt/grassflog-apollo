defmodule Grassflog.Repo.Migrations.CreateDomains do
  use Ecto.Migration

  def change do
    create table(:domains) do
      add :role_id, references(:roles, on_delete: :delete_all), null: false
      add :name, :string, null: false
      timestamps()
    end

    create index(:domains, [:role_id])
  end
end
