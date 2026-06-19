import { useEffect, useState } from "react";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "";

export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

export function useConnection() {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl(`${SERVER_URL}/gamehub`)
      .withAutomaticReconnect([0, 1000, 2000, 5000, 10000, 30000])
      .build();

    conn.onreconnecting(() => setStatus("reconnecting"));
    conn.onreconnected(() => {
      setStatus("connected");
      // Re-rejoin so server knows our new connection ID
      const name = localStorage.getItem("flutter_playerName");
      const phase = localStorage.getItem("flutter_phase");
      if (name && phase && phase !== "connect") {
        conn.invoke("Rejoin", name).catch(() => {});
      }
    });
    conn.onclose(() => setStatus("disconnected"));

    conn.start().then(() => {
      setStatus("connected");
      setConnection(conn);
    });

    return () => { conn.stop(); };
  }, []);

  return { connection, status };
}
