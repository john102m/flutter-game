package com.flutter.tv.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flutter.tv.model.PlayerState

private val companyNames = listOf("Aramco", "Exxon", "Shell", "Chevron", "Total", "BP")

@Composable
fun PlayerPanel(
    players: List<PlayerState>,
    currentPlayer: String,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxHeight()
            .padding(12.dp),
        verticalArrangement = Arrangement.Top
    ) {
        players.forEach { player ->
            PlayerCard(player, isCurrent = player.name == currentPlayer)
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
fun PlayerCard(player: PlayerState, isCurrent: Boolean) {
    val borderColor = if (isCurrent) Color(0xFF4CAF50) else Color.Transparent

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .border(2.dp, borderColor, RoundedCornerShape(8.dp))
            .background(Color(0xFF2a2a4e), RoundedCornerShape(8.dp))
            .padding(12.dp)
    ) {
        Text(
            text = player.name,
            color = Color.White,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "£${player.cashInt / 100}",
            color = Color(0xFF81C784),
            fontSize = 14.sp
        )
        // Holdings
        player.holdingsInt.forEachIndexed { i, qty ->
            if (qty > 0) {
                Text(
                    text = "${companyNames[i]}: $qty",
                    color = Color(0xFFB0BEC5),
                    fontSize = 11.sp
                )
            }
        }
    }
}
