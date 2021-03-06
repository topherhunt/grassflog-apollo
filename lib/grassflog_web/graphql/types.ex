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
    field :parent_id, :string
    field :name, :string
    field :purpose, :string
    field :is_circle, :boolean
    field :children, list_of(:role), do: resolve &Resolvers.batch_list_roles/3
    field :domains, list_of(:domain), do: resolve &Resolvers.batch_list_domains/3
    field :accts, list_of(:acct), do: resolve &Resolvers.batch_list_accts/3
  end

  object :domain do
    field :id, :id
    field :role_id, :string
    field :name, :string
  end

  object :acct do
    field :id, :id
    field :role_id, :string
    field :name, :string
  end

  object :proposal do
    field :id, :id
    field :tension, :string
    field :inserted_at, :string
    field :circle, :role, do: resolve &Resolvers.get_role/3
    field :proposer, :user, do: resolve &Resolvers.get_user/3
    field :parts, list_of(:proposal_part), do: resolve &Resolvers.list_proposal_parts/3
  end

  object :proposal_part do
    field :id, :id
    field :type, :string
    field :target_id, :integer
    field :changes, list_of(:proposal_change) do
      resolve &Resolvers.list_proposal_changes/3
    end
  end

  object :proposal_change do
    field :id, :id
    field :type, :string
    field :params, :json
  end

  # Define a custom scalar Type for stringified JSON.
  # See https://hexdocs.pm/absinthe/custom-scalars.html#content
  scalar :json do
    serialize &Jason.encode!(&1)
    parse fn(input) ->
      # Don't crash if we receive invalid json
      case Jason.decode(input) do
        {:ok, result} -> result
        _ -> :error
      end
    end
  end
end
