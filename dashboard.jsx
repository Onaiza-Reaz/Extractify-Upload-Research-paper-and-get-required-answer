import React, { useEffect, useState } from "react";
import "./dashboard.css";

export default function Dashboard() {
  // ✅ State variables
  const [bots, setBots] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch user bots
const fetchBots = async () => {
  try {
    const token = localStorage.getItem("token"); // ← ensure you saved token after login
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    const response = await fetch("http://127.0.0.1:5000/get_my_chatbots", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // ← REQUIRED for JWT
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Bots fetched:", data);
  } catch (error) {
    console.error("Fetch bots error:", error);
  }
};



  // ✅ Fetch bot’s chat history
  const fetchBotHistory = async (botId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://127.0.0.1:5000/get_bot_chat_history?bot_id=${botId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      if (res.ok) setChatHistory(data.history || []);
      else console.error("Error fetching chat history:", data.error);
    } catch (err) {
      console.error("Fetch chat history error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle “View Chat History” button
  const handleViewChat = (botId) => {
    setSelectedBot(botId);
    fetchBotHistory(botId);
  };

  // ✅ Load bots on mount
  useEffect(() => {
    fetchBots();
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">📊 My Chatbots</h1>

      {loading && <div className="loader">Loading...</div>}

      {/* ---------- Bot Grid ---------- */}
      {!selectedBot && (
        <div className="bot-grid">
          {bots.length > 0 ? (
            bots.map((bot) => (
              <div key={bot.bot_id} className="bot-card">
                <h3>{bot.chatbot_name}</h3>
                <p><strong>ID:</strong> {bot.bot_id}</p>
                <p>
                  <strong>Created:</strong>{" "}
                  {bot.created_at
                    ? new Date(bot.created_at).toLocaleString()
                    : "N/A"}
                </p>
                <button
                  className="view-btn"
                  onClick={() => handleViewChat(bot.bot_id)}
                >
                  View Chat History 💬
                </button>
              </div>
            ))
          ) : (
            <p className="no-bots">No chatbots found for your account.</p>
          )}
        </div>
      )}

      {/* ---------- Chat History ---------- */}
      {selectedBot && (
        <div className="chat-history-section">
          <button className="back-btn" onClick={() => setSelectedBot(null)}>
            ← Back to Bots
          </button>
          <h2>Chat History: {selectedBot}</h2>

          <div className="chat-history">
            {chatHistory.length > 0 ? (
              chatHistory.map((chat, idx) => (
                <div key={idx} className="chat-message">
                  <div className="chat-query">
                    <strong>🧑 You:</strong> {chat.query}
                  </div>
                  <div className="chat-answer">
                    <strong>🤖 Bot:</strong> {chat.answer}
                  </div>
                  <div className="chat-time">
                    ⏱ {chat.timestamp || "No timestamp"}
                  </div>
                </div>
              ))
            ) : (
              <p>No previous chats found for this bot.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
