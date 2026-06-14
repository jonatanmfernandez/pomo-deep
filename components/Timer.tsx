
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Play, Pause, RotateCcw, Target, FileText, 
  Bot, Send, Save, Edit3, Inbox as InboxIcon, Clock, X, Check, Share2, Mail, Layout, Copy, Download, Lock, PenLine
} from 'lucide-react';
import { TimerMode, Settings, Category, InboxItem } from '../types';
import { formatTime, cn } from '../utils';
import { GoogleGenAI } from "@google/genai";

interface TimerProps {
  settings: Settings;
  activeMode: TimerMode;
  startSession: (mode: TimerMode) => void;
  timeLeft: number;
  isActive: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  sessionsCompleted: number;
  onNoteChange: (note: string) => void;
  currentNote: string;
  categories: Category[];
  onSaveNote: (content: string, categoryId?: string) => void;
  activeTask?: InboxItem;
  onStopTask?: () => void;
  onSaveSession?: (id: string, timeLeft: number, sessionNumber: number) => void;
  onGoToInbox: () => void;
  onUpdateTask: (id: string, content: string, title?: string) => void;
}

interface NextAction {
  id: string;
  text: string;
  completed: boolean;
}

const Timer: React.FC<TimerProps> = ({ 
  settings, 
  activeMode, 
  startSession, 
  timeLeft, 
  isActive, 
  toggleTimer, 
  resetTimer, 
  sessionsCompleted, 
  categories, 
  activeTask,
  onStopTask,
  onSaveSession,
  onGoToInbox,
  onUpdateTask
}) => {
  
  const [viewMode, setViewMode] = useState<TimerMode>(activeMode);
  const [isDocViewOpen, setIsDocViewOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [notionDbId, setNotionDbId] = useState('29f324f67d3e80e0b07dc0c8e7c5fa78');
  const [notionStatus, setNotionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [notionError, setNotionError] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  
  const [taskTitle, setTaskTitle] = useState('');
  const [nextActions, setNextActions] = useState<NextAction[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = {
    es: {
      deepFocus: 'Deep Focus',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
      flowing: 'Fluyendo...',
      resting: 'Descansando...',
      ready: 'Listo',
      activeMission: 'Misión Activa',
      nextAction: 'Acción Siguiente',
      generalNotes: 'Notas Generales',
      aiAssistant: 'Asistente IA',
      copied: 'Copiado para Notion!',
      taskDetail: 'Detalle de Tarea',
      taskPlaceholder: 'Título de la Tarea',
      email: 'Email',
      clipboard: 'Notion (Clipboard)'
    },
    en: {
      deepFocus: 'Deep Focus',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
      flowing: 'Flowing...',
      resting: 'Resting...',
      ready: 'Ready',
      activeMission: 'Active Mission',
      nextAction: 'Next Action',
      generalNotes: 'General Notes',
      aiAssistant: 'AI Assistant',
      copied: 'Copied for Notion!',
      taskDetail: 'Task Detail',
      taskPlaceholder: 'Task Title',
      email: 'Email',
      clipboard: 'Notion (Clipboard)'
    }
  }[settings.language];

  useEffect(() => {
    setViewMode(activeMode);
  }, [activeMode]);

  const parseContent = (content: string, task: InboxItem) => {
    const lines = content.split('\n');
    const actions: NextAction[] = [];
    let notesLines: string[] = [];
    let isParsingNotes = false;

    const headerTextES = 'Acción Siguiente';
    const headerTextEN = 'Next Action';

    setTaskTitle(task.title || '');

    if (!content.trim() || (!content.includes(headerTextES) && !content.includes(headerTextEN))) {
      setNextActions([
        { id: Math.random().toString(36).substr(2, 9), text: '', completed: false },
        { id: Math.random().toString(36).substr(2, 9), text: '', completed: false },
        { id: Math.random().toString(36).substr(2, 9), text: '', completed: false }
      ]);
      setGeneralNotes(content);
      return;
    }

    lines.forEach(line => {
      if (line.trim() === '---') {
        isParsingNotes = true;
        return;
      }
      if (isParsingNotes) {
        notesLines.push(line);
      } else {
        const match = line.match(/^\[( |x)\] (.*)/);
        if (match) {
          actions.push({
            id: Math.random().toString(36).substr(2, 9),
            completed: match[1] === 'x',
            text: match[2]
          });
        }
      }
    });

    setNextActions(actions.length > 0 ? actions : [
      { id: Math.random().toString(36).substr(2, 9), text: '', completed: false }
    ]);
    setGeneralNotes(notesLines.join('\n').trim());
  };

  const stringifyContent = () => {
    const headerText = t.nextAction;
    const actionsStr = nextActions.map(a => `[${a.completed ? 'x' : ' '}] ${a.text}`).join('\n');
    return `${headerText}\n${actionsStr}\n\n---\n\n${generalNotes}`;
  };

  useEffect(() => {
    if (activeTask && isDocViewOpen) {
      parseContent(activeTask.noteContent, activeTask);
    }
  }, [activeTask, isDocViewOpen]);

  useEffect(() => {
    if (isAiChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isAiChatOpen]);

  const isViewingActive = viewMode === activeMode;
  
  const getDurationForMode = (m: TimerMode) => {
    switch(m) {
      case TimerMode.FOCUS: return settings.focusDuration;
      case TimerMode.SHORT_BREAK: return settings.shortBreakDuration;
      case TimerMode.LONG_BREAK: return settings.longBreakDuration;
      default: return 25;
    }
  };

  const displayDuration = getDurationForMode(viewMode);
  const displayTime = isViewingActive ? timeLeft : displayDuration * 60;
  const progressRatio = isViewingActive ? displayTime / (displayDuration * 60) : 1; 
  const strokeDashoffset = 100 - (progressRatio * 100);
  const growthScale = isActive && isViewingActive && viewMode === TimerMode.FOCUS ? 1.05 : 1;

  const theme = (() => {
    switch(viewMode) {
      case TimerMode.SHORT_BREAK:
        return { 
          primary: 'text-emerald-600', stroke: 'text-emerald-400', btnBg: 'bg-emerald-600', 
          btnText: 'text-white', glow: 'shadow-emerald-600/30', 
          pillActive: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
        };
      case TimerMode.LONG_BREAK:
        return { 
          primary: 'text-violet-600', stroke: 'text-violet-400', btnBg: 'bg-violet-600', 
          btnText: 'text-white', glow: 'shadow-violet-600/30', 
          pillActive: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200'
        };
      default:
        return { 
          primary: 'text-pomo', stroke: 'text-pomo-light', btnBg: 'bg-pomo', 
          btnText: 'text-white', glow: 'shadow-pomo/30', 
          pillActive: 'bg-red-100 text-pomo-dark dark:bg-red-900/40 dark:text-red-200'
        };
    }
  })();

  const handlePlayAction = () => {
    if (isViewingActive) toggleTimer();
    else startSession(viewMode);
  };

  useEffect(() => {
    if (isAiChatOpen && chatHistory.length === 0) {
      const welcomeMsg = settings.language === 'es' 
        ? "¡Hola! Soy Pomo. ¿En qué puedo ayudarte con tu sesión de hoy?" 
        : "Hi! I'm Pomo. How can I help you with your session today?";
      setChatHistory([{ role: 'model', text: welcomeMsg }]);
    }
  }, [isAiChatOpen, chatHistory.length, settings.language]);

  const handleAiChat = async (customPrompt?: string) => {
    const userMsg = customPrompt || chatMessage;
    if (!userMsg.trim() || !activeTask) return;
    
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fullText = stringifyContent();
      const prompt = settings.language === 'es' 
        ? `Eres Pomo, un asistente de productividad. El usuario está tomando estas notas: "${fullText}". Pregunta: "${userMsg}". Responde de forma muy breve y directa. No te presentes.`
        : `You are Pomo, a productivity assistant. The user is taking these notes: "${fullText}". Question: "${userMsg}". Respond very briefly and directly. Do not introduce yourself.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setChatHistory(prev => [...prev, { role: 'model', text: response.text || (settings.language === 'es' ? "No pude procesar la solicitud." : "Could not process request.") }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'model', text: settings.language === 'es' ? "Error de conexión con la IA." : "AI Connection Error." }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const saveDocChanges = () => {
    if (activeTask) {
      onUpdateTask(activeTask.id, stringifyContent(), taskTitle);
    }
  };

  const toggleAction = (id: string) => {
    setNextActions(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const updateActionText = (id: string, text: string) => {
    setNextActions(prev => prev.map(a => a.id === id ? { ...a, text } : a));
  };

  const handleActionKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newAction: NextAction = { id: Math.random().toString(36).substr(2, 9), text: '', completed: false };
      const updated = [...nextActions];
      updated.splice(index + 1, 0, newAction);
      setNextActions(updated);
      setTimeout(() => document.getElementById(`action-input-${newAction.id}`)?.focus(), 0);
    } else if (e.key === 'Backspace' && nextActions[index].text === '' && nextActions.length > 1) {
      e.preventDefault();
      const updated = [...nextActions];
      updated.splice(index, 1);
      setNextActions(updated);
      const prevIndex = index > 0 ? index - 1 : 0;
      setTimeout(() => document.getElementById(`action-input-${nextActions[prevIndex]?.id}`)?.focus(), 0);
    }
  };

  const handleExportToNotion = async () => {
    if (!activeTask) return;
    setNotionStatus('loading');
    setNotionError(null);

    try {
      const response = await fetch('/api/notion/create-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseId: notionDbId,
          title: taskTitle,
          content: stringifyContent()
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to export to Notion');

      setNotionStatus('success');
      setIsExportMenuOpen(false);
      setTimeout(() => setNotionStatus('idle'), 3000);
    } catch (error: any) {
      setNotionError(error.message);
      setNotionStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto py-4 relative">
        {exportFeedback && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in font-bold text-sm">
                <Check className="w-4 h-4 text-emerald-400" />
                {exportFeedback}
            </div>
        )}

        <div className="flex bg-white p-1 rounded-full shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 relative z-20 mb-12">
            <button onClick={() => setViewMode(TimerMode.FOCUS)} className={cn("px-6 py-2 rounded-full text-sm font-medium transition-all", viewMode === TimerMode.FOCUS ? theme.pillActive : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}>{t.deepFocus}</button>
            <button onClick={() => setViewMode(TimerMode.SHORT_BREAK)} className={cn("px-6 py-2 rounded-full text-sm font-medium transition-all", viewMode === TimerMode.SHORT_BREAK ? theme.pillActive : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}>{t.shortBreak}</button>
            <button onClick={() => setViewMode(TimerMode.LONG_BREAK)} className={cn("px-6 py-2 rounded-full text-sm font-medium transition-all", viewMode === TimerMode.LONG_BREAK ? theme.pillActive : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}>{t.longBreak}</button>
        </div>

        <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center mb-8">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none overflow-visible">
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="1" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="6" fill="transparent" pathLength={100} strokeDasharray="100" strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={cn("transition-all duration-1000 ease-linear timer-glow", theme.stroke)} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                <span className={cn("font-sans font-bold tracking-tighter tabular-nums leading-none transition-transform duration-1000 ease-in-out select-none", theme.primary)} style={{ fontSize: 'clamp(3.5rem, 12vw, 7rem)', transform: `scale(${growthScale})` }}>{formatTime(displayTime)}</span>
                <span className="text-slate-400 mt-2 font-medium uppercase tracking-[0.2em] text-[10px] dark:text-slate-500 opacity-60">
                    {isActive && isViewingActive ? (viewMode === TimerMode.FOCUS ? t.flowing : t.resting) : t.ready}
                </span>
            </div>
        </div>

        {activeTask && (
            <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button 
                  onClick={() => setIsDocViewOpen(true)}
                  className="group flex flex-col items-center gap-2 hover:scale-105 transition-all"
                >
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] group-hover:text-pomo transition-colors">{t.activeMission}</span>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm group-hover:shadow-md group-hover:border-pomo/20 transition-all">
                        <Target className="w-4 h-4 text-pomo" />
                        <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{activeTask.title}</span>
                        <PenLine className="w-4 h-4 text-slate-300 group-hover:text-pomo transition-colors" />
                    </div>
                </button>
            </div>
        )}

        <div className="flex items-center gap-6 relative z-20 mb-8">
            <button onClick={resetTimer} className={cn("w-14 h-14 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-all dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 hover:scale-105 active:scale-95", !isViewingActive && "opacity-0 pointer-events-none")}><RotateCcw className="w-5 h-5" /></button>
            <button 
              onClick={handlePlayAction} 
              disabled={isActive && !isViewingActive} 
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95", 
                isActive && isViewingActive ? "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300" : `${theme.btnBg} ${theme.btnText} shadow-xl ${theme.glow}`, 
                isActive && !isViewingActive && "opacity-50 cursor-not-allowed grayscale"
              )}
            >
                {isActive && isViewingActive ? <Pause className="w-8 h-8" /> : (isActive && !isViewingActive ? <Lock className="w-6 h-6" /> : <Play className="w-8 h-8 ml-1" />)}
            </button>
            <div className="w-14 h-14">
              {viewMode === TimerMode.FOCUS && (
                <button onClick={onGoToInbox} className={cn("w-full h-full rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg", isViewingActive ? `${theme.btnBg} ${theme.btnText} ${theme.glow} dark:brightness-110` : "bg-slate-900 text-white dark:bg-white dark:text-black")}><InboxIcon className="w-5 h-5" /></button>
              )}
            </div>
        </div>
        
        {isStopConfirmOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsStopConfirmOpen(false)} />
                <div className="relative bg-white dark:bg-slate-900 w-full max-w-xs rounded-2xl p-6 text-center shadow-2xl border dark:border-slate-800 animate-in fade-in zoom-in-95">
                    <h3 className="text-lg font-bold dark:text-white mb-2">{settings.language === 'es' ? '¿Detener Misión?' : 'Stop Mission?'}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        {settings.language === 'es' 
                            ? '¿Quieres guardar esta sesión para continuar más tarde?' 
                            : 'Do you want to save this session to continue later?'}
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setIsStopConfirmOpen(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium dark:text-slate-300">{settings.language === 'es' ? 'Cancelar' : 'Cancel'}</button>
                        <button onClick={() => { onStopTask?.(); setIsStopConfirmOpen(false); }} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg">{settings.language === 'es' ? 'Confirmar' : 'Confirm'}</button>
                    </div>
                </div>
            </div>
        )}

        {isDocViewOpen && activeTask && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { saveDocChanges(); setIsDocViewOpen(false); }} />
                
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 pointer-events-none z-[80]">
                    <Clock className={cn("w-4 h-4", activeMode === TimerMode.FOCUS ? "text-pomo-light" : (activeMode === TimerMode.SHORT_BREAK ? "text-emerald-400" : "text-violet-400"))} />
                    <span className="font-mono text-xl font-bold tracking-widest tabular-nums">{formatTime(timeLeft)}</span>
                </div>

                <div className="relative bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95">
                    <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-100 dark:border-slate-800">
                         <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                                <Target className="w-4 h-4 text-pomo shrink-0" /> 
                                <input 
                                  value={taskTitle} 
                                  onChange={(e) => setTaskTitle(e.target.value)}
                                  placeholder={t.taskPlaceholder}
                                  className="text-sm font-bold text-slate-700 dark:text-slate-300 bg-transparent border-none outline-none focus:ring-0 w-full"
                                />
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <div className="relative">
                                    <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className={cn("p-2 rounded-lg transition-all", isExportMenuOpen ? "bg-slate-100 dark:bg-slate-800" : "text-slate-400 hover:text-slate-600")} title="Export / Share">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                    {isExportMenuOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                            <div className="p-4 space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white font-bold text-[10px]">N</div>
                                                            <span className="font-bold text-xs">Notion</span>
                                                        </div>
                                                        <button 
                                                            onClick={handleExportToNotion}
                                                            disabled={notionStatus === 'loading'}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                                                                notionStatus === 'success' ? "bg-emerald-500 text-white" : "bg-black text-white hover:bg-slate-800"
                                                            )}
                                                        >
                                                            {notionStatus === 'loading' ? '...' : notionStatus === 'success' ? '✓ Sent' : 'Send'}
                                                        </button>
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Database ID"
                                                        value={notionDbId}
                                                        onChange={(e) => setNotionDbId(e.target.value)}
                                                        className="w-full text-[10px] p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-pomo"
                                                    />
                                                    {notionError && <p className="text-[9px] text-red-500 leading-tight">{notionError}</p>}
                                                </div>
                                                
                                                <div className="h-px bg-slate-100 dark:bg-slate-700" />
                                                
                                                <button onClick={() => { window.location.href = `mailto:?subject=${encodeURIComponent(taskTitle)}&body=${encodeURIComponent(stringifyContent())}`; setIsExportMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                                    <Mail className="w-4 h-4 text-blue-500" /> {t.email}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setIsAiChatOpen(!isAiChatOpen)} className={cn("p-2 rounded-lg transition-all", isAiChatOpen ? "bg-violet-100 text-violet-600 dark:bg-violet-900/40" : "text-slate-400 hover:text-violet-500")}>
                                    <Bot className="w-5 h-5" />
                                </button>
                                <button onClick={saveDocChanges} className="p-2 text-slate-400 hover:text-green-500 transition-colors">
                                  <Save className="w-5 h-5" />
                                </button>
                                <button onClick={() => { saveDocChanges(); setIsDocViewOpen(false); }} className="p-2 text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                            </div>
                         </div>

                         <div className="flex-1 overflow-y-auto p-10 bg-white dark:bg-slate-900 custom-scrollbar">
                            <div className="max-w-3xl mx-auto space-y-10">
                                <section>
                                    <div className="flex items-center gap-2 mb-6">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">{t.nextAction}</h4>
                                    </div>
                                    <div className="space-y-3">
                                        {nextActions.map((action, index) => (
                                            <div key={action.id} className="group flex items-center gap-4">
                                                <button onClick={() => toggleAction(action.id)} className={cn("w-6 h-6 rounded-md flex items-center justify-center transition-all border-2", action.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 dark:border-slate-700 group-hover:border-slate-300")}>
                                                    {action.completed ? <Check className="w-4 h-4" /> : null}
                                                </button>
                                                <input id={`action-input-${action.id}`} type="text" value={action.text} onChange={(e) => updateActionText(action.id, e.target.value)} onKeyDown={(e) => handleActionKeyDown(e, index)} className={cn("flex-1 bg-transparent border-none outline-none text-lg font-medium transition-all", action.completed ? "text-slate-300 line-through" : "text-slate-700 dark:text-slate-200")} />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
                                <section className="flex-1 flex flex-col min-h-[400px]">
                                    <div className="flex items-center gap-2 mb-6">
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">{t.generalNotes}</h4>
                                    </div>
                                    <textarea value={generalNotes} onChange={(e) => setGeneralNotes(e.target.value)} className="w-full flex-1 bg-transparent text-lg leading-relaxed focus:outline-none min-h-[300px] dark:text-slate-200" placeholder="..." />
                                </section>
                            </div>
                         </div>
                    </div>

                    {isAiChatOpen && (
                        <div className="w-full md:w-80 flex flex-col bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold text-slate-700 bg-white dark:bg-slate-900 dark:text-slate-200">
                                <div className="flex items-center gap-2"><div className="w-6 h-6 bg-pomo rounded-lg flex items-center justify-center text-white"><Bot className="w-4 h-4" /></div><span>Pomo</span></div>
                                <button onClick={() => setIsAiChatOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={cn("text-sm p-3 rounded-xl max-w-[90%] shadow-sm", msg.role === 'user' ? "bg-pomo text-white self-end ml-auto" : "bg-white dark:bg-slate-800 dark:text-slate-300 border")}>
                                        {msg.role === 'model' ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-strong:font-black prose-strong:text-pomo dark:prose-strong:text-pomo-light">
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            </div>
                                        ) : msg.text}
                                    </div>
                                ))}
                                {chatHistory.length === 1 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {[
                                            settings.language === 'es' ? 'Ideas para brainstorming' : 'Brainstorming ideas',
                                            settings.language === 'es' ? 'Resumen de mis notas' : 'Summarize my notes',
                                            settings.language === 'es' ? 'Próximos pasos' : 'Next steps'
                                        ].map((suggestion, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => handleAiChat(suggestion)}
                                                className="text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-slate-500 hover:border-pomo hover:text-pomo transition-all"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {isAiThinking && <div className="flex gap-1 justify-center p-2"><span className="w-2 h-2 bg-pomo/40 rounded-full animate-bounce" /></div>}
                                <div ref={chatEndRef} />
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                                <div className="relative">
                                    <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiChat()} placeholder="..." className="w-full bg-slate-100 dark:bg-slate-800 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pomo/30 dark:text-white" />
                                    <button onClick={() => handleAiChat()} disabled={!chatMessage.trim() || isAiThinking} className="absolute right-1 top-1 p-1.5 bg-pomo text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50"><Send className="w-3 h-3" /></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default Timer;
