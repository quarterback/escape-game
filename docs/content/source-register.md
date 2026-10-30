# Sources for the content pattern specification

Reviewed October 30, 2026. These sources inform [the specification](patterns.md).
The summaries below describe published guidance. The specification identifies
our adaptations separately. These pages can change; record the section and review
date when revising a rule. A link does not establish permission to redistribute
the publisher's examples, assets or text.

| ID | Source and section | Published guidance used here |
| --- | --- | --- |
| S1 | [Atlassian: Button](https://atlassian.design/components/button/usage), Content guidelines and Accessibility | Use specific action labels, sentence case and consistent wording. Explain unavailable actions accessibly. Essential information should not depend on a tooltip. |
| S2 | [Atlassian: Designing messages](https://atlassian.design/foundations/content/designing-messages), Choose a message type and Select the right component | Match message purpose to presentation. Information, warnings, errors and confirmations have different jobs. |
| S3 | [Atlassian: Error messages](https://atlassian.design/foundations/content/designing-messages/error-messages), Writing best practices | Explain the problem and how to proceed. Avoid repeating the title or inventing an unknown cause. |
| S4 | [GitLab Pajamas: How to write UI text](https://design.gitlab.com/content/ui-text/), Consistency and Terminology | Consult the word list, component guidance and general style guidance in that order. Search existing usage before inventing a term. |
| S5 | [Microsoft Fluent 2: Content design](https://fluent2.microsoft.design/content-design), Designing content and Writing content | Begin with the audience and task. Give enough information to make a decision. Keep navigation factual and use direct, familiar language. |
| S6 | [Mailchimp: Voice and tone](https://styleguide.mailchimp.com/voice-and-tone/), Tone | Voice stays relatively consistent while tone responds to the situation. Clarity takes priority over entertainment. |
| S7 | [Mailchimp: Writing for accessibility](https://styleguide.mailchimp.com/writing-for-accessibility/), Guidelines | Avoid instructions that depend on screen position. Use descriptive links, meaningful structure and text that works without visual cues. |
| S8 | [Mailchimp: Creating structured content](https://styleguide.mailchimp.com/creating-structured-content/), Use a model | Identify the parts and purpose of an effective example. Reusable templates should describe the content's job beyond one instance. |
| S9 | [Digital.gov: Writing for understanding](https://digital.gov/guides/plain-language/writing), Overview | Name who acts, use direct verbs and choose tense for accuracy. Plain language depends on the intended audience. |
| S10 | [Digital.gov: Test for understanding](https://digital.gov/guides/plain-language/test), Overview and Tests to consider | Test understanding early, revise and test again. Paraphrase and usability tests answer questions automated checks cannot. |
| S11 | [Humanizer](https://github.com/blader/humanizer/blob/0ef9fe5bc3572734fd3ae6c448fe00a30cd5dcf0/SKILL.md), version 3.1.0 | Review structural repetition, inflated claims and staging while preserving supported details and the writer's voice. This is editorial guidance, not an authorship detector. |
| S12 | [Agent Experience](https://agentexperience.ax/), What is Agent Experience? | AX concerns how agents access, understand and operate systems toward user-defined goals. The specification applies this to agents authoring game content. |

## Coalition authorities

The owner's instructions, [AGENTS.md](../../AGENTS.md) and
[game direction](../game-direction.md) govern Coalition. The
[copy AAR](../aar-coalition-copy.md) and
[typography AAR](../aar-coalition-typography.md) record earlier decisions.
Current explicit owner decisions supersede older passages in those records.

The code observations in the specification use commit
[`d681db6`](https://github.com/quarterback/escape-game/commit/d681db69d85fcd0c749be047bf95463cc160cd45).
They are observations about that snapshot, not requirements to preserve every
implementation choice. No excluded material was consulted.

## Adaptations and limits

SaaS products generally help people complete work. Coalition also creates
uncertainty and setbacks on purpose. Expected game failure needs its own result
pattern; it does not automatically call for an application-error treatment.

This specification borrows the sources' methods and principles. It does not
adopt their brand personalities, component libraries or every numeric writing
limit. Proposed Coalition budgets require testing in its own interface.

For a future standalone release, retain source attribution, review redistribution
terms and write original examples. Distribute a replaceable sample policy instead
of Coalition's world, purchased fonts or character material.
