/**
 * Production OTP Delivery Service
 * - Email OTP via Nodemailer + Gmail SMTP (App Password)
 * - Phone OTP via Fast2SMS (Indian SMS Gateway)
 */
const nodemailer = require('nodemailer');

// ─── Gmail SMTP Transporter ───────────────────────────────────────────────────
const createEmailTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn('[OTP SERVICE] ⚠️  Gmail credentials not set in .env (GMAIL_USER / GMAIL_APP_PASSWORD). Email OTPs will be shown in console.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
};

// ─── Send Email OTP ───────────────────────────────────────────────────────────
const sendEmailOTP = async (email, otp) => {
  const transporter = createEmailTransporter();

  if (!transporter) {
    // Fallback: log to console in dev mode
    console.log(`\n📧 [DEV EMAIL OTP] To: ${email} | Code: ${otp}\n`);
    return true;
  }

  const mailOptions = {
    from: `"GovScheme Portal 🏛️" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🔐 GovScheme - Your Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0f0f1a; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #2d2d5e;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px 32px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #fff;">🏛️ GovScheme Portal</h1>
          <p style="margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Sarkari Yojana & Career Navigator</p>
        </div>
        
        <div style="padding: 32px;">
          <p style="margin: 0 0 16px; color: #d1d5db; font-size: 15px;">Namaste! 🙏</p>
          <p style="margin: 0 0 24px; color: #d1d5db; font-size: 15px;">
            Aapka Email ID verify karne ke liye neeche diya OTP code use karein. Yeh code <strong style="color: #f59e0b;">5 minutes</strong> mein expire ho jayega.
          </p>

          <div style="background: rgba(99, 102, 241, 0.15); border: 2px dashed #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your Email OTP</p>
            <h2 style="margin: 0; font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #6366f1; font-family: monospace;">${otp}</h2>
          </div>

          <p style="margin: 0 0 8px; color: #9ca3af; font-size: 13px;">⚠️ <strong>Kisi ke saath share mat karein</strong> — GovScheme team kabhi OTP nahi maangti.</p>
          <p style="margin: 0; color: #9ca3af; font-size: 13px;">Agar aapne registration nahi ki, toh is email ko ignore karein.</p>
        </div>

        <div style="background: rgba(255,255,255,0.03); padding: 16px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
          <p style="margin: 0; color: #6b7280; font-size: 11px;">© ${new Date().getFullYear()} GovScheme Intelligence Portal | Government of India Initiative</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL OTP SENT] To: ${email} | MessageId: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`❌ [EMAIL OTP ERROR] Failed to send to ${email}: ${err.message}`);
    // Don't throw — fallback to console
    console.log(`📧 [DEV FALLBACK OTP] To: ${email} | Code: ${otp}`);
    return true;
  }
};

// ─── Send Phone OTP via Fast2SMS ──────────────────────────────────────────────
const sendPhoneOTP = async (phone, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    // Fallback: show in console for development
    console.log(`\n📱 [DEV PHONE OTP] To: ${phone} | Code: ${otp}\n`);
    return true;
  }

  try {
    const cleanPhone = phone.replace(/\D/g, '').replace(/^91/, ''); // strip +91 or 91 prefix

    const payload = {
      route: 'otp',
      variables_values: otp,
      numbers: cleanPhone
    };

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.return === true) {
      console.log(`✅ [SMS OTP SENT] To: +91${cleanPhone} via Fast2SMS`);
      return true;
    } else {
      console.error(`❌ [SMS OTP ERROR] Fast2SMS rejected: ${JSON.stringify(data)}`);
      console.log(`📱 [DEV FALLBACK OTP] To: ${phone} | Code: ${otp}`);
      return true;
    }
  } catch (err) {
    console.error(`❌ [SMS OTP ERROR] ${err.message}`);
    console.log(`📱 [DEV FALLBACK OTP] To: ${phone} | Code: ${otp}`);
    return true;
  }
};

module.exports = { sendEmailOTP, sendPhoneOTP };
