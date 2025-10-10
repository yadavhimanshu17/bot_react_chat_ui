const WS_BASE = process.env.REACT_APP_BACKEND_WS || "ws://localhost:8000";

export function connectChatSocket(clientId, userId, onMessage, onOpen) {
    if (!clientId || !userId) {
        console.error("connectChatSocket: clientId and userId required");
        return null;
    }
    const url = `${WS_BASE}/ws/chat/${encodeURIComponent(clientId)}/${encodeURIComponent(userId)}`;
    const ws = new WebSocket(url);

    ws.onopen = () => { console.log("✅ Chat WebSocket connected", url); onOpen && onOpen(); };
    ws.onerror = (err) => console.error("⛔ Chat WebSocket error", err);
    ws.onclose = (ev) => { console.warn("⚠ Chat WebSocket closed", ev?.reason || ev); };
    ws.onmessage = (ev) => {
        try {
            const data = JSON.parse(ev.data);
            onMessage && onMessage(data);
        } catch (e) {
            console.error("Chat socket parse error", e);
        }
    };

    return ws;
}

export function sendChatMessage(ws, text, metadata = {}) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.error("Chat socket not connected");
        return false;
    }
    ws.send(JSON.stringify({ message: text, metadata }));
    return true;
}



export function connectLiveAgentSocket(sessionId, onMessage, onOpen) {
    if (!sessionId) {
        console.error("connectLiveAgentSocket: sessionId required");
        return null;
    }
    const url = `${WS_BASE.replace(/\/$/, "")}/ws/live_agent/${encodeURIComponent(sessionId)}`;
    const ws = new WebSocket(url);

    ws.onopen = () => { console.log("✅ LiveAgent WebSocket connected", url); onOpen && onOpen(); };
    ws.onerror = (err) => console.error("⛔ LiveAgent WebSocket error", err);
    ws.onclose = (ev) => { console.warn("⚠ LiveAgent WebSocket closed", ev?.reason || ev); };
    ws.onmessage = (ev) => {
        try {
            const data = JSON.parse(ev.data);
            onMessage && onMessage(data);
        } catch (e) {
            console.error("LiveAgent socket parse error", e);
        }
    };
    return ws;
}

export function sendAgentMessage(ws, text, metadata = {}) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.error("LiveAgent socket not connected");
        return false;
    }
    ws.send(JSON.stringify({ message: text, metadata }));
    return true;
}

export const saveMessageLocally = (clientId, userId, text) => {
    const key = `offline_msgs_${clientId}_${userId}`;
    const offline = JSON.parse(localStorage.getItem(key) || "[]");
    offline.push({ text, timestamp: Date.now() });
    localStorage.setItem(key, JSON.stringify(offline));
};

export const getOfflineMessages = (clientId, userId) => {
    const key = `offline_msgs_${clientId}_${userId}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
};

export const clearOfflineMessages = (clientId, userId) => {
    const key = `offline_msgs_${clientId}_${userId}`;
    localStorage.removeItem(key);
};