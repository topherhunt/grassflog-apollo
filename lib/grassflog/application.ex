defmodule Grassflog.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    # List all child processes to be supervised
    children = [
      # Start the Ecto repository
      Grassflog.Repo,
      # Start the endpoint when the application starts
      GrassflogWeb.Endpoint
      # Starts a worker by calling: Grassflog.Worker.start_link(arg)
      # {Grassflog.Worker, arg},
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Grassflog.Supervisor]

    # Subscribe to Ecto queries for logging
    # See https://hexdocs.pm/ecto/Ecto.Repo.html#module-telemetry-events
    # and https://github.com/beam-telemetry/telemetry
    handler = &Grassflog.Telemetry.handle_event/4
    :ok = :telemetry.attach("grassflog-ecto", [:grassflog, :repo, :query], handler, %{})

    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    GrassflogWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
