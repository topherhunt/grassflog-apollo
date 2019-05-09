# Base schema for our GraphQL api
# See https://hexdocs.pm/absinthe/our-first-query.html
defmodule GrassflogWeb.Graphql.Schema do
  use Absinthe.Schema
  alias GrassflogWeb.Graphql.Resolvers

  import_types Absinthe.Type.Custom
  import_types GrassflogWeb.Graphql.Types

  query do
    field :users, list_of(:user) do
      resolve &Resolvers.list_users/3
    end

    field :proposal, :proposal do
      arg :id, non_null(:id)
      resolve &Resolvers.get_proposal/3
    end
  end
end
