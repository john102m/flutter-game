# Flutter — Plan of Action

**Goal:** Vertical slice — lobby → game start → buy/sell → dice roll → TV updates.

---

## Phase 1: Game State & Lobby (Server)

1. **Game state model** — `GameState`, `Player`, `Company` classes. Track: players, turn order, cash, portfolios, parent peg positions, traveller peg positions, round number, game phase (lobby/playing/round-end).
2. **Lobby flow** — Hub methods: `CreateGame` (returns game code), `JoinGame(code, name)`, `StartGame`. Broadcast player list updates to all connected clients.
3. **In-memory state** — single game instance for now (no persistence, no multi-game).

## Phase 2: Turn Logic (Server)

4. **Buy/sell** — Hub method: `BuyShares(company)`, `SellShares(company)`. Validate: correct player's turn, enough cash, shares available. Broadcast portfolio/price updates.
5. **Dice roll** — Hub method: `RollDice`. Server generates colour die + number die. Moves traveller peg. Broadcasts result to all clients.
6. **Board effects** — Apply Market News, Slump, and "M" landing logic. Draw from shuffled card deck. Broadcast card effect.
7. **Turn advancement** — After dice + effects resolved, move to next player. Broadcast turn change.

## Phase 3: Round End (Server)

8. **Round-end trigger** — Detect when any traveller reaches/passes the top. Halt play.
9. **Dividend processing** — Assess all 6 companies per Rule 11. Pay dividends, move parent pegs, reset travellers.
10. **Win check** — After dividends, check if any player can claim £600+.
11. **Bonus shares / Bankruptcy** — Handle parent peg hitting £200 or bottom.

## Phase 4: Handset UI (React)

12. **Lobby screen** — Enter game code + player name → join. Show player list, "Start Game" button (first player only).
13. **Game screen** — Show: your cash, your holdings (company × quantity × current price), total portfolio value.
14. **Buy/sell controls** — List companies with prices. Tap to buy (shows cost + £5 brokerage). Tap holdings to sell.
15. **Roll button** — Big button, active only on your turn after buy/sell phase. Shows result briefly.
16. **Turn indicator** — Clear "Your Turn" / "Waiting for [name]" state.

## Phase 5: TV Display (Kotlin/Compose)

17. **Live board** — Receive game state via SignalR. Render parent pegs and traveller pegs at correct row positions.
18. **Player panel** — Show real player names, cash, holdings (from server state).
19. **Dice result display** — Show which company + number rolled, animate traveller movement.
20. **Market News overlay** — When card drawn, show card text + effect on screen.
21. **Round-end summary** — Dividend table showing each company's assessment.

## Phase 6: Polish & Extras

22. **Animations** — Traveller movement, slump drop, die roll, round-end transitions.
23. **Sound effects** — Die roll, buy/sell confirm, slump, dividends.
24. **Anti-slump insurance cards** — Claimable by player, tracked per company.
25. **Edge cases** — Bankruptcy removal, bonus share issuance, insufficient certificates.
26. **QR code join** — TV lobby screen shows QR that opens handset URL with game code pre-filled.

---

## Suggested Build Order

```
Phase 1 → Phase 4 (lobby) → Phase 2 → Phase 4 (game) → Phase 5 (live board) → Phase 3 → Phase 6
```

Build server logic + handset together, get it playable with console/debug output, then bring the TV display to life with real data.

---

## What's Already Done

| Component | Status |
|-----------|--------|
| Server | SignalR hub scaffolded, CORS configured, runs on :5000 |
| Handset | React + Vite + Tailwind + SignalR client connected |
| TV | Compose app with static board layout, player panel, SignalR connection |
| Docs | Rules, board layout, cards, design, UI ideas — all documented |

## What's Not Yet Built

- All game logic (state, turns, dice, trading, rounds)
- All dynamic UI (lobby, buy/sell, portfolio, live board updates)
- Market News card deck
- Win condition / game end

---

*Created: 2026-06-15*
