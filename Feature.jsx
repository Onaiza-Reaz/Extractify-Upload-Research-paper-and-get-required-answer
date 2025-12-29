import React from "react";
import "./Feature.css";
import Navbar from "./navbar.jsx";
import { FaBrain, FaSearch, FaBookReader, FaChartBar, FaRobot, FaDatabase } from "react-icons/fa";

export default function Feature() {
  return (
    <div className="features-container">
      {/* Glowing Background Layers */}
      <div className="features-bg"></div>
      <div className="features-glow1"></div>
      <div className="features-glow2"></div>
      <Navbar />

      {/* Main Content */}
      <div className="features-content">
        <h1 className="features-title">Powerful AI Features</h1>
        <p className="features-subtitle">
          Discover the next generation of research intelligence. 
          Built for speed, precision, and clarity — so you can focus on innovation.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <FaBrain className="feature-icon" />
            <h3>AI-Driven Understanding</h3>
            <p>
              Comprehend complex papers instantly with deep semantic AI trained on academic data.
            </p>
          </div>

          <div className="feature-card">
            <FaSearch className="feature-icon" />
            <h3>Smart Context Search</h3>
            <p>
              Ask natural questions and get context-aware answers, not just keyword matches.
            </p>
          </div>

          <div className="feature-card">
            <FaBookReader className="feature-icon" />
            <h3>Dynamic Summaries</h3>
            <p>
              Summarize entire papers or specific sections with customizable length and tone.
            </p>
          </div>

          <div className="feature-card">
            <FaChartBar className="feature-icon" />
            <h3>Data Extraction</h3>
            <p>
              Automatically extract tables, figures, and statistical data for quick review.
            </p>
          </div>

          <div className="feature-card">
            <FaRobot className="feature-icon" />
            <h3>Model Insights</h3>
            <p>
              Identify architectures, datasets, and evaluation metrics in AI papers easily.
            </p>
          </div>

          <div className="feature-card">
            <FaDatabase className="feature-icon" />
            <h3>Reference Management</h3>
            <p>
              Export references to Zotero, Mendeley, or BibTeX with one click.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
