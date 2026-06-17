package com.flutter.tv.model

data class CompanyState(
    val index: Double = 0.0,
    val parentPegRow: Double = 22.0,
    val travellerPegRow: Double = 22.0,
    val hasAntiSlump: Boolean = false,
    val price: Double = 10000.0
) {
    val indexInt get() = index.toInt()
    val parentRow get() = parentPegRow.toInt()
    val travellerRow get() = travellerPegRow.toInt()
}

data class PlayerState(
    val name: String = "",
    val cash: Double = 0.0,
    val holdings: List<Double> = emptyList()
) {
    val cashInt get() = cash.toInt()
    val holdingsInt get() = holdings.map { it.toInt() }
}

data class TurnState(
    val currentPlayer: String = "",
    val players: List<PlayerState> = emptyList(),
    val companies: List<CompanyState> = emptyList()
)

data class DiceResult(
    val colourDie: Int,
    val numberDie: Int
)

data class CompanyRoundResult(
    val companyIndex: Double = 0.0,
    val dividendPercent: Double = 0.0,
    val parentMove: Double = 0.0,
    val oldParentRow: Double = 0.0,
    val newParentRow: Double = 0.0
)

data class RoundEndData(
    val companies: List<CompanyRoundResult> = emptyList(),
    val winner: String? = null,
    val winnerCapital: Double = 0.0
)
