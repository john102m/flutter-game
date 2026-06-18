# Flutter — Release & Deployment

## Public Server (WHUK)

- **URL:** https://flutter.spooch.co.uk
- **Hub endpoint:** https://flutter.spooch.co.uk/gamehub
- **Hosting:** WHUK shared hosting, FTP publish from VS2022
- **Requirements:** WebSockets enabled on IIS

### Publishing

1. Build the handset into wwwroot:
   ```bash
   cd handset
   npm run build:deploy
   ```
   This uses `.env.production` (empty `VITE_SERVER_URL`) so the handset connects via relative path `/gamehub`.

2. FTP publish from VS2022 (server project includes wwwroot static files automatically).

### Environment Files (handset)

| File | Purpose | VITE_SERVER_URL |
|------|---------|-----------------|
| `.env` | Fallback (LAN) | `http://192.168.1.177:5000` |
| `.env.development` | `npm run dev` | `http://localhost:5000` |
| `.env.production` | `npm run build:deploy` | (empty — same origin) |

---

## TV App (Android/Fire TV)

- **Package:** `com.flutter.tv`
- **SignalR URL:** `https://flutter.spooch.co.uk/gamehub` (hardcoded in `GameScreen.kt`)
- **APK location:** `tv/app/build/outputs/apk/debug/app-debug.apk`

### Building

Open `tv/` in Android Studio. Build → Make Project (or Build APK).

### Installing on Fire TV Stick

```bash
adb connect <fire-stick-ip>:5555
adb install tv/app/build/outputs/apk/debug/app-debug.apk
```

### Sharing with Others

Send them the APK. They sideload onto their Fire Stick:
```bash
adb connect <their-stick-ip>:5555
adb install app-debug.apk
```

No config needed — connects to the public server automatically.

### Switching Back to LAN (local dev/game night)

Change the URL in `tv/app/src/main/java/com/flutter/tv/ui/GameScreen.kt`:
```kotlin
.create("http://192.168.1.177:5000/gamehub")
```

---

## Handset (Phone)

Players just open https://flutter.spooch.co.uk in any phone browser. Nothing to install.

---

## Notes

- SignalR latency to Leeds is negligible for turn-based play.
- Fire TV launcher caches icons — after updates, clear with:
  ```bash
  adb -s <ip>:5555 shell pm clear com.flutter.tv
  adb -s <ip>:5555 shell pm clear com.amazon.tv.launcher
  ```
- ADB connections don't survive PC reboots — reconnect with `adb connect` after restart.
- If multiple ADB devices connected, use `adb -s <ip>:5555` to target a specific one.
