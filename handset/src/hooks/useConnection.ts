import { useEffect, useState } from "react";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:5000";

export function useConnection() {
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl(`${SERVER_URL}/gamehub`)
      .withAutomaticReconnect()
      .build();

    conn.start().then(() => setConnection(conn));
    return () => { conn.stop(); };
  }, []);

  return connection;
}
