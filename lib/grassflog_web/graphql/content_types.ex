# See https://hexdocs.pm/absinthe/our-first-query.html
defmodule GrassflogWeb.Graphql.ContentTypes do
  use Absinthe.Schema.Notation

  object :user do
    field :id, :id
    field :name, :string
    # TODO: tighter auth of access to this field?
    field :email, :string
    field :inserted_at, :string
    field :last_signed_in_at, :string
  end
end
