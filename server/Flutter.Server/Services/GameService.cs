using Flutter.Server.Models;

namespace Flutter.Server.Services;

public class GameService(SessionMemory memory)
{
    // Board layout
    private const int TopRow = 2;
    private const int BottomRow = 32;
    private const int HighestPriceRow = 12;
    private const int MarketNewsRow = 11;
    private const int SlumpDrop = 6;
    private const int CompanyCount = 6;
    private const int MaxCertificatesPerCompany = 10;

    // Money (in pence)
    private const int Brokerage = 500;
    private const int ParPrice = 10000; // £100 PAR value
    private const int WinThreshold = 60000; // £600

    private GameState? _game;
    private readonly MarketNewsDeck _deck = new();

    // Human pace tracking
    private DateTime _turnStartedAt;
    private readonly List<double> _humanTurnDurations = new();

    public double AverageHumanTurnSeconds =>
        _humanTurnDurations.Count == 0 ? 4.0 : _humanTurnDurations.TakeLast(10).Average();

    public void MarkTurnStarted() => _turnStartedAt = DateTime.UtcNow;

    public void RecordHumanRoll()
    {
        if (_turnStartedAt == default) return;
        var duration = (DateTime.UtcNow - _turnStartedAt).TotalSeconds;
        if (duration is > 0.5 and < 30) // ignore outliers
            _humanTurnDurations.Add(duration);
    }

    public GameState CreateGame(string hostConnectionId, string hostName, int avatar)
    {
        _game = new GameState
        {
            GameCode = Random.Shared.Next(1000, 9999).ToString()
        };
        _game.Players.Add(new Player
        {
            ConnectionId = hostConnectionId,
            Name = hostName,
            IsHost = true,
            Avatar = avatar
        });
        return _game;
    }

    public GameState? GetGame() => _game;

    public Player? JoinGame(string code, string connectionId, string name, int avatar)
    {
        if (_game is null || _game.GameCode != code || _game.Phase != GamePhase.Lobby)
            return null;

        var player = new Player { ConnectionId = connectionId, Name = name, Avatar = avatar };
        _game.Players.Add(player);
        return player;
    }

    public bool Rejoin(string name, string connectionId)
    {
        if (_game is null) return false;
        var player = _game.Players.FirstOrDefault(p => p.Name == name);
        if (player is null) return false;
        player.ConnectionId = connectionId;
        return true;
    }

    public bool StartGame(string connectionId)
    {
        if (_game is null || _game.Phase != GamePhase.Lobby)
            return false;

        var host = _game.Players.FirstOrDefault(p => p.IsHost);
        if (host?.ConnectionId != connectionId)
            return false;

        _game.Phase = GamePhase.Playing;
        _game.CurrentPlayerIndex = 0;
        return true;
    }

    public bool IsCurrentPlayer(string connectionId) =>
        _game?.Phase == GamePhase.Playing && _game.CurrentPlayer.ConnectionId == connectionId;

    public string? BuyShares(string connectionId, int company)
    {
        if (!IsCurrentPlayer(connectionId)) return "Not your turn";
        if (company < 0 || company >= CompanyCount) return "Invalid company";

        var player = _game!.CurrentPlayer;
        var price = GameState.PriceForRow(_game.Companies[company].ParentPegRow);
        var cost = price + Brokerage;

        if (price == 0) return "Company is bankrupt";
        if (_game.Players.Sum(p => p.Holdings[company]) >= MaxCertificatesPerCompany)
            return "No shares available";
        if (player.Cash < cost) return "Not enough cash";

        player.Cash -= cost;
        player.Holdings[company]++;
        return null; // success
    }

    public string? SellShares(string connectionId, int company)
    {
        if (!IsCurrentPlayer(connectionId)) return "Not your turn";
        if (company < 0 || company >= CompanyCount) return "Invalid company";

        var player = _game!.CurrentPlayer;
        if (player.Holdings[company] <= 0) return "No shares to sell";

        var price = GameState.PriceForRow(_game.Companies[company].ParentPegRow);
        player.Cash += price;
        player.Holdings[company]--;
        return null; // success
    }

    public DiceResult RollDice(string connectionId)
    {
        if (!IsCurrentPlayer(connectionId)) return null!;

        // Track human pace
        if (!_game!.CurrentPlayer.IsAi)
            RecordHumanRoll();

        var colourDie = Random.Shared.Next(0, CompanyCount);

        // Move traveller up (lower row number = higher on board)
        var company = _game!.Companies[colourDie];

        var numberDie = Random.Shared.Next(1, 7);

        company.TravellerPegRow = Math.Max(TopRow, company.TravellerPegRow - numberDie);

        // Capture where the traveller landed before effects modify it
        var landedRow = company.TravellerPegRow;

        // Check board effects
        BoardEffect? effect = null;

        if (company.TravellerPegRow is 3 or 6)
        {
            if (company.HasAntiSlump)
            {
                company.HasAntiSlump = false;
                effect = new BoardEffect("AntiSlump");
                Console.WriteLine($"[SLUMP] Company {colourDie} protected by anti-slump");
            }
            else
            {
                var before = company.TravellerPegRow;
                company.TravellerPegRow = Math.Min(company.TravellerPegRow + SlumpDrop, company.ParentPegRow);
                effect = new BoardEffect("Slump");
                memory.RecordSlump(colourDie);
                Console.WriteLine($"[SLUMP] Company {colourDie} dropped from row {before} to {company.TravellerPegRow}");
            }
        }
        else if (company.TravellerPegRow == MarketNewsRow)
        {
            var card = _deck.Draw();
            var displayText = card.Effect switch
            {
                CardEffect.ParentPegUp => $"{card.Text}\n📈 Share price up £{card.Value * 10}!",
                CardEffect.ParentPegDown => $"{card.Text}\n📉 Share price down £{card.Value * 10}!",
                _ => card.Text
            };
            effect = new BoardEffect("MarketNews", displayText, card.Id);
            Console.WriteLine($"[M] Company {colourDie} drew card #{card.Id}: {card.Text} ({card.Effect} {card.Value})");
            ApplyCard(card, company);

            // Market News dividend can trigger a win
            if (card.Effect == CardEffect.Dividend)
            {
                var (winner, capital) = CheckWinner();
                if (winner != null)
                {
                    _game!.Phase = GamePhase.GameOver;
                    _game.CurrentPlayerIndex = (_game.CurrentPlayerIndex + 1) % _game.Players.Count;
                    return new DiceResult(colourDie, numberDie, effect, null, landedRow, winner, capital, "Market News dividend");
                }
            }
        }

        // Check if round ends (any traveller hit top row)
        if (_game.Companies.Any(c => c.TravellerPegRow == TopRow))
        {
            var roundResult = ProcessRoundEnd();
            // Advance turn AFTER round end
            _game.CurrentPlayerIndex = (_game.CurrentPlayerIndex + 1) % _game.Players.Count;
            return new DiceResult(colourDie, numberDie, effect, roundResult, landedRow);
        }

        // Advance to next player
        _game.CurrentPlayerIndex = (_game.CurrentPlayerIndex + 1) % _game.Players.Count;

        return new DiceResult(colourDie, numberDie, effect, null, landedRow);
    }

    private RoundEndResult ProcessRoundEnd()
    {
        var companyResults = new CompanyRoundResult[CompanyCount];

        for (int i = 0; i < CompanyCount; i++)
        {
            var company = _game!.Companies[i];

            // Skip bankrupt companies
            if (company.IsBankrupt)
            {
                companyResults[i] = new CompanyRoundResult(i, 0, 0, company.ParentPegRow, company.ParentPegRow);
                continue;
            }

            var (dividendPercent, parentMove) = AssessCompany(company);

            // Pay dividends
            if (dividendPercent > 0)
            {
                PayDividend(i, dividendPercent);
                memory.RecordDividend(i, dividendPercent);
            }

            // Move parent peg
            var oldParent = company.ParentPegRow;
            company.ParentPegRow = Math.Clamp(company.ParentPegRow - parentMove, HighestPriceRow, BottomRow);

            // Bonus shares: parent hits £200 → 1-for-1 bonus, parent returns to PAR
            var bonusIssued = false;
            if (company.ParentPegRow == HighestPriceRow)
            {
                foreach (var player in _game!.Players)
                    player.Holdings[i] *= 2;
                company.ParentPegRow = 22; // PAR
                bonusIssued = true;
            }

            // Bankruptcy: parent hits bottom → company removed
            var bankrupt = false;
            if (company.ParentPegRow >= BottomRow)
            {
                company.IsBankrupt = true;
                bankrupt = true;
                foreach (var player in _game!.Players)
                    player.Holdings[i] = 0;
            }

            companyResults[i] = new CompanyRoundResult(i, dividendPercent, parentMove, oldParent, company.ParentPegRow, bonusIssued, bankrupt);
        }

        // Reset travellers to parent pegs
        foreach (var company in _game!.Companies)
            company.TravellerPegRow = company.ParentPegRow;

        // Reshuffle market news deck
        _deck.Shuffle();

        // Win condition check
        var (winner, winnerCapital) = CheckWinner();

        if (winner != null)
            _game.Phase = GamePhase.GameOver;

        return new RoundEndResult(companyResults, winner, winnerCapital, "Dividends");
    }

    private (int dividendPercent, int parentMove) AssessCompany(Company company)
    {
        var row = company.TravellerPegRow;

        // Still on parent peg (never moved)
        if (row == company.ParentPegRow)
            return (0, -2);

        return row switch
        {
            TopRow => (20, 2),              // Top — 20%
            4 or 5 or 7 => (10, 1),        // 10% rows
            8 or 9 or 10 => (5, 1),        // 5% rows
            3 or 6 => (10, 1),             // SLUMP row (got here with anti-slump)
            MarketNewsRow => (0, 0),        // Market News — no move
            _ => (0, -1),                   // Below Market News — parent drops
        };
    }

    private int TotalCapital(Player player)
    {
        var shareValue = 0;
        for (int i = 0; i < CompanyCount; i++)
            shareValue += player.Holdings[i] * GameState.PriceForRow(_game!.Companies[i].ParentPegRow);
        return player.Cash + shareValue;
    }

    private (string? Name, int Capital) CheckWinner()
    {
        string? winner = null;
        int winnerCapital = 0;
        foreach (var player in _game!.Players)
        {
            var capital = TotalCapital(player);
            if (capital >= WinThreshold && capital > winnerCapital)
            {
                winner = player.Name;
                winnerCapital = capital;
            }
        }
        return (winner, winnerCapital);
    }

    private void ApplyCard(MarketNewsCard card, Company company)
    {
        switch (card.Effect)
        {
            case CardEffect.TravellerAdvance:
                company.TravellerPegRow = Math.Max(TopRow, company.TravellerPegRow - card.Value);
                break;
            case CardEffect.TravellerDown:
                company.TravellerPegRow = Math.Min(company.TravellerPegRow + card.Value, company.ParentPegRow);
                break;
            case CardEffect.TravellerReturnsToParent:
                company.TravellerPegRow = company.ParentPegRow;
                break;
            case CardEffect.ParentPegUp:
                company.ParentPegRow = Math.Max(HighestPriceRow, company.ParentPegRow - card.Value);
                break;
            case CardEffect.ParentPegDown:
                company.ParentPegRow = Math.Min(BottomRow, company.ParentPegRow + card.Value);
                break;
            case CardEffect.Dividend:
                PayDividend(company.Index, card.Value);
                break;
            case CardEffect.AntiSlump:
                company.HasAntiSlump = true;
                break;
        }
    }

    private void PayDividend(int companyIndex, int percent)
    {
        foreach (var player in _game!.Players)
        {
            var certs = player.Holdings[companyIndex];
            if (certs > 0)
            {
                // Dividends paid on £100 PAR value per certificate, not market price
                player.Cash += certs * ParPrice * percent / 100;
            }
        }
    }

    public int DebugForceGameOver()
    {
        if (_game is null) return 0;
        _game.Phase = GamePhase.GameOver;
        var player = _game.Players[0];
        player.Cash = WinThreshold; // guarantee they look like a winner
        return TotalCapital(player);
    }

    public void DebugForceBankruptcy(int company)
    {
        if (_game is null || company < 0 || company >= CompanyCount) return;
        var c = _game.Companies[company];
        c.IsBankrupt = true;
        c.ParentPegRow = BottomRow;
        c.TravellerPegRow = BottomRow;
        foreach (var player in _game.Players)
            player.Holdings[company] = 0;
    }

    public void ResetGame()
    {
        if (_game is null) return;
        _game.Phase = GamePhase.Lobby;
        _game.CurrentPlayerIndex = 0;
        _game.Companies = Enumerable.Range(0, CompanyCount).Select(i => new Company { Index = i }).ToList();
        _game.Players.Clear();
        _deck.Shuffle();
        memory.Reset();
    }

    public void RematchGame()
    {
        if (_game is null) return;
        _game.Phase = GamePhase.Lobby;
        _game.CurrentPlayerIndex = 0;
        _game.Companies = Enumerable.Range(0, CompanyCount).Select(i => new Company { Index = i }).ToList();
        foreach (var player in _game.Players)
        {
            player.Cash = 30000;
            player.Holdings = new int[CompanyCount];
        }
        _deck.Shuffle();
        memory.Reset();
    }
}
