/**
 * BenefitOS Government Message & Claim Authenticity Risk Analyzer
 * Advisory risk detector for citizen messages, SMS, WhatsApp, and URLs.
 * NOTE: Provides risk evaluation based on multi-factor heuristics, not a definitive legal verdict.
 */
const verifyMessageOrClaim = (inputText) => {
  if (!inputText || !inputText.trim()) {
    throw new Error('Message text or URL to verify is required.');
  }

  const text = inputText.toLowerCase().trim();
  const redFlags = [];
  const positiveSignals = [];
  let riskScore = 15; // Baseline low risk

  // 1. Urgency & High-Pressure Tactics
  if (/\b(urgent|immediate|last chance|within \d+\s*(hours|hrs|minutes|mins)|today only|expires tonight|hurry|final warning|account blocked)\b/i.test(text)) {
    redFlags.push('High-pressure urgency tactics detected ("within X hours" / "last chance").');
    riskScore += 25;
  }

  // 2. Sensitive Credential & Financial Demands (High Severity)
  if (/\b(otp|password|pin|cvv|card number|debit card|atm pin|upi pin|net banking password)\b/i.test(text)) {
    redFlags.push('CRITICAL: Requests sensitive security credentials (OTP / PIN / Password). Official government portals never ask for OTPs or PINs via SMS/WhatsApp.');
    riskScore += 45;
  }

  // 3. Processing Fee / Money Transfer Demands
  if (/\b(processing fee|registration fee|advance payment|pay ₹|deposit money|send money to claim|claim fee)\b/i.test(text)) {
    redFlags.push('Demands advance fee or money transfer to receive a government welfare grant. Genuine DBT schemes are 100% free.');
    riskScore += 35;
  }

  // 4. URL & Domain Authenticity Check
  const urlMatches = text.match(/(https?:\/\/[^\s]+)/gi) || [];
  if (urlMatches.length > 0) {
    urlMatches.forEach(urlStr => {
      try {
        const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
        const hostname = parsed.hostname.toLowerCase();

        if (hostname.endsWith('.gov.in') || hostname.endsWith('.nic.in') || hostname.endsWith('.myscheme.in')) {
          positiveSignals.push(`Authentic government domain recognized: ${hostname}`);
          riskScore -= 20;
        } else if (/\b(bit\.ly|tinyurl\.com|t\.co|wa\.me|goo\.gl|cutt\.ly|is\.gd|tiny\.cc)\b/i.test(hostname)) {
          redFlags.push(`Uses obfuscated / shortened URL link (${hostname}). Scammers frequently use URL shorteners to mask fake portals.`);
          riskScore += 25;
        } else if (/\b(xyz|top|site|club|online|buzz|live|icu|cfd|win|click|vip)\b/i.test(hostname)) {
          redFlags.push(`Suspicious top-level domain (${hostname}). Official Indian public services operate strictly on .gov.in or .nic.in.`);
          riskScore += 35;
        } else {
          redFlags.push(`Non-government third-party website (${hostname}). Exercise caution.`);
          riskScore += 15;
        }
      } catch (e) {
        redFlags.push('Contains malformed or obscured web links.');
        riskScore += 15;
      }
    });
  }

  // 5. Impersonation & Unrealistic Promises
  if (/\b(free ₹|free 50,000|free 1,00,000|lottery|win money|modi cash|rahul cash|free smartphone lottery|free recharge)\b/i.test(text)) {
    redFlags.push('Unrealistic monetary promises or fake giveaways falsely using government names.');
    riskScore += 30;
  }

  // Positive signals
  if (/\b(myscheme\.gov\.in|scholarships\.gov\.in|pmkisan\.gov\.in|pmfby\.gov\.in|pmjay\.gov\.in)\b/i.test(text)) {
    positiveSignals.push('Refers to verified national welfare portal URL.');
  }

  // Calculate final Risk Level
  riskScore = Math.max(5, Math.min(riskScore, 98));

  let riskLevel = 'LOW';
  let indicatorColor = 'var(--success)';
  let advisory = 'This message appears consistent with general informational notices. Always apply directly via verified .gov.in websites.';

  if (riskScore >= 65) {
    riskLevel = 'HIGH';
    indicatorColor = 'var(--error)';
    advisory = 'HIGH RISK WARNING: Multiple indicators of fraudulent communication detected. Do NOT click external links, do NOT pay fees, and NEVER share OTPs or banking credentials.';
  } else if (riskScore >= 35) {
    riskLevel = 'MODERATE';
    indicatorColor = 'var(--warning)';
    advisory = 'MODERATE CAUTION: Some suspicious elements (such as unofficial links or high urgency) were found. Verify the scheme name independently on myScheme.gov.in.';
  }

  return {
    verifiedAt: new Date().toISOString(),
    riskScore,
    riskLevel,
    indicatorColor,
    redFlagsFound: redFlags,
    positiveSignals,
    advisory,
    safetyTips: [
      'Genuine government welfare schemes are never awarded via random WhatsApp lottery or SMS links.',
      'No government officer will ever ask for your UPI PIN, ATM PIN, or OTP to deposit DBT funds.',
      'Always verify schemes on the official National Portal: https://www.myscheme.gov.in',
      'Report cyber fraud immediately on the National Cyber Crime Portal (cybercrime.gov.in) or dial 1930.'
    ]
  };
};

module.exports = { verifyMessageOrClaim };
