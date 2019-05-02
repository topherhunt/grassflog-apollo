defmodule Grassflog.Factory do
  alias Grassflog.Orgs

  def insert_user(params \\ %{}) do
    assert_no_keys_except(params, [:name, :email, :uuid])
    uuid = random_uuid()

    Orgs.insert_user!(%{
      name: params[:name] || "User #{uuid}",
      email: params[:email] || "user_#{uuid}@example.com",
      uuid: params[:uuid] || random_uuid()
    })
  end

  def random_uuid do
    pool = String.codepoints("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789")
    # 5 base-58 chars gives us 600M combinations; that's plenty of entropy
    Enum.map(1..5, fn _ -> Enum.random(pool) end) |> Enum.join()
  end

  #
  # Internal
  #

  defp assert_no_keys_except(params, allowed_keys) do
    keys = Enum.into(params, %{}) |> Map.keys()

    Enum.each(keys, fn(key) ->
      unless key in allowed_keys do
        raise "Unexpected key #{inspect(key)}."
      end
    end)
  end
end
