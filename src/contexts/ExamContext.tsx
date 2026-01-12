import React, { createContext, useContext, useState, useCallback } from 'react';
import { Exam, Question, ExamAttempt, ExamResult, CheatEvent } from '@/types/exam';

interface ExamContextType {
  exams: Exam[];
  currentExam: Exam | null;
  currentAttempt: ExamAttempt | null;
  questions: Question[];
  results: ExamResult[];
  cheatEvents: CheatEvent[];
  isExamMode: boolean;
  disqualifiedExamIds: string[];
  startExam: (examId: string, password: string) => Promise<boolean>;
  submitAnswer: (questionNumber: number, answer: number) => void;
  flagQuestion: (questionNumber: number) => void;
  unflagQuestion: (questionNumber: number) => void;
  goToQuestion: (questionNumber: number) => void;
  submitExam: () => void;
  cancelExam: (reason: string) => void;
  recordCheatEvent: (event: Omit<CheatEvent, 'timestamp'>) => void;
  getWarningCount: () => number;
  addExam: (exam: Omit<Exam, 'id'>, examQuestions: Omit<Question, 'id' | 'examId'>[]) => void;
  getExamQuestions: (examId: string) => Question[];
  getCurrentExamQuestions: () => Question[];
  isExamDisqualified: (examId: string) => boolean;
  canRetakeExam: (examId: string) => boolean;
  // Admin functions
  deleteExam: (examId: string) => void;
  updateExamStatus: (examId: string, status: Exam['status']) => void;
  toggleRetake: (examId: string, allow: boolean) => void;
  getExamStats: () => { total: number; available: number; scheduled: number; completed: number };
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

// Initial exam data
const initialExams: Exam[] = [
  {
    id: '1',
    title: 'Mathematics Final Exam',
    subject: 'Mathematics',
    description: 'Comprehensive final examination covering algebra, calculus, and statistics.',
    duration: 120,
    totalQuestions: 5,
    totalMarks: 10,
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000 * 4),
    status: 'available',
    password: 'math2024',
    createdBy: 'TCH2024001',
    allowRetake: false,
  },
  {
    id: '2',
    title: 'Physics Mid-Term',
    subject: 'Physics',
    description: 'Mid-term assessment on mechanics and thermodynamics.',
    duration: 90,
    totalQuestions: 40,
    totalMarks: 80,
    startTime: new Date(Date.now() + 86400000),
    endTime: new Date(Date.now() + 86400000 + 3600000 * 2),
    status: 'scheduled',
    password: 'physics2024',
    createdBy: 'TCH2024001',
    allowRetake: false,
  },
  {
    id: '3',
    title: 'Chemistry Unit Test',
    subject: 'Chemistry',
    description: 'Unit test on organic chemistry fundamentals.',
    duration: 60,
    totalQuestions: 30,
    totalMarks: 60,
    startTime: new Date(Date.now() + 172800000),
    endTime: new Date(Date.now() + 172800000 + 3600000),
    status: 'scheduled',
    password: 'chem2024',
    createdBy: 'TCH2024001',
    allowRetake: false,
  },
];

const initialQuestions: Question[] = [
  {
    id: 'q1',
    examId: '1',
    questionNumber: 1,
    text: 'What is the derivative of f(x) = x² + 3x + 2?',
    options: ['2x + 3', 'x + 3', '2x + 2', 'x² + 3'],
    correctAnswer: 0,
    marks: 2,
  },
  {
    id: 'q2',
    examId: '1',
    questionNumber: 2,
    text: 'Solve for x: 2x + 5 = 15',
    options: ['x = 5', 'x = 10', 'x = 7', 'x = 3'],
    correctAnswer: 0,
    marks: 2,
  },
  {
    id: 'q3',
    examId: '1',
    questionNumber: 3,
    text: 'What is the integral of ∫(3x² + 2x)dx?',
    options: ['x³ + x² + C', '6x + 2 + C', '3x + 2 + C', 'x³ + x + C'],
    correctAnswer: 0,
    marks: 2,
  },
  {
    id: 'q4',
    examId: '1',
    questionNumber: 4,
    text: 'Find the value of sin(90°)',
    options: ['0', '1', '-1', '0.5'],
    correctAnswer: 1,
    marks: 2,
  },
  {
    id: 'q5',
    examId: '1',
    questionNumber: 5,
    text: 'What is the quadratic formula?',
    options: [
      'x = (-b ± √(b² - 4ac)) / 2a',
      'x = (-b ± √(b² + 4ac)) / 2a',
      'x = (b ± √(b² - 4ac)) / 2a',
      'x = (-b ± √(b² - 4ac)) / a',
    ],
    correctAnswer: 0,
    marks: 2,
  },
];

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [cheatEvents, setCheatEvents] = useState<CheatEvent[]>([]);
  const [isExamMode, setIsExamMode] = useState(false);
  const [disqualifiedExamIds, setDisqualifiedExamIds] = useState<string[]>([]);
  const [retakeAllowed, setRetakeAllowed] = useState<Record<string, boolean>>({});

  const getExamQuestions = useCallback((examId: string) => {
    return questions.filter(q => q.examId === examId).sort((a, b) => a.questionNumber - b.questionNumber);
  }, [questions]);

  const getCurrentExamQuestions = useCallback(() => {
    if (!currentExam) return [];
    return questions.filter(q => q.examId === currentExam.id).sort((a, b) => a.questionNumber - b.questionNumber);
  }, [currentExam, questions]);

  const isExamDisqualified = useCallback((examId: string) => {
    return disqualifiedExamIds.includes(examId);
  }, [disqualifiedExamIds]);

  const canRetakeExam = useCallback((examId: string) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return false;
    if (isExamDisqualified(examId)) return false;
    if (exam.status === 'completed') {
      return retakeAllowed[examId] || exam.allowRetake || false;
    }
    return true;
  }, [exams, isExamDisqualified, retakeAllowed]);

  const startExam = useCallback(
    async (examId: string, password: string): Promise<boolean> => {
      const exam = exams.find((e) => e.id === examId);
      if (!exam || exam.password !== password) {
        return false;
      }

      // Check if disqualified
      if (isExamDisqualified(examId)) {
        return false;
      }

      // Check if can retake
      if (exam.status === 'completed' && !canRetakeExam(examId)) {
        return false;
      }

      const examQuestions = getExamQuestions(examId);
      if (examQuestions.length === 0) {
        return false;
      }

      setCurrentExam(exam);
      setCurrentAttempt({
        id: `attempt-${Date.now()}`,
        examId,
        userId: '1',
        startedAt: new Date(),
        answers: {},
        flaggedQuestions: [],
        currentQuestion: 1,
        status: 'in-progress',
        warningCount: 0,
      });
      setIsExamMode(true);
      setCheatEvents([]);
      return true;
    },
    [exams, getExamQuestions, isExamDisqualified, canRetakeExam]
  );

  const submitAnswer = useCallback((questionNumber: number, answer: number) => {
    setCurrentAttempt((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: { ...prev.answers, [questionNumber]: answer },
      };
    });
  }, []);

  const flagQuestion = useCallback((questionNumber: number) => {
    setCurrentAttempt((prev) => {
      if (!prev) return prev;
      if (prev.flaggedQuestions.includes(questionNumber)) return prev;
      return {
        ...prev,
        flaggedQuestions: [...prev.flaggedQuestions, questionNumber],
      };
    });
  }, []);

  const unflagQuestion = useCallback((questionNumber: number) => {
    setCurrentAttempt((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        flaggedQuestions: prev.flaggedQuestions.filter((q) => q !== questionNumber),
      };
    });
  }, []);

  const goToQuestion = useCallback((questionNumber: number) => {
    setCurrentAttempt((prev) => {
      if (!prev) return prev;
      return { ...prev, currentQuestion: questionNumber };
    });
  }, []);

  const submitExam = useCallback(() => {
    if (!currentExam || !currentAttempt) return;

    const examQuestions = questions.filter(q => q.examId === currentExam.id);
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    examQuestions.forEach((q) => {
      const answer = currentAttempt.answers[q.questionNumber];
      if (answer === undefined) {
        unansweredCount++;
      } else if (answer === q.correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const score = correctCount * 2;
    const totalMarks = examQuestions.length * 2;
    const percentage = Math.round((score / totalMarks) * 100);

    const newResult: ExamResult = {
      id: `result-${Date.now()}`,
      examId: currentExam.id,
      examTitle: currentExam.title,
      subject: currentExam.subject,
      userId: currentAttempt.userId,
      score,
      totalMarks,
      percentage,
      completedAt: new Date(),
      status: percentage >= 40 ? 'passed' : 'failed',
      breakdown: {
        correct: correctCount,
        incorrect: incorrectCount,
        unanswered: unansweredCount,
      },
    };

    setResults((prev) => [...prev, newResult]);

    setExams((prev) =>
      prev.map((e) =>
        e.id === currentExam.id ? { ...e, status: 'completed' as const } : e
      )
    );

    setCurrentAttempt(null);
    setCurrentExam(null);
    setIsExamMode(false);
  }, [currentExam, currentAttempt, questions]);

  const cancelExam = useCallback((reason: string) => {
    if (!currentExam || !currentAttempt) return;

    const newResult: ExamResult = {
      id: `result-${Date.now()}`,
      examId: currentExam.id,
      examTitle: currentExam.title,
      subject: currentExam.subject,
      userId: currentAttempt.userId,
      score: 0,
      totalMarks: currentExam.totalMarks,
      percentage: 0,
      completedAt: new Date(),
      status: 'disqualified',
      breakdown: {
        correct: 0,
        incorrect: 0,
        unanswered: currentExam.totalQuestions,
      },
    };

    setResults((prev) => [...prev, newResult]);

    // Mark exam as disqualified - cannot be retaken
    setDisqualifiedExamIds((prev) => [...prev, currentExam.id]);

    setExams((prev) =>
      prev.map((e) =>
        e.id === currentExam.id ? { ...e, status: 'completed' as const } : e
      )
    );

    setCurrentAttempt((prev) => {
      if (!prev) return prev;
      return { ...prev, status: 'disqualified', completedAt: new Date() };
    });
    setIsExamMode(false);
  }, [currentExam, currentAttempt]);

  const recordCheatEvent = useCallback((event: Omit<CheatEvent, 'timestamp'>) => {
    const newEvent = { ...event, timestamp: new Date() };
    setCheatEvents((prev) => [...prev, newEvent]);
    setCurrentAttempt((prev) => {
      if (!prev) return prev;
      return { ...prev, warningCount: prev.warningCount + 1 };
    });
  }, []);

  const getWarningCount = useCallback(() => {
    return currentAttempt?.warningCount || 0;
  }, [currentAttempt]);

  const addExam = useCallback((examData: Omit<Exam, 'id'>, examQuestions: Omit<Question, 'id' | 'examId'>[]) => {
    const newExamId = `exam-${Date.now()}`;
    
    const newExam: Exam = {
      ...examData,
      id: newExamId,
      totalQuestions: examQuestions.length,
      totalMarks: examQuestions.reduce((sum, q) => sum + q.marks, 0),
      allowRetake: false,
    };

    const newQuestions: Question[] = examQuestions.map((q, index) => ({
      ...q,
      id: `q-${newExamId}-${index + 1}`,
      examId: newExamId,
      questionNumber: index + 1,
    }));

    setExams((prev) => [...prev, newExam]);
    setQuestions((prev) => [...prev, ...newQuestions]);
  }, []);

  // Admin functions
  const deleteExam = useCallback((examId: string) => {
    setExams((prev) => prev.filter((e) => e.id !== examId));
    setQuestions((prev) => prev.filter((q) => q.examId !== examId));
    setResults((prev) => prev.filter((r) => r.examId !== examId));
  }, []);

  const updateExamStatus = useCallback((examId: string, status: Exam['status']) => {
    setExams((prev) =>
      prev.map((e) => (e.id === examId ? { ...e, status } : e))
    );
  }, []);

  const toggleRetake = useCallback((examId: string, allow: boolean) => {
    setRetakeAllowed((prev) => ({ ...prev, [examId]: allow }));
    setExams((prev) =>
      prev.map((e) => (e.id === examId ? { ...e, allowRetake: allow } : e))
    );
    // If allowing retake, remove from disqualified list
    if (allow) {
      setDisqualifiedExamIds((prev) => prev.filter((id) => id !== examId));
    }
  }, []);

  const getExamStats = useCallback(() => {
    return {
      total: exams.length,
      available: exams.filter((e) => e.status === 'available').length,
      scheduled: exams.filter((e) => e.status === 'scheduled').length,
      completed: exams.filter((e) => e.status === 'completed').length,
    };
  }, [exams]);

  return (
    <ExamContext.Provider
      value={{
        exams,
        currentExam,
        currentAttempt,
        questions,
        results,
        cheatEvents,
        isExamMode,
        disqualifiedExamIds,
        startExam,
        submitAnswer,
        flagQuestion,
        unflagQuestion,
        goToQuestion,
        submitExam,
        cancelExam,
        recordCheatEvent,
        getWarningCount,
        addExam,
        getExamQuestions,
        getCurrentExamQuestions,
        isExamDisqualified,
        canRetakeExam,
        deleteExam,
        updateExamStatus,
        toggleRetake,
        getExamStats,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
