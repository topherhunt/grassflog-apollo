use Mix.Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :grassflog, GrassflogWeb.Endpoint,
  http: [port: 4002],
  server: true

# Log ALL messages, but route them to a logfile
config :logger,
  backends: [{LoggerFileBackend, :test_log}]

config :logger, :test_log,
  path: "log/test.log",
  # format: "$date $time $metadata[$level] $message\n",
  # :debug for ALL queries etc; :brief for only the basics
  level: :debug

# Configure your database
config :grassflog, Grassflog.Repo,
  pool: Ecto.Adapters.SQL.Sandbox,
  # long timeout to allow debugging in tests
  ownership_timeout: 20 * 60 * 1000

config :hound, driver: "chrome_driver", browser: "chrome_headless"
