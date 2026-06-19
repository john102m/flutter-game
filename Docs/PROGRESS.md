# Flutter — Progress Log

## 2026-06-19 Session — Playtest Fixes & Component Extraction

### Completed

- **SignalR reconnect resilience** — escalating retry schedule (0/1/2/5/10/30s), auto-rejoin on reconnect, reconnecting/disconnected overlay on handset
- **Persistent rejoin** — switched from `sessionStorage` to `localStorage` (flutter_ prefix). Closing browser entirely and reopening now auto-rejoins
- **Slump headlines** — new `SlumpHeadlines.cs` with 15 funny headlines (same pattern as Market News). Server sends text in BoardEffect, TV and handset display it
- **Round-end coloured arrows** — separate `secondaryText`/`secondaryColor` on overlay cards. Green ▲ for price up, red ▼ for down, body text stays black
- **Anti-slump badge position** — nudged above ticker (bottom=48dp)
- **TV Market News card text** — bumped to 18/20/22sp, body bold
- **Handset Market News ticker** — CSS keyframe scroll animation, immediate start, absolute positioned in fixed-height container
- **Layout stability** — last roll container always rendered (h-5 placeholder), no more layout shift when first roll arrives
- **AI round-end delay** — server waits for overlay cards + 3s buffer before AI takes turn after round end
- **TV ticker reset** — clears lastTrade/previousPrices/snapshotPrices on GameReset and GameRematch
- **Held shares highlight** — company row background lighter (opacity 80 vs 30) when player holds shares
- **Restart button** — moved to left side of turn indicator
- **Component extraction** — GameScreen.tsx split from 319→210 lines: extracted `DividendModal`, `CompanyRow`, `RestartModal`, shared `constants.ts`

### Files Changed

- `handset/src/hooks/useConnection.ts` — reconnect + status
- `handset/src/App.tsx` — localStorage, reconnecting overlay
- `handset/src/components/GameScreen.tsx` — refactored, uses extracted components
- `handset/src/components/DividendModal.tsx` — new
- `handset/src/components/CompanyRow.tsx` — new
- `handset/src/components/RestartModal.tsx` — new
- `handset/src/components/constants.ts` — new
- `handset/src/index.css` — ticker animation
- `server/.../Models/SlumpHeadlines.cs` — new
- `server/.../Services/GameService.cs` — slump headline in BoardEffect
- `server/.../Hubs/GameHub.cs` — AI round-end delay
- `tv/.../ui/GameScreen.kt` — badge position, card text sizes, ticker reset, coloured arrows
- `tv/.../ui/OverlayCardQueue.kt` — secondaryText/secondaryColor field

---

## 2026-06-18 Session (Evening) — AI Players, Stock Ticker & Headlines

### Completed

- **Share supply limit** — 10 certificates per company enforced in BuyShares
- **AI players (full feature)**:
  - 3 personalities: Gordon Gekko 🦈 (aggressive), Warren Buffett 🦉 (cautious), Jordan Belfort 🐺 (chaotic)
  - Server-side Option A — no extra client, GameService drives bot turns
  - Host adds via "Add AI" button in lobby, random personality assignment, max 3
  - Adaptive timing — mirrors human pace (rolling avg of last 10 turns × 0.7 × danger multiplier)
  - Session memory — tracks dividends, slumps, human trade sentiment per company; AI weights decisions accordingly
  - Personality emojis on handset (lobby + turn indicator) and TV (player panel)
  - No add/remove after game starts
- **Stock ticker (TV)** — Bloomberg-style scrolling bar at bottom of screen:
  - Company names in brand colours, prices, direction arrows (▲▼━)
  - 🔥 for companies near dividend zone, ↑ for action zone
  - Last trade flash, current leader, hottest stock (most certs held)
- **Company news headlines** — funny flavour text on Market News cards instead of dry 1966 descriptions (e.g. "Shell discovers oil in CEO's back garden")
- **Dividend cha-ching sound** — now plays during round-end overlay cards
- **Handset ticker branded** — company name shows in brand colour + bold
- **TV layout tweaks** — board padding adjusted, ticker below board not overlapping
- **Feature ideas doc** — `docs/FEATURE-IDEAS.md` with effort estimates

---

## 2026-06-18 Session (Morning) — Icons, Tick Animation & Turn Vibe

### Completed

- **TV launcher icon & banner** — vector drawable banner (320×180dp) with rising stock chart, gold dice and £ symbol on dark navy background. Adaptive launcher icon with chart/£ foreground.
- **Tick-per-row traveller animation** — peg steps one row at a time with 150ms delay, tick sound at each position. Replaced tween(600) with snap() in GameBoard. Ratchet-click feel on real TV.
- **Handset vibration on your turn** — 100ms buzz when animating finishes and it becomes your turn. Distinct from 200ms error buzz.

---

## 2026-06-17 Session (Late Evening) — Polish & UX Sync

### Completed

- **Host-only restart button** — ↺ in turn indicator, modal with "Rematch (same players)" or "Full Reset (everyone rejoins)", both host-checked on server
- **Admin reset endpoint** — `GET /admin/reset` broadcasts GameReset to all clients, LAN safety net
- **Board elevated** — Surface with 12dp rounded corners, 2dp border, 12dp shadow
- **Overlay cards beefed up** — 500dp wide, 22/24sp bold fonts, 16dp shadow, 3dp border
- **Particle sparkles on dividends** — Canvas-based gold/amber particles behind dividend overlay cards
- **Lottie confetti on victory** — fullscreen confetti loop behind game over text (lottie-compose 6.4.0)
- **Pulsing glow on active player** — green shadow 4dp↔16dp, 1s cycle on PlayerPanel
- **Phone vibration on error** — 200ms buzz via Vibration API
- **Removed handset effect modals** — no more slump/market news popups, TV is the announcement
- **Ticker synced to dice** — 3s delay before showing result, matches TV landing
- **Round end locks controls** — handset disabled until dividend modal dismissed, delay scaled to card count
- **Layout fixes** — dvh viewport, pt-5 status bar clearance, mt-auto roll button, pb-8 bottom

### Known Issues

- Lottie confetti JSON is minimal (8 particles) — swap with a proper LottieFiles animation for more impact

---

## 2026-06-17 Session (Evening) — Sounds & Polish

### In Progress

- **Sound effects on TV** — SoundPool with short .ogg clips: dice rattle, card flip, slump crash, dividend cha-ching, round end fanfare, victory
- **Further round-end testing** — verifying animation sequencing, peg visibility, handset modal timing
- **General polish** — any UX issues found during playtesting

---

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
- ~~BuyShares has no cap — physical game has 10 certificates per company.~~ **FIXED** — 10-cert cap enforced server-side.

**Dividend calculation differs from rules:**
- ~~Rules say dividends are on £100 PAR value. Server was paying percentage of market price.~~ **FIXED** — now uses PAR value.

---

### What's Next

1. ~~**Game Over screen**~~ ✓
2. ~~**Bonus shares**~~ ✓
3. ~~**Bankruptcy**~~ ✓
4. ~~**Avatars**~~ ✓
5. ~~**Sound effects**~~ ✓
6. ~~**Lottie confetti on victory**~~ ✓
7. ~~**Canvas-based particle sparkles on dividends**~~ ✓
8. ~~**Spring animations on peg movement**~~ reverted — too much
9. ~~**Gradient/glow effects on the active player**~~ ✓
10. ~~**Serve handset from .NET server**~~ ✓ — `npm run build:deploy` → wwwroot, single `dotnet run` for game night
11. **Better Lottie confetti** — replace minimal hand-crafted JSON with a proper LottieFiles animation
12. ~~**Share supply limit**~~ ✓ — 10 certificates per company enforced in BuyShares

---

*Updated: 2026-06-18*

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
