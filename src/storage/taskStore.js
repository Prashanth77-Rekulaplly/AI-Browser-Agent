import { readJsonFile, writeJsonFile } from './db.js';

const TASKS_FILE = 'tasks.json';

/**
 * @typedef {Object} TaskRecord
 * @property {string} id
 * @property {string} rawPrompt
 * @property {string} title
 * @property {string} status - 'CREATED'|'ANALYZING'|'PLANNING'|'RUNNING'|'WAITING_CONFIRMATION'|'HUMAN_TAKEOVER'|'VERIFYING'|'COMPLETED'|'FAILED'|'PAUSED'
 * @property {Object} interpretation
 * @property {Array} plan
 * @property {Array} steps
 * @property {Array} timeline
 * @property {Array} screenshots
 * @property {Array} sources
 * @property {Object} finalResult
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * Gets all saved tasks.
 * @returns {TaskRecord[]}
 */
export function getAllTasks() {
  const data = readJsonFile(TASKS_FILE, { tasks: [] });
  return data.tasks || [];
}

/**
 * Gets a task by ID.
 * @param {string} id
 * @returns {TaskRecord | null}
 */
export function getTaskById(id) {
  const tasks = getAllTasks();
  return tasks.find((t) => t.id === id) || null;
}

/**
 * Saves or updates a task.
 * @param {TaskRecord} task
 */
export function saveTask(task) {
  const tasks = getAllTasks();
  const index = tasks.findIndex((t) => t.id === task.id);
  task.updatedAt = new Date().toISOString();

  if (index >= 0) {
    tasks[index] = task;
  } else {
    task.createdAt = task.createdAt || new Date().toISOString();
    tasks.unshift(task);
  }

  writeJsonFile(TASKS_FILE, { tasks });
  return task;
}

/**
 * Creates a new task initialized with default state.
 * @param {string} prompt
 * @returns {TaskRecord}
 */
export function createNewTask(prompt) {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const id = `TASK-${timestamp}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const task = {
    id,
    rawPrompt: prompt,
    title: prompt.slice(0, 80),
    status: 'CREATED',
    interpretation: null,
    plan: [],
    steps: [],
    timeline: [
      {
        id: 'event-1',
        time: new Date().toISOString(),
        type: 'CREATED',
        message: `Task initialized: "${prompt.slice(0, 60)}"`,
      },
    ],
    screenshots: [],
    sources: [],
    finalResult: null,
    pendingConfirmation: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return saveTask(task);
}

/**
 * Adds an event to the task activity timeline.
 * @param {string} taskId
 * @param {string} type
 * @param {string} message
 * @param {Object} [metadata]
 */
export function logTaskActivity(taskId, type, message, metadata = {}) {
  const task = getTaskById(taskId);
  if (!task) return;

  const event = {
    id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    time: new Date().toISOString(),
    type,
    message,
    ...metadata,
  };

  task.timeline.push(event);
  saveTask(task);
  return event;
}

/**
 * Deletes a task by ID.
 * @param {string} id
 */
export function deleteTask(id) {
  const tasks = getAllTasks().filter((t) => t.id !== id);
  writeJsonFile(TASKS_FILE, { tasks });
}
