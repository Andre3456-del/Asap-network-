const fetch = require('node-fetch');

const SYSTEM_PROMPT = `You are Asap Network, an intelligent Telegram bot that teaches people about blockchain, crypto, Web3, DeFi, NFTs, and DAOs.
Keep answers concise (2-3 sentences max), beginner-friendly, and informative.
Be helpful and encouraging. When relevant, mention: "Learn more: /pay"`;

async function askGroq(question, context) {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    console.warn('⚠️  GROQ_API_KEY not set');
    return null;
  }

  try {
    console.log(`🧠 Asking Groq: "${question.substring(0, 50)}..."`);
    
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...(context ? [{ role: 'system', content: `Context:\n${context}` }] : []),
          { role: 'user', content: question },
        ],
        max_tokens: 256,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Groq API error (${res.status}): ${errorText}`);
      return null;
    }

    const data = await res.json();
    
    if (!data.ok && data.error) {
      console.error(`❌ Groq error: ${data.error.message}`);
      return null;
    }

    const answer = data?.choices?.[0]?.message?.content || null;
    if (answer) {
      console.log(`✅ Groq responded: "${answer.substring(0, 50)}..."`);
    }
    return answer;
  } catch (err) {
    console.error(`❌ Groq call failed: ${err.message}`);
    return null;
  }
}

async function askOpenAI(question, context) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
    console.log(`🧠 Asking OpenAI: "${question.substring(0, 50)}..."`);
    
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...(context ? [{ role: 'system', content: `Context:\n${context}` }] : []),
          { role: 'user', content: question },
        ],
        max_tokens: 256,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ OpenAI error (${res.status}): ${errorText}`);
      return null;
    }

    const data = await res.json();
    const answer = data?.choices?.[0]?.message?.content || null;
    if (answer) {
      console.log(`✅ OpenAI responded`);
    }
    return answer;
  } catch (err) {
    console.error(`❌ OpenAI call failed: ${err.message}`);
    return null;
  }
}

/**
 * Answer any question using AI. Tries Groq first, falls back to OpenAI,
 * falls back to a helpful message if both fail.
 */
async function answerQuestion(question) {
  if (!question || question.trim().length === 0) {
    return "I didn't quite catch that. Ask me anything about Web3! 🚀";
  }

  // Try Groq first (fast and free tier available)
  const groqAnswer = await askGroq(question);
  if (groqAnswer) return groqAnswer;

  // Try OpenAI if Groq fails
  const openaiAnswer = await askOpenAI(question);
  if (openaiAnswer) return openaiAnswer;

  // Fallback if both AI services fail
  return "🧠 My brain is taking a break! Try again in a moment.\n\nOr ask me something else about Web3.";
}

module.exports = { answerQuestion };
