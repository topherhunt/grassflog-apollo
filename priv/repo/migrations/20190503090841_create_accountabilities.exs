defmodule Grassflog.Repo.Migrations.CreateAccountabilities do
  use Ecto.Migration

  def change do
    create table(:accountabilities) do
      add :role_id, references(:roles, on_delete: :delete_all), null: false
      add :name, :string, null: false
      timestamps()
    end

    create index(:accountabilities, [:role_id])
  end
end
