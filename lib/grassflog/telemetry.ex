defmodule Grassflog.Telemetry do
  require Logger

  # Thanks to https://hexdocs.pm/ecto/Ecto.Repo.html#module-telemetry-events
  def handle_event([:grassflog, :repo, :query], measurements, metadata, _config) do
    Logger.log(:debug, fn ->
      {ok, _} = metadata.result
      source = metadata.source || "?"
      query_time = div(measurements.query_time, 100) / 10
      query = Regex.replace(~r/(\d\.)"([^"]+)"/, metadata.query, "\\1\\2")
      params = metadata.params

      "SQL query: #{ok} source=\"#{source}\" db=#{query_time}ms   #{query}   params=#{inspect(params)}"
    end)
  end
end
