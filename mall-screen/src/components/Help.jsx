import React, { useState, useEffect } from "react";
import TopNavbar from "./TopNavbar";
import Footer from "./Footer";
import "./Help.css";
import { useNavigate } from "react-router-dom";

/**
 * Help Component - help information for 
 * 
 * @param {Object} props 
 * @param {string} props.selectedLang 
 * @param {Function} props.setSelectedLang 
 * 
 * @returns {JSX.Element} 

 */
const Help = ({ selectedLang, setSelectedLang }) => {
  const navigate = useNavigate();
  const [showFooter, setShowFooter] = useState(false);
  const [showFooterBar, setShowFooterBar] = useState(false);

  // Mouse position detection for footer visibility
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

  const goBack = () => {
    setShowFooter(false);
    navigate('/');
  };

  // Multilingual help content structure
  const helpContent = {
  English: {
    title: "Help & Information",
    sections: [
      {
        heading: "Navigation",
        content: "Use the menu at the bottom of the screen or the top navbar to explore various sections of the mall information system."
      },
      {
        heading: "Mall Directory",
        content: "Browse a comprehensive list of stores, restaurants, and service providers available in the mall."
      },
      {
        heading: "Promotions",
        content: "Check out ongoing sales, discounts, and special offers available at participating stores."
      },
      {
        heading: "Contact",
        content: "For assistance, visit the mall information desk on the ground floor or call our help center at +91-9876543210. You can also email us at help@gmail.com."
      }
    ]
  },
  हिंदी: {
    title: "सहायता और जानकारी",
    sections: [
      {
        heading: "नेविगेशन",
        content: "मेनू या शीर्ष नेविगेशन बार का उपयोग करके मॉल की विभिन्न सेवाओं और जानकारी का अन्वेषण करें।"
      },
      {
        heading: "मॉल डायरेक्टरी",
        content: "मॉल में उपलब्ध दुकानों, रेस्टोरेंट्स और सेवाओं की पूरी सूची ब्राउज़ करें।"
      },
      {
        heading: "प्रमोशन",
        content: "चालू सेल, छूट और विशेष ऑफ़र की जानकारी प्राप्त करें।"
      },
      {
        heading: "संपर्क",
        content: "मदद के लिए, ग्राउंड फ्लोर पर सूचना डेस्क पर जाएं या हमारे हेल्पलाइन नंबर +91-9876543210 पर कॉल करें। आप हमें help@gmail.com पर ईमेल भी कर सकते हैं।"
      }
    ]
  },
  मराठी: {
    title: "मदत आणि माहिती",
    sections: [
      {
        heading: "नेव्हिगेशन",
        content: "खालच्या मेनूचा किंवा वरच्या नेव्हिगेशन बारचा वापर करून मॉलची माहिती आणि सेवा एक्सप्लोर करा."
      },
      {
        heading: "मॉल डिरेक्टरी",
        content: "मॉलमध्ये उपलब्ध दुकाने, रेस्टॉरंट्स आणि सेवा यांची यादी ब्राउझ करा."
      },
      {
        heading: "प्रमोशन्स",
        content: "चालू सेल, सवलती आणि खास ऑफर्स पहा."
      },
      {
        heading: "संपर्क",
        content: "मदतीसाठी, ग्राउंड फ्लोअरवरील माहिती डेस्कवर भेट द्या किंवा आमच्या हेल्पलाइन +91-9876543210 वर कॉल करा. ईमेल: help@gmail.com"
      }
    ]
  }
};

  // Get content for current language
  const content = helpContent[selectedLang];

  return (
    <div className="help-container">
      <TopNavbar selectedLang={selectedLang} setSelectedLang={setSelectedLang} />
      
      <div className="help-content-area">
        <div className="help-content">
          <h1 className="help-title">{content.title}</h1>
          
          <div className="help-sections-grid">
            {content.sections.map((section, index) => (
              <div key={index} className="help-section-card">
                <h2 className="help-section-heading">{section.heading}</h2>
                <p className="help-section-text">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer hover detection bar */}
      <div 
        className="footer-hover-bar"
        onClick={() => setShowFooter(true)}
        style={{ opacity: showFooterBar ? 1 : 0 }}
      ></div>
      
      {/* Conditional footer overlay */}
      {showFooter && (
        <div className="footer-overlay" onClick={() => setShowFooter(false)}>
          <div className="footer-wrapper" onClick={(e) => e.stopPropagation()}>
            <Footer goBack={goBack} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;