# A ProposalChange is a specific structural change described by a Proposal. Grouped under ProposalParts mainly to ensure structure/UI correspondence.
defmodule Grassflog.Orgs.ProposalChange do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Grassflog.Orgs

  schema "proposal_changes" do
    belongs_to :proposal_part, Orgs.ProposalPart
    field :type, :string
    field :instruction_data, :map
    field :description_data, :map
    field :enacted_at, :naive_datetime
    timestamps()
  end

  @valid_types [~w(create_role update_role move_role expand_role collapse_role delete_role create_domain update_domain delete_domain create_acct update_acct delete_acct)]

  def changeset(proposal_change, attrs) do
    proposal_change
    |> cast(attrs, [:proposal_part_id, :type, :instruction_data, :description_data, :enacted_at])
    |> validate_required([:proposal_part_id, :type, :instruction_data])
    |> validate_inclusion(:type, @valid_types)
    # TODO: Validate the *_data blobs given this type:
    # - The shape of the data blobs matches pattern for this type
    # - (if not enacted) all key references are valid & allowed
  end

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
