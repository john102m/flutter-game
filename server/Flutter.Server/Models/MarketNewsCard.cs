namespace Flutter.Server.Models;

public enum CardEffect
{
    TravellerAdvance,
    TravellerDown,
    TravellerReturnsToParent,
    ParentPegUp,
    ParentPegDown,
    Dividend,
    AntiSlump
}

public record MarketNewsCard(int Id, string Text, CardEffect Effect, int Value);
