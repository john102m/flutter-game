package com.flutter.tv

import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.flutter.tv.ui.GameScreen
import com.flutter.tv.ui.theme.FlutterTvTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        Log.d("FlutterTV", "MainActivity.onCreate BUILD 2")
        setContent {
            FlutterTvTheme {
                GameScreen()
            }
        }
    }
}
