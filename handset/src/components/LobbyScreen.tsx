import { HubConnection } from "@microsoft/signalr";

interface Props {
  connection: HubConnection;
  gameCode: string;
  players: { name: string; avatar: number; isAi?: boolean; emoji?: string }[];
  isHost: boolean;
}

export function LobbyScreen({ connection, gameCode, players, isHost }: Props) {
  const startGame = () => connection.invoke("StartGame");
  const addAi = () => connection.invoke("AddAiPlayer");
  const aiCount = players.filter((p) => p.isAi).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-3xl font-bold">Flutter</h1>
      <p className="text-xl text-amber-400">Game Code: {gameCode}</p>
      <ul className="text-lg space-y-2">
        {players.map((p) => (
          <li key={p.name} className="flex items-center gap-2">
            {p.isAi ? (
              <span className="w-8 h-8 flex items-center justify-center text-xl">{p.emoji || '🤖'}</span>
            ) : (
              <img src={`/avatars/avatar_${p.avatar}.png`} className="w-8 h-8 rounded-full" />
            )}
            {p.name}
          </li>
        ))}
      </ul>
      {isHost && (
        <div className="flex gap-3">
          {aiCount < 3 && (
            <button onClick={addAi} className="bg-blue-600 px-4 py-2 rounded font-bold">
              Add AI
            </button>
          )}
          {players.length >= 2 && (
            <button onClick={startGame} className="bg-green-600 px-6 py-3 rounded text-xl font-bold">
              Start Game
            </button>
          )}
        </div>
      )}
      {isHost && players.length < 2 && (
        <p className="text-gray-400">Waiting for players...</p>
      )}
    </div>
  );
}
