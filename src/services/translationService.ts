import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 15,
  tokensPerRequest: 1,
  maxTokens: 15,
  refillRate: 15 / 60, // tokens per second
};

// Token bucket for rate limiting
let tokens = RATE_LIMIT.maxTokens;
let lastRefillTime = Date.now();

// Translation cache
const translationCache = new Map<string, string>();

export const initializeTranslationService = (apiKey: string) => {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    return true;
  } catch (error) {
    console.error('Failed to initialize translation service:', error);
    return false;
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const refillTokens = () => {
  const now = Date.now();
  const timePassed = (now - lastRefillTime) / 1000; // Convert to seconds
  tokens = Math.min(RATE_LIMIT.maxTokens, tokens + timePassed * RATE_LIMIT.refillRate);
  lastRefillTime = now;
};

const waitForToken = async () => {
  refillTokens();
  if (tokens < RATE_LIMIT.tokensPerRequest) {
    const waitTime = ((RATE_LIMIT.tokensPerRequest - tokens) / RATE_LIMIT.refillRate) * 1000;
    await sleep(waitTime);
    refillTokens();
  }
  tokens -= RATE_LIMIT.tokensPerRequest;
};

const translateWithRetry = async (text: string, targetLanguage: string, maxRetries = 3): Promise<string> => {
  if (!genAI) {
    throw new Error('Translation service not initialized. Please provide your API key.');
  }

  // Check cache first
  const cacheKey = `${text}:${targetLanguage}`;
  const cachedTranslation = translationCache.get(cacheKey);
  if (cachedTranslation) {
    return cachedTranslation;
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  });

  const prompt = `Translate the following text to ${targetLanguage}. Maintain the markdown formatting and structure. Only return the translated text without any additional explanations or notes:

${text}`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await waitForToken();
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text();
      
      // Cache the successful translation
      translationCache.set(cacheKey, translatedText);
      return translatedText;
    } catch (error: any) {
      console.error(`Translation attempt ${attempt + 1} failed:`, error);
      
      // Check if it's a rate limit error
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        // Extract retry delay from error message if available
        const retryDelayMatch = error.message.match(/retryDelay":"(\d+)s"/);
        const retryDelay = retryDelayMatch ? parseInt(retryDelayMatch[1]) * 1000 : Math.min(1000 * Math.pow(2, attempt), 30000);
        
        console.log(`Rate limited. Waiting ${retryDelay}ms before retry...`);
        await sleep(retryDelay);
        continue;
      }
      
      if (attempt < maxRetries - 1) {
        // For other errors, use exponential backoff
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.log(`Error occurred. Waiting ${backoffDelay}ms before retry...`);
        await sleep(backoffDelay);
      } else {
        throw new Error(`Failed to translate text after ${maxRetries} attempts: ${error}`);
      }
    }
  }

  throw new Error('Unexpected error in translation');
};

// Queue for managing translation requests
let translationQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || translationQueue.length === 0) return;
  
  isProcessingQueue = true;
  while (translationQueue.length > 0) {
    const task = translationQueue.shift();
    if (task) {
      try {
        await task();
      } catch (error) {
        console.error('Error processing translation task:', error);
      }
    }
    // Add a small delay between requests to avoid rate limiting
    await sleep(1000);
  }
  isProcessingQueue = false;
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const task = async () => {
      try {
        const result = await translateWithRetry(text, targetLanguage);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    translationQueue.push(task);
    processQueue();
  });
};

export const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'hi': 'Hindi',
  'ar': 'Arabic',
  'id': 'Indonesian',
  'hi-Latn': 'Hinglish'
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES; 