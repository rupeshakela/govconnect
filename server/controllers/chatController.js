const Scheme = require('../models/Scheme');
const { Job, Exam } = require('../models/Portal');
const UserProfile = require('../models/UserProfile');

// Multilingual language directives for AI prompt
const LANG_DIRECTIVES = {
  en: {
    name: 'English',
    script: 'Latin',
    instructions: 'Respond completely and fluently in clear, polite English.'
  },
  hi: {
    name: 'Hindi (हिन्दी)',
    script: 'Devanagari (देवनागरी लिपि)',
    instructions: 'You MUST respond entirely and fluently in pure, natural Devanagari Hindi (हिन्दी). Do NOT use English alphabets for your reply.'
  },
  hinglish: {
    name: 'Hinglish (Hindi in English Script)',
    script: 'Latin Script with Hindi vocabulary and grammar',
    instructions: 'Respond in natural, conversational Hinglish (Hindi written in Roman/English alphabet, e.g., "Aapki beti ke 12th pass karne par shubhkaamnayein, aage ke career ke liye yeh mukhy raaste hain...").'
  },
  bn: {
    name: 'Bengali (বাংলা)',
    script: 'Bengali script (বাংলা লিপি)',
    instructions: 'You MUST respond entirely and fluently in Bengali (বাংলা). Use Bengali script exclusively.'
  },
  mr: {
    name: 'Marathi (मराठी)',
    script: 'Devanagari (मराठी भाषा)',
    instructions: 'You MUST respond entirely and fluently in Marathi (मराठी). Use Marathi vocabulary and Devanagari script exclusively.'
  },
  te: {
    name: 'Telugu (తెలుగు)',
    script: 'Telugu script (తెలుగు లిపి)',
    instructions: 'You MUST respond entirely and fluently in Telugu (తెలుగు). Use Telugu script exclusively.'
  },
  ta: {
    name: 'Tamil (தமிழ்)',
    script: 'Tamil script (தமிழ் எழுத்துக்கள்)',
    instructions: 'You MUST respond entirely and fluently in Tamil (தமிழ்). Use Tamil script exclusively.'
  },
  gu: {
    name: 'Gujarati (ગુજરાતી)',
    script: 'Gujarati script (ગુજરાતી લિપિ)',
    instructions: 'You MUST respond entirely and fluently in Gujarati (ગુજરાતી). Use Gujarati script exclusively.'
  }
};

// UI Label translations for fast deterministic database responses
const UI_LABELS = {
  en: {
    benefit: 'Financial Benefit',
    eligibility: 'Eligibility Criteria',
    ageLimit: 'Age Limit',
    docs: 'Required Documents',
    process: 'How to Apply',
    officialLink: 'Official Portal',
    jobsHeader: 'Latest Opportunities & Vacancies',
    salary: 'Salary',
    vacancies: 'Vacancies',
    lastDate: 'Last Date',
    generalIntro: 'Here are the matching government opportunities based on live records:',
    yrs: 'years'
  },
  hi: {
    benefit: 'वित्तीय लाभ',
    eligibility: 'पात्रता नियम',
    ageLimit: 'आयु सीमा',
    docs: 'आवश्यक दस्तावेज़',
    process: 'आवेदन प्रक्रिया',
    officialLink: 'आधिकारिक आवेदन पोर्टल',
    jobsHeader: 'नवीनतम सरकारी नौकरियां व अवसर',
    salary: 'वेतनमान',
    vacancies: 'कुल पद',
    lastDate: 'अंतिम तिथि',
    generalIntro: 'सरकारी डेटाबेस के अनुसार आपके लिए उपयुक्त योजनाएं व अवसर निम्नलिखित हैं:',
    yrs: 'वर्ष'
  },
  hinglish: {
    benefit: 'Financial Benefit',
    eligibility: 'Eligibility Criteria',
    ageLimit: 'Age Limit',
    docs: 'Zaroori Documents',
    process: 'Form Bharne Ka Tareeqa',
    officialLink: 'Official Website Link',
    jobsHeader: 'Latest Sarkari Naukri & Vacancies',
    salary: 'Monthly Salary',
    vacancies: 'Total Posts',
    lastDate: 'Aakhri Taareekh',
    generalIntro: 'Govt database ke hisaab se aapke liye zaroori details neeche hain:',
    yrs: 'saal'
  },
  bn: {
    benefit: 'আর্থিক সুবিধা',
    eligibility: 'যোগ্যতার মানদণ্ড',
    ageLimit: 'বয়স সীমা',
    docs: 'প্রয়োজনীয় কাগজপত্র',
    process: 'আবেদন পদ্ধতি',
    officialLink: 'অফিসিয়াল পোর্টাল',
    jobsHeader: 'সাম্প্রতিক সরকারি চাকরি ও সুযোগ',
    salary: 'বেতন',
    vacancies: 'মোট পদ',
    lastDate: 'শেষ তারিখ',
    generalIntro: 'সরকারি রেকর্ড অনুযায়ী আপনার জন্য প্রাসঙ্গিক সুযোগসমূহ:',
    yrs: 'বছর'
  },
  mr: {
    benefit: 'आर्थिक लाभ',
    eligibility: 'पात्रता निकष',
    ageLimit: 'वयोमर्यादा',
    docs: 'आवश्यक कागदपत्रे',
    process: 'अर्ज करण्याची पद्धत',
    officialLink: 'अधिकृत पोर्टल',
    jobsHeader: 'नवीनतम सरकारी नोकऱ्या व संधी',
    salary: 'वेतन',
    vacancies: 'एकूण पदे',
    lastDate: 'शेवटची तारीख',
    generalIntro: 'शासकीय माहितीनुसार तुमच्यासाठी योग्य योजना आणि संधी:',
    yrs: 'वर्षे'
  },
  te: {
    benefit: 'ఆర్థిక ప్రయోజనం',
    eligibility: 'అర్హత ప్రమాణాలు',
    ageLimit: 'వయోపరిమితి',
    docs: 'అవసరమైన పత్రాలు',
    process: 'దరఖాస్తు విధానం',
    officialLink: 'అధికారిక పోర్టల్',
    jobsHeader: 'తాజా ప్రభుత్వ ఉద్యోగాలు & అవకాశాలు',
    salary: 'జీతం',
    vacancies: 'ఖాళీలు',
    lastDate: 'చివరి తేదీ',
    generalIntro: 'ప్రభుత్వ రికార్డుల ప్రకారం మీ కోసం సరిపోయే పథకాలు:',
    yrs: 'సంవత్సరాలు'
  },
  ta: {
    benefit: 'நிதி பலன்',
    eligibility: 'தகுதி வரம்புகள்',
    ageLimit: 'வயது வரம்பு',
    docs: 'தேவையான ஆவணங்கள்',
    process: 'விண்ணப்பிக்கும் முறை',
    officialLink: 'அதிகாரப்பூர்வ தளம்',
    jobsHeader: 'சமீபத்திய அரசு வேலைகள் & வாய்ப்புகள்',
    salary: 'சம்பளம்',
    vacancies: 'காலியிடங்கள்',
    lastDate: 'கடைசி தேதி',
    generalIntro: 'அரசு ஆவணங்களின்படி உங்களுக்கான சிறந்த திட்டங்கள்:',
    yrs: 'ஆண்டுகள்'
  },
  gu: {
    benefit: 'નાણાકીય લાભ',
    eligibility: 'પાત્રતા માપદંડ',
    ageLimit: 'વય મર્યાદા',
    docs: 'જરૂરી દસ્તાવેજો',
    process: 'અરજી કરવાની રીત',
    officialLink: 'સત્તાવાર પોર્ટલ',
    jobsHeader: 'તાજેતરની સરકારી નોકરીઓ અને તકો',
    salary: 'પગાર',
    vacancies: 'ખાલી જગ્યાઓ',
    lastDate: 'છેલ્લી તારીખ',
    generalIntro: 'સરકારી રેકોર્ડ મુજબ આપના માટે યોગ્ય યોજનાઓ:',
    yrs: 'વર્ષ'
  }
};

// Instant multilingual greetings
const GREETINGS_MAP = {
  en: {
    reply: "Hello! 🙏 Welcome to **GovScheme AI Assistant (सरकारी मित्र)** 🏛️\n\nI am your dedicated digital welfare advisor. You can ask me about any central or state government scheme, higher education scholarships, solar pumps (PM-KUSUM), PM-KISAN, Mudra business loans, government jobs, or application steps.\n\nHow may I help you today?",
    suggestions: ['PM-KUSUM Solar Pump ☀️', 'PM-KISAN ₹6,000 🌾', 'Higher Education Scholarships 🎓', 'Latest Govt Jobs 🏢']
  },
  hi: {
    reply: "नमस्ते! 🙏 **GovScheme AI सरकारी मित्र** में आपका स्वागत है 🏛️\n\nमैं आपका डिजिटल सरकारी सहायक हूँ। आप मुझसे किसी भी सरकारी योजना, उच्च शिक्षा छात्रवृत्ति, पीएम-कुसुम सोलर पंप, पीएम-किसान, मुद्रा व्यापार लोन, सरकारी नौकरी या किसी भी समस्या के समाधान के बारे में पूछ सकते हैं।\n\nआज मैं आपकी क्या सहायता कर सकता हूँ?",
    suggestions: ['12वीं के बाद करियर 🎓', 'पीएम-कुसुम सोलर पंप ☀️', 'पीएम-किसान ₹6,000 🌾', 'सरकारी नौकरियां 🏢']
  },
  hinglish: {
    reply: "Namaste! 🙏 Welcome to **GovScheme AI Assistant (सरकारी मित्र)** 🏛️\n\nMain aapka personal welfare assistant hu. Aap mujhse kisi bhi central ya state government scheme, 12th ke baad career options, scholarships, PM-KUSUM solar pump, PM-KISAN, Mudra business loans, sarkari jobs, ya apni kisi bhi pareshani ke solution ke baare me pooch sakte hain.\n\nAaj main aapki kya madad kar sakta hu?",
    suggestions: ['12th Ke Baad Career 🎓', 'PM-KUSUM Solar Pump ☀️', 'PM-KISAN ₹6,000 🌾', 'Latest Govt Jobs 🏢']
  },
  bn: {
    reply: "নমস্কার! 🙏 **GovScheme AI সহকারী**-তে আপনাকে স্বাগতম 🏛️\n\nআমি আপনার ডিজিটাল সরকারি সহায়ক। আপনি যে কোনো সরকারি প্রকল্প, উচ্চশিক্ষা স্কলারশিপ, পিএম-কুসুম সোলার পাম্প, পিএম-কিসান, মুদ্রা ঋণ বা সরকারি চাকরি সম্পর্কে জানতে পারেন।\n\nআজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    suggestions: ['উচ্চশিক্ষা স্কলারশিপ 🎓', 'পিএম-কুসুম সোলার পাম্প ☀️', 'পিএম-কিসান ₹৬,০০০ 🌾', 'সরকারি চাকরি 🏢']
  },
  mr: {
    reply: "नमस्कार! 🙏 **GovScheme AI सरकारी मदतनीस** मध्ये आपले स्वागत आहे 🏛️\n\nमी तुमचा वैयक्तिक मार्गदर्शक आहे. तुम्ही कोणत्याही सरकारी योजना, उच्च शिक्षण शिष्यवृत्ती, पीएम-कुसुम सोलर पंप, पीएम-किसान, मुद्रा व्यवसाय कर्ज किंवा सरकारी भरतीबद्दल माहिती विचारू शकता।\n\nआज मी तुम्हाला कशी मदत करू शकतो?",
    suggestions: ['१२वीनंतर करिअर पर्याय 🎓', 'पीएम-कुसुम सोलर पंप ☀️', 'पीएम-किसान ₹६,००० 🌾', 'सरकारी नोकऱ्या 🏢']
  },
  te: {
    reply: "నమస్కారం! 🙏 **GovScheme AI సహాయకుడికి** స్వాగతం 🏛️\n\nనేను మీ ప్రభుత్వ సంక్షేమ సహాయకుడిని. మీరు ఏ ప్రభుత్వ పథకం, ఉన్నత విద్యా స్కాలర్‌షిప్‌లు, పీఎం-కుసుమ్ సోలార్ పంపులు, పీఎం-కిసాన్, ముద్రా రుణాలు లేదా ఉద్యోగాల గురించి అడగవచ్చు.\n\nఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
    suggestions: ['12వ తర్వాత కెరీర్ 🎓', 'పీఎం-కుసుమ్ సోలార్ పంప్ ☀️', 'పీఎం-కిసాన్ ₹6,000 🌾', 'ప్రభుత్వ ఉద్యోగాలు 🏢']
  },
  ta: {
    reply: "வணக்கம்! 🙏 **GovScheme AI உதவியாளருக்கு** வரவேற்கிறோம் 🏛️\n\nநான் உங்கள் டிஜிட்டல் அரசு வழிகாட்டி. அரசு திட்டங்கள், உயர்கல்வி உதவித்தொகை, பிஎம்-குசும் சோலார் பம்ப், முத்ரா கடன்கள் மற்றும் அரசு வேலைவாய்ப்புகள் பற்றி நீங்கள் கேட்கலாம்.\n\nஇன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    suggestions: ['12ஆம் வகுப்பிற்குப் பிறகு 🎓', 'பிஎம்-குசும் சோலார் ☀️', 'பிஎம்-கிசான் ₹6,000 🌾', 'அரசு வேலைகள் 🏢']
  },
  gu: {
    reply: "નમસ્તે! 🙏 **GovScheme AI સરકારી મિત્ર** માં આપનું સ્વાગત છે 🏛️\n\nહું તમારો ડિજિટલ સહાયક છું. તમે કોઈપણ સરકારી યોજનાઓ, ઉચ્ચ શિક્ષણ શિષ્યવૃત્તિ, પીએમ-કુસુમ સોલાર પંપ, પીએમ-કિસાન, મુદ્રા લોન અથવા સરકારી ભરતી વિશે પૂછી શકો છો.\n\nઆજે હું આપની શું મદદ કરી શકું?",
    suggestions: ['12મા પછી કરિયર 🎓', 'પીએમ-કુસુમ સોલાર પંપ ☀️', 'પીએમ-કિસાન ₹6,000 🌾', 'સરકારી નોકરીઓ 🏢']
  }
};

// @desc    Multi-Turn Conversational AI Chatbot with Google Gemini & Intelligent Multilingual Fallback
// @route   POST /api/chat
// @access  Public
const handleChat = async (req, res) => {
  const { message, history = [], userId, language = 'en' } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  try {
    const userQuery = message.trim();
    const currentLangKey = (language || 'en').toLowerCase();
    const targetLang = LANG_DIRECTIVES[currentLangKey] || LANG_DIRECTIVES.en;
    const labels = UI_LABELS[currentLangKey] || UI_LABELS.en;
    const apiKey = process.env.GEMINI_API_KEY;

    const lowerQuery = userQuery.toLowerCase().trim();
    const isGreeting = /^(hi|hello|hey|namaste|pranam|namaskar|salaam|good\s*(morning|afternoon|evening)|kaise\s*ho|hii+|helo|hlo|kya\s*hal\s*hai|kaise\s*hain|kya\s*kar\s*rahe\s*ho|vanakkam|namaskaram|khobor\s*ki|kem\s*cho)$/i.test(lowerQuery);

    // Instant warm greeting response in the user's chosen language without DB wait
    if (isGreeting) {
      const greetingData = GREETINGS_MAP[currentLangKey] || GREETINGS_MAP.en;
      return res.json({ success: true, data: greetingData });
    }

    // 1. Fetch live database knowledge
    const [allSchemes, allJobs, allExams] = await Promise.all([
      Scheme.find({ isDeleted: false }).populate('state', 'name').lean(),
      Job.find({ isDeleted: false }).populate('state', 'name').lean(),
      Exam.find({ isDeleted: false }).lean()
    ]);

    let userContext = 'Citizen: General Resident of India';
    if (userId) {
      const profile = await UserProfile.findOne({ user: userId }).populate('state', 'name').lean();
      if (profile) {
        userContext = `Citizen Profile: Age: ${profile.age}, Gender: ${profile.gender}, Annual Income: ₹${profile.annualIncome}, Occupation: ${profile.occupation}, Qualification: ${profile.qualification}, Category: ${profile.casteCategory}, State: ${profile.state?.name || 'Pan-India'}`;
      }
    }

    // Build database knowledge summary
    const schemesSummary = allSchemes.map((s, i) => 
      `[Scheme ${i+1}] Name: "${s.name}" | Category: ${s.category} | Benefit: ₹${s.benefitAmount} | State: ${s.state?.name || 'All India'} | Eligibility: ${s.eligibilityCriteria} | Income Limit: ₹${s.incomeLimit} | Min-Max Age: ${s.minAge}-${s.maxAge} | Documents: ${s.documentsRequired} | Process: ${s.applicationProcess} | Official Link: ${s.officialWebsite}`
    ).join('\n');

    const jobsSummary = allJobs.slice(0, 10).map((j, i) => 
      `[Job ${i+1}] Post: "${j.postName}" | Dept: ${j.department} | Vacancies: ${j.vacancies} | Salary: ${j.salaryRange} | Eligibility: ${j.qualification} | Last Date: ${new Date(j.lastDate).toLocaleDateString()} | Link: ${j.officialNotification}`
    ).join('\n');

    const examsSummary = allExams.slice(0, 7).map((e, i) => 
      `[Exam ${i+1}] Name: "${e.name}" | Authority: ${e.conductingAuthority} | Schedule: ${e.importantDates} | Eligibility: ${e.eligibility} | Syllabus: ${e.syllabus} | Link: ${e.officialWebsite}`
    ).join('\n');

    const systemInstruction = `You are the empathetic, empowering, and deeply knowledgeable AI Government Scheme & Life-Solution Advisor (सरकारी मित्र) for the GovScheme Portal (Government of India).

MANDATORY LANGUAGE DIRECTIVE:
The citizen has explicitly selected their preferred portal language as: **${targetLang.name}** (Code: "${currentLangKey}").
${targetLang.instructions}
Required Script: ${targetLang.script}.
You MUST formulate your ENTIRE reply, including greetings, headings, bullet points, and advice, in ${targetLang.name}.
Do NOT default to Hindi or English if the user selected another language!

CORE CITIZEN-FIRST PRINCIPLES:
1. **CRITICAL RELEVANCE & ACCURACY (DO NOT ASSUME UNREQUESTED PROFESSIONS)**:
   - **NEVER assume or force a specific career (like Doctor or Engineer) unless the user explicitly mentions it!**
   - If the citizen asks generally: "मेरी बेटी 12वीं पास है आगे के कैरियर के बारे में बताएं" (My daughter passed 12th, tell me career options):
     DO NOT say "आपकी बेटी का इंजीनियर बनने का सपना" or "डॉक्टर बनने का सपना"!
     Instead, provide a **well-rounded, stream-wise career guide** covering:
     * **Science (PCM/PCB)**: Engineering (JEE), Medical/Nursing/Pharmacy (NEET/B.Sc Nursing), Pure Science (B.Sc with DST INSPIRE Scholarship of ₹80,000/yr), Defense (NDA for women).
     * **Commerce**: CA Foundation, CS, B.Com, BBA, Banking & Finance.
     * **Arts/Humanities**: Civil Services (UPSC), Law (CLAT/LLB), Teaching, Design, Journalism.
     * **Direct Govt Exams after 12th**: SSC CHSL, Railway RRB, Defense/Agniveer.
     * **Govt Financial Support**: National Scholarship Portal (NSP), Collateral-free Education Loans (PM Vidyalaxmi), State student credit cards.
     * Politely ask which stream (Science, Commerce, or Arts) she studied to give personalized guidance.

2. **SPECIFIC AMBITION OR PROBLEM (WHEN CITIZEN SPECIFIES)**:
   - If the citizen explicitly specifies a field (e.g., "इंजीनियर बनना चाहती है", "डॉक्टर बनना चाहती है", "दुकान खोलनी है", "खेती में नुकसान हुआ"):
     Provide an end-to-end, inspiring government roadmap for THAT specific field (Scholarships, Collateral-free loans, Entrance exams, Application steps).

3. **SPECIFIC FACTUAL QUERIES**:
   - If user asks for **Eligibility / पात्रता** of a specific scheme: State the concise criteria clearly.
   - If user asks for **Age limit / उम्र**: Provide the exact age criteria.
   - If user asks for **Documents / कागजात**: List the exact documents needed.
   - If user asks for **Benefit / Subsidy / पैसा**: State the exact financial aid.
   - If user asks for **How to apply / Portal / लिंक**: Provide the official portal link and application steps.

User Profile: ${userContext}

Live Database Context:
=== GOVERNMENT SCHEMES ===
${schemesSummary}

=== GOVERNMENT JOBS ===
${jobsSummary}

=== COMPETITIVE EXAMS ===
${examsSummary}
`;

    let reply = '';
    let suggestions = [];

    // Format conversation history for Gemini API
    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-6).forEach(item => {
        if (item.text && item.sender) {
          contents.push({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }]
          });
        }
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: userQuery }]
    });

    // Multi-tier fast Gemini API calling: Try gemini-3.5-flash-lite first (fastest ~1s), then gemini-3.6-flash
    if (apiKey) {
      const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.6-flash'];
      for (const modelName of candidateModels) {
        if (reply) break;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 9000);

          const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            signal: controller.signal,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              },
              contents,
              generationConfig: {
                temperature: 0.35,
                maxOutputTokens: 1400
              }
            })
          });
          clearTimeout(timeoutId);

          if (geminiRes.status === 200) {
            const geminiData = await geminiRes.json();
            if (geminiData.candidates && geminiData.candidates[0]?.content?.parts) {
              const parts = geminiData.candidates[0].content.parts;
              const answerParts = parts.filter(p => !p.thought && p.text);
              if (answerParts.length > 0) {
                reply = answerParts.map(p => p.text).join('\n').trim();
              } else if (parts.length > 0) {
                reply = parts[parts.length - 1].text?.trim() || '';
              }
            }
          }
        } catch (geminiErr) {
          // Continue to next model or intelligent fallback
        }
      }
    }

    // Intelligent Domain-Aware Multilingual Fallback Engine
    if (!reply) {
      const q = lowerQuery;

      // Check specific intents
      const isSpecificEngineer = /engineer|engineering|btech|b\.tech|b\s*tech|jee|polytechnic|इंजीनियर|इंजीनियरिंग/i.test(q);
      const isSpecificDoctor = /doctor|medical|mbbs|neet|nursing|pharmacy|bams|bhms|डॉक्टर|मेडिकल|नीट|नर्सिंग/i.test(q);
      const isGeneral12thOrCareer = /12|12th|barvi|barahvi|12वीं|pass|career|kareer|shiksha|aage\s*kya|padhai|padhana|beti|daughter|ladki|scholarship|कैरियर|पढ़ाई|भविष्य/i.test(q);

      // 2. Govt Jobs & Entrance Exams
      const isJobsQuery = /job|exam|naukri|vacancy|bharti|ssc|upsc|railway|ibps|kam|chhe|नौकरी|परीक्षा|வேலை|ఉద్యోగం|చাকরি/i.test(q);

      // 3. Agriculture / Farmer / Solar
      const isFarmerQuery = /kisan|farmer|kheti|fasal|krishi|solar|pump|kusum|sinchai|drip|किसान|खेती|फसल|कुसुम|सोलर/i.test(q);

      // 4. Business / Loans
      const isBusinessQuery = /business|startup|dukan|vyapar|loan|mudra|karz|rojgar|दुकान|व्यापार|लोन|मुद्रा|रोजगार/i.test(q);

      // 5. Health / Medical
      const isHealthQuery = /health|bimari|hospital|ilaj|dawa|ayushman|बीमारी|अस्पताल|इलाज|आयुष्मान/i.test(q);

      // 6. Housing / Awas
      const isHousingQuery = /awas|ghar|makan|home|house|pmay|chhat|आवास|घर|मकान/i.test(q);

      if (isSpecificEngineer) {
        if (currentLangKey === 'hi' || currentLangKey === 'hinglish') {
          reply = `🎓 **इंजीनियरिंग शिक्षा (B.Tech / Diploma) के लिए संपूर्ण सरकारी समाधान:**

---

### 1. 🏛️ सरकारी छात्रवृत्तियां (Scholarships)
* **AICTE प्रगति छात्रवृत्ति योजना (Pragati Scholarship for Girls):**
  * इंजीनियरिंग कॉलेज में दाखिला लेने वाली छात्राओं को सरकार प्रति वर्ष **₹50,000** की सीधी छात्रवृत्ति देती है।
  * [AICTE Pragati Portal](https://www.aicte-india.org/)
* **राष्ट्रीय छात्रवृत्ति पोर्टल (NSP):**
  * सेंट्रल सेक्टर व पोस्ट-मैट्रिक छात्रवृत्ति (SC/ST/OBC/EWS) के तहत पूरी ट्यूशन फीस व मासिक भत्ता सरकार भरती है।
  * [NSP Portal](https://scholarships.gov.in/)
* **सरकारी इंजीनियरिंग कॉलेजों में 100% फीस माफी:**
  * ₹1 लाख से कम पारिवारिक आय होने पर IITs, NITs और अधिकांश राज्य सरकारी कॉलेजों में ट्यूशन फीस पूरी तरह माफ होती है।

---

### 2. 💳 बिना गारंटी का सरकारी एजुकेशन लोन (0% ब्याज सब्सिडी)
* **पीएम विद्यालक्ष्मी योजना (PM Vidyalaxmi Portal):**
  * बिना कोई संपत्ति गिरवी रखे (Collateral-Free) 10 लाख रुपये तक का शिक्षा ऋण।
  * **CSIS ब्याज सब्सिडी:** पढ़ाई के दौरान का पूरा ब्याज भारत सरकार भरती है।
  * [Vidya Lakshmi Portal](https://www.vidyalakshmi.co.in/)

---

### 📋 व्यावहारिक कदम (Action Plan):
1. **आय प्रमाण पत्र:** तहसील/CSC से सालाना आय प्रमाण पत्र बनवाएं।
2. **प्रवेश परीक्षा:** JEE Main और राज्य CET परीक्षा की तैयारी कराएं (सरकारी कॉलेज में फीस न्यूनतम होती है)।
3. **पोर्टल पर आवेदन:** कॉलेज आवंटन होते ही AICTE प्रगति और NSP पोर्टल पर आवेदन करें।`;
          suggestions = ['AICTE Pragati Portal 🎓', 'PM Vidyalaxmi Loan 💳', 'JEE Main Details 🏢', 'State Engineering CET 📋'];
        } else {
          reply = `🎓 **Complete Government Solution for Engineering Education:**

* **AICTE Pragati Scholarship for Girls:** ₹50,000 per year directly to female students in AICTE-approved engineering colleges.
* **National Scholarship Portal (NSP):** Full tuition fee reimbursement for eligible students.
* **100% Fee Waiver:** Available at IITs/NITs and state govt colleges for low-income families.
* **PM Vidyalaxmi Portal:** Collateral-free education loans up to ₹10 Lakh with Central Sector Interest Subsidy (CSIS).`;
          suggestions = ['AICTE Pragati Scholarship 🎓', 'PM Vidyalaxmi Loan 💳', 'JEE Main Portal 🏢', 'Govt Engineering Colleges 📋'];
        }
      }
      else if (isSpecificDoctor) {
        if (currentLangKey === 'hi' || currentLangKey === 'hinglish') {
          reply = `🩺 **चिकित्सा एवं स्वास्थ्य क्षेत्र (Medical / Nursing / Pharmacy) में करियर व सरकारी योजनाएं:**

1. **प्रवेश परीक्षाएं:**
   • **NEET-UG:** MBBS, BDS, BAMS, BHMS पाठ्यक्रमों के लिए राष्ट्रीय प्रवेश परीक्षा।
   • **B.Sc Nursing Entrance:** एम्स (AIIMS) एवं राज्य सरकारी नर्सिंग कॉलेजों में न्यूनतम फीस पर नर्सिंग डिग्री।

2. **सरकारी छात्रवृत्तियां एवं सहायता:**
   • **राष्ट्रीय छात्रवृत्ति पोर्टल (NSP):** पोस्ट-मैट्रिक एवं सेंट्रल सेक्टर छात्रवृत्ति के तहत मेडिकल छात्रों को फीस प्रतिपूर्ति।
   • **राज्य छात्रवृत्ति योजनाएं:** कई राज्यों में सरकारी मेडिकल कॉलेज की फीस सरकार स्वयं वहन करती है।
   • **पीएम विद्यालक्ष्मी लोन:** मेडिकल की उच्च शिक्षा के लिए शून्य गारंटी पर बैंक ऋण व ब्याज सब्सिडी।`;
          suggestions = ['NEET-UG Portal 🩺', 'AIIMS Nursing 🏥', 'NSP Scholarship 📋', 'Education Loan 💳'];
        } else {
          reply = `🩺 **Government Support for Medical & Healthcare Careers:**

1. **Entrance Examinations:** NEET-UG for MBBS/BDS/AYUSH, AIIMS B.Sc Nursing exams.
2. **Scholarships:** National Scholarship Portal (NSP) post-matric support and state-sponsored medical tuition reimbursements.
3. **Education Loans:** PM Vidyalaxmi collateral-free education loans with interest subsidy.`;
          suggestions = ['NEET-UG Portal 🩺', 'AIIMS B.Sc Nursing 🏥', 'NSP Portal 📋', 'Education Loan 💳'];
        }
      }
      else if (isGeneral12thOrCareer) {
        if (currentLangKey === 'hi' || currentLangKey === 'hinglish') {
          reply = `🎓 **12वीं कक्षा के बाद आपकी बेटी के लिए प्रमुख करियर विकल्प एवं सरकारी योजनाएं:**

आपकी बेटी ने 12वीं पास कर ली है, यह अत्यंत गर्व का विषय है। 12वीं के बाद मुख्य रूप से निम्नलिखित रास्ते उपलब्ध हैं:

---

### 1. विषयवार (Stream-Wise) प्रमुख करियर विकल्प:
* **विज्ञान वर्ग (Science - PCM/PCB):**
  * इंजीनियरिंग (JEE Main), मेडिकल व नर्सिंग (NEET / B.Sc Nursing), फार्मेसी, बी.एससी (विज्ञान एवं अनुसंधान)।
  * **INSPIRE छात्रवृत्ति:** विज्ञान में स्नातक (B.Sc) करने वाली मेधावी छात्राओं को विज्ञान एवं प्रौद्योगिकी मंत्रालय द्वारा प्रतिवर्ष **₹80,000** की छात्रवृत्ति दी जाती है।
* **वाणिज्य वर्ग (Commerce):**
  * चार्टर्ड अकाउंटेंसी (CA Foundation), कंपनी सेक्रेटरी (CS), B.Com, BBA, बैंकिंग व वित्तीय विश्लेषण।
* **कला एवं मानविकी वर्ग (Arts / Humanities):**
  * सिविल सेवा (UPSC / State PCS), कानून की पढ़ाई (CLAT / BA LLB), पत्रकारिता, फैशन डिजाइनिंग (NIFT), शिक्षण (B.Ed / D.El.Ed)।

---

### 2. 12वीं के तुरंत बाद प्रतिष्ठित सरकारी नौकरियां:
* **SSC CHSL (कर्मचारी चयन आयोग):** केंद्र सरकार के मंत्रालयों में लोअर डिवीजन क्लर्क (LDC) एवं डाटा एंट्री ऑपरेटर (DEO) के पद।
* **रेलवे (RRB NTPC):** रेलवे में 12वीं स्तर के क्लर्क, टिकट चेकर व अन्य पद।
* **रक्षा सेवाएं (NDA & Agniveer):** अब बेटियां भी राष्ट्रीय रक्षा अकादमी (NDA) की परीक्षा देकर सीधे सैन्य अधिकारी बन सकती हैं।

---

### 3. उच्च शिक्षा के लिए सरकारी आर्थिक सहायता:
* **राष्ट्रीय छात्रवृत्ति पोर्टल (NSP):** कॉलेज की पढ़ाई के लिए मेरिट व आय आधारित छात्रवृत्ति।
* **AICTE प्रगति छात्रवृत्ति:** तकनीकी/डिप्लोमा कोर्स करने पर छात्राओं को **₹50,000 प्रति वर्ष**।
* **पीएम विद्यालक्ष्मी पोर्टल:** बिना किसी गारंटी के शिक्षा ऋण एवं पढ़ाई के दौरान 100% ब्याज सब्सिडी।

---

💡 **महत्वपूर्ण सुझाव:**
आपकी बेटी ने 12वीं **किस विषय (Science, Commerce या Arts)** से पास की है और उसकी **किस क्षेत्र में सबसे ज्यादा रुचि है**? आप बताएं ताकि हम उसके लिए सबसे उपयुक्त कॉलेज, परीक्षा और सरकारी स्कॉलरशिप की सटीक जानकारी दे सकें।`;
          suggestions = ['Science (PCM/PCB) विकल्प 🔬', 'Commerce करियर 📊', 'Arts व सिविल सेवा ⚖️', '12वीं बाद सरकारी नौकरी 🏢'];
        } else {
          reply = `🎓 **Career Pathways & Government Support for Your Daughter After 12th:**

Congratulations to your daughter on completing 12th standard! Here is the comprehensive roadmap across all major fields:

---

### 1. Stream-Wise Career Pathways:
* **Science (PCM/PCB):**
  * Engineering (JEE), Medical & Healthcare (NEET, B.Sc Nursing), Pharmacy, Pure Sciences (B.Sc with DST INSPIRE Scholarship of ₹80,000/year).
* **Commerce:**
  * Chartered Accountancy (CA), Company Secretary (CS), B.Com, BBA, Banking & Financial Services.
* **Arts & Humanities:**
  * Civil Services (UPSC/State PSC), Law (CLAT/5-year Integrated LLB), Journalism, Design (NIFT), Teaching & Psychology.

---

### 2. Direct Government Jobs After 12th:
* **SSC CHSL:** Data Entry Operator (DEO), Lower Division Clerk (LDC) in Central Govt ministries.
* **Railway RRB:** Non-Technical clerical and operational posts.
* **Defense (NDA for Women):** Direct entry to become commissioned officers in Army, Navy, or Air Force.

---

### 3. Key Government Financial Support:
* **National Scholarship Portal (NSP):** Central Sector & Post-Matric scholarships covering college tuition fees.
* **AICTE Pragati Scheme:** ₹50,000/year scholarship for female students in technical/engineering degrees.
* **PM Vidyalaxmi Scheme:** 100% collateral-free bank loans with government interest subsidies.

💡 **Next Step:** Which stream (Science, Commerce, or Arts) did she study, and what is her primary interest? Let us know so we can provide tailored guidance!`;
          suggestions = ['Science Streams 🔬', 'Commerce Options 📊', 'Arts & Law ⚖️', '12th Govt Jobs 🏢'];
        }
      }
      else if (isJobsQuery) {
        let jobsListText = '';
        if (allJobs.length > 0) {
          jobsListText = allJobs.slice(0, 4).map((j, idx) => 
            `**${idx + 1}. ${j.postName}** (${j.department})\n` +
            `• **${labels.vacancies}:** ${j.vacancies > 0 ? j.vacancies.toLocaleString() : 'As per notice'}\n` +
            `• **${labels.salary}:** ${j.salaryRange}\n` +
            `• **${labels.eligibility}:** ${j.qualification}\n` +
            `• **${labels.lastDate}:** ${new Date(j.lastDate).toLocaleDateString('en-IN')}\n` +
            `• **${labels.officialLink}:** [${j.department}](${j.officialNotification})\n`
          ).join('\n');
        }

        reply = `🏢 **${labels.jobsHeader}:**\n\n` +
          `${labels.generalIntro} Government Jobs & Entrance Exams:\n\n` +
          jobsListText;

        suggestions = ['UPSC Civil Services 2026', 'SSC CGL Notification', 'Railway RRB NTPC', 'Bank PO Jobs'];
      }
      else if (isFarmerQuery) {
        reply = `🌾 **किसान भाइयों के लिए प्रमुख सरकारी समाधान (Farmer Support Schemes):**

1. **प्रधानमंत्री किसान सम्मान निधि (PM-KISAN):**
   • वित्तीय लाभ: ₹6,000 प्रति वर्ष (₹2,000 की 3 समान किस्तों में सीधे बैंक खाते में)।
   • [आधिकारिक पोर्टल](https://pmkisan.gov.in/)

2. **पीएम-कुसुम योजना (PM-KUSUM Solar Pump):**
   • सिंचाई के लिए सोलर पंप लगाने पर 90% तक सरकारी सब्सिडी (60% केंद्र व राज्य सरकार + 30% बैंक लोन, किसान को मात्र 10% देना होता है)।
   • [पीएम कुसुम पोर्टल](https://pmkusum.mnre.gov.in/)

3. **किसान क्रेडिट कार्ड (KCC):**
   • 4% रियायती ब्याज दर पर ₹3 लाख तक का कृषि ऋण।`;
        suggestions = ['PM-KISAN ₹6,000 🌾', 'PM-KUSUM Solar ☀️', 'Kisan Credit Card 💳', 'Crop Insurance (PMFBY) 🛡️'];
      }
      else if (isBusinessQuery) {
        reply = `💼 **व्यापार एवं स्वरोजगार के लिए सरकारी लोन समाधान (Business Loans):**

1. **प्रधानमंत्री मुद्रा योजना (PM MUDRA Yojana):**
   • बिना किसी गारंटी (Collateral-Free) के दुकान या व्यवसाय शुरू करने के लिए लोन:
   • **शिशु लोन:** ₹50,000 तक (नया काम शुरू करने के लिए)
   • **किशोर लोन:** ₹50,000 से ₹5 लाख तक
   • **तरुण लोन:** ₹5 लाख से ₹20 लाख तक
   • [मुद्रा पोर्टल](https://www.mudra.org.in/)

2. **प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP):**
   • नया उद्योग लगाने पर ₹50 लाख तक और सेवा क्षेत्र में ₹20 लाख तक का लोन, जिसमें 15% से 35% तक सरकारी सब्सिडी मिलती है।
   • [PMEGP पोर्टल](https://www.kviconline.gov.in/pmegpeportal/)`;
        suggestions = ['Mudra Loan ₹50k - ₹20L 💼', 'PMEGP 35% Subsidy 🏭', 'PM SVANidhi ₹50k 🛒', 'Stand Up India 🚀'];
      }
      else if (isHealthQuery) {
        reply = `🏥 **स्वास्थ्य एवं मुफ्त इलाज के लिए सरकारी समाधान (Health Care):**

1. **आयुष्मान भारत (PM-JAY):**
   • प्रत्येक पात्र परिवार को हर साल **₹5,00,000 तक का मुफ्त इलाज** देश के सभी संबद्ध सरकारी व निजी अस्पतालों में।
   • कैशलेस एवं पेपरलेस सुविधा।
   • [आयुष्मान भारत पोर्टल](https://pmjay.gov.in/)

2. **प्रधानमंत्री जन औषधि केंद्र:**
   • उच्च गुणवत्ता वाली जेनेरिक दवाइयां 50% से 90% सस्ती दरों पर उपलब्ध।`;
        suggestions = ['Ayushman Card ₹5 Lakh 🏥', 'Jan Aushadhi Store 💊', 'Find Hospital 🏥'];
      }
      else if (isHousingQuery) {
        reply = `🏠 **पक्का मकान पाने के लिए सरकारी आवास योजना (Housing Support):**

1. **प्रधानमंत्री आवास योजना (PMAY):**
   • **PMAY-ग्रामीण:** ग्रामीण क्षेत्रों में पक्का मकान बनाने के लिए ₹1,20,000 से ₹1,30,000 तक की सीधी आर्थिक मदद + मनरेगा मजदूरी व शौचालय सहायता।
   • **PMAY-शहरी:** शहरी क्षेत्रों में घर खरीदने या बनाने पर ₹2.5 लाख तक की ब्याज सब्सिडी।
   • [PMAY आधिकारिक पोर्टल](https://pmaymis.gov.in/)`;
        suggestions = ['PMAY Gramin 🏡', 'PMAY Urban 🏢', 'Check Beneficiary List 📋'];
      }
      else {
        // Find matching scheme from database
        const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
        const matchedScheme = allSchemes.find(s => {
          const sName = s.name.toLowerCase();
          const sCat = s.category.toLowerCase();
          return queryWords.some(w => sName.includes(w) || sCat.includes(w));
        }) || allSchemes.find(s => s.name.toLowerCase().includes('kisan')) || allSchemes[0];

        if (matchedScheme) {
          const q = lowerQuery;
          if (q.includes('age') || q.includes('umar') || q.includes('aayu') || q.includes('आयु सीमा') || q.includes('வயது') || q.includes('বয়স') || q.includes('ઉંમર') || q.includes('వయస్సు')) {
            reply = `🏛️ **${matchedScheme.name}:**\n${labels.ageLimit}: **${matchedScheme.minAge} - ${matchedScheme.maxAge} ${labels.yrs}**`;
          } else if (q.includes('doc') || q.includes('kagaz') || q.includes('praman') || q.includes('certificate') || q.includes('दस्तावेज़') || q.includes('ஆவணம்') || q.includes('দলিল') || q.includes('દસ્તાવેજ') || q.includes('పత్రాలు')) {
            reply = `🏛️ **${matchedScheme.name} — ${labels.docs}:**\n${matchedScheme.documentsRequired}`;
          } else if (q.includes('paisa') || q.includes('rupaye') || q.includes('benefit') || q.includes('amount') || q.includes('labh') || q.includes('subsidy') || q.includes('पैसा') || q.includes('பணம்') || q.includes('টাকা') || q.includes('રૂપિયા') || q.includes('డబ్బులు')) {
            reply = `🏛️ **${matchedScheme.name} — ${labels.benefit}:**\n${matchedScheme.benefitAmount > 0 ? '₹' + matchedScheme.benefitAmount.toLocaleString() : 'As per Government rules'}`;
          } else if (q.includes('apply') || q.includes('link') || q.includes('portal') || q.includes('website') || q.includes('online') || q.includes('पोर्टल') || q.includes('வலைத்தளம்') || q.includes('ওয়েবসাইট') || q.includes('વેબસાઇટ') || q.includes('లిંక్')) {
            reply = `🏛️ **${matchedScheme.name} — ${labels.officialLink}:**\n${matchedScheme.officialWebsite}\n\n• ${labels.process}: ${matchedScheme.applicationProcess}`;
          } else if (q.includes('patrata') || q.includes('eligible') || q.includes('eligibility') || q.includes('yogyata') || q.includes('पात्रता') || q.includes('தகுதி') || q.includes('যোগ্যতা') || q.includes('લાયકાત') || q.includes('అర్హత')) {
            reply = `🏛️ **${matchedScheme.name} — ${labels.eligibility}:**\n${matchedScheme.eligibilityCriteria}\n• ${labels.ageLimit}: ${matchedScheme.minAge} - ${matchedScheme.maxAge} ${labels.yrs}`;
          } else {
            // General overview
            reply = `🏛️ **${matchedScheme.name}:**\n• ${labels.benefit}: ${matchedScheme.benefitAmount > 0 ? '₹' + matchedScheme.benefitAmount.toLocaleString() : 'Govt Support'}\n• ${labels.eligibility}: ${matchedScheme.eligibilityCriteria}\n• [${labels.officialLink}](${matchedScheme.officialWebsite})`;
          }

          suggestions = ['PM-KISAN ₹6,000 🌾', 'PM-KUSUM Solar ☀️', 'How to Apply 📋'];
        }
      }
    }

    if (suggestions.length === 0) {
      suggestions = ['PM-KUSUM Solar ☀️', 'PM-KISAN ₹6,000 🌾', 'Mudra Loans 💼', 'Govt Jobs 🏢'];
    }

    res.json({
      success: true,
      data: {
        reply,
        suggestions
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { handleChat };
