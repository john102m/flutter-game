namespace Flutter.Server.Models;

/// <summary>
/// Funny headline pool for Market News cards. {0} is replaced with company name.
/// </summary>
public static class NewsHeadlines
{
    private static readonly Dictionary<CardEffect, string[]> Pool = new()
    {
        [CardEffect.TravellerAdvance] =
        [
            "{0} discovers oil in CEO's back garden",
            "{0} stock goes viral on TikTok",
            "{0} accidentally invents fusion power",
            "{0} wins government contract after CEO's golf game",
            "Leaked memo: {0} profits are \"absolutely mental\"",
            "{0} launches AI chatbot that actually works",
            "{0} buys competitor for the price of a sandwich",
            "Analysts stunned as {0} does something competent",
        ],
        [CardEffect.TravellerDown] =
        [
            "{0} CEO caught napping in board meeting",
            "{0} warehouse floods after intern leaves tap on",
            "{0} accidentally tweets company passwords",
            "{0} CFO admits he \"doesn't really get numbers\"",
            "Workers at {0} strike over biscuit quality",
            "{0} product recall: \"it's probably fine\" says spokesperson",
            "{0} office collapses after dodgy extension",
            "{0} shares dip after CEO's disastrous TV interview",
        ],
        [CardEffect.TravellerReturnsToParent] =
        [
            "{0} board resigns en masse to join circus",
            "Catastrophic IT failure wipes {0} customer database",
            "{0} entire workforce calls in sick on same day",
            "{0} CEO rage-quits live on air",
        ],
        [CardEffect.ParentPegUp] =
        [
            "Takeover rumours swirl around {0}",
            "{0} share price rockets on mystery buyer",
            "City tips {0} as \"one to watch\"",
            "{0} new patent sends investors wild",
            "Goldman Sachs upgrades {0} to \"BUY BUY BUY\"",
        ],
        [CardEffect.ParentPegDown] =
        [
            "{0} shares tumble on accounting \"irregularities\"",
            "Short sellers circle {0} like vultures",
            "{0} profit warning sends City into panic",
            "Analysts downgrade {0} to \"sell your house and run\"",
            "{0} CEO's expense claims leak: £900 on biscuits",
        ],
        [CardEffect.Dividend] =
        [
            "{0} declares bumper dividend — champagne all round",
            "{0} profits through the roof, shareholders celebrate",
            "{0} announces special payout: \"we've got too much money\"",
            "Record quarter for {0} — cash rains from the sky",
            "{0} dividend surprises even the board",
        ],
        [CardEffect.AntiSlump] =
        [
            "{0} takes out insurance against market chaos",
            "{0} hedges bets with anti-slump policy",
        ],
    };

    public static string GetHeadline(CardEffect effect, string companyName)
    {
        if (!Pool.TryGetValue(effect, out var headlines)) return companyName;
        var template = headlines[Random.Shared.Next(headlines.Length)];
        return template.Replace("{0}", companyName);
    }
}
