// import React, { useState, useRef, useEffect } from "react";
// import "./Microphonebutton.css";

// /**
//  * Microphone button component with speech recognition functionality
//  * @param {Object} props - Component props
//  * @param {string} props.selectedLang - Selected language for UI text
//  */
// const Microphonebutton = ({ selectedLang }) => {
//     const buttonText = {
//         English: "Press here to talk",
//         हिंदी: "बोलने के लिए यहाँ दबाएँ",
//         मराठी: "बोलण्यासाठी येथे दाबा"
//     };

//     const noSpeechText = {
//         English: "Didn't hear that. Try again.",
//         हिंदी: "सुनाई नहीं दिया। फिर से कोशिश करें।",
//         मराठी: "ऐकू आले नाही. पुन्हा प्रयत्न करा."
//     };
  
//     const listeningText = {
//         English: "Listening...",
//         हिंदी: "सुन रहा हूँ...",
//         मराठी: "ऐकत आहे..."
//     };
    
//     const micDeniedText = {
//         English: "Microphone access denied",
//         हिंदी: "माइक्रोफोन का उपयोग अस्वीकृत",
//         मराठी: "मायक्रोफोन वापर नाकारला"
//     };

//     // State variables
//     const [isListening, setIsListening] = useState(false);
//     const [displayText, setDisplayText] = useState("");
//     const [isErrorMessage, setIsErrorMessage] = useState(false);
    
//     // Refs for cleanup and tracking
//     const mediaStreamRef = useRef(null);
//     const speechRecognitionRef = useRef(null);
//     const silenceTimerRef = useRef(null);
//     const resetTextTimerRef = useRef(null);
//     const speechDetectedRef = useRef(false);

//     // Initialize display text based on selected language
//     useEffect(() => {
//         setDisplayText(buttonText[selectedLang] || buttonText.English);
//         setIsErrorMessage(false);
//     }, []);
    
//     // Handle language changes
//     useEffect(() => {
//         // If microphone is active, stop it
//         if (isListening) {
//             stopMicrophone();
//         }
        
//         // Clear any reset text timer
//         if (resetTextTimerRef.current) {
//             clearTimeout(resetTextTimerRef.current);
//             resetTextTimerRef.current = null;
//         }
        
//         // Update display text to the new language
//         setDisplayText(buttonText[selectedLang] || buttonText.English);
//         setIsErrorMessage(false);
//     }, [selectedLang]);

//     /**
//      * Handles microphone button click to toggle listening state
//      */
//     const handleMicrophoneClick = async () => {
//         // Toggle microphone state with error handling
//         // Request media permissions and initialize speech recognition
//         if (isListening) {
//             stopMicrophone();
//             return;
//         }

//         try {
//             // Request microphone access
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
//             // Store the stream reference for cleanup
//             mediaStreamRef.current = stream;
            
//             // Update state to indicate we're listening
//             setIsListening(true);
            
//             // Update display text to show we're listening
//             setDisplayText(listeningText[selectedLang] || listeningText.English);
            
//             // Initialize speech recognition
//             initSpeechRecognition();
            
//             // Start the 30-second silence timer
//             startSilenceTimer();
            
//         } catch (error) {
//             // Handle different types of errors
//             if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
//                 console.log("Microphone access denied");
//                 setDisplayText(micDeniedText[selectedLang] || micDeniedText.English);
//                 setIsErrorMessage(true);
                
//                 // Reset text after 3 seconds
//                 setTimeout(() => {
//                     setDisplayText(buttonText[selectedLang] || buttonText.English);
//                     setIsErrorMessage(false);
//                 }, 3000);
//             } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
//                 console.log("No microphone found on this device");
//                 setDisplayText("No microphone found");
//                 setIsErrorMessage(true);
                
//                 // Reset text after 3 seconds
//                 setTimeout(() => {
//                     setDisplayText(buttonText[selectedLang] || buttonText.English);
//                     setIsErrorMessage(false);
//                 }, 3000);
//             } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
//                 console.log("Microphone is already in use or not functioning properly");
//                 setDisplayText("Microphone in use");
                
//                 // Reset text after 3 seconds
//                 setTimeout(() => {
//                     setDisplayText(buttonText[selectedLang] || buttonText.English);
//                 }, 3000);
//             } else if (error.name === "AbortError") {
//                 console.log("Permission request was aborted");
//                 setDisplayText("Request aborted");
                
//                 // Reset text after 3 seconds
//                 setTimeout(() => {
//                     setDisplayText(buttonText[selectedLang] || buttonText.English);
//                 }, 3000);
//             } else if (error.name === "SecurityError") {
//                 console.log("Media support is disabled in this browser");
//                 setDisplayText("Media support disabled");
                
//                 // Reset text after 3 seconds
//                 setTimeout(() => {
//                     setDisplayText(buttonText[selectedLang] || buttonText.English);
//                 }, 3000);
//             } else {
//                 console.log("Error accessing microphone:", error.message);
//                 setDisplayText("Microphone error");
                
//                 // Reset text after 3 seconds
//                 setTimeout(() => {
//                     setDisplayText(buttonText[selectedLang] || buttonText.English);
//                 }, 3000);
//             }
//         }
//     };

//     /**
//      * Initializes speech recognition with language-specific settings
//      */
//     const initSpeechRecognition = () => {
//         // Set up browser speech recognition API with language mapping
//         // Handle recognition events (start, result, error, end)
//         try {
//             // Use browser's SpeechRecognition API
//             const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
//             if (!SpeechRecognition) {
//                 console.log("Speech recognition not supported in this browser");
//                 setDisplayText("Speech recognition not supported");
//                 stopMicrophone();
                
//                 // Reset text after 3 seconds
//                 setTimeout(() => {
//                     setDisplayText(buttonText[selectedLang] || buttonText.English);
//                 }, 3000);
//                 return;
//             }
            
//             const recognition = new SpeechRecognition();
//             recognition.continuous = true;
//             recognition.interimResults = true;
            
//             // Set language based on selected language (defaulting to English)
//             recognition.lang = selectedLang === "हिंदी" ? "hi-IN" : 
//                               selectedLang === "मराठी" ? "mr-IN" : "en-US";
            
//             recognition.onstart = () => {
//                 speechDetectedRef.current = false;
//             };
            
//             recognition.onresult = (event) => {
//                 // Speech detected, reset the silence timer
//                 speechDetectedRef.current = true;
//                 resetSilenceTimer();
//             };
            
//             recognition.onerror = (event) => {
//                 console.log("Speech recognition error:", event.error);
                
//                 // Check if the error is "no-speech" and replace with the appropriate message
//                 if (event.error === "no-speech") {
//                     setDisplayText(noSpeechText[selectedLang] || noSpeechText.English);
                    
//                     // Reset text after 10 seconds
//                     setTimeout(() => {
//                         if (isListening) {
//                             setDisplayText(listeningText[selectedLang] || listeningText.English);
//                         } else {
//                             setDisplayText(buttonText[selectedLang] || buttonText.English);
//                         }
//                     }, 10000);
//                 } else {
//                     setDisplayText("Recognition error: " + event.error);
                    
//                     // Reset text after 3 seconds if still listening
//                     if (isListening) {
//                         setTimeout(() => {
//                             setDisplayText(listeningText[selectedLang] || listeningText.English);
//                         }, 3000);
//                     }
//                 }
//             };
            
//             recognition.onend = () => {
//                 // Restart recognition if still listening
//                 if (isListening) {
//                     recognition.start();
//                 }
//             };
            
//             // Start recognition
//             recognition.start();
            
//             // Store reference for cleanup
//             speechRecognitionRef.current = recognition;
            
//         } catch (error) {
//             console.log("Error initializing speech recognition:", error);
//             setDisplayText("Recognition initialization error");
//             stopMicrophone();
            
//             // Reset text after 3 seconds
//             setTimeout(() => {
//                 setDisplayText(buttonText[selectedLang] || buttonText.English);
//             }, 3000);
//         }
//     };

//     /**
//      * Starts a silence detection timer to auto-stop after inactivity
//      */
//     const startSilenceTimer = () => {
//         // Set 30-second timer to detect silence and stop listening
//         // Clear any existing timer
//         if (silenceTimerRef.current) {
//             clearTimeout(silenceTimerRef.current);
//         }
        
//         // Set a new 30-second timer
//         silenceTimerRef.current = setTimeout(() => {
//             // If no speech was detected during the 30 seconds
//             if (!speechDetectedRef.current) {
//                 // Stop microphone and update UI
//                 stopMicrophone();
//                 setDisplayText(noSpeechText[selectedLang] || noSpeechText.English);
                
//                 // Set timer to reset text after 10 seconds
//                 resetTextTimerRef.current = setTimeout(() => {
//                     setDisplayText(buttonText[selectedLang] || buttonText.English);
//                 }, 10000); // 10 seconds
//             }
//         }, 30000); // 30 seconds
//     };

//     /**
//      * Resets the silence timer when speech is detected
//      */
//     const resetSilenceTimer = () => {
//         // Reset and restart silence detection timer
//         // Clear existing timer
//         if (silenceTimerRef.current) {
//             clearTimeout(silenceTimerRef.current);
//         }
        
//         // Start a new timer
//         startSilenceTimer();
//     };

//     /**
//      * Stops microphone and cleans up resources
//      */
//     const stopMicrophone = () => {
//         // Stop all audio tracks
//         if (mediaStreamRef.current) {
//             mediaStreamRef.current.getTracks().forEach(track => track.stop());
//             mediaStreamRef.current = null;
//         }
        
//         // Stop speech recognition
//         if (speechRecognitionRef.current) {
//             speechRecognitionRef.current.stop();
//             speechRecognitionRef.current = null;
//         }
        
//         // Clear timers
//         if (silenceTimerRef.current) {
//             clearTimeout(silenceTimerRef.current);
//             silenceTimerRef.current = null;
//         }
        
//         setIsListening(false);
//         setDisplayText(buttonText[selectedLang] || buttonText.English);
//         setIsErrorMessage(false);
//     };

//     // Clean up resources when component unmounts
//     useEffect(() => {
//         return () => {
//             stopMicrophone();
//             if (resetTextTimerRef.current) {
//                 clearTimeout(resetTextTimerRef.current);
//             }
//         };
//     }, []);

//     return (
//         <div className="flex flex-col items-center">
//             <button
//                 className={`mic-button ${isListening ? 'listening' : ''}`}
//                 aria-label={displayText}
//                 onClick={handleMicrophoneClick}
//             >
//                 <img
//                     src="/icons/microphone-solid.svg"
//                     alt="Microphone"
//                     className="w-6 h-6"
//                 />
//             </button>
//             <p className={`mic-button-text ${isErrorMessage ? 'mic-error-text' : ''}`}>{displayText}</p>
//         </div>
//     );
// };

// export default Microphonebutton;


import React, { useState, useRef, useEffect } from "react";
import "./Microphonebutton.css";

/**
 * Microphone button component with speech recognition functionality
 * @param {Object} props - Component props
 * @param {string} props.selectedLang - Selected language for UI text
 * @param {function} props.onResponse - Callback function to handle API response (optional)
 * @param {string} props.apiBaseUrl - Base URL for the API (optional, defaults to localhost:8000)
 */
const Microphonebutton = ({ selectedLang, onResponse, apiBaseUrl = "http://localhost:8000" }) => {
    const buttonText = {
        English: "Press here to talk",
        हिंदी: "बोलने के लिए यहाँ दबाएँ",
        मराठी: "बोलण्यासाठी येथे दाबा"
    };

    const noSpeechText = {
        English: "Didn't hear that. Try again.",
        हिंदी: "सुनाई नहीं दिया। फिर से कोशिश करें।",
        मराठी: "ऐकू आले नाही. पुन्हा प्रयत्न करा."
    };
  
    const listeningText = {
        English: "Listening...",
        हिंदी: "सुन रहा हूँ...",
        मराठी: "ऐकत आहे..."
    };
    
    const processingText = {
        English: "Processing...",
        हिंदी: "प्रसंस्करण...",
        मराठी: "प्रक्रिया करत आहे..."
    };
    
    const micDeniedText = {
        English: "Microphone access denied",
        हिंदी: "माइक्रोफोन का उपयोग अस्वीकृत",
        मराठी: "मायक्रोफोन वापर नाकारला"
    };

    const apiErrorText = {
        English: "Server error. Please try again.",
        हिंदी: "सर्वर त्रुटि। कृपया पुनः प्रयास करें।",
        मराठी: "सर्व्हर त्रुटी. कृपया पुन्हा प्रयत्न करा."
    };

    const speakingText = {
        English: "Speaking...",
        हिंदी: "बोल रहा हूँ...",
        मराठी: "बोलत आहे..."
    };

    // State variables
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [displayText, setDisplayText] = useState("");
    const [isErrorMessage, setIsErrorMessage] = useState(false);
    
    // Refs for cleanup and tracking
    const mediaStreamRef = useRef(null);
    const speechRecognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const resetTextTimerRef = useRef(null);
    const speechDetectedRef = useRef(false);
    const finalTranscriptRef = useRef("");
    const speechSynthesisRef = useRef(null);

    // Initialize display text based on selected language
    useEffect(() => {
        setDisplayText(buttonText[selectedLang] || buttonText.English);
        setIsErrorMessage(false);
    }, []);
    
    // Handle language changes
    useEffect(() => {
        // If microphone is active, stop it
        if (isListening) {
            stopMicrophone();
        }
        
        // Clear any reset text timer
        if (resetTextTimerRef.current) {
            clearTimeout(resetTextTimerRef.current);
            resetTextTimerRef.current = null;
        }
        
        // Update display text to the new language
        if (!isProcessing && !isSpeaking) {
            setDisplayText(buttonText[selectedLang] || buttonText.English);
            setIsErrorMessage(false);
        }
    }, [selectedLang]);

    /**
     * Speaks the given text using browser's Text-to-Speech
     */
    const speakText = (text) => {
        // Stop any ongoing speech
        if (speechSynthesisRef.current) {
            window.speechSynthesis.cancel();
        }

        if (!text || !text.trim()) return;

        // Check if speech synthesis is supported
        if (!window.speechSynthesis) {
            console.log("Speech synthesis not supported in this browser");
            return;
        }

        setIsSpeaking(true);
        setDisplayText(speakingText[selectedLang] || speakingText.English);

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language based on selected language
        utterance.lang = selectedLang === "हिंदी" ? "hi-IN" : 
                        selectedLang === "मराठी" ? "mr-IN" : "en-US";
        
        // Set voice properties
        utterance.rate = 0.9; // Slightly slower for better understanding
        utterance.pitch = 1;
        utterance.volume = 1;

        // Handle speech events
        utterance.onstart = () => {
            console.log("Started speaking:", text);
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            console.log("Finished speaking");
            setIsSpeaking(false);
            setDisplayText(buttonText[selectedLang] || buttonText.English);
            setIsErrorMessage(false);
        };

        utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event.error);
            setIsSpeaking(false);
            setDisplayText(buttonText[selectedLang] || buttonText.English);
            setIsErrorMessage(false);
        };

        // Store reference and start speaking
        speechSynthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    /**
     * Sends the recognized speech to the FastAPI backend
     */
    const sendToAPI = async (transcript) => {
        if (!transcript.trim()) {
            console.log("Empty transcript, not sending to API");
            return;
        }
        
        setIsProcessing(true);
        setDisplayText(processingText[selectedLang] || processingText.English);
        
        try {
            console.log("Sending to API:", transcript);
            
            const response = await fetch(`${apiBaseUrl}/rag/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: transcript
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            // Call the onResponse callback if provided
            if (onResponse && typeof onResponse === 'function') {
                onResponse({
                    question: transcript,
                    answer: data.answer,
                    context: data.context || []
                });
            }
            
            // Speak the answer using TTS
            speakText(data.answer);
            
        } catch (error) {
            console.error('Error calling API:', error);
            
            // Show user-friendly error message
            setDisplayText(apiErrorText[selectedLang] || apiErrorText.English);
            setIsErrorMessage(true);
            
            // Also call onResponse with error if callback exists
            if (onResponse && typeof onResponse === 'function') {
                onResponse({
                    question: transcript,
                    answer: `Error: ${error.message}`,
                    context: [],
                    error: true
                });
            }
            
            // Reset text after 4 seconds
            setTimeout(() => {
                setDisplayText(buttonText[selectedLang] || buttonText.English);
                setIsErrorMessage(false);
            }, 4000);
        } finally {
            setIsProcessing(false);
        }
    };

    /**
     * Handles microphone button click to toggle listening state
     */
    const handleMicrophoneClick = async () => {
        // Don't allow interaction while processing or speaking
        if (isProcessing || isSpeaking) {
            console.log("Currently processing or speaking, ignoring click");
            return;
        }
        
        // Stop any ongoing speech synthesis
        if (speechSynthesisRef.current) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
        
        // Toggle microphone state with error handling
        if (isListening) {
            console.log("Stopping microphone manually");
            stopMicrophone();
            return;
        }

        try {
            console.log("Starting microphone...");
            
            // Reset final transcript
            finalTranscriptRef.current = "";
            
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Store the stream reference for cleanup
            mediaStreamRef.current = stream;
            
            // Update state to indicate we're listening
            setIsListening(true);
            
            // Update display text to show we're listening
            setDisplayText(listeningText[selectedLang] || listeningText.English);
            
            // Initialize speech recognition
            initSpeechRecognition();
            
            // Start the 30-second silence timer
            startSilenceTimer();
            
        } catch (error) {
            console.error("Microphone access error:", error);
            
            // Handle different types of errors
            if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                setDisplayText(micDeniedText[selectedLang] || micDeniedText.English);
                setIsErrorMessage(true);
                
                setTimeout(() => {
                    setDisplayText(buttonText[selectedLang] || buttonText.English);
                    setIsErrorMessage(false);
                }, 3000);
            } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
                setDisplayText("No microphone found");
                setIsErrorMessage(true);
                
                setTimeout(() => {
                    setDisplayText(buttonText[selectedLang] || buttonText.English);
                    setIsErrorMessage(false);
                }, 3000);
            } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
                setDisplayText("Microphone in use");
                setIsErrorMessage(true);
                
                setTimeout(() => {
                    setDisplayText(buttonText[selectedLang] || buttonText.English);
                    setIsErrorMessage(false);
                }, 3000);
            } else if (error.name === "AbortError") {
                setDisplayText("Request aborted");
                setIsErrorMessage(true);
                
                setTimeout(() => {
                    setDisplayText(buttonText[selectedLang] || buttonText.English);
                    setIsErrorMessage(false);
                }, 3000);
            } else if (error.name === "SecurityError") {
                setDisplayText("Media support disabled");
                setIsErrorMessage(true);
                
                setTimeout(() => {
                    setDisplayText(buttonText[selectedLang] || buttonText.English);
                    setIsErrorMessage(false);
                }, 3000);
            } else {
                setDisplayText("Microphone error");
                setIsErrorMessage(true);
                
                setTimeout(() => {
                    setDisplayText(buttonText[selectedLang] || buttonText.English);
                    setIsErrorMessage(false);
                }, 3000);
            }
        }
    };

    /**
     * Initializes speech recognition with language-specific settings
     */
    const initSpeechRecognition = () => {
        try {
            // Use browser's SpeechRecognition API
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                console.log("Speech recognition not supported in this browser");
                setDisplayText("Speech recognition not supported");
                setIsErrorMessage(true);
                stopMicrophone();
                
                setTimeout(() => {
                    setDisplayText(buttonText[selectedLang] || buttonText.English);
                    setIsErrorMessage(false);
                }, 3000);
                return;
            }
            
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            
            // Set language based on selected language
            recognition.lang = selectedLang === "हिंदी" ? "hi-IN" : 
                              selectedLang === "मराठी" ? "mr-IN" : "en-US";
            
            console.log("Speech recognition language set to:", recognition.lang);
            
            recognition.onstart = () => {
                console.log("Speech recognition started");
                speechDetectedRef.current = false;
                finalTranscriptRef.current = "";
            };
            
            recognition.onresult = (event) => {
                // Speech detected, reset the silence timer
                speechDetectedRef.current = true;
                resetSilenceTimer();
                
                // Process the results to build final transcript
                let finalTranscript = '';
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                // Update the final transcript accumulator
                if (finalTranscript) {
                    finalTranscriptRef.current += finalTranscript;
                    console.log('Updated final transcript:', finalTranscriptRef.current);
                }
                
                // Log interim results for debugging
                if (interimTranscript) {
                    console.log('Interim transcript:', interimTranscript);
                }
            };
            
            recognition.onerror = (event) => {
                console.log("Speech recognition error:", event.error);
                
                // Handle specific errors
                if (event.error === "no-speech") {
                    setDisplayText(noSpeechText[selectedLang] || noSpeechText.English);
                    setIsErrorMessage(true);
                    
                    setTimeout(() => {
                        if (isListening) {
                            setDisplayText(listeningText[selectedLang] || listeningText.English);
                            setIsErrorMessage(false);
                        } else {
                            setDisplayText(buttonText[selectedLang] || buttonText.English);
                            setIsErrorMessage(false);
                        }
                    }, 3000);
                } else if (event.error === "network") {
                    setDisplayText("Network error");
                    setIsErrorMessage(true);
                    stopMicrophone();
                    
                    setTimeout(() => {
                        setDisplayText(buttonText[selectedLang] || buttonText.English);
                        setIsErrorMessage(false);
                    }, 3000);
                } else {
                    setDisplayText("Recognition error: " + event.error);
                    setIsErrorMessage(true);
                    
                    if (isListening) {
                        setTimeout(() => {
                            setDisplayText(listeningText[selectedLang] || listeningText.English);
                            setIsErrorMessage(false);
                        }, 3000);
                    }
                }
            };
            
            recognition.onend = () => {
                console.log("Speech recognition ended");
                
                // If we have a final transcript and we're stopping, send it to API
                if (finalTranscriptRef.current.trim() && !isListening) {
                    console.log("Sending final transcript to API:", finalTranscriptRef.current.trim());
                    sendToAPI(finalTranscriptRef.current.trim());
                }
                
                // Restart recognition if still in listening mode
                if (isListening) {
                    console.log("Restarting speech recognition...");
                    setTimeout(() => {
                        if (isListening) {
                            recognition.start();
                        }
                    }, 100);
                }
            };
            
            // Start recognition
            recognition.start();
            
            // Store reference for cleanup
            speechRecognitionRef.current = recognition;
            
        } catch (error) {
            console.error("Error initializing speech recognition:", error);
            setDisplayText("Recognition initialization error");
            setIsErrorMessage(true);
            stopMicrophone();
            
            setTimeout(() => {
                setDisplayText(buttonText[selectedLang] || buttonText.English);
                setIsErrorMessage(false);
            }, 3000);
        }
    };

    /**
     * Starts a silence detection timer to auto-stop after inactivity
     */
    const startSilenceTimer = () => {
        // Clear any existing timer
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
        
        // Set a new 30-second timer
        silenceTimerRef.current = setTimeout(() => {
            console.log("Silence timer triggered. Speech detected:", speechDetectedRef.current);
            
            // If no speech was detected during the 30 seconds
            if (!speechDetectedRef.current) {
                stopMicrophone();
                setDisplayText(noSpeechText[selectedLang] || noSpeechText.English);
                setIsErrorMessage(true);
                
                // Set timer to reset text after 5 seconds
                resetTextTimerRef.current = setTimeout(() => {
                    setDisplayText(buttonText[selectedLang] || buttonText.English);
                    setIsErrorMessage(false);
                }, 5000);
            } else {
                // Speech was detected, stop listening and process
                console.log("Auto-stopping after speech detection");
                stopMicrophone();
            }
        }, 30000); // 30 seconds
    };

    /**
     * Resets the silence timer when speech is detected
     */
    const resetSilenceTimer = () => {
        // Clear existing timer and start a new one
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
        startSilenceTimer();
    };

    /**
     * Stops microphone and cleans up resources
     */
    const stopMicrophone = () => {
        console.log("Stopping microphone...");
        
        // Check if we have a final transcript to send
        const shouldSendToAPI = finalTranscriptRef.current.trim() && isListening && !isProcessing;
        
        // Stop all audio tracks
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        
        // Stop speech recognition
        if (speechRecognitionRef.current) {
            speechRecognitionRef.current.stop();
            speechRecognitionRef.current = null;
        }
        
        // Clear timers
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        
        // Update state
        setIsListening(false);
        
        // Send to API if we have content
        if (shouldSendToAPI) {
            console.log("Sending transcript on stop:", finalTranscriptRef.current.trim());
            sendToAPI(finalTranscriptRef.current.trim());
        } else if (!isProcessing && !isSpeaking) {
            setDisplayText(buttonText[selectedLang] || buttonText.English);
            setIsErrorMessage(false);
        }
    };

    // Clean up resources when component unmounts
    useEffect(() => {
        return () => {
            console.log("Component unmounting, cleaning up...");
            stopMicrophone();
            if (resetTextTimerRef.current) {
                clearTimeout(resetTextTimerRef.current);
            }
            // Stop any ongoing speech synthesis
            if (speechSynthesisRef.current) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center">
            <button
                className={`mic-button ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''} ${isSpeaking ? 'speaking' : ''}`}
                aria-label={displayText}
                onClick={handleMicrophoneClick}
                disabled={isProcessing || isSpeaking}
            >
                <img
                    src="/icons/microphone-solid.svg"
                    alt="Microphone"
                    className="w-6 h-6"
                />
            </button>
            <p className={`mic-button-text ${isErrorMessage ? 'mic-error-text' : ''}`}>{displayText}</p>
        </div>
    );
};

export default Microphonebutton;