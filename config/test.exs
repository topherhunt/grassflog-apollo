use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :grassflog, GrassflogWeb.Endpoint,
  http: [port: 4002],
  server: true

# Print only warnings and errors during test
config :logger, level: :warn

# Configure your database
config :grassflog, Grassflog.Repo,
  pool: Ecto.Adapters.SQL.Sandbox,
  # long timeout to allow debugging in tests
  ownership_timeout: 20 * 60 * 1000

config :hound, driver: "chrome_driver", browser: "chrome_headless"
