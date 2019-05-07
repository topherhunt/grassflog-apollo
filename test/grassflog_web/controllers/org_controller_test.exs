defmodule GrassflogWeb.Manage.OrgControllerTest do
  use GrassflogWeb.ConnCase, async: true
  alias Grassflog.Orgs

  describe "plugs" do
    test "most actions reject if no user is logged in", %{conn: conn} do
      conn = get(conn, Routes.org_path(conn, :index))
      assert redirected_to(conn) == Routes.home_path(conn, :index)
      assert conn.halted
    end
  end

  describe "#index" do
    test "lists all orgs I'm a member", %{conn: conn} do
      {conn, user} = login_as_new_user(conn)
      org1 = Factory.insert_org()
      org2 = Factory.insert_org()
      org3 = Factory.insert_org()
      # Let this user be an admin of org1, and a normal member of org 3
      Orgs.add_org_member!(org1, user, is_admin: true)
      Orgs.add_org_member!(org3, user)

      conn = get(conn, Routes.org_path(conn, :index))

      assert conn.resp_body =~ "test-page-org-index"
      assert conn.resp_body =~ org1.name
      assert !(conn.resp_body =~ org2.name)
      assert conn.resp_body =~ org3.name
    end
  end

  describe "#show" do
    test "renders correctly for not-logged-in user", %{conn: conn} do
      org = Factory.insert_org()

      conn = get(conn, Routes.org_path(conn, :show, org))

      assert conn.resp_body =~ "test-page-org-show-#{org.id}"
      assert conn.resp_body =~ org.name
    end
  end

  describe "#new" do
    test "renders correctly", %{conn: conn} do
      {conn, _} = login_as_new_user(conn)

      conn = get(conn, Routes.org_path(conn, :new))

      assert conn.resp_body =~ "test-page-org-new"
    end
  end

  describe "#create" do
    test "inserts the org, makes me an admin, and redirects", %{conn: conn} do
      {conn, user} = login_as_new_user(conn)

      params = %{"org" => %{"name" => "Grassflog"}}
      conn = post(conn, Routes.org_path(conn, :create), params)

      org = Orgs.get_org_by!(order: :newest)
      assert org.name == "Grassflog"
      assert Orgs.is_org_admin?(org, user)
      assert redirected_to(conn) == Routes.org_path(conn, :show, org)
    end

    test "rejects changes if invalid", %{conn: conn} do
      {conn, _user} = login_as_new_user(conn)
      count = Orgs.count_orgs()

      params = %{"org" => %{"name" => " "}}
      conn = post(conn, Routes.org_path(conn, :create), params)

      assert Orgs.count_orgs() == count
      assert html_response(conn, 200) =~ "name can't be blank"
    end
  end

  describe "#edit" do
    test "renders correctly", %{conn: conn} do
      {conn, user} = login_as_new_user(conn)
      org = Factory.insert_org()
      Orgs.add_org_member!(org, user, is_admin: true)

      conn = get(conn, Routes.org_path(conn, :edit, org))

      assert conn.resp_body =~ "test-page-org-edit-#{org.id}"
    end

    test "rejects if not org admin", %{conn: conn} do
      {conn, user} = login_as_new_user(conn)
      org = Factory.insert_org()
      Orgs.add_org_member!(org, user)

      conn = get(conn, Routes.org_path(conn, :edit, org))

      assert redirected_to(conn) == Routes.home_path(conn, :index)
    end
  end

  describe "#update" do
    test "saves changes and redirects", %{conn: conn} do
      {conn, user} = login_as_new_user(conn)
      org = Factory.insert_org()
      Orgs.add_org_member!(org, user, is_admin: true)

      params = %{"org" => %{"name" => "New name"}}
      conn = patch(conn, Routes.org_path(conn, :update, org), params)

      assert Orgs.get_org!(org.id).name == "New name"
      assert redirected_to(conn) == Routes.org_path(conn, :show, org)
    end

    test "rejects changes if invalid", %{conn: conn} do
      {conn, user} = login_as_new_user(conn)
      org = Factory.insert_org()
      Orgs.add_org_member!(org, user, is_admin: true)

      params = %{"org" => %{"name" => " "}}
      conn = patch(conn, Routes.org_path(conn, :update, org), params)

      assert Orgs.get_org!(org.id).name == org.name
      assert html_response(conn, 200) =~ "name can't be blank"
    end

    test "rejects if not org admin", %{conn: conn} do
      {conn, user} = login_as_new_user(conn)
      org = Factory.insert_org()
      Orgs.add_org_member!(org, user)

      params = %{"org" => %{"name" => "New name"}}
      conn = patch(conn, Routes.org_path(conn, :update, org), params)

      assert redirected_to(conn) == Routes.home_path(conn, :index)
    end
  end

  describe "#delete" do
    test "deletes the org", %{conn: conn} do
      {conn, user} = login_as_new_user(conn)
      org = Factory.insert_org()
      Orgs.add_org_member!(org, user, is_admin: true)

      conn = delete(conn, Routes.org_path(conn, :delete, org))

      assert Orgs.get_org(org.id) == nil
      assert redirected_to(conn) == Routes.org_path(conn, :index)
    end

    test "rejects if not org admin", %{conn: conn} do
      {conn, user} = login_as_new_user(conn)
      org = Factory.insert_org()
      Orgs.add_org_member!(org, user)

      conn = delete(conn, Routes.org_path(conn, :delete, org))

      assert Orgs.get_org!(org.id) != nil
      assert redirected_to(conn) == Routes.home_path(conn, :index)
    end
  end
end
