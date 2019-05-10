# A ProposalPart is a step of a proposal which groups 1+ ProposalChanges related to a specific role. Each ProposalPart 1:1 corresponds with a section of the proposal in the UI. Each ProposalPart has a type and a target role id (which is nil if the role is being newly created).
defmodule Grassflog.Orgs.ProposalPart do
  use Ecto.Schema
  import Ecto.Changeset
  require Ecto.Query
  alias Ecto.Query, as: Q
  alias Grassflog.{Repo, Orgs}

  schema "proposal_parts" do
    belongs_to :proposal, Orgs.Proposal
    field :type, :string
    field :target_id, :integer
    timestamps()

    has_many :proposal_changes, Orgs.ProposalChange
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

  def update(struct, params), do: changeset(struct, params) |> Repo.update()

  def update!(struct, params), do: update(struct, params) |> Repo.ensure_success()

  def delete!(struct), do: Repo.delete!(struct)

  def new_changeset(params \\ %{}), do: changeset(%__MODULE__{}, params)

  # NOTE: There's two very different kinds of validations:
  #   1) validating that this is a valid ProposalPart record
  #   2) validating that the instructions are valid to execute given the Proposal context.
  def changeset(struct, params) do
    struct
    |> cast(params, [:proposal_id, :type, :target_id])
    |> validate_required([:proposal_id, :type])
    |> validate_inclusion(:type, ~w(create_role update_role))
    # TODO: Validate the target_id and the associated change types based on part type
  end

  #
  # Filters
  #

  def filter(starting_query, filters) do
    Enum.reduce(filters, starting_query, fn {k, v}, query -> filter(query, k, v) end)
  end

  def filter(query, :id, id), do: Q.where(query, [r], r.id == ^id)
  def filter(query, :proposal, prop), do: Q.where(query, [p], p.proposal_id == ^prop.id)
end
