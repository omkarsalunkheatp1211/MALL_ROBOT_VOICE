import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AdSampleData } from "./AdSampleData";

const QrViewer = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Send BroadcastChannel message when component mounts
  useEffect(() => {
    const adId = queryParams.get("id");
    if (adId) {
      const channel = new BroadcastChannel('qr-scanner');
      channel.postMessage({ id: adId, scanned: true });
      channel.close();
    }
  }, []);

  // Get parameters from URL
  const adId = queryParams.get("id");
  const selectedLang = queryParams.get("lang") || "English";
  
  // Find the ad data based on ID
  const adData = adId ? AdSampleData.find(ad => ad.id === adId) : null;
  
  // Helper function to get content based on language with fallback to English
  const getLocalizedContent = (ad, field) => {
    if (!ad) return "";
    
    const langFieldMap = {
      "English": field,
      "हिंदी": `${field}Hindi`,
      "मराठी": `${field}Marathi`
    };
    
    const langField = langFieldMap[selectedLang];
    return ad[langField] || ad[field]; // Fallback to English if translation not available
  };
  
  // Get localized address and message
  const address = adData ? getLocalizedContent(adData, 'address') : queryParams.get("address");
  const message = adData ? getLocalizedContent(adData, 'message') : queryParams.get("message");
  const shopName = adData ? getLocalizedContent(adData, 'shopName') : null;

  // Add responsive class based on screen size
  const getResponsiveClass = () => {
    // This will be calculated at runtime based on actual screen dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    if (width >= 8000 || height >= 3400) {
      return "ultra-large-screen";
    } else if (width >= 3000 || height >= 2000) {
      return "large-screen";
    }
    return "";
  };

  return (
    <div className={`flex flex-col justify-center items-center text-white min-h-screen p-6 bg-[#0F172A] ${getResponsiveClass()}`}>
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-700 qr-viewer-container">
        {shopName && (
          <h2 className="text-2xl font-semibold mb-6 text-center qr-viewer-title">{shopName}</h2>
        )}
        {!shopName && (
          <h2 className="text-2xl font-semibold mb-6 text-center qr-viewer-title">Shop Information</h2>
        )}
        {address && (
          <div className="mb-4 p-4 bg-slate-900 rounded-lg qr-viewer-section">
            <p className="text-slate-400 text-sm mb-1 qr-viewer-label">Address</p>
            <p className="text-lg qr-viewer-content">{address}</p>
          </div>
        )}
        {message && (
          <div className="mb-4 p-4 bg-slate-900 rounded-lg qr-viewer-section">
            <p className="text-slate-400 text-sm mb-1 qr-viewer-label">Message</p>
            <p className="text-lg qr-viewer-content">{message}</p>
          </div>
        )}
        {(!address && !message) && (
          <p className="text-red-400 text-center p-4 bg-red-900/20 rounded-lg qr-viewer-error">Invalid or missing QR data.</p>
        )}
      </div>
    </div>
  );
};

export default QrViewer;