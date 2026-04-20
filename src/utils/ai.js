export async function analyzeWithGemini(code, vulnerabilities) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set in your .env file.');
  }

  // Formatting vulnerabilities into a list
  const issueList = vulnerabilities.map(v => 
    `- Line ${v.line}: ${v.type} (${v.severity}). Issue: ${v.message}. Recommended Fix: ${v.fix}`
  ).join('\n');

  const hasLocalFindings = vulnerabilities.length > 0;

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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      let errorMessage = err.error?.message || 'Failed to communicate with Gemini API';
      
      if (errorMessage.toLowerCase().includes('quota') || response.status === 429) {
        errorMessage = 'Quota Exceeded: Google AI Studio restricts free-tier keys (frequently limiting fresh accounts to just 2-15 requests per minute). Please wait 60 seconds and try again.';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    let textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Safety fallback strip just in case model ignores mimeType constraint occasionally
    textOutput = textOutput.replace(/^\s*\`\`\`(?:json)?\n?/i, '').replace(/\n?\`\`\`\s*$/i, '');
    
    const result = JSON.parse(textOutput);
    
    if (!result.analysis || !result.fixedCode) {
       throw new Error("AI returned malformed data schema.");
    }
    
    return result;
  } catch (error) {
    console.error('Gemini Remediation Error:', error);
    throw new Error(error.message.includes('Unexpected token') ? 'AI failed to format response correctly. Please try again.' : error.message);
  }
}
