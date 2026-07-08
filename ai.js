const fetch = require('node-fetch');
const { searchKnowledge } = require('./knowledge');

const SYSTEM_PROMPT = `You are Web3 Learn AI, a friendly Telegram bot that teaches people about blockchain, crypto, DeFi, NFTs, and DAOs.
Keep answers short (2-4 sentences), beginner-friendly, and end by nudging toward the paid courses when relevant ("Courses from $10: /pay").
Use any provided context if it's relevant, but don't force it.`;

async function askGroq(question, context) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...(context ? [{ role: 'system', content: `Relevant context:\n${context}` }] : []),
          { role: 'user', content: question },
        ],
        max_tokens: 300,
      }),
    });
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('Groq call failed:', err.message);
    return null;
  }
}

async function askOpenAI(question, context) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
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
          ...(context ? [{ role: 'system', content: `Relevant context:\n${context}` }] : []),
          { role: 'user', content: question },
        ],
        max_tokens: 300,
      }),
    });
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('OpenAI call failed:', err.message);
    return null;
  }
}

/**
 * Answers a free-form Web3 question. Tries Groq first, falls back to OpenAI,
 * falls back to a canned response if both are unavailable/fail.
 */
async function answerQuestion(question) {
  const context = searchKnowledge(question);

  const groqAnswer = await askGroq(question, context);
  if (groqAnswer) return groqAnswer;

  const openaiAnswer = await askOpenAI(question, context);
  if (openaiAnswer) return openaiAnswer;

  return "Quick brain freeze \u{1F9CA} — I couldn't reach my AI brain just now. Try again in a bit!\n\nCourses from $10: /pay";
}

module.exports = { answerQuestion };
