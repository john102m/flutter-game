import { HubConnection } from "@microsoft/signalr";

interface Props {
  connection: HubConnection;
  gameCode: string;
  players: string[];
  isHost: boolean;
}

export function LobbyScreen({ connection, gameCode, players, isHost }: Props) {
  const startGame = () => connection.invoke("StartGame");

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-3xl font-bold">Flutter</h1>
      <p className="text-xl text-amber-400">Game Code: {gameCode}</p>
      <ul className="text-lg">
        {players.map((p) => <li key={p}>{p}</li>)}
      </ul>
      {isHost && players.length >= 2 && (
        <button onClick={startGame} className="bg-green-600 px-6 py-3 rounded text-xl font-bold">
          Start Game
        </button>
      )}
      {isHost && players.length < 2 && (
        <p className="text-gray-400">Waiting for players...</p>
      )}
    </div>
  );
}
