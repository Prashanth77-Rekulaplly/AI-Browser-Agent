import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('data');

/**
 * Ensures the data directory exists.
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Reads a JSON file safely.
 * @param {string} filename
 * @param {any} [defaultValue={}]
 * @returns {any}
 */
export function readJsonFile(filename, defaultValue = {}) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`[DB Error] Failed to read ${filename}:`, error.message);
    return defaultValue;
  }
}

/**
 * Writes a JSON file atomically.
 * @param {string} filename
 * @param {any} data
 */
export function writeJsonFile(filename, data) {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  const tempPath = `${filePath}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    console.error(`[DB Error] Failed to write ${filename}:`, error.message);
  }
}
