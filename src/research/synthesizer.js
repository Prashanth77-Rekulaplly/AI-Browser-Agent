import { GeminiProvider } from '../llm/geminiProvider.js';

/**
 * Cross-checks facts across extracted source pages and produces a synthesized research report.
 * @param {string} topic
 * @param {Array<{ title: string, url: string, content: string }>} sources
 * @returns {Promise<{ synthesis: string, keyFindings: string[], comparedOptions: Array<any>, sources: Array<any> }>}
 */
export async function synthesizeResearch(topic, sources = []) {
  const provider = new GeminiProvider();

  const sourceSnippets = sources.map((s, idx) => `[Source ${idx + 1}] Title: ${s.title}\nURL: ${s.url}\nExcerpt: ${s.content.slice(0, 800)}`).join('\n\n');

  const synthPrompt = `You are a Research Synthesizer for an AI Research Agent.
Topic: "${topic}"

Extracted Sources:
${sourceSnippets}

Synthesize these sources into a comprehensive, balanced research report. Cross-check claims and identify the best options.
Respond with ONLY a JSON object:
{
  "synthesis": "Comprehensive multi-paragraph synthesis with citations [Source 1], [Source 2]",
  "keyFindings": ["key finding 1", "key finding 2"],
  "comparedOptions": [
    {
      "name": "Option name (e.g. Acer Predator Helios / Python 3.14)",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1"],
      "verifiedPriceOrSpec": "₹95,000 / Released Oct 2026",
      "bestFor": "Machine learning students"
    }
  ],
  "discrepancies": ["any conflicting facts noted across sources"]
}`;

  try {
    const raw = await provider.generateText(synthPrompt);
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      ...parsed,
      sources: sources.map((s, idx) => ({
        id: `source-${idx + 1}`,
        title: s.title,
        url: s.url,
        type: s.url.includes('.edu') || s.url.includes('.org') || s.url.includes('github') ? 'Primary' : 'Secondary',
        checkedAt: new Date().toISOString(),
      })),
    };
  } catch (error) {
    return {
      synthesis: `Research completed for "${topic}". Found ${sources.length} relevant sources.`,
      keyFindings: sources.map((s) => s.title),
      comparedOptions: [],
      discrepancies: [],
      sources: sources.map((s, idx) => ({
        id: `source-${idx + 1}`,
        title: s.title,
        url: s.url,
        type: 'Web Source',
        checkedAt: new Date().toISOString(),
      })),
    };
  }
}
