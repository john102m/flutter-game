# Flutter — Digital Edition Feature Ideas

Ideas for putting our own slant on the game. Things the cardboard version couldn't do.

---

## Low Effort, High Flavour

### Live Stock Ticker (TV)
Scrolling bar along the bottom of the TV showing price changes in real-time. "Shell ▲£10 | BP ▼£20 | Aramco ━" — like Bloomberg TV. Pure cosmetic, zero game logic.

### Player Taunts
Quick-tap emoji reactions from handset that flash on TV. "😱", "💰", "📉", "🔥". Party noise, no gameplay effect.

### Company News Headlines
Instead of dry "Market News: advance 3", show a silly one-liner: "Shell discovers oil in CEO's back garden — advance 3!" Pre-written pool of ~50 headlines per effect type. Flavour only.

---

## Medium Effort, Adds Depth

### Insider Trading
Once per game, a player can peek at the top Market News card before their roll. Costs £50. Rewards paying attention to which companies are vulnerable. Adds a real decision point without changing the flow.

### Short Selling
Sell shares you don't own — profit if the price drops, lose if it rises. Settle at round end (pay the difference). Adds a whole new dimension: you can bet against companies. Risky, rewarding, thematic.

### Speed Round
Optional mode: everyone rolls simultaneously (no turns). 60-second chaotic bursts, then resolve everything at once. Party energy. Maybe as a "final round" variant when someone's close to winning.

---

## Big Swing

### Power-ups from Market News
Some cards give a one-use ability instead of moving a peg:
- "Freeze" — block one company from moving next round
- "Insider" — choose which company the next dice hits
- "Rally" — double your next dividend payout

Makes draws exciting rather than just "+2 up."

### Hidden Objectives
Each player gets a secret goal at game start:
- "Own 3+ Shell by round 4"
- "Be the first to sell at a loss"
- "Hold shares in 4+ companies simultaneously"

Bonus cash (£50–£100) if you hit it. Adds bluffing and misdirection — why is John buying BP when it's tanking? Maybe he knows something...

---

## Recommendation

**Insider Trading + Company News Headlines** would be my pick for v1 "our slant":
- Headlines give it character — people laugh, it feels alive
- Insider trading gives a real tactical decision unique to our version
- Both fit the stock market theme perfectly
- Neither breaks the core dice-driven party flow

---

## Effort Estimates

| Feature | Effort | Why |
|---------|--------|-----|
| Stock ticker (TV) | ~1hr | Just a composable reading existing state, scrolling text |
| Player taunts | ~1hr | Hub method + emoji overlay on TV, few lines each side |
| News headlines | ~2hr | String pool mapped to card effects, swap into existing display |
| Insider trading | ~2-3hr | New hub method, peek state, UI button, one-use tracking |
| Short selling | ~4hr | New trade type, settlement logic at round end, negative holdings |
| Speed round | ~5hr | Timer, parallel rolls, batch resolution — biggest rework |
| Power-ups | ~4hr | New card types, ability tracking, use-on-turn UI |
| Hidden objectives | ~3hr | Objective pool, assignment at start, check logic, reveal |

---

*Created: 2026-06-18*
