using Flutter.Server.Hubs;
using Flutter.Server.Services;

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

app.Run();
