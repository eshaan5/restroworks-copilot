import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showHello, setShowHello] = useState(true);

  const sendQuestion = async () => {
    if (!question) return;
    const res = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    setMessages([...messages, { q: question, a: data.answer }]);
    setQuestion('');
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowHello(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {/* Floating Button */}
      <div className="chatbot-launcher" onClick={() => setIsOpen(!isOpen)}>
        💬
        {showHello && <div className="hello-bubble">Hello! Need help?</div>}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <strong>Billing Assistant</strong>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chat-window">
            {messages.map((msg, i) => (
              <div key={i} className="chat-msg">
                <div className="user-msg">You: {msg.q}</div>
                <div className="bot-msg">Bot: {msg.a}</div>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Type your question..."
            />
            <button onClick={sendQuestion}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;