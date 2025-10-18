import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    return (
        <div style={{ height: '300px', overflowY: 'scroll', padding: '10px', background: '#f8f9fa' }}>
            {messages.map((msg, index) => (
                <div
                    key={index}
                    style={{
                        textAlign: msg.sender === 'user' ? 'right' : 'left',
                        marginBottom: '10px'
                    }}
                >
                    <span style={{
                        display: 'inline-block',
                        padding: '8px 12px',
                        borderRadius: '15px',
                        background: msg.sender === 'user' ? '#dcf8c6' : (msg.sender === 'agent' ? '#ffeb3b' : '#ffffff'),
                        boxShadow: '0 1px 1px rgba(0,0,0,0.1)'
                    }}>
                        {msg.text}
                    </span>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;