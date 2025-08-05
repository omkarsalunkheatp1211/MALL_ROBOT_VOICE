import React, { useState, useEffect, useRef } from "react";
import "./ShopInfo.css";
import { useNavigate } from "react-router-dom";
import Microphonebutton from "../screentwo/Microphonebutton";
import TopNavbar from '../components/TopNavbar';
import Footer from '../components/Footer';
import Robot from "../Robot/Robot";
import ShopInfoContainer from './ShopInfoContainer';
import { QRCodeSVG } from 'qrcode.react';
import adSampleData from "../screentwo/AdSampleData";

/**
 * Main section component
 * @param {Object} props 
 * @param {string} props.selectedLang 
 * @param {boolean} props.pauseAds 
 */
const ShopInfo = ({ selectedLang, setSelectedLang }) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // State for footer visibility
  const [showFooter, setShowFooter] = useState(false);
  const [showFooterBar, setShowFooterBar] = useState(false);

  // State for QR code visibility (lifted from ShopInfoContainer)
  const [showQrCode, setShowQrCode] = useState(false);

  // State for shop ID
  const [shopId, setShopId] = useState("1");

  // Get shop data
  const shop = adSampleData.find(item => item.id === shopId);

  // Generate QR code URL for the shop
  const generateQrUrl = () => {
    const baseUrl = window.location.origin;
    // Create language mapping for URL encoding
    const langUrlMap = {
      "English": "English",
      "हिंदी": "हिंदी",
      "मराठी": "मराठी"
    };
    
    const urlLang = langUrlMap[selectedLang] || "en";
    return `${baseUrl}/qrview?id=${encodeURIComponent(shopId)}&lang=${urlLang}`;
  };

  // Inactivity timer logic
  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      // Set a 2-minute timer to redirect to the homepage
      timerRef.current = setTimeout(() => {
        navigate("/");
      }, 50 * 60 * 1000);
    };

    // If footer or QR code is shown, pause the timer by clearing it
    if (showFooter || showQrCode) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    } else {
      // Otherwise, start or restart the timer
      resetTimer();
    }

    return () => clearTimeout(timerRef.current);
  }, [showFooter, showQrCode, navigate]);

  // Mouse position detection for footer
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
    <div className="page-wrapper w-screen flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #0F172A, #0F172A)",
        height: "100vh",
        position: "relative"
      }}>
      {/* Top Navigation */}
      <TopNavbar selectedLang={selectedLang} setSelectedLang={setSelectedLang} />

      {/* Main Content Area */}
      <div className="page-content"
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: 'calc(100vh - 60px)',
          width: '100%',
          position: 'relative'
        }}>
        {/* Left Section (60%) */}
        <div
          className="left-section"
          style={{
            width: '60%',
            height: '100%',
            borderRight: '2px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          {/* Top 80% Robot display area */}
          <div
            style={{
              height: '80%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* <Robot /> */}
          </div>

          {/* Bottom 20%: QR Container placeholder */}
          <div
            className="qr-container-placeholder"
            style={{
              height: '20%',
              width: '100%',
              // borderTop: '4px solid white',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginBottom: '5%',
            }}
          >
            {shop ? (
              <>
                <div
                  className="qr-image"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    aspectRatio: '1 / 1',
                    background: 'white',
                    padding: '0.5rem',
                    borderRadius: '8px',
                  }}
                >
                  <QRCodeSVG
                    value={generateQrUrl()}
                    size="100%"
                    level="H"
                    bgColor="#FFFFFF"
                    fgColor="#0F172A"
                    includeMargin={false}
                  />
                </div>
              </>
            ) : (
              <div style={{ 
                fontSize: '1rem', 
                textAlign: 'center',
                color: '#FFFFFF',
                fontWeight: '500'
              }}>
                Shop not found
              </div>
            )}
          </div>

        </div>

        {/* Right Section (40%) */}
        <div
          className="right-section"
          style={{
            width: '40%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <ShopInfoContainer
            selectedLang={selectedLang}
            showQrCode={showQrCode}
            setShowQrCode={setShowQrCode}
            setShopId={setShopId}
          />
        </div>
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
            <Footer />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopInfo;