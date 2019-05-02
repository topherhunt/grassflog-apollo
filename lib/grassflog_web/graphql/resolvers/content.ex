defmodule GrassflogWeb.Graphql.Resolvers.Content do
  def list_users(_parent, _args, _resolution) do
    {:ok, Grassflog.Orgs.get_users()}
  end
end
