export async function analyzeWithGemini(code, vulnerabilities) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set in your .env file.');
  }

  // Formatting vulnerabilities into a list
  const issueList = vulnerabilities.map(v => 
    `- Line ${v.line}: ${v.type} (${v.severity}). Issue: ${v.message}. Recommended Fix: ${v.fix}`
  ).join('\n');

  const systemPrompt = `You are an elite DevSecOps automated code remediation engine.
The user will provide their source code along with a list of security vulnerabilities detected by a static analyzer.
Your task is to fix ALL the vulnerabilities in the provided code by applying the recommended fixes securely.

CRITICALLY IMPORTANT INSTRUCTIONS:
- You must output ONLY the complete, corrected source code.
- DO NOT wrap the code in markdown code blocks like \`\`\`javascript or \`\`\`.
- DO NOT output any conversational text, explanations, or greetings.
- The output must be EXACTLY the raw code as it will be injected directly into a Diff Editor.
- Preserve the original formatting, indentation, and structure of the code around the fixes.
- If the original code is in a specific language, write the fixes in that exact language.`;

  const userPrompt = `ORIGINAL CODE:
${code}

VULNERABILITIES DETECTED:
${issueList}

Return ONLY the raw fixed code.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
        }]
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
    
    // Fallback: forcefully strip markdown blocks if the model ignored instructions
    textOutput = textOutput.replace(/^\`\`\`[a-z]*\n/gi, '').replace(/\n\`\`\`$/g, '');
    
    return textOutput;
  } catch (error) {
    console.error('Gemini Remediation Error:', error);
    throw error;
  }
}
