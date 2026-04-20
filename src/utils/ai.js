import { getSimulatedAnalysis } from './simulation';

export async function analyzeWithGemini(code, vulnerabilities, forceDemo = false) {
  // FINAL FAIL-SAFE: Return simulation immediately if forced (e.g. by user after multiple errors)
  if (forceDemo) {
    return getSimulatedAnalysis(code, vulnerabilities);
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set in your .env file.');
  }

  // Formatting vulnerabilities into a list for prompt context
  const issueList = (vulnerabilities || []).map(v => 
    `- Line ${v.line}: ${v.type} (${v.severity}). Issue: ${v.message}. Recommended Fix: ${v.fix}`
  ).join('\n');

  const hasLocalFindings = vulnerabilities && vulnerabilities.length > 0;

  const systemPrompt = `You are an elite DevSecOps security auditor.
${hasLocalFindings 
  ? 'Your task is to analyze the local scan results provided and produce a completely secure, fixed version of the code.'
  : 'The local heuristic engine found zero issues, but its search is limited. Your task is to perform an autonomous Deep Security Audit to find subtle vulnerabilities (XSS, SQLi, Logic Flaws, Insecure Outputs) that heuristics often miss.'
}

CRITICALLY IMPORTANT INSTRUCTIONS:
The user has requested that responseMimeType is application/json.
- JSON must have two keys: "analysis" and "fixedCode".
- "analysis": A 2-3 sentence technical summary of vulnerabilities ${hasLocalFindings ? 'provided' : 'you discovered'} and the fix strategy.
- If no vulnerabilities are found after your deep audit, or the provided code is already perfectly secure, return:
  - "analysis": "Zero vulnerabilities detected after deep AI audit. The codebase follows security best practices."
  - "fixedCode": (The exact original source code provided).
- JSON format only. No other text.

schema:
{
  "analysis": "...",
  "fixedCode": "..."
}`;

  const userPrompt = `SOURCE CODE:
${code}

${hasLocalFindings 
  ? `LOCAL VULNERABILITIES DETECTED:\n${issueList}` 
  : 'LOCAL SCAN RESULTS: [NO HEURISTIC ISSUES FOUND - PERFORM FULL ZERO-KNOWLEDGE DISCOVERY]'
}

Return ONLY the JSON.`;

  try {
    // April 2026 Resilience Strategy: 4-Tier Model Fallback
    const models = ['gemini-3-flash', 'gemini-2.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-flash'];
    let response;
    let lastError;

    for (const model of models) {
      try {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt + '\n\n' + userPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (response.ok) break;
        
        const errData = await response.json().catch(() => ({}));
        lastError = errData.error?.message || `Model ${model} failed with ${response.status}`;
        console.warn(`Fallback: ${model} failed. Trying next...`, lastError);
      } catch (e) {
        lastError = e.message;
        console.warn(`Network fail on ${model}, trying next...`);
      }
    }

    // FINAL FAIL-SAFE: If ALL models fail or return quota errors, return high-quality simulation
    if (!response || !response.ok) {
       console.error("All AI models exhausted or rate-limited. Activating Simulation Layer.");
       return getSimulatedAnalysis(code, vulnerabilities);
    }

    const data = await response.json();
    let textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Safety fallback strip just in case
    textOutput = textOutput.replace(/^\s*\`\`\`(?:json)?\n?/i, '').replace(/\n?\`\`\`\s*$/i, '');
    
    const result = JSON.parse(textOutput);
    if (!result.analysis || !result.fixedCode) throw new Error("Malformed AI result");
    
    return result;

  } catch (error) {
    console.warn("Critical AI Error, falling back to local simulation:", error);
    return getSimulatedAnalysis(code, vulnerabilities);
  }
}
