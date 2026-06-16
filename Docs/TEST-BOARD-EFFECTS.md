# Manual Test Script — Board Effects

## Prerequisites
- Server running: `cd server/Flutter.Server && dotnet run`
- Handset running: `cd handset && npm run dev`
- Two browser tabs (two players) — create game, join, start
- Get to "Game On!" screen with turns cycling

---

## Test 7: Normal Dice Roll (no effect)

1. Current player clicks **Roll Dice**

**Expected:**
- Colour die (0–5) and number die (1–6) shown
- Corresponding company's traveller peg moves UP by the number rolled
- Turn advances to next player
- No board effect reported

---

## Test 8: SLUMP

Requires a traveller to land on row 3 or row 6. Since dice are random, easiest to watch for it naturally or temporarily hardcode the roll.

**Expected when traveller lands on row 3 or 6:**
- Traveller drops BACK 6 rows (row increases by 6)
- Traveller cannot go below its parent peg row (capped)
- DiceResult includes `Effect.Type = "Slump"`
- TV/handset should show the traveller in its post-slump position

---

## Test 9: Market News (M = row 11)

Requires a traveller to land exactly on row 11. Travellers start on row 22 (parent), so first roll of 6 puts it to row 16, then a second roll that moves exactly to 11.

**Expected when traveller lands on row 11:**
- DiceResult includes `Effect.Type = "MarketNews"`, `Effect.CardText`, `Effect.CardId`
- Card effect is applied to THAT company:
  - TravellerAdvance → traveller moves further up
  - TravellerDown → traveller moves down (capped at parent)
  - TravellerReturnsToParent → traveller goes back to parent row
  - ParentPegUp → parent peg row decreases (price goes up)
  - ParentPegDown → parent peg row increases (price goes down)
  - Dividend → all players holding that company get paid (% × price × certs)
  - AntiSlump → company gains anti-slump protection for one round

---

## Test 10: Anti-Slump Insurance

Requires a company to have drawn an Anti-Slump card (Test 9), then that company's traveller lands on a SLUMP row.

**Expected:**
- SLUMP is cancelled — traveller stays on the SLUMP row
- DiceResult includes `Effect.Type = "AntiSlump"`
- The protection is consumed (next SLUMP on that company will apply normally)

---

## Test 11: Dividend Payout from Card

1. Player owns shares in company X
2. Company X's traveller lands on M (row 11)
3. Card drawn is a dividend card (e.g. "Special distribution of capital profits" = 30%)

**Expected:**
- Player's cash increases by: certs × share price × percent / 100
- E.g. 1 cert at £100 share price, 30% card → £30 (3000 pence) added

---

## Test 12: Card Moves Traveller Past Top

If a Market News card advances a traveller past row 2:

**Expected:**
- Traveller is capped at row 2 (cannot go above)
- This does NOT yet trigger round end (round end is a separate feature)

---

## Notes

- Board effects only trigger from the dice roll landing position. If a card moves the traveller onto another SLUMP or M row, it does NOT cascade.
- The deck reshuffles automatically when all 24 cards are drawn.
- Dividend is based on current share price (parent peg row) at time of card draw.
