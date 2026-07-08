const fs = require('fs');
const path = require('path');

const KB_PATH = path.join(__dirname, '..', '..', 'data', 'web3-knowledge.md');
const VIDEOS_PATH = path.join(__dirname, '..', '..', 'data', 'web3-videos.md');

function loadFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

/** Returns the markdown section (## Heading ... until next ##) matching a heading name. */
function getSection(markdown, headingName) {
  const lines = markdown.split('\n');
  const startIdx = lines.findIndex((l) => l.trim().toLowerCase() === `## ${headingName}`.toLowerCase());
  if (startIdx === -1) return null;
  let endIdx = lines.findIndex((l, i) => i > startIdx && l.trim().startsWith('## '));
  if (endIdx === -1) endIdx = lines.length;
  return lines.slice(startIdx, endIdx).join('\n').trim();
}

function getCourseOfferings() {
  const md = loadFile(KB_PATH);
  return getSection(md, 'Course Offerings') || '(No course list configured yet — edit data/web3-knowledge.md)';
}

function getPricing() {
  const md = loadFile(KB_PATH);
  return getSection(md, 'Pricing') || '(No pricing configured yet — edit data/web3-knowledge.md)';
}

/** Very simple keyword search across the knowledge base for AI grounding / fallback answers. */
function searchKnowledge(query) {
  const md = loadFile(KB_PATH);
  const q = query.toLowerCase();
  const blocks = md.split(/\n(?=## )/);
  const hit = blocks.find((b) => b.toLowerCase().includes(q));
  return hit ? hit.trim() : '';
}

/** Find a relevant video link by topic keyword. Expects lines like: `- [Title](url) - keywords: defi, yield` */
function findVideo(topic) {
  const md = loadFile(VIDEOS_PATH);
  const q = topic.toLowerCase();
  const lines = md.split('\n').filter((l) => l.trim().startsWith('-'));
  const hit = lines.find((l) => l.toLowerCase().includes(q));
  if (!hit) return null;
  const match = hit.match(/\[(.*?)\]\((.*?)\)/);
  return match ? { title: match[1], url: match[2] } : null;
}

module.exports = { getCourseOfferings, getPricing, searchKnowledge, findVideo };
