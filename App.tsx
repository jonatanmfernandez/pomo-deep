
import React, { useState, useEffect, useCallback } from 'react';
import Timer from './components/Timer';
import Inbox from './components/Inbox';
import Dashboard from './components/Dashboard';
import History from './components/History';
import SettingsView from './components/SettingsView';
import QuickCapture from './components/QuickCapture';
import NotificationCenter from './components/NotificationCenter';
import ProfileView from './components/ProfileView';
import ProcessingModal from './components/ProcessingModal';
import FocusNotesModal from './components/FocusNotesModal';
import WeeklyReview from './components/WeeklyReview';
import { View, TimerMode, InboxItem, Settings, UserCredits, SessionHistoryItem, Category, Project, ProjectFolder } from './types';
import { generateId, cn, playSynthSound } from './utils';
import { auth, signInWithGoogle } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Moon, Sun, Volume2, VolumeX, Menu, X, PenLine, BarChart2, History as HistoryIcon, Inbox as InboxIcon, Settings as SettingsIcon, Timer as TimerIcon, Bell, User as UserIcon, LogIn, Zap, Folder, Clock, Play } from 'lucide-react';

const INITIAL_SETTINGS: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  language: 'es'
};

const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Trabajo', color: 'bg-red-500' },
  { id: 'c2', name: 'Persona', color: 'bg-blue-500' },
  { id: 'c3', name: 'Estudio', color: 'bg-emerald-500' },
];

const CATEGORY_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 
  'bg-emerald-500', 'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 
  'bg-purple-500', 'bg-pink-500', 'bg-rose-500', 'bg-slate-500'
];

const INITIAL_INBOX: InboxItem[] = [
  {
    id: 'w1', title: 'Reporte Financiero Q3', type: 'note', status: 'pending', categoryId: 'c1',
    noteContent: 'Acción Siguiente\n[ ] Revisar correos prioritarios\n[ ] Definir los 3 objetivos principales del bloque\n[ ] Preparar materiales para la siguiente reunión\n\n---\n\nResumen\nEl análisis muestra un crecimiento del 15% en ingresos recurrentes.',
    createdAt: new Date(), deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), timeSpent: 0
  },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('timer');
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [currentNote, setCurrentNote] = useState(''); 
  const [inbox, setInbox] = useState<InboxItem[]>(INITIAL_INBOX);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [credits, setCredits] = useState<UserCredits>({ available: 10, used: 145 });
  const [history, setHistory] = useState<InboxItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isFocusNotesOpen, setIsFocusNotesOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const activeTask = inbox.find(i => i.id === activeTaskId);
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);
  const [processingItem, setProcessingItem] = useState<InboxItem | null>(null);
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: 'Blog', color: 'bg-red-500', createdAt: new Date(), status: 'active', folders: [{ id: 'f1', name: 'Artículos', projectId: 'p1', createdAt: new Date() }] },
    { id: 'p2', name: 'App Development', color: 'bg-blue-500', createdAt: new Date(), status: 'active' }
  ]);
  const [projectFolders, setProjectFolders] = useState<ProjectFolder[]>([
    { id: 'f1', name: 'Artículos', projectId: 'p1', createdAt: new Date() }
  ]);

  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [timeLeft, setTimeLeft] = useState(settings.focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const t = {
    es: {
      focus: 'Enfoque',
      inbox: 'Bandeja de entrada',
      stats: 'Estadísticas',
      history: 'Historial',
      settings: 'Configuración',
      quickCapture: 'Captura Rápida',
      proPlan: 'Plan Pro',
      profile: 'Mi Perfil',
      login: 'Iniciar Sesión'
    },
    en: {
      focus: 'Focus',
      inbox: 'Inbox',
      stats: 'Statistics',
      history: 'History',
      settings: 'Settings',
      quickCapture: 'Quick Capture',
      proPlan: 'Pro Plan',
      profile: 'My Profile',
      login: 'Sign In'
    }
  }[settings.language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      if (newVal) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return newVal;
    });
    if (isSoundEnabled) playSynthSound('theme-change');
  };

  const toggleSound = () => {
    setIsSoundEnabled(prev => {
      const newVal = !prev;
      if (newVal) playSynthSound('toggle');
      return newVal;
    });
  };

  useEffect(() => {
    if (!isActive) {
      let duration = settings.focusDuration;
      if (mode === TimerMode.SHORT_BREAK) duration = settings.shortBreakDuration;
      if (mode === TimerMode.LONG_BREAK) duration = settings.longBreakDuration;
      setTimeLeft(duration * 60);
    }
  }, [mode, settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration, isActive]);

  const handleSessionComplete = useCallback((completedMode: TimerMode) => {
    if (isSoundEnabled) playSynthSound('complete');
    const duration = completedMode === TimerMode.FOCUS ? settings.focusDuration : 
                     completedMode === TimerMode.SHORT_BREAK ? settings.shortBreakDuration : 
                     settings.longBreakDuration;
    
    const newHistoryItem: SessionHistoryItem = {
        id: generateId(),
        startTime: new Date(Date.now() - duration * 60 * 1000),
        endTime: new Date(),
        mode: completedMode,
        duration: duration,
        noteSnapshot: completedMode === TimerMode.FOCUS ? currentNote : undefined,
        relatedTaskId: activeTaskId || undefined
    };

    // We no longer add SessionHistoryItem to history as per user request to only show completed tasks
    // setHistory(prev => [newHistoryItem, ...prev]);

    if (activeTaskId && completedMode === TimerMode.FOCUS) {
        setInbox(prev => prev.map(item => {
            if (item.id === activeTaskId) {
                const newTimeSpent = (item.timeSpent || 0) + duration;
                const newFullSessions = (item.fullSessionsCount || 0) + 1;
                return { ...item, timeSpent: newTimeSpent, fullSessionsCount: newFullSessions };
            }
            return item;
        }));
    }
  }, [currentNote, settings, activeTaskId, isSoundEnabled]);

  const switchMode = useCallback(() => {
    if (isSoundEnabled) playSynthSound('switch');
    if (mode === TimerMode.FOCUS) {
      const newCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newCompleted);
      let nextMode = (newCompleted > 0 && newCompleted % settings.longBreakInterval === 0) ? TimerMode.LONG_BREAK : TimerMode.SHORT_BREAK;
      setMode(nextMode);
    } else {
      setMode(TimerMode.FOCUS);
    }
  }, [mode, sessionsCompleted, settings.longBreakInterval, isSoundEnabled]);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
           if (isSoundEnabled && prev > 1) playSynthSound('tick');
           return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleSessionComplete(mode);
      switchMode();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, handleSessionComplete, switchMode, isSoundEnabled]);

  const toggleTimer = () => {
    const nextActive = !isActive;
    if (nextActive && !activeTaskId && mode === TimerMode.FOCUS) {
      // Start from scratch at the timer: trigger processing via QuickCapture
      setIsQuickCaptureOpen(true);
      return;
    }
    if (isSoundEnabled) playSynthSound(nextActive ? 'start' : 'pause');
    setIsActive(nextActive);
  };

  const resetTimer = () => {
    if (isSoundEnabled) playSynthSound('toggle');
    setIsActive(false);
    let duration = settings.focusDuration;
    if (mode === TimerMode.SHORT_BREAK) duration = settings.shortBreakDuration;
    if (mode === TimerMode.LONG_BREAK) duration = settings.longBreakDuration;
    setTimeLeft(duration * 60);
  };
  
  const startSession = (newMode: TimerMode) => {
    if (isSoundEnabled) playSynthSound('switch');
    setIsActive(false);
    setMode(newMode);
    let duration = settings.focusDuration;
    if (newMode === TimerMode.SHORT_BREAK) duration = settings.shortBreakDuration;
    if (newMode === TimerMode.LONG_BREAK) duration = settings.longBreakDuration;
    setTimeLeft(duration * 60);
    setTimeout(() => {
        setIsActive(true);
        if (isSoundEnabled) playSynthSound('start');
    }, 10);
  };

  const [isOverlapWarningOpen, setIsOverlapWarningOpen] = useState<{ taskId: string } | null>(null);

  const handleStartTaskFocus = (taskId: string) => {
    const task = inbox.find(i => i.id === taskId);
    if (!task) return;

    if (activeTaskId === taskId) {
        setCurrentView('timer');
        if (!isActive) {
            setIsActive(true);
            if (isSoundEnabled) playSynthSound('start');
        }
        return;
    }

    if (isActive && activeTaskId && activeTaskId !== taskId) {
        setIsOverlapWarningOpen({ taskId });
        return;
    }

    // Questionnaire removed as per user request
    
    setActiveTaskId(taskId);
    setCurrentView('timer');
    
    // Resume from paused time if available
    if (task.pausedTime !== undefined) {
        setIsActive(false);
        setMode(TimerMode.FOCUS);
        setTimeLeft(task.pausedTime);
        setSessionsCompleted((task.currentSessionNumber || 1) - 1);
        setTimeout(() => {
            setIsActive(true);
            if (isSoundEnabled) playSynthSound('start');
        }, 10);
    } else {
        startSession(TimerMode.FOCUS);
    }
    
    setInbox(prev => prev.map(item => item.id === taskId ? { ...item, status: 'in-progress' } : item));
  };

  const handleSaveSession = (taskId: string, timeLeft: number, sessionNumber: number) => {
    if (isSoundEnabled) playSynthSound('pause');
    setIsActive(false);
    setInbox(prev => prev.map(item => 
        item.id === taskId 
            ? { ...item, status: 'pending', pausedTime: timeLeft, currentSessionNumber: sessionNumber } 
            : item
    ));
    setActiveTaskId(null);
    setCurrentView('inbox');
  };

  const confirmOverlapStart = () => {
    if (isOverlapWarningOpen) {
        const { taskId } = isOverlapWarningOpen;
        setIsActive(false);
        setActiveTaskId(taskId);
        setCurrentView('timer');
        startSession(TimerMode.FOCUS);
        setInbox(prev => prev.map(item => item.id === taskId ? { ...item, status: 'in-progress' } : item));
        setIsOverlapWarningOpen(null);
    }
  };

  const saveNoteToInbox = (content: string, categoryId?: string, title?: string) => {
      const newItem: InboxItem = {
        id: generateId(),
        title: title || content.split('\n')[0] || (settings.language === 'es' ? 'Nueva Tarea' : 'New Task'),
        type: 'note',
        noteContent: content,
        createdAt: new Date(),
        deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), 
        status: 'pending',
        categoryId: categoryId,
      };
      setInbox(prev => [newItem, ...prev]);
      return newItem.id;
  };

  const handleQuickStart = (content: string, categoryId?: string, title?: string) => {
    const newItem: InboxItem = {
        id: generateId(),
        title: title || content.split('\n')[0] || (settings.language === 'es' ? 'Nueva Tarea' : 'New Task'),
        type: 'note',
        noteContent: content,
        createdAt: new Date(),
        deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), 
        status: 'pending',
        categoryId: categoryId,
    };
    setInbox(prev => [newItem, ...prev]);
    setIsQuickCaptureOpen(false);
    
    // Force processing for new tasks started from the timer view
    setProcessingItem(newItem);
  };

  const handleScheduleOnCalendar = (item: InboxItem) => {
    const title = encodeURIComponent(item.title);
    const details = encodeURIComponent(item.noteContent || '');
    
    // Default to 25 minutes from now if no deadline, or use deadline
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 25 * 60 * 1000);
    
    const formatCalendarDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const dates = `${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}`;
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}`;
    
    window.open(url, '_blank');
  };

  const handleInboxAction = (id: string, action: string, payload?: any) => {
    if (action === 'delete') setInbox(prev => prev.filter(i => i.id !== id));
    else if (action === 'archive') setInbox(prev => prev.map(i => i.id === id ? { ...i, isArchived: true, status: 'completed' } : i));
    else if (action === 'someday') setInbox(prev => prev.map(i => i.id === id ? { ...i, isSomedayMaybe: true, isProcessed: true } : i));
    else if (action === 'done-now') {
        const originalItem = inbox.find(i => i.id === id);
        if (originalItem) {
            setInbox(prev => prev.map(i => i.id === id ? { ...i, isProcessed: true, status: 'in-progress' } : i));
            setProcessingItem(null);
            setActiveTaskId(id);
            setCurrentView('timer');
            
            // Start a 2-minute focus session
            setIsActive(false);
            setMode(TimerMode.FOCUS);
            setTimeLeft(2 * 60);
            setTimeout(() => {
                setIsActive(true);
                if (isSoundEnabled) playSynthSound('start');
            }, 10);
        }
    }
    else if (action === 'process') {
        const originalItem = inbox.find(i => i.id === id);
        if (originalItem) {
            const { isTwoMinutes, ...updatedFields } = payload;
            const updatedItem = { ...updatedFields, isProcessed: true, isSomedayMaybe: false, status: 'in-progress' as const };
            setInbox(prev => prev.map(i => i.id === id ? { ...i, ...updatedItem } : i));
            setProcessingItem(null);
            
            // If it takes more than 2 minutes, show detail modal
            if (isTwoMinutes === false) {
                setSelectedItem({ ...originalItem, ...updatedItem });
            } else {
                // Otherwise start focus immediately
                setActiveTaskId(id);
                setCurrentView('timer');
                startSession(TimerMode.FOCUS);
            }
        }
    }
    else if (action === 'create-folder') {
        const newFolder: ProjectFolder = {
            id: generateId(),
            name: payload.name,
            projectId: payload.projectId,
            createdAt: new Date()
        };
        setProjectFolders(prev => [...prev, newFolder]);
        setProjects(prev => prev.map(p => p.id === payload.projectId ? { ...p, folders: [...(p.folders || []), newFolder] } : p));
    }
    else if (action === 'create-project') {
        const newProject: Project = {
            id: generateId(),
            name: payload.name,
            color: payload.color || CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)],
            createdAt: new Date(),
            status: 'active',
            folders: []
        };
        setProjects(prev => [...prev, newProject]);
    }
    else if (action === 'update') {
        const updatedItems = inbox.map(i => i.id === id ? { ...i, ...payload } : i);
        setInbox(updatedItems);
        
        // Handle history logic for completed tasks
        if (payload?.status === 'completed') {
            const completedItem = updatedItems.find(i => i.id === id);
            if (completedItem && (completedItem.fullSessionsCount || 0) >= 1) {
                setHistory(prev => [completedItem, ...prev]);
            }
        }
    }
    else if (action === 'schedule') setInbox(prev => prev.map(i => i.id === id ? { ...i, status: 'scheduled', scheduledDate: payload?.date || new Date(), isRead: true } : i));
    else if (action === 'calendar') {
        const item = inbox.find(i => i.id === id);
        if (item) handleScheduleOnCalendar(item);
    }
  };

  const handleUpdateTask = (id: string, content: string, title?: string) => {
    setInbox(prev => prev.map(item => item.id === id ? { ...item, noteContent: content, title: title ?? item.title } : item));
  };

  const handleAddCategory = (cat: Category) => {
    setCategories(prev => [...prev, cat]);
  };

  const handleViewChange = (view: View) => {
    if (view === currentView) return;
    setCurrentView(view);
    if (isSoundEnabled) playSynthSound('toggle');
    setIsMenuOpen(false);
  };

  const handleDurationChange = (type: 'focus' | 'short' | 'long', value: number) => {
    const confirmChange = () => {
        if (isActive) {
            const msg = settings.language === 'es' 
                ? 'El cronómetro está activo. Si cambias el tiempo, la sesión actual se reiniciará con el nuevo valor. ¿Continuar?'
                : 'Timer is active. Changing the duration will restart the current session. Continue?';
            return window.confirm(msg);
        }
        return true;
    };
    if (confirmChange()) {
        if (isActive) setIsActive(false);
        const newSettings = { ...settings };
        if (type === 'focus') newSettings.focusDuration = value;
        if (type === 'short') newSettings.shortBreakDuration = value;
        if (type === 'long') newSettings.longBreakDuration = value;
        setSettings(newSettings);
    }
  };

  const handleGlobalExport = (type: 'notion' | 'sheets' | 'mail' | 'pdf' | 'md') => {
    const fullContent = inbox.map(i => `## ${i.title}\nStatus: ${i.status}\n\n${i.noteContent}`).join('\n\n---\n\n');
    switch (type) {
      case 'notion': navigator.clipboard.writeText(fullContent); break;
      case 'mail': window.location.href = `mailto:?subject=PomoDeep%20Export&body=${encodeURIComponent(fullContent)}`; break;
      case 'sheets':
        const csv = "Title,Status,Time Spent (min)\n" + inbox.map(i => `"${i.title}","${i.status}",${i.timeSpent || 0}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "pomodeep_export.csv");
        link.click();
        break;
      case 'md':
        const mdBlob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8;' });
        const mdLink = document.createElement("a");
        mdLink.href = URL.createObjectURL(mdBlob);
        mdLink.setAttribute("download", "pomodeep_export.md");
        mdLink.click();
        break;
      case 'pdf': window.print(); break;
    }
  };

  // Calculate alerts badge
  const todayStr = new Date().toISOString().split('T')[0];
  const activeAlertsCount = inbox.filter(item => 
    item.status === 'scheduled' && 
    item.scheduledDate && 
    new Date(item.scheduledDate).toISOString().split('T')[0] <= todayStr
  ).length;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black font-sans transition-colors duration-300 relative overflow-hidden">
      <QuickCapture isOpen={isQuickCaptureOpen} onClose={() => setIsQuickCaptureOpen(false)} categories={categories} onStart={handleQuickStart} timeLeft={timeLeft} timerMode={mode} language={settings.language} />
      <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} items={inbox} onStartSession={handleStartTaskFocus} language={settings.language} />
      
      {isOverlapWarningOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOverlapWarningOpen(null)} />
              <div className="relative bg-white dark:bg-slate-900 w-full max-w-xs rounded-2xl p-6 text-center shadow-2xl border dark:border-slate-800 animate-in fade-in zoom-in-95">
                  <h3 className="text-lg font-bold dark:text-white mb-2">{settings.language === 'es' ? '¿Detener Focus Actual?' : 'Stop Current Focus?'}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                      {settings.language === 'es' 
                          ? 'Ya hay un focus iniciado. ¿Quieres detenerlo para comenzar con esta nueva tarea?' 
                          : 'A focus session is already active. Do you want to stop it to start this new task?'}
                  </p>
                  <div className="flex gap-3">
                      <button onClick={() => setIsOverlapWarningOpen(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium dark:text-slate-300">{settings.language === 'es' ? 'Cancelar' : 'Cancel'}</button>
                      <button onClick={confirmOverlapStart} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg">{settings.language === 'es' ? 'Confirmar' : 'Confirm'}</button>
                  </div>
              </div>
          </div>
      )}
      {isMenuOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={() => setIsMenuOpen(false)} />}

      <main className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto flex flex-col items-center pb-32">
        <header className="mb-8 w-full flex items-center justify-between relative z-50 px-2">
             <div className="flex items-center gap-3 cursor-pointer group" onClick={() => handleViewChange('timer')}>
                <div className="w-10 h-10 bg-pomo rounded-xl flex items-center justify-center shadow-lg shadow-pomo/30 flex-shrink-0 text-white transition-transform group-hover:scale-105">
                    <TimerIcon className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">Pomo<span className="text-pomo">Deep</span></h1>
                    <p className="text-[9px] text-slate-400 font-medium tracking-widest uppercase mt-0.5">Focus OS</p>
                </div>
             </div>
             
             <div className="flex items-center gap-1.5">
                <div className="relative">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={cn("p-2.5 rounded-full transition-all active:scale-90 relative", isMenuOpen ? "bg-slate-900 text-white dark:bg-white dark:text-black" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800")}>
                    {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <button 
                                onClick={() => { setIsNotificationsOpen(true); if (isSoundEnabled) playSynthSound('toggle'); }}
                                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all relative"
                            >
                                <Bell className="w-4 h-4" />
                                {activeAlertsCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />}
                            </button>
                            <button onClick={toggleSound} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all">
                                {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            </button>
                            <button onClick={toggleDarkMode} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all">
                                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>
                        </div>

                        {user ? (
                            <button 
                                onClick={() => handleViewChange('profile')}
                                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-white dark:ring-slate-900">
                                    <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`} alt="User" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col leading-tight overflow-hidden">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.displayName || 'Pomo User'}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{t.proPlan}</p>
                                </div>
                            </button>
                        ) : (
                            <button 
                                onClick={handleLogin}
                                className="w-full flex items-center gap-3 p-3 bg-pomo/10 text-pomo rounded-xl mb-4 hover:bg-pomo/20 transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-full bg-pomo/20 flex items-center justify-center">
                                    <LogIn className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <p className="text-sm font-bold">{t.login}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-tight opacity-70">PomoDeep Account</p>
                                </div>
                            </button>
                        )}
                        <button onClick={() => { setIsWeeklyReviewOpen(true); setIsMenuOpen(false); }} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-xl flex items-center justify-center gap-2 transition-all mb-4 font-bold text-sm shadow-lg shadow-emerald-900/20">
                          <Zap className="w-4 h-4" /> {settings.language === 'es' ? 'Revisión Semanal' : 'Weekly Review'}
                        </button>
                        <button onClick={() => { setIsQuickCaptureOpen(true); setIsMenuOpen(false); }} className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl flex items-center justify-center gap-2 transition-all mb-4 dark:bg-white dark:text-black dark:hover:bg-slate-200 font-bold text-sm">
                          <PenLine className="w-4 h-4" /> {t.quickCapture}
                        </button>
                        <nav className="space-y-1">
                          {[
                            { id: 'timer', icon: TimerIcon, label: t.focus },
                            { id: 'inbox', icon: InboxIcon, label: t.inbox },
                            { id: 'projects', icon: Folder, label: settings.language === 'es' ? 'Proyectos' : 'Projects' },
                            { id: 'someday', icon: Clock, label: settings.language === 'es' ? 'Algún día' : 'Someday' },
                            { id: 'dashboard', icon: BarChart2, label: t.stats },
                            { id: 'history', icon: HistoryIcon, label: t.history },
                            { id: 'profile', icon: UserIcon, label: t.profile },
                            { id: 'settings', icon: SettingsIcon, label: t.settings },
                          ].map((item) => (
                            <button key={item.id} onClick={() => handleViewChange(item.id as View)} className={cn("w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-medium text-sm", currentView === item.id ? "bg-pomo/5 text-pomo dark:bg-pomo/10" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800")}>
                              <div className="flex items-center gap-3"><item.icon className="w-4 h-4" />{item.label}</div>
                            </button>
                          ))}
                        </nav>
                    </div>
                  )}
                </div>
             </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full flex-1">
            {currentView === 'timer' && (
              <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Timer settings={settings} activeMode={mode} startSession={startSession} timeLeft={timeLeft} isActive={isActive} toggleTimer={toggleTimer} resetTimer={resetTimer} sessionsCompleted={sessionsCompleted} onNoteChange={setCurrentNote} currentNote={currentNote} categories={categories} onSaveNote={saveNoteToInbox} activeTask={activeTask} onStopTask={() => setActiveTaskId(null)} onSaveSession={handleSaveSession} onGoToInbox={() => handleViewChange('inbox')} onUpdateTask={handleUpdateTask} />
                
                {activeTask && (
                    <div className="mt-8 flex flex-col items-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">{settings.language === 'es' ? 'Misión Activa' : 'Active Mission'}</p>
                        <button 
                            onClick={() => setIsFocusNotesOpen(true)}
                            className="group relative w-full bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 text-left overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap className="w-12 h-12 text-pomo" />
                            </div>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 bg-pomo/10 rounded-2xl flex items-center justify-center">
                                    <Play className="w-5 h-5 text-pomo fill-current" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{activeTask.title}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    {activeTask.context || (settings.language === 'es' ? 'Sin Contexto' : 'No Context')}
                                </span>
                                <div className="h-1 w-1 rounded-full bg-slate-300" />
                                <span className="text-[10px] font-bold text-pomo uppercase tracking-widest">
                                    {settings.language === 'es' ? 'Ver Notas y Acciones' : 'View Notes & Actions'}
                                </span>
                            </div>
                        </button>
                    </div>
                )}
              </div>
            )}
            {currentView === 'inbox' && (
            <Inbox items={inbox} onAction={handleInboxAction} categories={categories} onStartSession={handleStartTaskFocus} onSaveNote={saveNoteToInbox} language={settings.language} onAddCategory={handleAddCategory} projects={projects} initialTab="inbox" />
            )}
            {currentView === 'projects' && (
            <Inbox items={inbox} onAction={handleInboxAction} categories={categories} onStartSession={handleStartTaskFocus} onSaveNote={saveNoteToInbox} language={settings.language} onAddCategory={handleAddCategory} projects={projects} initialTab="projects" />
            )}
            {currentView === 'someday' && (
            <Inbox items={inbox} onAction={handleInboxAction} categories={categories} onStartSession={handleStartTaskFocus} onSaveNote={saveNoteToInbox} language={settings.language} onAddCategory={handleAddCategory} projects={projects} initialTab="someday" />
            )}
            {currentView === 'dashboard' && <Dashboard credits={credits} onExport={handleGlobalExport} language={settings.language} history={history} />}
            {currentView === 'history' && <History history={history} language={settings.language} />}
            {currentView === 'profile' && <ProfileView user={user} language={settings.language} onClose={() => setCurrentView('timer')} />}
            {currentView === 'settings' && <SettingsView settings={settings} onUpdateSettings={setSettings} onUpdateDuration={handleDurationChange} onOpenIntegrations={() => setCurrentView('integrations')} />}
            {currentView === 'integrations' && (
                <div className="w-full max-w-4xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold dark:text-white">{settings.language === 'es' ? 'Integraciones API' : 'API Integrations'}</h2>
                        <button onClick={() => setCurrentView('settings')} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { name: 'Notion', desc: 'Sincroniza tus tareas y notas directamente.', icon: 'https://www.notion.so/front-static/favicon.ico' },
                            { name: 'Google Calendar', desc: 'Agendar bloques de tiempo automáticamente.', icon: 'https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png' },
                            { name: 'Slack', desc: 'Notificaciones de fin de sesión.', icon: 'https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_256.png' },
                            { name: 'GitHub', desc: 'Vincula commits con sesiones de enfoque.', icon: 'https://github.githubassets.com/favicons/favicon.svg' }
                        ].map(integration => (
                            <div key={integration.name} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent hover:border-pomo/30 transition-all group cursor-pointer">
                                <div className="flex items-center gap-4 mb-4">
                                    <img src={integration.icon} alt={integration.name} className="w-10 h-10 rounded-lg" />
                                    <h3 className="font-bold dark:text-white">{integration.name}</h3>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{integration.desc}</p>
                                <button className="w-full py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                                    {settings.language === 'es' ? 'Conectar API' : 'Connect API'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </main>

      {isFocusNotesOpen && activeTask && (
          <FocusNotesModal 
            task={activeTask}
            onClose={() => setIsFocusNotesOpen(false)}
            onUpdate={handleUpdateTask}
            language={settings.language}
          />
      )}

      {processingItem && (
        <ProcessingModal 
          item={processingItem} 
          projects={projects} 
          onClose={() => setProcessingItem(null)} 
          onAction={handleInboxAction} 
          language={settings.language} 
        />
      )}

      {isFocusNotesOpen && activeTask && (
        <FocusNotesModal 
          task={activeTask} 
          onClose={() => setIsFocusNotesOpen(false)} 
          onUpdate={handleUpdateTask}
          language={settings.language}
        />
      )}
      {isWeeklyReviewOpen && (
        <WeeklyReview 
          onClose={() => setIsWeeklyReviewOpen(false)} 
          language={settings.language} 
        />
      )}

      {activeTask && currentView !== 'timer' && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-lg">
              <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 flex items-center justify-between animate-in slide-in-from-bottom-8 cursor-pointer" onClick={() => setCurrentView('timer')}>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-pomo rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-pomo/20">
                          <span className="text-xl">⚡</span>
                      </div>
                      <div className="min-w-0">
                          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 leading-none mb-1">{settings.language === 'es' ? 'Misión Activa' : 'Active Mission'}</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{activeTask.title}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-4 pl-4 border-l border-slate-100 dark:border-slate-800 ml-4">
                      <div className="text-right">
                          <p className="text-lg font-mono font-bold text-pomo tabular-nums">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleSaveSession(activeTask.id, timeLeft, sessionsCompleted + 1); }} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all dark:bg-slate-800"><X className="w-5 h-5" /></button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
