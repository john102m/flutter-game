# AI Agent Guidelines

## Project Context
Digital adaptation of the 1966 "Flutter" board game. Three-component system: .NET 8 SignalR server, React/Vite handset, Kotlin/Compose Fire TV app. All communicate via SignalR WebSockets.

## Key Principles
- Game logic lives ONLY on the server. Clients are dumb renderers/controllers.
- All monetary values in integer pence internally, displayed as £ on clients.
- Company indices 0–5 used consistently across all components.
- SignalR method names: PascalCase (e.g. `JoinGame`, `RollDice`, `GameStateUpdated`).
- Keep code minimal and clean — no unnecessary abstractions.

## Server (C#/.NET 8)
- Minimal API, no controllers. SignalR hub is the API surface.
- `GameHub.cs` stays thin — delegates to `GameService`.
- Singleton game state, no database.
- `record` types for DTOs. Plain classes for mutable state.
- Win condition checked during round-end dividends AND after Market News dividends.

## Handset (React/TypeScript/Vite/Tailwind)
- Functional components, hooks for state. No state management library.
- SignalR connection via `useConnection` hook.
- Conditional rendering by game phase — no router.
- Animation lock: controls disabled while TV animations play.
- `.env.development` for local dev, `.env.production` (empty URL) for same-origin deploy.

## TV (Kotlin/Jetpack Compose)
- Single-activity, all screens are Compose functions.
- `GameScreen` is the root — handles SignalR connection in `LaunchedEffect`.
- `OverlayCardQueue` pattern for sequenced card animations (trades, round-end, winner).
- `GameStateHolder` manages reactive state. Pending state buffered during animations.
- Gson deserializes SignalR payloads — numbers arrive as `Double`, use `.toInt()` accessors.
- Dark theme. Designed for Fire TV Stick 4K Max via ADB sideload.

## Animation Sequencing (TV)
1. Dice spin (3s) → peg tick-per-row (150ms/step) → settle pause (400ms)
2. Effect card if applicable (Market News / Slump) — 2.5s hold
3. Overlay card queue for trades / round-end results
4. Winner: pre-announcement card → pause → confetti + trumpets

## Testing
- Debug hub methods: `DebugGameOver`, `DebugBankruptcy(company)`.
- Admin reset: `GET /admin/reset`.
- Handset has debug buttons for triggering test scenarios.

## Deployment
- Public: https://flutter.spooch.co.uk (FTP publish from VS2022, handset in wwwroot)
- TV APK: sideloaded via ADB, connects to public server by default
- Local dev: server `:5000`, Vite `:3000`, TV pointed at LAN IP
