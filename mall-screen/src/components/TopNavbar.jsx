import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./TopNavbar.css";

/**
 * TopNavbar Component - Displays current time/date and language selection
 * 
 * @param {Object} props - Component props
 * @param {string} props.selectedLang - Currently selected language
 * @param {Function} props.setSelectedLang - Function to update selected language
 * 
 * @returns {JSX.Element} Navigation bar with time, date and language options
 */
const TopNavbar = ({ selectedLang, setSelectedLang }) => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [contentReady, setContentReady] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // GSAP animation references
  const dateRef = useRef(null);
  const timeRef = useRef(null);
  const langButtonsRef = useRef([]);
  const animationRef = useRef(null); 
  const timerRef = useRef(null);

  /**
   * Updates time and date with language-specific formatting
   * Schedules precise updates at the start of each minute
   */
  useEffect(() => {
    function updateTimeAndDate() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const originalHours = hours;
      const ampm = hours >= 12 ? "PM" : "AM";

      // Language-specific greetings based on time of day
      let greeting = "";
      if (selectedLang === "हिंदी") {
        if (originalHours >= 12 && originalHours < 16) greeting = "दोपहर";
        else if (originalHours >= 16 && originalHours < 19) greeting = "शाम";
        else if (originalHours >= 19 || originalHours < 5) greeting = "रात";
        else greeting = "सुबह";
      } else if (selectedLang === "मराठी") {
        if (originalHours >= 12 && originalHours < 16) greeting = "दुपारी";
        else if (originalHours >= 16 && originalHours < 19) greeting = "संध्याकाळ";
        else if (originalHours >= 19 || originalHours < 5) greeting = "रात्री";
        else greeting = "सकाळी";
      }

      // Format time string with 12-hour clock
      hours = hours % 12 || 12;
      let timeStr = `${hours.toString().padStart(2, "0")}:${minutes}`;

      // Convert digits to Devanagari numerals for Hindi and Marathi
      if (selectedLang === "हिंदी" || selectedLang === "मराठी") {
        timeStr = timeStr.replace(/\d/g, (d) => "०१२३४५६७८९"[parseInt(d)]);
        setCurrentTime(`${greeting}, ${timeStr}`);
      } else {
        setCurrentTime(`${timeStr} ${ampm}`);
      }

      // Format date string based on selected language
      let dateString = "";
      if (selectedLang === "English") {
        const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
        const month = now.toLocaleDateString("en-US", { month: "long" });
        const date = now.getDate();
        dateString = `${weekday}, ${month} ${date}`;
      } else if (selectedLang === "हिंदी") {
        const hindiDays = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
        const hindiMonths = ["जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
        const day = hindiDays[now.getDay()];
        const month = hindiMonths[now.getMonth()];
        const date = now.getDate().toString().replace(/\d/g, (d) => "०१२३४५६७८९"[parseInt(d)]);
        dateString = `${day}, ${month} ${date}`;
      } else if (selectedLang === "मराठी") {
        const marathiDays = ["रविवार", "सोमवार", "मंगळवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];
        const marathiMonths = ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"];
        const day = marathiDays[now.getDay()];
        const month = marathiMonths[now.getMonth()];
        const date = now.getDate().toString().replace(/\d/g, (d) => "०१२३४५६७८९"[parseInt(d)]);
        dateString = `${day}, ${month} ${date}`;
      }

      setCurrentDate(dateString);
      
      // Mark content as ready for animation
      setTimeout(() => {
        setContentReady(true);
      }, 50);

      // Schedule next update at the start of next minute
      scheduleNextUpdate();
    }

    function scheduleNextUpdate() {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Calculate precise time until next minute
      const now = new Date();
      const nextMinute = new Date(now);
      nextMinute.setSeconds(0);
      nextMinute.setMilliseconds(0);
      nextMinute.setMinutes(nextMinute.getMinutes() + 1);
      
      const delay = nextMinute.getTime() - now.getTime() + 100; // 100ms buffer
      timerRef.current = setTimeout(updateTimeAndDate, delay);
    }

    updateTimeAndDate();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [selectedLang]);

  /**
   * Resets animation when language changes
   * Sets initial opacity and position for elements
   */
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }
    
    if (animationRef.current) {
      animationRef.current.kill();
      animationRef.current = null;
    }
    
    if (dateRef.current && timeRef.current) {
      gsap.set(dateRef.current, { opacity: 0, y: -20, willChange: "transform, opacity" });
      gsap.set(timeRef.current, { opacity: 0, y: 20, willChange: "transform, opacity" });
      
      langButtonsRef.current.forEach(btn => {
        if (btn) gsap.set(btn, { opacity: 0, scale: 0.8, willChange: "transform, opacity" });
      });
    }
    
    setContentReady(false);
  }, [selectedLang, initialLoad]);

  /**
   * Runs animations when content is ready
   * Animates date, time, and language buttons with staggered timing
   */
  useEffect(() => {
    if (!contentReady) return;
    if (!dateRef.current || !timeRef.current) return;
    
    const animationTimeout = setTimeout(() => {
      const tl = gsap.timeline({ 
        defaults: { ease: "power2.out", duration: 0.5 },
        onComplete: () => {
          gsap.set([dateRef.current, timeRef.current], { 
            clearProps: "opacity,y,willChange"
          });
          langButtonsRef.current.forEach(btn => {
            if (btn) gsap.set(btn, { clearProps: "opacity,scale,willChange" });
          });
        }
      });
      
      animationRef.current = tl;
      
      tl.to(dateRef.current, { y: 0, opacity: 1 })
        .to(timeRef.current, { y: 0, opacity: 1 }, "-=0.3");
      
      const validButtons = langButtonsRef.current.filter(btn => btn !== null);
      if (validButtons.length > 0) {
        tl.to(validButtons, { 
          opacity: 1, 
          scale: 1, 
          stagger: 0.1,
        }, "-=0.3");
      }
    }, 100);
    
    return () => {
      clearTimeout(animationTimeout);
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }
    };
  }, [contentReady]);

  /**
   * Initial animation on component mount
   * Sets initial state and triggers animation after render
   */
  useEffect(() => {
    if (!initialLoad) return;
    
    if (dateRef.current) gsap.set(dateRef.current, { opacity: 0, y: -20, willChange: "transform, opacity" });
    if (timeRef.current) gsap.set(timeRef.current, { opacity: 0, y: 20, willChange: "transform, opacity" });
    
    const initialTimeout = setTimeout(() => {
      setContentReady(true);
    }, 150);
    
    return () => {
      clearTimeout(initialTimeout);
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }
    };
  }, []);

  const languages = ["English", "हिंदी", "मराठी"];

  return (
    <div className="top-navbar">
      <div className="top-navbar-left">
        <div className="top-navbar-date" ref={dateRef}>
          {currentDate}
        </div>
        <div className="top-navbar-time" ref={timeRef}>
          {currentTime}
        </div>
      </div>
      <div className="language-selector">
        {languages.map((lang, index) => (
          <button
            key={lang}
            onClick={() => setSelectedLang(lang)}
            ref={(el) => (langButtonsRef.current[index] = el)}
            className={`language-btn ${selectedLang === lang ? "active" : ""}`}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopNavbar;