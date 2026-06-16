package com.flutter.tv

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.flutter.tv.ui.GameScreen
import com.flutter.tv.ui.theme.FlutterTvTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d("FlutterTV", "MainActivity.onCreate BUILD 2")
        setContent {
            FlutterTvTheme {
                GameScreen()
            }
        }
    }
}
