import { useEffect, useState } from "react";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "";

export function useConnection() {
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl(`${SERVER_URL}/gamehub`)
      .withAutomaticReconnect()
      .build();

    (window as any).__connection = conn;
    conn.start().then(() => setConnection(conn));
    return () => { conn.stop(); };
  }, []);

  return connection;
}
