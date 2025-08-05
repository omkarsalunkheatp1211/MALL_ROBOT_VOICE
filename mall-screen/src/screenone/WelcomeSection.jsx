import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./WelcomeSection.css";
import Robot from "../Robot/Robot";

/**
 * Welcome screen component with multilingual support and animations
 * Displays mall welcome message and transitions to ad section after delay
 */
const WelcomeSection = ({ selectedLang, setSelectedLang, setCurrentPage }) => {
  // Multilingual content configuration
  const content = {
    English: {
      welcome: "Welcome to",
      mallName: "Seasons Mall.",
      subtitle: "Your one-stop destination for shopping, dining, and entertainment."
    },
    हिंदी: {
      welcome: "में आपका स्वागत है।",
      mallName: "सीजन्स मॉल",
      subtitle: "खरीदारी, भोजन और मनोरंजन के लिए आपका एकमात्र गंतव्य।"
    },
    मराठी: {
      welcome: "मध्ये आपले स्वागत आहे.",
      mallName: "सीझन्स मॉल",
      subtitle: "खरेदी, जेवण आणि मनोरंजनासाठी तुमचे एकमेव ठिकाण."
    }
  };

  const [currentContent, setCurrentContent] = useState(content[selectedLang]);
  const [isAnimating, setIsAnimating] = useState(false);
  const redirectTimeoutRef = useRef(null);

  // Animation reference elements
  const headingRef = useRef(null);
  const lineRef = useRef(null);
  const subtitleRef = useRef(null);
  const contentAreaRef = useRef(null);
  const animationRef = useRef(null);

  // Language change and redirect timer handler
  useEffect(() => {
    // Reset animations
    if (animationRef.current) {
      animationRef.current.kill();
    }

    gsap.set([headingRef.current, lineRef.current], { clearProps: "all" });

    // Update content and trigger animation
    setCurrentContent(content[selectedLang]);
    setIsAnimating(true);

    // Reset redirect timer
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // Auto-redirect to ad section after delay
    redirectTimeoutRef.current = setTimeout(() => {
      setCurrentPage("ad");
    }, 3000);

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [selectedLang, setCurrentPage]);

  // Animation sequence controller
  useEffect(() => {
    if (!isAnimating) return;

    const animationDelay = setTimeout(() => {
      // Coordinated animation timeline
      const tl = gsap.timeline({
        defaults: { ease: "power2.out", duration: 0.8 },
        onComplete: () => {
          setIsAnimating(false);
        }
      });

      animationRef.current = tl;

      // Staggered entrance animations
      tl.fromTo(headingRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1 }
      )
        .fromTo(lineRef.current,
          { scaleX: 0, opacity: 0, width: '100%', maxWidth: 'min(90%, 70rem)', height: 'clamp(1rem, 1.5rem, 2rem)' },
          { scaleX: 1, opacity: 1, width: '100%', maxWidth: 'min(90%, 70rem)', height: 'clamp(1rem, 1.5rem, 2rem)' },
          "-=0.4"
        )
        .fromTo(subtitleRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1 },
          "-=0.3"
        )
        .fromTo(contentAreaRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1 },
          "-=0.3"
        );
    }, 100);

    return () => {
      clearTimeout(animationDelay);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [currentContent, isAnimating]);

  const { welcome, mallName } = currentContent;

  return (
    <div className="flex-grow flex flex-col items-center text-white overflow-hidden" style={{
      background: "linear-gradient(to bottom, #0f162a, #131E39)",
    }}>
      {/* Welcome header section */}
      <div className="welcome-header-section w-full flex flex-col items-center justify-center px-4 text-center">
        <h1
          ref={headingRef}
          className="welcome-heading font-bold leading-tight mt-0 pt-0"
        >
          {["हिंदी", "मराठी"].includes(selectedLang)
            ? <>
              {mallName}<br />{welcome}
            </>
            : <>
              {welcome}<br />{mallName}
            </>
          }
        </h1>

        <div ref={lineRef} className="divider-line"></div>

        <p ref={subtitleRef} className="welcome-section-subtitle">
          {currentContent.subtitle}
        </p>
      </div>

      {/* Content area for additional components */}
      <div
        ref={contentAreaRef}
        className="content-area w-full flex flex-col items-center justify-center px-6 overflow-hidden flex-grow"
      >
        <Robot />
      </div>
    </div>
  );
};

export default WelcomeSection;
