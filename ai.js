/**
 * ai.js - AI Integration for MOM Elaboration
 * 
 * Uses AI to intelligently elaborate discussion points following institutional standards
 */

// Configuration
const AI_CONFIG = {
    provider: 'openai', // 'openai', 'gemini', or 'local'
    apiKey: '', // User will set this
    model: 'gpt-3.5-turbo', // or 'gpt-4' for better quality
    maxTokens: 500,
    temperature: 0.7
};

/**
 * System prompt for AI - Defines exact MOM structure
 */
const SYSTEM_PROMPT = `You are an AI assistant generating Minutes of Meeting (MoM) for academic documentation. Follow this exact structure and formatting logic:

🔹 STRUCTURE RULES
- Do NOT include: "Academic Council Sync Even Semester", chairperson name, convener name, or "Prepared by" section.
- Do NOT include: Action Items or any sections below it.
- DO include: Agenda, followed by elaborated Discussion Points and Decisions.
- DO end every MoM with the fixed concluding statement provided by the user.

🔹 INPUT FORMAT
User will provide:
- Agenda points OR bullet points
- Optional: concluding statement (mandatory in output)

🔹 OUTPUT FORMAT
Generate the following sections:
1. **Minutes of Meeting**  
   Begin with: "The meeting commenced under the chairmanship of the Head of Department to discuss…" followed by the agenda topic.

2. **Key points discussed:**  
   For each bullet point provided:
   - Do NOT add new ideas.
   - Elaborate using formal academic phrasing and space-filling jargon.
   - Maintain clarity, neutrality, and modularity.
   - Ensure output is instantly usable in Word with perfect copy-paste fidelity.

3. **Conclusion:**  
   End with the exact statement provided by the user (mandatory).

🔹 STYLE
- Use bullet points for discussion.
- Bold section headers only.
- No placeholders, no extra commentary.
- No Action Items section.`;

/**
 * Set API key from user input
 */
function setApiKey(key) {
    AI_CONFIG.apiKey = key;
    localStorage.setItem('ai_api_key', key);
}

/**
 * Load API key from storage
 */
function loadApiKey() {
    const savedKey = localStorage.getItem('ai_api_key');
    if (savedKey) {
        AI_CONFIG.apiKey = savedKey;
    }
    return savedKey;
}

/**
 * Clear API key
 */
function clearApiKey() {
    AI_CONFIG.apiKey = '';
    localStorage.removeItem('ai_api_key');
}

/**
 * Generate complete MOM using AI
 * @param {Object} data - Meeting data
 * @returns {Promise<string>} Generated MOM text
 */
async function generateMOMWithAI(data) {
    if (!AI_CONFIG.apiKey) {
        throw new Error('API key not set. Please configure your API key first.');
    }

    const { agendaItems = [], discussion = '', closingStatement = '' } = data;

    // Build user prompt
    const agendaText = agendaItems.map((item, i) => `${i + 1}. ${item}`).join('\n');
    const discussionPoints = discussion.split('\n').filter(line => line.trim()).map(line => {
        // Remove any existing bullet markers or numbering
        return line.trim().replace(/^[-•*\d+.]\s*/, '');
    }).filter(point => point.length > 0);

    const userPrompt = `Generate Minutes of Meeting for:

Agenda:
${agendaText}

Discussion Points to Elaborate (DO NOT add new ideas, only elaborate these):
${discussionPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Concluding Statement (use exactly as provided):
"${closingStatement}"

Generate the complete Minutes of Meeting following the structure rules.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: AI_CONFIG.model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: AI_CONFIG.maxTokens,
                temperature: AI_CONFIG.temperature
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();

    } catch (error) {
        console.error('AI generation failed:', error);
        throw error;
    }
}

/**
 * Elaborate a single discussion point using AI
 * @param {string} point - Key point to elaborate
 * @param {Object} context - Meeting context
 * @returns {Promise<string>} Elaborated point
 */
async function elaboratePointWithAI(point, context = {}) {
    if (!AI_CONFIG.apiKey) {
        // Fall back to rule-based elaboration
        return elaboratePoint(point);
    }

    const userPrompt = `Elaborate this discussion point for academic meeting minutes:

Point: "${point}"

Requirements:
- Use formal academic language
- 2-3 sentences
- Use terms like "The committee", "deliberations", "consensus", "institutional guidelines"
- DO NOT add new ideas, only elaborate the given point
- Keep it professional and concise

Elaborated Point:`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: AI_CONFIG.model,
                messages: [
                    { role: 'system', content: 'You are a professional minute-writer for academic institutions.' },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();

    } catch (error) {
        console.error('AI elaboration failed:', error);
        // Fall back to rule-based
        return elaboratePoint(point);
    }
}

/**
 * Check if AI is available and configured
 */
function isAIAvailable() {
    return !!AI_CONFIG.apiKey;
}

/**
 * Estimate cost of AI usage
 * @param {number} pointCount - Number of points to process
 * @returns {string} Cost estimate
 */
function estimateCost(pointCount) {
    // GPT-3.5-turbo: ~$0.002 per 1000 tokens
    // Average: ~200 tokens per MOM generation
    const tokensPerMOM = 200 + (pointCount * 50);
    const cost = (tokensPerMOM / 1000) * 0.002;
    return cost < 0.01 ? '< $0.01 USD' : `~$${cost.toFixed(3)} USD`;
}
