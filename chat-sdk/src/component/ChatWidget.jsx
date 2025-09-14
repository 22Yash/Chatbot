import React from 'react';
import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { Composer } from './composer';
import { TypingIndicator } from './TypingIndicator';

export function ChatWidget({ client }) {
  const { messages, sendMessage, status } = useChat({ client });

  return (
    <div className="chat-widget">
      <MessageList messages={messages} />
      <TypingIndicator isTyping={status === 'loading'} />
      <Composer onSend={sendMessage} />
    </div>
  );
}
