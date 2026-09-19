import { readJsonFile, writeJsonFile } from './db.js';

const WORKFLOWS_FILE = 'workflows.json';

const DEFAULT_WORKFLOWS = [
  {
    id: 'wf-tech-research',
    name: 'Tech & Laptop Research',
    description: 'Searches multiple sources, extracts hardware specs, verifies benchmarks, and builds a ranking.',
    promptTemplate: 'Research the best laptops for machine learning under {budget}, compare at least 5 sources, collect specs, and provide the top 3 options with citations.',
    category: 'Research',
    parameters: [{ key: 'budget', label: 'Budget', default: '₹100,000' }],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wf-docs-summarize',
    name: 'Documentation Deep Dive',
    description: 'Navigates official library/framework documentation, inspects release notes, and summarizes recent changes.',
    promptTemplate: 'Go to the official documentation for {technology}, inspect the latest release notes, and summarize the key API changes and features.',
    category: 'Documentation',
    parameters: [{ key: 'technology', label: 'Technology / Library', default: 'Node.js' }],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wf-wikipedia-summary',
    name: 'Wikipedia Knowledge Synthesis',
    description: 'Searches Wikipedia for a topic, extracts key sections, and produces an executive briefing with citations.',
    promptTemplate: 'Search Wikipedia for {topic}, extract key milestones, and generate a concise executive summary with sources.',
    category: 'Knowledge',
    parameters: [{ key: 'topic', label: 'Topic', default: 'Artificial Intelligence' }],
    createdAt: new Date().toISOString(),
  },
];

/**
 * Gets all saved workflows.
 */
export function getAllWorkflows() {
  const data = readJsonFile(WORKFLOWS_FILE, { workflows: DEFAULT_WORKFLOWS });
  return data.workflows || DEFAULT_WORKFLOWS;
}

/**
 * Saves a new or updated workflow.
 * @param {Object} workflow
 */
export function saveWorkflow(workflow) {
  const workflows = getAllWorkflows();
  const index = workflows.findIndex((w) => w.id === workflow.id);
  if (index >= 0) {
    workflows[index] = { ...workflows[index], ...workflow, updatedAt: new Date().toISOString() };
  } else {
    workflow.id = workflow.id || `wf-${Date.now()}`;
    workflow.createdAt = new Date().toISOString();
    workflows.unshift(workflow);
  }
  writeJsonFile(WORKFLOWS_FILE, { workflows });
  return workflow;
}

/**
 * Deletes a workflow by ID.
 * @param {string} id
 */
export function deleteWorkflow(id) {
  const workflows = getAllWorkflows().filter((w) => w.id !== id);
  writeJsonFile(WORKFLOWS_FILE, { workflows });
}
