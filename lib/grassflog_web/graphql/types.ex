defmodule GrassflogWeb.Graphql.Types do
  use Absinthe.Schema.Notation
  alias GrassflogWeb.Graphql.Resolvers

  object :user do
    field :id, :id
    field :name, :string
    field :email, :string
    field :inserted_at, :naive_datetime
    field :last_signed_in_at, :naive_datetime
  end

  object :role do
    field :id, :id
    field :name, :string
    field :children, list_of(:role), do: resolve &Resolvers.list_roles/3
  end

  object :proposal do
    field :id, :id
    field :tension, :string
    field :inserted_at, :string
    field :circle, :role, do: resolve &Resolvers.get_role/3
    field :proposer, :user, do: resolve &Resolvers.get_user/3
  end
end
