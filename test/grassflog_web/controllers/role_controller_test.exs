defmodule GrassflogWeb.Manage.RoleControllerTest do
  use GrassflogWeb.ConnCase, async: true
  alias Grassflog.Orgs

  describe "#show" do
    test "renders correctly", %{conn: conn} do
      # Set up a circle with a child role, parent circle, domain, and acct.
      org = Factory.insert_org()
      anchor = Orgs.get_role!(org.anchor_circle_id)
      circle = Factory.insert_circle(org: org, parent: anchor, purpose: "to win the game")
      Factory.insert_role(org: org, parent: circle)
      Factory.insert_acct(role: circle)
      Factory.insert_domain(role: circle)

      conn = get(conn, Routes.org_role_path(conn, :show, org, circle))

      assert conn.resp_body =~ "test-page-role-show-#{circle.id}"
      assert conn.resp_body =~ circle.name
    end
  end
end
