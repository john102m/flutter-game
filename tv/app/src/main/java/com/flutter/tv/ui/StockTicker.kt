package com.flutter.tv.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flutter.tv.model.CompanyState
import com.flutter.tv.model.PlayerState

private val tickerCompanyNames = listOf("ARAMCO", "EXXON", "SHELL", "CHEVRON", "ESSO", "BP")
private val separator = "  ·  "

data class TickerTrade(val playerName: String, val action: String, val company: String)

@Composable
fun StockTicker(
    companies: List<CompanyState>,
    previousPrices: List<Int>,
    players: List<PlayerState> = emptyList(),
    lastTrade: TickerTrade? = null,
    modifier: Modifier = Modifier
) {
    val density = LocalDensity.current
    var textWidthPx by remember { mutableIntStateOf(0) }
    var containerWidthPx by remember { mutableIntStateOf(0) }

    val totalScrollPx = textWidthPx + containerWidthPx
    val durationMs = (totalScrollPx * 12).coerceAtLeast(8000)

    val offset by rememberInfiniteTransition(label = "ticker").animateFloat(
        initialValue = containerWidthPx.toFloat(),
        targetValue = -textWidthPx.toFloat(),
        animationSpec = infiniteRepeatable(
            animation = tween(durationMs, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "tickerOffset"
    )

    val tickerText = buildAnnotatedString {
        // Price block for each company
        companies.forEachIndexed { i, c ->
            if (c.isBankrupt) {
                withStyle(SpanStyle(color = Color(0xFF666666))) {
                    append("${tickerCompanyNames[i]} BANKRUPT")
                }
                withStyle(SpanStyle(color = Color(0xFF666666))) { append(separator) }
                return@forEachIndexed
            }

            val price = c.price.toInt() / 100
            val prevPrice = previousPrices.getOrElse(i) { price }
            val (arrow, color) = when {
                price > prevPrice -> "▲" to Color(0xFF4CAF50)
                price < prevPrice -> "▼" to Color(0xFFEF5350)
                else -> "━" to Color(0xFF9E9E9E)
            }

            withStyle(SpanStyle(color = companyDefs[i].color, fontWeight = FontWeight.Bold)) {
                append(tickerCompanyNames[i])
            }
            append(" ")
            withStyle(SpanStyle(color = Color.White)) { append("£$price") }
            append(" ")
            withStyle(SpanStyle(color = color)) { append(arrow) }

            // Traveller hint for companies near dividend zone
            val travellerRow = c.travellerRow
            if (travellerRow <= 5) {
                append(" ")
                withStyle(SpanStyle(color = Color(0xFFFFD700))) { append("🔥") }
            } else if (travellerRow <= 8) {
                append(" ")
                withStyle(SpanStyle(color = Color(0xFFFF9800))) { append("↑") }
            }

            withStyle(SpanStyle(color = Color(0xFF666666))) { append(separator) }
        }

        // Last trade flash
        if (lastTrade != null) {
            val tradeColor = if (lastTrade.action == "buy") Color(0xFF4CAF50) else Color(0xFFFF9800)
            withStyle(SpanStyle(color = tradeColor, fontWeight = FontWeight.Bold)) {
                val verb = if (lastTrade.action == "buy") "BOUGHT" else "SOLD"
                append("${lastTrade.playerName} $verb ${lastTrade.company}")
            }
            withStyle(SpanStyle(color = Color(0xFF666666))) { append(separator) }
        }

        // Market leader
        if (players.isNotEmpty()) {
            val leader = players.maxByOrNull { p ->
                p.cashInt + p.holdingsInt.mapIndexed { idx, h ->
                    h * (companies.getOrNull(idx)?.price?.toInt() ?: 0) / 100
                }.sum()
            }
            if (leader != null) {
                withStyle(SpanStyle(color = Color(0xFFE0E0E0))) { append("LEADER: ") }
                withStyle(SpanStyle(color = Color(0xFFFFD700), fontWeight = FontWeight.Bold)) {
                    append(leader.name)
                }
                withStyle(SpanStyle(color = Color(0xFF666666))) { append(separator) }
            }
        }

        // Most traded company (highest total holdings)
        if (companies.isNotEmpty() && players.isNotEmpty()) {
            var maxHeld = 0
            var hotIdx = 0
            companies.forEachIndexed { i, _ ->
                val total = players.sumOf { it.holdingsInt.getOrElse(i) { 0 } }
                if (total > maxHeld) { maxHeld = total; hotIdx = i }
            }
            if (maxHeld > 0) {
                withStyle(SpanStyle(color = Color(0xFFE0E0E0))) { append("HOT: ") }
                withStyle(SpanStyle(color = companyDefs[hotIdx].color, fontWeight = FontWeight.Bold)) {
                    append("${tickerCompanyNames[hotIdx]} (${maxHeld} certs)")
                }
                withStyle(SpanStyle(color = Color(0xFF666666))) { append(separator) }
            }
        }
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(Color(0xCC000000))
            .padding(vertical = 4.dp)
            .onGloballyPositioned { containerWidthPx = it.size.width },
        contentAlignment = Alignment.CenterStart
    ) {
        Text(
            text = tickerText,
            fontSize = 14.sp,
            maxLines = 1,
            softWrap = false,
            modifier = Modifier
                .wrapContentWidth(unbounded = true)
                .offset(x = with(density) { offset.toDp() })
                .onGloballyPositioned { textWidthPx = it.size.width }
        )
    }
}
