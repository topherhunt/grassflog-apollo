defmodule Grassflog.Orgs do
  import Ecto.Query, warn: false
  alias Grassflog.Repo
  alias Grassflog.Orgs.{User, Org, OrgUserJoin, Role, Domain, Accountability}

  # TODO: Try moving all of these crud helpers into the relevant schema module

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

  def insert_user!(params), do: insert_user(params) |> Repo.ensure_success()

  def update_user(user, params), do: user_changeset(user, params) |> Repo.update()

  def update_user!(user, params), do: update_user(user, params) |> Repo.ensure_success()

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

  def insert_org(params) do
    case Repo.insert(new_org_changeset(params)) do
      {:ok, org} ->
        anchor = insert_circle!(org, %{is_anchor: true, name: "Anchor Circle"})
        org = update_org!(org, %{anchor_circle_id: anchor.id})
        {:ok, org}

      {:error, changeset} ->
        {:error, changeset}
    end
  end

  def insert_org!(params), do: insert_org(params) |> Repo.ensure_success()

  def update_org(org, params), do: org_changeset(org, params) |> Repo.update()

  def update_org!(org, params), do: update_org(org, params) |> Repo.ensure_success()

  def delete_org!(org), do: Repo.delete!(org)

  def new_org_changeset(changes \\ %{}), do: Org.changeset(%Org{}, changes)

  def org_changeset(org, changes \\ %{}), do: Org.changeset(org, changes)

  #
  # OrgUserJoins
  #

  def add_org_member!(org, user, opts \\ []) do
    %OrgUserJoin{org_id: org.id, user_id: user.id}
    |> OrgUserJoin.changeset(%{is_admin: !!opts[:is_admin]})
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

  def insert_role!(org, params), do: insert_role(org, params) |> Repo.ensure_success()

  def update_role(role, params), do: role_changeset(role, params) |> Repo.update()

  def update_role!(role, params), do: update_role(role, params) |> Repo.ensure_success()

  def delete_role!(role), do: Repo.delete!(role)

  def role_changeset(role, changes \\ %{}), do: Role.changeset(role, changes)

  #
  # Circles (a special type of Role)
  #

  def insert_circle!(org, params) do
    circle = insert_role!(org, Map.merge(params, %{is_circle: true}))
    insert_role!(org, %{parent_id: circle.id, name: "Facilitator"})
    insert_role!(org, %{parent_id: circle.id, name: "Secretary"})
    circle
  end

  #
  # Domains
  #

  def get_domain(id, filt \\ []), do: get_domain_by(Keyword.merge([id: id], filt))

  def get_domain!(id, filt \\ []), do: get_domain_by!(Keyword.merge([id: id], filt))

  def get_domain_by(filt), do: Domain |> Domain.filter(filt) |> Repo.first()

  def get_domain_by!(filt), do: Domain |> Domain.filter(filt) |> Repo.first!()

  def get_domains(filt \\ []), do: Domain |> Domain.filter(filt) |> Repo.all()

  def count_domains(filt \\ []), do: Domain |> Domain.filter(filt) |> Repo.count()

  def insert_domain(params), do: new_domain_changeset(params) |> Repo.insert()

  def insert_domain!(params), do: insert_domain(params) |> Repo.ensure_success()

  def update_domain(domain, params), do: domain_changeset(domain, params) |> Repo.update()

  def update_domain!(domain, params), do: update_domain(domain, params) |> Repo.ensure_success()

  def delete_domain!(domain), do: Repo.delete!(domain)

  def new_domain_changeset(changes \\ %{}), do: Domain.changeset(%Domain{}, changes)

  def domain_changeset(domain, changes \\ %{}), do: Domain.changeset(domain, changes)

  #
  # Accountabilities
  #

  alias Accountability, as: Acct

  def get_acct(id, filt \\ []), do: get_acct_by(Keyword.merge([id: id], filt))

  def get_acct!(id, filt \\ []), do: get_acct_by!(Keyword.merge([id: id], filt))

  def get_acct_by(filt), do: Acct |> Acct.filter(filt) |> Repo.first()

  def get_acct_by!(filt), do: Acct |> Acct.filter(filt) |> Repo.first!()

  def get_accts(filt \\ []), do: Acct |> Acct.filter(filt) |> Repo.all()

  def count_accts(filt \\ []), do: Acct |> Acct.filter(filt) |> Repo.count()

  def insert_acct(params), do: new_acct_changeset(params) |> Repo.insert()

  def insert_acct!(params), do: insert_acct(params) |> Repo.ensure_success()

  def update_acct(acct, params), do: acct_changeset(acct, params) |> Repo.update()

  def update_acct!(acct, params), do: update_acct(acct, params) |> Repo.ensure_success()

  def delete_acct!(acct), do: Repo.delete!(acct)

  def new_acct_changeset(changes \\ %{}), do: Acct.changeset(%Acct{}, changes)

  def acct_changeset(acct, changes \\ %{}), do: Acct.changeset(acct, changes)

end
