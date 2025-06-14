# LearnSmart Platform

An AI-powered language learning platform that helps users master any topic through dynamic content generation, interactive quizzes, and personalized learning paths. Built with React, TypeScript, and Vite, it leverages Google's Generative AI to create an engaging and effective learning experience.

## 🚀 Core Features

### 🔍 Topic-Based Learning
- Search and explore any topic of interest
- AI-generated comprehensive content
- Multi-language support for content
- Interactive learning materials
- Real-time content generation

### 📝 Dynamic Quiz System
- Three difficulty levels:
  - Easy: Basic concept understanding
  - Medium: Application of concepts
  - Advanced: Complex problem-solving
- AI-generated questions based on:
  - Selected topic
  - User's learning progress
  - Previous quiz performance
- Instant feedback and explanations
- Progress tracking and analytics

### 🎯 Understanding Assessment
- Topic-specific quizzes
- Difficulty progression
- Performance analytics
- Learning path recommendations
- Concept mastery tracking

### 🌍 Multi-Language Support
- Content in multiple languages
- Language-specific quiz generation
- Culturally adapted examples
- Localized user interface

## 🏗️ Application Structure

### Core Components
- `TopicInput.tsx`: Topic search and selection
- `QuizSection.tsx`: Dynamic quiz generation and management
- `ContentSection.tsx`: AI-generated learning content
- `LanguageSelector.tsx`: Language preference management
- `Header.tsx`: Navigation and user interface
- `Footer.tsx`: Additional information and links
- `LoadingSpinner.tsx`: Loading state management
- `Toast.tsx`: User notifications
- `APIKeyModal.tsx`: API key configuration

### Project Structure
```
learn_smart/
├── src/
│   ├── components/     # React components
│   │   ├── TopicInput.tsx    # Topic search interface
│   │   ├── QuizSection.tsx   # Quiz generation and display
│   │   ├── ContentSection.tsx # Learning content display
│   │   ├── LanguageSelector.tsx # Language selection
│   │   └── ...              # Other UI components
│   ├── services/      # API and service integrations
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── ...               # Configuration files
```

## 🎯 Learning Flow

1. **Topic Selection**
   - Search for any topic of interest
   - Select preferred language
   - Choose difficulty level

2. **Content Generation**
   - AI generates comprehensive content
   - Multi-language support
   - Interactive learning materials

3. **Quiz Generation**
   - Dynamic quiz creation based on:
     - Selected topic
     - Difficulty level
     - User's learning progress
   - Three difficulty levels:
     - Easy: Basic understanding
     - Medium: Concept application
     - Advanced: Complex problems

4. **Progress Tracking**
   - Quiz performance analytics
   - Learning path recommendations
   - Concept mastery tracking

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **AI Integration:** Google Generative AI
- **State Management:** React Context/Hooks
- **Internationalization:** i18n support

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd learn_smart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code linting

## 📁 Project Structure

```
learn_smart/
├── src/
│   ├── components/     # React components
│   │   ├── TopicInput.tsx    # Topic search interface
│   │   ├── QuizSection.tsx   # Quiz generation and display
│   │   ├── ContentSection.tsx # Learning content display
│   │   ├── LanguageSelector.tsx # Language selection
│   │   └── ...              # Other UI components
│   ├── services/      # API and service integrations
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── ...               # Configuration files
```

## 🔧 Configuration Files

- `vite.config.ts` - Vite bundler configuration