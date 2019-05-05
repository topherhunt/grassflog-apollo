defmodule GrassflogWeb.Router do
  use GrassflogWeb, :router
  import GrassflogWeb.SessionPlugs, only: [load_current_user: 2]

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :load_current_user
  end

  scope "/", GrassflogWeb do
    pipe_through :browser

    get "/", HomeController, :index

    scope "/auth" do
    # The Ueberauth login route redirects to Auth0's login page
      get "/login", AuthController, :login
      # Auth0 redirects back here after successful auth
      get "/auth0_callback", AuthController, :auth0_callback
      get "/logout", AuthController, :logout
      get "/force_login/:id/:password", AuthController, :force_login
    end

    resources "/orgs", OrgController
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api" do
    pipe_through :api

    forward "/graphiql", Absinthe.Plug.GraphiQL,
      schema: GrassflogWeb.Graphql.Schema,
      json_codec: Jason

    # See https://hexdocs.pm/absinthe/plug-phoenix.html
    forward "/", Absinthe.Plug,
      schema: GrassflogWeb.Graphql.Schema,
      json_codec: Jason


  end
end
