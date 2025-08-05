import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import './App.css'
import TopNavbar from "./components/TopNavbar";
import WelcomeSection from "./screenone/WelcomeSection";
import AdSection from "./screentwo/AdSection";
import QrViewer from './screenthree/QrViewer';
import Footer from "./components/Footer";
import Help from "./components/Help";
import ShopInfo from "./screenthree/ShopInfo";

/**
 * Main application component with page management and footer interaction
 */
function MainApp({ selectedLang, setSelectedLang }) {
  // State management for language, current page, and footer visibility
  const [currentPage, setCurrentPage] = useState("welcome");
  const [showFooter, setShowFooter] = useState(false);
  const [showFooterBar, setShowFooterBar] = useState(false);

  // Mouse position detection for footer interaction
  useEffect(() => {
    const handleMouseMove = (e) => {
      const positionPercentage = (e.clientY / window.innerHeight) * 100;
      setShowFooterBar(positionPercentage >= 99);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="page-wrapper w-screen flex flex-col overflow-hidden" style={{
      background: "linear-gradient(to bottom, #0F172A, #0F172A)",
      height: "100vh",
      position: "relative"
    }}>
      <TopNavbar selectedLang={selectedLang} setSelectedLang={setSelectedLang} />

      {/* Dynamic content area */}
      <div className="page-content flex-grow flex flex-col overflow-hidden">
        {currentPage === "welcome" ? (
          <WelcomeSection selectedLang={selectedLang} setSelectedLang={setSelectedLang} setCurrentPage={setCurrentPage} />
        ) : (
          <AdSection selectedLang={selectedLang} pauseAds={showFooter} />
        )}
      </div>

      {/* Footer activation bar */}
      <div
        className="footer-hover-bar"
        onClick={() => setShowFooter(true)}
        style={{ opacity: showFooterBar ? 1 : 0 }}
      ></div>

      {/* Conditional footer display */}
      {showFooter && (
        <div className="footer-overlay" onClick={() => setShowFooter(false)}>
          <div className="footer-wrapper" onClick={(e) => e.stopPropagation()}>
            <Footer setCurrentPage={setCurrentPage} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * QR code viewer standalone page
 */
function QrViewerPage({ selectedLang, setSelectedLang }) {
  return (
    <div className="w-screen min-h-screen" 
      style={{
        background: "linear-gradient(to bottom, #0F172A, #0F172A)",
        color: "white"
      }}>
      <TopNavbar selectedLang={selectedLang} setSelectedLang={setSelectedLang} />
      <QrViewer selectedLang={selectedLang} />
    </div>
  );
}

/**
 * Help page wrapper with language state management
 */
function HelpWrapper({ selectedLang, setSelectedLang }) {
  return <Help selectedLang={selectedLang} setSelectedLang={setSelectedLang} />;
}

/**
 * Root application component with routing configuration
 */
function App() {
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem("selectedLang") || "English");

  // Persist language selection
  useEffect(() => {
    localStorage.setItem("selectedLang", selectedLang);
  }, [selectedLang]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp selectedLang={selectedLang} setSelectedLang={setSelectedLang} />} />
        <Route path="/qrview" element={<QrViewerPage selectedLang={selectedLang} setSelectedLang={setSelectedLang} />} />
        <Route path="/qr-viewer/:shopId" element={
          <QrViewerPage selectedLang={selectedLang} setSelectedLang={setSelectedLang} />
        } />
        <Route path="/shop-info" element={<ShopInfo selectedLang={selectedLang} setSelectedLang={setSelectedLang} />} />
        <Route path="/help" element={<HelpWrapper selectedLang={selectedLang} setSelectedLang={setSelectedLang} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
