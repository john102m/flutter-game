# Architecture

## System overview
```
Phone (React) ──SignalR──▶ .NET 8 Server ◀──SignalR── Fire TV (Kotlin/Compose)
```

Three components communicate over SignalR WebSockets on a LAN.

## Component responsibilities

| Component | Path | Responsibility |
|-----------|------|----------------|
| Server | `server/Flutter.Server/` | Game state, turn logic, dice rolls, buy/sell validation, market news deck, round resolution, dividend processing. Single source of truth. |
| Handset | `handset/` | Player controller — lobby join, buy/sell UI, dice roll trigger, portfolio display. Thin client; no game logic. |
| TV | `tv/` | Shared display — board visualisation, peg positions, dice animations, market news cards, round summaries. Read-only view of server state. |

## Server structure
- `Program.cs` — ASP.NET Core minimal API setup, SignalR + CORS config, static file serving (wwwroot).
- `Hubs/GameHub.cs` — SignalR hub. All client↔server communication flows through here.
- `Services/GameService.cs` — Singleton game logic: dice, buy/sell, round end, win detection.
- `Models/` — `GameState`, `Player`, `Company`, `MarketNewsCard`, DTOs (`DiceResult`, `RoundEndResult`, etc).
- No database — all state in-memory for single-game sessions.

## Deployment
- **Public:** https://flutter.spooch.co.uk — .NET server with handset built into wwwroot. TV APK connects here.
- **Local dev:** Server on `:5000`, Vite on `:3000`, TV pointed at LAN IP.

## Communication pattern
- **Handset → Server:** Hub method invocations (e.g. `JoinGame`, `BuyShares`, `RollDice`).
- **Server → All clients:** Broadcast via `Clients.All.SendAsync` (game state updates, dice results, turn changes).
- **Server → Caller only:** `Clients.Caller.SendAsync` (validation errors, personal portfolio).
- **Server → TV only:** Group-based (`Clients.Group("tv")`) for TV-specific display events.

## SignalR hub endpoint
`/gamehub` on port 5000.

## Game phases
1. **Lobby** — players join, TV shows waiting screen.
2. **Playing** — turn-based: current player buys/sells, then rolls dice.
3. **Round End** — triggered when any traveller reaches the top. Dividend processing, parent peg movement, traveller reset.
4. **Game Over** — player claims £600+ total capital during dividend processing.
