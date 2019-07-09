# Grassflog


## The goal

The goal was to design and build a proof-of-concept system that meets these criteria:

  * supports the core features of [Holacracy](https://github.com/holacracyone/Holacracy-Constitution), particularly the governance process of crafting and enacting "proposals" (executable blueprints for changing an organization's structure)
  * Use React / Apollo / GraphQL for all non-trivial UI
  * Users can craft proposals in a natural, easy-to-use UI
  * Proposals are stored in the DB in a format that's highly readable, easy to scan, easy to reason about, easy to validate (given the current structure of the org, which may have changed), easy to execute, and minimizes duplication of data
  * Once a proposal is enacted, its changes are stored in a way that's easy to summarize in human-readable terms (without reference to current org structure, which may have changed), and easy to query either starting from the originating circle / proposal (e.g. governance meeting history) or starting from the impacted record (e.g. tension drilldown)
  * Nominal test coverage

Challenges:

  * Modelling structural changes is a hard and fascinating problem. There's a "meta"-ness to it that makes it hard to come up with good mental models for.
  * This app's proposal / change solution needed to achieve 3 things:
    * a) needs to support a friendly UI for the user to craft their changes
    * b) needs to store change instructions in a format that's easy to validate and execute
    * c) needs to store changes in a way that lets you generate a human-readable summary of what you did, arbitrarily far into the future, even if the referenced objects have since disappeared (ideally with minimal duplication of records & data)
  * the trickiness of converting between "UI" state and "list of changes" state
  * client-side JS is just a terrible terrible world. I'm looking forward to experimenting with solving this same problem using Phoenix LiveView, I'd like to see what pain points go away and what new pain points arise if any
  * Absinthe is great & simple, but finnicky. Certain typos won't trigger exceptions, they'll just cause silent failures or subtle bugs. eg. if you forget the word `resolve` when defining a query field.

The stack:

  * [The universe](https://www.quora.com/What-did-Carl-Sagan-mean-when-he-said-If-you-wish-to-make-apple-pie-from-scratch-you-must-first-create-the-universe)
  * Elixir & Phoenix
  * GraphQL & Absinthe
  * React & Apollo
  * Heroku. Yes it's 2019 and I'm still happy with Heroku.

The approach I took:

  1) Design the simplest possible schema that will sturdily solve (b) and (c)
  2) Expose the simplest possible GraphQL fields to make change instructions writeable by the client.
  3) Design a UI that will let the user indicate what changes they want to make (a) (I've mostly imitated the UI of existing tools like GlassFrog and HolaSpirit)
  4) Figure out how to translate back and forth between the shape of the data in the UI (a form) and the shape of the data that needs to be sent to the server (a list of change instructions).
  5) I ended up with most of the conversion logic in the client and tried to ensure that GQL & the server only need to work with a very simple changes / instructions format.


## Architecture


### DB schema

The structural elements are mostly pulled from [Holacracy](https://github.com/holacracyone/Holacracy-Constitution), and are as follows:

  * `User`: authenticated using Auth0.
  * `Org`: an organization, ie. a container for structural content. A user can belong to many organizations.
  * `Role`: a structural unit within an organization. May be small, or may represent an entire deparment. Roles are nested. A Role that contains other Roles is also called a Circle, and has some special treatment in the UI. Organization members (ie. users) can "fill" many different roles, within one circle or across different circles.
  * `Domain`: some resource that a role has sole control over, e.g. "the Amazon AWS account". The presence of a domain means you need the owning role's permission in order to meddle in that domain.
  * `Accountability`: an ongoing obligation on a role, something the role is responsible for doing, e.g. "keeping the online inventory up-to-date". The presence of an accountability means you can expect that role (ie. the role-filler) to be taking care of that thing.

Modelling changes:

  * `Proposal`: a set of structural changes crafted and proposed by an organization member, meant to be executed as one unit. Contains one or more ProposalParts. Each Proposal is situated in the context of a Circle (Role), and per the rules of the [Holacracy governance process](https://github.com/holacracyone/Holacracy-Constitution/blob/master/Holacracy-Constitution.md#article-3-governance), may only make changes to roles within that Circle.
  * `ProposalPart`: a step in a Proposal that corresponds to one section of the proposal builder UI. Each Part has a type such as `create_role` or `update_role`, and refers to a particular resource (the "target" being changed in this part). Contains one or more ProposalChanges.
  * `ProposalChange`: a single atomistic instruction for a structural change to be made. Each Change is of a specific type (eg. `create_accountability` or `expand_role`) and each Change has `params` whose shape is dictated by the change type. Only certain ProposalChange types are valid within a given ProposalPart type.


### What happens on the client

  * There's a FormObject that mirrors the state of the UI as closely as possible. This lets the React event listeners be extremely simple, because they simply update an object in state to reflect each change, they don't need to know or care about the change instructions that the server will eventually need.
  * The FormObject is mostly encapsulated and has getters & setters with sanity checking so the React component and conversion layer don't have to care much about its internals.
  * There's a conversion layer, `ConversionLogic`, which has functions to convert back and forth between the "form object" world and the "list of changes" world. Specifically:
    * `computeChanges` takes two forms (a "pristine" one with no changes, and an updated one reflecting the current state of the UI) and figures out what change instructions will get you from form A to form B. This is the list of changes that will be persisted as the authoritative version of this proposal part.
    * `applyChanges` takes a new formObject and a list of changes, iteratively applies each change to the form, then returns the resulting form. On page reload, this lets us regenerate the latest state of the form so we know what content to render.
  * On user events (eg. writing into the "role name" field), a React handler 1) immediately updates the form object to reflect this action, then 2) queues up a debounced save to the server via Apollo mutation. The debouncer ensures that a given ProposalPart will never be sent up the wire more than once per 500ms, regardless of what the user's doing, but will always send the latest list of changes, computed from the current form object.
  * The server GraphQL endpoint accepts updates on a ProposalPart with all that part's changes serialized as JSON and upserted as a batch. The api doesn't support individual CRUD operations on ProposalChanges; the client is meant to treat the changes list as more or less an attribute of this ProposalPart.


### ProposalPart types

  * See `ProposalPart/changeset/2`.
  * This `type` field is less important and much less complex than the ProposalChange type field (see below). Part `type` is mostly used to track which UI element should be used to craft and display this proposal part. The `ProposalPart` model itself is mostly just a thin wrapper / container that groups `ProposalChanges` and gives them a little context.
  * Only certain ProposalChange `type`s are valid for each ProposalPart `type`, but there's overlap. e.g. a `create_role` part must contain a `create_role` change, and may not contain a `delete_role` change; an `update_role` part may not contain a `create_role` change.


### ProposalChange types

  * See `ProposalChange.validation_rules/0` which encodes rules that the shape of this change must follow given its `type`. Note: these rules determine whether it's valid to _store_ a ProposalChange, not whether it's valid to _execute_ that Change. There will be a separate list of rules for the latter.


### Validating and enacting proposals

  * Execution order matters.
  * Assuming you know the current db state, validating a proposal is just a matter of modelling the starting state-of-the-world, then transforming that state for each change. A conflict is detected if a certain change either can't be made bc insufficient information / nonexistent record, or fails specified validation rules.
  * Enacting a proposal should happen in a transaction. If any change can't be executed, the transaction is reverted. But if the conflict detection logic is working properly, this should never happen.

When enacting a proposal, the general order of execution is:

  * Execute each Part in the order they were created (same as the order they show up in the UI)
  * Within each Part, execute each Change ordered by a) their type, then by b) the order in which they were created. (given my proposal builder logic, this will normally be the same as simply (b), but it seems unsafe to assume that.)
  * The execution order of change types is: `create_role`, `update_role`, `expand_role`, `move_role`, `collapse_role`, `delete_role`, `create_domain`, `update_domain`, `delete_domain`, `create_acct`, `update_acct`, `delete_acct`.
