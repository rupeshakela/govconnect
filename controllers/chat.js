const Scheme = require('../models/Scheme');
const { Job, Exam } = require('../models/Portal');
const UserProfile = require('../models/UserProfile');

const LANG_DIRECTIVES = {
  en: { name: 'English', script: 'English alphabet', instructions: 'Respond completely in clear, natural, grammatically correct English.' },
  hi: { name: 'Hindi', script: 'Devanagari script (हिन्दी)', instructions: 'Respond completely in pure, natural, respectful Hindi in Devanagari script (हिन्दी).' },
  hinglish: { name: 'Hinglish', script: 'Roman/English alphabet', instructions: 'Respond in friendly, colloquial conversational Hinglish (Hindi written using English/Roman letters, like "Aap is yojana ke liye apply kar sakte hain...").' },
  bn: { name: 'Bengali', script: 'Bengali script (বাংলা)', instructions: 'Respond completely in polite, natural Bengali (বাংলা).' },
  mr: { name: 'Marathi', script: 'Marathi in Devanagari (मराठी)', instructions: 'Respond completely in polite, natural Marathi (मराठी).' },
  te: { name: 'Telugu', script: 'Telugu script (తెలుగు)', instructions: 'Respond completely in polite, natural Telugu (తెలుగు).' },
  ta: { name: 'Tamil', script: 'Tamil script (தமிழ்)', instructions: 'Respond completely in polite, natural Tamil (தமிழ்).' },
  gu: { name: 'Gujarati', script: 'Gujarati script (ગુજરાતી)', instructions: 'Respond completely in polite, natural Gujarati (ગુજરાતી).' }
};

const UI_LABELS = {
  en: {
    details: 'Verified Scheme Details',
    category: 'Category',
    benefit: 'Financial Benefit',
    eligibility: 'Eligibility Criteria',
    ageLimit: 'Age Limit',
    docs: 'Required Documents',
    process: 'Application Process',
    officialLink: 'Official Application Portal',
    yrs: 'years',
    jobsHeader: 'Active Government Jobs & Recruitments 2026',
    vacancies: 'Vacancies',
    salary: 'Salary Scale',
    lastDate: 'Deadline',
    generalIntro: 'Here is the verified information regarding'
  },
  hi: {
    details: 'की पूरी आधिकारिक जानकारी',
    category: 'श्रेणी',
    benefit: 'वित्तीय लाभ',
    eligibility: 'पात्रता नियम',
    ageLimit: 'आयु सीमा',
    docs: 'आवश्यक दस्तावेज',
    process: 'आवेदन प्रक्रिया',
    officialLink: 'आधिकारिक आवेदन पोर्टल',
    yrs: 'वर्ष',
    jobsHeader: 'सक्रिय सरकारी नौकरियां एवं भर्ती सूचना 2026',
    vacancies: 'पदों की संख्या',
    salary: 'वेतनमान',
    lastDate: 'अंतिम तिथि',
    generalIntro: 'आपके द्वारा पूछे गए विषय की आधिकारिक जानकारी'
  },
  hinglish: {
    details: 'ki poori verified jankari',
    category: 'Category',
    benefit: 'Financial Benefit / Fayda',
    eligibility: 'Eligibility Rules',
    ageLimit: 'Age Limit',
    docs: 'Zaroori Documents',
    process: 'Online Form Process',
    officialLink: 'Official Apply Link',
    yrs: 'saal',
    jobsHeader: 'Active Sarkari Jobs & Bharti Alerts 2026',
    vacancies: 'Total Posts',
    salary: 'Salary Range',
    lastDate: 'Last Date to Apply',
    generalIntro: 'Aapke sawaal ki verified jankari'
  },
  mr: {
    details: 'ची संपूर्ण अधिकृत माहिती',
    category: 'प्रवर्ग / श्रेणी',
    benefit: 'आर्थिक लाभ',
    eligibility: 'पात्रतेचे निकष',
    ageLimit: 'वयोमर्यादा',
    docs: 'आवश्यक कागदपत्रे',
    process: 'अर्ज करण्याची प्रक्रिया',
    officialLink: 'अधिकृत अर्ज पोर्टल',
    yrs: 'वर्षे',
    jobsHeader: 'सध्या सुरू असलेल्या सरकारी नोकऱ्या आणि भरती २०२६',
    vacancies: 'जागांची संख्या',
    salary: 'वेतनश्रेणी',
    lastDate: 'अंतिम मुदत',
    generalIntro: 'तुम्ही विचारलेल्या विषयाची अधिकृत माहिती'
  },
  bn: {
    details: '-এর সম্পূর্ণ অফিসিয়াল বিবরণ',
    category: 'বিভাগ',
    benefit: 'আর্থিক সুবিধা',
    eligibility: 'যোগ্যতার মানদণ্ড',
    ageLimit: 'বয়সসীমা',
    docs: 'প্রয়োজনীয় নথিপত্র',
    process: 'আবেদন পদ্ধতি',
    officialLink: 'অফিসিয়াল পোর্টাল লিংক',
    yrs: 'বছর',
    jobsHeader: 'সক্রিয় সরকারি চাকরি ও নিয়োগ ২০২৬',
    vacancies: 'শূন্যপদের সংখ্যা',
    salary: 'বেতন স্কেল',
    lastDate: 'আবেদনের শেষ তারিখ',
    generalIntro: 'আপনার প্রশ্নের সরকারি বিবরণ'
  },
  te: {
    details: 'యొక్క పూర్తి అధికారిక వివరాలు',
    category: 'వర్గం',
    benefit: 'ఆర్థిక ప్రయోజనం',
    eligibility: 'అర్హత ప్రమాణాలు',
    ageLimit: 'వయోపరిమితి',
    docs: 'కావలసిన పత్రాలు',
    process: 'దరఖాస్తు విధానం',
    officialLink: 'అధికారిక పోర్టల్',
    yrs: 'సంవత్సరాలు',
    jobsHeader: 'ప్రస్తుత ప్రభుత్వ ఉద్యోగాలు మరియు రిక్రూట్‌మెంట్ 2026',
    vacancies: 'ఖాళీల సంఖ్య',
    salary: 'జీతం శ్రేణి',
    lastDate: 'చివరి తేదీ',
    generalIntro: 'మీరు అడిగిన సమాచారం'
  },
  ta: {
    details: 'முழு அதிகாரப்பூர்வ விவரங்கள்',
    category: 'பிரிவு',
    benefit: 'நிதி உதவி',
    eligibility: 'தகுதி வரம்புகள்',
    ageLimit: 'வயது வரம்பு',
    docs: 'தேவையான ஆவணங்கள்',
    process: 'விண்ணப்பிக்கும் முறை',
    officialLink: 'அதிகாரப்பூர்வ இணையதளம்',
    yrs: 'ஆண்டுகள்',
    jobsHeader: 'தற்போதைய அரசு வேலைவாய்ப்புகள் மற்றும் தேர்வுகள் 2026',
    vacancies: 'காலியிடங்கள்',
    salary: 'சம்பள விகிதம்',
    lastDate: 'கடைசி தேதி',
    generalIntro: 'அரசு அதிகாரப்பூர்வ தகவல்'
  },
  gu: {
    details: 'ની સંપૂર્ણ સત્તાવાર વિગત',
    category: 'શ્રેણી',
    benefit: 'નાણાકીય સહાય',
    eligibility: 'પાત્રતાના નિયમો',
    ageLimit: 'વય મર્યાદા',
    docs: 'જરૂરી દસ્તાવેજો',
    process: 'અરજી કરવાની પ્રક્રિયા',
    officialLink: 'સત્તાવાર પોર્ટલ લિંક',
    yrs: 'વર્ષ',
    jobsHeader: 'ચાલુ સરકારી નોકરીઓ અને ભરતી જાહેરાત ૨૦૨૬',
    vacancies: 'જગ્યાઓની સંખ્યા',
    salary: 'પગાર ધોરણ',
    lastDate: 'છેલ્લી તારીખ',
    generalIntro: 'તમારા પ્રશ્નની સત્તાવાર માહિતી'
  }
};

const GREETINGS_MAP = {
  en: {
    reply: "Hello! Welcome to **GovScheme AI Assistant** 🏛️\n\nI am your intelligent government navigator. You can ask me anything about central & state welfare schemes, solar subsidies, scholarships, loans, jobs, or online application processes.\n\nHow may I help you today?",
    suggestions: ['PM-KUSUM Solar Pump ☀️', 'PM-KISAN ₹6,000 🌾', 'How to Apply Online 📋', 'Latest Govt Jobs 🏢']
  },
  hi: {
    reply: "नमस्ते! 🙏 **GovScheme AI सरकारी मित्र** में आपका स्वागत है 🏛️\n\nमैं आपका डिजिटल सरकारी सहायक हूँ। आप मुझसे किसी भी सरकारी योजना, पीएम-कुसुम सोलर पंप, पीएम-किसान, छात्रवृत्ति, मुद्रा व्यापार लोन, सरकारी नौकरी या ऑनलाइन फॉर्म भरने के बारे में पूछ सकते हैं।\n\nआज मैं आपकी क्या सहायता कर सकता हूँ?",
    suggestions: ['पीएम-कुसुम सोलर पंप ☀️', 'पीएम-किसान ₹6,000 🌾', 'आवेदन कैसे करें 📋', 'सरकारी नौकरियां 🏢']
  },
  hinglish: {
    reply: "Namaste! 🙏 Welcome to **GovScheme AI Assistant (सरकारी मित्र)** 🏛️\n\nMain aapka personal welfare assistant hu. Aap mujhse kisi bhi central ya state government scheme, PM-KUSUM solar pump, PM-KISAN, scholarships, Mudra business loans, sarkari jobs, ya online form bharne ke tareeqe ke baare me pooch sakte hain.\n\nAaj main aapki kya madad kar sakta hu?",
    suggestions: ['PM-KUSUM Solar Pump ☀️', 'PM-KISAN ₹6,000 🌾', 'Form Kaise Bharein 📋', 'Latest Govt Jobs 🏢']
  },
  bn: {
    reply: "নমস্কার! 🙏 **GovScheme AI সহকারী**-তে আপনাকে স্বাগতম 🏛️\n\nআমি আপনার ডিজিটাল সরকারি সহায়ক। আপনি যে কোনো সরকারি প্রকল্প, পিএম-কুসুম সোলার পাম্প, পিএম-কিসান, স্কলারশিপ, মুদ্রা ঋণ বা সরকারি চাকরি সম্পর্কে জানতে পারেন।\n\nআজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    suggestions: ['পিএম-কুসুম সোলার পাম্প ☀️', 'পিএম-কিসান ₹৬,০০০ 🌾', 'আবেদন করার নিয়ম 📋', 'সরকারি চাকরি 🏢']
  },
  mr: {
    reply: "नमस्कार! 🙏 **GovScheme AI सरकारी मदतनीस** मध्ये आपले स्वागत आहे 🏛️\n\nमी तुमचा वैयक्तिक मार्गदर्शक आहे. तुम्ही कोणत्याही सरकारी योजना, पीएम-कुसुम सोलर पंप, पीएम-किसान, शिष्यवृत्ती, मुद्रा व्यवसाय कर्ज किंवा सरकारी भरतीबद्दल माहिती विचारू शकता.\n\nआज मी तुम्हाला कशी मदत करू शकतो?",
    suggestions: ['पीएम-कुसुम सोलर पंप ☀️', 'पीएम-किसान ₹६,००० 🌾', 'अर्ज कसा करावा 📋', 'सरकारी नोकऱ्या 🏢']
  },
  te: {
    reply: "నమస్కారం! 🙏 **GovScheme AI సహాయకుడికి** స్వాగతం 🏛️\n\nనేను మీ ప్రభుత్వ సంక్షేమ సహాయకుడిని. మీరు ఏ ప్రభుత్వ పథకం, పీఎం-కుసుమ్ సోలార్ పంపులు, పీఎం-కిసాన్, స్కాలర్‌షిప్‌లు, ముద్రా రుణాలు లేదా ఉద్యోగాల గురించి అడగవచ్చు.\n\nఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
    suggestions: ['పీఎం-కుసుమ్ సోలార్ పంప్ ☀️', 'పీఎం-కిసాన్ ₹6,000 🌾', 'దరఖాస్తు విధానం 📋', 'ప్రభుత్వ ఉద్యోగాలు 🏢']
  },
  ta: {
    reply: "வணக்கம்! 🙏 **GovScheme AI உதவியாளருக்கு** வரவேற்கிறோம் 🏛️\n\nநான் உங்கள் டிஜிட்டல் அரசு வழிகாட்டி. அரசு திட்டங்கள், பிஎம்-குசும் சோலார் பம்ப், உதவித்தொகை, முத்ரா கடன்கள் மற்றும் அரசு வேலைவாய்ப்புகள் பற்றி நீங்கள் கேட்கலாம்.\n\nஇன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    suggestions: ['பிஎம்-குசும் சோலார் ☀️', 'பிஎம்-கிசான் ₹6,000 🌾', 'விண்ணப்பிக்கும் முறை 📋', 'அரசு வேலைகள் 🏢']
  },
  gu: {
    reply: "નમસ્તે! 🙏 **GovScheme AI સરકારી મિત્ર** માં આપનું સ્વાગત છે 🏛️\n\nહું તમારો ડિજિટલ સહાયક છું. તમે કોઈપણ સરકારી યોજનાઓ, પીએમ-કુસુમ સોલાર પંપ, પીએમ-કિસાન, શિષ્યવૃત્તિ, મુદ્રા લોન અથવા સરકારી ભરતી વિશે પૂછી શકો છો.\n\nઆજે હું આપની શું મદદ કરી શકું?",
    suggestions: ['પીએમ-કુસુમ સોલાર પંપ ☀️', 'પીએમ-કિસાન ₹6,000 🌾', 'અરજી કરવાની રીત 📋', 'સરકારી નોકરીઓ 🏢']
  }
};

module.exports.handleChat = async (req, res) => {
  const { message, history = [], language = 'en' } = req.body;

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

    if (isGreeting) {
      const greetingData = GREETINGS_MAP[currentLangKey] || GREETINGS_MAP.en;
      return res.json({ success: true, data: greetingData });
    }

    // 1. Live database knowledge
    const [allSchemes, allJobs, allExams] = await Promise.all([
      Scheme.find({ isDeleted: false }).populate('state', 'name').lean(),
      Job.find({ isDeleted: false }).populate('state', 'name').lean(),
      Exam.find({ isDeleted: false }).lean()
    ]);

    let userContext = 'Citizen: General Resident of India';
    if (req.user) {
      const profile = await UserProfile.findOne({ user: req.user._id }).populate('state', 'name').lean();
      if (profile) {
        userContext = `Citizen Profile: Age: ${profile.age}, Gender: ${profile.gender}, Annual Income: ₹${profile.annualIncome}, Occupation: ${profile.occupation}, Qualification: ${profile.qualification}, Category: ${profile.casteCategory}, State: ${profile.state?.name || 'Pan-India'}`;
      }
    }

    const schemesSummary = allSchemes.map((s, i) =>
      `[Scheme ${i+1}] Name: "${s.name}" | Category: ${s.category} | Benefit: ₹${s.benefitAmount} | State: ${s.state?.name || 'All India'} | Eligibility: ${s.eligibilityCriteria} | Income Limit: ₹${s.incomeLimit} | Min-Max Age: ${s.minAge}-${s.maxAge} | Documents: ${s.documentsRequired} | Process: ${s.applicationProcess} | Official Link: ${s.officialWebsite}`
    ).join('\n');

    const jobsSummary = allJobs.slice(0, 10).map((j, i) =>
      `[Job ${i+1}] Post: "${j.postName}" | Dept: ${j.department} | Vacancies: ${j.vacancies} | Salary: ${j.salaryRange} | Eligibility: ${j.qualification} | Last Date: ${new Date(j.lastDate).toLocaleDateString()} | Link: ${j.officialNotification}`
    ).join('\n');

    const examsSummary = allExams.slice(0, 7).map((e, i) =>
      `[Exam ${i+1}] Name: "${e.name}" | Authority: ${e.conductingAuthority} | Schedule: ${e.importantDates} | Eligibility: ${e.eligibility} | Syllabus: ${e.syllabus} | Link: ${e.officialWebsite}`
    ).join('\n');

    const systemInstruction = `You are the friendly, respectful, and highly intelligent AI Mitra & Assistant for the GovScheme Portal (Government of India Scheme & Career Navigator).

MANDATORY LANGUAGE DIRECTIVE:
The citizen has explicitly selected their preferred portal language as: **${targetLang.name}** (Code: "${currentLangKey}").
${targetLang.instructions}
Required Script: ${targetLang.script}.
You MUST formulate your ENTIRE reply, including greetings, headings, bullet points, and advice, in ${targetLang.name}.
Do NOT default to Hindi or English if the user selected another language!

CORE PRINCIPLES:
1. When asked about any government scheme or job, provide clear structure in ${targetLang.name}:
   - What it is
   - How it works / Subsidy details
   - Key Benefits
   - Important Limitations / Eligibility criteria
   - Documents required
   - Official Apply Link (always keep real URLs intact)
2. Maintain a very polite, humble, and supportive tone at all times.

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
      history.slice(-8).forEach((item) => {
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

    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
          signal: controller.signal,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1200
            }
          })
        });
        clearTimeout(timeoutId);

        const geminiData = await geminiRes.json();
        if (geminiData.candidates && geminiData.candidates[0]?.content?.parts) {
          const parts = geminiData.candidates[0].content.parts;
          const answerParts = parts.filter((p) => !p.thought && p.text);
          if (answerParts.length > 0) {
            reply = answerParts.map((p) => p.text).join('\n').trim();
          } else if (parts.length > 0) {
            reply = parts[parts.length - 1].text?.trim() || '';
          }
        }
      } catch (geminiErr) {
        // Fallback to multilingual database engine
      }
    }

    // Dynamic Multilingual Database Response
    if (!reply) {
      if (lowerQuery.includes('job') || lowerQuery.includes('exam') || lowerQuery.includes('naukri') || lowerQuery.includes('vacancy') || lowerQuery.includes('bharti') || lowerQuery.includes('ssc') || lowerQuery.includes('upsc') || lowerQuery.includes('railway') || lowerQuery.includes('ibps')) {
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
      } else {
        const queryWords = lowerQuery.split(/\s+/).filter((w) => w.length > 2);
        const matchedScheme = allSchemes.find((s) => {
          const sName = s.name.toLowerCase();
          const sCat = s.category.toLowerCase();
          return queryWords.some((w) => sName.includes(w) || sCat.includes(w));
        }) || allSchemes[0];

        if (matchedScheme) {
          reply = `🏛️ **${matchedScheme.name} ${labels.details}:**\n\n` +
            `• **${labels.category}:** ${matchedScheme.category}\n` +
            `• **${labels.benefit}:** ${matchedScheme.benefitAmount > 0 ? '₹' + matchedScheme.benefitAmount.toLocaleString() : 'Govt Norms'}\n` +
            `• **${labels.eligibility}:** ${matchedScheme.eligibilityCriteria}\n` +
            `• **${labels.ageLimit}:** ${matchedScheme.minAge} - ${matchedScheme.maxAge} ${labels.yrs}\n` +
            `• **${labels.docs}:** ${matchedScheme.documentsRequired}\n` +
            `• **${labels.process}:** ${matchedScheme.applicationProcess}\n` +
            `• **${labels.officialLink}:** [${matchedScheme.name}](${matchedScheme.officialWebsite})`;

          suggestions = ['How to Apply Online 📋', 'Required Documents 📄', 'All Schemes 🏛️'];
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
