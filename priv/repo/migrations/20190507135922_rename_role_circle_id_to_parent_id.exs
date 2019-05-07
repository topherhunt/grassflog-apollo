defmodule Grassflog.Repo.Migrations.RenameRoleCircleIdToParentId do
  use Ecto.Migration

  def change do
    rename table(:roles), :circle_id, to: :parent_id
  end
end
