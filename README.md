# Flutter — Stock Exchange Party Game

Digital adaptation of the 1966 J.W. Spear & Sons board game "Flutter." A TV displays the shared game board; players buy/sell shares and roll dice from their phones.

## Architecture

```
Phone (React) ──SignalR──▶ .NET 8 Server ◀──SignalR── Fire TV (Kotlin/Compose)
```

- **server/** — .NET 8 + SignalR game server (open in VS2022)
- **handset/** — React + Vite + Tailwind player app (open in VSCode)
- **tv/** — Kotlin + Jetpack Compose for TV display (open in Android Studio)
- **docs/** — Design docs, rules, board layout, card deck

## Quick Start

### Server
```bash
cd server/Flutter.Server
dotnet run
```
Runs on `http://0.0.0.0:5000` — SignalR hub at `/gamehub`.

### Handset
```bash
cd handset
npm install
npm run dev
```
Runs on `http://localhost:3000` (exposed on LAN via `--host`).

Set `VITE_SERVER_URL` to your server's LAN IP if not running on the same machine.

### TV
Open `tv/` in Android Studio. Deploy to Fire TV Stick via ADB:
```bash
adb connect <fire-stick-ip>:5555
```

## Hardware

- **TV:** Amazon Fire TV Stick 4K Max (1st Gen, K2R2TE)
- **Handsets:** Any phone with a browser
- **Server:** Dev machine on same WiFi LAN

## Docs

- [Design](docs/DESIGN.md)
- [Game Rules](docs/GAME-RULES.md)
- [Board Layout](docs/BOARD-LAYOUT.md)
- [Game Cards](docs/GAME-CARDS.md)
- [Fire TV Guide](docs/FIRE-TV-GUIDE.md)
- [Workstation Guide](docs/WORKSTATION-GUIDE.md)
