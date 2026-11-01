# Content patterns for Coalition and agent-authored games

Version: 0.1, October 30, 2026  
Status: Implementation specification. No validator, content loader or runtime
enforcement has been added. Existing owner requirements still apply.

## Purpose and scope

Give authoring agents a reliable way to find, change and check game content.
Players need to understand their choices without reading repeated explanations.
Agents need explicit boundaries around wording, interface behavior and game rules.

Use the existing simulation, UI and renderer. Introduce content contracts through
small migrations. This specification does not authorize a gameplay redesign,
font change or general-purpose engine rewrite.

The [source register](source-register.md) identifies the published guidance behind
each rule. Source IDs below refer to that register. Coalition adaptations are
design decisions proposed here, not claims about what those publishers require.

## Separate the responsibilities

| Responsibility | Owns | Must not decide |
| --- | --- | --- |
| Game rules | Requirements, costs, effects, time, randomness, transitions and outcome codes | Which wording signifies success or custody |
| Narrative | Speakers, descriptions, dialogue and story variants | Mechanical effects inferred from prose |
| Interface content | Labels, instructions, status wording and diagnostic templates | Independent copies of mechanical values |
| Presentation | Components, reading order, responsive placement and approved typography | Which role is entitled to hidden facts |
| Content package | Stable IDs, versions, references, dependencies and declared overrides | Arbitrary execution through text fields |

Instructional content connects rules to the interface. For example, an action
preview combines authored wording with costs and chances supplied by the rules.
One card may have narrative, instructional and mechanical fields. Classify the
fields individually instead of assigning the whole card one writing style.

## Order of authority

Follow the owner's current instructions first, then the repository's explicit
requirements. Within the proposed content policy, resolve conflicts in this order:

1. Mechanical truth and role-based information limits.
2. Approved terminology for the concept.
3. The content pattern's requirements and accessibility behavior.
4. General editorial guidance.
5. Optional tone choices.

This hierarchy adapts S4's terminology, component and general-style order. Do not
change a mechanic or reveal hidden information to satisfy a word budget. Record
the conflict and revise the presentation or request an editorial exception.

## Pattern contracts

The field names below describe the intended contract. They are not a committed
JSON format. Examples are proposed copy, not replacements already made in the game.
All checks in this section are implementation requirements still to be built.

### P01. Action label

**Player need:** Know what selecting the control will do.

Require `id`, `actionRef`, `label` and `interaction` (`inspect` or `commit`).
Use a specific action and object when needed: `Show your second passport`.
The inspection view can use `Cross border` for its commit control if that is the
actual action. Keep the relationship between the two labels clear.

S1 supports specific, consistent labels. Coalition adaptation: selecting an
approach and committing to it must be distinct operations. Check references,
interaction type and punctuation automatically; review meaning and specificity.

### P02. Navigation and headings

**Player need:** Find the relevant information and keep their place.

Require `id`, `label`, `destinationRef` for navigation and a semantic level for
headings. Use stable names such as `Phone` and `Route`. Nouns are appropriate here;
the action-label rule does not apply to every heading.

S5 and S7 inform this pattern. Coalition adaptation: instructions refer to named
panels across phone and desktop layouts. Check destinations and heading structure.
Review whether labels distinguish the destinations. Do not infer heading level
from its font or size.

### P03. Action preview

**Player need:** Understand a commitment before time advances.

Require `actionRef`, an authored explanation and bindings for the evaluated
requirements, time cost, chance and disclosed consequences. Obtain values from
the same action evaluation used by the simulation. Handle certain and impossible
outcomes explicitly. Keep unrevealed consequences outside the public preview.

S5 informs the decision support; this field set is a Coalition adaptation.
Check bindings against the current action evaluation, including modifiers and
extra failure costs. Review whether the explanation adds useful context. A test
must verify that changing a cost changes the displayed value without editing text.

### P04. Blocked action

**Player need:** Understand why an option is unavailable.

Require `actionRef`, a stable `reasonCode` and a visible explanation. Bind a
requirement or next step when one exists. Example: `Available after 22:00`.
Some blocks are permanent; do not promise that every action can be unlocked.

S1 informs accessible explanations. Coalition adaptation: an unavailable approach
may remain visible to explain possibilities. Allow inspection without committing.
Check that a reason exists and that keyboard and touch users can reach it.
Essential explanations cannot depend on hover or color alone.

### P05. Arrangement status

**Player need:** Distinguish a request, ongoing work and delivered help.

Require `arrangementRef`, `stageRef` and a declared status. When a job is pending,
bind its responsible ally, target and due time. Keep the last confirmed stage
separate from the job's target. Example: `Crew confirmed. Fuel requested; reply
due Sunday 09:00.` Show no due time when the rules supply none.

S2 and S5 inform the status presentation. Coalition adaptation: progress never
implies delivery. Check status against the job and arrangement state. Review
whether the wording overstates what the ally has accomplished.

### P06. Report and uncertain information

**Player need:** Judge a report without gaining knowledge their character lacks.

Require `reportRef`, source, observation time, receipt time and report text.
Allow separate fields for what the report supports and what remains unknown.
Store those as the role's interpretation, not omniscient annotations. Bind
locations only through the role's allowed view.

This is a Coalition-specific contract informed by S5. Test delayed and misleading
reports. Before the debrief, public fields must not expose the actual candidate
position or reveal that a report is false. A field marked `government` is not
sufficient protection if its template receives hidden state anyway.

### P07. Dialogue and decisions

**Player need:** Understand who is speaking, what they want and what can be answered.

Require `speakerRef`, text and any character variants. Decision options need a
label, `actionRef` and a consequence summary when the design discloses it.
Resolve sibling names and relationships through character data. Do not write
one sibling's name into a shared instruction.

S6 informs tone; S8 informs reusable fields. Coalition adaptation: dialogue may
be evasive or unreliable. Explicitly separate an NPC claim from confirmed state.
Check speakers, variants and option references. Review voice and whether a
shortened line still communicates the person's condition or demand.

### P08. Scene arrival and objective

**Player need:** Understand the immediate situation and what moves the journey on.

Require `sceneRef`, an arrival description and a separate objective. Arrival text
describes the situation; the objective names the local task. Continuing work
belongs in status or phone content unless it changes the immediate decision.

S5 and S8 inform the separation. Coalition adaptation: local movement and remote
coordination continue together. Check scene references and missing fields.
Review repetition, useful detail and whether the objective matches a possible exit.

### P09. Help card

**Player need:** Know what help is available and where it counts.

Require a name, source, description and bindings for reach, use conditions and
consumption rules. Generate the mechanical part from the card definition. If the
card remains in hand outside its reach, explain its current limitation.

S8 informs the repeated structure. Local authority and card reach are Coalition
decisions. Check every referenced place, tag and effect. Review whether the
description implies power the card does not have.

### P10. Action result

**Player need:** Understand what happened and what changed.

Require an event or outcome code. Allow a narrative response and a separate
summary of disclosed state changes. Bind time lost, police attention changes and gained
or spent cards from resolved events. Expected game failure uses this pattern.

S2 informs message purpose. Coalition adaptation: a failed roll can advance the
story and is not a software error. Check event bindings and outcome codes.
Review whether the story explains the result without repeating every number.

### P11. Technical failure

**Player need:** Recover from a problem with the application.

Require an error code, plain explanation and a recovery action when one is
available. `Your browser could not save this run` must only appear after an actual
save failure. Do not invent a cause. Keep internal debugging details out of the
player message; retain them in appropriate diagnostics.

S3 informs this pattern. Coalition adaptation: distinguish storage, loading and
installation failures from fictional refusals. Check error and recovery
references. Review whether the recovery action is possible in that environment.

### P12. Empty state

**Player need:** Understand whether a panel is empty, loading or unavailable.

Require a state code and short explanation. Add a next action only if it helps.
`No messages waiting` is sufficient for an idle inbox. It must not conceal a
loading failure or unread messages.

S2 informs this pattern. Check state predicates. Review whether the panel needs
an explanation or whether one would repeat surrounding instructions.

### P13. Tutorial step

**Player need:** Complete the next learning task without losing control of the run.

Require a step ID, learning goal, body, referenced controls and a completion
condition. Reuse current control labels. References must resolve in the active
layout, including controls inside phone tabs. Describe one immediate task per
action step; use separate informational steps where needed.

S7 informs layout-independent instructions; S10 informs comprehension testing.
The scripted progression is Coalition-specific. Check references and run the
existing tutorial harness. Browser checks must verify that the learner can
reach the highlighted control. Review whether they can explain the rule afterward.

### P14. Ending and debrief

**Player need:** Know how the run ended and how earlier decisions contributed.

Require an explicit outcome code, final-state bindings and a disclosure phase.
Distinguish escape, custody and expiry without custody. Reveal the actual route
only at the permitted debrief phase. Narrative can vary without changing the code.

S2 informs outcome messaging. The distinctions and disclosure rules are
Coalition-specific. Test every ending. Never classify an outcome by matching a
word in its prose. Review whether the debrief accurately explains the run.

## Cross-pattern rules and enforcement

`Fail` below means a future deterministic build check. `Warn` needs a review
decision. `Browser` means a rendered interaction check. None is implemented by
this document. Preserve these IDs in diagnostics so agents can find the rule.

| Rule ID | Requirement | Basis | Check |
| --- | --- | --- | --- |
| C01 | Each player-facing field has a stable ID and declared pattern | Adaptation of S8 | Fail on missing or duplicate IDs |
| C02 | References and template arguments resolve with the declared types | Local integrity requirement | Fail on unknown references or missing arguments |
| C03 | Costs, chances and status facts come from evaluated game data | Local integrity requirement | Fail in contract tests; compare public preview with commitment evaluation |
| C04 | Role and phase control the facts available to templates | Owner requirement | Fail on prohibited bindings; test role views with contrasting hidden states |
| C05 | Use an approved concept term consistently within its declared scope | Adaptation of S4 | Fail on exact prohibited aliases; warn on ambiguous usage |
| C06 | Action labels use sentence case and omit terminal sentence punctuation | Adaptation of S1 | Warn on case with proper-name exceptions; fail on configured terminal punctuation |
| C07 | Blocked controls expose their reason without hover | Adaptation of S1 | Fail on missing reason; browser keyboard and touch check |
| C08 | Instructions name controls rather than screen positions | Adaptation of S7 | Warn on directional phrases; review context |
| C09 | Preserve approved type roles and readable text | Owner requirement | Check component mapping; browser check at phone and desktop sizes |
| C10 | Text fields cannot inject arbitrary HTML or executable code | Local package boundary | Fail on unsupported markup; escape values; use approved structured emphasis |
| C11 | Exact prohibited phrases and exceptions have declared scope | Owner policy, reviewed with S11 | Fail only for configured matches; exclude IDs, URLs and quoted discussion |
| C12 | Every new player-facing string enters through a declared pattern | Local coverage requirement | Parse active JavaScript and HTML; fail on unclassified output, with explicit technical-string exceptions |
| C13 | Repetition, tone and clarity receive editorial review | S6, S9 and S11 | Warn or review; no claim of automated authorship detection |
| C14 | Text-only changes preserve simulation behavior | Local regression requirement | Compare seeded state and event codes while excluding text payloads |
| C15 | An override declares its target, package version and allowed scope | Proposed package boundary | Fail on unknown targets or incompatible versions; never silently discard saved state |

### Length and terminology policy

Use sentence case, American spelling and the established names. Preserve macrons.
The existing font and copy instructions remain authoritative.

Start with advisory budgets of six words for action labels, two sentences for
arrivals and one immediate instruction per tutorial action step. These are
proposed Coalition budgets, not vendor standards. Longer names and essential
requirements need room. Test rendered content before making a budget a hard limit.

Do not enforce an adjective quota or use a global ban on all punctuation.
Narrative may use past tense, dialogue may contain fragments and navigation may
use nouns. Apply rules by pattern and context.

Build a concept glossary before enabling C05. Suggested initial concepts include
the jet, entry visa, welcome in Esmeralda, police attention (the `exposure` variable) and inquiry. A glossary entry needs a
concept ID, approved forms, scope and prohibited aliases. An NPC may use a colloquial
term that system instructions avoid; record that exception explicitly.

### Diagnostics and exceptions

A validator response needs `ruleId`, severity, file, content ID, field path,
expected condition and observed value. Add a useful repair hint, such as
`Bind hours to action.hours; do not store a second numeric cost`.

An editorial exception needs the rule ID, content ID, rationale and review
condition. Policy changes belong in a separate, visible diff from the content
that triggered them. Agents must not weaken a rule merely to make their edit pass.
Structural integrity and hidden-information boundaries cannot be waived through
an editorial exception. Owner-authorized rule changes require their own checks.

## Implementation against the current structure

At the inspected commit, `src/data.js` contains both text and mechanics.
`src/sim.js` contains arrival messages and option handlers; `src/gov.js` contains
role views, reports and the debrief. `src/ui.js` contains interface text and
game-specific labels. `tools/build.py` embeds those files and has no content check.
The debrief currently detects custody with a wording match. These observations
identify migration work; they do not authorize changes to the other agent's work.

1. Inventory active output fields and assign patterns. Record technical-string
   exceptions. Use parser-based extraction rather than searching all quoted text.
2. Add the glossary, policy and validator with invalid fixtures. Introduce the
   interface catalog through P01, P02, P04 and P12. Keep existing public APIs.
3. Replace prose-dependent outcomes with explicit codes. Move narrative through
   P07, P08 and P14 while leaving effects in the simulation initially.
4. Bind P03, P05, P09 and P10 to evaluated rules and events. Do not maintain
   parallel descriptions of costs or promised stages.
5. Enforce role views for P06, then complete P11 and P13. Add content validation
   before the HTML build and require the same check in CI. Repository branch
   protection, if desired, needs a separate settings change.
6. Trial a second package before extracting reusable tooling. Version the content
   contract and save compatibility. Reject incompatible packages clearly.

A coding agent can still change the validator or runtime. Required checks,
visible policy diffs and human review provide additional control. Do not claim
that a schema alone prevents every future agent from bypassing the rules.

## Acceptance evidence and article record

| Demonstration | Evidence to retain |
| --- | --- |
| Invalid content is rejected | Fixtures for missing IDs, wrong types, unknown references, missing variants and prohibited bindings; exact diagnostics |
| Displayed facts follow mechanics | A cost change updates its preview; pending work does not display as delivered |
| Narrative edits preserve rules | Same seed and actions produce identical state, rolls and outcome codes after text changes |
| Hidden information stays hidden | Government view tests and browser review across delayed, true and misleading reports |
| Patterns work across layouts | Phone and desktop checks for wrapping, headings, focus, reasons and accessible names |
| Players understand the content | Paraphrase and task observations, revisions and another test, following S10 |
| Another agent can use the contract | Bounded editing task with recorded diagnostics, repairs and any runtime edits it required |
| The structure transfers | A second package uses different names and policy without changing the UI for supported content changes |

Record counts and elapsed effort only when measured. Distinguish caught violations
from usability findings and remaining failures. Keep the baseline commit, rule
versions, accepted exceptions and failed attempts. The article can then explain
which forms of drift the implementation caught and where review was still needed.

For extraction, publish original schemas, validation code, adapters and examples
under a chosen license. Keep game fiction, balance, purchased fonts and Coalition
assets in the game. Test declared package overrides and saved runs before claiming
mod support. Coalition demonstrates a saved single-player run; shared persistent
worlds, accounts and server authority need additional contracts.
