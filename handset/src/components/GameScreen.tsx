import { HubConnection } from "@microsoft/signalr";
import { useEffect, useState } from "react";

const COMPANIES = ["Saudi Aramco", "ExxonMobil", "Shell", "Chevron", "TotalEnergies", "BP"];

interface CompanyState {
  index: number;
  parentPegRow: number;
  travellerPegRow: number;
  price: number;
}

interface PlayerState {
  name: string;
  cash: number;
  holdings: number[];
}

interface TurnState {
  currentPlayer: string;
  players: PlayerState[];
  companies: CompanyState[];
}

interface BoardEffect {
  type: string;
  cardText?: string;
  cardId?: number;
}

interface Props {
  connection: HubConnection;
  playerName: string;
}

export function GameScreen({ connection, playerName }: Props) {
  const [turnState, setTurnState] = useState<TurnState | null>(null);
  const [lastRoll, setLastRoll] = useState<{ colour: number; number: number; effect?: BoardEffect } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    connection.on("TurnState", (state: TurnState) => setTurnState(state));
    connection.on("DiceRolled", (colour: number, num: number, effectType: string, cardText: string, companyName: string) => {
      const effect: BoardEffect | undefined = effectType ? { type: effectType, cardText: cardText || undefined } : undefined;
      setLastRoll({ colour, number: num, effect });
    });
    connection.on("Error", (msg: string) => setError(msg));

    connection.invoke("GetState");

    return () => {
      connection.off("TurnState");
      connection.off("DiceRolled");
      connection.off("Error");
    };
  }, [connection]);

  if (!turnState) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  const isMyTurn = turnState.currentPlayer === playerName;
  const me = turnState.players.find(p => p.name === playerName);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col gap-4">
      {/* Turn indicator */}
      <div className={`text-center py-2 rounded font-bold text-lg ${isMyTurn ? "bg-green-700" : "bg-gray-700"}`}>
        {isMyTurn ? "Your Turn" : `Waiting for ${turnState.currentPlayer}`}
      </div>

      {error && <p className="text-red-400 text-center">{error}</p>}

      {/* Cash */}
      <div className="text-center text-xl">
        Cash: <span className="text-amber-400 font-bold">£{((me?.cash ?? 0) / 100).toFixed(0)}</span>
      </div>

      {/* Last roll */}
      {lastRoll && (
        <div className="text-center text-sm text-gray-400">
          Last roll: {COMPANIES[lastRoll.colour]} moved {lastRoll.number}
        </div>
      )}
      {lastRoll?.effect && (
        <div className={`text-center text-sm font-bold ${lastRoll.effect.type === "Slump" ? "text-red-400" : lastRoll.effect.type === "AntiSlump" ? "text-green-400" : "text-yellow-300"}`}>
          {lastRoll.effect.type === "Slump" && "📉 SLUMP! Dropped back 6"}
          {lastRoll.effect.type === "AntiSlump" && "🛡️ Anti-Slump! Protected"}
          {lastRoll.effect.type === "MarketNews" && `📰 ${lastRoll.effect.cardText}`}
        </div>
      )}

      {/* Companies - buy/sell */}
      <div className="flex flex-col gap-2">
        {turnState.companies.map((c) => {
          const held = me?.holdings[c.index] ?? 0;
          const price = c.price / 100;
          const cost = price + 5;
          return (
            <div key={c.index} className="bg-gray-800 rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-bold">{COMPANIES[c.index]}</div>
                <div className="text-sm text-gray-400">£{price} · Held: {held}</div>
              </div>
              {isMyTurn && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setError(""); connection.invoke("BuyShares", c.index); }}
                    className="bg-blue-600 px-3 py-1 rounded text-sm font-bold"
                  >
                    Buy £{cost}
                  </button>
                  {held > 0 && (
                    <button
                      onClick={() => { setError(""); connection.invoke("SellShares", c.index); }}
                      className="bg-red-600 px-3 py-1 rounded text-sm font-bold"
                    >
                      Sell
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Roll button */}
      {isMyTurn && (
        <button
          onClick={() => { setError(""); connection.invoke("RollDice"); }}
          className="bg-green-600 px-6 py-4 rounded-xl text-2xl font-bold mt-auto"
        >
          🎲 Roll Dice
        </button>
      )}
    </div>
  );
}
