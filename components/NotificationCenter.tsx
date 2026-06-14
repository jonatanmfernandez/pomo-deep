
import React from 'react';
import { InboxItem } from '../types';
import { cn, calculateDaysAgo } from '../utils';
import { Bell, Calendar, Play, X, Clock } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  items: InboxItem[];
  onStartSession: (id: string) => void;
  language?: 'en' | 'es';
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, items, onStartSession, language = 'es' }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const alerts = items.filter(item => 
    item.status === 'scheduled' && 
    item.scheduledDate && 
    new Date(item.scheduledDate).toISOString().split('T')[0] <= today
  );

  const t = {
    es: {
      title: 'Recordatorios',
      subtitle: 'Pendientes para hoy',
      noAlerts: 'No tienes recordatorios programados para hoy.',
      noAlertsSub: 'Agenda tareas desde tu Bandeja de entrada para verlas aquí.',
      reminder: 'Recordatorio',
      startNow: 'Iniciar Focus Ahora',
      footer: 'Las tareas programadas aparecerán aquí automáticamente en la fecha elegida.'
    },
    en: {
      title: 'Reminders',
      subtitle: 'Pending for today',
      noAlerts: 'You have no reminders scheduled for today.',
      noAlertsSub: 'Schedule tasks from your Inbox to see them here.',
      reminder: 'Reminder',
      startNow: 'Start Focus Now',
      footer: 'Scheduled tasks will automatically appear here on the chosen date.'
    }
  }[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-100 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{t.title}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium text-sm">{t.noAlerts}</p>
              <p className="text-slate-400 text-xs mt-1">{t.noAlertsSub}</p>
            </div>
          ) : (
            alerts.map(item => (
              <div key={item.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-amber-200 dark:hover:border-amber-900 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t.reminder}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {new Date(item.scheduledDate!).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">{item.title}</h4>
                <button 
                  onClick={() => { onStartSession(item.id); onClose(); }}
                  className="w-full bg-white dark:bg-slate-700 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all"
                >
                  <Play className="w-3 h-3 fill-current" /> {t.startNow}
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 text-center font-medium italic">
            {t.footer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
