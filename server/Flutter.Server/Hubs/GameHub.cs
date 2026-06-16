using Flutter.Server.Models;
using Flutter.Server.Services;
using Microsoft.AspNetCore.SignalR;

namespace Flutter.Server.Hubs;

public class GameHub(GameService gameService) : Hub
{
    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("Welcome", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public async Task CreateGame(string playerName)
    {
        var game = gameService.CreateGame(Context.ConnectionId, playerName);
        await Clients.Caller.SendAsync("GameCreated", game.GameCode);
        await Clients.All.SendAsync("LobbyUpdated", game.Players.Select(p => p.Name).ToArray());
    }

    public async Task JoinGame(string code, string playerName)
    {
        var player = gameService.JoinGame(code, Context.ConnectionId, playerName);
        if (player is null)
        {
            await Clients.Caller.SendAsync("Error", "Unable to join game");
            return;
        }

        var game = gameService.GetGame()!;
        await Clients.All.SendAsync("LobbyUpdated", game.Players.Select(p => p.Name).ToArray());
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
    }

    public async Task GetState()
    {
        if (gameService.GetGame()?.Phase == GamePhase.Playing)
            await BroadcastTurnState();
    }

    public async Task BuyShares(int company)
    {
        var error = gameService.BuyShares(Context.ConnectionId, company);
        if (error != null)
        {
            await Clients.Caller.SendAsync("Error", error);
            return;
        }
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

        await Clients.All.SendAsync("DiceRolled", result.ColourDie, result.NumberDie);
        await BroadcastTurnState();
    }

    private async Task BroadcastTurnState()
    {
        var game = gameService.GetGame()!;
        var state = new
        {
            CurrentPlayer = game.CurrentPlayer.Name,
            Players = game.Players.Select(p => new
            {
                p.Name,
                Cash = p.Cash,
                Holdings = p.Holdings
            }).ToArray(),
            Companies = game.Companies.Select(c => new
            {
                c.Index,
                c.ParentPegRow,
                c.TravellerPegRow,
                Price = GameState.PriceForRow(c.ParentPegRow)
            }).ToArray()
        };
        await Clients.All.SendAsync("TurnState", state);
    }
}
