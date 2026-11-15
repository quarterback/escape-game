# No waiting: design, Nov. 15, 2026

## What the owner asked for

On Nov. 14, 2026 the owner said: "I would want more diversity in the design. Right now the game still gets stuck in periods where you're just waiting, and I'd never want that. I'd want the paths and rolls to be clear enough that the user always has a consequential choice, or an opportunity to wander off like an open world."

He then made four decisions:

1. **Wandering means side places.** From a stop you can detour to a nearby place that has its own small story and real costs in hours and police attention.
2. **When something is timed, the game skips to the next real decision.** "The clock in-game can just change to accommodate this. Ultimately there's no real reason for us to have to wait and sit for it."
3. **Every choice says what it costs and what it leads to.** It never gives odds.
4. **Both sides get this:** the escape and the investigator.

## Where the game waits today

In 300 bot runs of chapter one:
- **The residence:** a run starts at 2 p.m. Without a card, the only move there is the service door, which opens at 10 p.m. That is eight hours with nothing to do.
- **Salta:** a run spends 17 to 20 hours there. The freight boards from 10 at night to 5 in the morning, so the hours before it go on filler moves.
- **Portalba and Barra Velha:** a run waits there for the jet's last steps and for the night boat.

On the investigator's side, the playtest found that orders ran far past their listed hours ("Move your search to the line, 1 hr" took 15 hours). The desk's clock waited for her whole move to finish before handing control back.

## The design

### Skip to the next decision
- **One skip.** The escape side has one way to let time pass, and it names what it skips to: "Skip to 10 at night", "Skip to Duartē's answer", or "Skip ahead" when nothing is scheduled.
- **The skip stops early** for news, a call, a police stop or a new move.
- **Lying low still happens:** police attention falls while you skip.
- **Gone from the screen:** "Lie low one hour", "Wait for dark" and "Wait for an answer". The sim keeps these actions for the test bots.
- **Automatic skip.** When a stop offers nothing you can do (no move, call, answer or side place), the game skips on its own and says what it skipped to. You are never asked to press a button to sit still.

### Side places
- **Where they are.** Each stop has one or two side places nearby, in both chapters. They are listed under the moves as places you can go, each with its trip cost: the hours there and back, and whether police attention rises on the way.
- **What happens there.** A side place opens its own small story with two or three choices:
  - a card that helps a move at this stop or the next;
  - food or sleep;
  - lower police attention;
  - trust with someone;
  - a move here made easier.
- **The way back.** Every side place has a choice to head back with nothing.
- **Each side place can be visited once per run.** The hours are real, so a side place is the thing to do while you wait for the freight, and a cost you weigh when you are not waiting.
- **No new people are named in them.** Places are named like places.

### Every choice states its cost and what it leads to
- **Moves.** When you open a move, it says what happens if it works and if it fails: you move on to the next stop, you get a card, police attention rises or falls by a number, you lose more hours. It never states odds or a target.
- **Other choices.** News choices, lodging choices and side-place choices carry the same line in one sentence.

### The investigator's clock
- **The desk keeps its own clock.** An order takes exactly the hours it lists.
- **Her side may run up to one move ahead.** That happens when her move is longer than your order. Reports still arrive only when the desk's clock reaches them, so the investigator never learns anything early.
- **"Skip ahead"** already exists on the desk. It names its stop the same way the escape side's skip does.
- **Side places for the investigator:** the records office, the press club and the rail company's office. Each takes hours, may cost the minister's patience, and can give a lead, a calmer minister or an easier search.

## What this does not change
- No odds anywhere. Cards still work in the background.
- The end screen is still only the result.
- The stop screen that opens each new stop stays; it is a reading screen, not waiting.

## What was built (Nov. 15, 2026)

### The skip
- **One skip, named for what it skips to.** The escape side shows "Skip to 10 at night", "Skip to {name}'s answer" or "Skip ahead". It runs to that target and stops early for anything that needs you.
- **The skip moves on by itself.** When a stop offers no move, call, answer or side place, the game skips without being asked and says so.
- **Gone from both screens:** "1 hr wait" and "Wait until dark".

### Side places
- **17 for the escape:** 10 in chapter one and 7 in chapter two. The list is under "Places nearby" (data.js `SIDES` and `SIDES2`).
- **8 new cards,** all from `self`, so no traitor can take them back.
- **3 for the investigator,** under "Away from the desk" (data.js `GOV_SIDES`).

### Cost lines
- **Every move,** once opened, says what happens if it works and if it fails.
- **Every news, lodging, hold and side-place choice** says what it costs and leads to, in one sentence built from the rules (sim.js `leadText` and `moveLead`, gov.js `govLead`).
- **Contract test C24** checks that no cost line names odds.

### The investigator's clock
- **The desk keeps `g.hour`.** Her hidden run keeps `g.c.hour` and may be up to one move ahead.
- **Reports from her side are stamped with her hour.** They are released only when the desk's clock reaches them.
- **Contract test C25:** 556 orders each took exactly their listed hours.

### Numbers, 300 runs each

| Measure | Before | After |
|---|---|---|
| Chapter one, Teresa | 36.0% | 36.0% |
| Chapter one, Mateu | 31.3% | 31.3% |
| Chapter one with the bot visiting side places, Teresa | | 36.3% |
| Chapter one with the bot visiting side places, Mateu | | 30.0% |
| Chapter two, Teresa (every target up by one) | 75.3% | 50.3% |
| Chapter two, Mateu (every target up by one) | 59.0% | 38.3% |
| She escapes the investigator | 58.0% | 48.0% |

**Why she escapes the investigator less often:** the desk now gets every hour it is owed, where before her longer moves swallowed some of its hours.
