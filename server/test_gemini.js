require('dotenv').config();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ Error: GEMINI_API_KEY environment variable is not set. Please set it before running this script.');
  process.exit(1);
}

async function run() {
  for (const model of ['gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3.6-flash']) {
    console.log('Testing model:', model);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'मेरी बेटी 12वीं पास है और इंजीनियर बनना चाहती है लेकिन पैसे नहीं हैं। सरकार की कौन-सी योजनाएं हैं जो उसकी पढ़ाई का पूरा खर्च उठाएंगी?' }]
          }]
        })
      });
      const data = await res.json();
      console.log('Data keys:', Object.keys(data));
      if (data.candidates && data.candidates[0]?.content?.parts) {
        const textParts = data.candidates[0].content.parts.filter(p => !p.thought && p.text);
        console.log('SUCCESS with', model, ':\n', textParts.map(p => p.text).join('\n'));
        break;
      } else {
        console.log('Error response:', data.error || data);
      }
    } catch (e) {
      console.error('Error with', model, e.message);
    }
  }
}

run();
