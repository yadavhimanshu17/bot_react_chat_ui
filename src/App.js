// App.js
import React, { useState, useEffect } from "react";
import FloatingChatBot from "./components/FloatingChatBot";

const BACKEND_URL = process.env.REACT_APP_BACKEND_HTTP || "http://localhost:8000";

export default function App() {
  const [validClients, setValidClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch valid webchat clients on load
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/channels/webchat/clients`);
        const data = await res.json();
        setValidClients(data.webchat_clients || []);
        if (data.webchat_clients?.length > 0) {
          setClientId(data.webchat_clients[0]); // auto-select first
        }
      } catch (err) {
        console.error("Failed to fetch clients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (clientId) {
      const uid = `${clientId}_web_u${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      setUserId(uid);
    }
  }, [clientId]);

  if (loading) return <div className="p-6">Loading clients...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">Multi-Client Chatbot</h2>

      <div className="mb-4 flex gap-3 items-center">
        <label className="font-medium">Client:</label>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="border px-2 py-1"
        >
          <option value="">-- Select Client --</option>
          {validClients.map(id => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>

        {clientId && (
          <>
            <label className="font-medium">User ID:</label>
            <input
              className="border px-2 py-1 bg-gray-100"
              value={userId}
              readOnly
            />
          </>
        )}
      </div>

      {clientId && userId && (
        <FloatingChatBot clientId={clientId} userId={userId} />
      )}
    </div>
  );
}