defmodule GrassflogWeb.Graphql.Schema do
  use Absinthe.Schema
  import_types GrassflogWeb.Graphql.ContentTypes

  alias GrassflogWeb.Graphql.Resolvers

  query do
    @desc "Get all users"
    field :users, list_of(:user) do
      resolve &Resolvers.Content.list_users/3
    end
  end
end
