import React, { useEffect, useRef, useState } from "react";
import { connectChatSocket, sendChatMessage } from "../services/socket";
import { fetchConversationHistory } from "../services/api";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ clientId, userId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const wsRef = useRef(null);

    useEffect(() => {
        setMessages([]);
        if (!clientId || !userId) return;

        (async () => {
            const history = await fetchConversationHistory(clientId, userId);
            setMessages((history || []).map(h => ({ text: h.message || h.text, sender: h.sender || h.from || "bot", ts: h.created_at || Date.now() })));
        })();

        const ws = connectChatSocket(clientId, userId, (msg) => {
            const text = msg.message || msg.text || msg.payload || "";
            setMessages(prev => [...prev, { text, sender: "bot", ts: Date.now() }]);
        }, () => {
            console.log("Chat socket open");
        });

        wsRef.current = ws;
        return () => { try { if (ws) ws.close(); } catch (e) { } wsRef.current = null; };
    }, [clientId, userId]);

    const handleSend = () => {
        if (!input) return;
        setMessages(prev => [...prev, { text: input, sender: "user", ts: Date.now() }]);
        const meta = { client_id: clientId, user_id: userId };
        const ok = sendChatMessage(wsRef.current, input, meta);
        if (!ok) {
            console.error("WS not open - you can implement REST fallback here");
        }
        setInput("");
    };

    return (
        <div className="border rounded p-4 w-[560px]">
            <div className="h-[380px] overflow-y-auto mb-3">
                {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
            </div>

            <div className="flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 border px-2 py-1 rounded" placeholder="Type a message..." />
                <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-1 rounded">Send</button>
            </div>
        </div>
    );
}
