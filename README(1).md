# NEXORA

## Autonomous Browser Intelligence & Web Research Agent

NEXORA is a local-first AI browser agent that converts natural-language goals into browser actions. It combines Google Gemini for task understanding and decision-making with Playwright Chromium for deterministic browser automation, web research, data extraction, completion verification, and human-in-the-loop safety controls.

---

## 1. Project Overview

NEXORA is designed to let users describe **what they want done** instead of manually specifying every browser action.

Examples:

```text
Search Wikipedia for Artificial Intelligence and summarize the important information.
```

```text
Find information about Python programming and explain its main uses.
```

```text
Open YouTube and search for Python tutorials.
```

```text
Research machine-learning courses and compare the available options.
```

The agent interprets the goal, determines the required steps, controls a real Chromium browser, observes the resulting pages, extracts useful information, verifies the outcome, and presents the result through the dashboard or CLI.

The architecture is intentionally general-purpose rather than being tied to one website or one fixed task.

---

# 2. Core Capabilities

NEXORA currently combines:

- Natural-language task understanding
- Gemini-powered reasoning
- Dynamic task planning
- Playwright browser automation
- Persistent Chromium browser profiles
- Structured browser tools
- DOM observation
- Web research
- Data extraction
- Source synthesis
- Completion verification
- Safety and permission policies
- Human confirmation gates
- Human takeover for login/CAPTCHA/2FA situations
- Task history
- Local-first persistence
- REST API
- Server-Sent Events
- Interactive CLI
- React + TypeScript dashboard
- Dark and Light themes
- Screenshot-based visual verification

---

# 3. High-Level Architecture

```text
                         USER
                           |
                           v
                +----------------------+
                |    React Web UI      |
                | TypeScript + Tailwind|
                +----------+-----------+
                           |
                       REST / SSE
                           |
                           v
                +----------------------+
                |     Express API      |
                +----------+-----------+
                           |
                           v
                +----------------------+
                |     Orchestrator     |
                |    State Machine     |
                +----------+-----------+
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
   Task Interpreter   Policy Engine   Context Understanding
          |                |                |
          +----------------+----------------+
                           |
                           v
                +----------------------+
                |      Gemini LLM      |
                | Reasoning / Planning |
                +----------+-----------+
                           |
                           v
                +----------------------+
                |      Agent Loop      |
                | Plan -> Act ->       |
                | Observe -> Evaluate  |
                +----------+-----------+
                           |
                           v
                +----------------------+
                |   Browser Executor   |
                |      Playwright      |
                +----------+-----------+
                           |
                           v
                +----------------------+
                | Persistent Chromium  |
                |       Profile        |
                +----------+-----------+
                           |
                           v
                     REAL WEBSITES
```

---

# 4. End-to-End Workflow

The complete execution pipeline is:

```text
User Request
     |
     v
Task Understanding
     |
     v
Context Analysis
     |
     v
Risk & Permission Analysis
     |
     +-----------------------------+
     |                             |
     v                             v
Task Ready                   Missing Critical Context
     |                             |
     |                             v
     |                     Ask Clarification
     |                             |
     |                             v
     |                     Merge User Answer
     |                             |
     +-------------+---------------+
                   |
                   v
                Planning
                   |
                   v
             Agent Execution
                   |
                   v
             Observe Webpage
                   |
                   v
              Select Tool
                   |
                   v
             Execute Action
                   |
                   v
             Evaluate Result
                   |
              +----+----+
              |         |
              v         v
          Continue     Done
              |         |
              +-->-----+
                        |
                        v
                  Verify Goal
                        |
                        v
                    Complete
```

---

# 5. Agent State Machine

The orchestrator manages execution through explicit states.

```text
CREATED
   |
   v
ANALYZING
   |
   v
PLANNING
   |
   v
RUNNING
   |
   +---------------> WAITING_CONFIRMATION
   |                         |
   |                         v
   |                   USER APPROVAL
   |                         |
   |                         v
   |                       RUNNING
   |
   +---------------> HUMAN_TAKEOVER
   |                         |
   |                         v
   |                    USER RESOLVES
   |                         |
   |                         v
   |                       RUNNING
   |
   +---------------> WAITING_CLARIFICATION
   |                         |
   |                         v
   |                    USER ANSWERS
   |                         |
   |                         v
   |                       PLANNING
   |
   +---------------> PAUSED
   |                         |
   |                         v
   |                       RESUME
   |                         |
   |                         v
   |                       RUNNING
   |
   v
VERIFYING
   |
   +-------------> COMPLETED
   |
   +-------------> FAILED
```

---

# 6. Gemini Integration

Gemini provides the reasoning layer.

It is responsible for:

- Understanding natural-language goals
- Interpreting context
- Creating execution plans
- Selecting structured browser tools
- Interpreting browser observations
- Deciding the next action
- Extracting relevant information
- Evaluating task completion
- Producing final summaries

The project uses the official Google Gemini Node.js SDK:

```text
@google/genai
```

The API key is supplied through an environment variable and should never be committed to source control.

---

# 7. Browser Automation Layer

Playwright controls Chromium and performs deterministic browser actions.

The browser layer supports:

- Launching Chromium
- Persistent browser contexts
- URL navigation
- Clicking
- Typing
- Keyboard actions
- Scrolling
- Hovering
- Dropdown selection
- Waiting for selectors
- DOM inspection
- Data extraction
- Screenshot capture
- Page title extraction
- Browser lifecycle management

The browser executor acts as the controlled boundary between the AI reasoning layer and the actual browser.

---

# 8. Structured Browser Tools

The agent exposes structured actions instead of allowing the model to directly manipulate the browser.

Current tools include:

```text
open_url
read_page
type_text
click
scroll_page
press_key
hover
select_option
wait_for_selector
extract_data
screenshot
finish_task
```

The execution pipeline is:

```text
Gemini
  |
  v
Tool Request
  |
  v
Tool Validation
  |
  v
Security / Policy Check
  |
  v
Playwright Executor
  |
  v
Browser
  |
  v
Observation
  |
  v
Gemini
```

This separation makes the system easier to control, test, and secure.

---

# 9. DOM Observation

The DOM observer creates a compact representation of useful webpage elements.

Instead of blindly providing the entire DOM, the system can focus on:

- Buttons
- Links
- Inputs
- Textareas
- Select elements
- Headings
- Visible text
- Interactive controls

Example conceptual observation:

```text
PAGE: Google Search

INPUT
selector: textarea[name="q"]
placeholder: Search

BUTTON
text: Google Search

LINK
text: About

LINK
text: Store
```

This gives Gemini useful information for choosing the next browser action while reducing unnecessary context.

---

# 10. Open-World Task Understanding

NEXORA is designed to understand open-ended natural-language goals.

Users do not need to learn a fixed command language.

For example:

```text
Find information about quantum computing and summarize the important points.
```

```text
Search for Python courses suitable for machine learning.
```

```text
Open the official Node.js documentation and explain important features.
```

The task interpreter converts these requests into structured execution context.

---

# 11. Dynamic Context Understanding

The context-understanding layer evaluates the task across multiple dimensions.

Important dimensions include:

1. Goal
2. Desired outcome
3. Entities
4. Actions
5. Constraints
6. Preferences
7. Required context
8. Provided context
9. Missing context
10. Safe assumptions
11. Unsafe assumptions
12. Uncertainties
13. Risk level
14. Clarification requirement
15. Confirmation requirement
16. Human takeover requirement
17. Execution strategy

The purpose is to determine whether the agent has enough information to execute safely and correctly.

---

# 12. Adaptive Clarification

When important information is missing, the agent can enter:

```text
WAITING_CLARIFICATION
```

Example:

```text
User:
Book me a hotel.
```

The system may need information such as:

```text
Destination?
Dates?
Number of guests?
Budget?
```

The agent should ask only for information that materially affects execution.

After the user answers, the context is merged and execution can continue.

---

# 13. Security and Permission System

NEXORA separates low-risk browser operations from sensitive or irreversible actions.

## Low-Risk Examples

```text
Open webpages
Search public websites
Read public information
Extract visible data
Scroll
Navigate
Take screenshots
```

These can normally be automated.

## Sensitive Examples

```text
Submit forms containing user information
Send emails
Send messages
Make purchases
Checkout
Financial transactions
Delete data
Delete accounts
Publish social media content
```

These can require explicit user confirmation.

---

# 14. Permission Levels

The UI supports:

```text
Allowed
Ask
Blocked
```

Example policy configuration:

```text
Browser Automation       -> Allowed
Web Research             -> Allowed
DOM & Text Extraction    -> Allowed
Screenshot Capture       -> Allowed

Form Submissions         -> Ask
Send Emails & Messages   -> Ask
E-Commerce Purchases     -> Ask
Financial Payments       -> Ask
Data & Account Deletion  -> Ask
Public Social Posts      -> Ask

Local Filesystem Access  -> Blocked
```

This allows the user to decide how much autonomy the agent has.

---

# 15. Human Takeover

Some webpages require direct human interaction.

Examples include:

- CAPTCHA
- Two-factor authentication
- Login challenges
- Security verification
- Bot detection

The intended workflow is:

```text
Agent Running
     |
     v
Challenge Detected
     |
     v
HUMAN_TAKEOVER
     |
     v
User Interacts with Browser
     |
     v
Challenge Completed
     |
     v
Agent Resumes
     |
     v
DOM Re-observed
     |
     v
Execution Continues
```

NEXORA is designed to pause rather than attempt to bypass security challenges.

---

# 16. Persistent Browser Authentication

NEXORA uses a dedicated persistent Chromium profile.

Example directory:

```text
browser-profile/
```

The persistent browser context allows supported website sessions to survive browser restarts.

The profile can retain browser state such as:

- Cookies
- Local storage
- IndexedDB
- Session information

The profile belongs exclusively to the NEXORA application and should not be confused with the user's normal Chrome, Edge, or Brave profile.

---

# 17. First-Time Login

Use:

```bash
npm run browser:login
```

The login helper opens a visible Chromium window.

The user manually:

1. Opens the required account page.
2. Enters credentials.
3. Completes 2FA if required.
4. Completes CAPTCHA if required.
5. Reaches the authenticated page.
6. Finishes the login helper.

Future agent sessions can reuse the persistent browser profile until the website session expires or requires re-authentication.

The agent should never require the user's plaintext password to be sent to Gemini.

---

# 18. Research Engine

The research subsystem supports:

```text
Search
  |
  v
Source Discovery
  |
  v
Page Navigation
  |
  v
Content Extraction
  |
  v
Cross-Source Comparison
  |
  v
Synthesis
  |
  v
Final Research Result
```

Representative research modules:

```text
src/research/searchEngine.js
src/research/extractor.js
src/research/synthesizer.js
```

The system can be used for tasks involving:

- Documentation
- Articles
- Search results
- Tables
- Product information
- Course information
- Technical research
- General web information

---

# 19. Data Extraction

The agent can extract information from visible web content.

Possible targets include:

```text
Paragraphs
Headings
Tables
Lists
Search results
Specifications
Documentation
Course details
Research information
```

The extracted information can then be passed into the synthesis and verification stages.

---

# 20. Completion Verification

NEXORA does not rely only on the final browser action.

The validator compares:

```text
Original Goal
+
User Constraints
+
Observed Browser Results
+
Extracted Information
        |
        v
Completion Verification
```

Example:

```text
Goal:
Find information about Python and summarize it.

Verification:
✓ Relevant page found
✓ Required information extracted
✓ Summary generated
✓ Goal satisfied

Status:
COMPLETED
```

This helps distinguish between:

```text
Browser action completed
```

and:

```text
User's actual goal completed
```

---

# 21. Self-Healing and Recovery

Websites can change their DOM structures.

For example:

```text
Expected:
textarea[name="q"]

Actual:
input[name="q"]
```

The agent can use alternative strategies involving:

- CSS selectors
- Text matching
- ARIA labels
- Roles
- DOM observations
- Visibility checks

If an action fails, the agent can reconsider the current browser state and attempt an appropriate recovery path.

---

# 22. Agent Decision Loop

The core loop is:

```text
                 +----------------+
                 |   User Goal    |
                 +-------+--------+
                         |
                         v
                 +---------------+
                 |    Gemini     |
                 | Decision      |
                 +-------+-------+
                         |
                         v
                 +---------------+
                 | Tool Selection|
                 +-------+-------+
                         |
                         v
                 +---------------+
                 | Safety Policy |
                 +-------+-------+
                         |
                         v
                 +---------------+
                 |   Playwright  |
                 +-------+-------+
                         |
                         v
                 +---------------+
                 | Browser State |
                 +-------+-------+
                         |
                         v
                 +---------------+
                 |  Observation  |
                 +-------+-------+
                         |
                         v
                       Gemini
                         |
                  +------+------+
                  |             |
                  v             v
               Continue       Finish
                  |
                  +-----> Loop
```

---

# 23. Web Dashboard

The frontend is built with:

```text
React
TypeScript
Tailwind CSS
Vite
Lucide Icons
```

The dashboard contains areas such as:

```text
Agent Workspace
Task History
Saved Workflows
Memory & Context
Policy & Security
Settings
```

---

# 24. Agent Workspace

The main workspace contains:

- Natural-language task input
- Visible Browser toggle
- Run Agent button
- Keyboard shortcut
- Suggested tasks
- Execution status
- Result summary
- Verification information

Example:

```text
What would you like me to do?

[ Search Wikipedia for quantum computing and summarize it ]

                         [ Run Agent ]
```

---

# 25. Theme System

The dashboard supports both:

```text
Dark Mode
Light Mode
```

There is one application UI.

The theme toggle changes the existing interface rather than creating separate pages.

Dark Mode:

```text
Dark background
Light text
Dark cards
Visible white input text
```

Light Mode:

```text
White/light background
Dark text
White cards
Visible dark input text
```

The selected theme can be persisted using local storage.

---

# 26. Task History

Completed tasks can be stored locally with information such as:

```text
Task
Status
Execution steps
Actions
Screenshots
Result
Verification
Timestamp
```

This allows users to inspect previous executions.

---

# 27. Local-First Storage

The system is designed around local-first operation.

Potential persisted information includes:

```text
Tasks
Execution steps
Timeline events
Screenshot records
Preferences
Reusable workflows
Context
```

The exact persistence implementation depends on the storage modules present in the project.

---

# 28. REST API

The backend exposes an agent endpoint:

```http
POST /api/agent/run
```

Example request:

```json
{
  "task": "Open Google and search for Node.js documentation",
  "headless": false
}
```

The server starts an agent execution using the supplied task.

---

# 29. Server-Sent Events

Live execution can be streamed through:

```http
GET /api/agent/stream/:taskId
```

The stream can be used to display events such as:

```text
Task started
Planning
Browser opened
Navigation
Tool execution
Page observation
Confirmation required
Human takeover
Verification
Task completed
Task failed
```

This allows the frontend to show real-time progress.

---

# 30. CLI

NEXORA can be used directly from the terminal.

Example:

```bash
npm run agent:cli "Search Wikipedia for Quantum Computing and extract the summary"
```

Interactive mode:

```bash
npm run agent:cli
```

This provides an alternative to the graphical dashboard.

---

# 31. Project Structure

Representative project structure:

```text
AI-Browser-Agent/
|
+-- frontend/
|   +-- src/
|       +-- components/
|       +-- pages/
|       +-- types/
|       +-- ...
|
+-- src/
|   |
|   +-- agent/
|   |   +-- agentLoop.js
|   |   +-- orchestrator.js
|   |   +-- executor.js
|   |   +-- tools.js
|   |   +-- prompts.js
|   |   +-- domObserver.js
|   |   +-- guardrails.js
|   |   +-- validator.js
|   |   +-- contextUnderstanding.js
|   |   +-- taskInterpreter.js
|   |
|   +-- services/
|   |   +-- browserService.js
|   |   +-- geminiService.js
|   |
|   +-- security/
|   |   +-- policyEngine.js
|   |   +-- permissionManager.js
|   |
|   +-- research/
|   |   +-- searchEngine.js
|   |   +-- extractor.js
|   |   +-- synthesizer.js
|   |
|   +-- storage/
|   |   +-- ...
|   |
|   +-- config.js
|   +-- server.js
|   +-- cli.js
|   +-- demo-agent.js
|   +-- login-helper.js
|   +-- test-browser.js
|   +-- test-connection.js
|   +-- test-suite.js
|
+-- browser-profile/
|
+-- screenshots/
|
+-- .env
+-- .gitignore
+-- package.json
+-- package-lock.json
+-- README.md
```

---

# 32. Technology Stack

## AI

```text
Google Gemini
@google/genai
```

## Browser Automation

```text
Playwright
Chromium
```

## Backend

```text
Node.js
Express
```

## Frontend

```text
React
TypeScript
Tailwind CSS
Vite
```

## Communication

```text
REST API
Server-Sent Events
```

## Browser Persistence

```text
Playwright Persistent Context
Chromium User Data Directory
```

---

# 33. Installation

## Requirements

Install:

```text
Node.js
npm
Chromium through Playwright
Google Gemini API key
```

## Install Dependencies

```bash
npm install
```

## Install Chromium

```bash
npx playwright install chromium
```

---

# 34. Environment Configuration

Create:

```text
.env
```

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
BROWSER_PROFILE_DIR=./browser-profile
```

Never commit the real `.env` file.

Recommended `.gitignore` entries:

```gitignore
.env
.env.*
!.env.example

browser-profile/
screenshots/
*.png
node_modules/
```

A safe `.env.example` can contain:

```env
GEMINI_API_KEY=your_gemini_api_key_here
BROWSER_PROFILE_DIR=./browser-profile
```

---

# 35. Running NEXORA

Start the backend and dashboard:

```bash
npm start
```

Expected server:

```text
Browser Control Agent API Server running on port 3000

Health Check:
http://localhost:3000/health

Agent API:
http://localhost:3000/api/agent/run

SSE Stream:
http://localhost:3000/api/agent/stream/:taskId
```

Open:

```text
http://localhost:3000
```

---

# 36. Frontend Development Mode

For frontend development:

```bash
npm run ui:dev
```

This starts the Vite development environment.

---

# 37. First Browser Login

Run:

```bash
npm run browser:login
```

A visible Chromium window opens.

Log into the required website manually.

Complete any:

```text
Password
2FA
CAPTCHA
Security verification
```

The browser profile is then reused by future executions.

---

# 38. Testing

## Backend Tests

```bash
npm test
```

This verifies the Gemini integration and backend behavior.

Expected baseline:

```text
4/4 tests passed
```

when the configured test suite reports all four tests successfully.

---

## Browser Automation Test

```bash
npm run test:browser
```

This verifies:

```text
Chromium launch
Google navigation
Page title
Screenshot capture
Clean browser shutdown
```

---

## Agent Demo

```bash
npm run agent:demo
```

A baseline demo can perform a multi-step browser task such as searching Google for Python courses.

---

## Persistent Profile Test

If included in the project:

```bash
npm run test:profile
```

This checks whether browser state survives a browser restart.

---

# 39. Example End-to-End Execution

Task:

```text
Search Wikipedia for Artificial Intelligence and summarize the important information.
```

Execution:

```text
1. Receive user goal
2. Understand task
3. Analyze context
4. Determine required actions
5. Check permissions
6. Create plan
7. Launch persistent Chromium
8. Navigate to relevant website
9. Inspect webpage
10. Select browser tool
11. Execute action
12. Observe result
13. Continue if necessary
14. Extract requested information
15. Verify goal completion
16. Generate final result
17. Save relevant task information
18. Finish execution
```

---

# 40. Sensitive Task Example

Task:

```text
Send an email to John saying the meeting is cancelled.
```

The agent can recognize that sending the message is an external side effect.

The workflow can therefore become:

```text
Task Analysis
      |
      v
Sensitive Action Detected
      |
      v
WAITING_CONFIRMATION
      |
      v
Show recipient + message + target
      |
      v
User Approval
      |
      +---- Reject ----> Stop
      |
      +---- Approve ---> Continue
```

This prevents an important external action from being executed silently.

---

# 41. Screenshots

Screenshots can be generated during execution for visual verification.

They are artifacts rather than core application logic.

Example:

```text
screenshots/
```

Old screenshots can be deleted if they are no longer needed.

The agent can generate new screenshots during later tasks.

---

# 42. Security Notes

Important files that must not be committed:

```text
.env
browser-profile/
```

The browser profile may contain authenticated session information.

The Gemini API key must remain private.

Do not publish:

- API keys
- Cookies
- Session tokens
- Authentication data
- Private screenshots
- Private browser profile files

---

# 43. Gemini API Quota Considerations

NEXORA depends on Gemini API availability.

If the API returns:

```text
429 RESOURCE_EXHAUSTED
```

the project may have reached a Gemini API quota or rate limit.

This is different from a Playwright failure.

The application should use retry/backoff behavior where appropriate, but repeated requests can still be limited by the configured Gemini API plan and model quota.

---

# 44. Website Compatibility

Browser automation depends on website behavior.

Websites may change:

```text
DOM structures
Selectors
Navigation
Authentication flows
CAPTCHA systems
Page layouts
```

Therefore, no browser automation system can guarantee permanent compatibility with every website.

NEXORA uses DOM observation, structured tools, recovery logic, and human takeover to improve reliability.

---

# 45. Design Principles

NEXORA follows these principles:

## Goal-Oriented

Users describe the desired outcome rather than every click.

## Observe Before Acting

The agent should inspect the current webpage before selecting an action.

## Structured Execution

Gemini requests tools through defined interfaces.

## Deterministic Browser Control

Playwright performs the actual browser operations.

## Human-in-the-Loop

Sensitive actions and security challenges can require user involvement.

## Verification

The agent verifies whether the original goal was actually achieved.

## Local-First

Browser sessions and important execution state can remain local.

---

# 46. Complete System Flow

```text
                   USER
                     |
                     v
          Natural Language Goal
                     |
                     v
          +---------------------+
          | Context Understanding|
          +----------+----------+
                     |
                     v
          +---------------------+
          | Risk / Permissions  |
          +----------+----------+
                     |
                     v
          +---------------------+
          | Task Planning       |
          +----------+----------+
                     |
                     v
          +---------------------+
          | Gemini Decision      |
          +----------+----------+
                     |
                     v
          +---------------------+
          | Structured Tool      |
          +----------+----------+
                     |
                     v
          +---------------------+
          | Security Validation  |
          +----------+----------+
                     |
                     v
          +---------------------+
          | Playwright           |
          +----------+----------+
                     |
                     v
          +---------------------+
          | Chromium Browser     |
          +----------+----------+
                     |
                     v
          +---------------------+
          | DOM / Screenshot     |
          | Observation          |
          +----------+----------+
                     |
                     v
                  Gemini
                     |
              +------+------+
              |             |
              v             v
          Continue       Complete
              |             |
              |             v
              |        Verification
              |             |
              +----<--------+
                            |
                            v
                       Final Result
```

---

# 47. Future Roadmap

Potential future improvements include:

- More advanced multi-tab orchestration
- Improved long-term memory
- Multiple isolated browser profiles
- Better recovery strategies
- Advanced source verification
- Parallel research
- Workflow recording
- Workflow replay
- Scheduled tasks
- Additional AI model providers
- Advanced execution analytics
- Cost and quota tracking
- More comprehensive benchmark tasks
- Containerized deployment
- Remote/cloud execution

---

# 48. Project Goal

The long-term goal of NEXORA is to provide a general-purpose browser intelligence system that transforms:

```text
Natural Language
      |
      v
Understanding
      |
      v
Planning
      |
      v
Browser Actions
      |
      v
Observation
      |
      v
Reasoning
      |
      v
Verification
      |
      v
Completed Result
```

The user describes the objective.

NEXORA handles the browser workflow while preserving user control over sensitive actions.

---

# 49. Quick Start

```bash
npm install
```

```bash
npx playwright install chromium
```

Create `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
BROWSER_PROFILE_DIR=./browser-profile
```

Login when required:

```bash
npm run browser:login
```

Start:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

Run tests:

```bash
npm test
npm run test:browser
npm run agent:demo
```

---

# 50. Project Identity

## NEXORA

**Autonomous Browser Intelligence & Web Research Agent**

Technology foundation:

```text
Gemini
+
Playwright
+
Chromium
+
Node.js
+
Express
+
React
+
TypeScript
+
Tailwind CSS
```

NEXORA is built around the idea of turning natural-language objectives into observable, controlled, and verifiable browser workflows.
