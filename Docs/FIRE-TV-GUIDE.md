# Fire TV + Jetpack Compose for TV — Learning Guide

## What you're building

A Kotlin Android TV app using Jetpack Compose for TV that displays the Flutter game board. It connects to your .NET SignalR server over WebSocket and renders game state (share prices, traveller positions, market news) on the big screen.

## Prerequisites

- **Android Studio** (latest stable — Hedgehog or newer)
- **JDK 17** (bundled with Android Studio)
- **Fire TV Stick 4K Max** on the same WiFi as your dev machine
- **Kotlin** (comes with Android Studio — no separate install)

## 1. Fire TV Stick Setup

When the stick arrives:

1. Plug in, complete basic setup (WiFi, Amazon account — can be minimal)
2. **Settings → My Fire TV → Developer Options**
   - ADB Debugging → **ON**
   - Apps from Unknown Sources → **ON**
3. **Settings → My Fire TV → About → Network** — note the IP address

## 2. Connect Android Studio to Fire TV

```bash
# From terminal (Android Studio's terminal or system terminal)
adb connect <FIRE_TV_IP>:5555

# Verify
adb devices
# Should show: <IP>:5555  device
```

Once connected, the Fire TV appears as a deployment target in Android Studio's device dropdown — just like a phone.

## 3. Create Your First TV Project

In Android Studio:

1. **File → New → New Project**
2. Select **"No Activity"** (we'll set up Compose manually for TV)
3. Set:
   - Language: **Kotlin**
   - Minimum SDK: **API 21** (Fire TV supports this)
   - Build configuration language: **Kotlin DSL**

### build.gradle.kts (app level) — key dependencies:

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.yourname.flutter"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.yourname.flutter"
        minSdk = 21
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Compose for TV (not mobile material!)
    implementation("androidx.tv:tv-foundation:1.0.0-alpha10")
    implementation("androidx.tv:tv-material:1.0.0-alpha10")

    // Core Compose
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.compose.ui:ui:1.5.4")
    implementation("androidx.compose.ui:ui-tooling-preview:1.5.4")
    implementation("androidx.compose.foundation:foundation:1.5.4")

    // Lifecycle
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
}
```

### AndroidManifest.xml — TV-specific:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-feature android:name="android.software.leanback" android:required="true" />
    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Flutter"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="keyboard|keyboardHidden|navigation">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### MainActivity.kt — Hello World:

```kotlin
package com.yourname.flutter

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Text

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            FlutterBoard()
        }
    }
}

@Composable
fun FlutterBoard() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF1a1a2e)),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "Flutter — Stock Exchange",
            fontSize = 48.sp,
            color = Color.White
        )
    }
}
```

## 4. Deploy & Run

1. Select the Fire TV from the device dropdown in Android Studio
2. Click **Run** (▶️)
3. App installs and launches on your TV

That's it. You should see "Flutter — Stock Exchange" on the big screen.

## 5. Key Concepts for TV Development

| Concept | Notes |
|---------|-------|
| **Focus** | No touch — everything is D-pad/remote. Compose for TV handles focus states. |
| **tv-material** | TV-specific Material components (not `material3` from mobile) |
| **10-foot UI** | Design for viewing at distance — large text, high contrast, simple layouts |
| **No touch** | Set `android.hardware.touchscreen` required=false in manifest |
| **Leanback** | Category `LEANBACK_LAUNCHER` makes your app appear on the TV home screen |

## 6. Next Steps (after Hello World works)

1. **Canvas drawing** — render the 6 vertical tracks (share price columns)
2. **WebSocket/SignalR client** — connect to game server for state updates
3. **Animations** — traveller peg movement, price changes
4. **D-pad navigation** — not needed initially (display-only), but useful for menu/settings

## Resources

- [Compose for TV — Official docs](https://developer.android.com/training/tv/playback/compose)
- [Google Codelab — Intro to Compose for TV](https://developer.android.com/codelabs/compose-for-tv-introduction)
- [Hello World Fire TV sample (GitHub)](https://github.com/AmazonAppDev/hello-world-fire-tv)
- [Amazon — Connect ADB to Fire TV](https://developer.amazon.com/docs/fire-tv/connecting-adb-to-fire-tv.html)
- [Fire TV device specs](https://developer.amazon.com/docs/fire-tv/device-specifications-fire-tv-streaming-media-player.html)

## SignalR Client (for later)

The Microsoft SignalR client for Java/Kotlin works on Android:

```kotlin
// build.gradle.kts
implementation("com.microsoft.signalr:signalr:8.0.0")

// Usage
val hubConnection = HubConnectionBuilder
    .create("http://<SERVER_IP>:5000/gamehub")
    .build()

hubConnection.on("GameStateUpdated", { state ->
    // Update UI with new game state
}, GameState::class.java)

hubConnection.start()
```

---

*Last updated: 2026-06-13*
