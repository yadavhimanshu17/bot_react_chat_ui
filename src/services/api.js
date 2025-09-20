import axios from "axios";
const BACKEND = process.env.REACT_APP_BACKEND_HTTP || "http://localhost:8000";

export const fetchConversationHistory = async (clientId, userId) => {
    try {
        const res = await axios.get(`${BACKEND}/webhooks/conversation/${clientId}/${userId}`);
        return res.data.messages || [];
    } catch (e) {
        console.error("fetchConversationHistory error", e);
        return [];
    }
};
