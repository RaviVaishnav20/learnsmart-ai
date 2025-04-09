# Learning App

A FastAPI-based web application for interactive learning experiences.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=8000
GOOGLE_API_KEY=your_google_api_key_here
```

## Running the Application

1. Start the development server:
```bash
python app.py
```

2. Access the application at `http://localhost:8000`

## Features

- Interactive learning interface
- Real-time feedback
- Progress tracking
- Responsive design

## Project Structure

```
learning_app/
├── app.py              # Main application file
├── requirements.txt    # Project dependencies
├── .env               # Environment variables
├── static/            # Static files (CSS, JS)
└── templates/         # HTML templates
```

## Development

The application uses FastAPI for the backend and Jinja2 for templating. The frontend is built with HTML, CSS, and JavaScript.

## License

MIT 