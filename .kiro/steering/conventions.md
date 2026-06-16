# Conventions

## Server (C#/.NET)
- Minimal API style — no controllers. All SignalR, no REST endpoints beyond health check.
- Hub methods are the API surface. Keep `GameHub.cs` thin — delegate to service/state classes.
- Models in `Models/` — plain C# classes, no EF annotations.
- No dependency injection overkill — singleton game state is fine for single-game.
- Use `record` types for DTOs sent over SignalR where immutability makes sense.

## Handset (React/TypeScript)
- Functional components only, hooks for state.
- Single `App.tsx` with conditional rendering by game phase (lobby/playing/roundEnd/gameOver).
- Extract components when they grow — keep files under ~100 lines.
- SignalR connection managed in a custom hook or context.
- Tailwind utility classes — no separate CSS files beyond `index.css` (Tailwind base).
- No state management library — local state + SignalR push is sufficient.

## TV (Kotlin/Compose)
- Single-activity app. All screens are Compose functions.
- `GameScreen` is the root composable — delegates to `GameBoard`, `PlayerPanel`, etc.
- SignalR connection in `LaunchedEffect` at screen level.
- Data classes for UI state. No ViewModel layer yet — add if complexity warrants it.
- Dark theme by default (TV burn-in, living room viewing).

## Cross-cutting
- Game logic lives ONLY on the server. Clients are dumb renderers/controllers.
- SignalR method names: PascalCase (e.g. `JoinGame`, `RollDice`, `GameStateUpdated`).
- All monetary values in integer pence internally, displayed as £ on clients.
- Company indices 0–5 used consistently across all components.
