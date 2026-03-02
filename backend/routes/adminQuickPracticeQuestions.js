const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const XLSX = require('xlsx');
const { parse: parseCsv } = require('csv-parse/sync');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const QuickPracticeQuestion = require('../models/QuickPracticeQuestion');
const { ALLOWED_QUICK_PRACTICE_CATEGORIES } = require('../constants/quickPractice');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

router.use(authenticateToken, requireAdmin);

const normalizeCategory = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (!v) return '';
  if (v === 'js') return 'javascript';
  if (v === 'oops') return 'oop';
  if (v === 'data-structures' || v === 'data structures' || v === 'algorithms') return 'dsa';
  if (v === 'system design' || v === 'systemdesign') return 'system-design';
  if (v === 'network' || v === 'networking') return 'networks';
  if (ALLOWED_QUICK_PRACTICE_CATEGORIES.includes(v)) return v;
  // For admin imports: accept any non-empty category (admins are trusted)
  return v;
};

const normalizeDifficulty = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (['easy', 'medium', 'hard'].includes(v)) return v;
  return 'easy';
};

const splitTags = (value) => {
  if (value === null || value === undefined) return [];
  return String(value)
    .split(/[,|]/g)
    .map((x) => x.trim())
    .filter(Boolean);
};

const extractOptionsFromRow = (row) => {
  // Supports:
  // - options: "a|b|c|d"
  // - option1..option8 columns
  const fromOptionsCell = String(row.options || row.Options || '').trim();
  const options = [];

  if (fromOptionsCell) {
    fromOptionsCell
      .split('|')
      .map((x) => x.trim())
      .filter(Boolean)
      .forEach((x) => options.push(x));
  }

  for (let i = 1; i <= 8; i += 1) {
    const k1 = `option${i}`;
    const k2 = `Option${i}`;
    const v = String(row[k1] ?? row[k2] ?? '').trim();
    if (v) options.push(v);
  }

  // De-dupe while preserving order
  const seen = new Set();
  return options.filter((x) => {
    const k = x.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

const normalizeCorrectIndex = (value, optionsLength) => {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;

  // Accept 0-based or 1-based
  if (Number.isInteger(n)) {
    if (n >= 0 && n < optionsLength) return n;
    if (n >= 1 && n <= optionsLength) return n - 1;
  }
  return null;
};

// ── Embedded mock questions (Node.js + Linux quick practice set) ──────────────
const MOCK_SEED_QUESTIONS = [
  { category: 'mock', difficulty: 'medium', prompt: 'Why are inodes important?', options: ['Store file name','Store file data','Store file metadata','Store directory path'], correctIndex: 2, explanation: 'Inode stores metadata like permissions, owner, timestamps, and size but not filename or actual file data.', tags: ['linux','inode','filesystem'] },
  { category: 'mock', difficulty: 'easy', prompt: "What does fs.unlink('test.txt') do?", options: ['Create file','Rename file','Delete file','Read file'], correctIndex: 2, explanation: 'unlink deletes the specified file from the filesystem.', tags: ['nodejs','fs','filesystem'] },
  { category: 'mock', difficulty: 'easy', prompt: "What does path.resolve('test','demo.txt') do?", options: ['Deletes path','Creates file','Resolves to absolute path','Reads path'], correctIndex: 2, explanation: 'resolve converts given segments into an absolute path.', tags: ['nodejs','path','filesystem'] },
  { category: 'mock', difficulty: 'easy', prompt: "What is the result of fs.writeFileSync('test.txt','NodeJS')?", options: ["File is created with content 'NodeJS'",'File is empty','Error occurs','Nothing happens'], correctIndex: 0, explanation: 'writeFileSync creates or overwrites the file with provided content.', tags: ['nodejs','fs','synchronous'] },
  { category: 'mock', difficulty: 'easy', prompt: 'What does ~ represent in Linux?', options: ['Root','Temp','Home','Bin'], correctIndex: 2, explanation: 'Tilde (~) represents the current user\'s home directory.', tags: ['linux','paths','basics'] },
  { category: 'mock', difficulty: 'easy', prompt: 'What happens when opening http://localhost:3000 for the given server?', options: ['It will throw an error','It will print Hello in browser','Server will stop immediately','Nothing will happen'], correctIndex: 1, explanation: 'Server responds with "Hello" when accessed.', tags: ['nodejs','http','server'] },
  { category: 'mock', difficulty: 'medium', prompt: 'What is missing to handle requests in http.createServer(); server.listen(8000); ?', options: ['Port number','Callback function','Module import','File path'], correctIndex: 1, explanation: 'createServer requires a request handler callback to process requests.', tags: ['nodejs','http','server'] },
  { category: 'mock', difficulty: 'easy', prompt: "What does fs.exists('a.txt', callback) check?", options: ['File size','File content','If file exists','File type'], correctIndex: 2, explanation: 'exists checks whether the specified file is present.', tags: ['nodejs','fs','filesystem'] },
  { category: 'mock', difficulty: 'medium', prompt: "What does res.writeHead(200, {'Content-Type':'text/plain'}) do?", options: ['Closes server','Sets response header and status','Reads header','Deletes header'], correctIndex: 1, explanation: 'writeHead sets HTTP status code and response headers.', tags: ['nodejs','http','headers'] },
  { category: 'mock', difficulty: 'easy', prompt: "What does fs.appendFileSync('a.txt','Hello') do?", options: ['Deletes file','Appends Hello to file','Overwrites file','Reads file'], correctIndex: 1, explanation: 'appendFileSync adds content to the end of the file.', tags: ['nodejs','fs','synchronous'] },
  { category: 'mock', difficulty: 'medium', prompt: 'Which event is emitted when an HTTP server receives a request?', options: ['response','connect','receive','request'], correctIndex: 3, explanation: "The 'request' event is emitted whenever a client makes a request to the server.", tags: ['nodejs','http','events'] },
  { category: 'mock', difficulty: 'easy', prompt: 'Which property gives the file name from a path?', options: ['path.basename()','path.filename()','path.name()','path.file()'], correctIndex: 0, explanation: 'path.basename() returns the last portion (file name) of a path.', tags: ['nodejs','path','filesystem'] },
  { category: 'mock', difficulty: 'medium', prompt: "What is true about fs.readFile('abc.txt','utf8',callback)?", options: ['It reads file synchronously','It blocks event loop','It reads file asynchronously','It deletes file'], correctIndex: 2, explanation: 'readFile is asynchronous and does not block the event loop.', tags: ['nodejs','fs','async'] },
  { category: 'mock', difficulty: 'medium', prompt: "When will response be sent in the given server code checking req.method == 'POST'?", options: ['On GET request','On POST request','On DELETE request','Always'], correctIndex: 1, explanation: 'Response is sent only when request method is POST.', tags: ['nodejs','http','server'] },
  { category: 'mock', difficulty: 'easy', prompt: "What is the output of path.dirname('/home/user/app.js')?", options: ['/home/user','app.js','/home','user'], correctIndex: 0, explanation: 'dirname returns the directory portion of the path.', tags: ['nodejs','path','filesystem'] },
  { category: 'mock', difficulty: 'easy', prompt: "What is the output of path.basename('/home/user/file.txt')?", options: ['/home/user/file.txt','file','file.txt','txt'], correctIndex: 2, explanation: 'basename returns the file name including extension.', tags: ['nodejs','path','filesystem'] },
  { category: 'mock', difficulty: 'medium', prompt: 'According to Unix philosophy, why are small programs preferred?', options: ['They consume less RAM','They are easier to combine using pipes','They run faster always','They replace GUIs'], correctIndex: 1, explanation: 'Unix philosophy encourages small tools that can be combined using pipes.', tags: ['linux','unix','philosophy'] },
  { category: 'mock', difficulty: 'easy', prompt: 'Which statement is TRUE about Node.js?', options: ['It blocks execution','It is event-driven','It is multi-threaded by default','It runs only on Linux'], correctIndex: 1, explanation: 'Node.js follows an event-driven, non-blocking model.', tags: ['nodejs','architecture','event-loop'] },
  { category: 'mock', difficulty: 'easy', prompt: "What is the output of path.extname('index.html')?", options: ['html','.html','index','.index'], correctIndex: 1, explanation: 'extname returns the extension including the dot.', tags: ['nodejs','path','filesystem'] },
  { category: 'mock', difficulty: 'easy', prompt: "What is the output of new URL('https://example.com:8080/path').port?", options: ['80','8080','/path','null'], correctIndex: 1, explanation: 'The port property returns the port number in the URL.', tags: ['nodejs','url','web'] },
  { category: 'mock', difficulty: 'easy', prompt: "What is the output of myUrl.searchParams.get('name') for URL 'http://localhost:3000/test?name=Akki'?", options: ['name','Akki','null','test'], correctIndex: 1, explanation: 'searchParams.get returns the value of the given query parameter.', tags: ['nodejs','url','querystring'] },
  { category: 'mock', difficulty: 'easy', prompt: 'What is the main role of Git?', options: ['Running servers','Tracking changes','Compiling code','Managing database'], correctIndex: 1, explanation: 'Git is a version control system used to track code changes.', tags: ['git','basics','version-control'] },
  { category: 'mock', difficulty: 'easy', prompt: 'Which method returns total system memory in bytes?', options: ['os.memory()','os.totalmem()','os.ram()','os.meminfo()'], correctIndex: 1, explanation: 'os.totalmem() returns total system memory in bytes.', tags: ['nodejs','os','system'] },
  { category: 'mock', difficulty: 'medium', prompt: "What is the output of path.isAbsolute('/test/file')?", options: ['FALSE','TRUE','Error','/test/file'], correctIndex: 1, explanation: 'isAbsolute returns true for absolute paths.', tags: ['nodejs','path','filesystem'] },
  { category: 'mock', difficulty: 'medium', prompt: 'What is the issue in if (x = 5)?', options: ['Comparison operator used correctly','Assignment instead of comparison','Syntax error','Type error'], correctIndex: 1, explanation: "Single '=' performs assignment instead of comparison.", tags: ['javascript','operators','bug'] },
  { category: 'mock', difficulty: 'easy', prompt: 'Which method returns the home directory of current user?', options: ['os.home()','os.homedir()','os.userdir()','process.home()'], correctIndex: 1, explanation: 'os.homedir() returns the current user\'s home directory.', tags: ['nodejs','os','system'] },
  { category: 'mock', difficulty: 'medium', prompt: 'Why is Promise.all() used?', options: ['Sequential execution','Parallel execution','Stopping promises','Deleting promises'], correctIndex: 1, explanation: 'Promise.all executes multiple promises in parallel.', tags: ['nodejs','promise','async'] },
  { category: 'mock', difficulty: 'medium', prompt: "What does path.normalize('/test//demo/../file.txt') do?", options: ['Delete path','Cleans path structure','Create directory','Return filename'], correctIndex: 1, explanation: "normalize resolves '..' and redundant slashes.", tags: ['nodejs','path','filesystem'] },
  { category: 'mock', difficulty: 'easy', prompt: "What does fs.mkdir('testDir') do?", options: ['Create directory','Delete directory','Read directory','Rename directory'], correctIndex: 0, explanation: 'mkdir creates a new directory.', tags: ['nodejs','fs','filesystem'] },
  { category: 'mock', difficulty: 'medium', prompt: 'Which Git stage is correct order?', options: ['Add → Modify → Commit','Modify → Add → Commit','Commit → Add → Modify','Push → Commit → Add'], correctIndex: 1, explanation: 'Correct order is Modify → Add → Commit.', tags: ['git','workflow','staging'] },
  { category: 'mock', difficulty: 'medium', prompt: 'What type of operation is fs.readFileSync()?', options: ['Asynchronous','Event-driven','Synchronous blocking','Stream-based'], correctIndex: 2, explanation: 'readFileSync blocks execution until complete.', tags: ['nodejs','fs','synchronous'] },
  { category: 'mock', difficulty: 'easy', prompt: 'What HTTP status is sent when res.statusCode = 404?', options: ['200','500','404','302'], correctIndex: 2, explanation: '404 indicates resource not found.', tags: ['nodejs','http','statuscode'] },
  { category: 'mock', difficulty: 'easy', prompt: 'Which method returns CPU architecture?', options: ['os.platform()','os.arch()','os.cores()','os.processor()'], correctIndex: 1, explanation: "os.arch() returns architecture like x64.", tags: ['nodejs','os','module'] },
  { category: 'mock', difficulty: 'medium', prompt: "What is output of parsed.query.id for '?id=10'?", options: ['page','10','id','null'], correctIndex: 1, explanation: 'query.id returns 10.', tags: ['nodejs','url','querystring'] },
  { category: 'mock', difficulty: 'easy', prompt: "What is output of path.join('folder','file.txt')?", options: ['/folder/file.txt','folder/file.txt','Error','file.txt'], correctIndex: 1, explanation: 'path.join joins segments properly.', tags: ['nodejs','path','filesystem'] },
  { category: 'mock', difficulty: 'easy', prompt: 'Which module creates basic Node.js web server?', options: ['express','url','fs','http'], correctIndex: 3, explanation: 'http module creates web server.', tags: ['nodejs','http','server'] },
  { category: 'mock', difficulty: 'easy', prompt: "What is output of new URL('http://localhost:3000/about').pathname?", options: ['localhost','/about','3000','http'], correctIndex: 1, explanation: 'pathname returns the URL path.', tags: ['nodejs','url','web'] },
  { category: 'mock', difficulty: 'medium', prompt: 'What does req.url represent?', options: ['Server port','HTTP method','Requested URL path','Hostname'], correctIndex: 2, explanation: 'req.url stores requested path from client.', tags: ['nodejs','http','request'] },
  { category: 'mock', difficulty: 'medium', prompt: 'Which method converts relative path to absolute path?', options: ['path.absolute()','path.resolve()','path.fullpath()','path.abspath()'], correctIndex: 1, explanation: 'path.resolve converts to absolute path.', tags: ['nodejs','path','filesystem'] },
];

// POST /seed-mock  — inserts all embedded mock questions, skips duplicates
router.post('/seed-mock', async (req, res) => {
  try {
    let inserted = 0;
    let skipped = 0;
    const failures = [];

    for (const q of MOCK_SEED_QUESTIONS) {
      const exists = await QuickPracticeQuestion.findOne({ prompt: q.prompt, category: q.category }).select('_id').lean();
      if (exists) { skipped++; continue; }
      try {
        await QuickPracticeQuestion.create(q);
        inserted++;
      } catch (e) {
        failures.push({ prompt: q.prompt.slice(0, 60), error: e.message });
      }
    }

    return res.status(201).json({
      success: true,
      message: `Seed complete: ${inserted} inserted, ${skipped} already existed${failures.length ? `, ${failures.length} failed` : ''}`,
      data: { inserted, skipped, failed: failures.length, failures }
    });
  } catch (err) {
    console.error('seed-mock error:', err);
    return res.status(500).json({ success: false, message: 'Seed failed: ' + err.message });
  }
});

router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const filename = String(req.file.originalname || '').toLowerCase();
    const ext = filename.split('.').pop();

    let rows = [];
    if (ext === 'csv') {
      const text = req.file.buffer.toString('utf8');
      rows = parseCsv(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type. Upload .csv, .xlsx, or .xls'
      });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No rows found in file' });
    }

    const failures = [];
    const docs = [];

    rows.forEach((row, idx) => {
      const rowNumber = idx + 2; // assuming headers at row 1

      const category = normalizeCategory(row.category ?? row.Category);
      const prompt = String(row.prompt ?? row.Prompt ?? '').trim();
      const difficulty = normalizeDifficulty(row.difficulty ?? row.Difficulty);
      const explanation = String(row.explanation ?? row.Explanation ?? '').trim();
      const tags = splitTags(row.tags ?? row.Tags);
      const options = extractOptionsFromRow(row);
      const correctIndex = normalizeCorrectIndex(row.correctIndex ?? row.CorrectIndex ?? row.correct_index ?? row.correct ?? row.Correct, options.length);

      if (!category) {
        failures.push({ row: rowNumber, message: `Invalid category (allowed: ${ALLOWED_QUICK_PRACTICE_CATEGORIES.join('/')})` });
        return;
      }
      if (!prompt) {
        failures.push({ row: rowNumber, message: 'Prompt is required' });
        return;
      }
      if (!options || options.length < 2) {
        failures.push({ row: rowNumber, message: 'Need at least 2 options' });
        return;
      }
      if (correctIndex === null) {
        failures.push({ row: rowNumber, message: `Invalid correctIndex (use 0-${options.length - 1} or 1-${options.length})` });
        return;
      }

      docs.push({
        category,
        prompt,
        options,
        correctIndex,
        explanation,
        difficulty,
        tags
      });
    });

    if (docs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid rows to import',
        data: { inserted: 0, failed: failures.length, failures }
      });
    }

    // Insert one-by-one so a single row validation error never kills the whole batch
    let inserted = 0;
    for (const doc of docs) {
      try {
        await QuickPracticeQuestion.create(doc);
        inserted++;
      } catch (e) {
        console.error('Row insert error:', e.message, '| prompt:', doc.prompt?.slice(0, 60));
        failures.push({ row: `prompt: ${doc.prompt?.slice(0, 60)}`, message: e.message });
      }
    }

    return res.status(201).json({
      success: true,
      message: `Import completed: ${inserted} inserted, ${failures.length} failed`,
      data: {
        inserted,
        failed: failures.length,
        failures
      }
    });
  } catch (err) {
    console.error('admin quick practice import error:', err);
    return res.status(500).json({ success: false, message: 'Import error: ' + err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const category = String(req.query.category || '').trim().toLowerCase();
    const difficulty = String(req.query.difficulty || '').trim().toLowerCase();

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    const filter = {};
    if (category && ALLOWED_QUICK_PRACTICE_CATEGORIES.includes(category)) filter.category = category;
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) filter.difficulty = difficulty;
    if (q) {
      filter.$or = [{ prompt: { $regex: q, $options: 'i' } }, { tags: { $in: [new RegExp(q, 'i')] } }];
    }

    const [items, total] = await Promise.all([
      QuickPracticeQuestion.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      QuickPracticeQuestion.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        items,
        page,
        limit,
        total
      }
    });
  } catch (err) {
    console.error('admin quick practice list error:', err);
    res.status(500).json({ success: false, message: 'Failed to load questions' });
  }
});

router.post(
  '/',
  [
    body('category').isString().trim().notEmpty().withMessage('Category is required'),
    // Admin is trusted – accept any non-empty category (mock, mock1, mock2, …)
    body('prompt').isString().trim().notEmpty().withMessage('Prompt is required'),
    body('options').isArray({ min: 2 }).withMessage('Options must be an array with at least 2 items'),
    body('options.*').isString().trim().notEmpty().withMessage('Each option must be a non-empty string'),
    body('correctIndex').isInt({ min: 0 }).withMessage('correctIndex must be a number >= 0'),
    body('explanation').optional().isString(),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
    body('tags').optional().isArray().withMessage('tags must be an array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { category, prompt, options, correctIndex, explanation, tags, difficulty } = req.body;

      const doc = await QuickPracticeQuestion.create({
        category,
        prompt,
        options,
        correctIndex,
        explanation: explanation || '',
        tags: Array.isArray(tags) ? tags : [],
        difficulty: difficulty || 'easy'
      });

      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      console.error('admin quick practice create error:', err);
      res.status(500).json({ success: false, message: 'Failed to create question' });
    }
  }
);

router.put(
  '/:id',
  [
    body('category').optional().isString().trim().notEmpty().withMessage('Category must be a non-empty string'),
    // Admin is trusted – accept any non-empty category
    body('prompt').optional().isString().trim().notEmpty().withMessage('Prompt must be a non-empty string'),
    body('options').optional().isArray({ min: 2 }).withMessage('Options must be an array with at least 2 items'),
    body('options.*').optional().isString().trim().notEmpty().withMessage('Each option must be a non-empty string'),
    body('correctIndex').optional().isInt({ min: 0 }).withMessage('correctIndex must be a number >= 0'),
    body('explanation').optional().isString(),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
    body('tags').optional().isArray().withMessage('tags must be an array')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const updated = await QuickPracticeQuestion.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      if (!updated) return res.status(404).json({ success: false, message: 'Question not found' });

      res.json({ success: true, data: updated });
    } catch (err) {
      console.error('admin quick practice update error:', err);
      res.status(500).json({ success: false, message: 'Failed to update question' });
    }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await QuickPracticeQuestion.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('admin quick practice delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete question' });
  }
});

module.exports = router;
