import React from "react";

export default function MessageBubble({ message }) {
    const sender = message.sender || "system";
    const timestamp = message.timestamp || Date.now();

    // Format timestamp
    const formatTime = (ts) => {
        const date = new Date(ts);
        return isNaN(date) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    // Determine type
    const isUser = sender === "user";
    const isAgent = sender === "agent";
    const isBot = sender === "bot";
    const isSystem = sender === "system";

    // Alignment
    let alignment = "justify-start"; // default left
    if (isUser) alignment = "justify-end";
    if (isSystem) alignment = "justify-center";

    // Bubble color
    let bubbleClass = "bg-gray-200 italic text-gray-700"; // system default
    if (isAgent) bubbleClass = "bg-green-200 text-black";
    else if (isUser) bubbleClass = "bg-blue-200 text-black";
    else if (isBot) bubbleClass = "bg-white shadow text-black";

    let senderLabel = "";
    if (isAgent) senderLabel = "Agent";
    else if (isUser) senderLabel = "You";
    else if (isBot) senderLabel = "Bot";

    return (
        <div className={`flex my-2 ${alignment}`}>
            <div className="max-w-[70%]">
                {/* Message bubble */}
                <div className={`p-2 rounded ${bubbleClass}`}>
                    {message.text}
                </div>

                {/* Timestamp and sender */}
                {!isSystem && (
                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>{senderLabel}</span>
                        <span>{formatTime(timestamp)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
