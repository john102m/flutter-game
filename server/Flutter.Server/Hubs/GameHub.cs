using Flutter.Server.Models;
using Flutter.Server.Services;
using Microsoft.AspNetCore.SignalR;

namespace Flutter.Server.Hubs;

public class GameHub(GameService gameService, AiPlayerService aiService, SessionMemory memory) : Hub
{
    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("Welcome", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public async Task CreateGame(string playerName, int avatar)
    {
        var game = gameService.CreateGame(Context.ConnectionId, playerName, avatar);
        await Clients.Caller.SendAsync("GameCreated", game.GameCode);
        await Clients.All.SendAsync("LobbyUpdated", game.Players.Select(p => new { p.Name, p.Avatar, p.IsAi, p.Emoji }).ToArray());
    }

    public async Task JoinGame(string code, string playerName, int avatar)
    {
        var player = gameService.JoinGame(code, Context.ConnectionId, playerName, avatar);
        if (player is null)
        {
            await Clients.Caller.SendAsync("Error", "Unable to join game");
            return;
        }

        var game = gameService.GetGame()!;
        await Clients.All.SendAsync("LobbyUpdated", game.Players.Select(p => new { p.Name, p.Avatar, p.IsAi, p.Emoji }).ToArray());
    }

    public async Task AddAiPlayer()
    {
        var game = gameService.GetGame();
        if (game is null) return;
        var host = game.Players.FirstOrDefault(p => p.IsHost);
        if (host?.ConnectionId != Context.ConnectionId) return;

        var bot = aiService.AddAiPlayer();
        if (bot is null)
        {
            await Clients.Caller.SendAsync("Error", "Cannot add more AI players");
            return;
        }

        await Clients.All.SendAsync("LobbyUpdated", game.Players.Select(p => new { p.Name, p.Avatar, p.IsAi, p.Emoji }).ToArray());
    }

    public async Task StartGame()
    {
        if (!gameService.StartGame(Context.ConnectionId))
        {
            await Clients.Caller.SendAsync("Error", "Cannot start game");
            return;
        }

        await Clients.All.SendAsync("GameStarted");
        await BroadcastTurnState();
        _ = aiService.ProcessAiTurnIfNeeded();
    }

    public async Task GetState()
    {
        if (gameService.GetGame()?.Phase == GamePhase.Playing)
            await BroadcastTurnState();
    }

    public async Task Rejoin(string playerName)
    {
        if (gameService.Rejoin(playerName, Context.ConnectionId))
        {
            var game = gameService.GetGame()!;
            var phase = game.Phase.ToString().ToLower();
            await Clients.Caller.SendAsync("Rejoined", phase);
            if (game.Phase == GamePhase.Playing)
                await BroadcastTurnState();
        }
        else
        {
            await Clients.Caller.SendAsync("Error", "Could not rejoin");
        }
    }

    public async Task BuyShares(int company)
    {
        var error = gameService.BuyShares(Context.ConnectionId, company);
        if (error != null)
        {
            await Clients.Caller.SendAsync("Error", error);
            return;
        }
        memory.RecordHumanTrade(company, true);
        var game = gameService.GetGame()!;
        var player = game.Players.First(p => p.ConnectionId == Context.ConnectionId);
        var price = GameState.PriceForRow(game.Companies[company].ParentPegRow);
        await Clients.All.SendAsync("TradeExecuted", player.Name, "buy", CompanyName(company), price);
        await BroadcastTurnState();
    }

    public async Task SellShares(int company)
    {
        var error = gameService.SellShares(Context.ConnectionId, company);
        if (error != null)
        {
            await Clients.Caller.SendAsync("Error", error);
            return;
        }
        memory.RecordHumanTrade(company, false);
        var game = gameService.GetGame()!;
        var player = game.Players.First(p => p.ConnectionId == Context.ConnectionId);
        var price = GameState.PriceForRow(game.Companies[company].ParentPegRow);
        await Clients.All.SendAsync("TradeExecuted", player.Name, "sell", CompanyName(company), price);
        await BroadcastTurnState();
    }

    public async Task RollDice()
    {
        var result = gameService.RollDice(Context.ConnectionId);
        if (result is null)
        {
            await Clients.Caller.SendAsync("Error", "Not your turn");
            return;
        }

        await Clients.All.SendAsync("DiceRolled", result.ColourDie, result.NumberDie,
            result.Effect?.Type ?? "", result.Effect?.CardText ?? "", CompanyName(result.ColourDie), result.LandedRow);

        if (result.Winner != null)
        {
            await Clients.All.SendAsync("GameOver", result.Winner, result.WinnerCapital, result.WinReason);
        }
        else if (result.RoundEnd != null)
        {
            await Clients.All.SendAsync("RoundEnd", result.RoundEnd);
            if (result.RoundEnd.Winner != null)
            {
                await Clients.All.SendAsync("GameOver", result.RoundEnd.Winner, result.RoundEnd.WinnerCapital, result.RoundEnd.WinReason);
            }
        }

        await BroadcastTurnState();
        if (result.RoundEnd != null)
        {
            var cardCount = result.RoundEnd.Companies.Length + 1 + (result.RoundEnd.Winner != null ? 1 : 0);
            _ = Task.Delay(cardCount * 2500 + 3000).ContinueWith(_ => aiService.ProcessAiTurnIfNeeded());
        }
        else
        {
            _ = aiService.ProcessAiTurnIfNeeded();
        }
    }

    public async Task DebugGameOver()
    {
        var game = gameService.GetGame();
        if (game is null || game.Players.Count == 0) return;

        var winner = game.Players[0];
        var capital = gameService.DebugForceGameOver();
        await Clients.All.SendAsync("GameOver", winner.Name, capital, "Debug");
    }

    public async Task DebugBankruptcy(int company)
    {
        gameService.DebugForceBankruptcy(company);
        await Clients.All.SendAsync("Bankruptcy", company);
        await BroadcastTurnState();
    }

    public async Task NewGame()
    {
        var game = gameService.GetGame();
        if (game is null) return;
        var host = game.Players.FirstOrDefault(p => p.IsHost);
        if (host?.ConnectionId != Context.ConnectionId) return;

        gameService.ResetGame();
        await Clients.All.SendAsync("GameReset");
    }

    public async Task RestartGame()
    {
        var game = gameService.GetGame();
        if (game is null) return;
        var host = game.Players.FirstOrDefault(p => p.IsHost);
        if (host?.ConnectionId != Context.ConnectionId) return;

        gameService.RematchGame();
        await Clients.All.SendAsync("GameRematch", game.Players.Select(p => new { p.Name, p.Avatar }).ToArray());
    }

    public async Task Rematch()
    {
        gameService.RematchGame();
        var game = gameService.GetGame()!;
        await Clients.All.SendAsync("GameRematch", game.Players.Select(p => new { p.Name, p.Avatar }).ToArray());
    }

    private async Task BroadcastTurnState()
    {
        var game = gameService.GetGame()!;
        gameService.MarkTurnStarted();
        var state = new
        {
            CurrentPlayer = game.CurrentPlayer.Name,
            Players = game.Players.Select(p => new
            {
                p.Name,
                p.Avatar,
                Cash = p.Cash,
                Holdings = p.Holdings,
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
        await Clients.All.SendAsync("TurnState", state);
    }

    private static string CompanyName(int index) => index switch
    {
        0 => "Aramco", 1 => "Exxon", 2 => "Shell",
        3 => "Chevron", 4 => "Esso", 5 => "BP",
        _ => "Unknown"
    };
}
