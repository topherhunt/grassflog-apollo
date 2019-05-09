defmodule Grassflog.Repo do
  import Ecto.Query, warn: false
  alias Grassflog.Repo
  use Ecto.Repo,
    otp_app: :grassflog,
    adapter: Ecto.Adapters.Postgres

  def count(query), do: query |> select([t], count(t.id)) |> Repo.one()

  def any?(query), do: count(query) >= 1

  def first(query), do: query |> limit(1) |> Repo.one()

  # Raises if none found
  def first!(query), do: query |> limit(1) |> Repo.one!()

  # NOTE: Only works with SELECT statements
  def to_sql(query), do: Ecto.Adapters.SQL.to_sql(:all, Repo, query)

  def ensure_success(result) do
    case result do
      {:ok, object} -> object
      {:error, changeset} -> raise Ecto.InvalidChangesetError, changeset: changeset
    end
  end
end
