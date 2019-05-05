defmodule GrassflogWeb.OrgController do
  use GrassflogWeb, :controller
  alias Grassflog.Orgs

  plug :must_be_logged_in when action in [:index, :new, :create, :edit, :update, :delete]
  plug :load_org          when action in [:show, :edit, :update, :delete]
  plug :must_be_org_admin when action in [:edit, :update, :delete]

  # Lists all orgs that I'm a member of. Rarely used.
  def index(conn, _params) do
    render conn, "index.html"
  end

  def show(conn, %{"id" => id}) do
    render conn, "show.html", org: Orgs.get_org!(id)
  end

  def new(conn, _params) do
    changeset = Orgs.new_org_changeset()
    render conn, "new.html", changeset: changeset
  end

  def create(conn, %{"org" => org_params}) do
    case Orgs.insert_org(org_params) do
      {:ok, org} ->
        Orgs.insert_org_starting_structure!(org)
        Orgs.insert_org_user_join!(org, conn.assigns.current_user, %{is_admin: true})

        conn
        |> put_flash(:info, "Organization created.")
        |> redirect(to: Routes.org_path(conn, :show, org))

      {:error, changeset} ->
        conn
        |> put_flash(:error, "Please see errors below.")
        |> render("new.html", changeset: changeset)
    end
  end

  def edit(conn, _params) do
    changeset = Orgs.org_changeset(conn.assigns.org)
    render conn, "edit.html", changeset: changeset
  end

  def update(conn, %{"org" => org_params}) do
    case Orgs.update_org(conn.assigns.org, org_params) do
      {:ok, org} ->
        conn
        |> put_flash(:info, "Organization updated.")
        |> redirect(to: Routes.org_path(conn, :show, org))

      {:error, changeset} ->
        conn
        |> put_flash(:error, "Please see errors below.")
        |> render("edit.html", changeset: changeset)
    end
  end

  def delete(conn, _params) do
    Orgs.delete_org!(conn.assigns.org)

    conn
    |> put_flash(:info, "Organization deleted.")
    |> redirect(to: Routes.org_path(conn, :index))
  end

  #
  # Internal
  #

  defp load_org(conn, _) do
    org = Orgs.get_org!(conn.params["id"])
    assign(conn, :org, org)
  end

  defp must_be_org_admin(conn, _) do
    if Orgs.is_org_admin?(conn.assigns.org, conn.assigns.current_user) do
      conn
    else
      conn
      |> put_flash(:error, "You don't have permission to access that page.")
      |> redirect(to: Routes.home_path(conn, :index))
      |> halt()
    end
  end
end
