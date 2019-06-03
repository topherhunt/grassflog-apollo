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

  def update(struct, params), do: draft_changeset(struct, params) |> Repo.update()

  def update!(struct, params), do: update(struct, params) |> Repo.ensure_success()

  def delete!(struct), do: Repo.delete!(struct)

  # TODO: Require certain filters so I can't nuke the whole db
  def delete_all!(filt), do: __MODULE__ |> filter(filt) |> Repo.delete_all()

  def new_changeset(params \\ %{}), do: draft_changeset(%__MODULE__{}, params)

  def draft_changeset(struct, params) do
    struct
    |> cast(params, [:proposal_part_id, :type, :target_id, :params, :metadata, :enacted_at])
    |> validate_required([:proposal_part_id, :type])
    |> validate_inclusion(:type, @valid_types)
    |> populate_params_if_nil()
    |> maybe_require_target_id()
    |> validate_no_disallowed_params()
    |> validate_no_missing_params()
  end

  def valid_to_enact? do
    :TODO
  end

  # Validate that all required fields are populated, for
  def executed_changeset(struct, params) do
    :TODO
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

  defp populate_params_if_nil(changeset) do
    if get_field(changeset, :params) do
      changeset
    else
      put_change(changeset, :params, %{})
    end
  end

  defp maybe_require_target_id(changeset) do
    type = get_field(changeset, :type)
    target_id = get_field(changeset, :target_id)
    is_required = validation_rules()[String.to_atom(type)][:target_id] == :req

    if is_required && target_id == nil do
      add_error(changeset, :target_id, "is required for change type #{type}")
    else
      changeset
    end
  end

  defp validate_no_disallowed_params(changeset) do
    type = get_field(changeset, :type)
    rule = get_validation_rule(type, :params)
    allowed = (rule[:req] || []) ++ (rule[:opt] || []) |> Enum.uniq()
    provided = get_field(changeset, :params) |> Map.keys()
    disallowed = provided -- allowed

    if length(disallowed) > 0 do
      IO.inspect(provided, label: "provided")
      IO.inspect(allowed, label: "allowed")
      IO.inspect(disallowed, label: "disallowed")
      message = "change of type :#{type} only allows params: #{inspect(allowed)}"
      add_error(changeset, :params, message)
    else
      changeset
    end
  end

  defp validate_no_missing_params(changeset) do
    type = get_field(changeset, :type)
    rule = get_validation_rule(type, :params)
    required = (rule[:req] || []) |> Enum.uniq()
    provided = get_field(changeset, :params) |> Map.keys()
    missing = required -- provided

    if length(missing) > 0 do
      IO.inspect(provided, label: "provided")
      IO.inspect(required, label: "required")
      IO.inspect(missing, label: "missing")
      message = "change of type :#{type} requires params: #{inspect(required)}"
      add_error(changeset, :params, message)
    else
      changeset
    end
  end

  defp get_validation_rule(type, field) do
    validation_rules()[String.to_atom(type)][field]
  end

  ##
  # Rules for validating the SHAPE of a changeset (not validating referenced keys etc.)
  # * unmentioned keys are invalid
  # * metadata fields are irrelevant if draft; required (as specified) once enacted
  # * medadata contains fields needed to a) describe a change after-the-fact without
  #   referencing current records, or b) locate all changes affecting an object.
  # * "target" refers to the object of this change (e.g. the domain being updated).
  #
  # TODO: Try making this an @ attr?
  # TODO: Metadata fields are WIP for now. Once I implement displaying role structure
  # history, I'll have a chance to fine-tune what metadata to require for each type.
  #
  defp validation_rules, do: [
    create_role: [
      params: [req: ~w(name), opt: ~w(purpose)],
      metadata: [req: ~w(target_id target_name parent_name affects_records)]
    ],
    update_role: [
      params: [opt: ~w(name purpose)],
      metadata: [
        req: ~w(target_id target_name affects_records),
        opt: ~w(old_name old_purpose)
      ]
    ],
    expand_role: [
      params: [],
      metadata: [req: ~w(target_id target_name affects_records)]
    ],
    move_role: [
      params: [req: ~w(target_id parent_id)],
      metadata: [req: ~w(target_name old_parent_name new_parent_name affects_records)]
    ],
    collapse_role: [
      params: [],
      metadata: [req: ~w(target_id target_name affects_records)]
    ],
    delete_role: [
      params: [],
      metadata: [req: ~w(target_id target_name affects_records)]
    ],
    create_domain: [
      params: [req: ~w(role_id name)],
      metadata: [req: ~w(target_id role_name affects_records)]
    ],
    update_domain: [
      target_id: :req,
      params: [req: ~w(target_id name)],
      metadata: [req: ~w(old_name role_name affects_records)]
    ],
    delete_domain: [
      params: [req: ~w(target_id)],
      metadata: [req: ~w(target_name role_name affects_records)]
    ],
    create_acct: [
      params: [req: ~w(role_id name)],
      metadata: [req: ~w(target_id role_name affects_records)]
    ],
    update_acct: [
      params: [req: ~w(target_id name)],
      metadata: [req: ~w(old_name role_name affects_records)]
    ],
    delete_acct: [
      params: [req: ~w(target_id)],
      metadata: [req: ~w(target_name role_name affects_records)]
    ]
  ]

  # TODO: Validations rules for enacting changes:
  # - update_role: target_id must be child of this circle
  # - delete_role: target_id must be child of this circle
  # - move_role:
  #   - target_id must be child or grandchild of this circle
  #   - parent_id must be a circle, this circle or child, and
  #     must not be the same as target or its child
  @validation_rules_for_enacting []
end
