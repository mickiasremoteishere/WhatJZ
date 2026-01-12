export interface User {
  id: string;
  admissionId: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  biometricEnabled: boolean;
  avatarUrl?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  description: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'available' | 'completed' | 'cancelled';
  password?: string;
  createdBy: string;
  allowRetake?: boolean;
}

export interface Question {
  id: string;
  examId: string;
  questionNumber: number;
  text: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  answers: Record<number, number>;
  flaggedQuestions: number[];
  currentQuestion: number;
  status: 'in-progress' | 'completed' | 'disqualified';
  warningCount: number;
  score?: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  subject: string;
  userId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  completedAt: Date;
  status: 'passed' | 'failed' | 'disqualified';
  breakdown?: {
    correct: number;
    incorrect: number;
    unanswered: number;
  };
}

export interface CheatEvent {
  type: 'tab-switch' | 'screenshot-attempt' | 'copy-paste' | 'right-click' | 'suspicious-activity' | 'devtools';
  timestamp: Date;
  description: string;
}
