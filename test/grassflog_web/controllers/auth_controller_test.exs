defmodule GrassflogWeb.AuthControllerTest do
  use GrassflogWeb.ConnCase, async: true

  defp set_logged_in(conn, user) do
    get(conn, Routes.auth_path(conn, :force_login, user.id, "force_login_password"))
  end

  defp assert_logged_in(conn, user) do
    # make another request
    conn = get(conn, Routes.home_path(conn, :index))
    assert get_session(conn, :user_id) == user.id
  end

  defp assert_not_logged_in(conn) do
    # make another request
    conn = get(conn, Routes.home_path(conn, :index))
    assert get_session(conn, :user_id) == nil
  end

  describe "#force_login" do
    test "logs me in by id", %{conn: conn} do
      user = Factory.insert_user()
      conn = get(conn, Routes.auth_path(conn, :force_login, user.id, "force_login_password"))
      assert redirected_to(conn) == Routes.home_path(conn, :index)
      assert_logged_in(conn, user)
    end

    test "raises 404 if id doesn't match", %{conn: conn} do
      _user = Factory.insert_user()

      assert_error_sent(404, fn ->
        get(conn, Routes.auth_path(conn, :force_login, 999, "force_login_password"))
      end)

      assert_not_logged_in(conn)
    end
  end

  describe "#delete" do
    test "logs me out", %{conn: conn} do
      user = Factory.insert_user()
      conn = set_logged_in(conn, user)
      assert_logged_in(conn, user)
      conn = get(conn, Routes.auth_path(conn, :logout))
      assert_not_logged_in(conn)
    end
  end
end
