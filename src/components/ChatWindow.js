import React, { useEffect, useRef, useState } from "react";
import {
    connectChatSocket,
    connectLiveAgentSocket,
    sendChatMessage,
    getOfflineMessages,
    clearOfflineMessages
} from "../services/socket";
import { fetchConversationHistory } from "../services/api";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ clientId, userId, onBotMessage, onClose, onMinimize }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(
        document.documentElement.getAttribute('data-theme') === 'dark'
    );
    const botWsRef = useRef(null);
    const liveWsRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem('darkMode') === 'true';
        if (saved) {
            setDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isBotTyping]);

    useEffect(() => {
        if (!clientId || !userId) return;

        const offlineMsgs = getOfflineMessages(clientId, userId);
        if (offlineMsgs.length > 0) {
            setMessages(prev => [
                ...prev,
                ...offlineMsgs.map(msg => ({
                    text: msg.text,
                    sender: "user",
                    ts: msg.timestamp
                }))
            ]);
        }

        const loadHistory = async () => {
            setIsRefreshing(true);
            setMessages([]);
            await new Promise(resolve => setTimeout(resolve, 300));
            const history = await fetchConversationHistory(clientId, userId);
            setMessages((history || []).map(h => ({
                text: h.message || h.text,
                sender: h.sender || h.from || "bot",
                ts: h.created_at || Date.now()
            })));
            setIsRefreshing(false);
        };
        loadHistory();

        const retryOfflineMessages = () => {
            const offlineMsgs = getOfflineMessages(clientId, userId);
            offlineMsgs.forEach(msg => {
                sendChatMessage(botWsRef.current, msg.text, { client_id: clientId, user_id: userId });
            });
            clearOfflineMessages(clientId, userId);
        };

        let botSocket = connectChatSocket(clientId, userId, (msg) => {
            setIsBotTyping(false);

            if (msg.sender !== "user" && msg.sender !== "agent") {
                onBotMessage && onBotMessage();
            }

            const event = msg.event || (msg.custom && msg.custom.event) || (msg.json_message && msg.json_message.event);
            const sessionId = msg.session_id || (msg.custom && msg.custom.session_id) || (msg.json_message && msg.json_message.session_id);

            if (event === "handoff" && sessionId) {
                const liveSocket = connectLiveAgentSocket(sessionId, (liveMsg) => {
                    const liveEvent = liveMsg.event;

                    if (liveEvent === "session_ended" || liveEvent === "peer_disconnected") {
                        try { liveWsRef.current?.close(); } catch (e) { }
                        liveWsRef.current = null;
                        setIsBotTyping(false);

                        if (liveMsg.rasa_messages?.length > 0) {
                            liveMsg.rasa_messages.forEach(rMsg => {
                                setMessages(prev => [...prev, { text: rMsg.text, sender: "bot", ts: Date.now() }]);
                                onBotMessage && onBotMessage();
                            });
                        } else if (liveEvent === "peer_disconnected") {
                            setMessages(prev => [...prev, { text: "The Live Agent has disconnected. You are now chatting with the bot.", sender: "system", ts: Date.now() }]);
                        }
                        return;
                    }

                    const text = liveMsg.message || liveMsg.text || "";
                    const sender = liveMsg.from_agent || liveMsg.role === "agent" ? "agent" : "user";

                    if (sender === "agent") {
                        setIsBotTyping(false);
                    }

                    setMessages(prev => [...prev, { text, sender, ts: Date.now() }]);
                });

                liveWsRef.current = liveSocket;
                return;
            }

            const text = msg.message || msg.text || msg.payload || "";
            setMessages(prev => [...prev, { text, sender: "bot", ts: Date.now() }]);
        }, () => {
            console.log("[ChatWindow] Bot WS connected");
            retryOfflineMessages();
        });

        botWsRef.current = botSocket;

        return () => {
            try { botSocket?.close(); } catch (e) { }
            try { liveWsRef.current?.close(); } catch (e) { }
            botWsRef.current = null;
            liveWsRef.current = null;
        };
    }, [clientId, userId, onBotMessage]);

    const handleSend = () => {
        if (!input.trim()) return;

        const ws = liveWsRef.current || botWsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            setError("Offline! Messages will send when back online.");
            import("../services/socket").then(socketModule => {
                socketModule.saveMessageLocally(clientId, userId, input);
            });
            setInput("");
            return;
        }

        setIsBotTyping(true);
        setMessages(prev => [...prev, { text: input, sender: "user", ts: Date.now() }]);
        const meta = { client_id: clientId, user_id: userId };

        const ok = sendChatMessage(ws, input, meta);
        if (!ok) {
            setIsBotTyping(false);
            setError("Failed to send. Retrying...");
            import("../services/socket").then(socketModule => {
                socketModule.saveMessageLocally(clientId, userId, input);
            });
        } else {
            setError(null);
        }

        setInput("");
    };

    const handleRefresh = async () => {
        if (!clientId || !userId) return;
        setIsRefreshing(true);
        setMessages([]);
        await new Promise(resolve => setTimeout(resolve, 200));
        const history = await fetchConversationHistory(clientId, userId);
        setMessages((history || []).map(h => ({
            text: h.message || h.text,
            sender: h.sender || h.from || "bot",
            ts: h.created_at || Date.now()
        })));
        setIsRefreshing(false);
    };


    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
        localStorage.setItem('darkMode', newMode);
    };

    return (
        <div
            className="border rounded-lg bg-white shadow-xl flex flex-col h-[500px] w-full max-w-[560px] chat-container"
            role="region"
            aria-label="Chat with CFS CloudForce support"
        >
            {/* Header */}
            <div className="bg-gray-800 text-white p-3 flex justify-between items-center rounded-t-lg">
                <span className="font-bold text-lg">CFS CloudForce</span>
                <div className="flex gap-2">
                    <button
                        onClick={toggleDarkMode}
                        className="text-white hover:text-yellow-300 text-base"
                        title={darkMode ? "Light Mode" : "Dark Mode"}
                    >
                        {darkMode ? "☀️" : "🌙"}
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="text-white hover:text-blue-300 text-base"
                        title="Refresh"
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? "🌀" : "🔄"}
                    </button>
                    <button onClick={onMinimize} className="text-white hover:text-yellow-300 text-base" title="Minimize">—</button>
                    <button onClick={onClose} className="text-white hover:text-red-300 text-base" title="Close">×</button>
                </div>
            </div>

            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto p-4 bg-gray-50 chat-messages"
                aria-live="polite"
                aria-relevant="additions"
            >
                {messages.map((m, i) => (
                    <MessageBubble key={i} message={m} />
                ))}

                {isBotTyping && (
                    <div className="flex justify-start my-2">
                        <div className="bg-white shadow p-3 rounded-lg">
                            <span className="text-gray-500">...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white">
                {error && (
                    <div className="mb-2 p-2 bg-red-100 text-red-700 text-sm rounded">
                        {error}
                    </div>
                )}
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !isBotTyping && handleSend()}
                        className="flex-1 border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type a message..."
                        disabled={isBotTyping || isRefreshing}
                        aria-label="Type your message"
                        aria-describedby="send-button"
                    />
                    <button
                        id="send-button"
                        onClick={handleSend}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
                        disabled={!input.trim() || isBotTyping || isRefreshing}
                        aria-label="Send message"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}