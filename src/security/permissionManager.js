import { readJsonFile, writeJsonFile } from '../storage/db.js';

const PERMISSIONS_FILE = 'permissions.json';

export const PermissionLevel = {
  ALLOWED: 'ALLOWED',
  ASK: 'ASK',
  BLOCKED: 'BLOCKED',
};

const DEFAULT_PERMISSIONS = {
  browserAccess: PermissionLevel.ALLOWED,
  webResearch: PermissionLevel.ALLOWED,
  readPage: PermissionLevel.ALLOWED,
  takeScreenshots: PermissionLevel.ALLOWED,
  submitForms: PermissionLevel.ASK,
  sendEmail: PermissionLevel.ASK,
  makePurchases: PermissionLevel.ASK,
  makePayments: PermissionLevel.ASK,
  deleteData: PermissionLevel.ASK,
  socialMediaPosting: PermissionLevel.ASK,
  localFileAccess: PermissionLevel.BLOCKED,
};

/**
 * Gets all user permissions.
 */
export function getPermissions() {
  return readJsonFile(PERMISSIONS_FILE, DEFAULT_PERMISSIONS);
}

/**
 * Updates permissions settings.
 * @param {Record<string, string>} newPermissions
 */
export function updatePermissions(newPermissions) {
  const current = getPermissions();
  const updated = { ...current, ...newPermissions };
  writeJsonFile(PERMISSIONS_FILE, updated);
  return updated;
}
