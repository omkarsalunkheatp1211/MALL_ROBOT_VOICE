import React from "react";
import "./footer.css";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Footer component - Navigation bar that appears at the bottom of the screen
 * Provides navigation to Home, Back, and Help pages
 * 
 * @param {Object} props - Component props
 * @param {Function} props.setCurrentPage - Function to change the current page in parent component
 * @param {Function} props.goBack - Custom back navigation function
 * 
 * @note For backend integration: This component handles UI navigation only.
 * No API calls are made directly from this component.
 */
const Footer = ({ setCurrentPage, goBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Navigation icons configuration
  const icons = [
    { name: "Home", src: "/icons/house-solid.svg" },
    { name: "Back", src: "/icons/arrow-left-solid.svg" },
    { name: "Help", src: "/icons/question-solid.svg" },
  ];

  /**
   * Handles image loading errors
   * @param {string} iconName - Name of the icon that failed to load
   * @returns {boolean} - Always returns true to prevent default error handling
   */
  const handleImageError = (iconName) => {
    console.error(`Image not found for: ${iconName}`);
    return true;
  };

  /**
   * Handles navigation button clicks
   * @param {string} iconName - Name of the clicked icon/button
   */
  const handleButtonClick = (iconName) => {
    // Don't process clicks on disabled buttons
    if (iconName === "Help" && location.pathname === "/help") {
      return;
    }
    
    // Get the parent footer overlay element to hide it
    const footerOverlay = document.querySelector('.footer-overlay');
    if (footerOverlay) {
      // Trigger a click on the overlay to hide the footer
      footerOverlay.click();
    }
    
    // Handle navigation after a small delay to allow the footer to hide
    setTimeout(() => {
      switch (iconName) {
        case "Home":
          // Navigate to root path which renders MainApp with WelcomeSection
          navigate("/");
          // If setCurrentPage is available (in MainApp), set it to welcome
          setCurrentPage && setCurrentPage("welcome");
          break;
        case "Back":
          if (location.pathname === "/help") {
            // If on Help page, navigate to root with AdSection
            navigate("/");
            // Set current page to ad section if setCurrentPage is available
            setCurrentPage && setCurrentPage("ad");
          } else if (goBack) {
            // Use custom goBack if provided
            goBack();
          } else if (location.pathname === "/" && setCurrentPage) {
            // If on main app and setCurrentPage is available, go to welcome section
            setCurrentPage("welcome");
          } else {
            // Default fallback
            window.history.back();
          }
          break;
        case "Help":
          // Only navigate if not already on help page
          if (location.pathname !== "/help") {
            navigate("/help");
          }
          break;
        default:
          break;
      }
    }, 100); // Small delay to allow footer animation to start
  };

  return (
    <footer 
      className="w-full flex items-center justify-start" 
      style={{ 
        backgroundColor: "white",
        height: "5vh", 
        minHeight: "48px",
        flexShrink: 0, 
        zIndex: 10,
        padding: "0 2%",
        boxSizing: "border-box",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px"
      }}
    >
      <div className="flex items-center justify-start gap-4 h-full">
        {icons.map((icon, idx) => {
          // Check if this is the Help button and we're on the Help page
          const isDisabled = icon.name === "Help" && location.pathname === "/help";
          
          return (
            <button
              key={idx}
              title={icon.name}
              className={`footer-btn ${isDisabled ? 'disabled-btn' : ''}`}
              aria-label={icon.name}
              onClick={() => handleButtonClick(icon.name)}
              style={isDisabled ? { 
                opacity: 0.5, 
                cursor: 'not-allowed',
                backgroundColor: '#f0f0f0'
              } : {}}
              disabled={isDisabled}
            >
              <img
                src={icon.src}
                alt={`${icon.name} button`}
                className={`footer-icon ${isDisabled ? 'opacity-50' : ''}`}
                onError={() => handleImageError(icon.name)}
              />
            </button>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;