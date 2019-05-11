# A ProposalChange is a specific structural change described by a Proposal. Grouped under ProposalParts mainly to ensure structure/UI correspondence.
defmodule Grassflog.Orgs.ProposalChange do
  use Ecto.Schema
  import Ecto.Changeset
  require Ecto.Query
  alias Ecto.Query, as: Q
  alias Grassflog.{Repo, Orgs}

  schema "proposal_changes" do
    belongs_to :proposal_part, Orgs.ProposalPart
    field :type, :string
    field :target_id, :integer
    # Any params required to execute this change
    # (referencing only target_id, but not the Part target or Proposal circle)
    field :params, :map
    # Any fields required to 1) locate this change, given a record it impacted, and
    # 2) describe it in human-readable terms (referencing only the target_id and params)
    field :metadata, :map
    field :enacted_at, :naive_datetime
    timestamps()
  end

  @valid_types ~w(create_role update_role move_role expand_role collapse_role delete_role create_domain update_domain delete_domain create_acct update_acct delete_acct)

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

  # TODO: Require certain filters so I can't nuke the whole db
  def delete_all!(filt), do: __MODULE__ |> filter(filt) |> Repo.delete_all()

  def new_changeset(params \\ %{}), do: changeset(%__MODULE__{}, params)

  def changeset(struct, params) do
    struct
    |> cast(params, [:proposal_part_id, :type, :params, :metadata, :enacted_at])
    # instruction_data is required, but may be an empty map (for certain types).
    |> validate_required([:proposal_part_id, :type, :params])
    |> validate_inclusion(:type, @valid_types)
    # TODO: Validate the *_data blobs given this type:
    # - The shape of the data blobs matches pattern for this type
    # - (if not enacted) all key references are valid & allowed
  end

  #
  # Filters
  #

  def filter(starting_query, filters) do
    Enum.reduce(filters, starting_query, fn {k, v}, query -> filter(query, k, v) end)
  end

  def filter(query, :id, id), do: Q.where(query, [r], r.id == ^id)
  def filter(query, :part, part), do: Q.where(query, [p], p.proposal_part_id == ^part.id)

  #
  # Validation internals
  #

  # TODO: Figure out a concise, readable way to encode *_data shape validations.
  # I think I like the "somewhat nested kw list" pattern below.
  # NOTE: Validating the payload does not mean validating the objects being changed.
  @proposal_change_validation_rules_WIP [
    create_role: [
      id: [:must_be_nil_if_draft, :require_if_enacted],
      # Each alterable field must contain keys :from and :to.
      fields: [allow: [:name, :purpose, :is_circle], require: [:name]],
      meta: [allow: [:name]]
    ],
    update_role: [
      id: [:require, :must_be_self_or_child],
      fields: [allow: [:name, :purpose, :is_circle]],
      meta: [allow: [:name]]
    ],
    delete_role: [
      id: [:require, :must_be_child],
      meta: [allow: [:name]]
    ],
    move_role: [
      id: [:require, :must_be_child_or_grandchild],
      # NOTE this sole use of to_role_id (ie. the new parent container)
      to_role_id: [
        :require,
        :must_be_circle,
        :must_be_self_or_child,
        :must_not_be_target,
        :must_not_be_target_parent
      ],
      meta: [allow: [:name, :from_role_name, :to_role_name]]
    ],
    create_acct: [
      id: [:must_be_nil_if_draft, :require_if_enacted],
      fields: [allow: [:role_id, :name], require: [:role_id, :name]],
      meta: [allow: [:name, :role_name]]
    ],
    update_acct: [
      id: [:require],
      fields: [allow: [:name], require: [:name]],
      meta: [allow: [:name, :role_name]]
    ],
    delete_acct: [
      id: [:require],
      meta: [allow: [:name, :role_name]]
    ],
    create_domain: [
      id: [:must_be_nil_if_draft, :require_if_enacted],
      fields: [allow: [:role_id, :name], require: [:role_id, :name]],
      meta: [allow: [:name, :role_name]]
    ],
    update_domain: [
      id: [:require],
      fields: [allow: [:name], require: [:name]],
      meta: [allow: [:name, :role_name]]
    ],
    delete_domain: [
      id: [:require],
      meta: [allow: [:name, :role_name]]
    ]
  ]
end
