import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Send,
  ChevronDown,
  PlusCircle,
  Settings,
  LogOut,
} from "lucide-react";
import logo from "./assets/posist-glificon-logo.png";
import "./FullPageChatbot.css"; // Import your CSS file for styling

// Import the existing chatbot logic but don't render the floating component
// import { sendQuestionToAPI } from './chatUtils'; // You'll need to extract this logic

function FullPageChatbot() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [conversations, setConversations] = useState([
    { id: 1, title: "Menu Planning", active: true },
    { id: 2, title: "Inventory Management", active: false },
    { id: 3, title: "Staff Scheduling", active: false },
  ]);

  const chatWindowRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");

  // Handle scrolling to bottom when new messages arrive
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const sendQuestion = async () => {
    if (!question.trim()) return;

    const newMessages = [
      ...messages,
      { q: question, a: "...", timestamp: new Date() },
    ];
    setMessages(newMessages);
    setQuestion("");

    // Prepare the last 5 messages for context
    const recentHistory = newMessages
      .slice(-6, -1)
      .map(({ q, a }) => [
        { role: "user", content: q },
        { role: "chatbot", content: a },
      ])
      .flat();

    try {
      const res = await fetch("http://localhost:3000/api/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, recentHistory }),
      });

      const data = await res.json();

      // Replace last message with actual bot response
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          q: question,
          a: data.answer,
          timestamp: updated[updated.length - 1].timestamp,
          responseTime: new Date(),
        };
        return updated;
      });
    } catch (error) {
      console.error("Error fetching response:", error);
      // Update with error message
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          q: question,
          a: "Sorry, I couldn't process your request. Please try again.",
          timestamp: updated[updated.length - 1].timestamp,
          responseTime: new Date(),
          error: true,
        };
        return updated;
      });
    }
  };

  const sendQuestionWrapper = async (questionText) => {
    if (!questionText) return;

    const newMessages = [...messages, { q: questionText, a: "..." }];
    setMessages(newMessages);
    setQuestion("");

    const recentHistory = newMessages
      .slice(-6, -1)
      .map(({ q, a }) => [
        { role: "user", content: q },
        { role: "chatbot", content: a },
      ])
      .flat();

    const res = await fetch("http://localhost:3000/api/chatbot/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: questionText, recentHistory }),
    });

    const data = await res.json();

    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { q: questionText, a: data.answer };
      return updated;
    });
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);

      // Optional: play mic sound
      const audio = new Audio("/mic-on.mp3");
      audio.play().catch(() => {});
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      transcriptRef.current = transcript;
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);

      const finalTranscript = transcriptRef.current.trim();
      if (finalTranscript) {
        sendQuestionWrapper(finalTranscript);
        setQuestion(""); // optional UI sync
      }

      transcriptRef.current = "";
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const createNewConversation = () => {
    window.location.reload();
  };

  const selectConversation = (id) => {
    setConversations(
      conversations.map((conv) => ({
        ...conv,
        active: conv.id === id,
      }))
    );

    // In a real app, you'd load this conversation's messages
    if (id === 1) {
      setMessages([
        {
          q: "How can I optimize my menu planning?",
          a: "I can help you analyze your menu for profitability and popularity. Would you like to focus on cost reduction, seasonal items, or popular trends?",
          timestamp: new Date(Date.now() - 3600000),
          responseTime: new Date(Date.now() - 3590000),
        },
      ]);
    } else if (id === 2) {
      setMessages([
        {
          q: "How do I reduce inventory waste?",
          a: "To reduce inventory waste, you should implement a first-in-first-out system, track expiration dates carefully, and use predictive analytics to order more accurately. Would you like me to elaborate on any of these approaches?",
          timestamp: new Date(Date.now() - 7200000),
          responseTime: new Date(Date.now() - 7190000),
        },
      ]);
    } else if (id === 3) {
      setMessages([
        {
          q: "What's the best way to schedule staff during busy seasons?",
          a: "For busy seasons, I recommend analyzing historical data to identify peak hours, creating a flexible roster with on-call staff, and using a digital scheduling system that allows quick adjustments. Would you like specific recommendations for your restaurant type?",
          timestamp: new Date(Date.now() - 10800000),
          responseTime: new Date(Date.now() - 10790000),
        },
      ]);
    } else {
      setMessages([]);
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  return (
    <div className="full-page-chatbot">
      <div className="chatbot-layout">
        {/* Sidebar */}
        <div
          className={`chatbot-sidebar ${
            showSidebar ? "expanded" : "collapsed"
          }`}
        >
          <div className="sidebar-header">
            <div className="logo-container">
              <img src={logo} alt="Restroworks Logo" className="logo" />
              <h1>Restroworks Copilot</h1>
            </div>
            {/* <button 
              className="toggle-sidebar-btn" 
              onClick={() => setShowSidebar(!showSidebar)}
              aria-label="Toggle sidebar"
            >
              <ChevronDown size={20} />
            </button> */}
          </div>

          <div className="new-chat-button-container">
            <button className="new-chat-button" onClick={createNewConversation}>
              <PlusCircle size={16} />
              <span>New chat</span>
            </button>
          </div>

          {/* <div className="conversations-list">
            <h2>Recent conversations</h2>
            {conversations.map(conversation => (
              <div 
                key={conversation.id} 
                className={`conversation-item ${conversation.active ? 'active' : ''}`}
                onClick={() => selectConversation(conversation.id)}
              >
                {conversation.title}
              </div>
            ))}
          </div> */}

          {/* <div className="sidebar-footer">
            <button className="sidebar-footer-btn">
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button className="sidebar-footer-btn">
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div> */}
        </div>

        {/* Main Chat Area */}
        <div className="chatbot-main">
          <div className="chat-container">
            <div className="chat-header">
              <h2>Hello Buddy!</h2>
            </div>

            <div className="chat-messages" ref={chatWindowRef}>
              {messages.length === 0 ? (
                <div className="empty-state">
                  <h3>How can I help you today?</h3>
                  <p>
                    Ask me anything about Restroworks. I know them inside out😎
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="message-group">
                    <div className="message-timestamp">
                      {formatTime(msg.timestamp)}
                    </div>

                    <div className="user-message">
                      <div className="message-avatar user">You</div>
                      <div className="message-bubble user-bubble">{msg.q}</div>
                    </div>

                    <div className="assistant-message">
                      <div className="message-avatar assistant">RC</div>
                      <div
                        className={`message-bubble assistant-bubble ${
                          msg.error ? "error" : ""
                        }`}
                      >
                        {msg.a === "..." ? (
                          <div className="typing-indicator">
                            <span>.</span>
                            <span>.</span>
                            <span>.</span>
                          </div>
                        ) : (
                          msg.a
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="chat-input-container">
              <div className="input-wrapper">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Restroworks Copilot..."
                  rows={1}
                  className="chat-input-area"
                />

                <div className="input-actions">
                  <button
                    onClick={sendQuestion}
                    disabled={!question.trim()}
                    className="action-button send-button"
                    title="Send message"
                  >
                    <Send size={20} color="black" />
                  </button>
                  <button
                    onClick={startListening}
                    className={`action-button mic-button ${
                      isListening ? "listening" : ""
                    }`}
                    title="Voice input"
                  >
                    <Mic size={20} color="black" />
                  </button>
                </div>
              </div>

              <div className="input-footer">
                <p>
                  Restroworks Copilot is just born today and can make mistakes🥹.
                  Consider checking important information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FullPageChatbot;
