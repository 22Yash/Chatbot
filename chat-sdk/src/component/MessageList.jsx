import React from 'react';

export function MessageList({ messages }) {
    return (
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>
    );
  }
  