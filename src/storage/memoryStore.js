import { readJsonFile, writeJsonFile } from './db.js';

const MEMORY_FILE = 'memory.json';

const DEFAULT_MEMORY = {
  preferences: {
    preferredLanguage: 'English',
    preferredCurrency: 'INR',
    researchDepth: 'detailed',
    defaultSearchEngine: 'Google',
    headlessMode: false,
  },
  customRules: [
    'Prefer authoritative primary sources (e.g. official documentation, research papers).',
    'Always verify pricing across at least 2 distinct retailers before recommending.',
  ],
  rememberedContext: {},
};

/**
 * Gets user memory and preferences.
 */
export function getMemory() {
  return readJsonFile(MEMORY_FILE, DEFAULT_MEMORY);
}

/**
 * Updates memory and preferences.
 * @param {Object} memoryUpdate
 */
export function updateMemory(memoryUpdate) {
  const current = getMemory();
  const updated = {
    ...current,
    ...memoryUpdate,
    preferences: {
      ...current.preferences,
      ...(memoryUpdate.preferences || {}),
    },
  };
  writeJsonFile(MEMORY_FILE, updated);
  return updated;
}
