plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.flutter.tv"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.flutter.tv"
        minSdk = 28
        targetSdk = 34
        versionCode = 1
        versionName = "0.1.0"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.10"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // Compose for TV
    implementation("androidx.tv:tv-foundation:1.0.0-alpha10")
    implementation("androidx.tv:tv-material:1.0.0-alpha10")

    // Core Compose
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")

    // SignalR client
    implementation("com.microsoft.signalr:signalr:8.0.0")

    // OkHttp (required by SignalR)
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    // Gson for JSON parsing
    implementation("com.google.code.gson:gson:2.10.1")

    // Lottie for animations
    implementation("com.airbnb.android:lottie-compose:6.4.0")

    debugImplementation("androidx.compose.ui:ui-tooling")
}
