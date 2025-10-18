const WS_BASE_URL = 'wss://852a4e61c008.ngrok-free.app';

export class ChatSocket {
    constructor(clientId, userId, onMessageReceived, onConnectionStatusChange) {
        this.clientId = clientId;
        this.userId = userId;
        this.onMessageReceived = onMessageReceived;
        this.onConnectionStatusChange = onConnectionStatusChange;
        this.ws = null;
        this.url = `${WS_BASE_URL}/ws/chat/${clientId}/${userId}`;
    }

    connect = () => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

        this.ws = new WebSocket(this.url);
        this.onConnectionStatusChange(false);

        this.ws.onopen = () => {
            this.onConnectionStatusChange(true);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.onMessageReceived(data);
            } catch (e) {
                console.error("WS: Error parsing message:", e);
            }
        };

        this.ws.onclose = () => {
            this.onConnectionStatusChange(false);
            setTimeout(this.connect, 5000);
        };

        this.ws.onerror = (error) => {
            console.error('WS Error:', error);
            this.ws.close();
        };
    };

    sendMessage = (messageText) => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const payload = {
                message: messageText,
                metadata: {
                    user_id: this.userId,
                    raw_id: this.userId.split(':').pop()
                }
            };
            this.ws.send(JSON.stringify(payload));
            return true;
        }
        return false;
    };

    disconnect = () => {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    };
}