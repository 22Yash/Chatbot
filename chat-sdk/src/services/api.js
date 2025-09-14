let sessionId = null;

export function createClient({ baseUrl, agentId, locale }) {
  sessionId = sessionId || `sess-${Math.random().toString(36).substr(2, 9)}`;

  async function sendMessage(content, callbacks = {}) {
    const res = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId, agentId, locale, content })
    });

    if (!res.ok) throw new Error('Network error');

    // streaming via ReadableStream
    if (res.body && callbacks.onToken) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (value) callbacks.onToken(decoder.decode(value));
        done = streamDone;
      }
    }

    // optionally return final result
    const data = await res.json();
    return data;
  }

  return { sendMessage, getSessionId: () => sessionId };
}
