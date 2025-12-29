// import React, { useState, useRef, useEffect } from "react";
// import "./ChatbotPage.css";
// import { Send } from "lucide-react";

// const ChatbotPage = () => {
//   const [messages, setMessages] = useState([
//     { sender: "bot", text: "Hi 👋! Ask me anything about your uploaded research paper." },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // Auto-scroll to latest message
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     // Add user message immediately
//     const newMessages = [...messages, { sender: "user", text: input }];
//     setMessages(newMessages);
//     setInput("");
//     setLoading(true);

//     try {
//       // ✅ Correct backend endpoint for answering from Qdrant
//       const response = await fetch("http://127.0.0.1:5000/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ query: input }),
//       });

//       const data = await response.json();

//       // Handle server response
//       const botReply =
//         data.answer ||
//         data.message ||
//         "Sorry, I couldn’t find any relevant information in your document.";

//       setMessages([...newMessages, { sender: "bot", text: botReply }]);
//     } catch (error) {
//       console.error("Chat error:", error);
//       setMessages([
//         ...newMessages,
//         { sender: "bot", text: "⚠️ Error connecting to server. Please try again later." },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") handleSend();
//   };

//   return (
//     <div className="chatbot-container">
//       <h1 className="chatbot-title">📘 Research Paper Chatbot</h1>

//       <div className="chat-box">
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
//           >
//             <p>{msg.text}</p>
//           </div>
//         ))}
//         {loading && <p className="loading">🤖 Thinking...</p>}
//         <div ref={chatEndRef} />
//       </div>

//       <div className="chat-input">
//         <input
//           type="text"
//           placeholder="Ask something about your uploaded PDF..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//         />
//         <button onClick={handleSend} disabled={loading}>
//           <Send size={20} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatbotPage;














// import React, { useState, useRef, useEffect } from "react";
// import "./ChatbotPage.css";
// import { Send } from "lucide-react";

// const ChatbotPage = () => {
//   const [messages, setMessages] = useState([
//     { sender: "bot", text: "Hi 👋! Ask me anything about your uploaded research paper." },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // ✅ Get user_id from localStorage
//   const userId = localStorage.getItem("user_id");

//   // Auto-scroll to latest message
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     // Add user message immediately
//     const newMessages = [...messages, { sender: "user", text: input }];
//     setMessages(newMessages);
//     setInput("");
//     setLoading(true);

//     try {
//       // ✅ Send both query and user_id to backend
//       const response = await fetch("http://127.0.0.1:5000/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           query: input,
//           user_id: userId, // ✅ attach user_id here
//         }),
//       });

//       const data = await response.json();

//       const botReply =
//         data.answer ||
//         data.message ||
//         "Sorry, I couldn’t find any relevant information in your document.";

//       setMessages([...newMessages, { sender: "bot", text: botReply }]);
//     } catch (error) {
//       console.error("Chat error:", error);
//       setMessages([
//         ...newMessages,
//         { sender: "bot", text: "⚠️ Error connecting to server. Please try again later." },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") handleSend();
//   };

//   return (
//     <div className="chatbot-container">
//       <h1 className="chatbot-title">📘 Research Paper Chatbot</h1>

//       <div className="chat-box">
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
//           >
//             <p>{msg.text}</p>
//           </div>
//         ))}
//         {loading && <p className="loading">🤖 Thinking...</p>}
//         <div ref={chatEndRef} />
//       </div>

//       <div className="chat-input">
//         <input
//           type="text"
//           placeholder="Ask something about your uploaded PDF..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//         />
//         <button onClick={handleSend} disabled={loading}>
//           <Send size={20} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatbotPage;






















// import React, { useState, useRef, useEffect } from "react";
// import "./ChatbotPage.css";
// import { Send } from "lucide-react";

// const ChatbotPage = () => {
//   const [messages, setMessages] = useState([
//     { sender: "bot", text: "Hi 👋! Ask me anything about your uploaded research paper." },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // ✅ Get user info from localStorage
//   const user = JSON.parse(localStorage.getItem("user"));
//   const userId = user?.user_id;

//   // ✅ Load chat history from backend when page loads
//   useEffect(() => {
//     if (userId) {
//       fetch(`http://127.0.0.1:5000/api/chat_history/${userId}`)
//         .then((res) => res.json())
//         .then((data) => {
//           if (data.history?.length > 0) {
//             const historyMsgs = [];
//             // reverse to show oldest first
//             data.history.reverse().forEach((h) => {
//               historyMsgs.push({ sender: "user", text: h.query });
//               historyMsgs.push({ sender: "bot", text: h.answer });
//             });
//             setMessages((prev) => [
//               { sender: "bot", text: "Welcome back 👋 Here’s your previous chat history!" },
//               ...historyMsgs,
//             ]);
//           }
//         })
//         .catch((err) => console.error("Error fetching chat history:", err));
//     }
//   }, [userId]);

//   // ✅ Auto-scroll to latest message
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ✅ Send message
//   const handleSend = async () => {
//     if (!input.trim()) return;

//     const newMessages = [...messages, { sender: "user", text: input }];
//     setMessages(newMessages);
//     setInput("");
//     setLoading(true);

//     try {
//       const response = await fetch("http://127.0.0.1:5000/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           query: input,
//           user_id: userId, // ✅ attach user_id
//         }),
//       });

//       const data = await response.json();

//       const botReply =
//         data.answer ||
//         data.message ||
//         "Sorry, I couldn’t find any relevant information in your document.";

//       setMessages([...newMessages, { sender: "bot", text: botReply }]);
//     } catch (error) {
//       console.error("Chat error:", error);
//       setMessages([
//         ...newMessages,
//         { sender: "bot", text: "⚠️ Error connecting to server. Please try again later." },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Handle Enter key
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") handleSend();
//   };

//   return (
//     <div className="chatbot-container">
//       <h1 className="chatbot-title">📘 Research Paper Chatbot</h1>

//       <div className="chat-box">
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
//           >
//             <p>{msg.text}</p>
//           </div>
//         ))}
//         {loading && <p className="loading">🤖 Thinking...</p>}
//         <div ref={chatEndRef} />
//       </div>

//       <div className="chat-input">
//         <input
//           type="text"
//           placeholder="Ask something about your uploaded PDF..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//         />
//         <button onClick={handleSend} disabled={loading}>
//           <Send size={20} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatbotPage;











// import React, { useState, useRef, useEffect } from "react";
// import "./ChatbotPage.css";
// import { Send } from "lucide-react";

// const ChatbotPage = () => {
//   const [messages, setMessages] = useState([
//     { sender: "bot", text: "Hi 👋! Ask me anything about your uploaded research paper." },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const chatEndRef = useRef(null);

//   // ✅ Get user info and token from localStorage
//   const user = JSON.parse(localStorage.getItem("user"));
//   const userId = user?.user_id;
//   const token = localStorage.getItem("token");

//   // ✅ Redirect to login if no token found
//   useEffect(() => {
//     if (!token) {
//       alert("Please log in to access the chatbot!");
//       window.location.href = "/";
//     }
//   }, [token]);

//   // ✅ Load chat history when page loads
//   useEffect(() => {
//     if (userId && token) {
//       fetch(`http://127.0.0.1:5000/api/chat_history/${userId}`, {
//         headers: { Authorization: `Bearer ${token}` }, // ✅ send JWT
//       })
//         .then((res) => {
//           if (res.status === 401) {
//             alert("Session expired. Please log in again.");
//             localStorage.clear();
//             window.location.href = "/";
//           }
//           return res.json();
//         })
//         .then((data) => {
//           if (data.history?.length > 0) {
//             const historyMsgs = [];
//             data.history.reverse().forEach((h) => {
//               historyMsgs.push({ sender: "user", text: h.query });
//               historyMsgs.push({ sender: "bot", text: h.answer });
//             });
//             setMessages((prev) => [
//               { sender: "bot", text: "Welcome back 👋 Here’s your previous chat history!" },
//               ...historyMsgs,
//             ]);
//           }
//         })
//         .catch((err) => console.error("Error fetching chat history:", err));
//     }
//   }, [userId, token]);

//   // ✅ Auto-scroll to latest message
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ✅ Send message
//   const handleSend = async () => {
//     if (!input.trim()) return;

//     const newMessages = [...messages, { sender: "user", text: input }];
//     setMessages(newMessages);
//     setInput("");
//     setLoading(true);

//     try {
//         const response = await fetch("http://127.0.0.1:5000/api/chat", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json", // ✅ REQUIRED
//       Accept: "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       bot_id: "default_bot",
//       query: input,
//     }),
//   });


//       if (response.status === 401) {
//         alert("Unauthorized! Please log in again.");
//         localStorage.clear();
//         window.location.href = "/";
//         return;
//       }

//       const data = await response.json();

//       const botReply =
//         data.answer ||
//         data.message ||
//         "Sorry, I couldn’t find any relevant information in your document.";

//       setMessages([...newMessages, { sender: "bot", text: botReply }]);
//     } catch (error) {
//       console.error("Chat error:", error);
//       setMessages([
//         ...newMessages,
//         { sender: "bot", text: "⚠️ Error connecting to server. Please try again later." },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Handle Enter key
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") handleSend();
//   };

//   return (
//     <div className="chatbot-container">
//       <h1 className="chatbot-title">📘 Research Paper Chatbot</h1>

//       <div className="chat-box">
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
//           >
//             <p>{msg.text}</p>
//           </div>
//         ))}
//         {loading && <p className="loading">🤖 Thinking...</p>}
//         <div ref={chatEndRef} />
//       </div>

//       <div className="chat-input">
//         <input
//           type="text"
//           placeholder="Ask something about your uploaded PDF..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//         />
//         <button onClick={handleSend} disabled={loading}>
//           <Send size={20} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatbotPage;













import React, { useState, useRef, useEffect } from "react";
import "./ChatbotPage.css";
import { Send } from "lucide-react";

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋! Ask me anything about your uploaded research paper." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [botId, setBotId] = useState(""); // ✅ store selected bot_id
  const chatEndRef = useRef(null);

  // ✅ Get user info and token from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.user_id;
  const token = localStorage.getItem("token");

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!token) {
      alert("Please log in to access the chatbot!");
      window.location.href = "/";
    }
  }, [token]);

  // ✅ Fetch user's available bots (latest one auto-selected)
  useEffect(() => {
    const fetchBots = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/my_bots", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.bots?.length > 0) {
          // ✅ pick latest uploaded bot
          const latestBot = data.bots[data.bots.length - 1];
          setBotId(latestBot.bot_id);
          console.log("✅ Using bot:", latestBot.bot_id);
        } else {
          alert("No chatbot found! Please upload a PDF first.");
          window.location.href = "/home";
        }
      } catch (err) {
        console.error("Error fetching bots:", err);
      }
    };

    if (token) fetchBots();
  }, [token]);

  // ✅ Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Handle send message
  const handleSend = async () => {
    if (!input.trim() || !botId) return;

    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bot_id: botId, // ✅ dynamic bot_id (auto-assigned during upload)
          query: input,
        }),
      });

      if (response.status === 401) {
        alert("Unauthorized! Please log in again.");
        localStorage.clear();
        window.location.href = "/";
        return;
      }

      const data = await response.json();
      const botReply =
        data.answer ||
        data.message ||
        "Sorry, I couldn’t find any relevant information in your document.";

      setMessages([...newMessages, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        { sender: "bot", text: "⚠️ Error connecting to server. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
 

    <div className="chatbot-container">


      <h1 className="chatbot-title">📘 Research Paper Chatbot</h1>

      {botId ? (
        <>
          <div className="chat-box">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
              >
                <p>{msg.text}</p>
              </div>
            ))}
            {loading && <p className="loading">🤖 Thinking...</p>}
            <div ref={chatEndRef} />
                      {/* <div className="chat-input">
            <input
              type="text"
              placeholder="Ask something about your uploaded PDF..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSend} disabled={loading}>
              <Send size={20} />
            </button>
          </div> */}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Ask something about your uploaded PDF..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSend} disabled={loading}>
              <Send size={20} />
            </button>
          </div>
        </>
      ) : (
        <p className="loading">🔍 Loading your chatbot...</p>
      )}
    </div>

  );
};

export default ChatbotPage;
