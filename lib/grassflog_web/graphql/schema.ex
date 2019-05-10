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

  mutation do
    field :update_proposal, type: :proposal do
      arg :id, non_null(:id)
      arg :tension, non_null(:string)
      resolve &Resolvers.update_proposal/3
    end

    field :create_proposal_part, type: :proposal_part do
      arg :proposal_id, non_null(:id)
      arg :type, non_null(:string)
      arg :target_id, :integer
      resolve &Resolvers.create_proposal_part/3
    end

    field :delete_proposal_part, type: :proposal_part do
      arg :id, non_null(:id)
      resolve &Resolvers.delete_proposal_part/3
    end
  end
end
