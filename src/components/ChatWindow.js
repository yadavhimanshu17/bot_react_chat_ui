import React, { useEffect, useRef, useState } from "react";
import { connectChatSocket, connectLiveAgentSocket, sendChatMessage } from "../services/socket";
import { fetchConversationHistory } from "../services/api";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ clientId, userId, onBotMessage }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isBotTyping, setIsBotTyping] = useState(false);
    const botWsRef = useRef(null);
    const liveWsRef = useRef(null);

    useEffect(() => {
        setMessages([]);
        if (!clientId || !userId) return;

        (async () => {
            const history = await fetchConversationHistory(clientId, userId);
            setMessages((history || []).map(h => ({
                text: h.message || h.text,
                sender: h.sender || h.from || "bot",
                ts: h.created_at || Date.now()
            })));
        })();

        let botSocket = connectChatSocket(clientId, userId, (msg) => {
            setIsBotTyping(false);

            if (msg.sender !== "user" && msg.sender !== "agent") {
                onBotMessage && onBotMessage();
            }

            const event = msg.event || (msg.custom && msg.custom.event) || (msg.json_message && msg.json_message.event);
            const sessionId = msg.session_id || (msg.custom && msg.custom.session_id) || (msg.json_message && msg.json_message.session_id);

            if (event === "handoff" && sessionId) {
                console.log("[ChatWindow] Handoff received, sessionId:", sessionId);

                const liveSocket = connectLiveAgentSocket(sessionId, (liveMsg) => {
                    const liveEvent = liveMsg.event;

                    if (liveEvent === "session_ended" || liveEvent === "peer_disconnected") {
                        console.log(`[ChatWindow] Live Agent session ${liveEvent === "session_ended" ? 'ended' : 'peer disconnected'}.`);
                        try { liveWsRef.current && liveWsRef.current.close(); } catch (e) { console.warn(e); }
                        liveWsRef.current = null;

                        setIsBotTyping(false);

                        if (liveMsg.rasa_messages && liveMsg.rasa_messages.length > 0) {
                            liveMsg.rasa_messages.forEach(rMsg => {
                                setMessages(prev => [...prev, { text: rMsg.text, sender: "bot", ts: Date.now() }]);
                                onBotMessage && onBotMessage();
                            });
                        } else if (liveEvent === "peer_disconnected") {
                            setMessages(prev => [...prev, { text: "The Live Agent has disconnected. You are now chatting with the bot.", sender: "system", ts: Date.now() }]);
                        }
                        return;
                    }

                    // 🔥 FIX: Agent ka message aane pe typing indicator false karo
                    const text = liveMsg.message || liveMsg.text || "";
                    const sender = liveMsg.from_agent || liveMsg.role === "agent" ? "agent" : "user";

                    // Agar agent ka message hai toh typing indicator ko false karo
                    if (sender === "agent") {
                        setIsBotTyping(false);
                    }

                    setMessages(prev => [...prev, { text, sender, ts: Date.now() }]);
                }, () => console.log("[ChatWindow] LiveAgent WS connected"));

                liveWsRef.current = liveSocket;
                return;
            }

            const text = msg.message || msg.text || msg.payload || "";
            setMessages(prev => [...prev, { text, sender: "bot", ts: Date.now() }]);
        }, () => console.log("[ChatWindow] Bot WS connected"));

        botWsRef.current = botSocket;

        return () => {
            try { botSocket && botSocket.close(); } catch (e) { }
            try { liveWsRef.current && liveWsRef.current.close(); } catch (e) { }
            botWsRef.current = null;
            liveWsRef.current = null;
        };
    }, [clientId, userId, onBotMessage]);


    const handleSend = () => {
        if (!input.trim()) return;

        const ws = liveWsRef.current || botWsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("WS not open");
            return;
        }

        setIsBotTyping(true);

        setMessages(prev => [...prev, { text: input, sender: "user", ts: Date.now() }]);
        const meta = { client_id: clientId, user_id: userId };

        const ok = sendChatMessage(ws, input, meta);
        if (!ok) {
            setIsBotTyping(false);
            console.error("Failed to send message");
        }

        setInput("");
    };

    return (
        <div className="border rounded p-4 bg-white shadow-lg">
            <div className="h-[380px] overflow-y-auto mb-3">
                {messages.map((m, i) => (
                    <MessageBubble key={i} message={m} />
                ))}

                {isBotTyping && (
                    <div className="flex justify-start my-2">
                        <div className="bg-white shadow p-2 rounded max-w-[70%]">
                            <span className="text-gray-500">...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isBotTyping && handleSend()}
                    className="flex-1 border px-2 py-1 rounded"
                    placeholder="Type a message..."
                    disabled={isBotTyping}
                />
                <button
                    onClick={handleSend}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                    disabled={!input.trim() || isBotTyping}
                >
                    Send
                </button>
            </div>
        </div>
    );
}