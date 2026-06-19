import { useEffect, useRef, useState } from "react";
import { useConnection } from "./hooks/useConnection";
import { ConnectScreen } from "./components/ConnectScreen";
import { LobbyScreen } from "./components/LobbyScreen";
import { GameScreen } from "./components/GameScreen";

export type Phase = "connect" | "lobby" | "playing" | "gameOver";

function App() {
  const { connection, status } = useConnection();
  const [phase, setPhase] = useState<Phase>(() => (localStorage.getItem("flutter_phase") as Phase) || "connect");
  const [gameCode, setGameCode] = useState(() => localStorage.getItem("flutter_gameCode") || "");
  const [players, setPlayers] = useState<{ name: string; avatar: number }[]>([]);
  const [isHost, setIsHost] = useState(() => localStorage.getItem("flutter_isHost") === "true");
  const [error, setError] = useState("");
  const [playerName, setPlayerName] = useState(() => localStorage.getItem("flutter_playerName") || "");
  const [gameOverInfo, setGameOverInfo] = useState<{ winner: string; capital: number } | null>(null);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!connection) return;

    connection.on("GameCreated", (code: string) => {
      setGameCode(code);
      setIsHost(true);
      setPhase("lobby");
      localStorage.setItem("flutter_gameCode", code);
      localStorage.setItem("flutter_isHost", "true");
      localStorage.setItem("flutter_phase", "lobby");
    });

    connection.on("LobbyUpdated", (playerList: { name: string; avatar: number }[]) => {
      setPlayers(playerList);
      if (joinedRef.current) {
        setPhase("lobby");
        localStorage.setItem("flutter_phase", "lobby");
      }
    });

    connection.on("GameStarted", () => {
      setPhase("playing");
      localStorage.setItem("flutter_phase", "playing");
    });

    connection.on("Rejoined", (serverPhase: string) => {
      const p = serverPhase === "playing" ? "playing" : "lobby";
      setPhase(p);
      localStorage.setItem("flutter_phase", p);
    });

    connection.on("Error", (msg: string) => {
      setError(msg);
      // If rejoin failed, reset to connect screen
      if (msg === "Could not rejoin") {
        setPhase("connect");
        localStorage.removeItem("flutter_phase");
        localStorage.removeItem("flutter_gameCode");
        localStorage.removeItem("flutter_isHost");
      }
    });

    connection.on("GameOver", (winner: string, capital: number) => {
      setGameOverInfo({ winner, capital });
      setPhase("gameOver");
      localStorage.setItem("flutter_phase", "gameOver");
    });

    connection.on("GameReset", () => {
      setPhase("connect");
      setGameOverInfo(null);
      localStorage.removeItem("flutter_phase");
      localStorage.removeItem("flutter_gameCode");
      localStorage.removeItem("flutter_isHost");
    });

    connection.on("GameRematch", (playerList: { name: string; avatar: number }[]) => {
      setPlayers(playerList);
      setPhase("lobby");
      setGameOverInfo(null);
      localStorage.setItem("flutter_phase", "lobby");
    });

    // Auto-rejoin if we have a stored session
    const storedName = localStorage.getItem("flutter_playerName");
    const storedPhase = localStorage.getItem("flutter_phase");
    if (storedName && storedPhase && storedPhase !== "connect") {
      connection.invoke("Rejoin", storedName).catch(() => {
        setPhase("connect");
        localStorage.removeItem("flutter_phase");
        localStorage.removeItem("flutter_gameCode");
        localStorage.removeItem("flutter_isHost");
      });
    }

    // Track join/create for phase transition and name capture
    const originalInvoke = connection.invoke.bind(connection);
    connection.invoke = (...args: [string, ...unknown[]]) => {
      if (args[0] === "JoinGame") {
        joinedRef.current = true;
        setPlayerName(args[2] as string);
        localStorage.setItem("flutter_playerName", args[2] as string);
      }
      if (args[0] === "CreateGame") {
        setPlayerName(args[1] as string);
        localStorage.setItem("flutter_playerName", args[1] as string);
      }
      return originalInvoke(...args);
    };

    return () => {
      connection.off("GameCreated");
      connection.off("LobbyUpdated");
      connection.off("GameStarted");
      connection.off("Rejoined");
      connection.off("Error");
      connection.off("GameOver");
      connection.off("GameReset");
      connection.off("GameRematch");
    };
  }, [connection]);

  if (!connection) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Connecting...</div>;
  }

  const reconnecting = status === "reconnecting" || status === "disconnected";

  const reconnectingOverlay = reconnecting && (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]">
      <div className="text-center">
        <div className="text-2xl mb-2">📡</div>
        <div className="text-white font-bold">{status === "disconnected" ? "Connection lost" : "Reconnecting..."}</div>
        <div className="text-gray-400 text-sm mt-1">Please wait</div>
      </div>
    </div>
  );

  switch (phase) {
    case "lobby":
      return <>{reconnectingOverlay}<LobbyScreen connection={connection} gameCode={gameCode} players={players} isHost={isHost} /></>;
    case "playing":
      return <>{reconnectingOverlay}<GameScreen connection={connection} playerName={playerName} isHost={isHost} /></>;
    case "gameOver":
      return (
        <>{reconnectingOverlay}
        <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4 p-6">
          <div className="text-6xl">🏆</div>
          <div className="text-3xl font-bold text-amber-400">GAME OVER</div>
          <div className="text-xl font-bold">{gameOverInfo?.winner} wins!</div>
          <div className="text-lg text-green-400">Total capital: £{Math.floor((gameOverInfo?.capital ?? 0) / 100)}</div>
          <button
            onClick={() => connection.invoke("Rematch")}
            className="mt-6 bg-green-600 px-6 py-3 rounded-xl text-lg font-bold"
          >
            Rematch
          </button>
          <button
            onClick={() => connection.invoke("NewGame")}
            className="bg-gray-600 px-6 py-2 rounded-xl text-sm"
          >
            New Game
          </button>
        </div>
        </>
      );
    default:
      return <>{reconnectingOverlay}<ConnectScreen connection={connection} error={error} /></>;
  }
}

export default App;
