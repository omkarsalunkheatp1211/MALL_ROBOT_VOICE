import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import "./QrContainer.css";

/**
 * QR code modal component for shop navigation
 * @param {Object} props - Component props
 * @param {Object} props.adData - Advertisement data object
 * @param {Function} props.onClose - Function to close the QR modal
 * @param {string} props.selectedLang - Selected language for UI text
 */
const QrContainer = ({ adData, onClose, selectedLang = "English" }) => {
  const [timeLeft, setTimeLeft] = useState(120); // 2-minute timeout

  /**
   * Gets localized content based on selected language with English fallback
   * @param {Object} ad - Advertisement data object
   * @param {string} field - Field name to retrieve
   * @returns {string} Localized content
   */
  const getLocalizedContent = (ad, field) => {
    const langFieldMap = {
      "English": field,
      "हिंदी": `${field}Hindi`,
      "मराठी": `${field}Marathi`
    };

    const langField = langFieldMap[selectedLang];
    return ad[langField] || ad[field];
  };

  const scanText = {
    "English": "Scan this QR to Navigate to your desired shop seamless with our map",
    "हिंदी": "इस QR को स्कैन करें और हमारे नक्शे के साथ बिना किसी रुकावट के अपनी पसंद की दुकान तक पहुँचें।",
    "मराठी": "हा QR स्कॅन करा आणि आमच्या नकाशाच्या मदतीने तुमच्या इच्छित दुकानात सहजपणे पोहोचा."
  };

  // Generate QR code data URL with ad ID and language parameters
  const langUrlMap = {
    "English": "en",
    "हिंदी": "hi",
    "मराठी": "mr"
  };
  
  const urlLang = langUrlMap[selectedLang] || "en";
  const qrData = `${window.location.origin}/qrview?id=${encodeURIComponent(adData.id)}&lang=${urlLang}`;

  /**
   * Formats time in MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Set up countdown timer and BroadcastChannel listener
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onClose(); // Auto-close when timer reaches zero
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Set up BroadcastChannel listener
    const channel = new BroadcastChannel('qr-scanner');
    channel.onmessage = (event) => {
      if (event.data.id === adData.id && event.data.scanned) {
        onClose(); // Close immediately when QR is scanned
      }
    };

    return () => {
      clearInterval(timer);
      channel.close();
    };
  }, [onClose, adData.id]);

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <h3>{getLocalizedContent(adData, 'shopName')}</h3>
          <div className="qr-header-right">
            <div className="qr-countdown">{formatTime(timeLeft)}</div>
            <button className="qr-close-button" onClick={onClose}>
              <img src="/icons/xmark-solid.svg" alt="Close" width="30" height="30" style={{ display: 'block' }} />
            </button>
          </div>
        </div>
        
        <div className="qr-code-container">
          <QRCodeSVG
            value={qrData}
            size={200}
            level="H"
            includeMargin={true}
            className="qr-code-image"
          />
        </div>

        <p>{scanText[selectedLang] || scanText["English"]}</p>
      </div>
    </div>
  );
};

export default QrContainer;