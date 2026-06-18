import { HubConnection } from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";

const COMPANIES = ["Aramco", "Exxon", "Shell", "Chevron", "Esso", "BP"];
const COMPANY_COLOURS = ["#1565C0", "#E53935", "#43A047", "#1E88E5", "#FFD600", "#FF8C00"];

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
}

interface TurnState {
  currentPlayer: string;
  players: PlayerState[];
  companies: CompanyState[];
}


interface CompanyRoundResult {
  companyIndex: number;
  dividendPercent: number;
  parentMove: number;
  bonusShares?: boolean;
  bankrupt?: boolean;
}

interface RoundEndResult {
  companies: CompanyRoundResult[];
  winner?: string;
  winnerCapital: number;
}

function DividendModal({ result, holdings, onDismiss }: { result: RoundEndResult; holdings: number[]; onDismiss: () => void }) {
  let total = 0;
  const lines = result.companies
    .filter(c => holdings[c.companyIndex] > 0 && c.dividendPercent > 0)
    .map(c => {
      const earned = holdings[c.companyIndex] * c.dividendPercent; // £ per cert = percent of £100 par
      total += earned;
      return { name: COMPANIES[c.companyIndex], colour: COMPANY_COLOURS[c.companyIndex], earned };
    });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl p-5 max-w-sm w-full bg-gray-800 border-2 border-amber-500">
        <div className="text-center text-lg font-bold mb-3 text-amber-400">Round End — Dividends</div>
        {lines.length === 0 ? (
          <div className="text-center text-gray-400 mb-3">No dividends earned</div>
        ) : (
          <div className="space-y-1 mb-3">
            {lines.map(l => (
              <div key={l.name} className="flex justify-between">
                <span style={{ color: l.colour }}>{l.name}</span>
                <span className="text-white">+£{l.earned}</span>
              </div>
            ))}
            <div className="border-t border-gray-600 pt-1 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-green-400">+£{total}</span>
            </div>
          </div>
        )}
        {result.winner && (
          <div className="text-center text-yellow-300 font-bold mb-3">🏆 {result.winner} wins with £{Math.floor(result.winnerCapital / 100)}!</div>
        )}
        {result.companies.filter(c => c.bonusShares && holdings[c.companyIndex] > 0).map(c => (
          <div key={c.companyIndex} className="text-center text-pink-300 font-bold mb-2">🎉 {COMPANIES[c.companyIndex]} bonus shares! You now hold {holdings[c.companyIndex] * 2}</div>
        ))}
        {result.companies.filter(c => c.bankrupt).map(c => (
          <div key={c.companyIndex} className="text-center text-red-400 font-bold mb-2">💀 {COMPANIES[c.companyIndex]} is bankrupt!</div>
        ))}
        <div className="text-center">
          <button onClick={onDismiss} className="bg-white text-gray-900 font-bold px-6 py-2 rounded-lg">OK</button>
        </div>
      </div>
    </div>
  );
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
      setTimeout(() => { if (!roundEndRef.current) setAnimating(false); }, effectType ? 5000 : 3000);
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

  useEffect(() => {
    if (turnState?.currentPlayer === playerName && !animating) navigator.vibrate?.(100);
  }, [turnState?.currentPlayer, animating]);

  if (!turnState) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  const isMyTurn = turnState.currentPlayer === playerName && !animating;
  const me = turnState.players.find(p => p.name === playerName);

  return (
    <div className="h-dvh bg-gray-900 text-white p-2 pb-8 pt-3 flex flex-col gap-1.5 overflow-hidden">
      {/* Turn indicator */}
      <div className={`text-center py-1 rounded font-bold text-lg flex items-center justify-center gap-2 relative ${isMyTurn ? "bg-green-700" : "bg-gray-700"}`}>
        <img src={`/avatars/avatar_${me?.avatar ?? 0}.png`} className="w-7 h-7 rounded-full" />
        {isMyTurn ? `Your Turn,  ${me?.name}` : `Waiting for ${turnState.currentPlayer}`}
        {isHost && (
          <button
            onClick={() => setShowRestart(true)}
            className="absolute right-2 text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded"
          >
            ↺
          </button>
        )}
      </div>

      {showRestart && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl p-5 max-w-sm w-full bg-gray-800 border-2 border-red-500 text-center space-y-3">
            <div className="text-lg font-bold text-red-400">Restart Game?</div>
            <button
              onClick={() => { setShowRestart(false); connection.invoke("RestartGame"); }}
              className="w-full bg-amber-600 py-2 rounded-lg font-bold"
            >
              Rematch (same players)
            </button>
            <button
              onClick={() => { setShowRestart(false); connection.invoke("NewGame"); }}
              className="w-full bg-red-600 py-2 rounded-lg font-bold"
            >
              Full Reset (everyone rejoins)
            </button>
            <button
              onClick={() => setShowRestart(false)}
              className="w-full bg-gray-600 py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
      {lastRoll && (
        <div className="text-center text-sm truncate">
          <span className="text-gray-300">{COMPANIES[lastRoll.colour]}</span>{" "}
          {lastRoll.effect === "Slump" ? (
            <span className="text-red-400">▼ SLUMP!</span>
          ) : lastRoll.effect === "MarketNews" ? (
            <span className="text-yellow-400">📰 {lastRoll.cardText}</span>
          ) : (
            <span className="text-green-400">▲({lastRoll.number})</span>
          )}
        </div>
      )}

      {/* Effect modal */}
      {roundEnd && <DividendModal result={roundEnd.result} holdings={roundEnd.holdings} onDismiss={() => { setRoundEnd(null); setAnimating(false); roundEndRef.current = false; }} />}

      {/* Companies - buy/sell */}
      <div className="flex flex-col gap-1 flex-1 min-h-0">
        {turnState.companies.map((c) => {
          const held = me?.holdings[c.index] ?? 0;
          const price = c.price / 100;
          const cost = price + 5;
          if (c.isBankrupt) {
            return (
              <div key={c.index} className="rounded px-2.5 py-1.5 bg-gray-800 opacity-40">
                <div className="font-bold text-gray-500">{COMPANIES[c.index]} <span className="text-xs">💀 BANKRUPT</span></div>
              </div>
            );
          }
          return (
            <div key={c.index} className="rounded px-2.5 py-1.5 flex items-center justify-between" style={{ backgroundColor: `${COMPANY_COLOURS[c.index]}30` }}>
              <div>
                <div className="font-bold">{COMPANIES[c.index]} <span className="text-sm text-gray-400 font-normal">£{price}</span></div>
                <div className={`text-xs ${held > 0 ? "text-gray-200" : "text-gray-400"}`}>{held} held</div>
              </div>
              {isMyTurn && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setError(""); connection.invoke("BuyShares", c.index); }}
                    className="bg-blue-600 w-20 py-0.5 rounded text-sm font-bold"
                  >
                    Buy £{cost}
                  </button>
                  <button
                    onClick={() => { setError(""); connection.invoke("SellShares", c.index); }}
                    className={`w-12 py-0.5 rounded text-sm font-bold ${held > 0 ? "bg-red-600" : "invisible"}`}
                  >
                    Sell
                  </button>
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
          className=" bg-green-600 mt-6 px-6 py-2 rounded-xl text-xl font-bold"
        >
          🎲 Roll Dice
        </button>
      )}

      {/* Debug */}
      {/* {import.meta.env.DEV && (
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
      )} */}
    </div>
  );
}
