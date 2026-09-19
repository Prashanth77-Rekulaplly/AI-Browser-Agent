export type TaskStatus =
  | 'IDLE'
  | 'CREATED'
  | 'ANALYZING'
  | 'PLANNING'
  | 'READY'
  | 'RUNNING'
  | 'WAITING_CLARIFICATION'
  | 'WAITING_CONFIRMATION'
  | 'HUMAN_TAKEOVER'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED'
  | 'PAUSED'
  | 'STOPPED';

export interface PlanStep {
  id: string;
  description: string;
  requiredTool?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'waiting_for_user';
  dependencies?: string[];
  result?: any;
  screenshots?: string[];
}

export interface TimelineEvent {
  id: string;
  time: string;
  type: string;
  message: string;
  [key: string]: any;
}

export interface ScreenshotMeta {
  path: string;
  filename: string;
  time: string;
  step: number;
  url?: string;
}

export interface SourceCitation {
  id: string;
  title: string;
  url: string;
  type: string;
  checkedAt: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  whyNeeded: string;
  suggestedOptions?: string[];
}

export interface TaskRecord {
  id: string;
  rawPrompt: string;
  title: string;
  status: TaskStatus;
  interpretation?: {
    goal: string;
    desiredOutcome?: string;
    entities?: Array<{ name: string; type: string; role: string }>;
    actions?: string[];
    constraints?: string[];
    preferences?: string[];
    requiredContext?: string[];
    providedContext?: string[];
    missingContext?: Array<{ field: string; isEssential: boolean; canInfer: boolean; rationale: string }>;
    assumptions?: Array<{ assumption: string; confidence: number; isSafe: boolean }>;
    uncertainties?: string[];
    riskLevel?: string;
    requiresClarification?: boolean;
    clarificationQuestions?: ClarificationQuestion[];
    requiresConfirmation?: boolean;
    requiresHumanTakeover?: boolean;
    executionStrategy?: string;
  } | null;
  plan: PlanStep[];
  steps: Array<{
    iteration: number;
    tool: string;
    args: any;
    result: any;
    time: string;
  }>;
  timeline: TimelineEvent[];
  screenshots: ScreenshotMeta[];
  sources: SourceCitation[];
  finalResult?: {
    summary?: string;
    verification?: {
      isVerified: boolean;
      confidenceScore: number;
      evidence: string[];
      warnings: string[];
      keyHighlights: string[];
    };
    completedAt?: string;
    error?: string;
  } | null;
  pendingConfirmation?: {
    tool: string;
    args: any;
    reason: string;
    details: any;
  } | null;
  pendingClarification?: {
    questions: ClarificationQuestion[];
    rationale: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  category: string;
  parameters: Array<{ key: string; label: string; default: string }>;
  createdAt: string;
}

export interface MemorySettings {
  preferences: {
    preferredLanguage: string;
    preferredCurrency: string;
    researchDepth: string;
    defaultSearchEngine: string;
    headlessMode: boolean;
  };
  customRules: string[];
}

export interface PermissionSettings {
  [key: string]: 'ALLOWED' | 'ASK' | 'BLOCKED';
}
