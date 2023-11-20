defmodule GrassflogWeb.HomeController do
  use GrassflogWeb, :controller

  def index(conn, _params) do
    IO.inspect(conn, label: "The conn")
    render(conn, "index.html")
  end
end
