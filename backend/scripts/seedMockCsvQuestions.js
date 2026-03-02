/**
 * One-time seed script: imports all questions from
 * quick-practice-questions-template (6).csv  (the "mock" Node.js / Linux set)
 * into the QuickPracticeQuestion collection.
 *
 * Run from the backend folder:
 *   node scripts/seedMockCsvQuestions.js
 *
 * Safe to run multiple times — skips rows whose prompt already exists.
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { parse: parseCsv } = require('csv-parse/sync');
const QuickPracticeQuestion = require('../models/QuickPracticeQuestion');
const { ALLOWED_QUICK_PRACTICE_CATEGORIES } = require('../constants/quickPractice');

// ── helpers (same logic as adminQuickPracticeQuestions route) ────────────────

const normalizeCategory = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'js') return 'javascript';
  if (v === 'oops') return 'oop';
  if (v === 'data-structures' || v === 'data structures' || v === 'algorithms') return 'dsa';
  if (v === 'system design' || v === 'systemdesign') return 'system-design';
  if (v === 'network' || v === 'networking') return 'networks';
  if (ALLOWED_QUICK_PRACTICE_CATEGORIES.includes(v)) return v;
  return '';
};

const normalizeDifficulty = (value) => {
  const v = String(value || '').trim().toLowerCase();
  return ['easy', 'medium', 'hard'].includes(v) ? v : 'easy';
};

const splitTags = (value) => {
  if (value === null || value === undefined) return [];
  return String(value).split(/[,|]/g).map((x) => x.trim()).filter(Boolean);
};

const extractOptions = (row) => {
  const fromOptionsCell = String(row.options || row.Options || '').trim();
  const options = [];
  if (fromOptionsCell) {
    fromOptionsCell.split('|').map((x) => x.trim()).filter(Boolean).forEach((x) => options.push(x));
  }
  for (let i = 1; i <= 8; i++) {
    const v = String(row[`option${i}`] ?? row[`Option${i}`] ?? '').trim();
    if (v) options.push(v);
  }
  const seen = new Set();
  return options.filter((x) => {
    const k = x.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const normalizeCorrectIndex = (value, len) => {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  if (n >= 0 && n < len) return n;
  if (n >= 1 && n <= len) return n - 1;
  return null;
};

// ── main ─────────────────────────────────────────────────────────────────────

(async () => {
  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('ERROR: MONGODB_URI is not set in .env');
    process.exit(1);
  }

  // Resolve CSV path relative to repo root (two levels up from backend/scripts/)
  const csvPath = path.resolve(__dirname, '../../quick-practice-questions-template (6).csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`ERROR: CSV file not found at:\n  ${csvPath}`);
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const text = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCsv(text, { columns: true, skip_empty_lines: true, trim: true });
  console.log(`Parsed ${rows.length} rows from CSV`);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const [idx, row] of rows.entries()) {
    const rowNum = idx + 2;
    const category = normalizeCategory(row.category ?? row.Category);
    const prompt = String(row.prompt ?? row.Prompt ?? '').trim();
    const difficulty = normalizeDifficulty(row.difficulty ?? row.Difficulty);
    const explanation = String(row.explanation ?? row.Explanation ?? '').trim();
    const tags = splitTags(row.tags ?? row.Tags);
    const options = extractOptions(row);
    const correctIndex = normalizeCorrectIndex(
      row.correctIndex ?? row.CorrectIndex ?? row.correct_index ?? row.correct ?? row.Correct,
      options.length
    );

    if (!category) { console.warn(`Row ${rowNum}: invalid category "${row.category}" — skipped`); failed++; continue; }
    if (!prompt)    { console.warn(`Row ${rowNum}: empty prompt — skipped`); failed++; continue; }
    if (options.length < 2) { console.warn(`Row ${rowNum}: need ≥2 options — skipped`); failed++; continue; }
    if (correctIndex === null) { console.warn(`Row ${rowNum}: invalid correctIndex "${row.correctIndex}" — skipped`); failed++; continue; }

    // Skip duplicates (match on prompt + category)
    const exists = await QuickPracticeQuestion.findOne({ prompt, category }).select('_id').lean();
    if (exists) {
      skipped++;
      continue;
    }

    await QuickPracticeQuestion.create({ category, prompt, options, correctIndex, explanation, difficulty, tags });
    inserted++;
    console.log(`  ✓ [${rowNum}] ${prompt.slice(0, 70)}`);
  }

  console.log(`\nDone — inserted: ${inserted}, skipped (already exist): ${skipped}, failed: ${failed}`);
  await mongoose.disconnect();
  process.exit(0);
})();
