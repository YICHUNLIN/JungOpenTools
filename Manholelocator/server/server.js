/**
 * Manhole Locator — 後台 API 伺服器
 *
 * 資料結構：
 *   data/
 *     {phone}-{uuid}/          ← userKey（一支手機一個資料夾）
 *       {record-uuid}.json     ← 每一筆施工前記錄
 *
 * API：
 *   POST   /api/register                      登錄手機號碼，取得 userKey
 *   POST   /api/records/:userKey              上傳一筆記錄
 *   GET    /api/records/:userKey              列出所有記錄（不含圖片）
 *   GET    /api/records/:userKey/:recordId    取得單一記錄（含圖片）
 *   DELETE /api/records/:userKey/:recordId    刪除單一記錄
 */

'use strict';

const express  = require('express');
const cors     = require('cors');
const fs       = require('fs');
const path     = require('path');
const { v4: uuidv4 } = require('uuid');

// ── 設定 ──────────────────────────────────────────────────────────────────────

const PORT     = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// ── 初始化 ────────────────────────────────────────────────────────────────────

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));   // 記錄含 base64 圖片，需要大 payload

// ── 工具函式 ──────────────────────────────────────────────────────────────────

/**
 * 驗證 userKey 格式（防止路徑穿越）：只允許數字、字母、底線、連字號
 */
function validKey(key) {
  return /^[\w-]{4,128}$/.test(key);
}

/**
 * 驗證 recordId 格式（UUID v4）
 */
function validRecordId(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/**
 * 取得並確認 userKey 資料夾存在
 */
function userDir(userKey) {
  return path.join(DATA_DIR, userKey);
}

/**
 * 從記錄中移除 before_photo，供列表回應使用（節省流量）
 */
function stripPhoto(rec) {
  const { before_photo, ...rest } = rec;   // eslint-disable-line no-unused-vars
  return rest;
}

/**
 * 從 data/ 裡找到含此 phone 的資料夾（phone 為 userKey 的前半段）
 */
function findUserKey(phone) {
  if (!fs.existsSync(DATA_DIR)) return null;
  const dirs = fs.readdirSync(DATA_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith(phone + '-'))
    .map(d => d.name);
  return dirs.length > 0 ? dirs[0] : null;
}

// ── 路由 ──────────────────────────────────────────────────────────────────────

/**
 * POST /api/register
 * Body: { phone: "0912345678" }
 * 若此手機號碼已有資料夾 → 回傳既有 userKey
 * 若無 → 建立新資料夾並回傳
 */
app.post('/api/register', (req, res) => {
  const phone = (req.body.phone || '').trim();

  if (!/^\+?[\d]{6,20}$/.test(phone)) {
    return res.status(400).json({ error: '手機號碼格式不正確' });
  }

  let userKey = findUserKey(phone);

  if (!userKey) {
    userKey = `${phone}-${uuidv4()}`;
    fs.mkdirSync(userDir(userKey), { recursive: true });
  }

  return res.json({ userKey });
});

/**
 * POST /api/records/:userKey
 * Body: 記錄 JSON（含 before_photo base64）
 * 回傳: { recordId }
 */
app.post('/api/records/:userKey', (req, res) => {
  const { userKey } = req.params;

  if (!validKey(userKey)) return res.status(400).json({ error: 'userKey 格式錯誤' });

  const dir = userDir(userKey);
  if (!fs.existsSync(dir)) return res.status(404).json({ error: '使用者不存在，請先 /register' });

  const record = req.body;
  if (!record || typeof record !== 'object') {
    return res.status(400).json({ error: '記錄格式錯誤' });
  }

  const recordId = uuidv4();
  const filePath = path.join(dir, `${recordId}.json`);

  record._recordId   = recordId;
  record._uploadedAt = new Date().toISOString();

  fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf8');

  return res.status(201).json({ recordId });
});

/**
 * GET /api/records/:userKey
 * 列出所有記錄（移除 before_photo，只留 meta）
 */
app.get('/api/records/:userKey', (req, res) => {
  const { userKey } = req.params;

  if (!validKey(userKey)) return res.status(400).json({ error: 'userKey 格式錯誤' });

  const dir = userDir(userKey);
  if (!fs.existsSync(dir)) return res.status(404).json({ error: '使用者不存在' });

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  const records = files.map(f => {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      return stripPhoto(raw);
    } catch {
      return null;
    }
  }).filter(Boolean);

  // 依上傳時間倒序
  records.sort((a, b) => new Date(b._uploadedAt) - new Date(a._uploadedAt));

  return res.json({ records });
});

/**
 * GET /api/records/:userKey/:recordId
 * 取得單一完整記錄（含 before_photo）
 */
app.get('/api/records/:userKey/:recordId', (req, res) => {
  const { userKey, recordId } = req.params;

  if (!validKey(userKey))       return res.status(400).json({ error: 'userKey 格式錯誤' });
  if (!validRecordId(recordId)) return res.status(400).json({ error: 'recordId 格式錯誤' });

  const filePath = path.join(userDir(userKey), `${recordId}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: '記錄不存在' });

  try {
    const record = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return res.json(record);
  } catch {
    return res.status(500).json({ error: '記錄讀取失敗' });
  }
});

/**
 * DELETE /api/records/:userKey/:recordId
 */
app.delete('/api/records/:userKey/:recordId', (req, res) => {
  const { userKey, recordId } = req.params;

  if (!validKey(userKey))       return res.status(400).json({ error: 'userKey 格式錯誤' });
  if (!validRecordId(recordId)) return res.status(400).json({ error: 'recordId 格式錯誤' });

  const filePath = path.join(userDir(userKey), `${recordId}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: '記錄不存在' });

  fs.unlinkSync(filePath);
  return res.json({ deleted: recordId });
});

// ── 啟動 ──────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅  Manhole Locator 後台啟動：http://localhost:${PORT}`);
  console.log(`📁  資料目錄：${DATA_DIR}`);
});
