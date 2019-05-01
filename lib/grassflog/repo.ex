defmodule Grassflog.Repo do
  use Ecto.Repo,
    otp_app: :grassflog,
    adapter: Ecto.Adapters.Postgres
end
