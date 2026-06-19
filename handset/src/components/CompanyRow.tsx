import { HubConnection } from "@microsoft/signalr";
import { COMPANIES, COMPANY_COLOURS } from "./constants";

interface Props {
  index: number;
  price: number;
  held: number;
  isBankrupt?: boolean;
  isMyTurn: boolean;
  connection: HubConnection;
  onError: () => void;
}

export function CompanyRow({ index, price, held, isBankrupt, isMyTurn, connection, onError }: Props) {
  const priceDisplay = price / 100;
  const cost = priceDisplay + 5;

  if (isBankrupt) {
    return (
      <div className="rounded px-2.5 py-1.5 bg-gray-800 opacity-40">
        <div className="font-bold text-gray-500">{COMPANIES[index]} <span className="text-xs">💀 BANKRUPT</span></div>
      </div>
    );
  }

  return (
    <div className="rounded px-2.5 py-1.5 flex items-center justify-between" style={{ backgroundColor: `${COMPANY_COLOURS[index]}${held > 0 ? '80' : '30'}` }}>
      <div>
        <div className="font-bold">{COMPANIES[index]} <span className="text-sm text-gray-400 font-normal">£{priceDisplay}</span></div>
        <div className={`text-xs ${held > 0 ? "text-gray-200" : "text-gray-400"}`}>{held} held</div>
      </div>
      {isMyTurn && (
        <div className="flex gap-1.5">
          <button
            onClick={() => { onError(); connection.invoke("BuyShares", index); }}
            className="bg-blue-600 w-20 py-0.5 rounded text-sm font-bold"
          >
            Buy £{cost}
          </button>
          <button
            onClick={() => { onError(); connection.invoke("SellShares", index); }}
            className={`w-12 py-0.5 rounded text-sm font-bold ${held > 0 ? "bg-red-600" : "invisible"}`}
          >
            Sell
          </button>
        </div>
      )}
    </div>
  );
}
