import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './assets/posist-glificon-logo.png';

function App() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showHello, setShowHello] = useState(true);

  const sendQuestion = async () => {
    if (!question) return;
  
    const newMessages = [...messages, { q: question, a: '...' }];
    console.log('New Messages:', newMessages);
    setMessages(newMessages);
    setQuestion('');

    // Prepare the last 5 messages for context
    const recentHistory = newMessages
      .slice(-6, -1) // last 5 before the latest (just added '...')
      .map(({ q, a }) => [{ role: 'user', content: q }, { role: 'chatbot', content: a }])
      .flat(); // flatten user-bot pairs

    console.log('Recent History:', recentHistory);
  
    const res = await fetch('http://localhost:3000/api/chatbot/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, recentHistory })
    });
  
    const data = await res.json();
  
    // Replace last message with actual bot response
    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = { q: question, a: data.answer };
      return updated;
    });
  };  

  useEffect(() => {
    const timer = setTimeout(() => setShowHello(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {/* Floating Button */}
      <div className="chatbot-launcher" onClick={() => {setIsOpen(!isOpen)
        setShowHello(false);
      }}>
        💬
        {showHello && <div className="hello-bubble">Hello! Need help?</div>}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-box">
          <div className="chatbot-header">
          <img src={logo} alt="Chatbot Icon" width={'36px'} />
            <strong>Restroworks Copilot</strong>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chat-window">
            {messages.map((msg, index) => (
              <div key={index} className="message-pair">
                <div className='user-msg' style={{ textAlign: 'right', marginBottom: '4px', maxWidth: '60%' }}>
                  {msg.q}
                </div>
                <div className={`${msg.a === '...' ? 'bot-msg' : ''}`}
                  style={{
                    textAlign: 'left',
                    marginBottom: '16px',
                    fontStyle: msg.a === '...' ? 'italic' : 'normal',
                    color: msg.a === '...' ? '#aaa' : '#000',
                    maxWidth: '60%',
                  }}
                >
                  {msg.a === '...' ? (
                    <span className="typing-indicator">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  ) : (
                    msg.a
                  )}
                </div>
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