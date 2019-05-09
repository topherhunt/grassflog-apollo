defmodule GrassflogWeb.ProposalController do
  use GrassflogWeb, :controller
  alias Grassflog.Orgs

  plug :load_org
  plug :must_be_logged_in

  def new(conn, %{"role_id" => role_id}) do
    org = conn.assigns.org
    role = Orgs.get_role!(role_id)
    user = conn.assigns.current_user
    prop = Orgs.Proposal.insert!(%{org_id: org.id, circle_id: role.id, proposer_id: user.id})
    redirect(conn, to: Routes.org_proposal_path(conn, :edit, org, prop))
  end

  def edit(conn, %{"id" => proposal_id}) do
    # All data will be loaded in React
    render conn, "edit.html", proposal_id: proposal_id
  end

  #
  # Internal
  #

  defp load_org(conn, _) do
    org = Orgs.get_org!(conn.params["org_id"])
    assign(conn, :org, org)
  end
end
