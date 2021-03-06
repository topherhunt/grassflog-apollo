defmodule Grassflog.Factory do
  alias Grassflog.Orgs

  def insert_user(opts \\ []) do
    allow_opts(opts, [:name, :email, :uuid])
    uuid = opts[:uuid] || random_uuid()
    name = opts[:name] || "User #{uuid}"
    email = opts[:email] || "user_#{uuid}@example.com"
    Orgs.insert_user!(%{name: name, email: email, uuid: uuid})
  end

  def insert_org(opts \\ []) do
    allow_opts(opts, [:name])
    name = opts[:name] || "Org #{random_uuid()}"
    Orgs.insert_org!(%{name: name})
  end

  def insert_role(opts) do
    allow_opts(opts, [:org, :parent, :name, :purpose])
    org = opts[:org] || raise("org is required")
    parent = opts[:parent] || raise("parent is required")
    name = opts[:name] || "Role #{random_uuid()}"
    Orgs.insert_role!(org, %{parent_id: parent.id, name: name, purpose: opts[:purpose]})
  end

  def insert_circle(opts) do
    allow_opts(opts, [:org, :parent, :name, :purpose])
    org = opts[:org] || raise("org is required")
    parent = opts[:parent] || raise("parent is required")
    name = opts[:name] || "Circle #{random_uuid()}"
    Orgs.insert_circle!(org, %{parent_id: parent.id, name: name, purpose: opts[:purpose]})
  end

  def insert_domain(opts) do
    allow_opts(opts, [:role, :name])
    role = opts[:role] || raise("role is required")
    name = opts[:name] || "Domain #{random_uuid()}"
    Orgs.insert_domain!(%{role_id: role.id, name: name})
  end

  def insert_acct(opts) do
    allow_opts(opts, [:role, :name])
    role = opts[:role] || raise("role is required")
    name = opts[:name] || "Accountability #{random_uuid()}"
    Orgs.insert_acct!(%{role_id: role.id, name: name})
  end

  def seed_hierarchy(org) do
    anchor = Orgs.get_role!(org.anchor_circle_id)
    circle1 = insert_circle(org: org, parent: anchor)
    circle2 = insert_circle(org: org, parent: anchor)
    circle3 = insert_circle(org: org, parent: circle1)

    Enum.each([anchor, circle1, circle2, circle3], fn(circle) ->
      seed_accts_and_domains(circle)

      Enum.each(1..Enum.random(2..6), fn(_) ->
        role = insert_role(org: org, parent: circle)
        seed_accts_and_domains(role)
      end)
    end)

    # role1 = insert_role(org: org, parent: anchor)
    # role2 = insert_role(org: org, parent: circle1)
    # role3 = insert_role(org: org, parent: circle1)
    # role4 = insert_role(org: org, parent: circle1)

    # insert_domain(role: circle1)
    # insert_domain(role: role1)
    # insert_domain(role: role2)

    # insert_acct(role: circle1)
    # insert_acct(role: circle1)
    # insert_acct(role: role1)
    # insert_acct(role: role2)
    # insert_acct(role: role3)
    # insert_acct(role: role3)
    # insert_acct(role: role3)
    # insert_acct(role: role4)

    nil
  end

  def seed_accts_and_domains(role) do
    Enum.each(1..Enum.random(1..3), fn(_) -> insert_domain(role: role) end)
    Enum.each(1..Enum.random(2..6), fn(_) -> insert_acct(role: role) end)
  end

  def random_uuid do
    pool = String.codepoints("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789")
    # 5 base-58 chars gives us 600M combinations; that's plenty of entropy
    Enum.map(1..5, fn _ -> Enum.random(pool) end) |> Enum.join()
  end

  #
  # Internal
  #

  defp allow_opts(opts, allowed_keys) do
    Enum.each(Keyword.keys(opts), fn(key) ->
      unless key in allowed_keys do
        raise "Unexpected key #{inspect(key)}."
      end
    end)
  end
end
