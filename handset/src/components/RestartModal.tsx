import { HubConnection } from "@microsoft/signalr";

interface Props {
  connection: HubConnection;
  onClose: () => void;
}

export function RestartModal({ connection, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl p-5 max-w-sm w-full bg-gray-800 border-2 border-red-500 text-center space-y-3">
        <div className="text-lg font-bold text-red-400">Restart Game?</div>
        <button
          onClick={() => { onClose(); connection.invoke("RestartGame"); }}
          className="w-full bg-amber-600 py-2 rounded-lg font-bold"
        >
          Rematch (same players)
        </button>
        <button
          onClick={() => { onClose(); connection.invoke("NewGame"); }}
          className="w-full bg-red-600 py-2 rounded-lg font-bold"
        >
          Full Reset (everyone rejoins)
        </button>
        <button
          onClick={onClose}
          className="w-full bg-gray-600 py-2 rounded-lg text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
