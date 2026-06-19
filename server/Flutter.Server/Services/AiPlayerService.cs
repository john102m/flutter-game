using Flutter.Server.Models;
using Microsoft.AspNetCore.SignalR;
using Flutter.Server.Hubs;

namespace Flutter.Server.Services;

public class AiPlayerService(GameService gameService, SessionMemory memory, IHubContext<GameHub> hubContext)
{
    private const int MaxAiPlayers = 3;

    private static readonly (string Name, BotPersonality Personality, string Emoji)[] BotPool =
    [
        ("Gordon Gekko", BotPersonality.Aggressive, "🦈"),
        ("Warren Buffett", BotPersonality.Cautious, "🦉"),
        ("Jordan Belfort", BotPersonality.Chaotic, "🐺"),
    ];

    public Player? AddAiPlayer()
    {
        var game = gameService.GetGame();
        if (game is null || game.Phase != GamePhase.Lobby) return null;

        var aiCount = game.Players.Count(p => p.IsAi);
        if (aiCount >= MaxAiPlayers) return null;

        // Pick random available personality
        var usedNames = game.Players.Where(p => p.IsAi).Select(p => p.Name).ToHashSet();
        var available = BotPool.Where(b => !usedNames.Contains(b.Name)).ToArray();
        if (available.Length == 0) return null;
        var bot = available[Random.Shared.Next(available.Length)];

        var player = new Player
        {
            ConnectionId = $"ai-{Guid.NewGuid():N}",
            Name = bot.Name,
            IsAi = true,
            Personality = bot.Personality,
            Emoji = bot.Emoji,
            Avatar = -1
        };
        game.Players.Add(player);
        return player;
    }

    public async Task ProcessAiTurnIfNeeded()
    {
        var game = gameService.GetGame();
        if (game?.Phase != GamePhase.Playing) return;
        if (!game.CurrentPlayer.IsAi) return;

        // 2s — let the glow show on TV
        await Task.Delay(2000);

        var player = game.CurrentPlayer;

        // 2-4s thinking — longer if danger (any traveller near top)
        var thinkTime = AssessThinkTime(game);
        await Task.Delay(thinkTime);

        // Buy/sell decision
        var decision = Decide(player, game);
        if (decision.Company >= 0)
        {
            if (decision.IsBuy)
                gameService.BuyShares(player.ConnectionId, decision.Company);
            else
                gameService.SellShares(player.ConnectionId, decision.Company);

            var price = GameState.PriceForRow(game.Companies[decision.Company].ParentPegRow);
            var action = decision.IsBuy ? "buy" : "sell";
            await hubContext.Clients.All.SendAsync("TradeExecuted", player.Name, action, CompanyName(decision.Company), price);
            await BroadcastTurnState(game);
            await Task.Delay(1000);
        }

        // Roll dice
        var result = gameService.RollDice(player.ConnectionId);
        if (result is null) return;

        await hubContext.Clients.All.SendAsync("DiceRolled", result.ColourDie, result.NumberDie,
            result.Effect?.Type ?? "", result.Effect?.CardText ?? "", CompanyName(result.ColourDie), result.LandedRow);

        // Wait for TV animations: dice spin (3s) + effect card if any (4.5s)
        var postRollDelay = result.Effect != null ? 7500 : 3000;
        await Task.Delay(postRollDelay);

        if (result.Winner != null)
            await hubContext.Clients.All.SendAsync("GameOver", result.Winner, result.WinnerCapital, result.WinReason);
        else if (result.RoundEnd != null)
        {
            await hubContext.Clients.All.SendAsync("RoundEnd", result.RoundEnd);
            if (result.RoundEnd.Winner != null)
                await hubContext.Clients.All.SendAsync("GameOver", result.RoundEnd.Winner, result.RoundEnd.WinnerCapital, result.RoundEnd.WinReason);

            // Wait for TV overlay cards to finish (intro + 6 companies + winner = ~2.4s each)
            var cardCount = result.RoundEnd.Companies.Length + 1 + (result.RoundEnd.Winner != null ? 1 : 0);
            await Task.Delay(cardCount * 2500);
        }

        await BroadcastTurnState(game);

        // Chain: if next player is also AI, process their turn too
        await ProcessAiTurnIfNeeded();
    }

    private int AssessThinkTime(GameState game)
    {
        // Base: mirror human pace (slightly faster)
        var humanAvg = gameService.AverageHumanTurnSeconds;
        var baseMs = (int)(humanAvg * 0.7 * 1000);

        // Danger multiplier: think longer when travellers near top
        var closestTraveller = game.Companies
            .Where(c => !c.IsBankrupt)
            .Min(c => c.TravellerPegRow);

        var multiplier = closestTraveller <= 4 ? 1.4
            : closestTraveller <= 7 ? 1.1
            : 0.8;

        var thinkMs = (int)(baseMs * multiplier);

        // Clamp: never less than 2s, never more than 8s
        return Math.Clamp(thinkMs + Random.Shared.Next(-300, 300), 2000, 8000);
    }

    private (int Company, bool IsBuy) Decide(Player player, GameState game)
    {
        return player.Personality switch
        {
            BotPersonality.Aggressive => DecideAggressive(player, game),
            BotPersonality.Cautious => DecideCautious(player, game),
            BotPersonality.Chaotic => DecideChaotic(player, game),
            _ => (-1, false)
        };
    }

    private (int Company, bool IsBuy) DecideAggressive(Player player, GameState game)
    {
        // Buy anything affordable — weighted by memory (dividends, human sentiment)
        if (player.Cash > 15000)
        {
            var candidates = game.Companies
                .Where(c => !c.IsBankrupt && player.Cash >= GameState.PriceForRow(c.ParentPegRow) + 500)
                .OrderByDescending(c => memory.CompanyScore(c.Index)) // prefer "hot" companies
                .ThenBy(c => c.TravellerPegRow) // then highest traveller
                .ToList();

            if (candidates.Count > 0)
                return (candidates[0].Index, true);
        }
        return (-1, false);
    }

    private (int Company, bool IsBuy) DecideCautious(Player player, GameState game)
    {
        // Sell companies with poor memory score AND below PAR
        var fallers = game.Companies
            .Where(c => !c.IsBankrupt && c.ParentPegRow > 22 && player.Holdings[c.Index] > 0
                && memory.CompanyScore(c.Index) < 0.4)
            .ToList();

        if (fallers.Count > 0)
            return (fallers[0].Index, false); // sell

        // Buy rising stocks that memory also favours
        if (player.Cash > 20000)
        {
            var risers = game.Companies
                .Where(c => !c.IsBankrupt && c.ParentPegRow < 22
                    && player.Cash >= GameState.PriceForRow(c.ParentPegRow) + 500
                    && player.Holdings[c.Index] < 2
                    && memory.CompanyScore(c.Index) >= 0.4)
                .OrderByDescending(c => memory.CompanyScore(c.Index))
                .ToList();

            if (risers.Count > 0)
                return (risers[0].Index, true);
        }
        return (-1, false);
    }

    private (int Company, bool IsBuy) DecideChaotic(Player player, GameState game)
    {
        // 50/50 buy or sell, but slightly biased by what's popular
        if (Random.Shared.Next(2) == 0)
        {
            var affordable = game.Companies
                .Where(c => !c.IsBankrupt && player.Cash >= GameState.PriceForRow(c.ParentPegRow) + 500)
                .ToList();
            if (affordable.Count > 0)
            {
                // 60% chance pick highest-scored, 40% pure random
                var pick = Random.Shared.NextDouble() < 0.6
                    ? affordable.OrderByDescending(c => memory.CompanyScore(c.Index)).First()
                    : affordable[Random.Shared.Next(affordable.Count)];
                return (pick.Index, true);
            }
        }
        else
        {
            var held = game.Companies.Where(c => player.Holdings[c.Index] > 0).ToList();
            if (held.Count > 0)
                return (held[Random.Shared.Next(held.Count)].Index, false);
        }
        return (-1, false);
    }

    private async Task BroadcastTurnState(GameState game)
    {
        var state = new
        {
            CurrentPlayer = game.CurrentPlayer.Name,
            Players = game.Players.Select(p => new
            {
                p.Name,
                p.Avatar,
                p.Cash,
                p.Holdings,
                p.IsAi,
                p.Emoji
            }).ToArray(),
            Companies = game.Companies.Select(c => new
            {
                c.Index,
                c.ParentPegRow,
                c.TravellerPegRow,
                c.HasAntiSlump,
                c.IsBankrupt,
                Price = GameState.PriceForRow(c.ParentPegRow)
            }).ToArray()
        };
        await hubContext.Clients.All.SendAsync("TurnState", state);
    }

    private static string CompanyName(int index) => index switch
    {
        0 => "Aramco", 1 => "Exxon", 2 => "Shell",
        3 => "Chevron", 4 => "Esso", 5 => "BP",
        _ => "Unknown"
    };
}
