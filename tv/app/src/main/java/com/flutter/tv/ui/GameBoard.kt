package com.flutter.tv.ui

import androidx.compose.animation.core.animateIntAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flutter.tv.ui.theme.FlutterTvTheme

data class CompanyDef(val name: String, val color: Color)

val companyDefs = listOf(
    CompanyDef("Aramco", Color(0xFF1565C0)),
    CompanyDef("Exxon", Color(0xFFE53935)),
    CompanyDef("Shell", Color(0xFF43A047)),
    CompanyDef("Chevron", Color(0xFF1E88E5)),
    CompanyDef("Esso", Color(0xFFFFD600)),
    CompanyDef("BP", Color(0xFFFF8C00)),
)

data class BoardRow(val label: String, val type: RowType, val row: Int)
enum class RowType { DIVIDEND_20, DIVIDEND_10, DIVIDEND_5, SLUMP, MARKET, PRICE, BANKRUPT }

val boardRows = listOf(
    BoardRow("20%", RowType.DIVIDEND_20, 2),
    BoardRow("SLUMP", RowType.SLUMP, 3),
    BoardRow("10%", RowType.DIVIDEND_10, 4),
    BoardRow("10%", RowType.DIVIDEND_10, 5),
    BoardRow("SLUMP", RowType.SLUMP, 6),
    BoardRow("10%", RowType.DIVIDEND_10, 7),
    BoardRow("5%", RowType.DIVIDEND_5, 8),
    BoardRow("5%", RowType.DIVIDEND_5, 9),
    BoardRow("5%", RowType.DIVIDEND_5, 10),
    BoardRow("M", RowType.MARKET, 11),
    BoardRow("200", RowType.PRICE, 12),
    BoardRow("190", RowType.PRICE, 13),
    BoardRow("180", RowType.PRICE, 14),
    BoardRow("170", RowType.PRICE, 15),
    BoardRow("160", RowType.PRICE, 16),
    BoardRow("150", RowType.PRICE, 17),
    BoardRow("140", RowType.PRICE, 18),
    BoardRow("130", RowType.PRICE, 19),
    BoardRow("120", RowType.PRICE, 20),
    BoardRow("110", RowType.PRICE, 21),
    BoardRow("100", RowType.PRICE, 22),
    BoardRow("90", RowType.PRICE, 23),
    BoardRow("80", RowType.PRICE, 24),
    BoardRow("70", RowType.PRICE, 25),
    BoardRow("60", RowType.PRICE, 26),
    BoardRow("50", RowType.PRICE, 27),
    BoardRow("40", RowType.PRICE, 28),
    BoardRow("30", RowType.PRICE, 29),
    BoardRow("20", RowType.PRICE, 30),
    BoardRow("10", RowType.PRICE, 31),
    BoardRow("BNKRPT", RowType.BANKRUPT, 32),
)

@Composable
fun GameBoard(animatedTravellers: List<Int>, animatedParents: List<Int>, bankrupt: List<Boolean> = List(6) { false }, modifier: Modifier = Modifier) {
    val travellers = animatedTravellers.map { target ->
        val anim by animateIntAsState(targetValue = target, animationSpec = tween(600))
        anim
    }
    val parents = animatedParents.map { target ->
        val anim by animateIntAsState(targetValue = target, animationSpec = tween(600))
        anim
    }

    val shape = RoundedCornerShape(12.dp)
    Surface(
        modifier = modifier
            .fillMaxHeight()
            .padding(8.dp)
            .border(2.dp, Color(0xFF4A4A4A), shape),
        shape = shape,
        shadowElevation = 12.dp,
        color = Color(0xFFE0E0E0)
    ) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(8.dp)
    ) {
        Text(
            text = "FLUTTER",
            color = Color.Black,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth()
        )

        Row(modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp)) {
            Spacer(modifier = Modifier.weight(1f))
            companyDefs.forEach { company ->
                Text(
                    text = company.name,
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    maxLines = 1,
                    modifier = Modifier.weight(1f).background(
                        Color(company.color.red * 0.7f, company.color.green * 0.7f, company.color.blue * 0.7f)
                    )
                )
            }
            Spacer(modifier = Modifier.weight(1f))
        }

        boardRows.forEach { boardRow ->
            Row(
                modifier = Modifier.fillMaxWidth().weight(1f),
                verticalAlignment = Alignment.CenterVertically
            ) {
                PriceLabel(boardRow, modifier = Modifier.weight(1f))

                companyDefs.forEachIndexed { companyIndex, companyDef ->
                    val hasParent = parents[companyIndex] == boardRow.row
                    val hasTraveller = travellers[companyIndex] == boardRow.row
                    val isBankrupt = bankrupt[companyIndex]
                    val colColor = if (isBankrupt) Color(0xFF444444) else companyDef.color

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight()
                            .background(colColor.copy(alpha = if (isBankrupt) 0.3f else 0.7f)),
                        contentAlignment = Alignment.Center
                    ) {
                        if (!isBankrupt) when {
                            hasParent && hasTraveller -> {
                                Box(
                                    modifier = Modifier
                                        .size(18.dp)
                                        .background(companyDef.color, CircleShape)
                                        .border(2.dp, Color.White, CircleShape)
                                )
                            }
                            hasParent -> {
                                Box(
                                    modifier = Modifier
                                        .size(18.dp)
                                        .background(companyDef.color, CircleShape)
                                        .border(2.dp, Color.White, CircleShape)
                                )
                            }
                            hasTraveller -> {
                                Box(
                                    modifier = Modifier
                                        .size(12.dp)
                                        .background(companyDef.color, CircleShape)
                                        .border(2.dp, Color.White, CircleShape)
                                )
                            }
                            else -> {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .background(Color(0xFF424242), CircleShape)
                                )
                            }
                        }
                    }
                }

                PriceLabel(boardRow, modifier = Modifier.weight(1f))
            }
        }
    }
    }
}

@Composable
fun PriceLabel(row: BoardRow, modifier: Modifier = Modifier) {
    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Text(
            text = row.label,
            color = when (row.type) {
                RowType.DIVIDEND_20 -> Color(0xFF2E7D32)
                RowType.DIVIDEND_10 -> Color(0xFF388E3C)
                RowType.DIVIDEND_5 -> Color(0xFF43A047)
                RowType.SLUMP -> Color(0xFFC62828)
                RowType.MARKET -> Color(0xFFE65100)
                RowType.BANKRUPT -> Color(0xFFC62828)
                RowType.PRICE -> Color.Black
            },
            fontSize = 12.sp,
            lineHeight = 12.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )
    }
}

@Preview(showBackground = true, widthDp = 960, heightDp = 1080)
@Composable
fun GameBoardPreview() {
    FlutterTvTheme {
        GameBoard(
            animatedTravellers = List(6) { 22 },
            animatedParents = List(6) { 22 },
            modifier = Modifier.fillMaxSize()
        )
    }
}
