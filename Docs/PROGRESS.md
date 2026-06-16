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

**Handset (Phase 1 + 2):**
- Proper folder structure: `hooks/`, `components/`, thin `App.tsx` router
- `useConnection` hook for SignalR setup
- `ConnectScreen` — enter name, create game or join with code
- `LobbyScreen` — shows game code, player list, start button (host only)
- `GameScreen` — turn indicator, cash display, company list with buy/sell buttons, roll dice button, last roll result
- Tailwind 4 + `@tailwindcss/vite` plugin (initial setup was missing PostCSS config)

**TV (Phase 5 — in progress):**
- Board grid rendering: 31 rows, 6 coloured company columns, peg holes
- Parent pegs (18dp) and traveller pegs (12dp) as coloured circles with white border
- Player panel: name, cash, holdings, current player green border highlight
- SignalR connection receives `TurnState` and `DiceRolled` events
- Gson deserialization of dynamic SignalR payloads (fields arrive as Double, converted to Int)
- `GetState` called on connect for mid-game recovery (TV can be restarted and pick up state)

---

### Known Issues

**TV recomposition not triggering (UNRESOLVED):**
- SignalR callback receives data correctly (confirmed via logcat)
- State writes via `scope.launch(Dispatchers.Main)` do not trigger Compose recomposition
- UI only updates when emulator window is resized (forces a re-layout)
- Attempted fixes:
  1. `mutableStateOf` with data class → no recomposition
  2. `mutableIntStateOf` per peg → no recomposition
  3. `key(stateVersion)` wrapper → no recomposition
  4. `ViewModel` + `StateFlow` + `collectAsStateWithLifecycle` → app crashed (dependency issues)
  5. `Snapshot.withMutableSnapshot` → app crashed
  6. `Handler(Looper.getMainLooper()).post` → didn't deploy (compile errors)
  7. Current: `scope.launch(Dispatchers.Main)` + `updateCount` read in composition → awaiting test
- **Root cause theory:** emulator rendering issue, or Compose recomposer not scheduling frames when state changes from SignalR thread. Needs testing on real Fire TV hardware.

**Android Studio deploy deception:**
- Compile errors do NOT prevent deployment — AS deploys the previously cached APK
- Filter logcat by app to see errors; unfiltered shows crash stacktraces
- Always verify build succeeded before assuming deploy is current code

**Tailwind 4 + Vite setup:**
- `@import "tailwindcss"` in `index.css` requires either `@tailwindcss/vite` plugin or PostCSS config
- Resolved by installing `@tailwindcss/vite` and adding to `vite.config.ts`

**SignalR StrictMode double-mount:**
- React StrictMode causes connect → disconnect → reconnect on mount
- First connection aborts during negotiation (harmless error in console)
- Second connection succeeds. Not a real bug — dev-only noise.

**Gson Double serialization:**
- SignalR Java client delivers untyped JSON numbers as `Double` (e.g. `22.0` not `22`)
- Data classes must use `Double` fields with `.toInt()` accessors
- Caused silent failures when `Int` fields received `Double` values

---

### What's Next

1. **Fix TV recomposition** — test on real hardware (Thursday) or investigate emulator frame scheduling
2. **Board effects** — SLUMP (drop back 6), Market News cards, "M" landing logic
3. **Round end** — trigger when traveller hits row 2, dividend processing, parent peg movement
4. **Win condition** — £600+ total capital check during dividends
5. **TV animations** — peg gliding (code ready, blocked by recomposition issue)

---

*Updated: 2026-06-16*
