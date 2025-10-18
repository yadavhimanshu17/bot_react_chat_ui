import React, { useState } from 'react';

const InputBox = ({ onSend, isConnected, isLiveAgentMode }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && isConnected) {
            onSend(input.trim());
            setInput('');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ccc' }}>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                    !isConnected
                        ? "Connecting..."
                        : isLiveAgentMode
                            ? "Message your agent..."
                            : "Type a message..."
                }
                disabled={!isConnected}
                style={{ flexGrow: 1, padding: '8px', border: '1px solid #ced4da', borderRadius: '4px 0 0 4px', outline: 'none' }}
            />
            <button
                type="submit"
                disabled={!isConnected}
                style={{
                    padding: '8px 15px',
                    background: isConnected ? '#28a745' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0 4px 4px 0',
                    cursor: isConnected ? 'pointer' : 'not-allowed'
                }}
            >
                Send
            </button>
        </form>
    );
};

export default InputBox;