import React from "react";

export default function MessageBubble({ message }) {
    const sender = message.sender || "system";
    const timestamp = message.ts || Date.now();

    const formatTime = (ts) => {
        const date = new Date(ts);
        return isNaN(date) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const isUser = sender === "user" || sender === "human";
    const isAgent = sender === "agent";
    const isBot = sender === "bot";
    const isSystem = sender === "system";

    let alignment = "justify-start";
    if (isUser) alignment = "justify-end";
    if (isSystem) alignment = "justify-center";

    let bubbleClass = "bg-gray-200 italic text-gray-700 message-bubble-system";
    if (isAgent) bubbleClass = "bg-green-100 text-black message-bubble-agent";
    else if (isUser) bubbleClass = "bg-blue-100 text-black message-bubble-user";
    else if (isBot) bubbleClass = "bg-white shadow text-black message-bubble-bot";

    let senderLabel = "";
    let avatarSrc = "/bot-avator.png";
    if (isAgent) {
        senderLabel = "Agent";
        avatarSrc = "/agent-avator.png";
    } else if (isUser) {
        senderLabel = "You";
        avatarSrc = "/user-avator.png";
    } else if (isBot) {
        senderLabel = "Bot";
        avatarSrc = "/bot-avator.png";
    }

    return (
        <div
            className={`flex my-2 ${alignment}`}
            role="article"
            aria-label={`${senderLabel}: ${message.text} at ${formatTime(timestamp)}`}
        >
            {!isUser && !isSystem && (
                <img
                    src={avatarSrc}
                    alt={senderLabel}
                    className="w-8 h-8 rounded-full mr-2 mt-1 flex-shrink-0"
                />
            )}
            <div className="max-w-[70%]">
                <div className={`p-3 rounded-lg ${bubbleClass}`}>
                    {message.text}
                </div>
                {!isSystem && (
                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>{senderLabel}</span>
                        <span>{formatTime(timestamp)}</span>
                    </div>
                )}
            </div>
            {isUser && !isSystem && (
                <img
                    src={avatarSrc}
                    alt={senderLabel}
                    className="w-8 h-8 rounded-full ml-2 mt-1 flex-shrink-0"
                />
            )}
        </div>
    );
}