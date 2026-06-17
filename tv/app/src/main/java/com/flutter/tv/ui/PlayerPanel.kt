package com.flutter.tv.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flutter.tv.R
import com.flutter.tv.model.PlayerState

private val companyNames = listOf("Aramco", "Exxon", "Shell", "Chevron", "Esso", "BP")

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

private val avatarResources = listOf(
    R.drawable.avatar_0, R.drawable.avatar_1, R.drawable.avatar_2,
    R.drawable.avatar_3, R.drawable.avatar_4, R.drawable.avatar_5,
    R.drawable.avatar_6, R.drawable.avatar_7, R.drawable.avatar_8,
)

@Composable
fun PlayerCard(player: PlayerState, isCurrent: Boolean) {
    val borderColor = if (isCurrent) Color(0xFF4CAF50) else Color(0xFFc9a96e)
    val glowElevation = if (isCurrent) {
        val inf = rememberInfiniteTransition(label = "glow")
        val dp by inf.animateFloat(
            initialValue = 4f, targetValue = 16f,
            animationSpec = infiniteRepeatable(tween(1000), RepeatMode.Reverse),
            label = "glowDp"
        )
        dp.dp
    } else 0.dp

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(glowElevation, RoundedCornerShape(8.dp), ambientColor = Color(0xFF4CAF50), spotColor = Color(0xFF4CAF50))
            .border(2.dp, borderColor, RoundedCornerShape(8.dp))
            .background(Color(0xFFE8E0CC), RoundedCornerShape(8.dp))
            .padding(12.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Image(
                painter = painterResource(avatarResources[player.avatarInt.coerceIn(0, 8)]),
                contentDescription = null,
                modifier = Modifier.size(32.dp).clip(CircleShape)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = player.name,
                color = Color(0xFF2c1810),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "£${player.cashInt / 100}",
            color = Color(0xFF2e7d32),
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold
        )
        // Holdings
        player.holdingsInt.forEachIndexed { i, qty ->
            if (qty > 0) {
                Text(
                    text = "${companyNames[i]}: $qty",
                    color = Color(0xFF4a3728),
                    fontSize = 11.sp
                )
            }
        }
    }
}
