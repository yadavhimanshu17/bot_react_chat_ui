import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [clientId, setClientId] = useState("CFSD001");
  const [userId, setUserId] = useState(`CFSD001_web_u${Math.floor(Math.random() * 1000)}`);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Bot UI (User)</h2>
      <div className="mb-4 flex gap-3 items-center">
        <label className="font-medium">Client ID:</label>
        <input className="border px-2 py-1" value={clientId} onChange={(e) => setClientId(e.target.value)} />
        <label className="font-medium">User ID:</label>
        <input className="border px-2 py-1" value={userId} onChange={(e) => setUserId(e.target.value)} />
      </div>

      <ChatWindow clientId={clientId} userId={userId} />
    </div>
  );
}
