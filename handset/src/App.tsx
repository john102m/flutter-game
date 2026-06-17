import { useEffect, useRef, useState } from "react";
import { useConnection } from "./hooks/useConnection";
import { ConnectScreen } from "./components/ConnectScreen";
import { LobbyScreen } from "./components/LobbyScreen";
import { GameScreen } from "./components/GameScreen";

export type Phase = "connect" | "lobby" | "playing" | "gameOver";

function App() {
  const connection = useConnection();
  const [phase, setPhase] = useState<Phase>(() => (sessionStorage.getItem("phase") as Phase) || "connect");
  const [gameCode, setGameCode] = useState(() => sessionStorage.getItem("gameCode") || "");
  const [players, setPlayers] = useState<{ name: string; avatar: number }[]>([]);
  const [isHost, setIsHost] = useState(() => sessionStorage.getItem("isHost") === "true");
  const [error, setError] = useState("");
  const [playerName, setPlayerName] = useState(() => sessionStorage.getItem("playerName") || "");
  const [gameOverInfo, setGameOverInfo] = useState<{ winner: string; capital: number } | null>(null);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!connection) return;

    connection.on("GameCreated", (code: string) => {
      setGameCode(code);
      setIsHost(true);
      setPhase("lobby");
      sessionStorage.setItem("gameCode", code);
      sessionStorage.setItem("isHost", "true");
      sessionStorage.setItem("phase", "lobby");
    });

    connection.on("LobbyUpdated", (playerList: { name: string; avatar: number }[]) => {
      setPlayers(playerList);
      if (joinedRef.current) {
        setPhase("lobby");
        sessionStorage.setItem("phase", "lobby");
      }
    });

    connection.on("GameStarted", () => {
      setPhase("playing");
      sessionStorage.setItem("phase", "playing");
    });

    connection.on("Rejoined", (serverPhase: string) => {
      const p = serverPhase === "playing" ? "playing" : "lobby";
      setPhase(p);
      sessionStorage.setItem("phase", p);
    });

    connection.on("Error", (msg: string) => {
      setError(msg);
      // If rejoin failed, reset to connect screen
      if (msg === "Could not rejoin") {
        setPhase("connect");
        sessionStorage.removeItem("phase");
        sessionStorage.removeItem("gameCode");
        sessionStorage.removeItem("isHost");
      }
    });

    connection.on("GameOver", (winner: string, capital: number) => {
      setGameOverInfo({ winner, capital });
      setPhase("gameOver");
      sessionStorage.setItem("phase", "gameOver");
    });

    connection.on("GameReset", () => {
      setPhase("connect");
      setGameOverInfo(null);
      sessionStorage.removeItem("phase");
      sessionStorage.removeItem("gameCode");
      sessionStorage.removeItem("isHost");
    });

    connection.on("GameRematch", (playerList: { name: string; avatar: number }[]) => {
      setPlayers(playerList);
      setPhase("lobby");
      setGameOverInfo(null);
      sessionStorage.setItem("phase", "lobby");
    });

    // Auto-rejoin if we have a stored session
    const storedName = sessionStorage.getItem("playerName");
    const storedPhase = sessionStorage.getItem("phase");
    if (storedName && storedPhase && storedPhase !== "connect") {
      connection.invoke("Rejoin", storedName).catch(() => {
        setPhase("connect");
        sessionStorage.removeItem("phase");
        sessionStorage.removeItem("gameCode");
        sessionStorage.removeItem("isHost");
      });
    }

    // Track join/create for phase transition and name capture
    const originalInvoke = connection.invoke.bind(connection);
    connection.invoke = (...args: [string, ...unknown[]]) => {
      if (args[0] === "JoinGame") {
        joinedRef.current = true;
        setPlayerName(args[2] as string);
        sessionStorage.setItem("playerName", args[2] as string);
      }
      if (args[0] === "CreateGame") {
        setPlayerName(args[1] as string);
        sessionStorage.setItem("playerName", args[1] as string);
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

  switch (phase) {
    case "lobby":
      return <LobbyScreen connection={connection} gameCode={gameCode} players={players} isHost={isHost} />;
    case "playing":
      return <GameScreen connection={connection} playerName={playerName} isHost={isHost} />;
    case "gameOver":
      return (
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
      );
    default:
      return <ConnectScreen connection={connection} error={error} />;
  }
}

export default App;
