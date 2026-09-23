import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Play,
  ArrowLeft,
  ChevronRight,
  Code2,
  HelpCircle,
  Award,
  Sparkles,
  FileCode,
  FileCheck,
  Check,
  Lock,
  Terminal,
  Send,
  Users,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  StudyCourseSummary,
  StudyCourseDetail,
  StudyLesson,
  StudyCodingTask,
  EmployeeStudyOverview,
} from '../types';

export const StudyResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'MARKETING_HEAD' || user?.role === 'FOUNDER';

  // Navigation & Tab State
  const [activeTab, setActiveTab] = useState<'MATERIALS' | 'CODING_TASKS' | 'ADMIN_MONITOR'>('MATERIALS');
  const [selectedMonth, setSelectedMonth] = useState<number>(1);

  // Courses State
  const [courses, setCourses] = useState<StudyCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string | null>(null);
  const [activeCourse, setActiveCourse] = useState<StudyCourseDetail | null>(null);
  const [activeLesson, setActiveLesson] = useState<StudyLesson | null>(null);

  // Exercise & Quiz Interactive States
  const [exerciseCode, setExerciseCode] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // 40 Monthly Coding Tasks State
  const [codingTasks, setCodingTasks] = useState<StudyCodingTask[]>([]);
  const [tasksCompletedCount, setTasksCompletedCount] = useState<number>(0);
  const [totalTasksCount, setTotalTasksCount] = useState<number>(40);
  const [selectedCodingTask, setSelectedCodingTask] = useState<StudyCodingTask | null>(null);
  const [taskUserCode, setTaskUserCode] = useState<string>('');
  const [submittingTask, setSubmittingTask] = useState<boolean>(false);
  const [showTaskSolution, setShowTaskSolution] = useState<boolean>(false);

  // Admin Tracking Overview State
  const [adminReport, setAdminReport] = useState<EmployeeStudyOverview[]>([]);
  const [adminSearch, setAdminSearch] = useState<string>('');

  const fetchCourses = async () => {
    try {
      const res = await api.get('/study/courses');
      if (res.data.success) {
        setCourses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load study courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCodingTasks = async () => {
    try {
      const res = await api.get(`/study/tasks?month=${selectedMonth}`);
      if (res.data.success) {
        const { tasks, completedTasks, totalTasks } = res.data.data;
        setCodingTasks(tasks);
        setTasksCompletedCount(completedTasks);
        setTotalTasksCount(totalTasks);

        if (!selectedCodingTask && tasks.length > 0) {
          selectCodingTask(tasks[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load coding tasks:', err);
    }
  };

  const fetchAdminReport = async () => {
    if (!isAdminOrStaff) return;
    try {
      const res = await api.get('/study/admin-overview');
      if (res.data.success) {
        setAdminReport(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin study overview:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCodingTasks();
    if (isAdminOrStaff) {
      fetchAdminReport();
    }
  }, [selectedMonth, user]);

  const selectCodingTask = (task: StudyCodingTask) => {
    setSelectedCodingTask(task);
    setTaskUserCode(task.submittedCode || task.starterCode);
    setShowTaskSolution(false);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCodingTask) return;
    setSubmittingTask(true);
    try {
      const res = await api.post('/study/tasks/submit', {
        month: selectedMonth,
        taskId: selectedCodingTask.id,
        code: taskUserCode,
      });

      if (res.data.success) {
        // Update task state locally
        setCodingTasks((prev) =>
          prev.map((t) =>
            t.id === selectedCodingTask.id ? { ...t, isCompleted: true, submittedCode: taskUserCode } : t
          )
        );
        setSelectedCodingTask((prev) => (prev ? { ...prev, isCompleted: true, submittedCode: taskUserCode } : prev));
        setTasksCompletedCount((prev) => Math.min(prev + 1, totalTasksCount));

        // Refresh admin stats if admin
        fetchAdminReport();
      }
    } catch (err) {
      console.error('Failed to submit coding task:', err);
    } finally {
      setSubmittingTask(false);
    }
  };

  const openCourse = async (slug: string) => {
    setSelectedCourseSlug(slug);
    try {
      const res = await api.get(`/study/courses/${slug}`);
      if (res.data.success) {
        const detail: StudyCourseDetail = res.data.data;
        setActiveCourse(detail);

        let firstIncomplete: StudyLesson | null = null;
        for (const mod of detail.modules) {
          for (const l of mod.lessons) {
            if (!l.isCompleted && !firstIncomplete) {
              firstIncomplete = l;
            }
          }
        }
        const initialLesson = firstIncomplete || detail.modules[0]?.lessons[0] || null;
        selectLesson(initialLesson);
      }
    } catch (err) {
      console.error('Failed to load course details:', err);
    }
  };

  const selectLesson = (lesson: StudyLesson | null) => {
    setActiveLesson(lesson);
    setShowSolution(false);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    if (lesson?.exercise) {
      setExerciseCode(lesson.exercise.starterCode);
    } else {
      setExerciseCode('');
    }
  };

  const toggleLessonCompletion = async (lesson: StudyLesson) => {
    if (!activeCourse) return;
    try {
      const res = await api.post('/study/toggle-lesson', {
        courseSlug: activeCourse.slug,
        lessonId: lesson.id,
      });

      if (res.data.success) {
        const isComp = res.data.data.isCompleted;

        setActiveCourse((prev) => {
          if (!prev) return prev;
          let total = 0;
          let completed = 0;
          const updatedModules = prev.modules.map((mod) => ({
            ...mod,
            lessons: mod.lessons.map((l) => {
              total++;
              const updatedStatus = l.id === lesson.id ? isComp : !!l.isCompleted;
              if (updatedStatus) completed++;
              return { ...l, isCompleted: updatedStatus };
            }),
          }));

          const updatedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

          return {
            ...prev,
            completedLessons: completed,
            progressPercent: updatedPercent,
            modules: updatedModules,
          };
        });

        if (activeLesson && activeLesson.id === lesson.id) {
          setActiveLesson((prev) => (prev ? { ...prev, isCompleted: isComp } : prev));
        }

        fetchCourses();
      }
    } catch (err) {
      console.error('Failed to toggle lesson status:', err);
    }
  };

  const renderFormattedContent = (contentStr: string) => {
    const lines = contentStr.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockBuffer: string[] = [];
    let codeLanguage = '';

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${idx}`} className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md">
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="uppercase">{codeLanguage || 'CODE'}</span>
                <span>BluNet Code Snippet</span>
              </div>
              <pre className="p-4 text-xs font-mono text-blue-300 overflow-x-auto leading-relaxed">
                <code>{codeBlockBuffer.join('\n')}</code>
              </pre>
            </div>
          );
          codeBlockBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLanguage = line.replace('```', '').trim();
        }
      } else if (inCodeBlock) {
        codeBlockBuffer.push(line);
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx} className="text-lg font-bold text-slate-900 mt-6 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={idx} className="text-base font-semibold text-slate-800 mt-4 mb-2">
            {line.replace('#### ', '')}
          </h4>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={idx} className="ml-5 list-disc text-xs text-slate-700 leading-relaxed mb-1">
            {line.replace('- ', '')}
          </li>
        );
      } else if (line.trim().length > 0) {
        elements.push(
          <p key={idx} className="text-xs text-slate-700 leading-relaxed mb-3">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredAdminReport = adminReport.filter(
    (emp) =>
      emp.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(adminSearch.toLowerCase()) ||
      emp.designation.toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Welcome & Monthly Schedule Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            Monthly Upskilling Program
          </span>
          <h1 className="text-2xl font-bold mt-1">Study Resources & Monthly Coding Tasks</h1>
          <p className="text-blue-100 text-sm mt-0.5">
            Complete study materials and solve 40 mandatory monthly coding tasks.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/20 text-xs flex items-center gap-3">
          <Terminal className="w-5 h-5 text-blue-200 shrink-0" />
          <div>
            <div className="text-blue-200 text-[10px] uppercase font-bold tracking-wider">Month 1 Task Completion</div>
            <div className="text-base font-bold">
              {tasksCompletedCount} / {totalTasksCount} Coding Tasks Completed
            </div>
          </div>
        </div>
      </div>

      {/* MONTHLY PROGRESSION HEADER (MONTH 1 ACTIVE, MONTH 2 & 3 LOCKED 🔒) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Month 1 Card */}
        <div
          onClick={() => setSelectedMonth(1)}
          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedMonth === 1
              ? 'bg-blue-50/80 border-blue-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Month 1 • Active</span>
            <Badge variant="primary">Current Month</Badge>
          </div>
          <h3 className="font-bold text-slate-900 text-base">JavaScript & TypeScript</h3>
          <p className="text-xs text-slate-500 mt-1">
            2 Courses • 25 Modules • 40 Mandatory Coding Tasks
          </p>
        </div>

        {/* Month 2 Card (Locked 🔒) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-400 relative overflow-hidden select-none cursor-not-allowed">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Month 2 • Locked
            </span>
            <Badge variant="neutral">Unlocks Next Month</Badge>
          </div>
          <h3 className="font-bold text-slate-500 text-base">HTML5 & React Basics</h3>
          <p className="text-xs text-slate-400 mt-1">
            Component architecture, Hooks, JSX, and 40 Coding Tasks.
          </p>
        </div>

        {/* Month 3 Card (Locked 🔒) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-400 relative overflow-hidden select-none cursor-not-allowed">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Month 3 • Locked
            </span>
            <Badge variant="neutral">Unlocks in 2 Months</Badge>
          </div>
          <h3 className="font-bold text-slate-500 text-base">Advanced CSS & Responsive UI</h3>
          <p className="text-xs text-slate-400 mt-1">
            Flexbox, Grid, Tailwind, Animations, and 40 Coding Tasks.
          </p>
        </div>
      </div>

      {/* SUB-TAB SWITCHER */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => {
            setActiveTab('MATERIALS');
            setSelectedCourseSlug(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'MATERIALS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Study Materials & Courses
        </button>

        <button
          onClick={() => setActiveTab('CODING_TASKS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'CODING_TASKS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Monthly Coding Tasks ({tasksCompletedCount} / 40)
        </button>

        {isAdminOrStaff && (
          <button
            onClick={() => setActiveTab('ADMIN_MONITOR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ADMIN_MONITOR'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Admin Task Monitor
          </button>
        )}
      </div>

      {/* -------------------------------------------------------------
          TAB 1: STUDY MATERIALS & COURSES
          ------------------------------------------------------------- */}
      {activeTab === 'MATERIALS' && (
        <>
          {selectedCourseSlug && activeCourse ? (
            <div className="space-y-6">
              {/* Course Header Bar */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => setSelectedCourseSlug(null)}>
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    All Courses
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary">{activeCourse.badge}</Badge>
                      <span className="text-xs font-medium text-slate-500">
                        {activeCourse.completedLessons} / {activeCourse.totalLessons} Lessons Completed
                      </span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mt-1">{activeCourse.title} Learning Path</h1>
                  </div>
                </div>

                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${activeCourse.progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-blue-600">{activeCourse.progressPercent}%</span>
                </div>
              </div>

              {/* Workspace Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Module Sidebar Navigation */}
                <div className="lg:col-span-4 space-y-4">
                  <Card title="Course Modules" subtitle={`${activeCourse.totalModules} Modules • ${activeCourse.totalLessons} Lessons`}>
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                      {activeCourse.modules.map((mod) => (
                        <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                          <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 line-clamp-1">{mod.title}</span>
                            <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                              {mod.lessons.filter((l) => l.isCompleted).length} / {mod.lessons.length}
                            </span>
                          </div>

                          <div className="divide-y divide-slate-100 bg-white">
                            {mod.lessons.map((lesson) => {
                              const isActive = activeLesson?.id === lesson.id;
                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => selectLesson(lesson)}
                                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors ${
                                    isActive
                                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600'
                                      : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    {lesson.isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                                    )}
                                    <span className="truncate">{lesson.title}</span>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Right Lesson Reader */}
                <div className="lg:col-span-8 space-y-6">
                  {activeLesson ? (
                    <Card>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
                        <div>
                          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Active Lesson</span>
                          <h2 className="text-xl font-bold text-slate-900 mt-0.5">{activeLesson.title}</h2>
                          <p className="text-xs text-slate-500 mt-0.5">{activeLesson.description}</p>
                        </div>

                        <Button
                          variant={activeLesson.isCompleted ? 'secondary' : 'primary'}
                          className={activeLesson.isCompleted ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : ''}
                          size="sm"
                          onClick={() => toggleLessonCompletion(activeLesson)}
                        >
                          {activeLesson.isCompleted ? (
                            <>
                              <Check className="w-4 h-4 mr-1.5" />
                              Lesson Completed
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1.5" />
                              Mark as Complete
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="prose prose-slate max-w-none text-xs">
                        {renderFormattedContent(activeLesson.content)}
                      </div>
                    </Card>
                  ) : (
                    <Card className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-base font-semibold text-slate-700">Select a Lesson to Begin</p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => {
                const isJs = course.slug === 'javascript';
                const Icon = isJs ? FileCode : FileCheck;

                return (
                  <Card key={course.slug} className="flex flex-col justify-between hover:border-blue-300 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <Badge variant="primary">{course.badge}</Badge>
                            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{course.title}</h3>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">{course.description}</p>

                      <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs mb-4">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Modules</span>
                          <span className="font-bold text-slate-800 text-sm">{course.totalModules} Modules</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Lessons</span>
                          <span className="font-bold text-slate-800 text-sm">{course.totalLessons} Lessons</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-6">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-slate-500">
                            Progress ({course.completedLessons} / {course.totalLessons} lessons)
                          </span>
                          <span className="font-bold text-blue-600">{course.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                            style={{ width: `${course.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button className="w-full" onClick={() => openCourse(course.slug)}>
                        <Play className="w-4 h-4 mr-2" />
                        {course.progressPercent > 0 ? 'Continue Learning' : 'Start Course'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* -------------------------------------------------------------
          TAB 2: MONTHLY CODING TASKS (40 TASKS / MONTH)
          ------------------------------------------------------------- */}
      {activeTab === 'CODING_TASKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Task Selection Drawer */}
          <div className="lg:col-span-4 space-y-4">
            <Card
              title="40 Monthly Coding Tasks"
              subtitle={`Month 1 Tasks (${tasksCompletedCount} / 40 Completed)`}
            >
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {codingTasks.map((t) => {
                  const isSelected = selectedCodingTask?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => selectCodingTask(t)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {t.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <span className="truncate font-mono">
                          #{t.taskNumber} {t.title}
                        </span>
                      </div>
                      <Badge variant={t.category === 'JavaScript' ? 'warning' : 'primary'}>
                        {t.category}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Task Workspace */}
          <div className="lg:col-span-8 space-y-6">
            {selectedCodingTask ? (
              <Card>
                <form onSubmit={handleTaskSubmit} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider font-mono">
                        Task #{selectedCodingTask.taskNumber} • {selectedCodingTask.category}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedCodingTask.title}</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={selectedCodingTask.isCompleted ? 'success' : 'neutral'}>
                        {selectedCodingTask.isCompleted ? 'Completed' : 'Pending Submission'}
                      </Badge>
                      <Badge variant={selectedCodingTask.difficulty === 'HARD' ? 'danger' : 'info'}>
                        {selectedCodingTask.difficulty}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Instructions & Problem Statement</label>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                      {selectedCodingTask.instructions}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">Solution Code Editor</label>
                      <button
                        type="button"
                        onClick={() => setShowTaskSolution(!showTaskSolution)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline"
                      >
                        {showTaskSolution ? 'Hide Model Solution' : 'View Model Solution'}
                      </button>
                    </div>

                    <textarea
                      rows={8}
                      required
                      value={taskUserCode}
                      onChange={(e) => setTaskUserCode(e.target.value)}
                      className="w-full p-4 font-mono text-xs bg-slate-900 text-blue-300 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    />
                  </div>

                  {showTaskSolution && (
                    <div className="p-4 bg-emerald-950 border border-emerald-800 rounded-xl text-xs font-mono text-emerald-300">
                      <div className="text-[10px] text-emerald-400 font-bold mb-1 uppercase">Reference Solution:</div>
                      <pre>{selectedCodingTask.solutionCode}</pre>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500 italic">Hint: {selectedCodingTask.hint}</span>

                    <Button type="submit" loading={submittingTask} icon={<Send className="w-4 h-4" />}>
                      {selectedCodingTask.isCompleted ? 'Update Submission' : 'Submit Coding Task'}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <Terminal className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-base font-semibold text-slate-700">Select a Coding Task</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: ADMIN PROGRESS MONITORING DASHBOARD
          ------------------------------------------------------------- */}
      {activeTab === 'ADMIN_MONITOR' && isAdminOrStaff && (
        <div className="space-y-6">
          <Card
            title="Employee Study & Coding Task Monitor"
            subtitle="Track monthly completion progress of 40 study coding tasks across all employees"
            action={
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3 font-semibold">Employee</th>
                    <th className="p-3 font-semibold">Designation</th>
                    <th className="p-3 font-semibold">Study Lessons</th>
                    <th className="p-3 font-semibold">Month 1 Coding Tasks</th>
                    <th className="p-3 font-semibold">Completion %</th>
                    <th className="p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdminReport.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No employees found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAdminReport.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{emp.employeeId} • {emp.email}</div>
                        </td>
                        <td className="p-3 text-slate-600">{emp.designation}</td>
                        <td className="p-3 font-mono font-medium text-slate-800">
                          {emp.lessonsCompleted} / {emp.totalLessons} Lessons
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 font-mono">
                            {emp.codingTasksCompleted} / 40 Tasks
                          </div>
                          <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${emp.taskProgressPercent}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-3 font-bold text-blue-600">{emp.taskProgressPercent}%</td>
                        <td className="p-3">
                          <Badge
                            variant={
                              emp.statusBadge === 'COMPLETED'
                                ? 'success'
                                : emp.statusBadge === 'ON_TRACK'
                                ? 'primary'
                                : emp.statusBadge === 'IN_PROGRESS'
                                ? 'warning'
                                : 'neutral'
                            }
                          >
                            {emp.statusBadge.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
