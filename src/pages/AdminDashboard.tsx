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
import { Switch } from '@/components/ui/switch';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  UserCog,
  Settings,
  LogOut,
  Shield,
  TrendingUp,
  AlertTriangle,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  Eye,
  X,
  Search,
  ChevronRight
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    exams, 
    results, 
    disqualifiedExamIds,
    deleteExam, 
    updateExamStatus, 
    toggleRetake, 
    getExamStats 
  } = useExam();

  const [activeSection, setActiveSection] = useState<'overview' | 'exams' | 'users' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = getExamStats();
  const cheatingIncidents = results.filter(r => r.status === 'disqualified').length;

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteExam = (examId: string) => {
    deleteExam(examId);
    setDeleteConfirm(null);
    toast.success('Exam deleted successfully');
  };

  const handleToggleStatus = (examId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'scheduled' : 'available';
    updateExamStatus(examId, newStatus);
    toast.success(`Exam ${newStatus === 'available' ? 'enabled' : 'disabled'}`);
  };

  const handleToggleRetake = (examId: string, allow: boolean) => {
    toggleRetake(examId, allow);
    toast.success(`Retake ${allow ? 'enabled' : 'disabled'} for this exam`);
  };

  const statCards = [
    { label: 'Total Exams', value: stats.total, icon: BookOpen, color: 'text-primary' },
    { label: 'Available', value: stats.available, icon: Play, color: 'text-accent' },
    { label: 'Scheduled', value: stats.scheduled, icon: Pause, color: 'text-warning' },
    { label: 'Incidents', value: cheatingIncidents, icon: AlertTriangle, color: 'text-destructive' },
  ];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'exams', label: 'Manage Exams', icon: BookOpen },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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
              <p className="text-[10px] md:text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 md:gap-4"
          >
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/20">
              <Shield className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">Admin</span>
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

      {/* Navigation Tabs */}
      <div className="relative z-10 border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === item.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-4 md:py-8">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 md:mb-6">
              System Overview
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              {statCards.map((stat, index) => (
                <GlassCard key={stat.label} delay={index * 0.1} className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-2 md:mb-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                </GlassCard>
              ))}
            </div>

            {/* Recent Incidents */}
            <GlassCard className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-4">Recent Cheating Incidents</h3>
              {results.filter(r => r.status === 'disqualified').length === 0 ? (
                <p className="text-sm text-muted-foreground">No cheating incidents recorded.</p>
              ) : (
                <div className="space-y-3">
                  {results.filter(r => r.status === 'disqualified').slice(0, 5).map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
                      <div>
                        <p className="text-sm font-medium text-foreground">{result.examTitle}</p>
                        <p className="text-xs text-muted-foreground">User ID: {result.userId}</p>
                      </div>
                      <span className="text-xs text-destructive">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Manage Exams Section */}
        {activeSection === 'exams' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
                Manage Exams
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-secondary/50"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredExams.map((exam, index) => (
                <GlassCard key={exam.id} delay={index * 0.05} className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-semibold text-foreground">{exam.title}</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                          exam.status === 'available' ? 'bg-accent/20 text-accent' :
                          exam.status === 'scheduled' ? 'bg-warning/20 text-warning' :
                          exam.status === 'completed' ? 'bg-muted text-muted-foreground' :
                          'bg-destructive/20 text-destructive'
                        }`}>
                          {exam.status}
                        </span>
                        {disqualifiedExamIds.includes(exam.id) && (
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-destructive/20 text-destructive">
                            Has Disqualification
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{exam.subject} • {exam.totalQuestions} questions • {exam.duration} min</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Toggle Status */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(exam.id, exam.status)}
                        disabled={exam.status === 'completed'}
                        className="text-xs"
                      >
                        {exam.status === 'available' ? (
                          <>
                            <Pause className="w-3 h-3 mr-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Enable
                          </>
                        )}
                      </Button>

                      {/* Allow Retake */}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
                        <span className="text-xs text-muted-foreground">Retake</span>
                        <Switch
                          checked={exam.allowRetake || false}
                          onCheckedChange={(checked) => handleToggleRetake(exam.id, checked)}
                        />
                      </div>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirm(exam.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}

              {filteredExams.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No exams found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6">
              User Management
            </h2>

            <GlassCard className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-secondary/50 text-center">
                  <Users className="w-8 h-8 mx-auto text-primary mb-2" />
                  <p className="text-2xl font-bold text-foreground">1,248</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 text-center">
                  <UserCog className="w-8 h-8 mx-auto text-accent mb-2" />
                  <p className="text-2xl font-bold text-foreground">42</p>
                  <p className="text-xs text-muted-foreground">Teachers</p>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50 text-center">
                  <Shield className="w-8 h-8 mx-auto text-warning mb-2" />
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-xs text-muted-foreground">Admins</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                User management requires database integration. Connect to Lovable Cloud to enable full user management.
              </p>
            </GlassCard>
          </motion.div>
        )}

        {/* Settings Section */}
        {activeSection === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-6">
              System Settings
            </h2>

            <div className="space-y-4">
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Anti-Cheat Sensitivity</h4>
                    <p className="text-xs text-muted-foreground">Number of warnings before disqualification</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">2</span>
                    <span className="text-xs text-muted-foreground">warnings</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Allow Exam Retakes</h4>
                    <p className="text-xs text-muted-foreground">Global setting for all exams</p>
                  </div>
                  <Switch />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Biometric Authentication</h4>
                    <p className="text-xs text-muted-foreground">Require biometric for exam start</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Email Notifications</h4>
                    <p className="text-xs text-muted-foreground">Send email on cheating incidents</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="glass-card border-border/50 max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the exam and all associated questions and results. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteConfirm && handleDeleteExam(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
