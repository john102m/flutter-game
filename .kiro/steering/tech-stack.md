# Tech Stack

## Server
- **Runtime:** .NET 8, ASP.NET Core minimal API.
- **Real-time:** SignalR (WebSocket transport preferred, LongPolling fallback).
- **No database.** All game state in-memory. Single-game sessions only.
- **No authentication.** LAN party game — trust the network.
- **Project file:** `server/Flutter.Server/Flutter.Server.csproj`
- **Solution:** `server/Flutter.sln` (open in VS2022 or Rider).

## Handset
- **Framework:** React 18 with TypeScript.
- **Build:** Vite 6, dev server on port 3000 with `--host` (LAN accessible).
- **Styling:** Tailwind CSS 4.
- **SignalR client:** `@microsoft/signalr` ^8.0.0.
- **No routing library yet.** Single-page with conditional rendering by game phase.
- **Env:** `VITE_SERVER_URL` — server LAN address (defaults to `http://localhost:5000`).

## TV
- **Language:** Kotlin.
- **UI:** Jetpack Compose for TV (Material3).
- **SignalR client:** `com.microsoft.signalr` (Java/Kotlin SDK).
- **Build:** Gradle 8.5, AGP, minSdk 21, targetSdk 34.
- **Target device:** Amazon Fire TV Stick 4K Max (1st Gen, K2R2TE). Sideloaded via ADB.
- **Package:** `com.flutter.tv`

## Hardware
- Fire TV Stick on same WiFi LAN as dev machine.
- ADB over WiFi for deployment (`adb connect <ip>:5555`).
- Any phone with a browser for handset.
