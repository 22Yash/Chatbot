import React from 'react';

export function TypingIndicator({ isTyping }) {
    if (!isTyping) return null;
    return <div className="typing">Assistant is typing...</div>;
  }
  