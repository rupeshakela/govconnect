/**
 * GovScheme Portal - Master Client Logic
 * - Bootstrap Form Validation
 * - Client-Side 8-Language Translation Engine
 * - AI Gemini Chatbot Integration
 * - Web Speech API Voice Recognition & SpeechSynthesis TTS
 * - AJAX Bookmark Toggle
 */

// =============================================================================
// 1. Bootstrap Client Form Validation
// =============================================================================
(() => {
  'use strict';
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach((form) => {
    form.addEventListener('submit', (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
})();

// =============================================================================
// 2. Multilingual Translation Engine (8 Languages)
// =============================================================================
const TRANSLATIONS = {
  en: {
    navAllSchemes: 'All Schemes',
    navRecommended: 'AI Matched',
    navJobsExams: 'Gov Jobs & Exams',
    navSaved: 'Saved',
    navProfile: 'Citizen Profile',
    navSearchPlaceholder: 'Search schemes, jobs...',
    navLiveSync: 'Live Sync',
    navVerifiedCitizen: 'Verified Citizen',
    navLogout: 'Logout',
    heroTitle: 'Discover Government Schemes You Are Eligible For',
    heroSubtitle: 'Explore Central & State welfare initiatives, solar subsidies, pensions, and financial aid matching your profile.',
    cardMaxBenefit: 'Benefit',
    cardAgeLimit: 'Age Limit',
    cardIncomeLimit: 'Max Income',
    cardApplyOnline: 'Apply & View Steps',
    jobsTitle: 'Government Jobs & National Competitive Exams',
    jobsSubtitle: 'Real-time notifications from UPSC, SSC, Railway Recruitment Board (RRB), IBPS, and State Commissions.',
    jobVacancies: 'Total Vacancies',
    jobSalary: 'Salary Scale',
    jobQualification: 'Educational Qualification',
    jobLastDate: 'Application Deadline',
    jobNotification: 'Official Notice',
    chatTitle: 'AI Government Mitra'
  },
  hi: {
    navAllSchemes: 'सभी योजनाएं',
    navRecommended: 'AI अनुशंसित',
    navJobsExams: 'सरकारी नौकरियां व परीक्षाएं',
    navSaved: 'सहेजी गई',
    navProfile: 'नागरिक प्रोफाइल',
    navSearchPlaceholder: 'योजनाएं या नौकरियां खोजें...',
    navLiveSync: 'लाइव सिंक',
    navVerifiedCitizen: 'सत्यापित नागरिक',
    navLogout: 'लॉगआउट',
    heroTitle: 'अपनी पात्रता के अनुसार सरकारी योजनाएं खोजें',
    heroSubtitle: 'केंद्र और राज्य सरकार की कल्याणकारी योजनाएं, सोलर सब्सिडी, छात्रवृत्ति, किसान सम्मान और पेंशन खोजें।',
    cardMaxBenefit: 'अधिकतम लाभ',
    cardAgeLimit: 'आयु सीमा',
    cardIncomeLimit: 'आय सीमा',
    cardApplyOnline: 'आवेदन करें और चरण देखें',
    jobsTitle: 'सरकारी नौकरियां एवं राष्ट्रीय प्रतियोगी परीक्षाएं',
    jobsSubtitle: 'UPSC, SSC, रेलवे भर्ती बोर्ड (RRB), IBPS और राज्य आयोगों से सीधे आधिकारिक अलर्ट।',
    jobVacancies: 'पदों की संख्या',
    jobSalary: 'वेतनमान',
    jobQualification: 'शैक्षणिक योग्यता',
    jobLastDate: 'अंतिम तिथि',
    jobNotification: 'आधिकारिक विज्ञप्ति',
    chatTitle: 'AI सरकारी मित्र'
  },
  hinglish: {
    navAllSchemes: 'Saari Schemes',
    navRecommended: 'AI Matched',
    navJobsExams: 'Govt Jobs & Exams',
    navSaved: 'Saved Hai',
    navProfile: 'Aapki Profile',
    navSearchPlaceholder: 'Schemes ya jobs search karein...',
    navLiveSync: 'Live Sync',
    navVerifiedCitizen: 'Verified Citizen',
    navLogout: 'Logout Karein',
    heroTitle: 'Apni Eligibility ke anusar Sarkari Schemes khojein',
    heroSubtitle: 'Central aur State government ki sabhi yojnayein, Solar Subsidy, Pension, aur Loan schemes dekhein.',
    cardMaxBenefit: 'Max Fayda',
    cardAgeLimit: 'Age Limit',
    cardIncomeLimit: 'Income Limit',
    cardApplyOnline: 'Apply & Steps Dekhein',
    jobsTitle: 'Govt Jobs aur Exam Alerts',
    jobsSubtitle: 'UPSC, SSC, Railway (RRB), aur Banking ke live notifications.',
    jobVacancies: 'Total Seats',
    jobSalary: 'Salary Range',
    jobQualification: 'Qualification',
    jobLastDate: 'Last Date',
    jobNotification: 'Official Link',
    chatTitle: 'AI Sarkari Mitra'
  },
  bn: {
    navAllSchemes: 'সকল প্রকল্প',
    navRecommended: 'AI প্রস্তাবিত',
    navJobsExams: 'সরকারি চাকরি ও পরীক্ষা',
    navSaved: 'সংরক্ষিত',
    navProfile: 'নাগরিক প্রোফাইল',
    navSearchPlaceholder: 'প্রকল্প বা চাকরি খুঁজুন...',
    navLiveSync: 'লাইভ সিঙ্ক',
    navVerifiedCitizen: 'যাচাইকৃত নাগরিক',
    navLogout: 'লগআউট',
    heroTitle: 'আপনার যোগ্যতার সরকারি প্রকল্প খুঁজুন',
    heroSubtitle: 'কেন্দ্রীয় ও রাজ্য সরকারের সকল কল্যাণমূলক প্রকল্প, স্কলারশিপ ও অনুদান।',
    cardMaxBenefit: 'সর্বোচ্চ সুবিধা',
    cardAgeLimit: 'বয়স সীমা',
    cardIncomeLimit: 'আয় সীমা',
    cardApplyOnline: 'আবেদন ও ধাপ দেখুন',
    jobsTitle: 'সরকারি চাকরি ও নিয়োগ বিজ্ঞপ্তি',
    jobsSubtitle: 'UPSC, SSC, রেলওয়ে এবং ব্যাংক পরীক্ষার সর্বশেষ তথ্য।',
    jobVacancies: 'শূন্যপদ',
    jobSalary: 'বেতন',
    jobQualification: 'শিক্ষাগত যোগ্যতা',
    jobLastDate: 'শেষ তারিখ',
    jobNotification: 'বিজ্ঞপ্তি',
    chatTitle: 'AI সরকারি সহায়ক'
  },
  mr: {
    navAllSchemes: 'सर्व योजना',
    navRecommended: 'AI शिफारस',
    navJobsExams: 'सरकारी नोकऱ्या व परीक्षा',
    navSaved: 'जतन केलेल्या',
    navProfile: 'नागरिक प्रोफाइल',
    navSearchPlaceholder: 'योजना किंवा नोकऱ्या शोधा...',
    navLiveSync: 'थेट सिंक',
    navVerifiedCitizen: 'प्रमाणित नागरिक',
    navLogout: 'लॉगआउट',
    heroTitle: 'तुमच्या पात्रतेनुसार सरकारी योजना शोधा',
    heroSubtitle: 'केंद्र आणि राज्य सरकारच्या सर्व कल्याणकारी योजना, सौर अनुदान व पेन्शन.',
    cardMaxBenefit: 'कमाल लाभ',
    cardAgeLimit: 'वयोमर्यादा',
    cardIncomeLimit: 'उत्पन्न मर्यादा',
    cardApplyOnline: 'अर्ज करा व पायऱ्या पाहा',
    jobsTitle: 'सरकारी नोकऱ्या व भरती परीक्षा',
    jobsSubtitle: 'UPSC, SSC, रेल्वे आणि बँकिंग भरतीचे थेट अपडेट्स.',
    jobVacancies: 'एकूण पदे',
    jobSalary: 'वेतन श्रेणी',
    jobQualification: 'पात्रता',
    jobLastDate: 'अंतिम तारीख',
    jobNotification: 'जाहिरात',
    chatTitle: 'AI सरकारी मित्र'
  },
  te: {
    navAllSchemes: 'అన్ని పథకాలు',
    navRecommended: 'AI సూచించినవి',
    navJobsExams: 'ప్రభుత్వ ఉద్యోగాలు',
    navSaved: 'భద్రపరిచినవి',
    navProfile: 'సిటిజన్ ప్రొఫైల్',
    navSearchPlaceholder: 'పథకాలు లేదా ఉద్యోగాలు శోధించండి...',
    navLiveSync: 'సింక్',
    navVerifiedCitizen: 'ధృవీకరించబడిన పౌరుడు',
    navLogout: 'లాగ్ అవుట్',
    heroTitle: 'మీ అర్హతకు తగిన ప్రభుత్వ పథకాలను కనుగొనండి',
    heroSubtitle: 'కేంద్ర, రాష్ట్ర ప్రభుత్వ సంక్షేమ పథకాలు, సబ్సిడీలు మరియు ఆర్థిక సహాయం.',
    cardMaxBenefit: 'గరిష్ట ప్రయోజనం',
    cardAgeLimit: 'వయోపరిమితి',
    cardIncomeLimit: 'ఆదాయ పరిమితి',
    cardApplyOnline: 'దరఖాస్తు & విధానం',
    jobsTitle: 'ప్రభుత్వ ఉద్యోగాలు & జాతీయ పరీక్షలు',
    jobsSubtitle: 'UPSC, SSC, రైల్వే మరియు బ్యాంకింగ్ తాజా ప్రకటనలు.',
    jobVacancies: 'ఖాళీలు',
    jobSalary: 'జీతం',
    jobQualification: 'విద్యార్హత',
    jobLastDate: 'చివరి తేదీ',
    jobNotification: 'నోటిఫికేషన్',
    chatTitle: 'AI ప్రభుత్వ మిత్ర'
  },
  ta: {
    navAllSchemes: 'அனைத்து திட்டங்கள்',
    navRecommended: 'AI பரிந்துரை',
    navJobsExams: 'அரசு வேலைகள்',
    navSaved: 'சேமிக்கப்பட்டவை',
    navProfile: 'சுயவிவரம்',
    navSearchPlaceholder: 'திட்டங்கள் அல்லது வேலைகளை தேடவும்...',
    navLiveSync: 'ஒத்திசைவு',
    navVerifiedCitizen: 'சரிபார்க்கப்பட்ட குடிமகன்',
    navLogout: 'வெளியேறு',
    heroTitle: 'உங்கள் தகுதிக்கான அரசு திட்டங்களை கண்டறியவும்',
    heroSubtitle: 'மத்திய மற்றும் மாநில அரசின் நலத்திட்டங்கள், மானியங்கள் மற்றும் உதவிகள்.',
    cardMaxBenefit: 'அதிகபட்ச பலன்',
    cardAgeLimit: 'வயது வரம்பு',
    cardIncomeLimit: 'வருமான வரம்பு',
    cardApplyOnline: 'விண்ணப்பித்து காண்க',
    jobsTitle: 'அரசு வேலைவாய்ப்புகள் & தேர்வுகள்',
    jobsSubtitle: 'UPSC, SSC, ரயில்வே மற்றும் வங்கி வேலைவாய்ப்பு அறிவிப்புகள்.',
    jobVacancies: 'காலியிடங்கள்',
    jobSalary: 'சம்பளம்',
    jobQualification: 'கல்வி தகுதி',
    jobLastDate: 'கடைசி தேதி',
    jobNotification: 'அறிவிப்பு',
    chatTitle: 'AI அரசு உதவியாளர்'
  },
  gu: {
    navAllSchemes: 'બધી યોજનાઓ',
    navRecommended: 'AI ભલામણ',
    navJobsExams: 'સરકારી નોકરીઓ',
    navSaved: 'સાચવેલી',
    navProfile: 'નાગરિક પ્રોફાઇલ',
    navSearchPlaceholder: 'યોજનાઓ અથવા નોકરીઓ શોધો...',
    navLiveSync: 'લાઇવ સિંક',
    navVerifiedCitizen: 'ચકાસાયેલ નાગરિક',
    navLogout: 'લૉગ આઉટ',
    heroTitle: 'તમારી લાયકાત મુજબ સરકારી યોજનાઓ શોધો',
    heroSubtitle: 'કેન્દ્ર અને રાજ્ય સરકારની તમામ યોજનાઓ, સબસિડી અને સહાય.',
    cardMaxBenefit: 'મહત્તમ લાભ',
    cardAgeLimit: 'વય મર્યાદા',
    cardIncomeLimit: 'આવક મર્યાદા',
    cardApplyOnline: 'અરજી કરો અને જુઓ',
    jobsTitle: 'સરકારી નોકરીઓ અને પરીક્ષાઓ',
    jobsSubtitle: 'UPSC, SSC, રેલ્વે અને બેંકિંગ ભરતીની તાજી વિગતો.',
    jobVacancies: 'જગ્યાઓ',
    jobSalary: 'પગાર ધોરણ',
    jobQualification: 'લાયકાત',
    jobLastDate: 'છેલ્લી તારીખ',
    jobNotification: 'નોટિફિકેશન',
    chatTitle: 'AI સરકારી મિત્ર'
  }
};

const LANG_DETAILS = {
  en: { name: 'English', flag: '🇬🇧' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  hinglish: { name: 'Hinglish', flag: '🇮🇳' },
  bn: { name: 'বাংলা', flag: '🇮🇳' },
  mr: { name: 'मराठी', flag: '🇮🇳' },
  te: { name: 'తెలుగు', flag: '🇮🇳' },
  ta: { name: 'தமிழ்', flag: '🇮🇳' },
  gu: { name: 'ગુજરાતી', flag: '🇮🇳' }
};

function applyTranslations(langCode) {
  const dictionary = TRANSLATIONS[langCode] || TRANSLATIONS.en;
  
  // Update elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach((elem) => {
    const key = elem.getAttribute('data-i18n');
    if (dictionary[key]) {
      elem.textContent = dictionary[key];
    }
  });

  // Update elements with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach((elem) => {
    const key = elem.getAttribute('data-i18n-placeholder');
    if (dictionary[key]) {
      elem.setAttribute('placeholder', dictionary[key]);
    }
  });

  // Update navbar indicator
  const info = LANG_DETAILS[langCode] || LANG_DETAILS.en;
  const flagElem = document.getElementById('currentLangFlag');
  const nameElem = document.getElementById('currentLangName');
  if (flagElem) flagElem.textContent = info.flag;
  if (nameElem) nameElem.textContent = info.name;
}

function setLanguage(langCode) {
  localStorage.setItem('gov_language', langCode);
  applyTranslations(langCode);
}

document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('gov_language') || 'en';
  applyTranslations(savedLang);

  document.querySelectorAll('.lang-opt').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const code = btn.getAttribute('data-lang');
      if (code) setLanguage(code);
    });
  });
});

// =============================================================================
// 3. AI Mitra Chatbot Logic (Gemini 3.6 Flash + TTS + Speech Input)
// =============================================================================
let conversationHistory = [];

const toggleChatbot = () => {
  const panel = document.getElementById('chatbotPanel');
  if (panel) {
    panel.classList.toggle('d-none');
    if (!panel.classList.contains('d-none')) {
      document.getElementById('chatInput')?.focus();
    }
  }
};

document.getElementById('chatbotToggleBtn')?.addEventListener('click', toggleChatbot);
document.getElementById('chatbotCloseBtn')?.addEventListener('click', toggleChatbot);

document.getElementById('chatbotClearBtn')?.addEventListener('click', () => {
  conversationHistory = [];
  const messagesBox = document.getElementById('chatbotMessages');
  if (messagesBox) {
    messagesBox.innerHTML = `
      <div class="chat-bubble-wrap bot-bubble-wrap">
        <div class="chat-avatar bot-avatar-sm">🏛️</div>
        <div class="chat-bubble bot-bubble">
          <div class="chat-content">
            Namaste! 🙏 Conversation reset. Aap kisi bhi sarkari yojana ya job ke baare me pooch sakte hain.
          </div>
        </div>
      </div>
    `;
  }
});

// Format markdown text (bold, links, lists) into clean safe HTML
function formatMarkdown(text) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-info text-decoration-underline">$1</a>')
    .replace(/\n/g, '<br>');
  return html;
}

// Language speech locale mapping
const LANG_VOICE_LOCALES = {
  en: 'en-IN',
  hi: 'hi-IN',
  hinglish: 'hi-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  gu: 'gu-IN'
};

let isCurrentlySpeaking = false;
let currentSpeakingBtn = null;

// ChatGPT-style Stop Speaking Function
function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  isCurrentlySpeaking = false;
  if (currentSpeakingBtn) {
    currentSpeakingBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Listen';
    currentSpeakingBtn.classList.remove('btn-danger');
    currentSpeakingBtn.classList.add('btn-speak');
    currentSpeakingBtn = null;
  }
  const waveBar = document.getElementById('chatSpeakingWaveBar');
  if (waveBar) waveBar.classList.add('d-none');
}

// Speak Bot Response (Web Speech API) with instant Stop toggle
function speakText(btn) {
  if (!('speechSynthesis' in window)) {
    alert('Sorry, text-to-speech is not supported in this browser.');
    return;
  }

  // If clicked on the currently speaking button, stop it
  if (isCurrentlySpeaking && currentSpeakingBtn === btn) {
    stopSpeaking();
    return;
  }

  // Cancel any ongoing speech
  stopSpeaking();

  const bubble = btn.closest('.chat-bubble');
  const content = bubble.querySelector('.chat-content');
  if (!content) return;

  const currentLang = localStorage.getItem('gov_selected_lang') || 'en';
  const targetLocale = LANG_VOICE_LOCALES[currentLang] || 'en-IN';

  const cleanText = content.innerText
    .replace(/[*_#`[\]()]/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[🏛️☀️⚡📋🏢🌾🙏😊💡⚙️💰⚠️📄🔗📌]/g, ' ')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = targetLocale;
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Find matching voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang === targetLocale || v.lang.startsWith(targetLocale.split('-')[0]));
  if (matchedVoice) utterance.voice = matchedVoice;

  utterance.onstart = () => {
    isCurrentlySpeaking = true;
    currentSpeakingBtn = btn;
    btn.innerHTML = '<i class="fa-solid fa-square text-white"></i> Stop Voice ⏹️';
    btn.classList.remove('btn-speak');
    btn.classList.add('btn-danger');

    // Show floating wave bar
    const waveBar = document.getElementById('chatSpeakingWaveBar');
    if (waveBar) waveBar.classList.remove('d-none');
  };

  utterance.onend = () => {
    stopSpeaking();
  };

  utterance.onerror = () => {
    stopSpeaking();
  };

  window.speechSynthesis.speak(utterance);
}

// Send chat message with active language
async function sendChatMessage(messageText) {
  if (!messageText || !messageText.trim()) return;

  // Stop speaking on new question
  stopSpeaking();

  const messagesBox = document.getElementById('chatbotMessages');
  const suggestionsBox = document.getElementById('chatbotSuggestions');
  const input = document.getElementById('chatInput');
  const currentLang = localStorage.getItem('gov_selected_lang') || 'en';

  // Append user bubble
  const userWrap = document.createElement('div');
  userWrap.className = 'chat-bubble-wrap user-bubble-wrap';
  userWrap.innerHTML = `
    <div class="chat-bubble user-bubble">
      <div class="chat-content">${messageText}</div>
    </div>
  `;
  messagesBox.appendChild(userWrap);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Append typing indicator
  const loadingWrap = document.createElement('div');
  loadingWrap.className = 'chat-bubble-wrap bot-bubble-wrap typing-indicator-wrap';
  loadingWrap.innerHTML = `
    <div class="chat-avatar bot-avatar-sm">🏛️</div>
    <div class="chat-bubble bot-bubble text-muted small">
      <i class="fa-solid fa-spinner fa-spin me-1"></i> Gemini 3.6 AI is thinking...
    </div>
  `;
  messagesBox.appendChild(loadingWrap);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: messageText,
        history: conversationHistory,
        language: currentLang
      })
    });

    const data = await res.json();
    loadingWrap.remove();

    if (data.success && data.data) {
      const reply = data.data.reply;
      const suggestions = data.data.suggestions || [];

      // Add to conversation history
      conversationHistory.push({ sender: 'user', text: messageText });
      conversationHistory.push({ sender: 'bot', text: reply });

      // Append bot bubble
      const botWrap = document.createElement('div');
      botWrap.className = 'chat-bubble-wrap bot-bubble-wrap';
      botWrap.innerHTML = `
        <div class="chat-avatar bot-avatar-sm">🏛️</div>
        <div class="chat-bubble bot-bubble">
          <div class="chat-content">${formatMarkdown(reply)}</div>
          <div class="chat-actions mt-2">
            <button class="btn btn-speak btn-xs" title="Listen / Stop" onclick="speakText(this)">
              <i class="fa-solid fa-volume-high"></i> Listen
            </button>
          </div>
        </div>
      `;
      messagesBox.appendChild(botWrap);
      messagesBox.scrollTop = messagesBox.scrollHeight;

      // Auto speak response
      const speakBtn = botWrap.querySelector('.btn-speak');
      if (speakBtn) speakText(speakBtn);

      // Update suggestion pills
      if (suggestionsBox && suggestions.length > 0) {
        suggestionsBox.innerHTML = suggestions.map((s) =>
          `<button class="btn btn-pill-suggestion btn-xs" onclick="sendSuggestion('${s.replace(/'/g, "\\'")}')">${s}</button>`
        ).join('');
      }
    }
  } catch (err) {
    loadingWrap.remove();
    const errorWrap = document.createElement('div');
    errorWrap.className = 'chat-bubble-wrap bot-bubble-wrap';
    errorWrap.innerHTML = `
      <div class="chat-avatar bot-avatar-sm">⚠️</div>
      <div class="chat-bubble bot-bubble text-danger">
        Maaf kijiye, abhi server se connect hone me samasya aayi. Kripya punah prayas karein.
      </div>
    `;
    messagesBox.appendChild(errorWrap);
  }

  if (input) input.value = '';
}

function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  if (input && input.value.trim()) {
    sendChatMessage(input.value.trim());
  }
}

function sendSuggestion(text) {
  sendChatMessage(text);
}

// Speech-to-Text Microphone Input with active language support & interruption
const micBtn = document.getElementById('chatMicBtn');
if (micBtn && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.interimResults = false;

  micBtn.addEventListener('click', () => {
    // Interrupt bot speaking immediately when user taps mic
    stopSpeaking();

    const currentLang = localStorage.getItem('gov_selected_lang') || 'en';
    recognition.lang = LANG_VOICE_LOCALES[currentLang] || 'en-IN';

    try {
      recognition.start();
      micBtn.classList.add('recording');
      micBtn.innerHTML = '<i class="fa-solid fa-microphone-slash text-danger"></i>';
    } catch (e) {
      recognition.stop();
      micBtn.classList.remove('recording');
      micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    }
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('chatInput');
    if (input) {
      input.value = transcript;
      sendChatMessage(transcript);
    }
    micBtn.classList.remove('recording');
    micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
  };

  recognition.onerror = () => {
    micBtn.classList.remove('recording');
    micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
  };

  recognition.onend = () => {
    micBtn.classList.remove('recording');
    micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
  };
} else if (micBtn) {
  micBtn.style.display = 'none';
}

// =============================================================================
// 4. AJAX Bookmark Toggle
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.bookmark-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      const icon = form.querySelector('i');
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
          if (data.isBookmarked) {
            icon.className = 'fa-solid text-danger fa-bookmark';
          } else {
            icon.className = 'fa-regular text-muted fa-bookmark';
          }
        }
      } catch (err) {
        form.submit(); // fallback to normal submit
      }
    });
  });
});
