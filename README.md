# LearnSmart AI 🧠

**LearnSmart** is an AI-powered interactive learning platform built with FastAPI and Gemini AI. It allows users to explore topics, receive concise explanations, discover real-world analogies, and test their understanding with auto-generated quizzes.

## 🚀 Features

- 🔍 Topic Understanding: Get clear, concise explanations of complex concepts.
- 🎓 Real-world Analogies: Reinforce learning through everyday comparisons.
- ❓ Dynamic Quizzes: Auto-generated questions to test comprehension.
- 🧠 Powered by Gemini API: AI-generated content tailored to your topic and difficulty.
- 🌙 Light/Dark Theme Toggle
- 📋 One-click copy functionality

## 🖥️ Tech Stack

- **Backend**: FastAPI
- **Frontend**: HTML, Bootstrap, JS
- **AI Engine**: Google Gemini (via `google.genai`)
- **Templating**: Jinja2
- **Environment Config**: `python-dotenv`

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## 💡 Project Structure

```
learning_app/
├── app.py             # FastAPI application logic
├── run.py             # Entrypoint for deployment
├── requirements.txt   # Dependencies
├── Procfile           # Render deployment configuration
├── templates/         # Jinja2 HTML templates
│   └── index.html
├── static/
│   ├── css/
│   └── js/
│       └── app.js     # Frontend interactivity
```

## ⚙️ Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Create .env with your API key
echo "GEMINI_API_KEY=your_key" > .env

# Run the server
uvicorn app:app --reload
```

Open your browser at: [http://localhost:8000](http://localhost:8000)

---

## 🌐 Live Deployment (Render)

1. Push code to GitHub.
2. Create a new **Web Service** on [Render.com](https://render.com).
3. Add environment variable `GEMINI_API_KEY`.
4. Set start command:  
   ```bash
   uvicorn run:app --host=0.0.0.0 --port=10000
   ```

---

## 📸 Screenshot (Optional)

_Add a screenshot of the UI here to showcase the interface._

---

## 🧩 Future Ideas

- User login / learning progress tracking
- Topic recommendation engine
- More advanced visualizations and interactive learning

---

## 📜 License

MIT License. Feel free to fork, enhance, and share!

