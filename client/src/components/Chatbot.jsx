import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { 
  MessageSquare, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Square, 
  Sparkles, 
  Bot, 
  User, 
  ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

// Helper to render markdown-like text with clickable links & bold tags
const FormattedMessage = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {lines.map((line, lineIndex) => {
        if (!line.trim()) {
          return <div key={lineIndex} style={{ height: '6px' }} />;
        }

        const parts = [];
        let remaining = line;
        const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|(https?:\/\/[^\s]+))/g;
        let lastIdx = 0;
        let match;

        while ((match = regex.exec(remaining)) !== null) {
          if (match.index > lastIdx) {
            parts.push(remaining.substring(lastIdx, match.index));
          }

          if (match[2] && match[3]) {
            parts.push(
              <a
                key={`link-${lineIndex}-${match.index}`}
                href={match[3]}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#60a5fa',
                  textDecoration: 'underline',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: 'rgba(96, 165, 250, 0.12)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  wordBreak: 'break-all'
                }}
              >
                <span>{match[2]}</span>
                <ExternalLink size={12} />
              </a>
            );
          } else if (match[4]) {
            parts.push(
              <strong key={`bold-${lineIndex}-${match.index}`} style={{ color: '#fff', fontWeight: '700' }}>
                {match[4]}
              </strong>
            );
          } else if (match[5]) {
            parts.push(
              <a
                key={`rawlink-${lineIndex}-${match.index}`}
                href={match[5]}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#60a5fa',
                  textDecoration: 'underline',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  wordBreak: 'break-all'
                }}
              >
                <span>{match[5]}</span>
                <ExternalLink size={12} />
              </a>
            );
          }

          lastIdx = regex.lastIndex;
        }

        if (lastIdx < remaining.length) {
          parts.push(remaining.substring(lastIdx));
        }

        return (
          <p key={lineIndex} style={{ margin: 0, lineHeight: '1.5' }}>
            {parts.length > 0 ? parts : line}
          </p>
        );
      })}
    </div>
  );
};

const LANG_SPEECH_MAP = {
  en: { locale: 'en-IN', name: 'English' },
  hi: { locale: 'hi-IN', name: 'हिन्दी' },
  hinglish: { locale: 'hi-IN', name: 'Hinglish' },
  bn: { locale: 'bn-IN', name: 'বাংলা' },
  mr: { locale: 'mr-IN', name: 'मराठी' },
  te: { locale: 'te-IN', name: 'తెలుగు' },
  ta: { locale: 'ta-IN', name: 'தமிழ்' },
  gu: { locale: 'gu-IN', name: 'ગુજરાતી' }
};

const WELCOME_MESSAGES = {
  en: {
    text: 'Hello! I am your **GovScheme AI Assistant** 🏛️\n\nAsk me about any central or state government scheme, solar subsidy, scholarship, loan, exam, or online form filling in your language.',
    placeholder: 'Ask a question or tap mic to speak in English...',
    suggestions: ['PM-KUSUM Solar Pump ☀️', 'PM-KISAN ₹6,000 🌾', 'How to Apply Online 📋', 'Latest Govt Jobs 🏢']
  },
  hi: {
    text: 'नमस्ते! मैं आपका **GovScheme AI सरकारी मित्र** हूँ 🏛️\n\nआप मुझसे किसी भी सरकारी योजना, पीएम-कुसुम सोलर पंप, पीएम-किसान, छात्रवृत्ति, मुद्रा व्यापार लोन, सरकारी नौकरी या ऑनलाइन फॉर्म भरने के बारे में **बोलकर (🎙️)** या **लिखकर** पूछ सकते हैं।',
    placeholder: 'यहाँ पूछें या माइक से बोलें...',
    suggestions: ['पीएम-कुसुम सोलर पंप ☀️', 'पीएम-किसान ₹6,000 🌾', 'आवेदन कैसे करें 📋', 'सरकारी नौकरियां 🏢']
  },
  hinglish: {
    text: 'Namaste! Main GovScheme AI Assistant (सरकारी मित्र) hu 🏛️\n\nAap mujhse kisi bhi sarkari yojana, scholarship, business loan, exam ya form bharne ke baare me **apni bhasha me bolkar (🎙️)** ya **likhkar** pooch sakte hain.',
    placeholder: 'Poochhein ya type karein...',
    suggestions: ['PM-KUSUM Solar Pump ☀️', 'PM-KISAN ₹6,000 🌾', 'Form Kaise Bharein 📋', 'Mudra Loans 💼', 'Latest Govt Jobs 🏢']
  },
  bn: {
    text: 'নমস্কার! আমি আপনার **GovScheme AI সহকারী** 🏛️\n\nআপনি যে কোনো সরকারি প্রকল্প, পিএম-কুসুম সোলার পাম্প, পিএম-কিসান, স্কলারশিপ, মুদ্রা ঋণ বা সরকারি চাকরি সম্পর্কে **মুখে বলে (🎙️)** বা **লিখে** জানতে পারেন।',
    placeholder: 'এখানে প্রশ্ন লিখুন বা মুখে বলুন...',
    suggestions: ['পিএম-কুসুম সোলার পাম্প ☀️', 'পিএম-কিসান ₹৬,০০০ 🌾', 'আবেদন করার নিয়ম 📋', 'সরকারি চাকরি 🏢']
  },
  mr: {
    text: 'नमस्कार! मी तुमचा **GovScheme AI सरकारी मदतनीस** आहे 🏛️\n\nतुम्ही कोणत्याही सरकारी योजना, पीएम-कुसुम सोलर पंप, पीएम-किसान, शिष्यवृत्ती, मुद्रा व्यवसाय कर्ज किंवा सरकारी भरतीबद्दल **बोलून (🎙️)** किंवा **टाइप करून** विचारू शकता.',
    placeholder: 'येथे प्रश्न विचारा किंवा माइक वापरा...',
    suggestions: ['पीएम-कुसुम सोलर पंप ☀️', 'पीएम-किसान ₹६,००० 🌾', 'अर्ज कसा करावा 📋', 'सरकारी नोकऱ्या 🏢']
  },
  te: {
    text: 'నమస్కారం! నేను మీ **GovScheme AI ప్రభుత్వ సహాయకుడిని** 🏛️\n\nమీరు ఏ ప్రభుత్వ పథకం, పీఎం-కుసుమ్ సోలార్ పంపులు, పీఎం-కిసాన్, స్కాలర్‌షిప్‌లు, ముద్రా రుణాలు లేదా ఉద్యోగాల గురించి **మాట్లాడి (🎙️)** లేదా **రాసి** అడగవచ్చు.',
    placeholder: 'ఇక్కడ ప్రశ్న అడగండి లేదా మైక్ వాడండి...',
    suggestions: ['పీఎం-కుసుమ్ సోలార్ పంప్ ☀️', 'పీఎం-కిసాన్ ₹6,000 🌾', 'దరఖాస్తు విధానం 📋', 'ప్రభుత్వ ఉద్యోగాలు 🏢']
  },
  ta: {
    text: 'வணக்கம்! நான் உங்கள் **GovScheme AI அரசு வழிகாட்டி** 🏛️\n\nஅரசு திட்டங்கள், பிஎம்-குசும் சோலார் பம்ப், உதவித்தொகை, முத்ரா கடன்கள் மற்றும் அரசு வேலைவாய்ப்புகள் பற்றி நீங்கள் **பேசியோ (🎙️)** அல்லது **எழுதியோ** கேட்கலாம்.',
    placeholder: 'இங்கே கேட்கவும் அல்லது பேசவும்...',
    suggestions: ['பிஎம்-குசும் சோலார் ☀️', 'பிஎம்-கிசான் ₹6,000 🌾', 'விண்ணப்பிக்கும் முறை 📋', 'அரசு வேலைகள் 🏢']
  },
  gu: {
    text: 'નમસ્તે! હું તમારો **GovScheme AI સરકારી મિત્ર** છું 🏛️\n\nતમે કોઈપણ સરકારી યોજનાઓ, પીએમ-કુસુમ સોલાર પંપ, પીએમ-કિસાન, શિષ્યવૃત્તિ, મુદ્રા લોન અથવા સરકારી ભરતી વિશે **બોલીને (🎙️)** અથવા **લખીને** પૂછી શકો છો.',
    placeholder: 'અહીં પૂછો અથવા માઇકથી બોલો...',
    suggestions: ['પીએમ-કુસુમ સોલાર પંપ ☀️', 'પીએમ-કિસાન ₹6,000 🌾', 'અરજી કરવાની રીત 📋', 'સરકારી નોકરીઓ 🏢']
  }
};

const Chatbot = () => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeakingIdx, setActiveSpeakingIdx] = useState(null);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeWelcome = WELCOME_MESSAGES[language] || WELCOME_MESSAGES.en;

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: activeWelcome.text,
      suggestions: activeWelcome.suggestions
    }
  ]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // When language changes from navbar, adapt greeting if chat only has the welcome message
  useEffect(() => {
    const welcome = WELCOME_MESSAGES[language] || WELCOME_MESSAGES.en;
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            sender: 'bot',
            text: welcome.text,
            suggestions: welcome.suggestions
          }
        ];
      }
      return prev;
    });

    // If voice is currently speaking, stop it on language switch
    stopSpeaking();
  }, [language]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      const targetLang = LANG_SPEECH_MAP[language] || LANG_SPEECH_MAP.en;
      recognition.lang = targetLang.locale;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        handleSendMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // STOP Voice Assistant (ChatGPT style immediate voice cancel)
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setActiveSpeakingIdx(null);
  };

  // Voice Toggle (Start / Stop Mic)
  const toggleListening = () => {
    // If AI is currently speaking, stop voice immediately like ChatGPT barge-in
    if (isSpeaking) {
      stopSpeaking();
    }

    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const targetLang = LANG_SPEECH_MAP[language] || LANG_SPEECH_MAP.en;
        recognitionRef.current.lang = targetLang.locale;
        recognitionRef.current.start();
      } catch (err) {
        console.error('Mic start error:', err);
      }
    }
  };

  // Text to Speech with active language locale & Stop control (Only active when enabled or manually triggered)
  const speakText = (text, index = null, forceManual = false) => {
    if ((!speechEnabled && !forceManual) || !('speechSynthesis' in window)) return;

    // If already speaking this message, toggle stop
    if (isSpeaking && activeSpeakingIdx === index) {
      stopSpeaking();
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[*_#`[\]()]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[🏛️☀️⚡📋🏢🌾🙏😊💡⚙️💰⚠️📄🔗📌]/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLang = LANG_SPEECH_MAP[language] || LANG_SPEECH_MAP.en;
    utterance.lang = targetLang.locale;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Match best available voice for language
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang === targetLang.locale || v.lang.startsWith(targetLang.locale.split('-')[0]));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setActiveSpeakingIdx(index);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeakingIdx(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeakingIdx(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend = inputMessage) => {
    const text = textToSend?.trim();
    if (!text) return;

    // Stop speaking whenever user asks a new question
    stopSpeaking();

    const newMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-8).map(m => ({ sender: m.sender, text: m.text }));
      
      // Send selected language to the API so backend generates reply in this exact language
      const res = await API.post('/chat', { 
        message: text, 
        history: historyPayload,
        language: language || 'en'
      });

      const botReply = res.data.data.reply;
      const suggestions = res.data.data.suggestions || [];

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          suggestions
        }
      ]);

      if (speechEnabled) {
        speakText(botReply, messages.length + 1);
      }
    } catch (err) {
      const errorMsg = language === 'hi' 
        ? 'क्षमा करें, सर्वर से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें।'
        : language === 'bn'
        ? 'দুঃখিত, সার্ভারের সাথে সংযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
        : language === 'mr'
        ? 'माफ करा, सर्व्हरशी कनेक्ट करताना समस्या आली. कृपया पुन्हा प्रयत्न करा.'
        : 'Kshama karein, server se connect karne me dikkat aayi. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: errorMsg
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999 }}>
      {/* Wave animation CSS */}
      <style>{`
        @keyframes chatSoundWave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .chat-wave-bar {
          display: inline-block;
          width: 3px;
          border-radius: 3px;
          background: #ef4444;
          animation: chatSoundWave 1.2s infinite ease-in-out;
        }
        .chat-wave-bar:nth-child(1) { animation-delay: 0.1s; height: 6px; }
        .chat-wave-bar:nth-child(2) { animation-delay: 0.3s; height: 14px; }
        .chat-wave-bar:nth-child(3) { animation-delay: 0.2s; height: 10px; }
        .chat-wave-bar:nth-child(4) { animation-delay: 0.4s; height: 16px; }
      `}</style>

      {/* Floating Launcher Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(true)}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.55)',
            position: 'relative'
          }}
          aria-label="Open AI Government Mitra"
        >
          <Bot size={30} />
          <span style={{ 
            position: 'absolute', 
            top: '-2px', 
            right: '-2px', 
            width: '15px', 
            height: '15px', 
            background: 'var(--success)', 
            borderRadius: '50%', 
            border: '2px solid var(--bg-primary)' 
          }}></span>
        </motion.button>
      )}

      {/* Main Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              width: '430px',
              maxWidth: '92vw',
              height: '640px',
              maxHeight: '86vh',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-glow)',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ 
              padding: '14px 18px', 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%)', 
              borderBottom: '1px solid var(--border-subtle)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={22} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    GovScheme AI Mitra <Sparkles size={13} color="var(--warning)" />
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ● Language: {LANG_SPEECH_MAP[language]?.name || 'English'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Voice Auto-Speak Manual Toggle */}
                <button
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    setSpeechEnabled(!speechEnabled);
                  }}
                  title={speechEnabled 
                    ? (language === 'hi' ? 'ऑटो-वॉयस चालू है (क्लिक करके म्यूट करें)' : 'Auto-voice ON (Click to mute)')
                    : (language === 'hi' ? 'ऑटो-वॉयस बंद है (क्लिक करके चालू करें)' : 'Auto-voice Muted (Click to activate)')
                  }
                  style={{ 
                    background: speechEnabled ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)', 
                    border: speechEnabled ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)', 
                    borderRadius: '20px', 
                    padding: '4px 10px', 
                    height: '30px', 
                    color: speechEnabled ? 'var(--accent-primary)' : 'var(--text-muted)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  }}
                >
                  {speechEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <span>{speechEnabled ? (language === 'hi' ? 'वॉयस चालू' : 'Voice ON') : (language === 'hi' ? 'वॉयस म्यूट' : 'Voice Muted')}</span>
                </button>

                {/* Close Chatbot */}
                <button
                  onClick={() => {
                    stopSpeaking();
                    setIsOpen(false);
                  }}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid var(--border-subtle)', 
                    borderRadius: '50%', 
                    width: '32px', 
                    height: '32px', 
                    color: 'var(--text-secondary)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Chat Messages Container */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {messages.map((msg, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      maxWidth: '88%',
                      padding: '12px 16px',
                      borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: msg.sender === 'user' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.04)',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '13px',
                      boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none'
                    }}
                  >
                    <FormattedMessage text={msg.text} />

                    {/* In-Bubble Speech Trigger / Stop Control */}
                    {msg.sender === 'bot' && (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isSpeaking && activeSpeakingIdx === index ? (
                          <button
                            onClick={stopSpeaking}
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid var(--error)',
                              color: 'var(--error)',
                              borderRadius: '8px',
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Square size={11} fill="currentColor" />
                            <span>Stop Voice ⏹️</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => speakText(msg.text, index, true)}
                            title={language === 'hi' ? 'इसे बोलकर सुनें' : 'Listen to this answer'}
                            style={{
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-secondary)',
                              borderRadius: '8px',
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Volume2 size={11} />
                            <span>{language === 'hi' ? 'सुनें 🔊' : 'Listen 🔊'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Suggestion Pills */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(sug)}
                          style={{
                            padding: '5px 11px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid var(--border-glow)',
                            borderRadius: '12px',
                            color: 'var(--accent-primary)',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.04)', padding: '10px 14px', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="var(--accent-primary)" />
                  <span>AI Gemini {LANG_SPEECH_MAP[language]?.name || ''} me uttar taiyar kar raha hai...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 🔴 ChatGPT-Style Prominent Floating Stop Voice Bar (Active while speaking) */}
            {isSpeaking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{
                  padding: '9px 16px',
                  background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.18) 0%, rgba(99, 102, 241, 0.18) 100%)',
                  borderTop: '1px solid rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '16px' }}>
                    <span className="chat-wave-bar"></span>
                    <span className="chat-wave-bar"></span>
                    <span className="chat-wave-bar"></span>
                    <span className="chat-wave-bar"></span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>
                    AI is speaking ({LANG_SPEECH_MAP[language]?.name || 'Voice'})...
                  </span>
                </div>

                <button
                  onClick={stopSpeaking}
                  style={{
                    padding: '5px 12px',
                    background: 'var(--error)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)'
                  }}
                  title="Stop AI voice assistant"
                >
                  <Square size={11} fill="#fff" />
                  <span>Stop Voice ⏹️</span>
                </button>
              </motion.div>
            )}

            {/* Live Microphone Listening Status Bar */}
            {isListening && (
              <div style={{ 
                padding: '8px 16px', 
                background: 'rgba(239, 68, 68, 0.15)', 
                borderTop: '1px solid var(--error)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                color: '#fff', 
                fontSize: '12px' 
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mic size={14} color="var(--error)" /> 🎙️ Bolte rahiye... ({LANG_SPEECH_MAP[language]?.name})
                </span>
                <button
                  onClick={toggleListening}
                  style={{
                    background: 'rgba(239, 68, 68, 0.8)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '2px 8px',
                    fontSize: '10px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Stop Mic ⏹️
                </button>
              </div>
            )}

            {/* Input & Voice Controls */}
            <div style={{ padding: '14px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0, 0, 0, 0.25)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={toggleListening}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: isListening ? 'var(--error)' : 'rgba(255, 255, 255, 0.05)',
                  border: isListening ? 'none' : '1px solid var(--border-subtle)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isListening ? '0 0 16px rgba(239, 68, 68, 0.7)' : 'none'
                }}
                title={isListening ? 'Stop Mic (Mic band karein)' : 'Speak to AI (Bolkar poochhein)'}
              >
                {isListening ? <MicOff size={19} /> : <Mic size={19} />}
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={activeWelcome.placeholder}
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
                className="btn-primary"
                style={{
                  width: '42px',
                  height: '42px',
                  padding: 0,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: inputMessage.trim() ? 1 : 0.4
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
