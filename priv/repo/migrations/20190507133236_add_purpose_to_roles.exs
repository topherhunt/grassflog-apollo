defmodule Grassflog.Repo.Migrations.AddPurposeToRoles do
  use Ecto.Migration

  def change do
    alter table(:roles) do
      add :purpose, :string
    end
  end
end
