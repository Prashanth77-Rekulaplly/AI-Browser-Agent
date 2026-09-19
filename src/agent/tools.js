import { Type } from '@google/genai';
import { validateUrlSecurity } from './guardrails.js';

/**
 * Structured tool declarations for the Gemini model.
 */
export const browserToolDeclarations = [
  {
    name: 'open_url',
    description: 'Navigates the browser to the specified URL.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        url: {
          type: Type.STRING,
          description: 'The target URL to navigate to, e.g. https://www.google.com',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'read_page',
    description: 'Reads current page status, including URL, title, key headings, and visible interactive elements.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'type_text',
    description: 'Types text into an input field or textarea identified by CSS selector, optionally pressing Enter.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        selector: {
          type: Type.STRING,
          description: 'CSS selector targeting the input element (e.g. textarea[name="q"], input[name="q"], #search)',
        },
        text: {
          type: Type.STRING,
          description: 'The text string to type into the targeted input element',
        },
        press_enter: {
          type: Type.BOOLEAN,
          description: 'Whether to press Enter after typing to submit the form/search (defaults to true)',
        },
      },
      required: ['selector', 'text'],
    },
  },
  {
    name: 'click',
    description: 'Clicks an interactive element on the page matching a CSS selector.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        selector: {
          type: Type.STRING,
          description: 'CSS selector targeting the element to click',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'scroll_page',
    description: 'Scrolls the page up or down by a specific pixel amount.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        direction: {
          type: Type.STRING,
          description: 'Scroll direction: "down" or "up" (defaults to "down")',
        },
        amount: {
          type: Type.INTEGER,
          description: 'Pixel amount to scroll (defaults to 500)',
        },
      },
    },
  },
  {
    name: 'press_key',
    description: 'Presses a specific keyboard key on the active page (e.g. "Enter", "Tab", "Escape", "ArrowDown").',
    parameters: {
      type: Type.OBJECT,
      properties: {
        key: {
          type: Type.STRING,
          description: 'The key name to press (e.g. Enter, Escape, Tab, PageDown)',
        },
      },
      required: ['key'],
    },
  },
  {
    name: 'hover',
    description: 'Hovers the mouse over an element to trigger dropdowns or tooltips.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        selector: {
          type: Type.STRING,
          description: 'CSS selector targeting the element to hover over',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'select_option',
    description: 'Selects an option from a dropdown `<select>` element.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        selector: {
          type: Type.STRING,
          description: 'CSS selector targeting the select dropdown element',
        },
        value: {
          type: Type.STRING,
          description: 'The option value or label to select',
        },
      },
      required: ['selector', 'value'],
    },
  },
  {
    name: 'wait_for_selector',
    description: 'Explicitly waits for an element matching a selector to become visible.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        selector: {
          type: Type.STRING,
          description: 'CSS selector to wait for',
        },
        timeout_ms: {
          type: Type.INTEGER,
          description: 'Timeout in milliseconds (defaults to 5000)',
        },
      },
      required: ['selector'],
    },
  },
  {
    name: 'extract_data',
    description: 'Extracts structured text content from key elements or article sections on the page.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'Optional focus topic or selector to extract specific content from',
        },
      },
    },
  },
  {
    name: 'screenshot',
    description: 'Takes a screenshot of the current page and saves it to a designated filepath.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        filename: {
          type: Type.STRING,
          description: 'Relative path or filename for the screenshot (e.g. screenshots/search-results.png)',
        },
      },
    },
  },
  {
    name: 'finish_task',
    description: 'Signals that the overall user task has been completed, providing a summary.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.STRING,
          description: 'Clear, comprehensive summary of the actions taken and results observed',
        },
      },
      required: ['summary'],
    },
  },
];

/**
 * Validates tool arguments to prevent malformed or unauthorized inputs.
 * @param {string} toolName
 * @param {any} args
 */
export function validateToolArguments(toolName, args = {}) {
  switch (toolName) {
    case 'open_url': {
      validateUrlSecurity(args.url);
      break;
    }
    case 'type_text': {
      if (!args.selector || typeof args.selector !== 'string') {
        throw new Error('type_text requires a non-empty string for parameter "selector"');
      }
      if (args.text === undefined || args.text === null || typeof args.text !== 'string') {
        throw new Error('type_text requires a string for parameter "text"');
      }
      break;
    }
    case 'click': {
      if (!args.selector || typeof args.selector !== 'string') {
        throw new Error('click requires a non-empty string for parameter "selector"');
      }
      break;
    }
    case 'scroll_page': {
      if (args.direction && !['up', 'down'].includes(args.direction.toLowerCase())) {
        throw new Error('scroll_page direction must be "up" or "down"');
      }
      break;
    }
    case 'press_key': {
      if (!args.key || typeof args.key !== 'string') {
        throw new Error('press_key requires a non-empty string for parameter "key"');
      }
      break;
    }
    case 'hover': {
      if (!args.selector || typeof args.selector !== 'string') {
        throw new Error('hover requires a non-empty string for parameter "selector"');
      }
      break;
    }
    case 'select_option': {
      if (!args.selector || typeof args.selector !== 'string') {
        throw new Error('select_option requires a non-empty string for parameter "selector"');
      }
      if (!args.value || typeof args.value !== 'string') {
        throw new Error('select_option requires a non-empty string for parameter "value"');
      }
      break;
    }
    case 'wait_for_selector': {
      if (!args.selector || typeof args.selector !== 'string') {
        throw new Error('wait_for_selector requires a non-empty string for parameter "selector"');
      }
      break;
    }
    case 'extract_data':
      // query is optional
      break;
    case 'screenshot': {
      if (args.filename && typeof args.filename !== 'string') {
        throw new Error('screenshot parameter "filename" must be a string if provided');
      }
      break;
    }
    case 'finish_task': {
      if (!args.summary || typeof args.summary !== 'string') {
        throw new Error('finish_task requires a non-empty string for parameter "summary"');
      }
      break;
    }
    case 'read_page':
      // No required parameters
      break;
    default:
      throw new Error(`Unrecognized browser tool: "${toolName}"`);
  }
}
