import React, { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";

export default function FloatingChatBot({ clientId, userId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);


    useEffect(() => {
        const handleScroll = () => {
            if (isOpen && !isMinimized) {
                setIsOpen(false);
                setHasNewMessage(false);
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isOpen, isMinimized]);

    const handleBotMessage = () => {
        if (!isOpen || isMinimized) {
            setHasNewMessage(true);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setIsMinimized(false);
        setHasNewMessage(false);
    };

    const handleMinimize = () => {
        setIsMinimized(true);
        setHasNewMessage(false);
    };

    const handleRestore = () => {
        setIsMinimized(false);
        setIsOpen(true);
    };

    return (
        <>
            {/* Minimized Bar */}
            {isMinimized && (
                <div className="fixed bottom-4 right-4 sm:right-6 bg-gray-800 text-white px-4 py-2 rounded-t-lg shadow-lg z-50 flex items-center justify-between w-64">
                    <span className="font-medium">CFSD CloudForce</span>
                    <div className="flex gap-2 items-center">
                        {hasNewMessage && (
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        )}
                        <button
                            onClick={handleRestore}
                            className="text-white hover:text-blue-300 text-sm"
                            title="Restore"
                        >
                            ↗
                        </button>
                        <button
                            onClick={handleClose}
                            className="text-white hover:text-red-300 text-sm"
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {!isOpen && !isMinimized && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-4 right-4 sm:right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-50 flex items-center justify-center text-xl"
                    aria-label="Open chat"
                >
                    💬
                    {hasNewMessage && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                    )}
                </button>
            )}

            {/* Full Chat Window */}
            {isOpen && !isMinimized && (
                <div className="fixed bottom-20 right-4 sm:right-6 z-50 animate-fade-in">
                    <ChatWindow
                        key={`${clientId}-${userId}`}
                        clientId={clientId}
                        userId={userId}
                        onBotMessage={handleBotMessage}
                        onClose={handleClose}
                        onMinimize={handleMinimize}
                    />
                </div>
            )}
        </>
    );
}