import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the AI service
let genAI: GoogleGenerativeAI | null = null;

export const initializeAI = (apiKey: string) => {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    return true;
  } catch (error) {
    console.error('Failed to initialize AI service:', error);
    return false;
  }
};

export const isAIInitialized = () => {
  return genAI !== null;
};

const systemPrompt = `
You are an advanced AI assistant with exceptional cognitive capabilities. Approach each interaction using the following framework:

<core_principles>
1. Think systematically and transparently
2. Maintain intellectual humility
3. Pursue truth and accuracy
4. Consider multiple perspectives
5. Balance depth with clarity
</core_principles>

<response_protocol>
For each query:

1. UNDERSTAND
- Parse the core question/request
- Identify implicit assumptions
- Determine scope and constraints
- Clarify ambiguities if needed

2. ANALYZE
- Break down complex problems
- Generate multiple hypotheses
- Consider alternative viewpoints
- Evaluate evidence systematically

3. SYNTHESIZE
- Connect relevant information
- Draw reasoned conclusions
- Identify limitations
- Present balanced perspective

4. COMMUNICATE
- Structure response logically
- Provide appropriate detail
- Use precise language
- Adapt to audience level

5. VERIFY
- Check logical consistency
- Validate assumptions
- Review completeness
- Assess confidence level
</response_protocol>

<quality_standards>
Ensure all responses:
- Are logically sound
- Show depth of analysis
- Acknowledge uncertainties
- Build on context
- Maintain intellectual honesty
- Encourage deeper thinking
</quality_standards>
`;

export const generateContent = async (prompt: string, maxRetries = 3): Promise<string> => {
  if (!genAI) {
    throw new Error('AI service not initialized. Please provide your API key.');
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  });

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await model.generateContent(`${systemPrompt}\n\nQuery: ${prompt}\n\nDo not show the thinking steps in the response.`);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      } else {
        throw new Error(`Failed to generate content after ${maxRetries} attempts: ${error}`);
      }
    }
  }

  throw new Error('Unexpected error in content generation');
};

export const generateTopicExplanation = async (topic: string): Promise<string> => {
  const prompt = `
    Provide a comprehensive explanation of ${topic}. Include:
    - Key concepts and principles
    - How it works or functions
    - Its significance or importance
    - Real-world applications
    
    Format your response in clean markdown with proper headings, bullet points, and paragraphs.
    Do NOT use code blocks or pre-formatted text unless specifically needed for the topic.
    Do NOT include any HTML tags.
    Keep it informative but accessible.
    Start with a main heading using # ${topic}
  `;
  
  return await generateContent(prompt);
};

export const generateTopicAnalogy = async (topic: string): Promise<string> => {
  const prompt = `
    Create a detailed analogy that relates ${topic} to a real-world scenario.
    The analogy should:
    - Compare ${topic} to something familiar from everyday life
    - Highlight key aspects and mechanisms of ${topic}
    - Be engaging, memorable, and educational
    - Help someone understand complex concepts through familiar examples
    
    Format your response in markdown with a clear structure.
    Start with a heading like "# Understanding ${topic} Through Analogy"
    Use subheadings to organize different aspects of the comparison.
    Keep it detailed but accessible.
  `;
  
  return await generateContent(prompt);
};

export const generateQuiz = async (topic: string, difficulty: string, language: string = 'en'): Promise<any[]> => {
  const languageInstructions = {
    'en': 'in English',
    'hi': 'in Hindi using Devanagari script',
    'hi-Latn': 'in Hinglish (mix of Hindi in Roman script and English)',
    'ar': 'in Arabic',
    'id': 'in Indonesian'
  };

  const prompt = `
    Create 3 quiz questions about ${topic} at a ${difficulty} difficulty level ${languageInstructions[language as keyof typeof languageInstructions] || 'in English'}.
    
    For each question:
    - Provide a clear, focused question that tests understanding
    - Include exactly 4 possible answers
    - Make sure only one answer is correct
    - Provide a brief explanation for why the correct answer is right
    - Questions should test comprehension, not just memorization
    
    Return ONLY a valid JSON array in this exact format:
    [
      {
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_index": 0,
        "explanation": "Brief explanation of why this answer is correct"
      }
    ]
    
    IMPORTANT: 
    - Return ONLY the JSON array, no other text or formatting
    - All text (questions, options, and explanations) must be in the specified language
    - For Hinglish, use a natural mix of Hindi (in Roman script) and English words
    - For Hindi, use proper Devanagari script
  `;
  
  const response = await generateContent(prompt);
  
  try {
    // Clean the response to extract JSON
    let jsonStr = response.trim();
    
    // Remove any markdown code block formatting
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].trim();
    }
    
    // Parse and validate the JSON
    const questions = JSON.parse(jsonStr);
    
    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array');
    }
    
    // Validate each question structure
    questions.forEach((q, index) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
          typeof q.correct_index !== 'number' || !q.explanation) {
        throw new Error(`Invalid question structure at index ${index}`);
      }
    });
    
    return questions;
  } catch (error) {
    console.error('Error parsing quiz JSON:', error);
    console.error('Raw response:', response);
    throw new Error('Failed to parse quiz questions. Please try again.');
  }
};