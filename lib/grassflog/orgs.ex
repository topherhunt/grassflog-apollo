defmodule Grassflog.Orgs do
  import Ecto.Query, warn: false
  alias Grassflog.Repo
  alias Grassflog.Orgs.{User, Org, OrgUserJoin, Role}

  #
  # Users
  #

  def get_user(id, filt \\ []), do: get_user_by(Keyword.merge([id: id], filt))

  def get_user!(id, filt \\ []), do: get_user_by!(Keyword.merge([id: id], filt))

  def get_user_by(filt), do: User |> User.filter(filt) |> Repo.first()

  def get_user_by!(filt), do: User |> User.filter(filt) |> Repo.first!()

  def get_users(filt \\ []), do: User |> User.filter(filt) |> Repo.all()

  def count_users(filt \\ []), do: User |> User.filter(filt) |> Repo.count()

  def insert_user(params), do: new_user_changeset(params) |> Repo.insert()

  def insert_user!(params), do: new_user_changeset(params) |> Repo.insert!()

  def update_user(user, params), do: user_changeset(user, params) |> Repo.update()

  def update_user!(user, params), do: user_changeset(user, params) |> Repo.update!()

  def delete_user!(user), do: Repo.delete!(user)

  def new_user_changeset(changes \\ %{}), do: User.changeset(%User{}, changes)

  def user_changeset(user, changes \\ %{}), do: User.changeset(user, changes)

  #
  # Orgs
  #

  def get_org(id, filt \\ []), do: get_org_by(Keyword.merge([id: id], filt))

  def get_org!(id, filt \\ []), do: get_org_by!(Keyword.merge([id: id], filt))

  def get_org_by(filt), do: Org |> Org.filter(filt) |> Repo.first()

  def get_org_by!(filt), do: Org |> Org.filter(filt) |> Repo.first!()

  def get_orgs(filt \\ []), do: Org |> Org.filter(filt) |> Repo.all()

  def count_orgs(filt \\ []), do: Org |> Org.filter(filt) |> Repo.count()

  def insert_org(params), do: new_org_changeset(params) |> Repo.insert()

  def insert_org_starting_structure!(org) do
    anchor = insert_role!(org, %{circle_id: nil, name: "Anchor circle", is_circle: true})
    insert_role!(org, %{circle_id: anchor.id, name: "Facilitator"})
    insert_role!(org, %{circle_id: anchor.id, name: "Secretary"})
    update_org!(org, %{anchor_circle_id: anchor.id})
  end

  def update_org(org, params), do: org_changeset(org, params) |> Repo.update()

  def update_org!(org, params), do: org_changeset(org, params) |> Repo.update!()

  def delete_org!(org), do: Repo.delete!(org)

  def new_org_changeset(changes \\ %{}), do: Org.changeset(%Org{}, changes)

  def org_changeset(org, changes \\ %{}), do: Org.changeset(org, changes)

  #
  # OrgUserJoins
  #

  def insert_org_user_join!(org, user, params) do
    %OrgUserJoin{org_id: org.id, user_id: user.id}
    |> OrgUserJoin.changeset(params)
    |> Repo.insert!()
  end

  def is_org_admin?(org, user) do
    OrgUserJoin |> OrgUserJoin.filter(org: org, user: user, is_admin: true) |> Repo.any?()
  end

  def is_org_member?(org, user) do
    OrgUserJoin |> OrgUserJoin.filter(org: org, user: user) |> Repo.any?
  end

  #
  # Roles
  #

  def get_role(id, filt \\ []), do: get_role_by(Keyword.merge([id: id], filt))

  def get_role!(id, filt \\ []), do: get_role_by!(Keyword.merge([id: id], filt))

  def get_role_by(filt), do: Role |> Role.filter(filt) |> Repo.first()

  def get_role_by!(filt), do: Role |> Role.filter(filt) |> Repo.first!()

  def get_roles(filt \\ []), do: Role |> Role.filter(filt) |> Repo.all()

  def count_roles(filt \\ []), do: Role |> Role.filter(filt) |> Repo.count()

  def insert_role(org, params) do
    %Role{org_id: org.id} |> Role.changeset(params) |> Repo.insert()
  end

  def insert_role!(org, params), do: insert_role(org, params) |> assert_succeeded()

  def update_role(role, params), do: role_changeset(role, params) |> Repo.update()

  def update_role!(role, params), do: role_changeset(role, params) |> Repo.update!()

  def delete_role!(role), do: Repo.delete!(role)

  # def new_role_changeset(changes \\ %{}), do: Role.changeset(%Role{}, changes)

  def role_changeset(role, changes \\ %{}), do: Role.changeset(role, changes)

  #
  # Internal helpers
  #

  defp assert_succeeded({code, _} = result) do
    case code do
      :ok -> result
      :error -> raise Ecto.InvalidChangesetError, result: result
    end
  end

end
