defmodule GrassflogWeb.Graphql.Types do
  use Absinthe.Schema.Notation
  alias GrassflogWeb.Graphql.Resolvers

  object :user do
    field :id, :id
    field :name, :string
    # TODO: tighter auth of access to this field?
    field :email, :string
    field :inserted_at, :naive_datetime
    field :last_signed_in_at, :naive_datetime
    # Including associated objects
    # field :proposals, list_of(:proposal) do
    #   resolve &Resolvers.list_proposals/3
    # end
  end

  object :role do
    field :id, :id
    field :name, :string
  end

  object :proposal do
    field :id, :id
    field :tension, :string
    field :inserted_at, :string
    field :circle, :role do
      resolve &Resolvers.get_role/3
    end
    field :proposer, :user do
      resolve &Resolvers.get_user/3
    end
  end
end
