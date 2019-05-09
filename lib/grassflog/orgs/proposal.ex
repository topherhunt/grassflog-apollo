# A Proposal is a set of 1+ ProposalParts which describe a sequence of changes to make to the circle structure.
defmodule Grassflog.Orgs.Proposal do
  use Ecto.Schema
  import Ecto.Changeset
  require Ecto.Query
  alias Ecto.Query
  # import Ecto.Query, warn: false
  alias Grassflog.{Repo, Orgs}

  schema "proposals" do
    # Proposals need org_id because circle_id can't guarantee eternal history.
    belongs_to :org, Orgs.Org
    belongs_to :circle, Orgs.Role
    belongs_to :proposer, Orgs.User
    field :tension, :string
    field :enacted_at, :naive_datetime
    timestamps()

    has_many :proposal_parts, Orgs.ProposalPart
  end

  #
  # Public
  #

  def get(id, filt \\ []), do: get_by(Keyword.merge([id: id], filt))

  def get!(id, filt \\ []), do: get_by!(Keyword.merge([id: id], filt))

  def get_by(filt), do: __MODULE__ |> filter(filt) |> Repo.first()

  def get_by!(filt), do: __MODULE__ |> filter(filt) |> Repo.first!()

  def all(filt \\ []), do: __MODULE__ |> filter(filt) |> Repo.all()

  def count(filt \\ []), do: __MODULE__ |> filter(filt) |> Repo.count()

  def insert(params), do: new_changeset(params) |> Repo.insert()

  def insert!(params), do: insert(params) |> Repo.ensure_success()

  def update(proposal, params), do: changeset(proposal, params) |> Repo.update()

  def update!(proposal, params), do: update(proposal, params) |> Repo.ensure_success()

  def delete!(proposal), do: Repo.delete!(proposal)

  def new_changeset(params \\ %{}), do: changeset(%__MODULE__{}, params)

  # TODO: Find a way to separate the "defining" fields vs the "mutable" fields.
  # Maybe create_changeset vs. update_changeset?
  def changeset(proposal, params \\ %{}) do
    proposal
    |> cast(params, [:org_id, :circle_id, :proposer_id, :tension, :enacted_at])
    |> validate_required([:org_id, :circle_id, :proposer_id])
  end

  #
  # Filters
  #

  def filter(starting_query, filters) do
    Enum.reduce(filters, starting_query, fn {k, v}, query -> filter(query, k, v) end)
  end

  def filter(query, :id, id), do: Query.where(query, [r], r.id == ^id)
  def filter(query, :org, org), do: Query.where(query, [r], r.org_id == ^org.id)
  def filter(query, :circle, circle), do: Query.where(query, [r], r.circle_id == ^circle.id)
end
