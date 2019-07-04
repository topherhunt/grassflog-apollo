defmodule GrassflogWeb.ConnHelpers do
  use Phoenix.ConnTest
  import Grassflog.Factory

  def login_as_new_user(conn, user_params \\ []) do
    user = insert_user(user_params)
    conn = assign(conn, :current_user, user)
    {conn, user}
  end
end
