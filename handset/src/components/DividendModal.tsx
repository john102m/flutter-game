import { COMPANIES, COMPANY_COLOURS } from "./constants";

interface CompanyRoundResult {
  companyIndex: number;
  dividendPercent: number;
  parentMove: number;
  bonusShares?: boolean;
  bankrupt?: boolean;
}

export interface RoundEndResult {
  companies: CompanyRoundResult[];
  winner?: string;
  winnerCapital: number;
}

interface Props {
  result: RoundEndResult;
  holdings: number[];
  onDismiss: () => void;
}

export function DividendModal({ result, holdings, onDismiss }: Props) {
  let total = 0;
  const lines = result.companies
    .filter(c => holdings[c.companyIndex] > 0 && c.dividendPercent > 0)
    .map(c => {
      const earned = holdings[c.companyIndex] * c.dividendPercent;
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
