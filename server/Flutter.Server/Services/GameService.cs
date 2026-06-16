using Flutter.Server.Models;

namespace Flutter.Server.Services;

public class GameService
{
    private const int Brokerage = 500; // £5 in pence
    private GameState? _game;
    private readonly MarketNewsDeck _deck = new();

    public GameState CreateGame(string hostConnectionId, string hostName)
    {
        _game = new GameState
        {
            GameCode = Random.Shared.Next(1000, 9999).ToString()
        };
        _game.Players.Add(new Player
        {
            ConnectionId = hostConnectionId,
            Name = hostName,
            IsHost = true
        });
        return _game;
    }

    public GameState? GetGame() => _game;

    public Player? JoinGame(string code, string connectionId, string name)
    {
        if (_game is null || _game.GameCode != code || _game.Phase != GamePhase.Lobby)
            return null;

        var player = new Player { ConnectionId = connectionId, Name = name };
        _game.Players.Add(player);
        return player;
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
        if (company < 0 || company > 5) return "Invalid company";

        var player = _game!.CurrentPlayer;
        var price = GameState.PriceForRow(_game.Companies[company].ParentPegRow);
        var cost = price + Brokerage;

        if (price == 0) return "Company is bankrupt";
        if (player.Cash < cost) return "Not enough cash";

        player.Cash -= cost;
        player.Holdings[company]++;
        return null; // success
    }

    public string? SellShares(string connectionId, int company)
    {
        if (!IsCurrentPlayer(connectionId)) return "Not your turn";
        if (company < 0 || company > 5) return "Invalid company";

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

        var colourDie = Random.Shared.Next(0, 6); // company 0-5
        var numberDie = Random.Shared.Next(1, 7); // 1-6

        // Move traveller up (lower row number = higher on board)
        var company = _game!.Companies[colourDie];
        company.TravellerPegRow = Math.Max(2, company.TravellerPegRow - numberDie);

        // Check board effects
        BoardEffect? effect = null;

        if (company.TravellerPegRow is 3 or 6)
        {
            if (company.HasAntiSlump)
            {
                company.HasAntiSlump = false;
                effect = new BoardEffect("AntiSlump");
            }
            else
            {
                company.TravellerPegRow = Math.Min(company.TravellerPegRow + 6, company.ParentPegRow);
                effect = new BoardEffect("Slump");
            }
        }
        else if (company.TravellerPegRow == 11)
        {
            var card = _deck.Draw();
            effect = new BoardEffect("MarketNews", card.Text, card.Id);
            ApplyCard(card, company);
        }

        // Advance to next player
        _game.CurrentPlayerIndex = (_game.CurrentPlayerIndex + 1) % _game.Players.Count;

        return new DiceResult(colourDie, numberDie, effect);
    }

    private void ApplyCard(MarketNewsCard card, Company company)
    {
        switch (card.Effect)
        {
            case CardEffect.TravellerAdvance:
                company.TravellerPegRow = Math.Max(2, company.TravellerPegRow - card.Value);
                break;
            case CardEffect.TravellerDown:
                company.TravellerPegRow = Math.Min(company.TravellerPegRow + card.Value, company.ParentPegRow);
                break;
            case CardEffect.TravellerReturnsToParent:
                company.TravellerPegRow = company.ParentPegRow;
                break;
            case CardEffect.ParentPegUp:
                company.ParentPegRow = Math.Max(12, company.ParentPegRow - card.Value);
                break;
            case CardEffect.ParentPegDown:
                company.ParentPegRow = Math.Min(32, company.ParentPegRow + card.Value);
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
                // percent per 100 shares (1 cert = 100 shares), price is in pence
                var price = GameState.PriceForRow(_game.Companies[companyIndex].ParentPegRow);
                player.Cash += certs * price * percent / 100;
            }
        }
    }
}
