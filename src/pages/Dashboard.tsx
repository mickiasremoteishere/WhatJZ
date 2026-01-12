import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useExam } from '@/contexts/ExamContext';
import { FloatingParticles } from '@/components/FloatingParticles';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  GraduationCap, 
  BookOpen, 
  Trophy, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Play,
  Lock,
  LogOut,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Ban
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { exams, results, startExam, isExamDisqualified, canRetakeExam, getExamQuestions } = useExam();
  const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [examPassword, setExamPassword] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);

  const availableExams = exams.filter(e => e.status === 'available');
  const scheduledExams = exams.filter(e => e.status === 'scheduled');
  const completedExams = exams.filter(e => e.status === 'completed');

  const handleStartExam = (examId: string) => {
    // Check if disqualified
    if (isExamDisqualified(examId)) {
      toast.error('You cannot retake this exam due to disqualification.');
      return;
    }

    // Check if has questions
    const questions = getExamQuestions(examId);
    if (questions.length === 0) {
      toast.error('This exam has no questions yet.');
      return;
    }

    setSelectedExamId(examId);
    setShowPermissions(true);
  };

  const handleExamPasswordSubmit = async () => {
    if (!selectedExamId || !examPassword) {
      toast.error('Please enter the exam password');
      return;
    }

    setIsStarting(true);
    const success = await startExam(selectedExamId, examPassword);
    setIsStarting(false);

    if (success) {
      toast.success('Exam started! Good luck!');
      navigate('/exam');
    } else {
      toast.error('Invalid exam password or cannot start exam');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
  };

  const tabs = [
    { id: 'exams', label: 'Exams', icon: BookOpen },
    { id: 'results', label: 'Results', icon: Trophy },
  ];

  // Get result for a specific exam
  const getExamResult = (examId: string) => {
    return results.find(r => r.examId === examId);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-xl safe-area-top">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-3"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-display font-semibold text-foreground">ExamSecure</h1>
              <p className="text-[10px] md:text-xs text-muted-foreground">Student Portal</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-4"
          >
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{user?.name || 'Student'}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground h-9 w-9"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-4 md:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h2 className="text-xl md:text-3xl font-display font-bold text-foreground mb-1 md:mb-2">
            Welcome, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {availableExams.length > 0 
              ? `You have ${availableExams.length} exam${availableExams.length > 1 ? 's' : ''} available`
              : 'No exams available right now'}
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-1 md:gap-2 mb-4 md:mb-6 p-1 bg-secondary/30 rounded-xl w-fit"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'exams' | 'results')}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'exams' && (
            <motion.div
              key="exams"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 md:space-y-8"
            >
              {/* Available Exams */}
              {availableExams.length > 0 && (
                <section>
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    Available Now
                  </h3>
                  <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
                    {availableExams.map((exam, index) => {
                      const isDisqualified = isExamDisqualified(exam.id);
                      const hasQuestions = getExamQuestions(exam.id).length > 0;
                      
                      return (
                        <GlassCard
                          key={exam.id}
                          delay={index * 0.1}
                          className={`p-4 md:p-6 transition-all ${
                            isDisqualified 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:border-primary/50 cursor-pointer'
                          } group`}
                          onClick={() => !isDisqualified && handleStartExam(exam.id)}
                        >
                          <div className="flex items-start justify-between mb-3 md:mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                              {isDisqualified ? (
                                <Ban className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
                              ) : (
                                <Play className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                              )}
                            </div>
                            {isDisqualified ? (
                              <span className="px-2 py-1 text-[10px] md:text-xs font-medium rounded-full bg-destructive/20 text-destructive">
                                Disqualified
                              </span>
                            ) : !hasQuestions ? (
                              <span className="px-2 py-1 text-[10px] md:text-xs font-medium rounded-full bg-warning/20 text-warning">
                                No Questions
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-[10px] md:text-xs font-medium rounded-full bg-accent/20 text-accent">
                                Available
                              </span>
                            )}
                          </div>
                          <h4 className="text-base md:text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                            {exam.title}
                          </h4>
                          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">{exam.subject}</p>
                          <div className="flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                              {formatDuration(exam.duration)}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3 md:w-3.5 md:h-3.5" />
                              {exam.totalQuestions} Questions
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3 h-3 md:w-3.5 md:h-3.5" />
                              {exam.totalMarks} Marks
                            </span>
                          </div>
                          {!isDisqualified && hasQuestions && (
                            <motion.div
                              className="mt-3 md:mt-4 flex items-center gap-2 text-xs md:text-sm font-medium text-primary"
                              initial={{ x: 0 }}
                              whileHover={{ x: 5 }}
                            >
                              Start Exam <ChevronRight className="w-4 h-4" />
                            </motion.div>
                          )}
                          {isDisqualified && (
                            <p className="mt-3 text-xs text-destructive">
                              Cannot retake - disqualified for cheating
                            </p>
                          )}
                        </GlassCard>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Scheduled Exams */}
              {scheduledExams.length > 0 && (
                <section>
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    Scheduled Exams
                  </h3>
                  <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {scheduledExams.map((exam, index) => (
                      <GlassCard
                        key={exam.id}
                        delay={0.2 + index * 0.1}
                        className="p-4 md:p-5 opacity-80"
                      >
                        <div className="flex items-start justify-between mb-2 md:mb-3">
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Lock className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                          </div>
                          <span className="px-2 py-1 text-[10px] md:text-xs font-medium rounded-full bg-secondary text-muted-foreground">
                            Not Yet Taken
                          </span>
                        </div>
                        <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">{exam.title}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">{exam.subject}</p>
                        <div className="text-[10px] md:text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                            {formatDate(exam.startTime)}
                          </span>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </section>
              )}

              {/* Completed Exams */}
              {completedExams.length > 0 && (
                <section>
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                    Completed Exams
                  </h3>
                  <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {completedExams.map((exam, index) => {
                      const result = getExamResult(exam.id);
                      return (
                        <GlassCard
                          key={exam.id}
                          delay={0.2 + index * 0.1}
                          className="p-4 md:p-5"
                        >
                          <div className="flex items-start justify-between mb-2 md:mb-3">
                            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${
                              result?.status === 'passed' ? 'bg-accent/20' : 
                              result?.status === 'disqualified' ? 'bg-destructive/20' : 'bg-warning/20'
                            }`}>
                              {result?.status === 'passed' ? (
                                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                              ) : result?.status === 'disqualified' ? (
                                <Ban className="w-4 h-4 md:w-5 md:h-5 text-destructive" />
                              ) : (
                                <XCircle className="w-4 h-4 md:w-5 md:h-5 text-warning" />
                              )}
                            </div>
                            <span className={`px-2 py-1 text-[10px] md:text-xs font-medium rounded-full ${
                              result?.status === 'passed' ? 'bg-accent/20 text-accent' : 
                              result?.status === 'disqualified' ? 'bg-destructive/20 text-destructive' : 
                              'bg-warning/20 text-warning'
                            }`}>
                              {result?.status === 'passed' ? 'Passed' : 
                               result?.status === 'disqualified' ? 'Disqualified' : 'Failed'}
                            </span>
                          </div>
                          <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">{exam.title}</h4>
                          <p className="text-xs md:text-sm text-muted-foreground mb-2">{exam.subject}</p>
                          {result && (
                            <div className="text-lg md:text-xl font-bold text-foreground">
                              {result.percentage}%
                              <span className="text-xs md:text-sm text-muted-foreground font-normal ml-2">
                                ({result.score}/{result.totalMarks})
                              </span>
                            </div>
                          )}
                        </GlassCard>
                      );
                    })}
                  </div>
                </section>
              )}

              {availableExams.length === 0 && scheduledExams.length === 0 && completedExams.length === 0 && (
                <GlassCard className="p-8 md:p-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-semibold text-foreground mb-2">No Exams Available</h4>
                  <p className="text-sm text-muted-foreground">
                    Check back later for new exams.
                  </p>
                </GlassCard>
              )}
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Your Results</h3>
              {results.length === 0 ? (
                <GlassCard className="p-8 md:p-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">No Results Yet</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete an exam to see your results here.
                  </p>
                </GlassCard>
              ) : (
                <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((result, index) => (
                    <GlassCard
                      key={result.id}
                      delay={index * 0.1}
                      className="p-4 md:p-6"
                    >
                      <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                          result.status === 'passed' ? 'bg-accent/20' : 
                          result.status === 'disqualified' ? 'bg-destructive/20' : 'bg-warning/20'
                        }`}>
                          {result.status === 'passed' ? (
                            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                          ) : result.status === 'disqualified' ? (
                            <Ban className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
                          ) : (
                            <XCircle className="w-5 h-5 md:w-6 md:h-6 text-warning" />
                          )}
                        </div>
                        <span className={`px-2 py-1 text-[10px] md:text-xs font-medium rounded-full ${
                          result.status === 'passed' ? 'bg-accent/20 text-accent' : 
                          result.status === 'disqualified' ? 'bg-destructive/20 text-destructive' : 
                          'bg-warning/20 text-warning'
                        }`}>
                          {result.status === 'passed' ? 'Passed' : 
                           result.status === 'disqualified' ? 'Disqualified' : 'Failed'}
                        </span>
                      </div>
                      <h4 className="text-sm md:text-base font-semibold text-foreground mb-1">{result.examTitle}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">{result.subject}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl md:text-3xl font-bold text-foreground">{result.percentage}%</span>
                        <span className="text-xs md:text-sm text-muted-foreground">
                          {result.score}/{result.totalMarks}
                        </span>
                      </div>

                      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
                        <motion.div
                          className={`h-full ${
                            result.status === 'passed' ? 'bg-accent' : 
                            result.status === 'disqualified' ? 'bg-destructive' : 'bg-warning'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${result.percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        />
                      </div>

                      {result.breakdown && (
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 rounded-lg bg-accent/10">
                            <div className="font-semibold text-accent">{result.breakdown.correct}</div>
                            <div className="text-muted-foreground">Correct</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-destructive/10">
                            <div className="font-semibold text-destructive">{result.breakdown.incorrect}</div>
                            <div className="text-muted-foreground">Wrong</div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted">
                            <div className="font-semibold text-muted-foreground">{result.breakdown.unanswered}</div>
                            <div className="text-muted-foreground">Skipped</div>
                          </div>
                        </div>
                      )}

                      {result.status === 'disqualified' && (
                        <p className="mt-3 text-xs text-destructive text-center">
                          Disqualified for cheating violation
                        </p>
                      )}
                    </GlassCard>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Permissions Dialog */}
      <Dialog open={showPermissions} onOpenChange={setShowPermissions}>
        <DialogContent className="glass-card border-border/50 max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Exam Rules
            </DialogTitle>
            <DialogDescription>
              Please read before starting:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">No Tab Switching</p>
                  <p className="text-xs text-muted-foreground">Stay on the exam window</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">No Copy/Paste</p>
                  <p className="text-xs text-muted-foreground">Disabled during exam</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">2 Warnings = Disqualification</p>
                  <p className="text-xs text-muted-foreground">Cannot retake if disqualified</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Exam Password
              </label>
              <Input
                type="password"
                placeholder="Enter password"
                value={examPassword}
                onChange={(e) => setExamPassword(e.target.value)}
                className="bg-secondary/50"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowPermissions(false);
                setSelectedExamId(null);
                setExamPassword('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExamPasswordSubmit}
              disabled={isStarting || !examPassword}
              className="flex-1 btn-gradient"
            >
              {isStarting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
