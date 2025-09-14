import { useState } from 'react';
import React from 'react';

export function Composer({ onSend }) {
  const [text, setText] = useState('');

  return (
    <div className="composer">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
      />
      <button
        onClick={() => {
          if (!text) return;
          onSend(text);
          setText('');
        }}
      >
        Send
      </button>
    </div>
  );
}
