import { useState, useCallback } from 'react';

export function useChat({ client }) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('connected');

  const sendMessage = useCallback(async (content) => {
    setMessages((prev) => [...prev, { role: 'user', content }]);
    setStatus('loading');

    try {
      await client.sendMessage(content, {
        onToken: (token) => {
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg.role === 'assistant') {
              lastMsg.content += token;
              return [...prev.slice(0, -1), lastMsg];
            } else {
              return [...prev, { role: 'assistant', content: token }];
            }
          });
        }
      });
      setStatus('connected');
    } catch (err) {
      setStatus('error');
      setMessages((prev) => [...prev, { role: 'system', content: 'Error sending message' }]);
    }
  }, [client]);

  return { messages, sendMessage, status };
}
