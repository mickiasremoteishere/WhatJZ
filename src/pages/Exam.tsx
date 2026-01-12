import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useExam } from '@/contexts/ExamContext';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { Button } from '@/components/ui/button';
import { QuestionImage } from '@/components/QuestionImage';
import { ScreenshotAlert } from '@/components/ScreenshotAlert';
import { 
  Clock, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Send,
  AlertTriangle,
  XCircle,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Exam = () => {
  const navigate = useNavigate();
  const { 
    currentExam, 
    currentAttempt, 
    getCurrentExamQuestions,
    submitAnswer, 
    flagQuestion, 
    unflagQuestion, 
    goToQuestion, 
    submitExam,
    cancelExam 
  } = useExam();

  const [timeLeft, setTimeLeft] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showDisqualified, setShowDisqualified] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [showScreenshotAlert, setShowScreenshotAlert] = useState(false);

  // Get questions for the current exam only
  const examQuestions = getCurrentExamQuestions();

  const handleWarning = useCallback((message: string) => {
    setWarningMessage(message);
    setShowWarning(true);
    toast.error(message);
  }, []);

  const handleDisqualify = useCallback(() => {
    setShowDisqualified(true);
    cancelExam('Multiple cheating violations detected');
  }, [cancelExam]);

  const handleScreenshotAttempt = useCallback(() => {
    setShowScreenshotAlert(true);
  }, []);

  const { warningCount } = useAntiCheat({
    onWarning: handleWarning,
    onDisqualify: handleDisqualify,
    onScreenshotAttempt: handleScreenshotAttempt,
    maxWarnings: 2,
  });

  useEffect(() => {
    if (!currentExam || !currentAttempt) {
      navigate('/dashboard');
      return;
    }

    // Initialize timer
    const duration = currentExam.duration * 60; // in seconds
    setTimeLeft(duration);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          navigate('/dashboard');
          toast.success('Time\'s up! Exam submitted.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentExam, currentAttempt, navigate, submitExam]);

  if (!currentExam || !currentAttempt || examQuestions.length === 0) {
    return null;
  }

  const currentQuestion = examQuestions.find(
    (q) => q.questionNumber === currentAttempt.currentQuestion
  );

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    submitAnswer(currentAttempt.currentQuestion, optionIndex);
  };

  const handlePrevious = () => {
    if (currentAttempt.currentQuestion > 1) {
      goToQuestion(currentAttempt.currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentAttempt.currentQuestion < examQuestions.length) {
      goToQuestion(currentAttempt.currentQuestion + 1);
    }
  };

  const handleFlagToggle = () => {
    if (currentAttempt.flaggedQuestions.includes(currentAttempt.currentQuestion)) {
      unflagQuestion(currentAttempt.currentQuestion);
    } else {
      flagQuestion(currentAttempt.currentQuestion);
    }
  };

  const handleSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    submitExam();
    navigate('/dashboard');
    toast.success('Exam submitted successfully!');
  };

  const getQuestionStatus = (questionNumber: number) => {
    if (currentAttempt.flaggedQuestions.includes(questionNumber)) return 'flagged';
    if (currentAttempt.answers[questionNumber] !== undefined) return 'answered';
    return 'unanswered';
  };

  const answeredCount = Object.keys(currentAttempt.answers).length;
  const unansweredCount = examQuestions.length - answeredCount;

  return (
    <div className="min-h-screen bg-background secure-mode">
      {/* Screenshot Alert Overlay */}
      <ScreenshotAlert
        isVisible={showScreenshotAlert}
        onDismiss={() => setShowScreenshotAlert(false)}
        warningCount={warningCount}
        maxWarnings={2}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-card/95 backdrop-blur-xl safe-area-top">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setShowNav(!showNav)}
            >
              {showNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h1 className="text-base md:text-lg font-display font-semibold text-foreground line-clamp-1">
                {currentExam.title}
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Question {currentAttempt.currentQuestion} of {examQuestions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {warningCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/20"
              >
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">
                  {warningCount}/2
                </span>
              </motion.div>
            )}
            
            <div className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-xl font-mono text-sm md:text-lg font-bold ${
              timeLeft < 300 ? 'bg-destructive/20 text-destructive animate-pulse' : 'bg-secondary text-foreground'
            }`}>
              <Clock className="w-4 h-4 md:w-5 md:h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Question Navigator - Sidebar */}
        <AnimatePresence>
          {(showNav || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 md:w-72 bg-card/95 backdrop-blur-xl border-r border-border/50 z-40 overflow-y-auto ${
                showNav ? 'block' : 'hidden lg:block'
              }`}
            >
              <div className="p-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Question Navigator</h3>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-accent" />
                    <span className="text-muted-foreground">Answered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-warning" />
                    <span className="text-muted-foreground">Flagged</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-muted" />
                    <span className="text-muted-foreground">Unanswered</span>
                  </div>
                </div>

                {/* Question Grid */}
                <div className="grid grid-cols-5 gap-2">
                  {examQuestions.map((q) => {
                    const status = getQuestionStatus(q.questionNumber);
                    const isCurrent = q.questionNumber === currentAttempt.currentQuestion;
                    
                    return (
                      <motion.button
                        key={q.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          goToQuestion(q.questionNumber);
                          setShowNav(false);
                        }}
                        className={`exam-nav-btn ${
                          status === 'answered' ? 'exam-nav-answered' : 
                          status === 'flagged' ? 'exam-nav-flagged' : 
                          'exam-nav-unanswered'
                        } ${isCurrent ? 'exam-nav-current' : ''}`}
                      >
                        {q.questionNumber}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="mt-6 p-4 rounded-xl bg-secondary/50">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-accent">{answeredCount}</div>
                      <div className="text-xs text-muted-foreground">Answered</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-muted-foreground">{unansweredCount}</div>
                      <div className="text-xs text-muted-foreground">Remaining</div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  className="w-full mt-4 btn-gradient"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Exam
                </Button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Question Area */}
        <main className="flex-1 p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm md:text-base">
                    {currentQuestion.questionNumber}
                  </span>
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Question {currentQuestion.questionNumber} of {examQuestions.length}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
                      {currentQuestion.marks} marks
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFlagToggle}
                  className={`text-xs md:text-sm ${currentAttempt.flaggedQuestions.includes(currentQuestion.questionNumber) 
                    ? 'border-warning text-warning' 
                    : ''
                  }`}
                >
                  <Flag className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  {currentAttempt.flaggedQuestions.includes(currentQuestion.questionNumber) 
                    ? 'Flagged' 
                    : 'Flag'
                  }
                </Button>
              </div>

              {/* Question Image (Steganographed) */}
              <div className="mb-6">
                <QuestionImage
                  questionNumber={currentQuestion.questionNumber}
                  questionText={currentQuestion.text}
                  options={currentQuestion.options}
                  examId={currentExam.id}
                />
              </div>

              {/* Answer Selection Buttons */}
              <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                <p className="text-sm text-muted-foreground mb-3">Select your answer:</p>
                {currentQuestion.options.map((_, index) => {
                  const isSelected = currentAttempt.answers[currentQuestion.questionNumber] === index;
                  const optionLabels = ['A', 'B', 'C', 'D'];
                  
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-3 md:p-4 text-left rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 bg-card/50 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <span className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-lg md:text-xl font-bold ${
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}>
                          {optionLabels[index]}
                        </span>
                        <span className="text-sm md:text-base text-foreground">
                          Option {optionLabels[index]}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentAttempt.currentQuestion === 1}
                  size="sm"
                  className="text-xs md:text-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1 md:mr-2" />
                  Previous
                </Button>

                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  {currentAttempt.currentQuestion} / {examQuestions.length}
                </div>

                {currentAttempt.currentQuestion === examQuestions.length ? (
                  <Button onClick={handleSubmit} className="btn-gradient text-xs md:text-sm" size="sm">
                    <Send className="w-4 h-4 mr-1 md:mr-2" />
                    Submit
                  </Button>
                ) : (
                  <Button onClick={handleNext} size="sm" className="text-xs md:text-sm">
                    Next
                    <ChevronRight className="w-4 h-4 ml-1 md:ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="glass-card border-destructive/50 max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-6 h-6" />
              Warning: Violation Detected!
            </DialogTitle>
            <DialogDescription className="text-foreground pt-2">
              {warningMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-foreground">
                <strong>Warning {warningCount} of 2:</strong> Another violation will result in automatic exam cancellation and disqualification.
              </p>
            </div>
          </div>
          <Button onClick={() => setShowWarning(false)} className="w-full">
            I Understand
          </Button>
        </DialogContent>
      </Dialog>

      {/* Disqualified Dialog */}
      <Dialog open={showDisqualified} onOpenChange={() => {}}>
        <DialogContent className="glass-card border-destructive/50 max-w-[90vw] sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-6 h-6" />
              Exam Cancelled
            </DialogTitle>
            <DialogDescription className="text-foreground pt-2">
              Your exam has been automatically cancelled due to multiple violations of the exam rules.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-foreground mb-2">
                <strong>Status:</strong> Disqualified
              </p>
              <p className="text-xs text-muted-foreground">
                This incident has been recorded. You cannot retake this exam. Please contact your instructor.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => {
              setShowDisqualified(false);
              navigate('/dashboard');
            }} 
            variant="destructive"
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </DialogContent>
      </Dialog>

      {/* Submit Confirmation */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent className="glass-card border-border/50 max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered <strong>{answeredCount}</strong> out of <strong>{examQuestions.length}</strong> questions.
              {unansweredCount > 0 && (
                <span className="block mt-2 text-warning">
                  Warning: {unansweredCount} question{unansweredCount > 1 ? 's' : ''} still unanswered.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Exam</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} className="btn-gradient">
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Exam;
