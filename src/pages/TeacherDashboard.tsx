import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useExam } from '@/contexts/ExamContext';
import { FloatingParticles } from '@/components/FloatingParticles';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  PlusCircle,
  LogOut,
  User,
  Eye,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  ListChecks
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuestionInput {
  text: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

interface MonitorData {
  studentName: string;
  status: 'active' | 'warning' | 'completed';
  progress: number;
  warnings: number;
}

const mockMonitorData: MonitorData[] = [
  { studentName: 'Alice Johnson', status: 'active', progress: 65, warnings: 0 },
  { studentName: 'Bob Smith', status: 'warning', progress: 45, warnings: 1 },
  { studentName: 'Carol Williams', status: 'active', progress: 80, warnings: 0 },
  { studentName: 'David Brown', status: 'completed', progress: 100, warnings: 0 },
  { studentName: 'Eva Martinez', status: 'active', progress: 30, warnings: 0 },
];

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { exams, addExam, results } = useExam();
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [examData, setExamData] = useState({
    title: '',
    subject: '',
    description: '',
    duration: 60,
    password: '',
    status: 'available' as 'available' | 'scheduled',
  });
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { text: '', options: ['', '', '', ''], correctAnswer: 0, marks: 2 }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: 0, marks: 2 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof QuestionInput, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleCreateExam = () => {
    if (!examData.title || !examData.subject || !examData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate questions
    const validQuestions = questions.filter(q => 
      q.text.trim() && q.options.every(o => o.trim())
    );

    if (validQuestions.length === 0) {
      toast.error('Please add at least one complete question');
      return;
    }

    addExam(
      {
        title: examData.title,
        subject: examData.subject,
        description: examData.description,
        duration: examData.duration,
        totalQuestions: validQuestions.length,
        totalMarks: validQuestions.reduce((sum, q) => sum + q.marks, 0),
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000 * 4),
        status: examData.status,
        password: examData.password,
        createdBy: user?.admissionId || 'TCH2024001',
      },
      validQuestions.map((q, idx) => ({
        questionNumber: idx + 1,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
      }))
    );

    toast.success('Exam created successfully!');
    setShowCreateExam(false);
    setShowQuestionBuilder(false);
    setExamData({ title: '', subject: '', description: '', duration: 60, password: '', status: 'available' });
    setQuestions([{ text: '', options: ['', '', '', ''], correctAnswer: 0, marks: 2 }]);
  };

  const teacherExams = exams.filter(e => e.createdBy === (user?.admissionId || 'TCH2024001'));
  
  const stats = [
    { label: 'Active Exams', value: teacherExams.filter(e => e.status === 'available').length, icon: BookOpen, color: 'text-primary' },
    { label: 'Total Exams', value: teacherExams.length, icon: ListChecks, color: 'text-accent' },
    { label: 'Live Sessions', value: mockMonitorData.filter(s => s.status === 'active').length, icon: Eye, color: 'text-warning' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-xl">
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
              <p className="text-[10px] md:text-xs text-muted-foreground">Teacher Portal</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-4"
          >
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{user?.name || 'Teacher'}</span>
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
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8"
        >
          <div>
            <h2 className="text-xl md:text-3xl font-display font-bold text-foreground mb-1 md:mb-2">
              Teacher Dashboard
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage exams and monitor student progress
            </p>
          </div>
          
          <Dialog open={showCreateExam} onOpenChange={setShowCreateExam}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 btn-gradient text-sm md:text-base">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50 sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
              <DialogHeader>
                <DialogTitle className="text-base md:text-lg">Create New Exam</DialogTitle>
                <DialogDescription className="text-xs md:text-sm">
                  Set up a new exam with questions for your students
                </DialogDescription>
              </DialogHeader>
              
              {!showQuestionBuilder ? (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-xs md:text-sm">Exam Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Mathematics Final Exam"
                        value={examData.title}
                        onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                        className="bg-secondary/50 h-9 md:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-xs md:text-sm">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Mathematics"
                        value={examData.subject}
                        onChange={(e) => setExamData({ ...examData, subject: e.target.value })}
                        className="bg-secondary/50 h-9 md:h-10 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs md:text-sm">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the exam..."
                      value={examData.description}
                      onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                      className="bg-secondary/50 text-sm min-h-[80px]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-xs md:text-sm">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={examData.duration}
                        onChange={(e) => setExamData({ ...examData, duration: parseInt(e.target.value) || 60 })}
                        className="bg-secondary/50 h-9 md:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-xs md:text-sm">Exam Password *</Label>
                      <Input
                        id="password"
                        type="text"
                        placeholder="Student access code"
                        value={examData.password}
                        onChange={(e) => setExamData({ ...examData, password: e.target.value })}
                        className="bg-secondary/50 h-9 md:h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs md:text-sm">Status</Label>
                      <Select 
                        value={examData.status} 
                        onValueChange={(v) => setExamData({ ...examData, status: v as 'available' | 'scheduled' })}
                      >
                        <SelectTrigger className="bg-secondary/50 h-9 md:h-10 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available Now</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowQuestionBuilder(true)} 
                    className="w-full btn-gradient text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Questions
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm md:text-base">
                      Questions ({questions.length})
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addQuestion}
                      className="text-xs md:text-sm"
                    >
                      <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Add Question
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {questions.map((q, qIndex) => (
                      <div key={qIndex} className="p-3 md:p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <Label className="text-xs md:text-sm font-medium">Question {qIndex + 1}</Label>
                          {questions.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeQuestion(qIndex)}
                              className="h-7 w-7 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                        <Textarea
                          placeholder="Enter question text..."
                          value={q.text}
                          onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                          className="bg-secondary/50 text-sm min-h-[60px]"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                                q.correctAnswer === oIndex ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                              }`}>
                                {String.fromCharCode(65 + oIndex)}
                              </span>
                              <Input
                                placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                value={opt}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                className="bg-secondary/50 h-8 text-sm flex-1"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Correct Answer:</Label>
                            <Select
                              value={q.correctAnswer.toString()}
                              onValueChange={(v) => updateQuestion(qIndex, 'correctAnswer', parseInt(v))}
                            >
                              <SelectTrigger className="w-16 h-8 text-xs bg-secondary/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">A</SelectItem>
                                <SelectItem value="1">B</SelectItem>
                                <SelectItem value="2">C</SelectItem>
                                <SelectItem value="3">D</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Marks:</Label>
                            <Input
                              type="number"
                              value={q.marks}
                              onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value) || 1)}
                              className="w-16 h-8 text-xs bg-secondary/50"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowQuestionBuilder(false)}
                      className="flex-1 text-sm"
                    >
                      Back
                    </Button>
                    <Button onClick={handleCreateExam} className="flex-1 btn-gradient text-sm">
                      Create Exam
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <GlassCard key={stat.label} delay={index * 0.1} className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Your Exams */}
        {teacherExams.length > 0 && (
          <section className="mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              Your Exams
            </h3>
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {teacherExams.map((exam, index) => (
                <GlassCard key={exam.id} delay={index * 0.05} className="p-4 md:p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground text-sm md:text-base">{exam.title}</h4>
                    <span className={`px-2 py-0.5 text-[10px] md:text-xs font-medium rounded-full ${
                      exam.status === 'available' ? 'bg-accent/20 text-accent' : 
                      exam.status === 'completed' ? 'bg-muted text-muted-foreground' : 
                      'bg-warning/20 text-warning'
                    }`}>
                      {exam.status}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-2">{exam.subject}</p>
                  <div className="flex gap-3 text-[10px] md:text-xs text-muted-foreground">
                    <span>{exam.totalQuestions} questions</span>
                    <span>{exam.totalMarks} marks</span>
                    <span>{exam.duration} min</span>
                  </div>
                  <p className="mt-2 text-[10px] md:text-xs text-muted-foreground">
                    Password: <span className="font-mono text-foreground">{exam.password}</span>
                  </p>
                </GlassCard>
              ))}
            </div>
          </section>
        )}

        {/* Live Monitoring */}
        <section>
          <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            Live Exam Monitoring
          </h3>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border/50">
                  <tr>
                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground">Student</th>
                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground hidden sm:table-cell">Progress</th>
                    <th className="text-left p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground">Warnings</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMonitorData.map((student, index) => (
                    <motion.tr
                      key={student.studentName}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/30 last:border-0"
                    >
                      <td className="p-3 md:p-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                          </div>
                          <span className="text-foreground font-medium text-xs md:text-sm">{student.studentName}</span>
                        </div>
                      </td>
                      <td className="p-3 md:p-4">
                        <span className={`inline-flex items-center gap-1 md:gap-1.5 px-2 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                          student.status === 'active' 
                            ? 'bg-accent/20 text-accent'
                            : student.status === 'warning'
                            ? 'bg-warning/20 text-warning'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {student.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                          {student.status === 'warning' && <AlertCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                          {student.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-3 md:p-4 hidden sm:table-cell">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="flex-1 h-1.5 md:h-2 bg-secondary rounded-full overflow-hidden max-w-24 md:max-w-32">
                            <motion.div
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${student.progress}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                          <span className="text-xs md:text-sm text-muted-foreground w-8 md:w-10">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="p-3 md:p-4">
                        {student.warnings > 0 ? (
                          <span className="inline-flex items-center gap-1 text-warning text-xs md:text-sm">
                            <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            {student.warnings}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs md:text-sm">—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </section>
      </main>
    </div>
  );
};

export default TeacherDashboard;
