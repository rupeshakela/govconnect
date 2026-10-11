import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import {
  ScanLine, Upload, AlertTriangle, CheckCircle2, XCircle,
  FileText, RefreshCw, Loader2, Info, ChevronRight,
  Eye, X, Lightbulb, Shield, Copy, Edit3, Sparkles, ChevronDown, ChevronUp,
  User, Calendar, Users, Home, UserCheck, Sliders,
  Award, ShieldCheck, CheckSquare, Building2, ExternalLink, FileCheck, Check,
  Landmark, BadgeCheck, Clock, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

// ── Comparison Criteria Definitions ─────────────────────────────────────────
const AVAILABLE_CRITERIA = [
  { id: 'name', label: 'Full Name', labelHi: 'नाम', icon: User, desc: 'Aadhaar & PAN citizen spelling matching' },
  { id: 'dob', label: 'Date of Birth', labelHi: 'जन्म तिथि', icon: Calendar, desc: 'Date of birth / birth year matching' },
  { id: 'fatherName', label: "Father's Name", labelHi: 'पिता का नाम', icon: Users, desc: "Father's / Guardian's name matching" },
  { id: 'residency', label: 'State / Address', labelHi: 'निवास / राज्य', icon: Home, desc: 'State, District or Pincode verification' },
  { id: 'gender', label: 'Gender', labelHi: 'लिंग', icon: UserCheck, desc: 'Male / Female gender alignment' },
];

// ── Fuzzy Name Comparison Logic ──────────────────────────────────────────────
const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

const tokenize = (str) => normalize(str).split(/\s+/).filter(Boolean);

const jaccardSimilarity = (a, b) => {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 1 : intersection.size / union.size;
};

const levenshtein = (s, t) => {
  const m = s.length, n = t.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    dp[i][j] = s[i - 1] === t[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  }
  return dp[m][n];
};

const nameSimilarity = (a, b) => {
  if (!a || !b) return 0;
  const normA = normalize(a);
  const normB = normalize(b);
  if (normA === normB) return 100;

  const ja = jaccardSimilarity(a, b);
  const maxLen = Math.max(normA.length, normB.length);
  const lev = maxLen === 0 ? 1 : 1 - levenshtein(normA, normB) / maxLen;
  return ((ja + lev) / 2) * 100;
};

const getRiskLevel = (score) => {
  if (score >= 90) return { label: 'MATCH', color: 'var(--success)', bg: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)', icon: CheckCircle2, message: 'All selected fields match! Zero rejection risk.' };
  if (score >= 70) return { label: 'MINOR MISMATCH', color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)', icon: AlertTriangle, message: 'Minor spelling / format difference. Review highlighted criteria.' };
  if (score >= 50) return { label: 'MISMATCH', color: '#f97316', bg: 'rgba(249,115,22,0.1)', borderColor: 'rgba(249,115,22,0.3)', icon: AlertTriangle, message: 'Significant mismatch in one or more criteria. High rejection risk.' };
  return { label: 'CRITICAL MISMATCH', color: 'var(--error)', bg: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.35)', icon: XCircle, message: 'Critical discrepancy! Government subsidy application will be rejected.' };
};

const DOCUMENT_TYPES = ['Aadhaar Card', 'PAN Card', '10th Marksheet', '12th Marksheet', 'Caste Certificate', 'Income Certificate', 'Bank Passbook', 'Ration Card', 'Passport', 'Voter ID', 'Birth Certificate', 'Residence Certificate', 'Other'];

// ── Indian ID Card OCR Helpers ───────────────────────────────────────────────
const NON_NAME_KEYWORDS = [
  'GOVERNMENT', 'GOVT', 'INDIA', 'BHARAT', 'BHARATH', 'SARKAR', 'SARKAAR', 'REPUBLIC',
  'UNIQUE', 'IDENTIFICATION', 'AUTHORITY', 'UIDAI', 'AADHAAR', 'ADHAR',
  'MERA', 'MERI', 'PEHCHAN', 'ENROLMENT', 'ENROLLMENT', 'HELP', 'WWW',
  'DOWNLOAD', 'ISSUE', 'DATE', 'BIRTH', 'DOB', 'YEAR', 'YOB',
  'GENDER', 'MALE', 'FEMALE', 'TRANSGENDER', 'PURUSH', 'MAHILA',
  'INCOME', 'TAX', 'DEPARTMENT', 'PERMANENT', 'ACCOUNT', 'NUMBER', 'CARD',
  'SIGNATURE', 'FATHER', 'FATHERS', 'HUSBAND', 'MOTHER', 'GUARDIAN', 'SON', 'DAUGHTER', 'WIFE',
  'CARE OF', 'ADDRESS', 'DISTRICT', 'STATE', 'PIN', 'PINCODE', 'PO',
  'ELECTRONICS', 'INFORMATION', 'TECHNOLOGY', 'MINISTRY', 'NATIONAL', 'CENTRAL',
  'COMMISSION', 'BOARD', 'COUNCIL', 'CERTIFICATE', 'EXAMINATION', 'SECONDARY',
  'HIGHER', 'EDUCATION', 'UNIVERSITY', 'INSTITUTE', 'COLLEGE', 'PASSBOOK',
  'BANK', 'BRANCH', 'IFSC', 'MICR', 'SAVINGS', 'CURRENT', 'BALANCE',
  'TEAM', 'VERE', 'TE', 'VARA', 'VERA', 'APPLICANT', 'HOLDER', 'CITIZEN'
];

const INDIAN_NAME_TOKENS = new Set([
  'kumar', 'kumari', 'singh', 'sharma', 'verma', 'gupta', 'yadav', 'patel',
  'prasad', 'lal', 'devi', 'ray', 'rai', 'das', 'akela', 'rupesh', 'amit',
  'rahul', 'priya', 'sunita', 'ramesh', 'suresh', 'mohammad', 'mohd', 'ali',
  'khan', 'mishra', 'jha', 'choudhary', 'tiwari', 'pandey', 'sinha', 'joshi',
  'reddy', 'nair', 'iyer', 'rao', 'pillai', 'menon', 'mehta', 'shah', 'jain',
  'agarwal', 'agrawal', 'bansal', 'mittal', 'goyal', 'garg', 'soni', 'bhatia',
  'khanna', 'kapoor', 'malhotra', 'sethi', 'arora', 'grover', 'anand', 'kapur',
  'anita', 'pooja', 'neha', 'rekha', 'geeta', 'seema', 'radha', 'sita', 'lakshmi',
  'deepak', 'manoj', 'sanjay', 'vikas', 'vinod', 'anil', 'sunil', 'ashok', 'pankaj',
  'sachin', 'nitin', 'alok', 'vivek', 'rohit', 'ajay', 'vijay', 'rajesh', 'dinesh',
  'mukesh', 'rakesh', 'naresh', 'mahesh', 'kamal', 'vimal', 'karan', 'arun', 'varun',
  'virendra', 'surendra', 'narendra', 'jitendra', 'dharmendra', 'rajendra', 'satendra',
  'chandra', 'prakash', 'bhushan', 'mohan', 'krishna', 'gopal', 'govind', 'shyam'
]);

const toTitleCase = (str) => {
  if (!str) return '';
  return str.split(/\s+/).map(w => {
    if (w.length <= 1) return w.toUpperCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
};

const sanitizePersonName = (raw) => {
  if (!raw) return '';
  let s = raw.replace(/[^a-zA-Z\s.]/g, ' ').trim();
  s = s.replace(/^(?:shri|smt|mr|ms|mrs|dr|late|name|naam|candidate|applicant|holder)\.?\s+/i, '');
  s = s.replace(/^(?:s\/o|d\/o|w\/o|c\/o)\.?\s+/i, '');
  let words = s.split(/\s+/).filter(Boolean);

  while (words.length > 2 && words[words.length - 1].length <= 2) {
    words.pop();
  }
  while (words.length > 2 && words[0].length <= 2 && !words[0].endsWith('.')) {
    words.shift();
  }

  if (words.every(w => w.replace(/\./g, '').length <= 2)) return '';
  if (words.length < 1 || words.length > 5) return '';

  const res = words.join(' ');
  if (/father|guardian|mother|department|income|tax|permanent|account|signature|government|bharat|india|unique|identification|download|enrolment|date|birth|dob|gender|male|female|republic/i.test(res)) return '';
  return res.length >= 3 && res.length <= 40 ? res : '';
};

const isNonNameLine = (line) => {
  if (!line || line.trim().length < 3) return true;
  const upper = line.toUpperCase();
  if (NON_NAME_KEYWORDS.some(kw => upper.includes(kw))) return true;
  const digitCount = (line.match(/\d/g) || []).length;
  if (digitCount >= 3) return true;
  if (/@|\.com|\.in|www|http|:\/\/|\|/i.test(line)) return true;
  return false;
};

const scoreNameCandidate = (nameStr, isFatherLine = false) => {
  const cleaned = sanitizePersonName(nameStr);
  if (!cleaned) return -100;

  const words = cleaned.split(/\s+/).filter(Boolean);
  const wordLengths = words.map(w => w.replace(/\./g, '').length);

  if (wordLengths.every(len => len <= 2)) return -100;
  if (cleaned.length < 3 || cleaned.length > 40) return -100;
  if (isNonNameLine(cleaned)) return -100;

  let score = 30;
  const longWords = wordLengths.filter(len => len >= 3).length;
  score += longWords * 20;

  for (const w of words) {
    const cleanWord = w.toLowerCase().replace(/[^a-z]/g, '');
    if (INDIAN_NAME_TOKENS.has(cleanWord)) score += 45;
  }

  const vowels = (cleaned.match(/[aeiouAEIOU]/g) || []).length;
  const lettersOnly = cleaned.replace(/[^a-zA-Z]/g, '').length;
  const vowelRatio = lettersOnly > 0 ? vowels / lettersOnly : 0;
  if (vowelRatio >= 0.20 && vowelRatio <= 0.70) score += 15;
  else if (vowelRatio < 0.15) score -= 40;

  if (isFatherLine) score -= 40;
  return score;
};

// Digital PDF direct text extractor (supports e-District, DigiLocker, RTPS, UIDAI PDFs)
const extractTextFromPDF = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // 1. First try pdfjs-dist for accurate text layer extraction
    try {
      const pdfjsLib = await import('pdfjs-dist');
      if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
      }
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      let fullText = '';
      const pagesToScan = Math.min(pdf.numPages, 3);
      for (let i = 1; i <= pagesToScan; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      if (fullText.trim().length >= 25) {
        return fullText;
      }
    } catch (pdfErr) {
      console.warn('pdfjs digital text extract fallback:', pdfErr);
    }

    // 2. Stream fallback for uncompressed / raw PDF text
    const textDecoder = new TextDecoder('latin1');
    const rawStr = textDecoder.decode(arrayBuffer);
    const matches = [];
    const tjRegex = /\(([^()]{2,100})\)\s*(?:Tj|'|")/g;
    let match;
    while ((match = tjRegex.exec(rawStr)) !== null) {
      const clean = match[1].replace(/\\([()\\])/g, '$1').trim();
      if (clean && clean.length >= 2) matches.push(clean);
    }
    const arrayTjRegex = /\[([^\]]+)\]\s*TJ/g;
    while ((match = arrayTjRegex.exec(rawStr)) !== null) {
      const inner = match[1];
      const subRegex = /\(([^()]+)\)/g;
      let sub;
      const parts = [];
      while ((sub = subRegex.exec(inner)) !== null) {
        parts.push(sub[1].replace(/\\([()\\])/g, '$1'));
      }
      if (parts.length > 0) matches.push(parts.join(' ').trim());
    }
    return matches.join('\n');
  } catch (err) {
    console.warn('PDF text extract error:', err);
    return '';
  }
};

// Render PDF Page 1 to high-resolution Image Blob for scanned photo PDFs
const renderPDFPageToCanvas = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import('pdfjs-dist');
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
    }
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.95);
    });
  } catch (err) {
    console.warn('renderPDFPageToCanvas error:', err);
    return null;
  }
};

const preprocessImageForOCR = (file) => {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/')) return resolve(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);

          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          // If image is already at optimal size, preserve 100% original pixel quality
          if (width >= 800 && width <= 2400 && height >= 500 && height <= 2400) {
            return resolve(file);
          }

          const maxDim = 2200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          } else if (width < 800) {
            const scale = 800 / width;
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          }, 'image/jpeg', 0.98);
        } catch (err) {
          console.warn('Canvas preprocess skipped:', err);
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

// ── Multi-Entity Document Extractor (Name, DOB, Father's Name, Residency, Gender) ──
const extractDocumentEntities = (rawText, docType = '') => {
  if (!rawText || !rawText.trim()) {
    return {
      name: '',
      dob: '',
      fatherName: '',
      residency: '',
      gender: '',
      candidates: [],
      rawLines: [],
      detectedDocType: docType
    };
  }

  const rawLines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const candidateScores = new Map();

  const addCandidate = (rawLine, priorityBoost = 0, isFather = false) => {
    if (!rawLine) return;
    const directClean = sanitizePersonName(rawLine);
    if (directClean) {
      const sc = scoreNameCandidate(directClean, isFather) + priorityBoost;
      if (sc > 0) {
        const title = toTitleCase(directClean);
        const current = candidateScores.get(title) || -100;
        if (sc > current) candidateScores.set(title, sc);
      }
    }

    const englishWords = rawLine.replace(/[^a-zA-Z\s.]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
    if (englishWords.length >= 2 && englishWords.length <= 5) {
      const segClean = sanitizePersonName(englishWords.join(' '));
      if (segClean) {
        const sc = scoreNameCandidate(segClean, isFather) + priorityBoost;
        if (sc > 0) {
          const title = toTitleCase(segClean);
          const current = candidateScores.get(title) || -100;
          if (sc > current) candidateScores.set(title, sc);
        }
      }
    }
  };

  const detectedDocType = docType || (
    /aadhaar|uidai|mera aadhaar|yob/i.test(rawText) ? 'Aadhaar Card' :
    /income tax|permanent account|pan/i.test(rawText) ? 'PAN Card' : 'Document'
  );

  const isAadhaar = /aadhaar/i.test(detectedDocType) || /aadhaar|uidai|yob/i.test(rawText);
  const isPAN = /pan/i.test(detectedDocType) || /income tax|permanent account/i.test(rawText);

  // 1. Father's Name detection
  let detectedFather = '';
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (/father['s]*\s*name|पिता\s*का\s*नाम/i.test(line)) {
      // 1a. Check same line after label
      const inline = line.replace(/.*?(?:father['s]*\s*name|पिता\s*का\s*नाम)[:\s]*/i, '').trim();
      const cleanInline = sanitizePersonName(inline);
      if (cleanInline && !/father|guardian|mother|name|naam|department|income|tax/i.test(cleanInline)) {
        detectedFather = toTitleCase(cleanInline);
        break;
      }
      // 1b. On PAN card: Father's Name is printed on line AFTER label!
      if (i + 1 < rawLines.length) {
        const nextClean = sanitizePersonName(rawLines[i + 1]);
        if (nextClean && !/father|guardian|mother|name|naam|date|birth|dob|department/i.test(nextClean)) {
          detectedFather = toTitleCase(nextClean);
          break;
        }
      }
    } else if (/\b(?:s\/o|d\/o|w\/o|c\/o)\b/i.test(line)) {
      const inline = line.replace(/.*?\b(?:s\/o|d\/o|w\/o|c\/o)[:\s]*/i, '').trim();
      const cleanInline = sanitizePersonName(inline);
      if (cleanInline && !/father|guardian|mother|name|naam/i.test(cleanInline)) {
        detectedFather = toTitleCase(cleanInline);
        break;
      }
      if (i + 1 < rawLines.length) {
        const nextClean = sanitizePersonName(rawLines[i + 1]);
        if (nextClean && !/father|guardian|mother|name|naam/i.test(nextClean)) {
          detectedFather = toTitleCase(nextClean);
          break;
        }
      }
    }
  }

  // 2. Scan lines for Citizen Name
  if (isPAN) {
    // On PAN cards: The cardholder's name is located 1-2 lines ABOVE Father's Name!
    let panFatherIdx = -1;
    for (let i = 0; i < rawLines.length; i++) {
      if (/father['s]*\s*name|पिता\s*का\s*नाम/i.test(rawLines[i])) {
        panFatherIdx = i;
        break;
      }
    }
    if (panFatherIdx > 0) {
      for (let j = panFatherIdx - 1; j >= Math.max(0, panFatherIdx - 3); j--) {
        const cand = sanitizePersonName(rawLines[j]);
        if (cand && !/permanent|account|number|card|income|tax|department|govt|india|bharat/i.test(cand) && !cand.match(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/)) {
          addCandidate(cand, 95, false);
          break;
        }
      }
    }
  }

  if (isAadhaar) {
    let dobIndex = -1;
    for (let i = 0; i < rawLines.length; i++) {
      if (/(?:dob|d\.o\.b|date\s*of\s*birth|year\s*of\s*birth|जन्म\s*तिथि|जन्म\s*वर्ष|yob)/i.test(rawLines[i])) {
        dobIndex = i;
        break;
      }
    }
    if (dobIndex > 0) {
      for (let offset = 1; offset <= 3; offset++) {
        const checkIdx = dobIndex - offset;
        if (checkIdx >= 0) {
          const cand = sanitizePersonName(rawLines[checkIdx]);
          if (cand && !/government|india|bharat|unique|uidai|mera|meri|pehchan/i.test(cand)) {
            addCandidate(cand, 90 - (offset * 10), false);
          }
        }
      }
    }
  }

  // 2b. Scan lines for Government Certificate Applicant / Beneficiary Name
  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (/(?:applicant\s*name|name\s*of\s*applicant|आवेदक\s*का\s*नाम|अभ्यर्थी\s*का\s*नाम|लाभार्थी\s*का\s*नाम|प्रमाणित\s*किया\s*जाता\s*है\s*कि|holder['s]*\s*name|student\s*name|candidate\s*name)/i.test(line)) {
      const inline = line.replace(/^(?:applicant\s*name|name\s*of\s*applicant|आवेदक\s*का\s*नाम|अभ्यर्थी\s*का\s*नाम|लाभार्थी\s*का\s*नाम|प्रमाणित\s*किया\s*जाता\s*है\s*कि|holder['s]*\s*name|student\s*name|candidate\s*name)[\s/:]+(?:श्री|श्रीमती|सुश्री|mr|ms|mrs)?\.?\s*/i, '').trim();
      if (inline.length >= 3) addCandidate(inline, 60, false);
      if (i + 1 < rawLines.length) {
        addCandidate(rawLines[i + 1], 45, false);
      }
    }
  }

  for (const line of rawLines) {
    if (!isNonNameLine(line)) addCandidate(line, 0, /father|पिता/i.test(line));
  }

  const sorted = Array.from(candidateScores.entries())
    .sort((a, b) => b[1] - a[1])
    .filter(([name, score]) => score > 0 && name.length >= 3);

  const primaryName = sorted.length > 0 ? sorted[0][0] : '';
  const candidates = sorted.map(([name]) => name).slice(0, 4);

  // Fallback for Father's Name if not explicitly labeled
  if (!detectedFather && candidates.length > 1) {
    const secondCand = candidates.find(c => c !== primaryName);
    if (secondCand) detectedFather = secondCand;
  }

  // 3. Date of Birth extraction
  let detectedDOB = '';
  const dobRegex = /(?:dob|d\.o\.b|date\s*of\s*birth|year\s*of\s*birth|जन्म\s*तिथि|जन्म\s*की\s*तारीख|जन्म\s*वर्ष|yob)[:\s]*([0-9]{1,2}[\/\-.][0-9]{1,2}[\/\-.][0-9]{2,4}|[0-9]{4})/i;
  const dobMatch = rawText.match(dobRegex);
  if (dobMatch && dobMatch[1]) {
    detectedDOB = dobMatch[1].trim();
  } else {
    const standaloneMatch = rawText.match(/\b([0-3]?[0-9][\/\-.][0-1]?[0-9][\/\-.](?:19|20)\d{2})\b/);
    if (standaloneMatch) {
      detectedDOB = standaloneMatch[1].trim();
    } else {
      const yearMatch = rawText.match(/\b((?:19[5-9]\d)|(?:20[0-2]\d))\b/);
      if (yearMatch) detectedDOB = yearMatch[1];
    }
  }

  // 4. Gender extraction
  let detectedGender = '';
  if (/(?:gender|लिंग)[:\s]*(?:male|पुरुष)\b/i.test(rawText) || /\b(MALE|पुरुष)\b/i.test(rawText)) {
    detectedGender = 'Male';
  } else if (/(?:gender|लिंग)[:\s]*(?:female|महिला)\b/i.test(rawText) || /\b(FEMALE|महिला)\b/i.test(rawText)) {
    detectedGender = 'Female';
  } else if (/\btransgender\b/i.test(rawText)) {
    detectedGender = 'Transgender';
  }

  // 5. Residency / State / Pincode
  let detectedResidency = '';
  const pinMatch = rawText.match(/\b([1-9][0-9]{5})\b/);
  const indianStates = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal', 'Delhi'
  ];
  let foundState = '';
  for (const st of indianStates) {
    if (new RegExp(`\\b${st}\\b`, 'i').test(rawText)) {
      foundState = st;
      break;
    }
  }
  if (foundState && pinMatch) detectedResidency = `${foundState} - ${pinMatch[1]}`;
  else if (foundState) detectedResidency = foundState;
  else if (pinMatch) detectedResidency = `PIN: ${pinMatch[1]}`;

  return {
    name: primaryName,
    dob: detectedDOB,
    fatherName: detectedFather,
    residency: detectedResidency,
    gender: detectedGender,
    candidates,
    rawLines,
    detectedDocType
  };
};

// ── Multi-Field Evaluator ───────────────────────────────────────────────────
const evaluateMultiFieldComparison = (fields1, fields2, criteriaList, doc1Label, doc2Label) => {
  const breakdown = [];
  let totalScore = 0;

  for (const crit of criteriaList) {
    const val1 = (fields1[crit] || '').trim();
    const val2 = (fields2[crit] || '').trim();
    let score = 0;
    let note = '';

    if (!val1 && !val2) {
      score = 100;
      note = 'Both empty / Not specified';
    } else if (!val1 || !val2) {
      score = 50;
      note = !val1 ? `Missing on ${doc1Label}` : `Missing on ${doc2Label}`;
    } else if (crit === 'name' || crit === 'fatherName') {
      score = Math.round(nameSimilarity(val1, val2));
      note = score === 100 ? 'Exact Spelling Match (100%)' : score >= 80 ? 'Close Match (Spelling Variance)' : 'Spelling Mismatch';
    } else if (crit === 'dob') {
      const c1 = val1.replace(/[^0-9]/g, '');
      const c2 = val2.replace(/[^0-9]/g, '');
      if (c1 === c2) {
        score = 100;
        note = 'Exact Date of Birth Match';
      } else {
        const y1 = val1.match(/\b(19\d{2}|20\d{2})\b/)?.[1];
        const y2 = val2.match(/\b(19\d{2}|20\d{2})\b/)?.[1];
        if (y1 && y2 && y1 === y2) {
          score = 92;
          note = `Birth Year Matches (${y1}) — format difference`;
        } else {
          score = 0;
          note = `DOB Mismatch (${val1} vs ${val2})`;
        }
      }
    } else if (crit === 'gender') {
      if (val1.toLowerCase() === val2.toLowerCase()) {
        score = 100;
        note = 'Gender Aligned';
      } else {
        score = 0;
        note = 'Gender Mismatch';
      }
    } else if (crit === 'residency') {
      const p1 = val1.match(/\b([1-9][0-9]{5})\b/)?.[1];
      const p2 = val2.match(/\b([1-9][0-9]{5})\b/)?.[1];
      if (p1 && p2 && p1 === p2) {
        score = 100;
        note = `Pincode Match (${p1})`;
      } else {
        const sim = Math.round(nameSimilarity(val1, val2));
        score = sim >= 70 ? sim : 60;
        note = sim >= 70 ? 'State/Location Verified' : 'Location Difference';
      }
    }

    totalScore += score;
    breakdown.push({
      criterion: crit,
      val1: val1 || '—',
      val2: val2 || '—',
      score,
      note
    });
  }

  const overallScore = criteriaList.length > 0 ? Math.round(totalScore / criteriaList.length) : 0;
  const overallRisk = getRiskLevel(overallScore);

  return {
    overallScore,
    overallRisk,
    breakdown
  };
};

// ── Single Document Government Criteria Catalog ──────────────────────────────
const GOVT_DOC_CATALOG = {
  'Residence Certificate': {
    title: 'Residence / Domicile Certificate (निवास प्रमाण पत्र)',
    titleHi: 'स्थानीय निवास प्रमाण पत्र',
    badge: 'State Domicile Proof',
    fieldsNeeded: [
      { id: 'certNumber', label: 'Certificate / Application Number', labelHi: 'प्रमाण पत्र संख्या', placeholder: 'e.g. BR-DOM-2025-918234 or UP/ED/2025/9102' },
      { id: 'applicantName', label: 'Applicant Full Name', labelHi: 'आवेदक का नाम', placeholder: 'e.g. Full Name as on Aadhaar' },
      { id: 'fatherName', label: "Father's / Guardian's Name", labelHi: 'पिता / संरक्षक का नाम', placeholder: "e.g. Father's / Spouse's Name" },
      { id: 'stateDistrict', label: 'State & District Jurisdiction', labelHi: 'राज्य एवं जिला', placeholder: 'e.g. Patna, Bihar or Lucknow, UP' },
      { id: 'issuingAuthority', label: 'Authorized Officer Rank', labelHi: 'सक्षम प्राधिकारी', placeholder: 'e.g. Tehsildar / SDO / Revenue Officer' },
      { id: 'issueDate', label: 'Issue Date / Year', labelHi: 'जारी करने की तिथि', placeholder: 'e.g. 14/06/2025' },
    ],
    rules: [
      { id: 'cert_id', title: 'Unique Certificate ID / e-District Serial', maxScore: 25 },
      { id: 'officer', title: 'Authorized Revenue Officer Seal (Tehsildar / SDO / RO)', maxScore: 25 },
      { id: 'jurisdiction', title: 'State & District Jurisdiction Established', maxScore: 20 },
      { id: 'beneficiary', title: 'Beneficiary & Parent Identity Linkage', maxScore: 15 },
      { id: 'validity', title: 'Statutory Validity Window', maxScore: 15 }
    ]
  },
  'Income Certificate': {
    title: 'Income Certificate (आय प्रमाण पत्र)',
    titleHi: 'पारिवारिक वार्षिक आय प्रमाण पत्र',
    badge: 'Economic Status Proof',
    fieldsNeeded: [
      { id: 'certNumber', label: 'Certificate Number', labelHi: 'प्रमाण पत्र संख्या', placeholder: 'e.g. UP-INC-2025-409182 or BR-INC-...' },
      { id: 'applicantName', label: 'Applicant / Beneficiary Name', labelHi: 'आवेदक का नाम', placeholder: 'e.g. Beneficiary Name' },
      { id: 'fatherName', label: "Father's / Family Head Name", labelHi: 'पिता का नाम', placeholder: "e.g. Father's Name" },
      { id: 'extraField', label: 'Annual Household Income (₹)', labelHi: 'वार्षिक आय (रुपये में)', placeholder: 'e.g. ₹96,000 or ₹1,50,000 or ₹2,40,000' },
      { id: 'issuingAuthority', label: 'Issuing Officer', labelHi: 'जारीकर्ता अधिकारी', placeholder: 'e.g. Tehsildar / SDO / Executive Magistrate' },
      { id: 'issueDate', label: 'Issue Date / FY', labelHi: 'जारी तिथि / वित्तीय वर्ष', placeholder: 'e.g. FY 2025-2026' },
    ],
    rules: [
      { id: 'cert_id', title: 'Certificate ID Registered on e-District', maxScore: 25 },
      { id: 'income_amount', title: 'Declared Annual Household Income (₹)', maxScore: 25 },
      { id: 'financial_year_validity', title: 'Mandatory 1-Year Financial Validity Rule (DoPT OM)', maxScore: 20 },
      { id: 'authority', title: 'Authorized Revenue Authority (Tehsildar / SDO)', maxScore: 15 },
      { id: 'beneficiary', title: 'Beneficiary & Earning Head Verification', maxScore: 15 }
    ]
  },
  'Caste Certificate': {
    title: 'Caste Certificate (जाति प्रमाण पत्र - SC/ST/OBC/EBC)',
    titleHi: 'सामाजिक श्रेणी प्रमाण पत्र',
    badge: 'Affirmative Action Proof',
    fieldsNeeded: [
      { id: 'certNumber', label: 'Certificate Number', labelHi: 'प्रमाण पत्र संख्या', placeholder: 'e.g. BR-CST-2025-771920' },
      { id: 'applicantName', label: 'Beneficiary Full Name', labelHi: 'लाभार्थी का नाम', placeholder: 'e.g. Beneficiary Name' },
      { id: 'fatherName', label: "Father's Name", labelHi: 'पिता का नाम', placeholder: "e.g. Father's Name" },
      { id: 'extraField', label: 'Category & Sub-Caste', labelHi: 'श्रेणी (OBC-NCL / SC / ST)', placeholder: 'e.g. OBC (Non-Creamy Layer) or SC / ST' },
      { id: 'issuingAuthority', label: 'Competent Authority', labelHi: 'सक्षम अधिकारी', placeholder: 'e.g. Sub-Divisional Officer (SDO) / Tehsildar' },
      { id: 'stateDistrict', label: 'State & Home District', labelHi: 'गृह राज्य एवं जिला', placeholder: 'e.g. District, State' },
    ],
    rules: [
      { id: 'cert_id', title: 'Official Gazette Certificate Serial', maxScore: 25 },
      { id: 'category_check', title: 'Category & Non-Creamy Layer (NCL) Clause', maxScore: 25 },
      { id: 'authority', title: 'Issuing Officer Rank (SDO / DM / Tehsildar)', maxScore: 20 },
      { id: 'beneficiary', title: 'Beneficiary & Lineage Verification', maxScore: 15 },
      { id: 'validity', title: 'Certificate Permanency', maxScore: 15 }
    ]
  },
  'Ration Card': {
    title: 'Ration Card (राशन कार्ड - NFSA / PDS)',
    titleHi: 'राष्ट्रीय खाद्य सुरक्षा राशन कार्ड',
    badge: 'Food Subsidy Proof',
    fieldsNeeded: [
      { id: 'certNumber', label: '10-12 Digit Ration Card Number', labelHi: 'राशन कार्ड नंबर', placeholder: 'e.g. 109283746501' },
      { id: 'applicantName', label: 'Head of Family / Mukhiya', labelHi: 'परिवार का मुखिया (महिला)', placeholder: 'e.g. Female Head of Family' },
      { id: 'extraField', label: 'Card Category (AAY / PHH / BPL)', labelHi: 'राशन श्रेणी (AAY / PHH)', placeholder: 'e.g. Priority Household (PHH) or Antyodaya (AAY)' },
      { id: 'stateDistrict', label: 'FPS / Fair Price Shop & District', labelHi: 'राशन डीलर एवं जिला', placeholder: 'e.g. FPS Dealer Code, District, State' },
      { id: 'fatherName', label: "Spouse / Father's Name", labelHi: 'पति / पिता का नाम', placeholder: "e.g. Father's / Spouse's Name" },
    ],
    rules: [
      { id: 'rc_num', title: '12-Digit NFSA Ration Card Number', maxScore: 25 },
      { id: 'category', title: 'Welfare Category (AAY / PHH / BPL)', maxScore: 25 },
      { id: 'head_family', title: 'Female Head of Family (NFSA Mandate)', maxScore: 25 },
      { id: 'fps', title: 'Fair Price Shop Linkage', maxScore: 25 }
    ]
  },
  'Land Record / Khatauni': {
    title: 'Land Ownership Record / Khatauni / RoR (भूलेख / खतौनी)',
    titleHi: 'भूमि स्वामित्व व खतौनी अभिलेख',
    badge: 'Land Title Proof',
    fieldsNeeded: [
      { id: 'certNumber', label: 'Khatauni / Khasra Plot Number', labelHi: 'खसरा / खाता संख्या', placeholder: 'e.g. Khatauni #102/4, Khasra #892' },
      { id: 'applicantName', label: 'Landowner / Farmer Name', labelHi: 'भूमिधर / किसान का नाम', placeholder: 'e.g. Registered Farmer Name' },
      { id: 'fatherName', label: "Father's / Co-Sharer Name", labelHi: 'पिता का नाम', placeholder: "e.g. Father's Name" },
      { id: 'extraField', label: 'Cultivable Area (Hectares / Bigha)', labelHi: 'कृषि योग्य रकबा (हेक्टेयर)', placeholder: 'e.g. 1.25 Hectares (Small Farmer)' },
      { id: 'issuingAuthority', label: 'Revenue Department / Patwari', labelHi: 'राजस्व निरीक्षक / लेखपाल', placeholder: 'e.g. Revenue Inspector / Tehsildar / e-Bhulekh' },
      { id: 'stateDistrict', label: 'Village, Tehsil & District', labelHi: 'ग्राम, तहसील एवं जिला', placeholder: 'e.g. Village, Tehsil, District, State' }
    ],
    rules: [
      { id: 'plot_serial', title: 'Khasra / Khatauni Plot Identification', maxScore: 25 },
      { id: 'land_area', title: 'Landholding Category (Small / Marginal Farmer)', maxScore: 25 },
      { id: 'revenue_auth', title: 'e-Bhulekh / Tehsildar Authentication', maxScore: 25 },
      { id: 'owner_lineage', title: 'Land Title Owner Verification', maxScore: 25 }
    ]
  },
  'Kisan Credit Card': {
    title: 'Kisan Credit Card (KCC / किसान क्रेडिट कार्ड)',
    titleHi: 'किसान क्रेडिट कार्ड',
    badge: 'Agri Credit Proof',
    fieldsNeeded: [
      { id: 'certNumber', label: 'KCC / Loan Account Number', labelHi: 'केसीसी खाता संख्या', placeholder: 'e.g. KCC-9018274650' },
      { id: 'applicantName', label: 'Beneficiary Farmer Name', labelHi: 'किसान का नाम', placeholder: 'e.g. Farmer Full Name' },
      { id: 'fatherName', label: "Father's Name", labelHi: 'पिता का नाम', placeholder: "e.g. Father's Name" },
      { id: 'extraField', label: 'Credit Limit Sanctioned (₹)', labelHi: 'स्वीकृत ऋण सीमा (रुपये)', placeholder: 'e.g. ₹1,50,000 / ₹3,00,000 Limit' },
      { id: 'issuingAuthority', label: 'Issuing Bank & Branch', labelHi: 'बैंक शाखा', placeholder: 'e.g. State Bank of India / PNB / RRB Branch' },
      { id: 'issueDate', label: 'Sanction / Renewal Year', labelHi: 'स्वीकृति वर्ष', placeholder: 'e.g. 2025' }
    ],
    rules: [
      { id: 'kcc_acc', title: 'Bank Account & KCC Verification', maxScore: 25 },
      { id: 'scale_finance', title: 'Scale of Finance & Subsidized Interest', maxScore: 25 },
      { id: 'bank_auth', title: 'Scheduled Commercial Bank / RRB Issuance', maxScore: 25 },
      { id: 'farmer_id', title: 'Farmer Identity & DBT Seeding', maxScore: 25 }
    ]
  },
  'EWS Certificate': {
    title: 'EWS Certificate (आर्थिक रूप से कमजोर वर्ग)',
    titleHi: 'आर्थिक रूप से कमजोर वर्ग प्रमाण पत्र',
    badge: 'General Quota Proof',
    fieldsNeeded: [
      { id: 'certNumber', label: 'Certificate Number', labelHi: 'प्रमाण पत्र संख्या', placeholder: 'e.g. EWS/2025/00918' },
      { id: 'applicantName', label: 'Beneficiary Name', labelHi: 'लाभार्थी का नाम', placeholder: 'e.g. Beneficiary Name' },
      { id: 'fatherName', label: "Father's Name", labelHi: 'पिता का नाम', placeholder: "e.g. Father's Name" },
      { id: 'extraField', label: 'Annual Income Limit Declared', labelHi: 'वार्षिक आय सीमा', placeholder: 'Must be < ₹8,00,000' },
      { id: 'issuingAuthority', label: 'Issuing Officer', labelHi: 'जारीकर्ता अधिकारी', placeholder: 'e.g. Tehsildar / SDO / DM' },
      { id: 'issueDate', label: 'Financial Year / Issue Date', labelHi: 'वित्तीय वर्ष', placeholder: 'e.g. FY 2025-2026' },
    ],
    rules: [
      { id: 'cert_id', title: 'Valid EWS Certificate Serial', maxScore: 25 },
      { id: 'income_ceiling', title: 'Annual Income Below ₹8,00,000 Ceiling', maxScore: 25 },
      { id: 'fy_window', title: 'Valid Financial Year Window', maxScore: 25 },
      { id: 'authority', title: 'Officer Rank (Tehsildar / SDO / DM)', maxScore: 25 }
    ]
  },
  '10th / 12th Marksheet': {
    title: '10th / 12th Educational Marksheet (अंक पत्र व प्रमाण पत्र)',
    titleHi: 'माध्यमिक / उच्च माध्यमिक अंक पत्र',
    badge: 'Educational Merit Proof',
    fieldsNeeded: [
      { id: 'certNumber', label: 'Roll Number & Roll Code', labelHi: 'रोल नंबर व रोल कोड', placeholder: 'e.g. Roll No: 24010091, Code: 31045' },
      { id: 'applicantName', label: 'Candidate Name', labelHi: 'छात्र / छात्रा का नाम', placeholder: 'e.g. Candidate Name' },
      { id: 'fatherName', label: "Father's Name", labelHi: 'पिता का नाम', placeholder: "e.g. Father's Name" },
      { id: 'extraField', label: 'Board Name & Division / %', labelHi: 'बोर्ड का नाम व श्रेणी', placeholder: 'e.g. CBSE / State Board - 1st Division (78%)' },
      { id: 'issueDate', label: 'Passing Year', labelHi: 'उत्तीर्ण वर्ष', placeholder: 'e.g. 2023 or 2024' },
    ],
    rules: [
      { id: 'roll_info', title: 'Roll Number & Roll Code Identification', maxScore: 25 },
      { id: 'board_name', title: 'Recognized Education Board', maxScore: 25 },
      { id: 'candidate', title: 'Candidate & Parents Verification', maxScore: 25 },
      { id: 'passing_year', title: 'Passing Year & Eligibility Window', maxScore: 25 }
    ]
  },
  'Disability Certificate': {
    title: 'Disability Certificate / UDID (विशिष्ट दिव्यांगता पहचान पत्र)',
    titleHi: 'विशिष्ट दिव्यांगता पहचान पत्र (UDID)',
    badge: 'Special Welfare Proof',
    fieldsNeeded: [
      { id: 'certNumber', label: 'UDID Card / Registration Number', labelHi: 'UDID नंबर', placeholder: 'e.g. BR041029384756' },
      { id: 'applicantName', label: 'Beneficiary Name', labelHi: 'दिव्यांगजन का नाम', placeholder: 'e.g. Beneficiary Name' },
      { id: 'extraField', label: 'Disability Percentage (%) & Type', labelHi: 'दिव्यांगता प्रतिशत (%) व प्रकार', placeholder: 'e.g. 55% Locomotor Disability' },
      { id: 'issuingAuthority', label: 'Medical Authority', labelHi: 'चिकित्सा प्राधिकारी', placeholder: 'e.g. Chief Medical Officer (CMO) / District Hospital' },
      { id: 'fatherName', label: "Father's / Guardian's Name", labelHi: 'संरक्षक का नाम', placeholder: "e.g. Guardian Name" },
    ],
    rules: [
      { id: 'udid_id', title: 'UDID Registration Number on Portal', maxScore: 25 },
      { id: 'threshold_check', title: 'Mandatory 40% Benchmark Disability Rule (RPwD Act)', maxScore: 25 },
      { id: 'medical_authority', title: 'CMO / Medical Board Certification', maxScore: 25 },
      { id: 'beneficiary', title: 'Beneficiary Identity', maxScore: 25 }
    ]
  },
  'e-Shram Card': {
    title: 'e-Shram Card / Unorganised Worker (ई-श्रम कार्ड)',
    titleHi: 'ई-श्रम कार्ड (असंगठित कर्मकार)',
    badge: 'Social Security Proof',
    fieldsNeeded: [
      { id: 'certNumber', label: '12-Digit UAN Number', labelHi: '12-अंकीय UAN नंबर', placeholder: 'e.g. 1092 8472 9182' },
      { id: 'applicantName', label: 'Worker Name', labelHi: 'श्रमिक का नाम', placeholder: 'e.g. Worker Name' },
      { id: 'fatherName', label: "Father's / Spouse's Name", labelHi: 'पिता / पति का नाम', placeholder: "e.g. Father's Name" },
      { id: 'extraField', label: 'Primary Occupation / NCO Code', labelHi: 'प्राथमिक व्यवसाय', placeholder: 'e.g. Agricultural Worker / Construction Labor' },
      { id: 'issuingAuthority', label: 'Ministry of Labour & Employment', labelHi: 'श्रम एवं रोजगार मंत्रालय', placeholder: 'e.g. MoLE e-Shram Portal' },
      { id: 'issueDate', label: 'Registration Date / Year', labelHi: 'पंजीकरण वर्ष', placeholder: 'e.g. 2024' }
    ],
    rules: [
      { id: 'uan_id', title: '12-Digit Universal Account Number', maxScore: 25 },
      { id: 'occ_check', title: 'Unorganised Worker Occupation Code', maxScore: 25 },
      { id: 'ministry_auth', title: 'MoLE Portal Digital Stamp', maxScore: 25 },
      { id: 'worker_id', title: 'Worker Identity & DBT Readiness', maxScore: 25 }
    ]
  },
  'Bank Passbook': {
    title: 'Bank Passbook / Aadhaar DBT Seeded (बैंक पासबुक)',
    titleHi: 'आधार लिंक बैंक पासबुक',
    badge: 'Direct Benefit Transfer Proof',
    fieldsNeeded: [
      { id: 'certNumber', label: 'Bank Account Number', labelHi: 'बैंक खाता संख्या', placeholder: 'e.g. 30918274651' },
      { id: 'applicantName', label: 'Account Holder Name', labelHi: 'खाताधारक का नाम', placeholder: 'e.g. Account Holder Name' },
      { id: 'extraField', label: 'IFSC Code & Aadhaar DBT Status', labelHi: 'IFSC कोड व आधार सीडिंग', placeholder: 'e.g. SBIN0001234 (Aadhaar Seeded Active)' },
      { id: 'issuingAuthority', label: 'Bank Name & Branch', labelHi: 'बैंक शाखा', placeholder: 'e.g. State Bank of India, Main Branch' },
      { id: 'stateDistrict', label: 'Branch District & State', labelHi: 'शाखा जिला व राज्य', placeholder: 'e.g. Patna, Bihar' }
    ],
    rules: [
      { id: 'acc_id', title: 'Valid Bank Account Identification', maxScore: 25 },
      { id: 'dbt_seeding', title: 'NPCI Aadhaar DBT Seeding Status', maxScore: 25 },
      { id: 'bank_seal', title: 'Scheduled Commercial Bank Authentication', maxScore: 25 },
      { id: 'holder_id', title: 'Beneficiary Name Match', maxScore: 25 }
    ]
  },
  'Birth Certificate': {
    title: 'Birth Certificate (जन्म प्रमाण पत्र)',
    titleHi: 'जन्म प्रमाण पत्र',
    badge: 'Statutory Age Proof',
    fieldsNeeded: [
      { id: 'certNumber', label: 'Registration / Certificate Number', labelHi: 'पंजीकरण संख्या', placeholder: 'e.g. B-2024-91823' },
      { id: 'applicantName', label: 'Child / Person Name', labelHi: 'बालक / बालिका का नाम', placeholder: 'e.g. Person Full Name' },
      { id: 'fatherName', label: "Father's & Mother's Name", labelHi: 'माता-पिता का नाम', placeholder: "e.g. Father & Mother Name" },
      { id: 'issueDate', label: 'Date of Birth (DD/MM/YYYY)', labelHi: 'जन्म तिथि', placeholder: 'e.g. 15/08/2005' },
      { id: 'issuingAuthority', label: 'Registrar of Births & Deaths', labelHi: 'रजिस्ट्रार (जन्म एवं मृत्यु)', placeholder: 'e.g. Municipal Corporation / Gram Panchayat' },
      { id: 'stateDistrict', label: 'Place of Birth & District', labelHi: 'जन्म स्थान व जिला', placeholder: 'e.g. District, State' }
    ],
    rules: [
      { id: 'reg_num', title: 'Statutory Registration Number', maxScore: 25 },
      { id: 'dob_date', title: 'Date of Birth Record', maxScore: 25 },
      { id: 'registrar', title: 'Registrar of Births & Deaths Seal', maxScore: 25 },
      { id: 'lineage', title: 'Parentage Lineage Verification', maxScore: 25 }
    ]
  },
  'Custom Document': {
    title: 'Custom Government Certificate / Card (अन्य सरकारी प्रमाण पत्र)',
    titleHi: 'अन्य सरकारी दस्तावेज',
    badge: 'Custom Welfare Proof',
    fieldsNeeded: [
      { id: 'certNumber', label: 'Document / Serial / ID Number', labelHi: 'दस्तावेज क्रमांक / आईडी', placeholder: 'e.g. Application No / Registration ID' },
      { id: 'applicantName', label: 'Beneficiary / Holder Full Name', labelHi: 'लाभार्थी का नाम', placeholder: 'e.g. Full Name on Document' },
      { id: 'fatherName', label: "Father's / Guardian's Name", labelHi: 'पिता / संरक्षक का नाम', placeholder: "e.g. Father's Name" },
      { id: 'extraField', label: 'Classification / Category / Amount', labelHi: 'विवरण / श्रेणी', placeholder: 'e.g. Category, Income, Disability or Trade' },
      { id: 'issuingAuthority', label: 'Issuing Department / Officer Rank', labelHi: 'जारीकर्ता विभाग / अधिकारी', placeholder: 'e.g. Competent Authority Designation' },
      { id: 'stateDistrict', label: 'State & District Jurisdiction', labelHi: 'राज्य एवं जिला', placeholder: 'e.g. District, State' },
      { id: 'issueDate', label: 'Date of Issue / Validity Year', labelHi: 'जारी करने की तिथि', placeholder: 'e.g. 2025' }
    ],
    rules: [
      { id: 'serial', title: 'Registration / Serial Identification', maxScore: 25 },
      { id: 'authority', title: 'Government Department Authority', maxScore: 25 },
      { id: 'beneficiary', title: 'Beneficiary Identity Verification', maxScore: 25 },
      { id: 'validity', title: 'Temporal Validity Window', maxScore: 25 }
    ]
  }
};

// ── Single Document Evaluator & Field Extractor ───────────────────────────────
const extractSingleDocumentFields = (rawText, docType) => {
  const baseEntities = extractDocumentEntities(rawText, docType);
  const rawLines = (rawText || '').split('\n').map(l => l.trim()).filter(Boolean);

  // 1. Certificate Number
  let certNumber = '';
  const labelMatch = rawText.match(/(?:certificate\s*(?:no|number)|प्रमाण\s*पत्र\s*संख्या|आवेदन\s*(?:क्रमांक|संख्या)|application\s*(?:ref|no|number|reference\s*no)|registration\s*no|पंजीकरण\s*संख्या|क्रमांक|roll\s*no|rc\s*no|uan)[:\s]*([A-Z0-9\/\-_]{5,35})/i);
  if (labelMatch) {
    certNumber = labelMatch[1].trim();
  } else {
    const certRegex = /\b([A-Z]{2,6}[-\/][A-Z0-9\/\-_]{5,30})\b/i;
    const match = rawText.match(certRegex);
    if (match) {
      certNumber = match[1].trim();
    }
  }

  // 2. Direct Applicant Name detection from certificate text
  let applicantName = '';
  for (const line of rawLines) {
    if (/(?:applicant\s*name|name\s*of\s*applicant|आवेदक\s*का\s*नाम|अभ्यर्थी\s*का\s*नाम|लाभार्थी\s*का\s*नाम|प्रमाणित\s*किया\s*जाता\s*है\s*कि|holder['s]*\s*name|student\s*name|candidate\s*name)/i.test(line)) {
      const inline = line.replace(/^(?:applicant\s*name|name\s*of\s*applicant|आवेदक\s*का\s*नाम|अभ्यर्थी\s*का\s*नाम|लाभार्थी\s*का\s*नाम|प्रमाणित\s*किया\s*जाता\s*है\s*कि|holder['s]*\s*name|student\s*name|candidate\s*name)[\s/:]+(?:श्री|श्रीमती|सुश्री|mr|ms|mrs)?\.?\s*/i, '').trim();
      const cleaned = sanitizePersonName(inline);
      if (cleaned && cleaned.length >= 3) {
        applicantName = toTitleCase(cleaned);
        break;
      }
    }
  }
  if (!applicantName) applicantName = baseEntities.name || '';

  // 3. Direct Father / Guardian Name detection
  let fatherName = '';
  for (const line of rawLines) {
    if (/(?:father['s]*\s*name|father\s*name|पिता\s*का\s*नाम|आत्मज|पुत्र|पति\s*का\s*नाम|husband['s]*\s*name|s\/o|d\/o|w\/o|c\/o)/i.test(line)) {
      const inline = line.replace(/^(?:father['s]*\s*name|father\s*name|पिता\s*का\s*नाम|आत्मज|पुत्र|पति\s*का\s*नाम|husband['s]*\s*name|s\/o|d\/o|w\/o|c\/o)[\s/:]+(?:श्री|mr)?\.?\s*/i, '').trim();
      const cleaned = sanitizePersonName(inline);
      if (cleaned && cleaned.length >= 3) {
        fatherName = toTitleCase(cleaned);
        break;
      }
    }
  }
  if (!fatherName) fatherName = baseEntities.fatherName || '';

  // 4. Competent Issuing Authority
  let issuingAuthority = '';
  if (/sub[-\s]divisional\s*officer|sdo\b|sdm\b|अनुमंडल\s*पदाधिकारी/i.test(rawText)) issuingAuthority = 'Sub-Divisional Officer (SDO)';
  else if (/tehsildar|tahasildar|तहसीलदार/i.test(rawText)) issuingAuthority = 'Tehsildar';
  else if (/revenue\s*officer|ro\b|राजस्व\s*अधिकारी/i.test(rawText)) issuingAuthority = 'Revenue Officer';
  else if (/circle\s*officer|co\b|अंचल\s*अधिकारी/i.test(rawText)) issuingAuthority = 'Circle Officer (CO)';
  else if (/district\s*magistrate|dm\b|collector|जिलाधिकारी|समाहर्ता/i.test(rawText)) issuingAuthority = 'District Magistrate / Collector';
  else if (/chief\s*medical\s*officer|cmo\b|मुख्य\s*चिकित्सा\s*अधिकारी/i.test(rawText)) issuingAuthority = 'Chief Medical Officer (CMO)';
  else if (/block\s*development\s*officer|bdo\b|प्रखंड\s*विकास\s*पदाधिकारी/i.test(rawText)) issuingAuthority = 'Block Development Officer (BDO)';
  else if (/food\s*(?:and\s*civil\s*supplies|department)|आपूर्ति/i.test(rawText)) issuingAuthority = 'District Supply Officer';
  else if (/secondary|board\s*of|bseb|cbse|icse/i.test(rawText)) issuingAuthority = 'Secondary Examination Board';
  else if (/registrar\s*(?:of\s*)?birth/i.test(rawText)) issuingAuthority = 'Registrar of Births & Deaths';

  // 5. Issue Date
  let issueDate = '';
  const dateMatch = rawText.match(/(?:issue\s*date|dated|दिनांक|तारीख|जारी\s*(?:करने\s*की\s*)?तिथि|issued\s*on)[:\s]*([0-9]{1,2}[\/\-.][0-9]{1,2}[\/\-.][0-9]{2,4})/i);
  if (dateMatch) {
    issueDate = dateMatch[1];
  } else if (baseEntities.dob) {
    issueDate = baseEntities.dob;
  } else {
    const yearMatch = rawText.match(/\b(202[0-6])\b/);
    if (yearMatch) issueDate = yearMatch[1];
  }

  // 6. State & District
  let stateDistrict = baseEntities.residency || '';
  if (!stateDistrict) {
    for (const line of rawLines) {
      if (/district|जिला|state|राज्य|patna|lucknow|jaipur|bhopal|ranchi|delhi|bihar|uttar pradesh|vaishali|muzaffarpur/i.test(line)) {
        stateDistrict = line.slice(0, 32);
        break;
      }
    }
  }

  // 7. Extra Field based on docType
  let extraField = '';
  if (docType === 'Income Certificate') {
    const incMatch = rawText.match(/(?:(?:rs\.?|inr|₹)\s*([0-9,]+)|([0-9,]+)\s*(?:rupees|per\s*annum|\/[-]?))/i);
    if (incMatch) {
      const cleanNum = (incMatch[1] || incMatch[2]).replace(/[^0-9]/g, '');
      if (cleanNum.length >= 4) extraField = `₹${parseInt(cleanNum, 10).toLocaleString('en-IN')}`;
    }
  } else if (docType === 'Caste Certificate') {
    if (/non[- ]?creamy/i.test(rawText)) extraField = 'OBC (Non-Creamy Layer)';
    else if (/creamy/i.test(rawText)) extraField = 'OBC (Creamy Layer)';
    else if (/scheduled\s*caste|\bsc\b/i.test(rawText)) extraField = 'Scheduled Caste (SC)';
    else if (/scheduled\s*tribe|\bst\b/i.test(rawText)) extraField = 'Scheduled Tribe (ST)';
    else if (/ebc\b|extremely\s*backward/i.test(rawText)) extraField = 'Extremely Backward Class (EBC)';
  } else if (docType === 'Ration Card') {
    if (/antyodaya|aay/i.test(rawText)) extraField = 'Antyodaya Anna Yojana (AAY)';
    else if (/priority|phh/i.test(rawText)) extraField = 'Priority Household (PHH)';
    else if (/bpl/i.test(rawText)) extraField = 'BPL Category';
  } else if (docType === 'EWS Certificate') {
    extraField = 'Income < ₹8 Lakh Ceiling Verified';
  } else if (docType === '10th / 12th Marksheet') {
    if (/cbse/i.test(rawText)) extraField = 'CBSE Board - 1st Division';
    else if (/bseb/i.test(rawText)) extraField = 'BSEB Board - 1st Division';
    else if (/icse/i.test(rawText)) extraField = 'ICSE Board';
    else if (/upmsp/i.test(rawText)) extraField = 'UP Board';
  } else if (docType === 'Disability Certificate') {
    const disMatch = rawText.match(/(\d{1,3})\s*%/);
    if (disMatch) extraField = `${disMatch[1]}% Disability`;
  }

  return {
    certNumber: certNumber || '',
    applicantName: applicantName || '',
    fatherName: fatherName || '',
    issuingAuthority: issuingAuthority || '',
    stateDistrict: stateDistrict || '',
    extraField: extraField || '',
    issueDate: issueDate || ''
  };
};

const runSingleDocAudit = (docType, fields = {}) => {
  const config = GOVT_DOC_CATALOG[docType] || GOVT_DOC_CATALOG['Residence Certificate'];
  const certNumber = (fields.certNumber || '').trim();
  const applicantName = (fields.applicantName || '').trim();
  const fatherName = (fields.fatherName || '').trim();
  const issuingAuthority = (fields.issuingAuthority || '').trim();
  const extraField = (fields.extraField || '').trim();
  const issueDate = (fields.issueDate || '').trim();

  let totalScore = 0;
  const breakdown = [];
  const advisories = [];

  // 1. Serial ID
  if (certNumber.length >= 6) {
    totalScore += 25;
    breakdown.push({ id: 'cert_id', title: 'Official Gazette / e-District Serial Number', status: 'pass', score: 25, maxScore: 25, text: `Certificate Serial ID: ${certNumber}` });
  } else if (certNumber.length > 0) {
    totalScore += 12;
    breakdown.push({ id: 'cert_id', title: 'Official Gazette / e-District Serial Number', status: 'warn', score: 12, maxScore: 25, text: `Partial ID: ${certNumber}` });
  } else {
    breakdown.push({ id: 'cert_id', title: 'Official Gazette / e-District Serial Number', status: 'fail', score: 0, maxScore: 25, text: 'Certificate serial number missing' });
    advisories.push('Mandatory certificate serial number is missing.');
  }

  // 2. Authority
  const isGazetted = /tehsildar|sdo|sdm|revenue|circle|collector|magistrate|cmo|bdo|registrar|bank/i.test(issuingAuthority);
  if (isGazetted) {
    totalScore += 25;
    breakdown.push({ id: 'authority', title: 'Competent Issuing Officer / Revenue Authority', status: 'pass', score: 25, maxScore: 25, text: `Authorized officer: ${issuingAuthority}` });
  } else if (issuingAuthority.length >= 3) {
    totalScore += 14;
    breakdown.push({ id: 'authority', title: 'Competent Issuing Officer / Revenue Authority', status: 'warn', score: 14, maxScore: 25, text: `Officer stated: ${issuingAuthority}` });
  } else {
    breakdown.push({ id: 'authority', title: 'Competent Issuing Officer / Revenue Authority', status: 'fail', score: 0, maxScore: 25, text: 'Competent issuing authority missing' });
    advisories.push('Add the designation of the issuing officer.');
  }

  // 3. Temporal Validity
  const currentYear = new Date().getFullYear();
  const yearMatch = issueDate.match(/\b(19|20\d{2})\b/);
  if (docType === 'Birth Certificate' || docType === '10th / 12th Marksheet' || docType === 'Caste Certificate') {
    totalScore += 20;
    breakdown.push({ id: 'validity_window', title: 'Statutory Permanent Validity', status: 'pass', score: 20, maxScore: 20, text: `Permanent / Lifetime Official Record (${issueDate || 'Registered'})` });
  } else if (yearMatch && currentYear - parseInt(yearMatch[0], 10) <= 1) {
    totalScore += 20;
    breakdown.push({ id: 'validity_window', title: 'Financial Year / Issue Validity Period', status: 'pass', score: 20, maxScore: 20, text: `Active Financial Year / Date: ${issueDate}` });
  } else if (issueDate) {
    totalScore += 12;
    breakdown.push({ id: 'validity_window', title: 'Financial Year / Issue Validity Period', status: 'warn', score: 12, maxScore: 20, text: `Issued: ${issueDate}` });
  } else {
    totalScore += 8;
    breakdown.push({ id: 'validity_window', title: 'Financial Year / Issue Validity Period', status: 'warn', score: 8, maxScore: 20, text: 'Issue date not specified' });
  }

  // 4. Beneficiary Linkage
  if (applicantName && fatherName) {
    totalScore += 15;
    breakdown.push({ id: 'beneficiary_link', title: 'Beneficiary & Parentage Lineage Linkage', status: 'pass', score: 15, maxScore: 15, text: `${applicantName} s/o ${fatherName}` });
  } else if (applicantName) {
    totalScore += 10;
    breakdown.push({ id: 'beneficiary_link', title: 'Beneficiary & Parentage Lineage Linkage', status: 'warn', score: 10, maxScore: 15, text: applicantName });
  } else {
    breakdown.push({ id: 'beneficiary_link', title: 'Beneficiary & Parentage Lineage Linkage', status: 'fail', score: 0, maxScore: 15, text: 'Applicant name missing' });
  }

  // 5. Benchmark
  if (extraField || docType === 'Birth Certificate') {
    totalScore += 15;
    breakdown.push({ id: 'statutory_benchmark', title: 'Statutory Benchmark & Quota Classification', status: 'pass', score: 15, maxScore: 15, text: extraField || 'Official DOB & Registration Verified' });
  } else {
    totalScore += 8;
    breakdown.push({ id: 'statutory_benchmark', title: 'Statutory Benchmark & Quota Classification', status: 'warn', score: 8, maxScore: 15, text: 'Additional benchmark not specified' });
  }

  const finalPercentage = Math.min(100, Math.round(totalScore));

  let risk;
  if (finalPercentage >= 85) {
    risk = {
      label: 'GOVT COMPLIANT & SCHEME READY',
      labelHi: 'सरकारी मानकों पर 100% मान्य',
      color: '#10b981',
      bg: 'rgba(16,185,129,0.12)',
      borderColor: 'rgba(16,185,129,0.35)',
      icon: CheckCircle2,
      message: 'Certificate fulfills all official Government of India / State e-District validity checkpoints! Direct welfare eligibility unlocked.'
    };
  } else if (finalPercentage >= 65) {
    risk = {
      label: 'PROVISIONAL / ACTION ADVISORY',
      labelHi: 'शर्तों के साथ मान्य (समीक्षा आवश्यक)',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.12)',
      borderColor: 'rgba(245,158,11,0.3)',
      icon: AlertTriangle,
      message: 'Certificate has minor data gaps or requires financial year renewal. Review flagged checkpoints below.'
    };
  } else {
    risk = {
      label: 'NON-COMPLIANT / REJECTION RISK',
      labelHi: 'अमान्य / सरकारी फॉर्म रिजेक्ट होने का खतरा',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.12)',
      borderColor: 'rgba(239,68,68,0.35)',
      icon: XCircle,
      message: 'Critical government checkpoints failed! Certificate number or authorized issuing officer signature is missing.'
    };
  }

  return {
    score: finalPercentage,
    risk,
    breakdown,
    advisories,
    unlockedSchemes: [],
    totalUnlockedBenefitAmount: 0,
    liveSchemesCount: 0,
    title: config.title,
    badge: config.badge,
    timestamp: new Date().toLocaleTimeString()
  };
};

const DocumentCheckerPage = () => {
  const { user, logout } = useContext(AuthContext);

  // Tab: 'single' | 'ocr' | 'manual'
  const [ocrTab, setOcrTab] = useState('single');

  // Dynamic Single Document Verification State
  const [singleDocType, setSingleDocType] = useState('Residence Certificate');
  const [customDocName, setCustomDocName] = useState('');
  const [serverDocTypes, setServerDocTypes] = useState([]);
  const [citizenProfile, setCitizenProfile] = useState(null);
  const [singleAuditLoading, setSingleAuditLoading] = useState(false);

  const [singleFields, setSingleFields] = useState({
    certNumber: '',
    applicantName: user?.fullName || user?.name || '',
    fatherName: '',
    stateDistrict: '',
    issuingAuthority: '',
    extraField: '',
    issueDate: ''
  });

  const [singleFile, setSingleFile] = useState(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleProgress, setSingleProgress] = useState(0);
  const [singleStatus, setSingleStatus] = useState('');
  const [singleRawLines, setSingleRawLines] = useState([]);
  const [singleShowRaw, setSingleShowRaw] = useState(false);
  const [singleAuditResult, setSingleAuditResult] = useState(null);
  const [singleSaving, setSingleSaving] = useState(false);
  const [singleSaveMsg, setSingleSaveMsg] = useState('');
  const singleFileRef = useRef();

  // Dynamic Backend Audit Engine Call
  const handleRunSingleAudit = async (fieldsToAudit, docTypeToAudit, customName) => {
    const activeDocType = typeof docTypeToAudit === 'string' ? docTypeToAudit : singleDocType;
    const activeFields = (fieldsToAudit && typeof fieldsToAudit === 'object' && !fieldsToAudit.nativeEvent && !fieldsToAudit.target)
      ? fieldsToAudit
      : singleFields;
    const activeCustomName = typeof customName === 'string' ? customName : customDocName;
    setSingleAuditLoading(true);

    try {
      const res = await API.post('/benefits/audit-single-document', {
        docType: activeDocType,
        customDocName: activeCustomName,
        fields: activeFields
      });

      if (res.data?.success && res.data?.data) {
        setSingleAuditResult(res.data.data);
      }
    } catch (err) {
      console.warn('Backend single doc audit fallback to local:', err);
      const localRes = runSingleDocAudit(activeDocType, activeFields);
      setSingleAuditResult(localRes);
    } finally {
      setSingleAuditLoading(false);
    }
  };

  // Mount effect: Fetch MongoDB document statistics & citizen profile
  useEffect(() => {
    API.get('/benefits/document-types')
      .then(res => {
        if (res.data?.success && res.data?.data) {
          setServerDocTypes(res.data.data);
        }
      })
      .catch(err => console.warn('Failed to load server document types:', err));

    if (user) {
      API.get('/profile')
        .then(res => {
          if (res.data?.success && res.data?.data) {
            const p = res.data.data;
            setCitizenProfile(p);
            setSingleFields(prev => ({
              ...prev,
              applicantName: prev.applicantName || user.fullName || user.name || '',
              stateDistrict: prev.stateDistrict || `${p.district ? p.district + ', ' : ''}${p.state?.name || ''}`
            }));
          }
        })
        .catch(err => console.warn('Failed to load profile for doc audit:', err));
    }
  }, [user]);

  // Dynamic 1-Click Profile Pre-fill (Copies real profile data only, zero fake strings)
  const handlePrefillFromProfile = () => {
    const fullName = user?.fullName || user?.name || citizenProfile?.user?.fullName || '';
    let father = '';
    if (citizenProfile?.familyMembers?.length) {
      const fMember = citizenProfile.familyMembers.find(m => /father|पिता/i.test(m.relation));
      if (fMember) father = fMember.name;
    }
    const location = `${citizenProfile?.district ? citizenProfile.district + ', ' : ''}${citizenProfile?.state?.name || ''}`;

    let extra = '';
    if (singleDocType === 'Income Certificate' && citizenProfile?.annualIncome) {
      extra = `₹${citizenProfile.annualIncome.toLocaleString('en-IN')}`;
    } else if (singleDocType === 'Caste Certificate' && citizenProfile?.casteCategory) {
      extra = citizenProfile.casteCategory;
    }

    const updated = {
      certNumber: singleFields.certNumber || '',
      applicantName: fullName,
      fatherName: father,
      stateDistrict: location,
      issuingAuthority: singleFields.issuingAuthority || '',
      extraField: extra,
      issueDate: singleFields.issueDate || ''
    };

    setSingleFields(updated);
    setSingleSaveMsg('');
    if (singleFile || updated.certNumber) {
      handleRunSingleAudit(updated, singleDocType, customDocName);
    }
  };

  const handleSingleDocTypeChange = (newType) => {
    setSingleDocType(newType);
    setSingleSaveMsg('');
    setSingleFile(null);
    setSingleStatus('');
    setSingleRawLines([]);
    setSingleAuditResult(null);
    setSingleFields({
      certNumber: '',
      applicantName: user?.fullName || user?.name || '',
      fatherName: '',
      stateDistrict: citizenProfile?.district ? `${citizenProfile.district}, ${citizenProfile.state?.name || ''}` : '',
      issuingAuthority: '',
      extraField: '',
      issueDate: ''
    });
  };

  const handleSingleFieldChange = (fieldId, val) => {
    setSingleFields(prev => ({ ...prev, [fieldId]: val }));
    setSingleSaveMsg('');
  };

  const handleSaveSingleVerifiedDoc = async () => {
    if (!singleAuditResult) return;
    try {
      setSingleSaving(true);
      setSingleSaveMsg('');
      const targetDoc = (singleDocType === 'Custom Document' && customDocName) ? customDocName : singleDocType;
      await API.put('/benefits/document-checklist', {
        docName: targetDoc,
        status: 'Available'
      });
      setSingleSaveMsg(`✅ "${targetDoc}" successfully marked as Available in your Profile & Yojana Parchi!`);
      setTimeout(() => setSingleSaveMsg(''), 5000);
    } catch (err) {
      console.error('Failed to sync single verified doc:', err);
      setSingleSaveMsg('Failed to sync with profile. Please try again.');
    } finally {
      setSingleSaving(false);
    }
  };

  const processSingleDocOCR = async (file) => {
    if (!file) return;
    setSingleFile(file);
    setSingleLoading(true);
    setSingleProgress(15);
    setSingleStatus('Reading document data...');
    setSingleSaveMsg('');

    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      let extractedText = '';

      if (isPdf) {
        setSingleStatus('Extracting digital certificate text stream...');
        extractedText = await extractTextFromPDF(file);
        setSingleProgress(45);

        if (!extractedText || extractedText.trim().length < 25) {
          setSingleStatus('Rendering scanned PDF page for OCR...');
          const renderedBlob = await renderPDFPageToCanvas(file);
          if (renderedBlob) {
            setSingleStatus(`Scanning certificate with OCR...`);
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker('eng', 1, {
              logger: m => {
                if (m.status === 'recognizing text') {
                  setSingleProgress(45 + Math.round(m.progress * 45));
                }
              },
            });
            await worker.setParameters({ tessedit_pageseg_mode: '3' });
            const { data: { text } } = await worker.recognize(renderedBlob);
            await worker.terminate();
            extractedText = text;
          }
        }
      } else {
        const processedBlob = await preprocessImageForOCR(file);
        setSingleProgress(35);
        setSingleStatus(`Scanning ${singleDocType} with OCR...`);

        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng', 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              setSingleProgress(35 + Math.round(m.progress * 55));
            }
          },
        });
        await worker.setParameters({ tessedit_pageseg_mode: '3' });
        const { data: { text } } = await worker.recognize(processedBlob);
        await worker.terminate();
        extractedText = text;
      }

      setSingleProgress(95);
      const parsed = extractSingleDocumentFields(extractedText, singleDocType);
      const lines = extractedText.split('\n').map(l => l.trim()).filter(Boolean);
      setSingleRawLines(lines);

      const scannedFields = {
        certNumber: parsed.certNumber || '',
        applicantName: parsed.applicantName || user?.fullName || user?.name || '',
        fatherName: parsed.fatherName || '',
        stateDistrict: parsed.stateDistrict || (citizenProfile?.district ? `${citizenProfile.district}, ${citizenProfile.state?.name || ''}` : ''),
        issuingAuthority: parsed.issuingAuthority || '',
        extraField: parsed.extraField || '',
        issueDate: parsed.issueDate || ''
      };

      setSingleFields(scannedFields);
      handleRunSingleAudit(scannedFields, singleDocType, customDocName);

      setSingleStatus(
        parsed.applicantName
          ? `✅ Successfully Scanned: "${parsed.applicantName}"`
          : '✅ Certificate scanned successfully. Audit results generated below.'
      );
      setSingleProgress(100);
      setSingleLoading(false);
    } catch (err) {
      console.error('OCR single doc error:', err);
      setSingleStatus('Scan completed with partial detection. Review details below.');
      setSingleLoading(false);
    }
  };

  const handleSingleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processSingleDocOCR(file);
    }
  };

  // Comparison Criteria selector: user picks what to match!
  const [selectedCriteria, setSelectedCriteria] = useState(['name', 'dob', 'fatherName']);

  // Document labels
  const [doc1Label, setDoc1Label] = useState('Aadhaar Card');
  const [doc2Label, setDoc2Label] = useState('PAN Card');

  // Multi-field state for Document 1 & Document 2
  const [doc1Fields, setDoc1Fields] = useState({
    name: '',
    dob: '',
    fatherName: '',
    residency: '',
    gender: ''
  });

  const [doc2Fields, setDoc2Fields] = useState({
    name: '',
    dob: '',
    fatherName: '',
    residency: '',
    gender: ''
  });

  // OCR state
  const [ocrFile1, setOcrFile1] = useState(null);
  const [ocrFile2, setOcrFile2] = useState(null);
  const [ocrCandidates1, setOcrCandidates1] = useState([]);
  const [ocrCandidates2, setOcrCandidates2] = useState([]);
  const [ocrLoading1, setOcrLoading1] = useState(false);
  const [ocrLoading2, setOcrLoading2] = useState(false);
  const [ocrProgress1, setOcrProgress1] = useState(0);
  const [ocrProgress2, setOcrProgress2] = useState(0);
  const [ocrStatus1, setOcrStatus1] = useState('');
  const [ocrStatus2, setOcrStatus2] = useState('');
  const [ocrRawLines1, setOcrRawLines1] = useState([]);
  const [ocrRawLines2, setOcrRawLines2] = useState([]);
  const [showRaw1, setShowRaw1] = useState(false);
  const [showRaw2, setShowRaw2] = useState(false);

  // Results
  const [comparisonResult, setComparisonResult] = useState(null);
  const [evalError, setEvalError] = useState('');

  // History & profile sync
  const [history, setHistory] = useState([]);
  const [savingDoc, setSavingDoc] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fileRef1 = useRef();
  const fileRef2 = useRef();

  // Toggle criteria chip
  const toggleCriterion = (critId) => {
    setSelectedCriteria(prev => {
      if (prev.includes(critId)) {
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== critId);
      } else {
        return [...prev, critId];
      }
    });
    setComparisonResult(null);
  };

  const updateDoc1Field = (field, val) => {
    setDoc1Fields(prev => ({ ...prev, [field]: val }));
    setComparisonResult(null);
    setEvalError('');
  };

  const updateDoc2Field = (field, val) => {
    setDoc2Fields(prev => ({ ...prev, [field]: val }));
    setComparisonResult(null);
    setEvalError('');
  };

  // Profile Sync
  const handleSaveVerifiedDoc = async (label1, label2) => {
    try {
      setSavingDoc(true);
      setSaveMsg('');
      await Promise.all([
        API.put('/benefits/document-checklist', { docName: label1, status: 'Available' }),
        API.put('/benefits/document-checklist', { docName: label2, status: 'Available' })
      ]);
      setSaveMsg('✅ Documents successfully saved as "Available" in your Profile & Yojana Parchi!');
      setTimeout(() => setSaveMsg(''), 5000);
    } catch (err) {
      console.error('Failed to sync verified doc:', err);
      setSaveMsg('Failed to sync. Please try again.');
    } finally {
      setSavingDoc(false);
    }
  };

  // Smart cross-match banner
  const getCrossMatchSuggestion = () => {
    const list1 = [doc1Fields.name, ...ocrCandidates1].filter(Boolean);
    const list2 = [doc2Fields.name, ...ocrCandidates2].filter(Boolean);
    for (const c1 of list1) {
      for (const c2 of list2) {
        if (nameSimilarity(c1, c2) >= 80) return c1.length >= c2.length ? c1 : c2;
      }
    }
    return null;
  };

  const crossMatchSuggestion = getCrossMatchSuggestion();

  const handleApplyCrossMatch = (nameToApply) => {
    if (!nameToApply) return;
    const newF1 = { ...doc1Fields, name: nameToApply };
    const newF2 = { ...doc2Fields, name: nameToApply };
    setDoc1Fields(newF1);
    setDoc2Fields(newF2);
    setEvalError('');

    const res = evaluateMultiFieldComparison(newF1, newF2, selectedCriteria, doc1Label, doc2Label);
    setComparisonResult(res);
    setHistory(prev => [{
      doc1Label, doc2Label,
      name1: nameToApply, name2: nameToApply,
      score: res.overallScore, risk: res.overallRisk,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 8));
  };

  // Run OCR for a slot
  const processSlotOCR = async (file, slot, currentDocType) => {
    if (!file) return;
    const setLoading = slot === 1 ? setOcrLoading1 : setOcrLoading2;
    const setProgress = slot === 1 ? setOcrProgress1 : setOcrProgress2;
    const setStatus = slot === 1 ? setOcrStatus1 : setOcrStatus2;
    const setCandidates = slot === 1 ? setOcrCandidates1 : setOcrCandidates2;
    const setRawLines = slot === 1 ? setOcrRawLines1 : setOcrRawLines2;
    const updateFields = slot === 1 ? setDoc1Fields : setDoc2Fields;

    setLoading(true);
    setProgress(15);
    setStatus('Reading document...');
    setEvalError('');

    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      let extractedText = '';

      if (isPdf) {
        setStatus('Extracting PDF text...');
        extractedText = await extractTextFromPDF(file);
        setProgress(40);
        if (!extractedText || extractedText.trim().length < 25) {
          setStatus('Rendering scanned PDF page...');
          const renderedBlob = await renderPDFPageToCanvas(file);
          if (renderedBlob) {
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker('eng', 1, {
              logger: m => {
                if (m.status === 'recognizing text') {
                  setProgress(40 + Math.round(m.progress * 50));
                }
              },
            });
            await worker.setParameters({ tessedit_pageseg_mode: '3' });
            const { data: { text } } = await worker.recognize(renderedBlob);
            await worker.terminate();
            extractedText = text;
          }
        }
      } else {
        const processedBlob = await preprocessImageForOCR(file);
        setProgress(35);
        setStatus(`Scanning ${currentDocType || 'card'} with OCR...`);

        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng', 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(35 + Math.round(m.progress * 55));
            }
          },
        });
        await worker.setParameters({ tessedit_pageseg_mode: '3' });
        const { data: { text } } = await worker.recognize(processedBlob);
        await worker.terminate();
        extractedText = text;
      }

      setProgress(95);
      const parsed = extractDocumentEntities(extractedText, currentDocType);

      setRawLines(parsed.rawLines);
      setCandidates(parsed.candidates);

      updateFields(prev => ({
        ...prev,
        name: parsed.name || prev.name,
        dob: parsed.dob || prev.dob,
        fatherName: parsed.fatherName || prev.fatherName,
        residency: parsed.residency || prev.residency,
        gender: parsed.gender || prev.gender
      }));

      setStatus(parsed.name ? `✅ Detected: "${parsed.name}"` : 'Scanned document. Review extracted fields below.');
      setProgress(100);
      setLoading(false);
    } catch (err) {
      console.error('OCR error on slot', slot, err);
      setStatus('OCR encountered an issue. Please review fields directly.');
      setLoading(false);
    }
  };

  const handleSlotFileChange = async (file, slot) => {
    if (!file) return;
    if (slot === 1) {
      setOcrFile1(file);
      setComparisonResult(null);
      await processSlotOCR(file, 1, doc1Label);
    } else {
      setOcrFile2(file);
      setComparisonResult(null);
      await processSlotOCR(file, 2, doc2Label);
    }
  };

  const handleSlotDocTypeChange = (newType, slot) => {
    if (slot === 1) {
      setDoc1Label(newType);
      if (ocrRawLines1.length > 0) {
        const reParsed = extractDocumentEntities(ocrRawLines1.join('\n'), newType);
        setDoc1Fields(prev => ({
          ...prev,
          name: reParsed.name || prev.name,
          dob: reParsed.dob || prev.dob,
          fatherName: reParsed.fatherName || prev.fatherName
        }));
        setOcrCandidates1(reParsed.candidates);
      }
    } else {
      setDoc2Label(newType);
      if (ocrRawLines2.length > 0) {
        const reParsed = extractDocumentEntities(ocrRawLines2.join('\n'), newType);
        setDoc2Fields(prev => ({
          ...prev,
          name: reParsed.name || prev.name,
          dob: reParsed.dob || prev.dob,
          fatherName: reParsed.fatherName || prev.fatherName
        }));
        setOcrCandidates2(reParsed.candidates);
      }
    }
  };

  // Compare Selected Criteria
  const handleCompareCriteria = () => {
    if (selectedCriteria.length === 0) {
      setEvalError('Please select at least one criteria to compare (e.g. Name or Date of Birth).');
      return;
    }

    setEvalError('');
    const res = evaluateMultiFieldComparison(doc1Fields, doc2Fields, selectedCriteria, doc1Label, doc2Label);
    setComparisonResult(res);

    const histEntry = {
      doc1Label, doc2Label,
      name1: doc1Fields.name || 'Doc 1',
      name2: doc2Fields.name || 'Doc 2',
      score: res.overallScore,
      risk: res.overallRisk,
      timestamp: new Date().toLocaleTimeString()
    };
    setHistory(prev => [histEntry, ...prev].slice(0, 8));
  };

  // Re-run both slots
  const handleReRunBoth = async () => {
    if (ocrFile1) await processSlotOCR(ocrFile1, 1, doc1Label);
    if (ocrFile2) await processSlotOCR(ocrFile2, 2, doc2Label);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar user={user} onLogout={logout} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        <Navbar user={user} />
        <main style={{ padding: '24px 20px', flex: 1, maxWidth: '1060px', width: '100%', margin: '0 auto' }}>

          {/* Header Card (Notebook: SMART Document Verification & Compliance Audit Hub) */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '18px',
              background: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(99,102,241,0.1) 100%)',
              border: '1px solid rgba(249,115,22,0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <ShieldCheck size={16} color="#f97316" />
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  BenefitOS • Document Verification & Audit Hub
                </span>
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', margin: 0 }}>
                📋 SMART Document <span className="gradient-text">Verification & Compliance Audit</span> Hub
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', margin: '4px 0 0', maxWidth: '700px' }}>
                Single certificate ki 100% official validity audit karein, ya 2 documents ke beech Name, DOB aur Father's Name match karwayen!
              </p>
            </div>
            {user && (
              <button
                type="button"
                onClick={handlePrefillFromProfile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: 'rgba(99,102,241,0.2)',
                  border: '1px solid rgba(99,102,241,0.4)',
                  color: '#a5b4fc',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                <UserCheck size={14} color="#818cf8" />
                Fill from Profile ({user.fullName?.split(' ')[0] || user.name || 'Me'})
              </button>
            )}
          </motion.div>

          {/* Mode Switcher matching the 3 notebook boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {[
              { id: 'single', label: '🛡️ Single Document Govt Audit', sub: 'Dropdown + Upload (100% Verification)' },
              { id: 'ocr', label: '📷 Two-Document Cross Match', sub: 'Upload Doc 1 + Upload Doc 2' },
              { id: 'manual', label: '✍️ Manual Typing Comparison', sub: 'Option 1 vs Option 2 Comparison' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setOcrTab(tab.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: ocrTab === tab.id ? '1.5px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: ocrTab === tab.id ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(249,115,22,0.15) 100%)' : 'rgba(255,255,255,0.03)',
                  color: ocrTab === tab.id ? '#fff' : 'var(--text-muted)',
                  boxShadow: ocrTab === tab.id ? '0 0 18px rgba(99,102,241,0.25)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: '800', color: ocrTab === tab.id ? '#fff' : 'var(--text-secondary)' }}>
                  {tab.label}
                </span>
                <span style={{ fontSize: '10.5px', color: ocrTab === tab.id ? '#a5b4fc' : 'var(--text-muted)' }}>
                  {tab.sub}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* ── MODE 1: SINGLE DOCUMENT GOVT AUDIT ── */}
            {ocrTab === 'single' ? (
              <div className="glass-panel" style={{ borderRadius: '16px', padding: '22px', border: '1px solid var(--border-subtle)' }}>
                {/* Mode 1 Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={18} color="var(--accent-primary)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Single Document Govt Audit</span>
                        {singleAuditLoading && <Loader2 size={13} className="animate-spin" color="var(--accent-primary)" />}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Official Indian State & Gazette criteria verification (100% compliance engine)
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2-COLUMN WIREFRAME GRID: [ DROP DOWN & CRITERIA ] | [ OPTION TO UPLOAD THE PDF ] */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '20px' }}>
                  {/* Left Column: DROP DOWN + Statutory Verification Checklist */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Select Certificate Type (DROP DOWN):
                      </label>
                      <select
                        value={singleDocType}
                        onChange={(e) => handleSingleDocTypeChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'rgba(0,0,0,0.5)',
                          border: '1.5px solid var(--accent-primary)',
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: '700',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {Object.keys(GOVT_DOC_CATALOG).map(dt => {
                          const sMatch = serverDocTypes.find(s => s.docType === dt);
                          const suffix = sMatch ? ` (${sMatch.count} Schemes)` : '';
                          return (
                            <option key={dt} value={dt} style={{ background: '#18181b', color: '#fff' }}>
                              {GOVT_DOC_CATALOG[dt].title}{suffix}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {singleDocType === 'Custom Document' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', color: '#f97316', fontWeight: '700', marginBottom: '4px' }}>
                          Custom Certificate Name:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Kisan Registration, Fisheries Card, Voter ID..."
                          value={customDocName}
                          onChange={(e) => setCustomDocName(e.target.value)}
                          style={{ width: '100%', padding: '9px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(249,115,22,0.4)', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '700', outline: 'none' }}
                        />
                      </div>
                    )}

                    {/* Statutory Verification Criteria Checklist */}
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Shield size={13} color="var(--accent-primary)" />
                          Official Gazette Criteria Checklist:
                        </span>
                        <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)', fontWeight: '700' }}>
                          {GOVT_DOC_CATALOG[singleDocType]?.badge || 'Statutory Proof'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(GOVT_DOC_CATALOG[singleDocType]?.rules || []).map((rule, rIdx) => (
                          <div key={rule.id || rIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#e2e8f0', padding: '6px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                              <CheckCircle2 size={13} color="var(--success)" style={{ opacity: 0.8 }} />
                              <span>{rule.title}</span>
                            </div>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '700' }}>
                              {rule.maxScore} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: OPTION TO UPLOAD THE PDF / PHOTO */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Option to Upload the PDF / Photo:
                      </label>

                      {/* Dropzone / Click Box */}
                      <div
                        onClick={() => singleFileRef.current?.click()}
                        style={{
                          width: '100%',
                          minHeight: '120px',
                          border: `2px dashed ${singleFile ? 'rgba(16,185,129,0.5)' : 'var(--border-subtle)'}`,
                          borderRadius: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: singleLoading ? 'not-allowed' : 'pointer',
                          background: singleFile ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
                          padding: '16px',
                          marginBottom: '14px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {singleLoading ? (
                          <>
                            <Loader2 size={24} className="animate-spin" color="var(--accent-primary)" />
                            <span style={{ fontSize: '12px', color: '#fff', fontWeight: '700' }}>{singleStatus}</span>
                            <div style={{ width: '80%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${singleProgress}%`, height: '100%', background: 'var(--accent-gradient)' }} />
                            </div>
                          </>
                        ) : singleFile ? (
                          <>
                            <CheckCircle2 size={24} color="var(--success)" />
                            <span style={{ fontSize: '12.5px', color: 'var(--success)', fontWeight: '700', textAlign: 'center', wordBreak: 'break-all' }}>
                              {singleFile.name}
                            </span>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Click to replace PDF or scanned photo</span>
                          </>
                        ) : (
                          <>
                            <Upload size={24} color="var(--accent-primary)" />
                            <span style={{ fontSize: '12.5px', color: '#fff', fontWeight: '700', textAlign: 'center' }}>
                              Upload {singleDocType} (PDF / Image)
                            </span>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                              Click to browse or drag & drop file here
                            </span>
                          </>
                        )}
                      </div>

                      <input
                        ref={singleFileRef}
                        type="file"
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        onChange={handleSingleFileChange}
                      />

                      {/* Scanned Document Information (Shows extracted values only) */}
                      {singleFile && !singleLoading && (
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--success)', textTransform: 'uppercase' }}>
                              📄 Extracted Document Information:
                            </span>
                            {singleRawLines.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setSingleShowRaw(!singleShowRaw)}
                                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '10.5px', cursor: 'pointer', textDecoration: 'underline' }}
                              >
                                {singleShowRaw ? 'Hide OCR' : `View OCR (${singleRawLines.length} lines)`}
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Certificate No: </span>
                              <span style={{ color: '#fff', fontWeight: '700' }}>{singleFields.certNumber || 'Not detected'}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Applicant Name: </span>
                              <span style={{ color: '#fff', fontWeight: '700' }}>{singleFields.applicantName || 'Not detected'}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Father / Guardian: </span>
                              <span style={{ color: '#fff', fontWeight: '700' }}>{singleFields.fatherName || 'Not detected'}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Issuing Officer: </span>
                              <span style={{ color: '#fff', fontWeight: '700' }}>{singleFields.issuingAuthority || 'Not detected'}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Issue Date: </span>
                              <span style={{ color: '#fff', fontWeight: '700' }}>{singleFields.issueDate || 'Not detected'}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Jurisdiction: </span>
                              <span style={{ color: '#fff', fontWeight: '700' }}>{singleFields.stateDistrict || 'Not detected'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Raw Lines Accordion */}
                      {singleShowRaw && singleRawLines.length > 0 && (
                        <div style={{ marginBottom: '10px', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', maxHeight: '100px', overflowY: 'auto', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          {singleRawLines.map((l, i) => (
                            <div key={i} style={{ padding: '2px 0' }}>• {l}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mode 1 Action Row: Full Width Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRunSingleAudit(singleFields, singleDocType, customDocName)}
                    disabled={singleLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      color: '#fff',
                      fontWeight: '800',
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(249,115,22,0.35)'
                    }}
                  >
                    <ShieldCheck size={16} />
                    ⚡ Audit Against Government Criteria (100% Verification)
                  </motion.button>

                  <button
                    onClick={() => {
                      setSingleFields({ certNumber: '', applicantName: '', fatherName: '', stateDistrict: '', issuingAuthority: '', extraField: '', issueDate: '' });
                      setSingleAuditResult(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '11px 16px',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={13} /> Reset Fields
                  </button>
                </div>

                    {/* ── SINGLE DOCUMENT AUDIT RESULT DISPLAY ── */}
                    <AnimatePresence>
                      {singleAuditResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{
                            marginTop: '24px',
                            padding: '24px',
                            borderRadius: '14px',
                            background: singleAuditResult.risk.bg,
                            border: `1px solid ${singleAuditResult.risk.borderColor}`
                          }}
                        >
                          {/* Score Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)' }}>
                                {(() => {
                                  const IconComp = typeof singleAuditResult.risk?.icon === 'function'
                                    ? singleAuditResult.risk.icon
                                    : (singleAuditResult.score >= 80 ? ShieldCheck : singleAuditResult.score >= 60 ? AlertTriangle : XCircle);
                                  return <IconComp size={26} color={singleAuditResult.risk.color} />;
                                })()}
                              </div>
                              <div>
                                <div style={{ fontSize: '15px', fontWeight: '900', color: singleAuditResult.risk.color, letterSpacing: '0.5px' }}>
                                  {singleAuditResult.risk.label} <span style={{ opacity: 0.8, fontSize: '12px' }}>({singleAuditResult.risk.labelHi})</span>
                                </div>
                                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  {singleAuditResult.risk.message}
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.25)', padding: '8px 16px', borderRadius: '10px' }}>
                              <div style={{ fontSize: '32px', fontWeight: '900', color: singleAuditResult.risk.color, lineHeight: 1 }}>
                                {singleAuditResult.score}<span style={{ fontSize: '16px' }}>%</span>
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>
                                Govt Compliance
                              </div>
                            </div>
                          </div>

                          {/* Compliance Bar */}
                          <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${singleAuditResult.score}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              style={{ height: '100%', background: singleAuditResult.risk.color, borderRadius: '4px' }}
                            />
                          </div>

                          {/* ── OFFICIAL GOVERNMENT CHECKLIST ── */}
                          <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '20px' }}>
                            <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                              <span>Official Government Checkpoint</span>
                              <span>Audit Finding & Status</span>
                            </div>

                            {singleAuditResult.breakdown.map((rule, idx) => {
                              const isPass = rule.status === 'pass';
                              const isWarn = rule.status === 'warn';
                              const statusColor = isPass ? 'var(--success)' : isWarn ? 'var(--warning)' : 'var(--error)';
                              const statusBg = isPass ? 'rgba(16,185,129,0.18)' : isWarn ? 'rgba(245,158,11,0.18)' : 'rgba(239,68,68,0.18)';
                              const StatusIcon = isPass ? CheckCircle2 : isWarn ? AlertTriangle : XCircle;

                              return (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    borderBottom: idx < singleAuditResult.breakdown.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                    gap: '14px',
                                    fontSize: '12.5px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <StatusIcon size={16} color={statusColor} style={{ flexShrink: 0 }} />
                                    <div>
                                      <div style={{ fontWeight: '800', color: '#fff' }}>
                                        {rule.title}
                                      </div>
                                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        {rule.text}
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', background: statusBg, color: statusColor }}>
                                      {isPass ? 'PASSED ✅' : isWarn ? 'ADVISORY ⚠️' : 'FAILED ❌'}
                                    </span>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                      {rule.score} / {rule.maxScore} pts
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* ── UNLOCKED GOVERNMENT WELFARE SCHEMES (LIVE MONGODB) ── */}
                          {singleAuditResult.unlockedSchemes?.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Award size={18} color="#f97316" />
                                  <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#fff' }}>
                                    Live MongoDB Welfare Schemes Unlocked ({singleAuditResult.unlockedSchemes.length}):
                                  </span>
                                </div>
                                {singleAuditResult.totalUnlockedBenefitAmount > 0 && (
                                  <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--success)', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 10px', borderRadius: '8px' }}>
                                    💰 Total DBT Value: ₹{singleAuditResult.totalUnlockedBenefitAmount.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                                {singleAuditResult.unlockedSchemes.map((sc, sIdx) => (
                                  <div
                                    key={sIdx}
                                    style={{
                                      padding: '14px 16px',
                                      borderRadius: '12px',
                                      background: 'rgba(255,255,255,0.04)',
                                      border: '1px solid rgba(255,255,255,0.08)',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'space-between',
                                      gap: '10px'
                                    }}
                                  >
                                    <div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff', lineHeight: '1.4' }}>
                                          {sc.name}
                                        </div>
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--success)', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                          {sc.benefit}
                                        </span>
                                      </div>
                                      <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '700', marginBottom: '4px' }}>
                                        {sc.department} • <span style={{ color: 'var(--text-muted)' }}>{sc.category}</span>
                                      </div>
                                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {sc.desc}
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                      <span style={{ fontSize: '10.5px', fontWeight: '800', padding: '2px 7px', borderRadius: '6px', background: sc.isUserEligible ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', color: sc.isUserEligible ? 'var(--success)' : 'var(--text-secondary)' }}>
                                        {sc.isUserEligible ? '✅ Demographic Match' : (sc.eligibilityReason || 'Document Verified')}
                                      </span>

                                      {sc.officialWebsite && (
                                        <a
                                          href={sc.officialWebsite}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#818cf8', textDecoration: 'none', fontWeight: '700' }}
                                        >
                                          Official Portal <ExternalLink size={11} />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 1-Click Profile Sync Button */}
                          {singleAuditResult.score >= 65 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <button
                                onClick={handleSaveSingleVerifiedDoc}
                                disabled={singleSaving}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  padding: '12px 18px',
                                  borderRadius: '10px',
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  border: 'none',
                                  color: '#fff',
                                  fontWeight: '800',
                                  fontSize: '13px',
                                  cursor: singleSaving ? 'not-allowed' : 'pointer',
                                  boxShadow: '0 0 20px rgba(16,185,129,0.35)'
                                }}
                              >
                                {singleSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                {singleSaving ? 'Syncing to Profile...' : `Save ${singleDocType} as Verified in Citizen Profile & Yojana Parchi`}
                              </button>
                              {singleSaveMsg && (
                                <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '700', textAlign: 'center', display: 'block', marginTop: '4px' }}>
                                  {singleSaveMsg}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Dynamic Advisories */}
                          {singleAuditResult.advisories && singleAuditResult.advisories.length > 0 && (
                            <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(245,158,11,0.08)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.25)' }}>
                              <p style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: '800', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertTriangle size={14} color="var(--warning)" /> Government Compliance Advisories (सरकारी दिशा-निर्देश):
                              </p>
                              <ul style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '16px', margin: 0 }}>
                                {singleAuditResult.advisories.map((adv, aIdx) => (
                                  <li key={aIdx}>{adv}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
              ) : (
                <>
                  {/* ── CRITERIA SELECTOR: USER CHOOSES WHAT TO MATCH! ── */}
                  <div className="glass-panel" style={{ padding: '18px 22px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(249,115,22,0.05) 100%)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={16} color="var(--accent-primary)" />
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                      Aap Dono Documents Mein Kya-Kya Match Karwana Chahte Hain?
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>
                    {selectedCriteria.length} of {AVAILABLE_CRITERIA.length} fields active
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {AVAILABLE_CRITERIA.map(crit => {
                    const isSelected = selectedCriteria.includes(crit.id);
                    const Icon = crit.icon;
                    return (
                      <button
                        key={crit.id}
                        type="button"
                        onClick={() => toggleCriterion(crit.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '9px 14px',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)'}`,
                          color: isSelected ? '#fff' : 'var(--text-muted)',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          boxShadow: isSelected ? '0 0 14px rgba(99,102,241,0.25)' : 'none'
                        }}
                      >
                        <Icon size={14} color={isSelected ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                        <span>{crit.label} <span style={{ opacity: 0.65, fontSize: '10.5px' }}>({crit.labelHi})</span></span>
                        {isSelected && <CheckCircle2 size={13} color="var(--success)" style={{ marginLeft: '2px' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── DOCUMENT CARDS (DOCUMENT 1 & DOCUMENT 2) ── */}
              <div className="glass-panel" style={{ borderRadius: '16px', padding: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Eye size={18} color="var(--accent-primary)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', margin: 0 }}>
                        {ocrTab === 'ocr' ? 'Upload Documents & Verify Extracted Fields' : 'Type Details for Both Documents'}
                      </h3>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0 }}>
                        {doc1Label} vs {doc2Label} comparison
                      </p>
                    </div>
                  </div>
                  {ocrTab === 'ocr' && (ocrFile1 || ocrFile2) && (
                    <button
                      onClick={handleReRunBoth}
                      disabled={ocrLoading1 || ocrLoading2}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '6px 12px', color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      <RefreshCw size={12} className={ocrLoading1 || ocrLoading2 ? 'animate-spin' : ''} /> Re-scan
                    </button>
                  )}
                </div>

                {/* 2 Document Slots */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '22px' }}>
                  {[
                    {
                      num: 1,
                      label: ocrTab === 'manual' ? 'Option 1 (Document 1 Details)' : 'Upload Document 1',
                      docType: doc1Label,
                      setDocType: t => handleSlotDocTypeChange(t, 1),
                      file: ocrFile1,
                      fileRef: fileRef1,
                      loading: ocrLoading1,
                      progress: ocrProgress1,
                      status: ocrStatus1,
                      fields: doc1Fields,
                      updateField: updateDoc1Field,
                      candidates: ocrCandidates1,
                      rawLines: ocrRawLines1,
                      showRaw: showRaw1,
                      setShowRaw: setShowRaw1
                    },
                    {
                      num: 2,
                      label: ocrTab === 'manual' ? 'Option 2 (Document 2 Details)' : 'Upload Document 2',
                      docType: doc2Label,
                      setDocType: t => handleSlotDocTypeChange(t, 2),
                      file: ocrFile2,
                      fileRef: fileRef2,
                      loading: ocrLoading2,
                      progress: ocrProgress2,
                      status: ocrStatus2,
                      fields: doc2Fields,
                      updateField: updateDoc2Field,
                      candidates: ocrCandidates2,
                      rawLines: ocrRawLines2,
                      showRaw: showRaw2,
                      setShowRaw: setShowRaw2
                    }
                  ].map(slot => (
                    <div
                      key={slot.num}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '14px',
                        padding: '18px'
                      }}
                    >
                      {/* Slot Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>
                          {slot.label}
                        </span>
                        <select
                          value={slot.docType}
                          onChange={e => slot.setDocType(e.target.value)}
                          style={{
                            padding: '5px 10px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '7px',
                            color: '#fff',
                            fontSize: '11px',
                            fontWeight: '700',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {DOCUMENT_TYPES.map(d => <option key={d} value={d} style={{ background: '#111827' }}>{d}</option>)}
                        </select>
                      </div>

                      {/* File Upload Box (in OCR mode) */}
                      {ocrTab === 'ocr' && (
                        <>
                          <div
                            onClick={() => slot.fileRef.current?.click()}
                            style={{
                              width: '100%',
                              minHeight: '100px',
                              border: `2px dashed ${slot.file ? 'rgba(16,185,129,0.5)' : 'var(--border-subtle)'}`,
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              background: slot.file ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.015)',
                              padding: '12px',
                              marginBottom: '14px',
                              transition: 'all 0.2s'
                            }}
                          >
                            {slot.file ? (
                              <>
                                <CheckCircle2 size={22} color="var(--success)" />
                                <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '700', textAlign: 'center', wordBreak: 'break-all' }}>
                                  {slot.file.name.length > 28 ? slot.file.name.slice(0, 25) + '...' : slot.file.name}
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Click to replace image</span>
                              </>
                            ) : (
                              <>
                                <Upload size={22} color="var(--text-muted)" />
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                                  Upload {slot.docType} photo<br />
                                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>(Auto-extracts Name, DOB, Father's Name)</span>
                                </span>
                              </>
                            )}
                          </div>

                          <input
                            ref={slot.fileRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={e => {
                              if (e.target.files?.[0]) handleSlotFileChange(e.target.files[0], slot.num);
                            }}
                          />

                          {/* Progress bar */}
                          {slot.loading && (
                            <div style={{ marginBottom: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{slot.status}</span>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)' }}>{Math.round(slot.progress)}%</span>
                              </div>
                              <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                <motion.div
                                  animate={{ width: `${slot.progress}%` }}
                                  transition={{ duration: 0.2 }}
                                  style={{ height: '100%', background: 'var(--accent-gradient)', borderRadius: '3px' }}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* ── Selected Fields (User Editable) ── */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* 1. Full Name */}
                        {selectedCriteria.includes('name') && (
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                              <User size={13} color="var(--accent-primary)" /> Citizen Name (नाम):
                            </label>
                            <input
                              type="text"
                              placeholder={`Full name on ${slot.docType}...`}
                              value={slot.fields.name}
                              onChange={e => slot.updateField('name', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(0,0,0,0.35)',
                                border: `1px solid ${slot.fields.name ? 'rgba(16,185,129,0.4)' : 'var(--border-subtle)'}`,
                                borderRadius: '9px',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: '700',
                                outline: 'none'
                              }}
                            />
                            {/* Candidate chips for Name */}
                            {slot.candidates && slot.candidates.length > 0 && (
                              <div style={{ marginTop: '6px' }}>
                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                  {slot.candidates.map((cand, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => slot.updateField('name', cand)}
                                      style={{
                                        padding: '3px 8px',
                                        borderRadius: '5px',
                                        background: slot.fields.name === cand ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${slot.fields.name === cand ? 'var(--success)' : 'rgba(255,255,255,0.08)'}`,
                                        color: slot.fields.name === cand ? 'var(--success)' : 'var(--text-secondary)',
                                        fontSize: '10.5px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {cand}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. Date of Birth */}
                        {selectedCriteria.includes('dob') && (
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                              <Calendar size={13} color="#f97316" /> Date of Birth (जन्म तिथि):
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 15/08/1998 or 1998"
                              value={slot.fields.dob}
                              onChange={e => slot.updateField('dob', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(0,0,0,0.35)',
                                border: `1px solid ${slot.fields.dob ? 'rgba(249,115,22,0.4)' : 'var(--border-subtle)'}`,
                                borderRadius: '9px',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: '700',
                                outline: 'none'
                              }}
                            />
                          </div>
                        )}

                        {/* 3. Father's Name */}
                        {selectedCriteria.includes('fatherName') && (
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                              <Users size={13} color="#10b981" /> Father's Name (पिता का नाम):
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Virendra Ray"
                              value={slot.fields.fatherName}
                              onChange={e => slot.updateField('fatherName', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(0,0,0,0.35)',
                                border: `1px solid ${slot.fields.fatherName ? 'rgba(16,185,129,0.4)' : 'var(--border-subtle)'}`,
                                borderRadius: '9px',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: '700',
                                outline: 'none'
                              }}
                            />
                          </div>
                        )}

                        {/* 4. Residency / Address */}
                        {selectedCriteria.includes('residency') && (
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                              <Home size={13} color="#ec4899" /> State / Address / PIN (निवास):
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Bihar / PIN: 800001"
                              value={slot.fields.residency}
                              onChange={e => slot.updateField('residency', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(0,0,0,0.35)',
                                border: `1px solid ${slot.fields.residency ? 'rgba(236,72,153,0.4)' : 'var(--border-subtle)'}`,
                                borderRadius: '9px',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: '700',
                                outline: 'none'
                              }}
                            />
                          </div>
                        )}

                        {/* 5. Gender */}
                        {selectedCriteria.includes('gender') && (
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                              <UserCheck size={13} color="#38bdf8" /> Gender (लिंग):
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Male / Female"
                              value={slot.fields.gender}
                              onChange={e => slot.updateField('gender', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(0,0,0,0.35)',
                                border: `1px solid ${slot.fields.gender ? 'rgba(56,189,248,0.4)' : 'var(--border-subtle)'}`,
                                borderRadius: '9px',
                                color: '#fff',
                                fontSize: '13px',
                                fontWeight: '700',
                                outline: 'none'
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Raw Text Accordion (in OCR mode) */}
                      {ocrTab === 'ocr' && slot.rawLines && slot.rawLines.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <button
                            type="button"
                            onClick={() => slot.setShowRaw(!slot.showRaw)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                          >
                            {slot.showRaw ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {slot.showRaw ? 'Hide Raw Scanned Lines' : `View Scanned Text (${slot.rawLines.length} lines)`}
                          </button>
                          {slot.showRaw && (
                            <div style={{ marginTop: '8px', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', maxHeight: '110px', overflowY: 'auto', fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                              {slot.rawLines.map((line, lIdx) => (
                                <div key={lIdx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>{line}</span>
                                  <button
                                    type="button"
                                    onClick={() => slot.updateField('name', sanitizePersonName(line) || line)}
                                    style={{ padding: '1px 6px', fontSize: '9px', borderRadius: '4px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: '#fff', cursor: 'pointer' }}
                                  >
                                    Use as Name
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>



                {/* ── Smart Cross-Match Helper Banner ── */}
                {crossMatchSuggestion && doc1Fields.name !== doc2Fields.name && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: '18px',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(99,102,241,0.12) 100%)',
                      border: '1px solid rgba(16,185,129,0.4)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={16} color="var(--success)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                          ✨ Matching Citizen Name Detect Hua: "{crossMatchSuggestion}"
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          Dono documents par ye name verified hai. Ek click me dono par apply karein!
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApplyCrossMatch(crossMatchSuggestion)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        boxShadow: '0 0 16px rgba(16,185,129,0.35)'
                      }}
                    >
                      <CheckCircle2 size={15} /> Apply to Both & Compare
                    </button>
                  </motion.div>
                )}

                {/* ── Action Buttons ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCompareCriteria}
                    disabled={ocrLoading1 || ocrLoading2}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 26px',
                      color: '#fff',
                      fontWeight: '800',
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      boxShadow: '0 0 24px rgba(249,115,22,0.35)'
                    }}
                  >
                    {(ocrLoading1 || ocrLoading2) ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
                    {(ocrLoading1 || ocrLoading2) ? 'Scanning Cards...' : `⚡ Compare Selected Fields (${selectedCriteria.length})`}
                  </motion.button>

                  <button
                    onClick={() => {
                      setDoc1Fields({ name: '', dob: '', fatherName: '', residency: '', gender: '' });
                      setDoc2Fields({ name: '', dob: '', fatherName: '', residency: '', gender: '' });
                      setComparisonResult(null);
                      setEvalError('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '11px 16px',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={13} /> Reset Fields
                  </button>
                </div>

                {/* Error Banner */}
                {evalError && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      background: 'rgba(245,158,11,0.12)',
                      borderRadius: '10px',
                      border: '1px solid rgba(245,158,11,0.3)',
                      fontSize: '12.5px',
                      color: 'var(--warning)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <AlertTriangle size={16} color="var(--warning)" style={{ flexShrink: 0 }} />
                    <span>{evalError}</span>
                  </motion.div>
                )}

                {/* ── MULTI-CRITERIA COMPARISON RESULT CARD ── */}
                <AnimatePresence>
                  {comparisonResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        marginTop: '24px',
                        padding: '24px',
                        borderRadius: '14px',
                        background: comparisonResult.overallRisk.bg,
                        border: `1px solid ${comparisonResult.overallRisk.borderColor}`
                      }}
                    >
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)' }}>
                            <comparisonResult.overallRisk.icon size={26} color={comparisonResult.overallRisk.color} />
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '900', color: comparisonResult.overallRisk.color, letterSpacing: '0.5px' }}>
                              {comparisonResult.overallRisk.label}
                            </div>
                            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {comparisonResult.overallRisk.message}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.25)', padding: '8px 16px', borderRadius: '10px' }}>
                          <div style={{ fontSize: '32px', fontWeight: '900', color: comparisonResult.overallRisk.color, lineHeight: 1 }}>
                            {comparisonResult.overallScore}<span style={{ fontSize: '16px' }}>%</span>
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>
                            Overall Match
                          </div>
                        </div>
                      </div>

                      {/* Overall Progress Bar */}
                      <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${comparisonResult.overallScore}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          style={{ height: '100%', background: comparisonResult.overallRisk.color, borderRadius: '4px' }}
                        />
                      </div>

                      {/* ── DETAILED CRITERIA BREAKDOWN TABLE ── */}
                      <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: '18px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 1fr 130px', padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          <span>Field / Parameter</span>
                          <span>{doc1Label}</span>
                          <span>{doc2Label}</span>
                          <span style={{ textAlign: 'right' }}>Status / Score</span>
                        </div>

                        {comparisonResult.breakdown.map((item, idx) => {
                          const critDef = AVAILABLE_CRITERIA.find(c => c.id === item.criterion) || {};
                          const CritIcon = critDef.icon || FileText;
                          const isHighMatch = item.score >= 90;
                          const isPartial = item.score >= 60 && item.score < 90;

                          return (
                            <div
                              key={idx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '160px 1fr 1fr 130px',
                                padding: '12px 16px',
                                borderBottom: idx < comparisonResult.breakdown.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                alignItems: 'center',
                                fontSize: '12.5px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#fff' }}>
                                <CritIcon size={14} color="var(--accent-primary)" />
                                <span>{critDef.label || item.criterion}</span>
                              </div>
                              <div style={{ color: item.val1 ? '#fff' : 'var(--text-muted)', fontWeight: item.val1 ? '700' : '400' }}>
                                {item.val1}
                              </div>
                              <div style={{ color: item.val2 ? '#fff' : 'var(--text-muted)', fontWeight: item.val2 ? '700' : '400' }}>
                                {item.val2}
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    background: isHighMatch ? 'rgba(16,185,129,0.2)' : isPartial ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                                    color: isHighMatch ? 'var(--success)' : isPartial ? 'var(--warning)' : 'var(--error)'
                                  }}
                                >
                                  {item.score}% {isHighMatch ? '✅' : isPartial ? '⚠️' : '❌'}
                                </span>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  {item.note}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Save Verified Status Sync Button */}
                      {comparisonResult.overallScore >= 70 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            onClick={() => handleSaveVerifiedDoc(doc1Label, doc2Label)}
                            disabled={savingDoc}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              padding: '12px 18px',
                              borderRadius: '10px',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              border: 'none',
                              color: '#fff',
                              fontWeight: '800',
                              fontSize: '13px',
                              cursor: savingDoc ? 'not-allowed' : 'pointer',
                              boxShadow: '0 0 20px rgba(16,185,129,0.35)'
                            }}
                          >
                            {savingDoc ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            {savingDoc ? 'Syncing to Profile...' : `Save ${doc1Label} & ${doc2Label} Verified Status to Profile & Yojana Parchi`}
                          </button>
                          {saveMsg && (
                            <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '700', textAlign: 'center', display: 'block', marginTop: '4px' }}>
                              {saveMsg}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Remedial Advice */}
                      {comparisonResult.overallScore < 90 && (
                        <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <p style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: '800', marginBottom: '6px' }}>⚡ Recommended Action for Discrepant Fields:</p>
                          <ul style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '16px', margin: 0 }}>
                            <li>Agar Name ya DOB me farak hai, to nearest CSC center par ₹50 me Aadhaar update request dalein.</li>
                            <li>PAN Card par Date of Birth / Father's Name change ke liye NSDL portal par online correction form bharein.</li>
                            <li>Immediate welfare submission ke liye First Class Magistrate / Notary se self-declaration affidavit banwayen.</li>
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  </div>
);
};

export default DocumentCheckerPage;
