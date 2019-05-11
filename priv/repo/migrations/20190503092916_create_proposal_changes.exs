defmodule Grassflog.Repo.Migrations.CreateProposalChanges do
  use Ecto.Migration

  def change do
    create table(:proposal_changes) do
      add :proposal_part_id, references(:proposal_parts, on_delete: :delete_all), null: false
      add :type, :string, null: false
      add :target_id, :integer
      add :params, :jsonb
      add :metadata, :jsonb
      timestamps()
      # doesn't hurt to explicitly track this at the per-change level
      add :enacted_at, :naive_datetime
    end

    # We may query by just proposal_id, or by a list of ids and a list of types.
    # We may also filter by json contents but I'm not yet sure how that will look.
    create index(:proposal_changes, [:proposal_part_id, :type])
  end
end
