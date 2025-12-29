import React from "react";
import "./aboutus.css";
import Navbar from './navbar.jsx';

export default function About() {
  return (
    <div className="about-container">
      {/* Glowing background elements */}
      <div className="background-shape"></div>
      <div className="background-shape-2"></div>
      <div className="background-shape-3"></div>
      <Navbar />
      {/* Main content */}
      <div className="about-content">
        <h1 className="about-title">About <span className="highlight">Extractify</span></h1>
        <p className="about-subtitle">
          Extractify is a free AI-powered platform built to assist <b>students, teachers, and developers</b> 
          in effortlessly understanding complex research papers. Our mission is to make research 
          <b>accessible, faster, and more insightful</b> for everyone.
        </p>

        <div className="about-section">
          <h2>What We Offer</h2>
          <ul>
            <li>Instant extraction of <b>tables, formulas, datasets, and figures</b> from research papers.</li>
            <li>AI-generated <b>summaries and methodology breakdowns</b> for academic content.</li>
            <li>Seamless <b>PDF, DOCX, or URL uploads</b> for processing.</li>
            <li>Completely <b>free to use</b> — no hidden charges for students or educators.</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Our Vision</h2>
          <p>
            We aim to create a world where knowledge is universally accessible — 
            where AI bridges the gap between complex academic language and real-world understanding. 
            Whether you're doing a <b>PhD, class project, or research analysis</b>, Extractify helps 
            you focus on learning, not manual extraction.
          </p>
        </div>

        <div className="about-section">
          <h2>Who Can Benefit</h2>
          <ul>
            <li>Students preparing literature reviews or assignments.</li>
            <li>Researchers analyzing multiple papers quickly.</li>
            <li>Teachers summarizing academic references for lectures.</li>
            <li>Developers building AI-based academic tools.</li>
          </ul>
        </div>

        <div className="about-footer">
          <p>Empowering research through AI — <b>one paper at a time.</b></p>
        </div>
      </div>
    </div>
  );
}
