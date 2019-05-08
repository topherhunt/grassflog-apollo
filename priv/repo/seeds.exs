# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Grassflog.Repo.insert!(%Grassflog.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias Grassflog.{Factory, Orgs}

user = Factory.insert_user(email: "hunt.topher@gmail.com")
org = Factory.insert_org()
Orgs.add_org_member!(org, user, is_admin: true)
Factory.seed_hierarchy(org)
