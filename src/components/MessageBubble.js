import React from "react";

export default function MessageBubble({ message }) {
    const isUser = message.sender === "user" || message.sender === "agent";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
            <div className={`max-w-[70%] p-2 rounded ${isUser ? "bg-green-200" : "bg-white shadow"}`}>
                {message.text}
            </div>
        </div>
    );
}
