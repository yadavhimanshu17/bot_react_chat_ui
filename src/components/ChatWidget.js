// File: src/components/ChatWidget.js (FINAL & ROBUST VERSION)

import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import InputBox from './InputBox';
import { fetchClientDetails, fetchChatHistory } from '../services/api';
import { ChatSocket } from '../services/socket';

// --- CONFIGURATION ---
const ChatWidget = ({ clientId }) => {

    const CLIENT_ID = clientId || 'INVALID';

    const USER_ID_KEY = `chat_raw_user_id_${CLIENT_ID}`;

    const RAW_ID_FROM_STORAGE = localStorage.getItem(USER_ID_KEY);
    const USER_RAW_ID = RAW_ID_FROM_STORAGE || ('u' + Date.now());

    const USER_ID = USER_RAW_ID;
    const HISTORY_STORAGE_KEY = `chat_cache_${USER_RAW_ID}`;

    const [messages, setMessages] = useState([]);
    const [clientName, setClientName] = useState('Loading...');
    const [isConnected, setIsConnected] = useState(false);
    const [initialWelcomeMsg, setInitialWelcomeMsg] = useState('');
    const [isLiveAgentMode, setIsLiveAgentMode] = useState(false); // <--- Naya State

    const chatSocketRef = useRef(null);

    useEffect(() => {
        if (chatSocketRef.current) {
            return;
        }

        localStorage.setItem(USER_ID_KEY, USER_RAW_ID);

        let cachedHistory;
        const cachedHistoryString = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (cachedHistoryString) {
            try {
                cachedHistory = JSON.parse(cachedHistoryString);
                setMessages(cachedHistory);
            } catch (e) {
                console.error("Chat cache corrupted:", e);
                localStorage.removeItem(HISTORY_STORAGE_KEY);
            }
        }

        if (CLIENT_ID === 'INVALID') {
            setClientName('Error: Client ID Missing');
            setInitialWelcomeMsg('Client ID URL mein nahi mila. Chat shuru nahi ho sakta.');
            return;
        }

        const onStatusChange = (status) => {
            setIsConnected(status);
        };

        const onMsgReceive = (data) => {
            const sender = (data.sender_role === 'agent') ? 'agent' : 'bot';

            if (data.event === 'live_agent_ended') {
                setIsLiveAgentMode(false); // Live Agent Mode ko force stop karein
                setMessages(prev => [...prev, { text: data.message, sender: 'bot' }]);
                return;
            }

            if (data.event === 'bot_reply' && data.text) {
                setIsLiveAgentMode(false);
                setMessages(prev => [...prev, { text: data.text, sender }]);
            }
            else if (data.message && data.sender_role === 'agent') {
                setIsLiveAgentMode(true);
                setMessages(prev => [...prev, { text: data.message, sender }]);
            }
            else if (data.event === 'connection_success' && data.sender_role === 'agent') {
                setIsLiveAgentMode(true);
            }
        };

        const initializeChat = async () => {
            const clientData = await fetchClientDetails(CLIENT_ID);
            if (clientData) {
                setClientName(clientData.client_name);
                setInitialWelcomeMsg(clientData.welcome_message);
            } else {
                setClientName('Generic Bot');
                setInitialWelcomeMsg(`Welcome! Client ID ${CLIENT_ID} not found in DB.`);
            }

            const history = await fetchChatHistory(CLIENT_ID, USER_ID);

            if (history.length > 0 && JSON.stringify(history) !== cachedHistoryString) {
                setMessages(history);
            } else if (history.length > 0 && !cachedHistoryString) {
                setMessages(history);
            }

            chatSocketRef.current = new ChatSocket(CLIENT_ID, USER_ID, onMsgReceive, onStatusChange);
            chatSocketRef.current.connect();
        };

        initializeChat();

        return () => {
            if (chatSocketRef.current) {
                chatSocketRef.current.disconnect();
                // CRITICAL FIX 3: Disconnect karne ke baad ref ko null kar dein
                chatSocketRef.current = null;
            }
        };

    }, [clientId, CLIENT_ID, USER_ID, USER_ID_KEY]);


    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages, HISTORY_STORAGE_KEY]);


    useEffect(() => {
        if (isConnected && initialWelcomeMsg && messages.length === 0) {
            setMessages(prev => [...prev, { text: initialWelcomeMsg, sender: 'bot' }]);
            setInitialWelcomeMsg('');
        }
    }, [isConnected, initialWelcomeMsg, messages.length]);


    const handleSend = (messageText) => {
        setMessages(prev => [...prev, { text: messageText, sender: 'user' }]);
        if (chatSocketRef.current) {
            chatSocketRef.current.sendMessage(messageText);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: '#007bff', color: 'white', padding: '10px', textAlign: 'center' }}>
                {clientName} Support ({isConnected ? 'Online' : 'Offline'})
            </div>

            <MessageList messages={messages} />

            <InputBox
                onSend={handleSend}
                isConnected={isConnected && CLIENT_ID !== 'INVALID'}
                isLiveAgentMode={isLiveAgentMode}
            />

            <div style={{ fontSize: '10px', padding: '5px', background: '#eee' }}>
                Client ID: {CLIENT_ID} | User ID: {USER_ID}
            </div>
        </div>
    );
};

export default ChatWidget;