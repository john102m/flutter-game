import { HubConnection } from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";
import { COMPANIES, COMPANY_COLOURS } from "./constants";
import { DividendModal, RoundEndResult } from "./DividendModal";
import { CompanyRow } from "./CompanyRow";
import { RestartModal } from "./RestartModal";

interface CompanyState {
  index: number;
  parentPegRow: number;
  travellerPegRow: number;
  price: number;
  isBankrupt?: boolean;
}

interface PlayerState {
  name: string;
  cash: number;
  holdings: number[];
  avatar?: number;
  isAi?: boolean;
  emoji?: string;
}

interface TurnState {
  currentPlayer: string;
  players: PlayerState[];
  companies: CompanyState[];
}

interface Props {
  connection: HubConnection;
  playerName: string;
  isHost: boolean;
}

export function GameScreen({ connection, playerName, isHost }: Props) {
  const [turnState, setTurnState] = useState<TurnState | null>(null);
  const [lastRoll, setLastRoll] = useState<{ colour: number; number: number; effect?: string; cardText?: string } | null>(null);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);
  const [roundEnd, setRoundEnd] = useState<{ result: RoundEndResult; holdings: number[] } | null>(null);
  const holdingsRef = useRef<number[]>([0,0,0,0,0,0]);
  const roundEndRef = useRef(false);
  const [showRestart, setShowRestart] = useState(false);

  useEffect(() => {
    connection.on("TurnState", (state: TurnState) => {
      setTurnState(state);
      const me = state.players.find(p => p.name === playerName);
      if (me) holdingsRef.current = me.holdings;
    });
    connection.on("DiceRolled", (colour: number, num: number, effectType: string, cardText: string, _companyName: string) => {
      setAnimating(true);
      setTimeout(() => setLastRoll({ colour, number: num, effect: effectType || undefined, cardText: cardText || undefined }), 3000);
      setTimeout(() => { if (!roundEndRef.current) setAnimating(false); }, effectType ? 7000 : 5000);
    });
    connection.on("Error", (msg: string) => {
      setError(msg);
      navigator.vibrate?.(200);
    });
    connection.on("RoundEnd", (result: RoundEndResult) => {
      roundEndRef.current = true;
      setAnimating(true);
      const cardCount = result.companies.length + 1 + (result.winner ? 1 : 0);
      setTimeout(() => setRoundEnd({ result, holdings: [...holdingsRef.current] }), cardCount * 2400);
    });

    connection.invoke("GetState");

    return () => {
      connection.off("TurnState");
      connection.off("DiceRolled");
      connection.off("Error");
      connection.off("RoundEnd");
    };
  }, [connection]);

  const prevPlayer = useRef(turnState?.currentPlayer);
  const prevAnimating = useRef(animating);
  useEffect(() => {
    const myTurn = turnState?.currentPlayer === playerName && !animating;
    const wasMyTurn = prevPlayer.current === playerName && !prevAnimating.current;
    if (myTurn && !wasMyTurn) navigator.vibrate?.(100);
    prevPlayer.current = turnState?.currentPlayer;
    prevAnimating.current = animating;
  }, [turnState?.currentPlayer, animating]);

  if (!turnState) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  const isMyTurn = turnState.currentPlayer === playerName && !animating;
  const me = turnState.players.find(p => p.name === playerName);

  return (
    <div className="h-dvh bg-gray-900 text-white p-2 pb-6 pt-3 flex flex-col gap-1.5 overflow-hidden">
      {/* Turn indicator */}
      <div className={`text-center py-1 rounded font-bold text-lg flex items-center justify-center gap-2 relative ${isMyTurn ? "bg-green-700" : "bg-gray-700"}`}>
        {(() => {
          const current = turnState.players.find(p => p.name === turnState.currentPlayer);
          return current?.isAi
            ? <span className="w-7 h-7 flex items-center justify-center text-lg">{current.emoji || '🤖'}</span>
            : <img src={`/avatars/avatar_${current?.avatar ?? 0}.png`} className="w-7 h-7 rounded-full" />;
        })()}
        {isMyTurn ? "Your Turn" : `${turnState.currentPlayer}`}
        {isHost && (
          <button
            onClick={() => setShowRestart(true)}
            className="absolute left-2 text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded"
          >
            ↺
          </button>
        )}
      </div>

      {showRestart && <RestartModal connection={connection} onClose={() => setShowRestart(false)} />}

      {error && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl p-5 max-w-sm w-full text-center bg-gray-800 border-2 border-red-500">
            <div className="text-white mb-4">{error}</div>
            <button onClick={() => setError("")} className="bg-white text-gray-900 font-bold px-6 py-2 rounded-lg">OK</button>
          </div>
        </div>
      )}

      {/* Cash & portfolio */}
      {(() => {
        const cash = me?.cash ?? 0;
        const shares = turnState.companies.reduce((sum, c) => sum + (me?.holdings[c.index] ?? 0) * c.price, 0);
        return (
          <div className="text-center text-sm">
            Cash: <span className="text-amber-400 font-bold">£{(cash / 100).toFixed(0)}</span>
            {" · "}Shares: <span className="text-blue-400 font-bold">£{(shares / 100).toFixed(0)}</span>
            {" · "}Total: <span className="text-green-400 font-bold">£{((cash + shares) / 100).toFixed(0)}</span>
          </div>
        );
      })()}

      {/* Last roll */}
      <div className="text-sm overflow-hidden whitespace-nowrap h-5 relative">
        {lastRoll && (
          lastRoll.effect === "MarketNews" ? (
            <span className="text-yellow-400 absolute animate-ticker">
              <span className="font-bold" style={{ color: COMPANY_COLOURS[lastRoll.colour] }}>{COMPANIES[lastRoll.colour]}</span>{" "}
              📰 {lastRoll.cardText}
            </span>
          ) : (
            <div className="text-center">
              <span className="font-bold" style={{ color: COMPANY_COLOURS[lastRoll.colour] }}>{COMPANIES[lastRoll.colour]}</span>{" "}
              {lastRoll.effect === "Slump" ? (
                <span className="text-red-400">📉 {lastRoll.cardText || "SLUMP!"}</span>
              ) : (
                <span className="text-green-400">▲({lastRoll.number})</span>
              )}
            </div>
          )
        )}
      </div>

      {/* Dividend modal */}
      {roundEnd && <DividendModal result={roundEnd.result} holdings={roundEnd.holdings} onDismiss={() => { setRoundEnd(null); setAnimating(false); roundEndRef.current = false; }} />}

      {/* Companies - buy/sell */}
      <div className="flex flex-col gap-1 flex-1 min-h-0">
        {turnState.companies.map((c) => (
          <CompanyRow
            key={c.index}
            index={c.index}
            price={c.price}
            held={me?.holdings[c.index] ?? 0}
            isBankrupt={c.isBankrupt}
            isMyTurn={isMyTurn}
            connection={connection}
            onError={() => setError("")}
          />
        ))}
      </div>

      {/* Roll button */}
      {isMyTurn && (
        <button
          onClick={() => { setError(""); connection.invoke("RollDice"); }}
          className="bg-green-600 mt-auto px-6 py-2 rounded-xl text-xl font-bold"
        >
          🎲 Roll Dice
        </button>
      )}

      {/* Debug */}
      {import.meta.env.DEV && false && (
        <div className="absolute top-1 right-1 flex gap-1">
          <button
            onClick={() => connection.invoke("DebugBankruptcy", 0)}
            className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded"
          >
            DBG:Bankrupt
          </button>
          <button
            onClick={() => connection.invoke("DebugGameOver")}
            className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded"
          >
            DBG:GameOver
          </button>
        </div>
      )}
    </div>
  );
}
