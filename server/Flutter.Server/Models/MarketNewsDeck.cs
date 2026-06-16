namespace Flutter.Server.Models;

public class MarketNewsDeck
{
    private static readonly List<MarketNewsCard> AllCards = new()
    {
        new(1, "Company receives big contract against world-wide competition", CardEffect.TravellerAdvance, 4),
        new(2, "Special distribution of capital profits", CardEffect.Dividend, 30),
        new(3, "Six-week strike at key works", CardEffect.TravellerDown, 2),
        new(4, "Strike causes heavy loss", CardEffect.TravellerReturnsToParent, 0),
        new(5, "International situation deteriorates — shares weaken", CardEffect.ParentPegDown, 1),
        new(6, "Company pays special centenary bonus", CardEffect.Dividend, 10),
        new(7, "Optimism on forthcoming budget causes favourable market reaction", CardEffect.TravellerAdvance, 4),
        new(8, "Reduction in bank rate enables firm to increase development", CardEffect.ParentPegUp, 1),
        new(9, "Large wage increase", CardEffect.TravellerDown, 6),
        new(10, "Acute labour shortage reduces production", CardEffect.TravellerReturnsToParent, 0),
        new(11, "Increase in bank rate puts curb on expansion", CardEffect.ParentPegDown, 1),
        new(12, "Company on promise of excellent trading returns pays special interim dividend", CardEffect.Dividend, 20),
        new(13, "Modernisation of plant increases productivity", CardEffect.TravellerAdvance, 7),
        new(14, "Premises and stock damaged by floods", CardEffect.TravellerDown, 2),
        new(15, "Company announces large increase in volume of sales", CardEffect.TravellerAdvance, 6),
        new(16, "Foreign competition captures many markets", CardEffect.TravellerDown, 4),
        new(17, "Premises damaged by fire — temporarily affecting production", CardEffect.TravellerDown, 4),
        new(18, "Amalgamation with competitor boosts sales", CardEffect.TravellerAdvance, 4),
        new(19, "Rumours of pending takeover bid", CardEffect.ParentPegUp, 2),
        new(20, "New method of production reduces costs", CardEffect.ParentPegUp, 2),
        new(21, "Shares fall on rumours of increased taxation", CardEffect.TravellerDown, 2),
        new(22, "New product very successful", CardEffect.TravellerAdvance, 6),
        new(23, "Anti-Slump Insurance Policy", CardEffect.AntiSlump, 0),
        new(24, "Anti-Slump Insurance Policy", CardEffect.AntiSlump, 0),
    };

    private readonly Queue<MarketNewsCard> _draw = new();

    public MarketNewsDeck() => Shuffle();

    public void Shuffle()
    {
        var shuffled = AllCards.OrderBy(_ => Random.Shared.Next()).ToList();
        _draw.Clear();
        foreach (var card in shuffled) _draw.Enqueue(card);
    }

    public MarketNewsCard Draw()
    {
        if (_draw.Count == 0) Shuffle();
        return _draw.Dequeue();
    }
}
