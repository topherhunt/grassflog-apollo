defmodule GrassflogWeb.HomeControllerTest do
  use GrassflogWeb.ConnCase

  describe "#index" do
    test "renders correctly", %{conn: conn} do
      conn = get(conn, Routes.home_path(conn, :index))
      assert conn.resp_body =~ "test-page-home-index"
    end
  end
end
