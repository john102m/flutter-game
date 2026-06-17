import { HubConnection } from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";

const COMPANIES = ["Aramco", "Exxon", "Shell", "Chevron", "Esso", "BP"];
const COMPANY_COLOURS = ["#1565C0", "#E53935", "#43A047", "#1E88E5", "#FFD600", "#FF8C00"];

function EffectModal({ effect, company, onDismiss }: { effect: BoardEffect; company: string; onDismiss: () => void }) {
  const isSlump = effect.type === "Slump";
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl p-5 max-w-sm w-full text-center ${isSlump ? "bg-red-900 border-2 border-red-500" : "bg-gray-800 border-2 border-yellow-500"}`}>
        <div className="text-2xl mb-2">{isSlump ? "📉" : "📰"}</div>
        <div className="text-lg font-bold mb-1 text-white">{company}</div>
        <div className="text-white mb-4">{isSlump ? "SLUMP! Dropped back 6 spaces" : effect.cardText}</div>
        <button onClick={onDismiss} className="bg-white text-gray-900 font-bold px-6 py-2 rounded-lg">OK</button>
      </div>
    </div>
  );
}

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

interface CompanyRoundResult {
  companyIndex: number;
  dividendPercent: number;
  parentMove: number;
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
}

export function GameScreen({ connection, playerName }: Props) {
  const [turnState, setTurnState] = useState<TurnState | null>(null);
  const [lastRoll, setLastRoll] = useState<{ colour: number; number: number; effect?: string } | null>(null);
  const [error, setError] = useState("");
  const [animating, setAnimating] = useState(false);
  const [effectModal, setEffectModal] = useState<{ effect: BoardEffect; company: string } | null>(null);
  const [roundEnd, setRoundEnd] = useState<{ result: RoundEndResult; holdings: number[] } | null>(null);
  const holdingsRef = useRef<number[]>([0,0,0,0,0,0]);

  useEffect(() => {
    connection.on("TurnState", (state: TurnState) => {
      setTurnState(state);
      const me = state.players.find(p => p.name === playerName);
      if (me) holdingsRef.current = me.holdings;
    });
    connection.on("DiceRolled", (colour: number, num: number, effectType: string, cardText: string, companyName: string) => {
      setLastRoll({ colour, number: num, effect: effectType || undefined });
      setAnimating(true);
      if (effectType === "Slump" || effectType === "MarketNews") {
        setEffectModal({ effect: { type: effectType, cardText: cardText || undefined }, company: companyName || COMPANIES[colour] });
      }
      setTimeout(() => setAnimating(false), effectType ? 5000 : 3000);
    });
    connection.on("Error", (msg: string) => setError(msg));
    connection.on("RoundEnd", (result: RoundEndResult) => {
      setTimeout(() => setRoundEnd({ result, holdings: [...holdingsRef.current] }), 5000);
    });

    connection.invoke("GetState");

    return () => {
      connection.off("TurnState");
      connection.off("DiceRolled");
      connection.off("Error");
      connection.off("RoundEnd");
    };
  }, [connection]);

  if (!turnState) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  const isMyTurn = turnState.currentPlayer === playerName && !animating;
  const me = turnState.players.find(p => p.name === playerName);

  return (
    <div className="h-screen bg-gray-900 text-white p-2.5 pb-16 flex flex-col gap-1.5 overflow-hidden">
      {/* Turn indicator */}
      <div className={`text-center py-1 rounded font-bold text-lg ${isMyTurn ? "bg-green-700" : "bg-gray-700"}`}>
        {isMyTurn ? `Your Turn,  ${me?.name}` : `Waiting for ${turnState.currentPlayer}`}
      </div>

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
        <div className="text-center text-sm">
          <span className="text-gray-300">{COMPANIES[lastRoll.colour]}</span>{" "}
          {lastRoll.effect === "Slump" ? (
            <span className="text-red-400">▼ SLUMP!</span>
          ) : (
            <span className="text-green-400">▲({lastRoll.number})</span>
          )}
        </div>
      )}

      {/* Effect modal */}
      {effectModal && <EffectModal effect={effectModal.effect} company={effectModal.company} onDismiss={() => setEffectModal(null)} />}
      {roundEnd && <DividendModal result={roundEnd.result} holdings={roundEnd.holdings} onDismiss={() => setRoundEnd(null)} />}

      {/* Companies - buy/sell */}
      <div className="flex flex-col gap-1 flex-1 min-h-0">
        {turnState.companies.map((c) => {
          const held = me?.holdings[c.index] ?? 0;
          const price = c.price / 100;
          const cost = price + 5;
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
          className="bg-green-600 px-6 py-3 rounded-xl text-xl font-bold"
        >
          🎲 Roll Dice
        </button>
      )}
    </div>
  );
}
