defmodule GrassflogWeb.RoleController do
  use GrassflogWeb, :controller
  alias Grassflog.Orgs

  plug :load_org
  plug :load_role

  def show(conn, _params) do
    role = conn.assigns.role
    children = Orgs.get_roles(parent: role, order: :id)
    domains = Orgs.get_domains(role: role, order: :id)
    accts = Orgs.get_accts(role: role, order: :id)
    render conn, "show.html", children: children, domains: domains, accts: accts
  end

  #
  # Internal
  #

  defp load_org(conn, _) do
    org = Orgs.get_org!(conn.params["org_id"])
    assign(conn, :org, org)
  end

  defp load_role(conn, _) do
    role = Orgs.get_role!(conn.params["id"], org: conn.assigns.org, preload: :parent)
    assign(conn, :role, role)
  end
end
