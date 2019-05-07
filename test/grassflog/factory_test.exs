defmodule Grassflog.FactoryTest do
  use Grassflog.DataCase

  test "seeding all the content works" do
    Factory.insert_user()
    org = Factory.insert_org()
    Factory.seed_hierarchy(org)
  end
end
