# Chapter two: Erinana Island

Owner, Nov. 8, 2026: "the game ending when you leave the country is fine." Winning chapter one shows "You win" and a button, "Go on to Erinana Island."

**Story.** Your plane lands on Erinana Island, not in the country you chose. While you were flying, that country elected a new government, and it revoked your humanitarian parole. Your brother or sister has a real visa for Lusara this time, but flying out of Erinana would be seen. Bounty hunters and the international police want the reward on you.

**Same game, new outfits.** No new mechanics. The engine is unchanged; `Data.useChapter(2)` swaps the tables chapter two dresses differently, keeping chapter one's ids.

| Stop | Chapter one | Chapter two | The way on |
| --- | --- | --- | --- |
| 1 | The residence | The airstrip | The crew's van, Kofi's taxi, the fence after dark |
| 2 | Pedra Branca | Erinana town | The market bus, a scooter |
| 3 | Nova Trentô | Tamarind Cove | Silas makes a new passport; then the cliff path |
| 4 | Salta | The quay | Board with the new passport after dark, sign on as a steward, or pay the gangway officer |
| 5 | The line | Aboard the Long Horizon | Go ashore at Bahía Clara where Dario waits, or slip off on the supply boat |
| 6 | Portalba | Bahía Clara airport | Board your flight to Lusara once the ticket is booked |

- **People:** Kofi (taxi), Mama Ilse (guesthouse), Silas (forger), Marisa (purser), Dario (fixer), the gate agent. Two of them are working for the bounty hunters, as in chapter one.
- **Calls:** your flight (two steps) and Dario at the pier (one step). The visa is already issued.
- **Carried over:** your companion, whose help counts at every stop. Nothing else.
- **Wording:** entries `<id>.ch2` in the catalog and `<code>_two` in the markers replace chapter one's police lines.
- **Art:** the ship's deck is new; the other stops reuse the airfield, road, colônia and harbor scenes.

Calibration, 300 runs (`node tools/calibrate.js 300 --chapter=2`): Teresa 29.3%, Mateu 24.0%. Chapter one is unchanged (30.0%, 25.0%).
