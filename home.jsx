import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  // ✅ for navigation
import "./home.css";
import Navbar from "./navbar.jsx";

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // ✅ popup state

  const navigate = useNavigate();

  // 📂 File change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setUploadStatus("");
    } else {
      setUploadStatus("❌ Please select a valid PDF file.");
    }
  };


const handleUpload = async () => {
  if (!selectedFile) {
    setUploadStatus("⚠️ Please choose a PDF first.");
    return;
  }

  // Get token and user info
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    setUploadStatus("❌ Unauthorized! Please login first.");
    return;
  }

  // You probably want to let user enter chatbot name; for now prompt:
  const chatbotName = window.prompt("Enter a name for your chatbot:", "MyNewBot");
  if (!chatbotName) {
    setUploadStatus("⚠️ Please provide a chatbot name.");
    return;
  }

  // Create FormData for file upload
  const formData = new FormData();
  formData.append("chatbot_name", chatbotName); // backend expects this
  formData.append("pdf", selectedFile);         // backend expects "pdf"

  try {
    setLoading(true);
    setUploadStatus("Uploading... ⏳");

    const response = await fetch("http://127.0.0.1:5000/api/upload_pdf", {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // send JWT
      },
      body: formData, // send formData (do NOT set Content-Type manually)
    });

    const data = await response.json();

    if (response.ok) {
      setUploadStatus(`✅ ${data.message}`);
      setShowPopup(true);
    } else {
      setUploadStatus(`❌ Upload failed: ${data.error || data.message}`);
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    setUploadStatus("❌ Something went wrong while uploading.");
  } finally {
    setLoading(false);
  }
};



  // ✅ Popup actions
  const handleContinue = () => {
    setShowPopup(false);
    navigate("/bot"); // redirect to chatbot page
  };

  const handleCancel = () => setShowPopup(false);

  return (
    <div className="home-container">
      <Navbar />
      <div className="outer-container">
        <div className="content">
          {/* Hero Section */}
          <section className="hero">
            <h1 className="title">AI-Powered Research Q&A</h1>
            <p className="subtitle">
              Upload academic papers (PDF, DOCX, URL) and instantly get
              summaries, methodology breakdowns, dataset details, formula
              extraction, architecture insights, and more.
            </p>

            <div className="upload-container">
              <label className="upload-btn">
                Upload Your PDF
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden-input"
                  onChange={handleFileChange}
                />
              </label>

              <button
                className="upload-confirm-btn"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Start Upload"}
              </button>
            </div>

            {/* ✅ Show upload status */}
            {uploadStatus && (
              <p
                className={`upload-status ${
                  uploadStatus.startsWith("✅")
                    ? "success"
                    : uploadStatus.startsWith("❌")
                    ? "error"
                    : "info"
                }`}
              >
                {uploadStatus}
              </p>
            )}
          </section>

          {/* ✅ Close hero section before starting features */}

          {/* Features */}
          <section className="features">
            <div className="feature-box">
              <h3>⚡ Fast Summaries</h3>
              <p>Turn full papers into concise flashcards in seconds.</p>
            </div>
            <div className="feature-box">
              <h3>🔍 Section Breakdown</h3>
              <p>Deep dive into methodology, results, formulas, and datasets.</p>
            </div>
            <div className="feature-box">
              <h3>📊 Data & Tables</h3>
              <p>Extract tables and figures in an easy-to-read format.</p>
            </div>
            <div className="feature-box">
              <h3>🔗 References & Citations</h3>
              <p>Generate annotated bibliography, integrate with Zotero.</p>
            </div>
          </section>

          {/* Info Section */}
          <div className="info-section">
            <h2>Who It's For:</h2>
            <ul>
              <li>Students & PhD candidates overwhelmed by research.</li>
              <li>Researchers needing quick insights and comparisons.</li>
              <li>Project developers seeking architecture & dataset clarity.</li>
            </ul>

            <h2>Benefits:</h2>
            <ul>
              <li>Save hours of reading and manual extraction.</li>
              <li>Boost comprehension with AI-curated summaries.</li>
              <li>Easily manage citations, tables, and references.</li>
              <li>Supports literature review, projects, and thesis prep.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ✅ POPUP MODAL */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>PDF Uploaded Successfully!</h2>
            <p>Do you want to continue and chat with your uploaded file?</p>
            <div className="popup-actions">
              <button className="confirm-btn" onClick={handleContinue}>
                Yes, Continue
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                No, Stay Here
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

