import React, { useState } from 'react';
import { InboxItem, Settings } from '../types';
import { 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  Timer,
  BarChart3,
  Search
} from 'lucide-react';
import { cn } from '../utils';

interface HistoryProps {
  history: InboxItem[];
  language: 'en' | 'es';
}

const History: React.FC<HistoryProps> = ({ history, language }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const t = {
    es: {
      title: 'Historial de Tareas',
      totalTime: 'Tiempo Total Enfocado',
      sessions: 'Sesiones Completadas',
      noHistory: 'No hay tareas completadas para este período',
      search: 'Buscar tareas...',
      task: 'Tarea',
      date: 'Fecha',
      duration: 'Duración',
      focusSessions: 'Enfoques',
      completed: 'Completada',
      today: 'Hoy'
    },
    en: {
      title: 'Task History',
      totalTime: 'Total Focus Time',
      sessions: 'Completed Sessions',
      noHistory: 'No completed tasks for this period',
      search: 'Search tasks...',
      task: 'Task',
      date: 'Date',
      duration: 'Duration',
      focusSessions: 'Focus',
      completed: 'Completed',
      today: 'Today'
    }
  }[language];

  const filteredHistory = history.filter(item => {
    const itemDate = new Date(item.createdAt);
    const isSameDay = itemDate.getDate() === selectedDate.getDate() &&
                     itemDate.getMonth() === selectedDate.getMonth() &&
                     itemDate.getFullYear() === selectedDate.getFullYear();
    
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.noteContent && item.noteContent.toLowerCase().includes(searchQuery.toLowerCase()));

    return isSameDay && matchesSearch;
  });

  const totalMinutes = filteredHistory.reduce((acc, item) => acc + (item.timeSpent || 0), 0);
  const totalSessions = filteredHistory.reduce((acc, item) => acc + (item.fullSessionsCount || 0), 0);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-pomo" />
            {t.title}
          </h1>
          <p className="text-slate-400 font-medium mt-1">{formatDate(selectedDate)}</p>
        </div>

        <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl p-1 shadow-sm border border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-pomo"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setSelectedDate(new Date())}
            className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-pomo transition-colors"
          >
            {t.today}
          </button>
          <button 
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-pomo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-pomo/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-pomo" />
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.totalTime}</span>
          </div>
          <div className="text-4xl font-black text-slate-800 dark:text-white">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Timer className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.sessions}</span>
          </div>
          <div className="text-4xl font-black text-slate-800 dark:text-white">
            {totalSessions}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-300" />
          <input 
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-600 dark:text-slate-300 placeholder:text-slate-300"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t.task}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t.focusSessions}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">{t.duration}</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">{t.completed}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          item.categoryId === 'c1' ? 'bg-red-500' :
                          item.categoryId === 'c2' ? 'bg-blue-500' :
                          item.categoryId === 'c3' ? 'bg-emerald-500' : 'bg-slate-400'
                        )} />
                        <div>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{item.title}</p>
                          {item.noteContent && (
                            <p className="text-xs text-slate-400 truncate max-w-[200px]">{item.noteContent}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {item.fullSessionsCount} focus
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                      {item.timeSpent} min
                    </td>
                    <td className="px-6 py-4 text-right">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="w-12 h-12 text-slate-200 dark:text-slate-800" />
                      <p className="text-slate-400 font-bold">{t.noHistory}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
