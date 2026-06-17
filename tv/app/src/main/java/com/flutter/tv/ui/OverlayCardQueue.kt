package com.flutter.tv.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

data class OverlayCard(
    val title: String,
    val subtitle: String = "",
    val body: String,
    val borderColor: Color = Color(0xFFffd700),
    val holdMs: Long = 2000
)

@Composable
fun OverlayCardQueue(
    cards: List<OverlayCard>,
    onAllDone: () -> Unit
) {
    var currentIndex by remember { mutableIntStateOf(0) }
    var visible by remember { mutableStateOf(false) }

    LaunchedEffect(cards) {
        if (cards.isEmpty()) return@LaunchedEffect
        currentIndex = 0
        for (i in cards.indices) {
            currentIndex = i
            visible = true
            delay(cards[i].holdMs)
            visible = false
            delay(400) // fade out duration
        }
        onAllDone()
    }

    if (cards.isNotEmpty() && currentIndex < cards.size) {
        val card = cards[currentIndex]
        AnimatedVisibility(
            visible = visible,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .width(400.dp)
                        .shadow(8.dp, RoundedCornerShape(16.dp))
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFFF5F0E8))
                        .border(2.dp, card.borderColor, RoundedCornerShape(16.dp))
                        .padding(20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = card.title,
                            color = card.borderColor,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        if (card.subtitle.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = card.subtitle,
                                color = Color.DarkGray,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = card.body,
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
