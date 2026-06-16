package com.flutter.tv.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

private val COMPANY_COLOURS = listOf(
    Color(0xFF1565C0), // Saudi Aramco
    Color(0xFFE53935), // ExxonMobil
    Color(0xFF43A047), // Shell
    Color(0xFF1E88E5), // Chevron
    Color(0xFFFFD600), // TotalEnergies
    Color(0xFFFF8C00), // BP
)

private val COMPANY_NAMES = listOf(
    "Saudi\nAramco", "Exxon\nMobil", "Shell", "Chevron", "Total\nEnergies", "BP"
)

@Composable
fun DiceRoll(
    colourResult: Int,
    numberResult: Int,
    onFinished: () -> Unit
) {
    var spinning by remember { mutableStateOf(true) }
    var displayColour by remember { mutableIntStateOf(0) }
    var displayNumber by remember { mutableIntStateOf(1) }

    // Spin phase: cycle rapidly then settle
    LaunchedEffect(colourResult, numberResult) {
        spinning = true
        // Fast cycling for ~1 second
        repeat(15) { i ->
            displayColour = (0..5).random()
            displayNumber = (1..6).random()
            delay(50L + i * 5L) // gradually slow down
        }
        // Land on result
        displayColour = colourResult
        displayNumber = numberResult
        spinning = false
        delay(1500) // hold result visible
        onFinished()
    }

    val alpha by animateFloatAsState(
        targetValue = if (spinning) 1f else 1f,
        animationSpec = tween(300), label = "dice-alpha"
    )

    Row(
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.alpha(alpha)
    ) {
        // Colour die - squircle with company colour
        Box(
            modifier = Modifier
                .size(60.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(COMPANY_COLOURS[displayColour]),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = COMPANY_NAMES[displayColour],
                color = Color.White,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
        }

        Spacer(modifier = Modifier.width(16.dp))

        // Number die - squircle with number
        Box(
            modifier = Modifier
                .size(60.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(Color.White),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = displayNumber.toString(),
                color = Color.Black,
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
