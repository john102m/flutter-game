namespace Flutter.Server.Services;

/// <summary>
/// Tracks in-game events so AI can adapt decisions mid-session.
/// Resets on game reset/rematch.
/// </summary>
public class SessionMemory
{
    private const int CompanyCount = 6;

    // Dividends paid per company (count of times, sum of percent)
    public int[] DividendCount { get; } = new int[CompanyCount];
    public int[] DividendTotal { get; } = new int[CompanyCount];

    // Slump hits per company
    public int[] SlumpCount { get; } = new int[CompanyCount];

    // Human trade sentiment: +1 per buy, -1 per sell
    public int[] HumanSentiment { get; } = new int[CompanyCount];

    public void RecordDividend(int company, int percent)
    {
        if (company is < 0 or >= CompanyCount) return;
        DividendCount[company]++;
        DividendTotal[company] += percent;
    }

    public void RecordSlump(int company)
    {
        if (company is < 0 or >= CompanyCount) return;
        SlumpCount[company]++;
    }

    public void RecordHumanTrade(int company, bool isBuy)
    {
        if (company is < 0 or >= CompanyCount) return;
        HumanSentiment[company] += isBuy ? 1 : -1;
    }

    /// <summary>
    /// Score 0-1 indicating how attractive a company looks based on history.
    /// Higher = more dividends, less slumps, humans favour it.
    /// </summary>
    public double CompanyScore(int company)
    {
        if (company is < 0 or >= CompanyCount) return 0.5;

        var divScore = DividendCount[company] * 0.3; // each dividend round adds weight
        var slumpPenalty = SlumpCount[company] * -0.2;
        var sentimentBonus = Math.Clamp(HumanSentiment[company] * 0.1, -0.3, 0.3);

        return Math.Clamp(0.5 + divScore + slumpPenalty + sentimentBonus, 0.0, 1.0);
    }

    public void Reset()
    {
        Array.Clear(DividendCount);
        Array.Clear(DividendTotal);
        Array.Clear(SlumpCount);
        Array.Clear(HumanSentiment);
    }
}
