using Flutter.Server.Hubs;
using Flutter.Server.Services;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<GameService>();
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors();
app.MapHub<GameHub>("/gamehub");
app.MapGet("/", () => "Flutter Server running");
app.MapGet("/admin/reset", (GameService gs, IHubContext<GameHub> hub) => {
    gs.ResetGame();
    hub.Clients.All.SendAsync("GameReset");
    return "Game reset";
});

app.Run();
