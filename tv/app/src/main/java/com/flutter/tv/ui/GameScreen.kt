package com.flutter.tv.ui

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import com.flutter.tv.GameStateHolder
import com.flutter.tv.model.TurnState
import com.flutter.tv.ui.theme.FlutterTvTheme
import com.google.gson.Gson
import com.microsoft.signalr.HubConnectionBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

private const val TAG = "FlutterTV"

private val gameStateHolder = GameStateHolder()

@Composable
fun GameScreen() {
    val state by gameStateHolder.state.collectAsState()

    LaunchedEffect(Unit) {
        withContext(Dispatchers.IO) {
            val gson = Gson()
            val connection = HubConnectionBuilder
                .create("http://10.0.2.2:5000/gamehub")
                .build()

            connection.on("TurnState", { raw: Any ->
                val json = gson.toJson(raw)
                Log.d(TAG, "TurnState raw: $json")
                val parsed = gson.fromJson(json, TurnState::class.java)
                Log.d(TAG, "Parsed: player=${parsed.currentPlayer}, companies=${parsed.companies.size}")
                gameStateHolder.update(parsed)
            }, Any::class.java)

            connection.on("DiceRolled", { raw: Any ->
                Log.d(TAG, "DiceRolled: $raw")
            }, Any::class.java)

            try {
                connection.start().blockingAwait()
                Log.d(TAG, "SignalR connected")
                connection.invoke("GetState").blockingAwait()
            } catch (e: Exception) {
                Log.e(TAG, "SignalR failed", e)
            }
        }
    }

    val travellers = if (state.companies.size == 6) state.companies.map { it.travellerRow } else List(6) { 22 }
    val parents = if (state.companies.size == 6) state.companies.map { it.parentRow } else List(6) { 22 }

    Log.d(TAG, "GameScreen composing: companies=${state.companies.size}, players=${state.players.size}")

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF1a1a2e))
    ) {
        Row(modifier = Modifier.fillMaxSize()) {
            val leftPlayers = state.players.take((state.players.size + 1) / 2)
            val rightPlayers = state.players.drop((state.players.size + 1) / 2)

            PlayerPanel(
                players = leftPlayers,
                currentPlayer = state.currentPlayer,
                modifier = Modifier.weight(1f)
            )

            GameBoard(
                animatedTravellers = travellers,
                animatedParents = parents,
                modifier = Modifier.weight(2f)
            )

            PlayerPanel(
                players = rightPlayers,
                currentPlayer = state.currentPlayer,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Preview(showBackground = true, widthDp = 1920, heightDp = 1080)
@Composable
fun GameScreenPreview() {
    FlutterTvTheme {
        GameScreen()
    }
}
