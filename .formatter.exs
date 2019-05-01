[
  import_deps: [:ecto, :phoenix],
  inputs: ["*.{ex,exs}", "priv/*/seeds.exs", "{config,lib,test}/**/*.{ex,exs}"],
  subdirectories: ["priv/*/migrations"],

  # TODO: Check if the import_deps (above) make the following rules unnecessary
  locals_without_parens: [
    # Router
    plug: :*,
    pipe_through: :*,
    get: :*,
    resources: :*,

    # Controller
    render: :*,

    # Schemas
    field: :*,
    has_one: :*,
    has_many: :*,
    belongs_to: :*,

    # Other
    log: :*,
    info: :*,
    navigate_to: :*
  ]
]
