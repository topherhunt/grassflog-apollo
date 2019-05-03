defmodule Grassflog.Orgs.ProposalChange do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Grassflog.Orgs

  schema "proposal_changes" do
    belongs_to :proposal, Orgs.Proposal
    field :type, :string
    field :payload, :map
    field :enacted_at, :naive_datetime
    timestamps()
  end

  @valid_types [~w(create_role update_role delete_role move_role create_acct update_acct delete_acct create_domain update_domain delete_domain)]

  # TODO: Find a way to separate the "defining" fields vs the "mutable" fields.
  # Maybe create_changeset vs. update_changeset?
  def changeset(org, attrs) do
    org
    |> cast(attrs, [:proposal_id, :type, :payload, :enacted_at])
    |> validate_required([:proposal_id, :type, :payload, :enacted_at])
    |> validate_inclusion(:type, @valid_types)
    # TODO: Validate the payload given this type:
    # - shape matches the expected shape (all req keys, no unrecognized keys)
    # - references are valid (assuming this proposal is still a draft)
    #   e.g.:
    #   - update_role.id must be self or child
  end

  # TODO: Figure out a concise, readable way to encode draft payload shape validations.
  # I think I like the "somewhat nested kw list" pattern below.
  # NOTE: Validating the payload does not mean validating the objects being changed.

  # WIP (not yet implemented):
  @payload_validation_rules [
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

  # TODO: ENACTED payload validations - rules:
  # - create_role: require id

  # TODO: Considerations for when enacting proposal changes:
  # - You can't move a role to under a role that wasn't previously a circle.

  # defp payload_valid?(changeset) do
  #   payload = get_field(changeset, :payload)

  #   case get_field(changeset, :type) do
  #     :create_role ->
  #       {:valid, nil}
  #       |> require_id_if_enacted()
  #       |> require_meta

  #       |> allow_keys(payload, [id: :req, new: :req, meta: :req])

  #     :update_role ->
  #       {:valid, nil}
  #       |> allow_keys(payload, [id: :req, old: :req, new: :req, meta: :req])
  #       |> require_keys(payload, [:id, :old, :new, :meta])
  #       |> allow_keys(payload.old, []


  #   end
  # end
end
