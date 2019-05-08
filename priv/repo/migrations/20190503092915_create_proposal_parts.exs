defmodule Grassflog.Repo.Migrations.CreateProposalParts do
  use Ecto.Migration

  def change do
    create table(:proposal_parts) do
      add :proposal_id, references(:proposals, on_delete: :delete_all), null: false
      add :type, :string, null: false
      add :target_id, :integer
      timestamps()
    end

    create index(:proposal_parts, [:proposal_id, :type])
  end
end
