# Flutter — Progress Log

## 2026-06-17 Session

### Completed

**Fire TV Stick — Real Hardware:**
- Fire Stick 4K Max connected via ADB, app deploying and running on real TV
- Fixed SignalR URL (was `10.0.2.2` emulator alias → real LAN IP)
- Added `FLAG_KEEP_SCREEN_ON` to prevent standby mid-game
- Added `scale(0.9f)` → tuned to `0.98f` for TV overscan
- Bumped board font sizes from 8–9sp to 12sp for TV readability
- Shortened "BANKRUPT" to "BNKRPT" to fit label column

**Server (Phase 4 — Round End):**
- Round end triggers when any traveller hits row 2 (top)
- All 6 companies assessed: dividend paid to shareholders, parent peg moved per rules table
- Travellers reset to parent pegs after processing
- Market news deck reshuffled
- Win condition: £600+ total capital checked during dividend processing → GameOver phase
- `RoundEnd` event broadcast with per-company results and winner info
- Debug dice reverted to real random rolls (colour 0–5, number 1–6)
- Extracted all magic numbers into named constants

**TV — Overlay Card Queue:**
- New `OverlayCardQueue` composable: reusable fade-in/hold/fade-out card sequence
- Trade notifications: "John bought 100 Shell @ £120" (green border buy, orange sell)
- Round end sequence: intro card → per-company dividend/price result cards → winner card
- `TradeExecuted` SignalR event from server on every buy/sell
- `DiceRolled` now sends `landedRow` — TV animates traveller to trigger row before showing effect card
- Dice roll: company names hidden during spin, only shown on landing
- Short company names everywhere: Aramco, Exxon, Shell, Chevron, Total, BP

**Handset — UX Improvements:**
- Compacted layout to fit phone screen without scrolling (h-screen, tighter gaps/padding)
- Fixed-width buy/sell buttons (no layout shift)
- Sell button always present but invisible when 0 held (no reflow)
- Company rows have subtle colour tint matching board colours
- Two-line consistent layout: "Company £price" / "n held"
- Stock-ticker style last roll: "BP ▲(3)" in green, "▼ SLUMP!" in red
- Animation lock: controls disabled for 3s (5s with effect) after any dice roll
- Bottom padding for accessibility/nav bar clearance

**Handset — Session Persistence & Rejoin:**
- Player name, phase, game code persisted to `sessionStorage`
- Auto-rejoin on refresh/wake: calls `Rejoin(playerName)` on server
- Server `Rejoin` method updates connection ID for existing player
- No more landing on connect screen mid-game

---

### Known Issues

**TV overscan:**
- Using `scale(0.98f)` as workaround. Could also calibrate via Fire TV display settings.

**Animation timing (handset):**
- Lock duration is fixed (3s/5s) rather than synced to TV animations. Close enough for party game.

**SignalR StrictMode double-mount:**
- React StrictMode causes connect → disconnect → reconnect on mount (dev-only noise)

**Gson Double serialization:**
- SignalR Java client delivers untyped JSON numbers as `Double`
- Data classes use `Double` fields with `.toInt()` accessors

**No share supply limit:**
- BuyShares has no cap — physical game has 10 certificates per company. Unlikely to hit in practice but should enforce for authenticity.

**Dividend calculation differs from rules:**
- ~~Rules say dividends are on £100 PAR value. Server was paying percentage of market price.~~ **FIXED** — now uses PAR value.

---

### What's Next

1. **Game Over screen** — display winner on TV and handsets when GamePhase.GameOver
2. **Bonus shares** — parent peg hits £200 → 1-for-1 bonus, parent returns to PAR
3. **Bankruptcy** — parent peg hits bottom → company removed from game
5. **Polish** — TV board visual improvements, handset turn notifications
6. **Avatars** — selectable from a small set on connect screen, stored in player model, shown on TV player panel and handset
7. **Sound effects** — SoundPool on TV: dice rattle, card flip, slump crash, dividend cha-ching, round end fanfare, victory

---

*Updated: 2026-06-17*

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

**Dividend player swap (NOT A BUG):**
- Investigated — payouts are correct. No issue.

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

---

*Updated: 2026-06-16*
