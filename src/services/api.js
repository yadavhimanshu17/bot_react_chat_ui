const API_BASE_URL = 'http://localhost:8000';

export const fetchClientDetails = async (clientId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/clients/${clientId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API Error: Failed to fetch client details:", error);
        return null;
    }
};

export const fetchChatHistory = async (clientId, userId) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_GATEWAY_URL}/history/${clientId}/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.history || [];
    } catch (error) {
        console.error("Error fetching chat history from Gateway:", error);
        return [];
    }
};