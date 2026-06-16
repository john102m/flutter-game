# Flutter — TV Stock Exchange Game

## Concept

Digital adaptation of "Flutter," a classic board game simulating a stock exchange with 6 oil companies. The TV displays the shared game board; players interact via their phones.

## Game Rules (confirmed from 1966 J.W. Spear & Sons pamphlet)

*Full rules: [GAME-RULES.md](GAME-RULES.md) | Board: [BOARD-LAYOUT.md](BOARD-LAYOUT.md) | Cards: [GAME-CARDS.md](GAME-CARDS.md)*

- 6 oil companies (Saudi Aramco, ExxonMobil, Shell, Chevron, TotalEnergies, BP), each starting at £100 PAR
- Each company has a **parent peg** (share price, rows 12–32) and a **traveller peg** (moves through action zone, rows 2–11)
- 32-row board: action zone at top (dividends/slump/market news), price zone below (£10–£200)
- **Two dice:** colour die (picks company), numbered die (moves that company's traveller UP)
- **Buy/sell:** ONLY immediately before your dice throw. £5 brokerage to buy, free to sell. 100-share certificates only.
- **Round end:** when ANY traveller reaches/passes the top of the board
  - ALL companies assessed: dividend paid based on traveller position, parent peg moved up/down
  - Travellers return to their parent pegs, Market News cards reshuffled
- **Market News cards** — 22 event cards + 2 anti-slump insurance cards
- **Slump:** traveller drops back 6 spaces
- **Bonus shares:** parent peg hits £200 → 1-for-1 bonus issue, parent returns to PAR 100
- **Bankruptcy:** parent peg hits bottom → company removed from game
- **Win condition:** first player to reach £600 total capital (cash + shares at market price), claimable only during dividend processing
- **Players:** 3–10 (broker role handled by server)

## Architecture

```
┌─────────────────────────────────────┐
│           TV (Board Display)         │
│   Jetpack Compose for TV (Kotlin)   │
│   - Share price tracks              │
│   - Traveller peg positions         │
│   - Market news announcements       │
│   - Round results / animations      │
└──────────────────┬──────────────────┘
                   │ SignalR (WebSocket)
                   │
┌──────────────────┴──────────────────┐
│            Game Server               │
│         .NET 8 + SignalR             │
│   - Game state management           │
│   - Turn logic / dice rolls         │
│   - Buy/sell validation             │
│   - Market news card deck           │
│   - Round resolution                │
└──────────────────┬──────────────────┘
                   │ SignalR (WebSocket)
                   │
┌──────────────────┴──────────────────┐
│         Handsets (Players)           │
│        React (Web App)              │
│   - Portfolio view                  │
│   - Buy/sell controls               │
│   - Dice roll trigger               │
│   - Turn notifications              │
│   - Join game / lobby               │
└─────────────────────────────────────┘
```

## Tech Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| TV display | Jetpack Compose for TV (Kotlin) | Android TV app via Android Studio. Requires Android TV stick (not Roku). Alternatively Roact if sticking with Roku hardware. |
| Server | .NET 8 + SignalR | Real-time game state broadcast to TV + all handsets |
| Handsets | React (web app) | Mobile-first. No native app install needed initially. |
| Hosting | TBD | Local network for same-room play? Cloud for remote? |

## Hardware Comparison

| | Roku Stick | Fire TV Stick | Chromecast w/ Google TV |
|--|-----------|---------------|------------------------|
| **OS** | Roku OS (proprietary) | Fire OS (Android fork) | Android TV |
| **Dev language** | BrightScript + SceneGraph XML | Kotlin/Java (Android) | Kotlin/Java (Android) |
| **UI framework** | Roact (React-like) or raw SceneGraph | Jetpack Compose for TV | Jetpack Compose for TV |
| **Sideload** | Dev mode → upload .zip via LAN | ADB over WiFi/USB | ADB over WiFi/USB |
| **WebSocket** | Community lib (BrightWebSocket) | Native OkHttp / SignalR client | Native OkHttp / SignalR client |
| **Graphics** | Designed for streaming UIs, not games | Full Android Canvas + Compose | Full Android Canvas + Compose |
| **Debugging** | Telnet console (primitive) | Android Studio debugger, Logcat | Android Studio debugger, Logcat |
| **Price (UK)** | ~£30 (already owned) | ~£35 (HD) / £45 (4K) | ~£30 (HD) / £60 (4K) |
| **Portfolio value** | Niche/obscure | Kotlin + Compose (transferable) | Kotlin + Compose (transferable) |

**Recommendation:** Fire TV Stick HD or Chromecast with Google TV. Both run Android, both support Jetpack Compose for TV, both sideload via ADB from Android Studio. The Fire TV Stick HD is the cheapest option and widely available. The Roku can be repurposed for streaming.

### Where to buy (UK)

- **Amazon Fire TV Stick HD (2024)** — ~£35: [Currys](https://www.currys.co.uk/products/amazon-fire-tv-stick-hd-with-alexa-voice-remote-2024-10272322.html) | [Amazon](https://www.amazon.co.uk/fire-tv-stick-hd/dp/B0BTFKGV2J)
- **Chromecast with Google TV (HD)** — ~£30: [Argos](https://www.argos.co.uk) | [Currys](https://www.currys.co.uk)

Either works. Fire TV is probably marginally easier since Amazon's developer docs for sideloading are well-trodden.

## Player Experience

1. TV shows lobby screen with game code/QR
2. Players join on phone (web app, enter code or scan QR)
3. Game starts — TV shows the board (6 tracks, share prices, traveller positions)
4. On your turn: phone prompts you to buy/sell, THEN roll dice
5. Dice result shown on TV with animation (traveller moves up)
6. If traveller lands on Market News → card drawn, displayed on TV, effect applied
7. If traveller lands on Slump → drops back 6 (unless anti-slump card held)
8. Round ends when any traveller hits the top — TV shows dividend processing for all companies
9. Parent pegs move, travellers reset — new round begins
10. Game ends when a player claims £600+ total capital during dividend processing

## Open Questions

- [x] ~~Roku vs Android TV stick~~ — **Amazon Fire TV Stick 4K Max (1st Gen, K2R2TE)** purchased
- [x] ~~Same-room only or remote play?~~ — Same room / single TV for now. Multi-room/multi-TV possible later.
- [x] ~~Server hosting~~ — Local network (LAN) during dev. May deploy to WHUK (WebHosting UK) later for remote play.
- [ ] Any rule variations / house rules to incorporate?
- [ ] Theme packs — oil-specific Market News card flavour text (future feature)

## Status

**Phase: Concept / Design**

---

*Last updated: 2026-06-15*
