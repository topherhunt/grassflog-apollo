defmodule GrassflogWeb.PageController do
  use GrassflogWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
