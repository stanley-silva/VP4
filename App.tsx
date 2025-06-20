
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, AppState, ChallengeContext } from './types';
import { API_KEY, CONVERSATION_STARTERS } from './constants';
import {
  initializeGemini,
  sendMessageToGeminiStream,
  isGeminiInitialized,
  translateTextToPortuguese,
  generatePronunciationChallengeText,
  evaluatePronunciation
} from './services/geminiService';
import MessageItem from './components/MessageItem';
import ConversationStarters from './components/ConversationStarters';
import { GenerateContentResponse } from '@google/genai';

const MicIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
    <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.041h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.041a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
  </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
  </svg>
);

const SpeakerIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
  <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
</svg>
);

const SpinnerIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ChallengeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-2.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
  </svg>
);

const RepeatIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.49-1.332a.75.75 0 0 0-1.449-.387A7.5 7.5 0 0 1 6.551 16.64l-1.903-1.903h3.183a.75.75 0 0 0 0-1.5H2.832a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035Z" clipRule="evenodd" />
  </svg>
);


const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.Initializing);
  const [error, setError] = useState<string | null>(null);
  const [translatingMessageId, setTranslatingMessageId] = useState<string | null>(null);
  const [challengeContext, setChallengeContext] = useState<ChallengeContext>({ status: 'idle', challengeText: null, error: null });

  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const speechEndTimerRef = useRef<number | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const init = async () => {
      setAppState(AppState.Initializing);
      if (!API_KEY) {
        setError("API_KEY is not available. Please configure it in your environment.");
        setAppState(AppState.Error);
        return;
      }
      const initError = initializeGemini(API_KEY);
      if (initError) {
        setError(initError);
        setAppState(AppState.Error);
      } else {
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
          setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
          setAppState(AppState.Error);
          return;
        }
        if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
          setError("Speech synthesis is not supported in this browser.");
          setAppState(AppState.Error);
          return;
        }
        setAppState(AppState.Idle);
      }
    };
    init();
  }, []);

  const addMessage = (text: string, sender: 'user' | 'ai', id?: string) => {
    const newMessage: Message = {
      id: id || Date.now().toString() + Math.random().toString(36).substring(2,9),
      text,
      sender,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  };

  const speakText = useCallback((text: string, callback?: () => void) => {
    if (!text.trim() || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
        if (callback) callback();
        return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    setAppState(AppState.Speaking);
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Target language for the utterance

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined = undefined;

    const preferredUSEnglishVoices = [
        "Google US English",
        "Microsoft David Desktop - English (United States)",
        "Microsoft Zira Desktop - English (United States)",
        "Alex", 
        "Samantha",
    ];

    const qualityKeywords = ["neural", "enhanced", "siri", "premium", "desktop", "wave"];

    // 1. Try preferred en-US voices by exact name
    for (const name of preferredUSEnglishVoices) {
        selectedVoice = voices.find(voice => voice.name === name && voice.lang === 'en-US');
        if (selectedVoice) break;
    }

    // 2. Try en-US voices containing quality keywords
    if (!selectedVoice) {
        for (const keyword of qualityKeywords) {
            selectedVoice = voices.find(voice =>
                voice.lang === 'en-US' && voice.name.toLowerCase().includes(keyword)
            );
            if (selectedVoice) break;
        }
    }
    
    // 3. Try default en-US voice
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang === 'en-US' && voice.default);
    }

    // 4. Try any en-US voice
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang === 'en-US');
    }

    // 5. Fallback: Try other English voices with quality keywords
    if (!selectedVoice) {
        for (const keyword of qualityKeywords) {
            selectedVoice = voices.find(voice =>
                voice.lang.startsWith('en-') && voice.name.toLowerCase().includes(keyword)
            );
            if (selectedVoice) break;
        }
    }

    // 6. Fallback: Try default for any English locale
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en-') && voice.default);
    }
    
    // 7. Fallback: Try any other English voice
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en-'));
    }

    if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`TTS: Using voice: ${selectedVoice.name} (${selectedVoice.lang}) for text: "${text.substring(0,50)}..."`);
    } else {
        console.warn(`TTS: No suitable English voice found. Using browser default for en-US for text: "${text.substring(0,50)}..."`);
    }

    utterance.onend = () => {
      setAppState(current => current === AppState.Speaking ? AppState.Idle : current);
      if (callback) callback();
    };
    utterance.onerror = (event) => {
      const synthesisErrorEvent = event as SpeechSynthesisErrorEvent;
      const synthesisError = synthesisErrorEvent.error || 'Unknown synthesis error';

      if (synthesisError === 'interrupted') {
        console.log('Speech synthesis was intentionally interrupted.');
      } else {
        console.error('SpeechSynthesis Error:', event);
        setError(`Speech synthesis error: ${synthesisError}`);
        setAppState(AppState.Error);
      }
      if (synthesisError !== 'interrupted' && callback) {
        callback();
      }
    };
    window.speechSynthesis.speak(utterance);
  }, []);


  const handleAiResponseStream = useCallback(async (stream: AsyncIterableIterator<GenerateContentResponse>) => {
    let accumulatedText = "";
    const streamingMessageId = Date.now().toString() + "-stream";

    setMessages(prev => [...prev, {
        id: streamingMessageId,
        text: "VP4 is thinking...",
        sender: 'ai',
        timestamp: Date.now()
    }]);

    try {
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          accumulatedText += chunkText;
          setMessages(prev => prev.map(msg =>
              msg.id === streamingMessageId ? {...msg, text: accumulatedText } : msg
          ));
        }
      }
      if (accumulatedText) {
        speakText(accumulatedText, () => {
            if (challengeContext.status === 'evaluating_attempt') {
                 setChallengeContext({ status: 'idle', challengeText: null, error: null });
            }
        });
      } else {
        setMessages(prev => prev.map(msg =>
            msg.id === streamingMessageId ? {...msg, text: "Sorry, I couldn't process that." } : msg
        ));
        speakText("Sorry, I couldn't process that.", () => {
            if (challengeContext.status === 'evaluating_attempt') {
                 setChallengeContext({ status: 'idle', challengeText: null, error: null });
            }
        });
        setAppState(AppState.Idle); 
      }
    } catch (e) {
        console.error("Error processing AI stream:", e);
        const errorMsg = `Stream error: ${e instanceof Error ? e.message : String(e)}`;
        setError(errorMsg);
        setMessages(prev => prev.map(msg =>
            msg.id === streamingMessageId ? {...msg, text: `Sorry, an error occurred: ${errorMsg}` } : msg
        ));
        speakText(`Sorry, an error occurred while I was thinking.`, () => {
             if (challengeContext.status === 'evaluating_attempt') {
                 setChallengeContext({ status: 'idle', challengeText: null, error: null });
            }
        });
        setAppState(AppState.Error);
    }
  }, [speakText, challengeContext.status]);


  const processUserSpeech = useCallback(async (transcript: string) => {
    if (!transcript.trim()) {
      setAppState(AppState.Idle);
      return;
    }

    if (challengeContext.status === 'awaiting_attempt' && challengeContext.challengeText) {
      addMessage(transcript, 'user');
      setChallengeContext(prev => ({ ...prev, status: 'evaluating_attempt' }));
      setAppState(AppState.Processing);

      const evaluationResult = await evaluatePronunciation(challengeContext.challengeText, transcript);
      if (typeof evaluationResult === 'string') {
        addMessage(evaluationResult, 'ai');
        speakText(evaluationResult, () => {
          setChallengeContext({ status: 'idle', challengeText: null, error: null });
        });
      } else {
        const errorMsg = evaluationResult.error || "Failed to evaluate pronunciation.";
        addMessage(`Sorry, I couldn't evaluate your attempt: ${errorMsg}`, 'ai');
        speakText(`Sorry, I couldn't evaluate your attempt right now.`, () => {
          setChallengeContext(prev => ({ ...prev, status: 'error_evaluating', error: errorMsg }));
        });
        setError(errorMsg);
        setAppState(AppState.Error);
      }
      return;
    }

    addMessage(transcript, 'user');
    setAppState(AppState.Processing);

    if (!isGeminiInitialized()) {
      setError("Gemini service is not ready.");
      setAppState(AppState.Error);
      addMessage("Sorry, I'm having trouble connecting. Please try again later.", 'ai');
      speakText("Sorry, I'm having trouble connecting. Please try again later.");
      return;
    }

    const response = await sendMessageToGeminiStream(transcript);
    if ('error' in response) {
      setError(response.error);
      setAppState(AppState.Error);
      const errorMsg = `Sorry, I encountered an error: ${response.error}`;
      addMessage(errorMsg, 'ai');
      speakText(errorMsg);
    } else {
      await handleAiResponseStream(response);
    }
  }, [handleAiResponseStream, speakText, challengeContext]);

  const stopRecording = useCallback(() => {
    if (speechEndTimerRef.current) {
      clearTimeout(speechEndTimerRef.current);
      speechEndTimerRef.current = null;
    }
    if (speechRecognitionRef.current && appState === AppState.Recording) {
      speechRecognitionRef.current.stop();
    }
  }, [appState]);

  const startRecording = useCallback(() => {
    if (appState !== AppState.Idle && appState !== AppState.Error && challengeContext.status !== 'awaiting_attempt') return;

    if (window.speechSynthesis?.speaking) {
        window.speechSynthesis.cancel(); 
    }

    setError(null);
    setChallengeContext(prev => ({...prev, error: null})); 

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
        setError("Speech recognition not supported in this browser.");
        setAppState(AppState.Error);
        return;
    }
    
    if (speechEndTimerRef.current) { 
        clearTimeout(speechEndTimerRef.current);
        speechEndTimerRef.current = null;
    }

    setAppState(AppState.Recording);

    speechRecognitionRef.current = new SpeechRecognitionAPI();
    const recognition = speechRecognitionRef.current;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false; 

    recognition.onspeechstart = () => {
      if (speechEndTimerRef.current) {
        clearTimeout(speechEndTimerRef.current);
        speechEndTimerRef.current = null;
      }
    };

    recognition.onspeechend = () => {
      if (speechEndTimerRef.current) {
        clearTimeout(speechEndTimerRef.current);
      }
      speechEndTimerRef.current = window.setTimeout(() => {
        if (speechRecognitionRef.current && appState === AppState.Recording) {
          console.log("Speech end timer expired, stopping recognition.");
          speechRecognitionRef.current.stop();
        }
      }, 2500); 
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (speechEndTimerRef.current) {
        clearTimeout(speechEndTimerRef.current);
        speechEndTimerRef.current = null;
      }
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      if (transcript) {
        processUserSpeech(transcript);
      } else {
        if (challengeContext.status === 'awaiting_attempt') {
            addMessage("I didn't hear your attempt for the challenge. Try recording again.", 'ai');
            speakText("I didn't hear your attempt for the challenge. Try recording again.");
        }
        setAppState(AppState.Idle); 
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (speechEndTimerRef.current) {
        clearTimeout(speechEndTimerRef.current);
        speechEndTimerRef.current = null;
      }
      console.error('SpeechRecognition Error:', event.error, event.message);
      let errorMessage = `Speech recognition error: ${event.error}. ${event.message || ''}`.trim();
      if (event.error === 'no-speech') {
        errorMessage = "I didn't hear anything. Could you please try speaking again?";
        if (challengeContext.status !== 'awaiting_attempt') {
            addMessage(errorMessage, 'ai');
            speakText(errorMessage);
        } else {
             addMessage("I didn't catch your challenge attempt. Please try speaking again.", 'ai');
             speakText("I didn't catch your challenge attempt. Please try speaking again.");
        }
      } else if (event.error === 'audio-capture') {
        errorMessage = "I couldn't access your microphone. Please check your browser/system permissions.";
         setError(errorMessage);
      } else if (event.error === 'not-allowed') {
        errorMessage = "Microphone access was denied. Please enable it in your browser settings to use the app.";
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }

      if (event.error !== 'no-speech') {
        setAppState(AppState.Error);
      } else {
        setAppState(AppState.Idle);
      }
    };

    recognition.onend = () => {
      if (speechEndTimerRef.current) { 
          clearTimeout(speechEndTimerRef.current);
          speechEndTimerRef.current = null;
      }
      setAppState(currentAppState => {
        if (currentAppState === AppState.Recording) {
          return AppState.Idle;
        }
        return currentAppState;
      });
    };
    recognition.start();
  }, [appState, processUserSpeech, speakText, challengeContext.status]);


  const toggleRecording = () => {
    if (appState === AppState.Speaking) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setAppState(AppState.Idle); 
        if (challengeContext.status !== 'idle' &&
            challengeContext.status !== 'error_generating' &&
            challengeContext.status !== 'error_evaluating') {
          setChallengeContext({ status: 'idle', challengeText: null, error: null });
        }
      }
    } else if (appState === AppState.Recording) {
      stopRecording();
    } else if (appState === AppState.Idle || appState === AppState.Error || challengeContext.status === 'awaiting_attempt') {
      if(appState === AppState.Error) setError(null); 
      startRecording();
    }
  };

  const handleTranslate = useCallback(async (messageId: string, textToTranslate: string) => {
    setTranslatingMessageId(messageId);
    const originalError = error; 
    setError(null); 

    const translationResult = await translateTextToPortuguese(textToTranslate);

    if (typeof translationResult === 'string') {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === messageId ? { ...msg, translatedText: translationResult } : msg
        )
      );
      if (originalError && !error) setError(originalError); 
    } else {
      const translationErrorMsg = translationResult.error || "Failed to translate message.";
      console.error("Translation failed:", translationErrorMsg);
      setError(translationErrorMsg); 
    }
    setTranslatingMessageId(null);
  }, [error]);

  const handleStartPronunciationChallenge = async () => {
    if (isPronunciationChallengeButtonDisabled) return;

    setChallengeContext({ status: 'generating_text', challengeText: null, error: null });
    setError(null);
    if(window.speechSynthesis?.speaking) window.speechSynthesis.cancel();


    const challengeSentenceResult = await generatePronunciationChallengeText();
    if (typeof challengeSentenceResult === 'string') {
      const introMsg = "Alright, here is your pronunciation challenge. Please read the following sentence aloud:";
      addMessage(introMsg, 'ai');
      addMessage(challengeSentenceResult, 'ai');
      speakText(introMsg, () => {
        setChallengeContext(prev => {
            if(prev.status === 'generating_text'){ 
                return { status: 'awaiting_attempt', challengeText: challengeSentenceResult, error: null };
            }
            return prev; 
        });
      });
      setChallengeContext({ status: 'generating_text', challengeText: challengeSentenceResult, error: null });


    } else {
      const errorMsg = challengeSentenceResult.error || "Failed to generate challenge.";
      addMessage(`Sorry, I couldn't generate a challenge right now: ${errorMsg}`, 'ai');
      speakText(`Sorry, I couldn't generate a challenge right now. Please try again later.`);
      setChallengeContext({ status: 'error_generating', challengeText: null, error: errorMsg });
      setError(errorMsg); 
      setAppState(AppState.Idle); 
    }
  };

  const handleRepeatChallengePhrase = () => {
    if (challengeContext.status === 'awaiting_attempt' && challengeContext.challengeText && appState !== AppState.Speaking) {
      if(window.speechSynthesis?.speaking) window.speechSynthesis.cancel();
      speakText(challengeContext.challengeText);
    }
  };

  const getButtonState = () => {
    if (challengeContext.status === 'generating_text') {
      return { text: "Generating Challenge...", icon: <SpinnerIcon className="w-5 h-5" />, disabled: true, bgColor: "bg-orange-500" };
    }
    if (challengeContext.status === 'evaluating_attempt') {
      return { text: "Evaluating Attempt...", icon: <SpinnerIcon className="w-5 h-5" />, disabled: true, bgColor: "bg-orange-500" };
    }
    if (challengeContext.status === 'awaiting_attempt') {
      if (appState === AppState.Recording) {
        return { text: "Stop Recording Challenge", icon: <StopIcon className="w-5 h-5" />, disabled: false, bgColor: "bg-rose-500 hover:bg-rose-600" };
      }
      return { text: "Record Challenge Attempt", icon: <MicIcon className="w-5 h-5" />, disabled: appState === AppState.Speaking, bgColor: "bg-green-600 hover:bg-green-700 text-white" };
    }

    switch (appState) {
      case AppState.Initializing:
        return { text: "Initializing...", icon: <SpinnerIcon className="w-5 h-5" />, disabled: true, bgColor: "bg-gray-400" };
      case AppState.Idle:
        return { text: "Tap to Speak", icon: <MicIcon className="w-5 h-5" />, disabled: false, bgColor: "bg-red-600 hover:bg-red-700 text-white" };
      case AppState.Recording:
        return { text: "Listening...", icon: <StopIcon className="w-5 h-5" />, disabled: false, bgColor: "bg-rose-500 hover:bg-rose-600 text-white" };
      case AppState.Processing:
        return { text: "VP4 is thinking...", icon: <SpinnerIcon className="w-5 h-5" />, disabled: true, bgColor: "bg-orange-500 text-white" };
      case AppState.Speaking:
        return { text: "Stop Speaking", icon: <StopIcon className="w-5 h-5" />, disabled: false, bgColor: "bg-yellow-500 hover:bg-yellow-600 text-white" };
      case AppState.Error:
         return { text: "Retry Speaking", icon: <MicIcon className="w-5 h-5" />, disabled: false, bgColor: "bg-orange-600 hover:bg-orange-700 text-white" };
      default:
        return { text: "Tap to Speak", icon: <MicIcon className="w-5 h-5" />, disabled: true, bgColor: "bg-gray-400 text-white" };
    }
  };

  const mainButtonState = getButtonState();

 const isPronunciationChallengeButtonDisabled =
    appState === AppState.Initializing ||
    appState === AppState.Recording ||
    appState === AppState.Processing ||
    appState === AppState.Speaking || 
    (challengeContext.status !== 'idle' &&
     challengeContext.status !== 'error_generating' &&
     challengeContext.status !== 'error_evaluating') ||
    !!translatingMessageId;

  const isRepeatChallengeButtonVisible = challengeContext.status === 'awaiting_attempt' && !!challengeContext.challengeText;
  const isRepeatChallengeButtonDisabled = appState === AppState.Speaking || appState === AppState.Recording || appState === AppState.Processing;


  useEffect(() => {
    const loadVoices = () => {
        if (window.speechSynthesis) {
          // Calling getVoices() is important for some browsers to populate the list,
          // and for onvoiceschanged to fire consistently.
          const voices = window.speechSynthesis.getVoices();
          console.log("Available TTS voices:", voices.length);
        }
    };
    if ('speechSynthesis' in window && window.speechSynthesis) {
        // Voices might be loaded asynchronously.
        // onvoiceschanged event fires when the list of voices is ready.
        window.speechSynthesis.onvoiceschanged = loadVoices;
        // Call it once explicitly in case voices are already loaded
        loadVoices(); 
    }
    return () => {
        if ('speechSynthesis' in window && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = null;
        }
    };
  }, []);

   useEffect(() => {
    if (appState === AppState.Idle && 
        (challengeContext.status === 'idle' || challengeContext.status === 'error_generating' || challengeContext.status === 'error_evaluating') &&
        !translatingMessageId && 
        error && !challengeContext.error
        ) {
      // setError(null); // Example: Clearing general error if specific conditions are met
    }
  }, [appState, error, challengeContext.status, challengeContext.error, translatingMessageId]);


  const showConversationStarters = !messages.some(msg => msg.sender === 'ai') &&
                                 appState !== AppState.Initializing &&
                                 challengeContext.status === 'idle' &&
                                 !error;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-100 items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-2xl h-full flex flex-col bg-white shadow-2xl rounded-xl overflow-hidden">
        <header className="animated-header-gradient p-4 text-white text-center shadow-md">
          <h1 className="text-xl sm:text-2xl font-bold relative z-10">VP4</h1>
        </header>

        {(error || (challengeContext.error && 
          (challengeContext.status === 'error_generating' || challengeContext.status === 'error_evaluating'))) && (
          <div className="p-3 sm:p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p className="font-bold">Error</p>
            {error && <p className="text-sm">{error}</p>}
            {challengeContext.error && !error && 
             (challengeContext.status === 'error_generating' || challengeContext.status === 'error_evaluating') &&
              <p className="text-sm">Challenge error: {challengeContext.error}</p>
            }
          </div>
        )}


        {appState === AppState.Initializing && !error && (
             <div className="flex-grow flex items-center justify-center p-4">
                <div className="text-center">
                    <SpinnerIcon className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-md sm:text-lg text-slate-600">Initializing your coach, VP4...</p>
                </div>
            </div>
        )}

        <main className={`flex-grow overflow-y-auto p-3 sm:p-4 custom-scrollbar ${showConversationStarters ? 'flex flex-col items-center justify-center' : 'space-y-4'}`}>
          {showConversationStarters && (
            <ConversationStarters starters={CONVERSATION_STARTERS} />
          )}
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              onTranslate={msg.sender === 'ai' && !msg.translatedText ? handleTranslate : undefined}
              isTranslating={translatingMessageId === msg.id}
            />
          ))}
          <div ref={conversationEndRef} />
        </main>

        <footer className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleStartPronunciationChallenge}
              disabled={isPronunciationChallengeButtonDisabled}
              className={`w-full flex items-center justify-center gap-2 font-medium py-3 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2
                          border border-red-500 text-red-600 hover:bg-red-50
                          disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 disabled:cursor-not-allowed
                          focus:ring-red-400`}
              aria-label="Start Pronunciation Challenge"
            >
              <ChallengeIcon />
              <span>Pronunciation Challenge</span>
            </button>

            {isRepeatChallengeButtonVisible && (
                <button
                    onClick={handleRepeatChallengePhrase}
                    disabled={isRepeatChallengeButtonDisabled}
                    className={`w-full flex items-center justify-center gap-2 font-medium py-3 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2
                                border border-sky-500 text-sky-600 hover:bg-sky-50
                                disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 disabled:cursor-not-allowed
                                focus:ring-sky-400`}
                    aria-label="Repeat Challenge Phrase"
                >
                    <RepeatIcon />
                    <span>Repeat Challenge Phrase</span>
                </button>
            )}
          </div>
          <button
            onClick={toggleRecording}
            disabled={mainButtonState.disabled || !!translatingMessageId || challengeContext.status === 'generating_text' || challengeContext.status === 'evaluating_attempt'}
            className={`w-full flex items-center justify-center gap-2 font-medium py-3 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${mainButtonState.bgColor} ${
              (mainButtonState.disabled || !!translatingMessageId || challengeContext.status === 'generating_text' || challengeContext.status === 'evaluating_attempt') ? 'opacity-70 cursor-not-allowed' : ''
            } focus:ring-red-400`}
            aria-label={mainButtonState.text}
            title={(translatingMessageId ? "Please wait for translation to complete" : mainButtonState.text)}
          >
            {mainButtonState.icon}
            <span>{mainButtonState.text}</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default App;
