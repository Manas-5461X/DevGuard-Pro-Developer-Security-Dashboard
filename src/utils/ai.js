export async function analyzeWithGemini(code, vulnerabilities) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set in your .env file.');
  }

  // Formatting vulnerabilities into a list
  const issueList = vulnerabilities.map(v => 
    `- Line ${v.line}: ${v.type} (${v.severity}). Issue: ${v.message}. Recommended Fix: ${v.fix}`
  ).join('\n');

  const systemPrompt = `You are an elite DevSecOps code remediation engine.
The user will provide their source code along with a list of security vulnerabilities detected by a static analyzer.
Your task is to analyze the vulnerabilities and provide a completely fixed version of the code.

CRITICALLY IMPORTANT INSTRUCTIONS:
The user has requested that responseMimeType is application/json.
- The JSON object must have exactly two keys: "analysis" and "fixedCode".
- "analysis" should be a concise 2-3 sentence explanation of the vulnerabilities found and the strategy you used to fix them.
- "fixedCode" must be the exact raw complete source code with the fixes securely applied. Do NOT escape the fixedCode incorrectly, it should be a raw valid string.

schema:
{
  "analysis": "...",
  "fixedCode": "..."
}`;

  const userPrompt = `ORIGINAL CODE:
${code}

VULNERABILITIES DETECTED:
${issueList}

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
      
      if (errorMessage.toLowerCase().includes('quota')) {
        errorMessage = 'Quota Exceeded: You have hit the rate limit for the free Gemini tier (15 requests per minute). Please wait 60 seconds and try again.';
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
