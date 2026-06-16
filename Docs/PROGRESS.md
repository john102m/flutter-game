# Flutter — Progress Log

## 2026-06-16 Session

### Completed

**Server (Phase 1 + 2):**
- Game state models: `GameState`, `Player`, `Company`, `GamePhase` enum
- `GameService` singleton: CreateGame (4-digit code), JoinGame, StartGame
- Buy/sell logic: validates turn, cash, holdings. £5 brokerage on buy, free to sell
- Dice roll: colour die (company 0–5) + number die (1–6), moves traveller up
- Turn advancement after roll
- `BroadcastTurnState` sends full state to all clients after every action
- `GetState` hub method — allows clients to request current state on connect/reconnect

**Server (Phase 3 — Board Effects):**
- SLUMP: rows 3/6 drop traveller back 6 (capped at parent peg row)
- Anti-slump insurance: cancels SLUMP once then expires
- Market News (row 11): draws from shuffled 24-card deck (22 news + 2 insurance)
- Card effects: traveller advance/down/return to parent, parent peg up/down, dividend payout, anti-slump grant
- `DiceRolled` event now sends effect type, card text, and company name to clients
- Dividend payout: % of share price × certs held, paid to all holders

**Handset (Phase 1 + 2):**
- Proper folder structure: `hooks/`, `components/`, thin `App.tsx` router
- `useConnection` hook for SignalR setup
- `ConnectScreen` — enter name, create game or join with code
- `LobbyScreen` — shows game code, player list, start button (host only)
- `GameScreen` — turn indicator, cash display, company list with buy/sell buttons, roll dice button, last roll result
- Board effect display: coloured text for SLUMP/AntiSlump/MarketNews after each roll
- Tailwind 4 + `@tailwindcss/vite` plugin

**TV (Phase 5):**
- Board grid rendering: 31 rows, 6 coloured company columns, peg holes
- Parent pegs (18dp) and traveller pegs (12dp) as coloured circles with white border
- Player panel: name, cash, holdings, current player green border highlight
- SignalR connection receives `TurnState` and `DiceRolled` events
- Gson deserialization of dynamic SignalR payloads (fields arrive as Double, converted to Int)
- `GetState` called on connect for mid-game recovery
- Animated dice roll: two squircles (colour + number) spin then land on result
- Market News card overlay: off-white card, gold border, drop shadow, company name + card text
- Animation sequencing: dice spin → card (if effect) → peg animation
- TurnState buffered during animations, applied after card fades out
- Anti-slump badge: persistent green indicator bottom-left when company has protection

---

### Known Issues

**TV recomposition (RESOLVED):**
- Was an emulator issue — restarting the emulator fixed it. Animations and state updates working.
- **Note:** If this recurs, restart the emulator first. Do NOT make frantic code changes chasing it.

**Emulator resize:**
- Resizing the emulator window kills the render connection. Avoid resizing mid-session.

**Dividend player swap (UNVERIFIED):**
- Possible issue: player 2 got player 1's dividend and vice versa. Needs investigation.

**Debug dice active:**
- `GameService.RollDice` hardcoded: always Saudi Aramco (company 0), always rolls 1. Revert before real play.

**Android Studio deploy deception:**
- Compile errors do NOT prevent deployment — AS deploys the previously cached APK
- Always verify build succeeded before assuming deploy is current code

**SignalR StrictMode double-mount:**
- React StrictMode causes connect → disconnect → reconnect on mount (dev-only noise)

**Gson Double serialization:**
- SignalR Java client delivers untyped JSON numbers as `Double`
- Data classes use `Double` fields with `.toInt()` accessors

---

### What's Next

1. **Round end** — trigger when traveller hits row 2, dividend processing, parent peg movement, traveller reset
2. **Win condition** — £600+ total capital check during dividends
3. **Revert debug dice** — restore random rolls before real play testing
4. **Investigate dividend player swap** — verify correct player receives payout

---

*Updated: 2026-06-16*
