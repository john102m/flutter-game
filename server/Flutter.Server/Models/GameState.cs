namespace Flutter.Server.Models;

public enum GamePhase { Lobby, Playing, RoundEnd, GameOver }

public class Player
{
    public string ConnectionId { get; set; } = "";
    public string Name { get; set; } = "";
    public int Cash { get; set; } = 30000; // pence (£300)
    public bool IsHost { get; set; }
    public int Avatar { get; set; }
    public int[] Holdings { get; set; } = new int[6]; // certificates per company
}

public class Company
{
    public int Index { get; set; }
    public int ParentPegRow { get; set; } = 22; // PAR = row 22 (£100)
    public int TravellerPegRow { get; set; } = 22; // starts on parent
    public bool HasAntiSlump { get; set; }
    public bool IsBankrupt { get; set; }
}

public class GameState
{
    public string GameCode { get; set; } = "";
    public GamePhase Phase { get; set; } = GamePhase.Lobby;
    public List<Player> Players { get; set; } = new();
    public List<Company> Companies { get; set; } = Enumerable.Range(0, 6)
        .Select(i => new Company { Index = i }).ToList();
    public int CurrentPlayerIndex { get; set; }

    public Player CurrentPlayer => Players[CurrentPlayerIndex];

    // Row 12 = £200 (20000p), Row 22 = £100 (10000p), Row 32 = BANKRUPT (0)
    public static int PriceForRow(int row) => row >= 32 ? 0 : (22 - row + 10) * 1000;
}

public record DiceResult(int ColourDie, int NumberDie, BoardEffect? Effect = null, RoundEndResult? RoundEnd = null, int? LandedRow = null);

public record BoardEffect(string Type, string? CardText = null, int? CardId = null);

public record CompanyRoundResult(int CompanyIndex, int DividendPercent, int ParentMove, int OldParentRow, int NewParentRow, bool BonusShares = false, bool Bankrupt = false);

public record RoundEndResult(CompanyRoundResult[] Companies, string? Winner, int WinnerCapital);

