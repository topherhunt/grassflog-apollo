defmodule Grassflog.Helpers do
  def env!(key), do: System.get_env(key) || raise("Env var '#{key}' is missing!")

  def is_blank?(value), do: value == nil || (is_binary(value) && String.trim(value) == "")

  def is_present?(value), do: !is_blank?(value)
end
