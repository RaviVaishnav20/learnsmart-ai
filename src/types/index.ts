export interface LearningContent {
  topic: string;
  explanation: string;
  analogy: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface QuizData {
  questions: QuizQuestion[];
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'warning';
}

export interface QuizAnswer {
  questionIndex: number;
  selectedOption: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  feedback: string;
}