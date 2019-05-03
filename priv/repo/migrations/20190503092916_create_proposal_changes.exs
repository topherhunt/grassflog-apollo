defmodule Grassflog.Repo.Migrations.CreateProposalChanges do
  use Ecto.Migration

  def change do
    create table(:proposal_changes) do
      add :proposal_id, references(:proposals, on_delete: :delete_all), null: false
      add :type, :string, null: false
      add :payload, :jsonb
      timestamps()
      # doesn't hurt to explicitly track this at the per-change level
      add :enacted_at, :naive_datetime
    end

    # We may query by just proposal_id, or by a list of ids and a list of types.
    # We may also filter by json contents but I'm not yet sure how that will look.
    create index(:proposal_changes, [:proposal_id, :type])
  end
end
