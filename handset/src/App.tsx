import { useEffect, useRef, useState } from "react";
import { useConnection } from "./hooks/useConnection";
import { ConnectScreen } from "./components/ConnectScreen";
import { LobbyScreen } from "./components/LobbyScreen";
import { GameScreen } from "./components/GameScreen";

export type Phase = "connect" | "lobby" | "playing";

function App() {
  const connection = useConnection();
  const [phase, setPhase] = useState<Phase>("connect");
  const [gameCode, setGameCode] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");
  const [playerName, setPlayerName] = useState("");
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!connection) return;

    connection.on("GameCreated", (code: string) => {
      setGameCode(code);
      setIsHost(true);
      setPhase("lobby");
    });

    connection.on("LobbyUpdated", (names: string[]) => {
      setPlayers(names);
      if (joinedRef.current) setPhase("lobby");
    });

    connection.on("GameStarted", () => setPhase("playing"));
    connection.on("Error", (msg: string) => setError(msg));

    // Track join/create for phase transition and name capture
    const originalInvoke = connection.invoke.bind(connection);
    connection.invoke = (...args: [string, ...unknown[]]) => {
      if (args[0] === "JoinGame") {
        joinedRef.current = true;
        setPlayerName(args[2] as string);
      }
      if (args[0] === "CreateGame") {
        setPlayerName(args[1] as string);
      }
      return originalInvoke(...args);
    };

    return () => {
      connection.off("GameCreated");
      connection.off("LobbyUpdated");
      connection.off("GameStarted");
      connection.off("Error");
    };
  }, [connection]);

  if (!connection) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Connecting...</div>;
  }

  switch (phase) {
    case "lobby":
      return <LobbyScreen connection={connection} gameCode={gameCode} players={players} isHost={isHost} />;
    case "playing":
      return <GameScreen connection={connection} playerName={playerName} />;
    default:
      return <ConnectScreen connection={connection} error={error} />;
  }
}

export default App;
