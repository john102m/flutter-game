import { HubConnection } from "@microsoft/signalr";
import { useState } from "react";

interface Props {
  connection: HubConnection;
  error: string;
}

export function ConnectScreen({ connection, error }: Props) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [avatar, setAvatar] = useState(0);
  const [localError, setLocalError] = useState("");

  const createGame = () => {
    if (!name.trim()) { setLocalError("Enter your name"); return; }
    connection.invoke("CreateGame", name.trim(), avatar);
  };

  const joinGame = () => {
    if (!name.trim() || !code.trim()) { setLocalError("Enter your name and game code"); return; }
    setLocalError("");
    connection.invoke("JoinGame", code.trim(), name.trim(), avatar);
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 gap-3">
      <h1 className="text-3xl font-bold">Flutter</h1>
      {displayError && <p className="text-red-400">{displayError}</p>}

      {/* Avatar picker */}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => (
          <img
            key={i}
            src={`/avatars/avatar_${i}.png`}
            onClick={() => setAvatar(i)}
            className={`w-14 h-14 rounded-full cursor-pointer transition ${avatar === i ? "ring-3 ring-blue-400 scale-110" : "opacity-60"}`}
          />
        ))}
      </div>

      <input
        value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Your name" className="bg-gray-800 px-4 py-2 rounded text-center text-lg w-48"
      />
      <button onClick={createGame} className="bg-blue-600 px-6 py-3 rounded text-lg font-bold w-48">
        Create Game
      </button>
      <div className="flex gap-2">
        <input
          value={code} onChange={(e) => setCode(e.target.value)}
          placeholder="Game code" className="bg-gray-800 px-4 py-2 rounded text-center text-lg w-32"
        />
        <button onClick={joinGame} className="bg-amber-600 px-4 py-2 rounded text-lg font-bold">
          Join
        </button>
      </div>
    </div>
  );
}
