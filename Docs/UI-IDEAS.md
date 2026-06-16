# Flutter — UI & Graphics Ideas

## TV Board Display

### Board Layout
- 6 vertical tracks (columns), one per oil company
- Centre column shows price/action labels (£10–£200, SLUMP, 5%, 10%, 20%, M)
- Company logos/colours at top of each column
- Parent pegs visible on price rows — bold markers showing current share price
- Traveller pegs in action zone — moving up during play

### Animations
- **Die roll:** 3D tumbling die (Compose rotation animations), lands with result
- **Traveller movement:** smooth sliding/bouncing up the track per dice throw
- **Slump:** dramatic drop-back animation (shake? red flash?)
- **Round end:** all travellers slide back to parent pegs, parent pegs shift up/down
- **Market News:** card flips onto screen with headline text and effect
- **Bankruptcy:** company column greys out / crumbles / fades
- **Bonus shares:** celebratory burst when parent hits £200, resets to PAR

### Visual Style Ideas
- Dark background (TV-friendly, less burn-in risk)
- Oil/industrial theme — dark blues, golds, metallic accents
- Company colours: distinct and readable at distance (couch viewing)
- Price text large enough to read from across the room
- Peg markers: chunky, glowing, clearly distinguishable per company

### Information Shown
- All 6 tracks with current parent peg + traveller peg positions
- Current player's turn (highlighted)
- Round number
- Market News card (when drawn)
- Scrolling ticker / log of recent actions?

---

## Handset Display

### Core Screens
- **Lobby:** enter game code / scan QR, pick display name
- **Waiting:** "waiting for game to start" with player list
- **Your turn:** buy/sell controls, then roll button
- **Not your turn:** portfolio view, watch the action
- **Round end:** dividend summary, portfolio value update

### Buy/Sell UI
- Company list with current prices
- Tap company → buy/sell buttons with cost shown
- Cash balance always visible
- Quick: single tap to buy 100, long-press or stepper for multiples?

### Portfolio View
- Holdings per company (number of certificates × current price)
- Total portfolio value (cash + shares)
- Gain/loss indicator

### Die Roll
- Big "ROLL" button when it's your turn
- Optional: animated die on phone as feedback while TV shows the main animation
- Result displayed briefly before TV takes over

### Visual Style Ideas
- Dark theme to match TV
- Card-based layout (company cards for portfolio)
- Minimal — phone is a controller, not the main display
- Touch-friendly large buttons (party game = beer in other hand)

---

## Open Ideas / TBD
- Sound effects? (die roll, slump, cha-ching for dividends)
- Colour-blind friendly company differentiation (patterns/icons not just colour)
- Landscape vs portrait on handset (portrait most natural for phones)
- QR code on TV lobby screen → phone camera → auto-join
- Spectator mode on TV (no active players, just watching AI play?)
- **OpenGL ES / GLSurfaceView** for premium effects (3D die, particles, bingo-app-style polish) — add after core game works, can coexist with Compose

---

*Last updated: 2026-06-15*
