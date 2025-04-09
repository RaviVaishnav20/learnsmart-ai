# app.py
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
import json
import time
import asyncio
from google import genai
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional, Dict
import hashlib
from functools import lru_cache
import re

# Load environment variables
load_dotenv()

# Get port from environment variable or use default
PORT = int(os.getenv("PORT", 8000))

# Initialize FastAPI app
app = FastAPI(title="Interactive Learning Platform")

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Set up Jinja2 templates
templates = Jinja2Templates(directory="templates")

# Simple in-memory cache
content_cache: Dict[str, Dict] = {}
CACHE_EXPIRY = 3600  # 1 hour in seconds

system_prompt = """

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



"""

# Initialize Gemini API
def initialize_genai():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not found")
    
    try:
        client = genai.Client(api_key=api_key)
        return client
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing Gemini API: {str(e)}")

# Pydantic models
class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str

class QuizResponse(BaseModel):
    questions: List[QuizQuestion]

class LearningContent(BaseModel):
    topic: str
    explanation: Optional[str] = None
    analogy: Optional[str] = None

# Initialize client
genai_client = initialize_genai()

# Content generation functions
async def generate_content(prompt, max_retries=3):
    """Generate content using Gemini with retry logic"""
    for attempt in range(max_retries):
        try:
            response = genai_client.models.generate_content(
                model="gemini-2.0-flash",
                contents=f"{system_prompt} \n query: {prompt} \n Do not show the thinking steps in the response.",
            )
            return response.text
        except Exception as e:
            if attempt < max_retries - 1:
                await asyncio.sleep(1)
    
    raise HTTPException(status_code=500, detail="Failed to generate content after multiple attempts")

# Function to clean and format markdown content
def format_markdown_content(content):
    """Clean and format markdown content for proper rendering"""
    if not content:
        return ""
    
    # Remove any HTML tags that might be in the response
    content = re.sub(r'<[^>]+>', '', content)
    
    # Remove any README.md or similar markers
    content = re.sub(r'^#+\s*README\.md\s*$', '', content, flags=re.MULTILINE)
    
    # Ensure proper markdown formatting
    # Fix headers that might be missing spaces after #
    content = re.sub(r'(#+)([^#\s])', r'\1 \2', content)
    
    # Ensure proper list formatting
    content = re.sub(r'^\s*[-*]\s*([^\s])', r'- \1', content, flags=re.MULTILINE)
    
    # Ensure proper code block formatting
    content = re.sub(r'```(\w+)?\n', r'```\1\n', content)
    
    # Fix any triple backticks that might be causing code block issues
    content = re.sub(r'```\s*```', '', content)
    
    # Ensure proper paragraph spacing
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    # Remove any leading/trailing whitespace
    content = content.strip()
    
    return content

async def get_topic_explanation(topic):
    """Generate detailed explanation for the topic"""
    prompt = f"""
    Provide a concise explanation of {topic}. Include:
    - Key concepts and principles
    - How it works or functions
    - Its significance or importance
    
    Format your response in clean markdown with proper headings, bullet points, and paragraphs.
    Do NOT use code blocks or pre-formatted text.
    Do NOT include any HTML tags.
    Keep it brief but informative.
    """
    content = await generate_content(prompt)
    
    # Additional processing to ensure proper markdown formatting
    content = format_markdown_content(content)
    
    # Ensure the content starts with a proper heading
    if not content.strip().startswith('# '):
        content = f"# Understanding {topic}\n\n{content}"
    
    # Ensure proper spacing between sections
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    return content

async def get_topic_analogy(topic):
    """Generate real-world analogy for the topic"""
    prompt = f"""
    Create a brief analogy that relates {topic} to a real-world scenario.
    The analogy should:
    - Compare {topic} to something familiar from everyday life
    - Highlight key aspects of {topic}
    - Be engaging and memorable
    
    Format your response in markdown.
    Keep it concise.
    """
    content = await generate_content(prompt)
    return format_markdown_content(content)

async def generate_quiz(topic, difficulty):
    """Generate quiz questions based on topic and difficulty"""
    prompt = f"""
    Create 3 quiz questions about {topic} at a {difficulty} difficulty level.
    
    For each question:
    - Provide a clear, focused question
    - Include 4 possible answers (A, B, C, D) with exactly one correct answer
    - Make sure questions test understanding, not just memorization
    
    Return the questions in the following JSON format:
    ```json
    [
      {{
        "question": "Question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_index": 0,
        "explanation": "Brief explanation of why this answer is correct"
      }},
      ...more questions...
    ]
    ```
    
    ONLY return the JSON. Do not include any other text.
    """
    
    response = await generate_content(prompt)
    
    # Extract JSON from the response
    try:
        # Find JSON content between triple backticks if present
        if "```json" in response and "```" in response.split("```json")[1]:
            json_str = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            json_str = response.split("```")[1].strip()
        else:
            json_str = response.strip()
        
        # Parse JSON
        questions = json.loads(json_str)
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing quiz questions: {str(e)}")

# Cache key generator
def generate_cache_key(topic: str, content_type: str) -> str:
    """Generate a unique cache key for a topic and content type"""
    return hashlib.md5(f"{topic}:{content_type}".encode()).hexdigest()

# Routes
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/generate-content")
async def create_content(learning_content: LearningContent):
    topic = learning_content.topic
    cache_key = generate_cache_key(topic, "content")
    
    # Check cache first
    if cache_key in content_cache:
        cached_data = content_cache[cache_key]
        if time.time() - cached_data["timestamp"] < CACHE_EXPIRY:
            return cached_data["data"]
    
    # Generate content in parallel
    explanation_task = asyncio.create_task(get_topic_explanation(topic))
    analogy_task = asyncio.create_task(get_topic_analogy(topic))
    
    # Wait for both tasks to complete
    explanation, analogy = await asyncio.gather(explanation_task, analogy_task)
    
    result = {
        "topic": topic,
        "explanation": explanation,
        "analogy": analogy
    }
    
    # Cache the result
    content_cache[cache_key] = {
        "data": result,
        "timestamp": time.time()
    }
    
    return result

@app.post("/generate-quiz")
async def create_quiz(topic: str = Form(...), difficulty: str = Form(...)):
    cache_key = generate_cache_key(f"{topic}:{difficulty}", "quiz")
    
    # Check cache first
    if cache_key in content_cache:
        cached_data = content_cache[cache_key]
        if time.time() - cached_data["timestamp"] < CACHE_EXPIRY:
            return cached_data["data"]
    
    questions = await generate_quiz(topic, difficulty)
    result = {"questions": questions}
    
    # Cache the result
    content_cache[cache_key] = {
        "data": result,
        "timestamp": time.time()
    }
    
    return result

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# For local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=PORT, reload=True)
