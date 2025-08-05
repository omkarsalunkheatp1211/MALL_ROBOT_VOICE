import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { AdSampleData } from "./AdSampleData";
import "./AdManagement.css";
import QrContainer from "./QrContainer";

const AdManagement = ({ selectedLang = "English", pauseAds = false }) => {
  const [ads, setAds] = useState([]);
  const [displayAds, setDisplayAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [realAdCount, setRealAdCount] = useState(0);
  const [showQrCode, setShowQrCode] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const messageRefs = useRef([]);
  const addressRefs = useRef([]);
  const containerRef = useRef();
  const adRefs = useRef([]);
  const videoRefs = useRef([]);
  const scrollTimerRef = useRef(null);
  const videoDurationsRef = useRef({});
  const isScrollingRef = useRef(false);
  const messageAnimationsRef = useRef({});
  const addressAnimationsRef = useRef({});
  const welcomeTextRef = useRef(null);
  const welcomeContainerRef = useRef(null);
  const welcomeMessageRef = useRef(null);
  const welcomeAnimationRef = useRef(null);


  // Welcome messages in different languages
  const welcomeMessages = {
    "English": "Hey, I am your virtual assistant. Welcome! How can I help you to improve your experience here!",
    "हिंदी": "नमस्ते, मैं आपका वर्चुअल सहायक हूँ। स्वागत है! मैं आपकी यहाँ की अनुभव को बेहतर बनाने में कैसे मदत कर सकता हूँ?",
    "मराठी": "नमस्कार, मी तुमचा व्हर्च्युअल सहाय्यक आहे. स्वागत आहे! इथे तुमचा अनुभव सुधारण्यासाठी मी कशी मदत करू शकतो?"
  };

  // Function to create welcome message marquee animation
  const createWelcomeMarqueeAnimation = () => {
    if (!welcomeMessageRef.current || !welcomeContainerRef.current) return;
    
    // Clear any existing animations
    if (welcomeAnimationRef.current) {
      welcomeAnimationRef.current.kill();
      welcomeAnimationRef.current = null;
    }
    
    // Get the welcome message based on selected language
    const message = welcomeMessages[selectedLang] || welcomeMessages["English"];
    
    // Set the text content
    welcomeMessageRef.current.innerHTML = message;
    
    // Check if animation is needed (text overflows container)
    const textWidth = welcomeMessageRef.current.scrollWidth;
    const containerWidth = welcomeContainerRef.current.offsetWidth;
    
    // Only create animation if text overflows container
    if (textWidth > containerWidth) {
      // Create the animation timeline
      const tl = gsap.timeline({
        repeat: -1, // Infinite loop
        repeatDelay: 1, // 1 second delay before repeating
      });
      
      // Calculate duration based on content length and screen size
      const screenWidthFactor = Math.min(window.innerWidth / 1000, 3);
      const duration = Math.max(5, (textWidth / (50 / screenWidthFactor)));
      
      // First set the initial position
      gsap.set(welcomeMessageRef.current, { x: 0 });
      
      // Hold at the beginning for a moment
      tl.to(welcomeMessageRef.current, { x: 0, duration: 1.5 });
      
      // Then do the full marquee animation
      tl.to(welcomeMessageRef.current, {
        x: -(textWidth - containerWidth + 40), // Leave a bit of padding
        duration: duration,
        ease: "linear", // Smooth, consistent scrolling
      });
      
      // Then return to start position quickly
      tl.to(welcomeMessageRef.current, { x: 0, duration: 0.5, ease: "power1.inOut" });
      
      // Store the animation reference
      welcomeAnimationRef.current = tl;
    } else {
      // No animation needed, just center the text
      gsap.set(welcomeMessageRef.current, { 
        x: 0,
        position: 'relative',
        left: '50%',
        xPercent: -50
      });
    }
  };

  // Helper function to get content based on language with fallback to English
  const getLocalizedContent = (ad, field) => {
    const langFieldMap = {
      "English": field,
      "हिंदी": `${field}Hindi`,
      "मराठी": `${field}Marathi`
    };

    const langField = langFieldMap[selectedLang];
    return ad[langField] || ad[field]; // Fallback to English if translation not available
  };

  // Sort by priority function
  const priorityValue = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  // Filter and sort ads based on priority and date
  useEffect(() => {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];

    // Filter valid ads (not expired)
    const validAds = AdSampleData.filter((ad) => {
      return currentDate >= ad.adStartDate && currentDate <= ad.adEndDate;
    });

    // Sort by priority: High first, then Medium, then Low
    const sortedAds = [...(validAds.length > 0 ? validAds : AdSampleData)].sort((a, b) => {
      return priorityValue[a.priority] - priorityValue[b.priority];
    });

    setAds(sortedAds);
    setRealAdCount(sortedAds.length);

    // Create the display ads array with cloned items for infinite scroll effect
    if (sortedAds.length > 0) {
      // Create a display array with cloned items at beginning and end
      const clonedAdsAtStart = sortedAds.slice(-2).map((ad, index) => ({
        ...ad,
        id: `clone-start-${ad.id}-${index}`,
        isClone: true,
        originalIndex: sortedAds.length - 2 + index
      }));

      const clonedAdsAtEnd = sortedAds.slice(0, 2).map((ad, index) => ({
        ...ad,
        id: `clone-end-${ad.id}-${index}`,
        isClone: true,
        originalIndex: index
      }));

      const enhancedAds = sortedAds.map((ad, index) => ({
        ...ad,
        isClone: false,
        originalIndex: index
      }));

      setDisplayAds([...clonedAdsAtStart, ...enhancedAds, ...clonedAdsAtEnd]);

      // Set initial index to the first real ad (after the clones)
      setCurrentAdIndex(2); // Skip the 2 cloned items at the start
    }
  }, []);

  // Initialize refs arrays when display ads change
  useEffect(() => {
    messageRefs.current = messageRefs.current.slice(0, displayAds.length);
    addressRefs.current = addressRefs.current.slice(0, displayAds.length);
    adRefs.current = adRefs.current.slice(0, displayAds.length);
    videoRefs.current = videoRefs.current.slice(0, displayAds.length);
  }, [displayAds]);

  // Load video metadata and capture durations
  useEffect(() => {
    // Reset video durations when ads change
    videoDurationsRef.current = {};

    // Set up metadata listeners for all videos
    displayAds.forEach((ad, index) => {
      if (ad.adType === "Video") {
        const videoRef = videoRefs.current[index];
        if (videoRef) {
          // Add event listener to capture video duration when metadata loads
          const handleMetadataLoaded = () => {
            // Store the video duration in seconds
            videoDurationsRef.current[index] = videoRef.duration;
          };

          // Add the event listener
          videoRef.addEventListener('loadedmetadata', handleMetadataLoaded);

          // Clean up event listener
          return () => {
            videoRef.removeEventListener('loadedmetadata', handleMetadataLoaded);
          };
        }
      }
    });
  }, [displayAds]);

  // Handle infinite scroll logic when reaching clone boundaries
  useEffect(() => {
    if (displayAds.length === 0) return;

    const handleScrollEnd = () => {
      // If we've scrolled to a clone, jump to the corresponding real ad without animation
      const currentAd = displayAds[currentAdIndex];

      if (currentAd && currentAd.isClone) {
        // Disable smooth scrolling temporarily
        containerRef.current.style.scrollBehavior = 'auto';

        // Calculate the real index to jump to
        let jumpToIndex;

        if (currentAdIndex < 2) {
          // We're at a start clone, jump to the corresponding end item
          jumpToIndex = realAdCount + currentAd.originalIndex;
        } else if (currentAdIndex >= displayAds.length - 2) {
          // We're at an end clone, jump to the corresponding start item
          jumpToIndex = 2 + currentAd.originalIndex;
        }

        if (jumpToIndex !== undefined) {
          // Perform the instant jump
          setTimeout(() => {
            setCurrentAdIndex(jumpToIndex);
            const adElement = adRefs.current[jumpToIndex];
            if (containerRef.current && adElement) {
              const scrollLeft = adElement.offsetLeft - containerRef.current.offsetWidth / 2 + adElement.offsetWidth / 2;
              containerRef.current.scrollLeft = scrollLeft;

              // Re-enable smooth scrolling
              setTimeout(() => {
                containerRef.current.style.scrollBehavior = 'smooth';
              }, 50);
            }
          }, 50);
        }
      }
    };

    // Call this function when currentAdIndex changes
    if (displayAds.length > 0 && containerRef.current) {
      handleScrollEnd();
    }
  }, [currentAdIndex, displayAds, realAdCount]);

  // Control video playback and audio based on currentAdIndex
  useEffect(() => {
    if (displayAds.length === 0) return; // Remove the showQrCode || pauseAds check here

    // Handle all videos - pause and mute non-current videos
    videoRefs.current.forEach((videoRef, index) => {
      if (videoRef) {
        if (index === currentAdIndex && displayAds[index].adType === "Video" && !showQrCode && !pauseAds) {
          // Current video ad: play from beginning with audio (only if not paused)
          videoRef.currentTime = 0; // Reset to beginning
          videoRef.muted = false;   // Enable audio
          videoRef.play().catch(err => console.error("Video play error:", err));
        } else {
          // Other videos: pause and mute
          videoRef.pause();
          videoRef.muted = true;
        }
      }
    });

    // Clear any existing scroll timer
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    // Don't set a new timer if QR code is showing or ads are paused
    if (showQrCode || pauseAds) return;

    // Set new scroll timer with duration from the ad's adDuration property
    const currentAd = displayAds[currentAdIndex];
    const adDuration = currentAd ? parseInt(currentAd.adDuration, 10) * 1000 : 5000; // Convert to milliseconds, default to 5 seconds

    // Set the timer with dynamic delay based on adDuration
    scrollTimerRef.current = setTimeout(() => {
      if (!isScrollingRef.current) {
        setCurrentAdIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % displayAds.length;
          scrollToAd(nextIndex);
          return nextIndex;
        });
      }
    }, adDuration);

    return () => {
      // Clean up timer on unmount or when currentAdIndex changes
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [currentAdIndex, displayAds, showQrCode, pauseAds]);

  // Add this useEffect to pause all animations and videos when QR container is shown or pauseAds is true
  useEffect(() => {
    if (showQrCode || pauseAds) {
      // Pause all videos
      videoRefs.current.forEach((videoRef) => {
        if (videoRef) {
          videoRef.pause();
          videoRef.muted = true;
        }
      });
      
      // Pause all text animations
      Object.values(messageAnimationsRef.current).forEach(anim => {
        if (anim) anim.pause();
      });
      Object.values(addressAnimationsRef.current).forEach(anim => {
        if (anim) anim.pause();
      });
      
      // Pause welcome animation if it exists
      if (welcomeAnimationRef.current) {
        welcomeAnimationRef.current.pause();
      }
    } else {
      // Resume current video if QR is closed and ads are not paused
      const currentVideoRef = videoRefs.current[currentAdIndex];
      if (currentVideoRef && displayAds[currentAdIndex]?.adType === "Video") {
        currentVideoRef.muted = false;
        currentVideoRef.play().catch(err => console.error("Video play error:", err));
      }
      
      // Resume current text animations
      const currentMessageAnim = messageAnimationsRef.current[currentAdIndex];
      const currentAddressAnim = addressAnimationsRef.current[currentAdIndex];
      if (currentMessageAnim) currentMessageAnim.play();
      if (currentAddressAnim) currentAddressAnim.play();
      
      // Resume welcome animation
      if (welcomeAnimationRef.current) {
        welcomeAnimationRef.current.play();
      }
    }
  }, [showQrCode, currentAdIndex, displayAds, pauseAds]);

  // Scroll to the current ad when currentAdIndex changes
  useEffect(() => {
    if (displayAds.length > 0) {
      scrollToAd(currentAdIndex);
    }
  }, [currentAdIndex, displayAds]);

  // Function to scroll to a specific ad
  const scrollToAd = (index) => {
    const container = containerRef.current;
    const adElement = adRefs.current[index];

    if (container && adElement) {
      // Calculate the scroll position to center the ad
      const scrollLeft = adElement.offsetLeft - container.offsetWidth / 2 + adElement.offsetWidth / 2;

      // Perform the smooth scroll
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  };

  // Handle navigation to previous ad with enhanced animation
  const handlePrevAd = () => {
    // Clear any existing timer
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    // Get current ad element
    const currentAdElement = adRefs.current[currentAdIndex];
    
    // Animate current ad out to the left with enhanced animation
    if (currentAdElement) {
      gsap.to(currentAdElement, {
        opacity: 0.1,
        scale: 0.92,
        x: "-100%", // Slide out to the left
        duration: 0.8, // Exactly 0.8 seconds as requested
        ease: "power3.out",
        filter: "blur(1px)"
      });
    }

    // Navigate to previous ad
    setCurrentAdIndex((prevIndex) => {
      const newIndex = prevIndex > 0 ? prevIndex - 1 : displayAds.length - 1;
      
      // Animate new ad in from the right
      setTimeout(() => {
        const newAdElement = adRefs.current[newIndex];
        if (newAdElement) {
          // Set initial position before animation
          gsap.set(newAdElement, {
            x: "100%", // Start from right side
            opacity: 0.1,
            scale: 0.92,
            filter: "blur(1px)"
          });
          
          // Animate in
          gsap.to(newAdElement, { 
            x: 0, // Slide to center
            opacity: 1, 
            scale: 1,
            filter: "blur(0px)",
            duration: 0.8, // Exactly 0.8 seconds as requested
            ease: "power3.out",
            clearProps: "filter" // Clean up filter after animation
          });
          
          // Add a subtle glow effect
          gsap.fromTo(newAdElement, 
            { boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
            { 
              boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.3), 0 15px 15px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)", 
              duration: 0.8,
              ease: "power2.out" 
            }
          );
        }
      }, 50);
      
      return newIndex;
    });
  };

  // Handle navigation to next ad with enhanced animation
  const handleNextAd = () => {
    // Clear any existing timer
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    // Get current ad element
    const currentAdElement = adRefs.current[currentAdIndex];
    
    // Animate current ad out to the left with enhanced animation
    if (currentAdElement) {
      gsap.to(currentAdElement, {
        opacity: 0.1,
        scale: 0.92,
        x: "-100%", // Slide out to the left
        duration: 0.8, // Exactly 0.8 seconds as requested
        ease: "power3.out",
        filter: "blur(1px)"
      });
    }

    // Navigate to next ad
    setCurrentAdIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % displayAds.length;
      
      // Animate new ad in from the right
      setTimeout(() => {
        const newAdElement = adRefs.current[newIndex];
        if (newAdElement) {
          // Set initial position before animation
          gsap.set(newAdElement, {
            x: "100%", // Start from right side
            opacity: 0.1,
            scale: 0.92,
            filter: "blur(1px)"
          });
          
          // Animate in
          gsap.to(newAdElement, { 
            x: 0, // Slide to center
            opacity: 1, 
            scale: 1,
            filter: "blur(0px)",
            duration: 0.8, // Exactly 0.8 seconds as requested
            ease: "power3.out",
            clearProps: "filter" // Clean up filter after animation
          });
          
          // Add a subtle glow effect
          gsap.fromTo(newAdElement, 
            { boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
            { 
              boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.3), 0 15px 15px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)", 
              duration: 0.8,
              ease: "power2.out" 
            }
          );
        }
      }, 50);
      
      return newIndex;
    });
  };

  // Function to create a timed marquee animation that completes exactly once within the available time
  const createTimedMarqueeAnimation = (element, text, container, availableTime) => {
    if (!element || !container || !availableTime) return null;

    // Clear any existing animations
    gsap.killTweensOf(element);

    // Set the text content directly
    element.innerHTML = text;

    // Check if animation is needed (text overflows container)
    const textWidth = element.scrollWidth;
    const containerWidth = container.offsetWidth;

    // Only create animation if text overflows container
    if (textWidth > containerWidth) {
      // Add a data attribute to track overflow state
      element.setAttribute('data-overflows', 'true');

      // Calculate available animation time (in seconds)
      // Reserve 20% of the time for initial pause and final reset
      const animationTime = availableTime / 1000; // Convert ms to seconds
      const scrollTime = Math.max(animationTime * 0.8, 3); // 80% of time for the actual scrolling, minimum 3 seconds
      const pauseTime = animationTime * 0.1; // 10% for initial pause

      // Calculate how much text overflows
      const overflowAmount = textWidth - containerWidth;

      // Create the animation timeline
      const tl = gsap.timeline({
        paused: true, // Start paused, will play based on visibility
      });

      // First set the initial position (start at normal position)
      gsap.set(element, { x: 0 });

      // Hold at the beginning for a moment
      tl.to(element, { x: 0, duration: pauseTime });

      // Then animate only the overflowing part from right to left
      tl.to(element, {
        x: -overflowAmount, // Move just enough to show the overflowing text
        duration: scrollTime,
        ease: "power1.inOut", // Smooth easing for better visual effect
      });

      // Add hover pause functionality
      let isHovering = false;
      let timeScale = 1;

      container.addEventListener('mouseenter', () => {
        isHovering = true;
        // Store current timeScale before pausing
        timeScale = tl.timeScale();
        tl.timeScale(0); // Pause by setting timeScale to 0
      });

      container.addEventListener('mouseleave', () => {
        isHovering = false;
        // Restore previous timeScale
        tl.timeScale(timeScale);
      });

      // Add window resize handler to recalculate animation
      const handleResize = () => {
        // Get current progress
        const progress = tl.progress();
        
        // Kill the current animation
        tl.kill();
        
        // Recalculate dimensions
        const newTextWidth = element.scrollWidth;
        const newContainerWidth = container.offsetWidth;
        
        // Only recreate if still overflowing
        if (newTextWidth > newContainerWidth) {
          // Update the animation with new dimensions
          tl.clear();
          tl.to(element, { x: 0, duration: pauseTime });
          tl.to(element, {
            x: -(newTextWidth - newContainerWidth + 40),
            duration: scrollTime,
            ease: "linear"
          });
          
          // Restore progress
          tl.progress(progress);
          
          // Resume if not hovering
          if (!isHovering) {
            tl.play();
          }
        } else {
          // No longer overflowing, center the text
          element.setAttribute('data-overflows', 'false');
          gsap.set(element, { 
            x: 0,
            position: 'relative',
            left: '50%',
            xPercent: -50
          });
        }
      };
      
      // Add resize listener
      window.addEventListener('resize', handleResize);
      
      // Store the cleanup function on the element
      element._cleanupResize = () => {
        window.removeEventListener('resize', handleResize);
      };

      return tl;
    } else {
      // No animation needed, just center the text
      element.setAttribute('data-overflows', 'false');
      gsap.set(element, { 
        x: 0,
        position: 'relative',
        left: '50%',
        xPercent: -50
      });
      return null;
    }
  };
  
  // Legacy function for backward compatibility
  const createMarqueeAnimation = (element, text, container) => {
    return createTimedMarqueeAnimation(element, text, container, 10000); // Default to 10 seconds
  };

  // Add this useEffect to animate ad transitions
  useEffect(() => {
    if (displayAds.length === 0) return;
    
    // Reset positions for all ads
    displayAds.forEach((ad, index) => {
      const adElement = adRefs.current[index];
      if (!adElement) return;
      
      if (index === currentAdIndex) {
        // Current ad - reset to center position with full opacity
        gsap.set(adElement, {
          x: 0,
          opacity: 1,
          scale: 1,
          filter: "blur(0px)"
        });
      } else {
        // Other ads - position them appropriately
        const position = index < currentAdIndex ? "-100%" : "100%";
        gsap.set(adElement, {
          x: position,
          opacity: 0.1,
          scale: 0.92,
          filter: "blur(1px)"
        });
      }
    });
  }, [displayAds]); // Only run when the displayAds array changes
  
  // Add this useEffect to animate ad transitions
  useEffect(() => {
    if (displayAds.length === 0) return;
    
    // Animate all ads for smooth transition
    displayAds.forEach((ad, index) => {
      const adElement = adRefs.current[index];
      if (!adElement) return;
      
      if (index === currentAdIndex) {
        // Current ad - animate to full size and opacity
        gsap.to(adElement, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.1
        });
      } else {
        // Other ads - animate to smaller size and lower opacity
        gsap.to(adElement, {
          opacity: 0.9,
          scale: 0.95,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    });
  }, [currentAdIndex, displayAds]);

  // Animate message and address text
  useEffect(() => {
    // Clear all existing animations and remove resize listeners
    Object.values(messageAnimationsRef.current).forEach(anim => {
      if (anim) anim.kill();
    });
    Object.values(addressAnimationsRef.current).forEach(anim => {
      if (anim) anim.kill();
    });
    
    // Clean up resize listeners
    messageRefs.current.forEach(ref => {
      if (ref && ref._cleanupResize) ref._cleanupResize();
    });
    addressRefs.current.forEach(ref => {
      if (ref && ref._cleanupResize) ref._cleanupResize();
    });

    // Reset animation references
    messageAnimationsRef.current = {};
    addressAnimationsRef.current = {};

    // Create new animations for each ad
    displayAds.forEach((ad, index) => {
      const messageRef = messageRefs.current[index];
      const addressRef = addressRefs.current[index];
      const adRef = adRefs.current[index];

      // Calculate available time for this ad
      let availableTime;
      if (ad.adType === "Video") {
        const videoDuration = videoDurationsRef.current[index];
        if (videoDuration) {
          // Use actual duration capped at 30 seconds
          availableTime = Math.min(videoDuration * 1000, 30000);
        } else {
          // Fallback to 10 seconds if duration couldn't be determined
          availableTime = 10000;
        }
      } else {
        // For image ads: use 5 seconds
        availableTime = 5000;
      }

      if (messageRef && adRef) {
        const messageContainer = messageRef.parentElement;
        // Get localized message based on selected language
        const localizedMessage = getLocalizedContent(ad, 'message');
        const messageAnimation = createTimedMarqueeAnimation(
          messageRef, 
          localizedMessage, 
          messageContainer, 
          availableTime
        );

        if (messageAnimation) {
          messageAnimationsRef.current[index] = messageAnimation;

          // Pause animation if not current ad
          if (index !== currentAdIndex) {
            messageAnimation.pause(0);
          } else {
            messageAnimation.play(0);
          }
        }
      }

      if (addressRef && adRef) {
        const addressContainer = addressRef.parentElement;
        // Get localized address based on selected language
        const localizedAddress = getLocalizedContent(ad, 'address');
        const addressAnimation = createTimedMarqueeAnimation(
          addressRef, 
          localizedAddress, 
          addressContainer, 
          availableTime
        );

        if (addressAnimation) {
          addressAnimationsRef.current[index] = addressAnimation;

          // Pause animation if not current ad
          if (index !== currentAdIndex) {
            addressAnimation.pause(0);
          } else {
            addressAnimation.play(0);
          }
        }
      }
    });

    // Clean up animations on unmount
    return () => {
      Object.values(messageAnimationsRef.current).forEach(anim => {
        if (anim) anim.kill();
      });
      Object.values(addressAnimationsRef.current).forEach(anim => {
        if (anim) anim.kill();
      });
    };
  }, [displayAds, selectedLang, currentAdIndex]);

  // Control animations based on current ad index
  useEffect(() => {
    // Pause all animations
    Object.entries(messageAnimationsRef.current).forEach(([index, anim]) => {
      if (anim) anim.pause(0);
    });
    Object.entries(addressAnimationsRef.current).forEach(([index, anim]) => {
      if (anim) anim.pause(0);
    });

    // Play animations only for current ad
    const currentMessageAnim = messageAnimationsRef.current[currentAdIndex];
    const currentAddressAnim = addressAnimationsRef.current[currentAdIndex];

    if (currentMessageAnim) currentMessageAnim.play();
    if (currentAddressAnim) currentAddressAnim.play();
  }, [currentAdIndex]);

  // Add this useEffect for welcome message animation
  useEffect(() => {
    createWelcomeMarqueeAnimation();
    
    // Add resize event listener to recalculate animation when window size changes
    const handleResize = () => {
      createWelcomeMarqueeAnimation();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (welcomeAnimationRef.current) {
        welcomeAnimationRef.current.kill();
      }
    };
  }, [selectedLang]); // Re-run when language changes
  
  // Add this useEffect to handle ad highlighting when QR code is shown
  useEffect(() => {
    // When QR code is shown, remove highlighting from all ads
    if (showQrCode) {
      // Get all ad cards
      const adCards = document.querySelectorAll('.ad-card');
      
      // Remove current class and add other class to all cards
      adCards.forEach(card => {
        card.classList.remove('ad-card-current');
        card.classList.add('ad-card-other');
      });
    } else {
      // When QR code is closed, restore highlighting to current ad
      const currentAdCard = adRefs.current[currentAdIndex];
      if (currentAdCard) {
        currentAdCard.classList.remove('ad-card-other');
        currentAdCard.classList.add('ad-card-current');
      }
    }
  }, [showQrCode, currentAdIndex]);

  // Add this new useEffect for welcome message animation
  useEffect(() => {
    if (!welcomeMessageRef.current) return;

    // Get the welcome message based on selected language
    const message = welcomeMessages[selectedLang] || welcomeMessages["English"];

    // Clear any existing content and animations
    gsap.killTweensOf(".welcome-word");
    welcomeMessageRef.current.innerHTML = "";

    // Split the message into individual words
    const words = message.split(" ");

    // Create a span for each word
    words.forEach((word, index) => {
      const wordSpan = document.createElement("span");
      wordSpan.textContent = word;
      wordSpan.className = "welcome-word";
      wordSpan.style.display = "inline-block";
      wordSpan.style.position = "relative";
      wordSpan.style.opacity = 0;
      wordSpan.style.marginRight = "12px"; /* Increased spacing between words */
      wordSpan.style.marginBottom = "5px"; /* Add spacing between wrapped lines */
      wordSpan.style.fontWeight = "700"; // Make text bold
      welcomeMessageRef.current.appendChild(wordSpan);
    });

    // Center the welcome message container
    welcomeMessageRef.current.style.display = "flex";
    welcomeMessageRef.current.style.justifyContent = "center";
    welcomeMessageRef.current.style.alignItems = "center"; /* Add vertical centering */
    welcomeMessageRef.current.style.flexWrap = "wrap";
    welcomeMessageRef.current.style.textAlign = "center";
    welcomeMessageRef.current.style.height = "100%"; /* Take full height */

    // Animate each word with stagger for sequential appearance from right
    gsap.fromTo(".welcome-word", 
      { 
        x: 100, // Start from right
        opacity: 0 
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.5, // Duration for each word animation
        stagger: 0.3, // Wait time between each word
        ease: "power2.out",
        delay: 0.3 // Small initial delay
      }
    );
  }, [selectedLang]); // Re-run when language changes

  // Function to handle ad click - modified to include animations like handlePrevAd/handleNextAd
  const handleAdClick = (ad, index) => {
    // If clicking on the current ad, show QR code
    if (index === currentAdIndex) {
      setSelectedAd(ad);
      setShowQrCode(true);
      return; // Exit early to prevent animation
    }
    
    // Clear any existing timer
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    
    // Get current ad element
    const currentAdElement = adRefs.current[currentAdIndex];
    
    // Animate current ad out with enhanced animation
    if (currentAdElement) {
      gsap.to(currentAdElement, {
        opacity: 0.1,
        scale: 0.92,
        x: "-100%", // Slide out to the left
        duration: 0.8,
        ease: "power3.out",
        filter: "blur(1px)"
      });
    }
    
    // Set the clicked ad as current
    setCurrentAdIndex(index);
    
    // Animate new ad in from the right
    setTimeout(() => {
      const newAdElement = adRefs.current[index];
      if (newAdElement) {
        // Set initial position before animation
        gsap.set(newAdElement, {
          x: "100%", // Start from right side
          opacity: 0.1,
          scale: 0.92,
          filter: "blur(1px)"
        });
        
        // Animate in
        gsap.to(newAdElement, { 
          x: 0, // Slide to center
          opacity: 1, 
          scale: 1,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
          clearProps: "filter" // Clean up filter after animation
        });
        
        // Add a subtle glow effect
        gsap.fromTo(newAdElement, 
          { boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" },
          { 
            boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.3), 0 15px 15px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)", 
            duration: 0.8,
            ease: "power2.out" 
          }
        );
      }
    }, 50);
    
    // No need to call scrollToAd here as the animation handles the visual transition
  };

  // Function to close QR code modal
  const handleCloseQrCode = () => {
    setShowQrCode(false);
    setSelectedAd(null);
  };

  return (
    <div className="w-full flex flex-col items-center justify-start ad-management-section">

      {/* Welcome Banner with language-specific message and animation - 10% height */}
      <div className="welcome-banner" style={{ height: "10%", display: "flex", alignItems: "center" }}>
        <div className="welcome-container" ref={welcomeContainerRef}>
          <div className="welcome-message" ref={welcomeMessageRef}></div>
        </div>
      </div>

      {/* Ad Navigation Container - 90% height */}
      <div className="ad-navigation-container" style={{ height: "90%" }}>
        {/* Removed Left Navigation Button */}

        {/* Horizontally Scrollable Ads Container */}
        <div
          ref={containerRef}
          className={`ad-container ${pauseAds ? 'paused' : ''}`}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%"
          }}
        >
          {displayAds.length > 0 && (
            <>
              {/* Left Ad (Previous) */}
              <div
                className={`ad-card ad-card-other ${pauseAds ? 'paused-card' : ''}`}
                style={{
                  width: "13%",
                  height: "84%",
                  marginRight: "2%",
                  marginLeft: "0%"
                }}
                onClick={() => {
                  const prevIndex = currentAdIndex > 0 ? currentAdIndex - 1 : displayAds.length - 1;
                  
                  // Check if we're clicking on a clone at the beginning
                  if (prevIndex < 2) {
                    // Jump to the corresponding real ad at the end
                    const realAdIndex = realAdCount + prevIndex;
                    handleAdClick(displayAds[realAdIndex], realAdIndex);
                  } else {
                    handleAdClick(displayAds[prevIndex], prevIndex);
                  }
                }}
              >
                {/* Get previous ad, accounting for circular navigation */}
                {(() => {
                  const prevIndex = currentAdIndex > 0 ? currentAdIndex - 1 : displayAds.length - 1;
                  const prevAd = displayAds[prevIndex];
                  return (
                    <>
                      {/* Media Container with hover overlay - 80% height (changed from 70%) */}
                      <div
                        className="ad-media-container"
                        style={{ height: "80%" }}
                      >
                        {prevAd.adType === "Image" ? (
                          <img
                            src={prevAd.adSource}
                            alt={getLocalizedContent(prevAd, 'shopName')}
                            className="ad-media"
                          />
                        ) : (
                          <video
                            ref={(el) => (videoRefs.current[prevIndex] = el)}
                            src={prevAd.adSource}
                            loop
                            className="ad-media"
                            style={{ objectFit: "cover" }}
                            muted
                          />
                        )}

                        {/* Add overlay for hover effect */}
                        <div className="ad-media-overlay">
                          <span className="ad-overlay-text">{getLocalizedContent(prevAd, 'shopName')}</span>
                        </div>
                      </div>

                      {/* Content Container - 20% height (changed from 30%) */}
                      <div className="ad-content-container" style={{ height: "20%" }}>
                        {/* Message with marquee animation */}
                        <div className="ad-message-container">
                          <div
                            ref={(el) => (messageRefs.current[prevIndex] = el)}
                            className="ad-message-text"
                          >{getLocalizedContent(prevAd, 'message')}</div>
                        </div>

                        {/* Address with marquee animation */}
                        <div className="ad-address-container">
                          <div
                            ref={(el) => (addressRefs.current[prevIndex] = el)}
                            className="ad-address-text"
                          >{getLocalizedContent(prevAd, 'address')}</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Center Ad (Current) */}
              <div
                ref={(el) => (adRefs.current[currentAdIndex] = el)}
                className={`ad-card ad-card-current ${pauseAds ? 'paused-card' : ''}`}
                style={{
                  width: "70%",
                  height: "88%",
                  marginLeft: "2%",
                  marginRight: "2%"
                }}
                onClick={() => handleAdClick(displayAds[currentAdIndex], currentAdIndex)}
              >
                {/* Media Container with hover overlay - 80% height (changed from 70%) */}
                <div
                  className="ad-media-container"
                  style={{ height: "80%" }}
                >
                  {displayAds[currentAdIndex].adType === "Image" ? (
                    <img
                      src={displayAds[currentAdIndex].adSource}
                      alt={getLocalizedContent(displayAds[currentAdIndex], 'shopName')}
                      className="ad-media"
                    />
                  ) : (
                    <video
                      ref={(el) => (videoRefs.current[currentAdIndex] = el)}
                      src={displayAds[currentAdIndex].adSource}
                      loop
                      className="ad-media"
                      style={{ objectFit: "cover" }}
                    />
                  )}

                  {/* Add overlay for hover effect */}
                  <div className="ad-media-overlay">
                    <span className="ad-overlay-text">{getLocalizedContent(displayAds[currentAdIndex], 'shopName')}</span>
                  </div>
                </div>

                {/* Content Container - 20% height (changed from 30%) */}
                <div className="ad-content-container" style={{ height: "20%" }}>
                  {/* Message with marquee animation */}
                  <div className="ad-message-container">
                    <div
                      ref={(el) => (messageRefs.current[currentAdIndex] = el)}
                      className="ad-message-text"
                    >{getLocalizedContent(displayAds[currentAdIndex], 'message')}</div>
                  </div>

                  {/* Address with marquee animation */}
                  <div className="ad-address-container">
                    <div
                      ref={(el) => (addressRefs.current[currentAdIndex] = el)}
                      className="ad-address-text"
                    >{getLocalizedContent(displayAds[currentAdIndex], 'address')}</div>
                  </div>
                </div>
              </div>

              {/* Right Ad (Next) */}
              <div
                className={`ad-card ad-card-other ${pauseAds ? 'paused-card' : ''}`}
                style={{
                  width: "13%",
                  height: "84%",
                  marginLeft: "2%",
                  marginRight: "0%"
                }}
                onClick={() => {
                  const nextIndex = (currentAdIndex + 1) % displayAds.length;
                  
                  // Check if we're clicking on a clone at the end
                  if (nextIndex >= realAdCount + 2) {
                    // Jump to the corresponding real ad at the beginning
                    const realAdIndex = nextIndex - realAdCount;
                    handleAdClick(displayAds[realAdIndex], realAdIndex);
                  } else {
                    handleAdClick(displayAds[nextIndex], nextIndex);
                  }
                }}
              >
                {/* Get next ad, accounting for circular navigation */}
                {(() => {
                  const nextIndex = (currentAdIndex + 1) % displayAds.length;
                  const nextAd = displayAds[nextIndex];
                  return (
                    <>
                      {/* Media Container with hover overlay - 70% height */}
                      <div
                        className="ad-media-container"
                        style={{ height: "70%" }}
                      >
                        {nextAd.adType === "Image" ? (
                          <img
                            src={nextAd.adSource}
                            alt={getLocalizedContent(nextAd, 'shopName')}
                            className="ad-media"
                          />
                        ) : (
                          <video
                            ref={(el) => (videoRefs.current[nextIndex] = el)}
                            src={nextAd.adSource}
                            loop
                            className="ad-media"
                            style={{ objectFit: "cover" }}
                            muted
                          />
                        )}

                        {/* Add overlay for hover effect */}
                        <div className="ad-media-overlay">
                          <span className="ad-overlay-text">{getLocalizedContent(nextAd, 'shopName')}</span>
                        </div>
                      </div>

                      {/* Content Container - 30% height */}
                      <div className="ad-content-container" style={{ height: "30%" }}>
                        {/* Message with marquee animation */}
                        <div className="ad-message-container">
                          <div
                            ref={(el) => (messageRefs.current[nextIndex] = el)}
                            className="ad-message-text"
                          >{getLocalizedContent(nextAd, 'message')}</div>
                        </div>

                        {/* Address with marquee animation */}
                        <div className="ad-address-container">
                          <div
                            ref={(el) => (addressRefs.current[nextIndex] = el)}
                            className="ad-address-text"
                          >{getLocalizedContent(nextAd, 'address')}</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </div>

        {/* Removed Right Navigation Button */}
      </div>

      {/* QR Code Modal */}
      {showQrCode && selectedAd && (
        <QrContainer
          adData={selectedAd}
          onClose={handleCloseQrCode}
          selectedLang={selectedLang}
        />
      )}
    </div>
  );
};

export default AdManagement;