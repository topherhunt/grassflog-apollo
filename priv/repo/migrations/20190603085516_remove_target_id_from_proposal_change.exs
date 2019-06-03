defmodule Grassflog.Repo.Migrations.RemoveTargetIdFromProposalChange do
  use Ecto.Migration

  def change do
    alter table(:proposal_changes) do
      remove :target_id, :integer
    end
  end
end
