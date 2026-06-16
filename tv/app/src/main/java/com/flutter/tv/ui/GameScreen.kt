package com.flutter.tv.ui

import android.util.Log
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flutter.tv.GameStateHolder
import com.flutter.tv.model.TurnState
import com.flutter.tv.ui.theme.FlutterTvTheme
import com.google.gson.Gson
import com.microsoft.signalr.HubConnectionBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext

private const val TAG = "FlutterTV"

private val gameStateHolder = GameStateHolder()

@Composable
fun GameScreen() {
    val state by gameStateHolder.state.collectAsState()
    var effectBanner by remember { mutableStateOf("") }
    var effectCompany by remember { mutableStateOf("") }
    var showCard by remember { mutableStateOf(false) }
    var showDice by remember { mutableStateOf(false) }
    var diceColour by remember { mutableIntStateOf(0) }
    var diceNumber by remember { mutableIntStateOf(1) }
    var pendingState by remember { mutableStateOf<TurnState?>(null) }
    var pendingEffect by remember { mutableStateOf(false) }

    // When card shows, wait 2.5s then fade out and apply pending state
    LaunchedEffect(showCard) {
        if (showCard) {
            delay(2500)
            showCard = false
            pendingState?.let { gameStateHolder.update(it) }
            pendingState = null
        }
    }

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
                if (showDice || showCard) {
                    pendingState = parsed
                } else {
                    gameStateHolder.update(parsed)
                }
            }, Any::class.java)

            connection.on("DiceRolled", { p1: Any, p2: Any, p3: Any, p4: Any, p5: Any ->
                val effectType = p3.toString()
                val cardText = p4.toString()
                val company = p5.toString()
                Log.d(TAG, "DiceRolled: colour=$p1, number=$p2, effect=$effectType, card=$cardText, company=$company")

                // Show dice animation
                diceColour = (p1 as? Double)?.toInt() ?: p1.toString().toDoubleOrNull()?.toInt() ?: 0
                diceNumber = (p2 as? Double)?.toInt() ?: p2.toString().toDoubleOrNull()?.toInt() ?: 1
                showDice = true

                val banner = when (effectType) {
                    "Slump" -> "📉 SLUMP! Dropped back 6"
                    "AntiSlump" -> "🛡️ Anti-Slump! Protected"
                    "MarketNews" -> cardText
                    else -> ""
                }
                if (banner.isNotEmpty()) {
                    effectBanner = banner
                    effectCompany = company
                    pendingEffect = true
                } else {
                    effectBanner = ""
                    effectCompany = ""
                    pendingEffect = false
                }
            }, Any::class.java, Any::class.java, Any::class.java, Any::class.java, Any::class.java)

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

        // Anti-slump badges — bottom left
        val antiSlumpCompanies = state.companies.filter { it.hasAntiSlump }
        if (antiSlumpCompanies.isNotEmpty()) {
            val companyNames = listOf("Saudi Aramco", "ExxonMobil", "Shell", "Chevron", "TotalEnergies", "BP")
            Box(
                modifier = Modifier.fillMaxSize().padding(12.dp),
                contentAlignment = Alignment.BottomStart
            ) {
                Column {
                    antiSlumpCompanies.forEach { c ->
                        Text(
                            text = "🛡️ ${companyNames[c.indexInt]}",
                            color = Color(0xFF90EE90),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }

        // Dice roll overlay
        if (showDice) {
            Box(
                modifier = Modifier.fillMaxSize().padding(end = 80.dp, top = 200.dp),
                contentAlignment = Alignment.CenterEnd
            ) {
                DiceRoll(
                    colourResult = diceColour,
                    numberResult = diceNumber,
                    onFinished = {
                        showDice = false
                        if (pendingEffect) {
                            showCard = true
                            pendingEffect = false
                        } else {
                            pendingState?.let { gameStateHolder.update(it) }
                            pendingState = null
                        }
                    }
                )
            }
        }

        // Market News / Effect card overlay
        AnimatedVisibility(
            visible = showCard,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .width(380.dp)
                        .shadow(8.dp, RoundedCornerShape(16.dp))
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFFF5F0E8))
                        .border(2.dp, Color(0xFFffd700), RoundedCornerShape(16.dp))
                        .padding(20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "MARKET NEWS",
                            color = Color(0xFFffd700),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = effectCompany,
                            color = Color.DarkGray,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = effectBanner,
                            color = Color.Black,
                            fontSize = 18.sp,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
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
