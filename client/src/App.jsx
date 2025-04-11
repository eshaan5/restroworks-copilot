import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import logo from "./assets/Black-Corbi-restrobot.png";
import { Mic } from "lucide-react";

function App() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [showHello, setShowHello] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");

  const sendQuestion = async () => {
    if (!question) return;

    const newMessages = [...messages, { q: question, a: "..." }];
    console.log("New Messages:", newMessages);
    setMessages(newMessages);
    setQuestion("");

    // Prepare the last 5 messages for context
    const recentHistory = newMessages
      .slice(-6, -1) // last 5 before the latest (just added '...')
      .map(({ q, a }) => [
        { role: "user", content: q },
        { role: "chatbot", content: a },
      ])
      .flat(); // flatten user-bot pairs

    console.log("Recent History:", recentHistory);

    const res = await fetch("http://localhost:3000/api/chatbot/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, recentHistory }),
    });

    const data = await res.json();

    // Replace last message with actual bot response
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { q: question, a: data.answer };
      return updated;
    });
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
        setQuestion((prev) => {
          const combined = prev
            ? prev + " " + finalTranscript
            : finalTranscript;
          sendQuestionWrapper(combined); // pass to wrapper
          return ""; // clear input
        });
      }

      transcriptRef.current = ""; // reset for next round
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowHello(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {/* Floating Button */}
      {/* <div className="chatbot-launcher" onClick={() => {setIsOpen(!isOpen)
        setShowHello(false);
      }}>
        💬
        {showHello && <div className="hello-bubble">Hello! Need help?</div>}
      </div> */}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <img src={logo} alt="Chatbot Icon" width={"36px"} />
            <strong>Restroworks Copilot</strong>
            {/* <button onClick={() => setIsOpen(false)}>×</button> */}
          </div>

          <div className="chat-window">
            {messages.length === 0 ? (
              <div className="empty-state">
                <h3>How can I help you today?</h3>
                <p>
                  Ask me anything about Restroworks. I know them inside out😎
                </p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="message-pair">
                  <div
                    className="user-msg"
                    style={{
                      textAlign: "right",
                      marginBottom: "4px",
                      maxWidth: "60%",
                    }}
                  >
                    {msg.q}
                  </div>
                  <div
                    className={`${msg.a === "..." ? "bot-msg" : ""}`}
                    style={{
                      textAlign: "left",
                      marginBottom: "16px",
                      fontStyle: msg.a === "..." ? "italic" : "normal",
                      color: msg.a === "..." ? "#aaa" : "#000",
                      maxWidth: "60%",
                    }}
                  >
                    {msg.a === "..." ? (
                      <span className="typing-indicator">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                      </span>
                    ) : (
                      msg.a
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* <div className="chat-input">
            <input
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Type your question..."
            />
            <button onClick={sendQuestion}>Send</button>
          </div> */}

          <div
            className="chat-input"
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            <button
              onClick={startListening}
              title="Speak"
              style={{
                background: "black",
                padding: "8px",
                borderRadius: "8px",
              }}
            >
              <Mic
                color="white"
                size={24}
                className={isListening ? "mic-pulse" : ""}
              />
            </button>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type or speak your question..."
              style={{ flex: 1 }}
              onKeyDown={handleKeyDown}
            />
            <button style={{ background: "black" }} onClick={sendQuestion}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
