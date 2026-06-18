# AI Player — Design Discussion

## Goal
Add one or more AI-controlled players that participate in the game autonomously. Makes the game playable with fewer humans and adds unpredictability.

## Decisions (Confirmed)

- ✅ **Server-side (Option A)** — AI is code inside GameService. No extra client/process.
- ✅ **Max 3 AI players** — host adds via lobby, at least 1 human required.
- ✅ **Fun names** — random from a themed pool (e.g. "Gordon Gekko", "Warren Buffett", "Jordan Belfort").
- ✅ **No add/remove after game starts** — lobby only.
- ✅ **Delays for feel** — pause before buy/sell and before roll to simulate thinking.

## Key Questions (Resolved)

### 1. Where does the AI logic live?
- ✅ **Option A: Server-side** — AI is just another "player" that the server drives on its turn. No extra client needed.

### 2. How many AI players?
- ✅ Max 3, added by host in lobby.

### 3. When does the AI act?
- On its turn: decide buy/sell, then roll dice
- 1–2s delays to feel natural

### 4. AI Strategy — how smart?
- ✅ **Personalities from v1** — each bot gets a personality that's just different thresholds on the same buy/sell logic.
- Aggressive (Gekko): buys often, holds everything
- Cautious (Buffett): only buys rising stocks, diversifies, sells fallers
- Random (Belfort): coin-flip decisions, chaotic

### 5. How does it appear to other players?
- ✅ **Identical to humans in all display paths** — no special rendering anywhere.
- Lobby: bot name + 🤖 in player list
- TV player panel: same layout as humans, 🤖 as avatar
- Turn indicator: "Gordon Gekko" shown as active player
- Dice/trade overlays: fire normally, TV doesn't know it's a bot
- Handset: "Waiting for Gordon Gekko..." during bot turn
- Round end / win: bot receives dividends, can win, same confetti/trumpets
- Only visual difference: 🤖 next to the name

### 6. Timing / Feel
- ✅ **Randomised delays** — 1–2s before buy/sell, 1s before roll. Slightly random to feel human.

### 7. Lobby UX
- ✅ **Random assignment (Option B)** — host taps "Add AI", server picks a random personality. No picker UI.
- Name reveals the personality. Players learn tendencies through play.

### 7. Server Implementation Sketch
```csharp
// In GameService or new AiPlayerService
public async Task ProcessAiTurn(string aiPlayerName)
{
    await Task.Delay(1500); // "thinking"
    
    // Decide buy/sell
    var decision = EvaluateMarket(aiPlayer);
    if (decision.Action == Buy)
        BuyShares(aiConnectionId, decision.Company);
    
    await Task.Delay(1000); // pause before roll
    
    RollDice(aiConnectionId);
}
```

### 8. Lobby Flow
- Host clicks "Add AI Player" in lobby (or on handset before starting)
- Server creates a Player with `IsAi = true` and a fake ConnectionId
- When game starts, server drives AI turns via a background task or timer

## Open Questions (Resolved)
- ~~Configurable difficulty?~~ No for v1. Personalities provide variety.
- ~~All humans disconnect?~~ AI turns keep ticking. Humans can rejoin.

## Next Steps
1. Agree on Option A vs B (server-side vs headless client)
2. Define v1 strategy (keep it simple)
3. Implement `IsAi` flag on Player model
4. Add "Add AI" button to lobby
5. Server-side turn driver for AI players
