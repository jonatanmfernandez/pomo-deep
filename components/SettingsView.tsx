
import React from 'react';
import { Settings } from '../types';
import { cn } from '../utils';
import { Globe, Clock, Sliders, CheckCircle, Share2 } from 'lucide-react';

interface SettingsViewProps {
  settings: Settings;
  onUpdateSettings: (s: Settings) => void;
  onUpdateDuration: (type: 'focus' | 'short' | 'long', value: number) => void;
  onOpenIntegrations: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings, onUpdateDuration, onOpenIntegrations }) => {
  const t = {
    es: {
      title: 'Configuración',
      language: 'Idioma del Sistema',
      timers: 'Duración de Temporizadores',
      focus: 'Enfoque',
      short: 'Descanso Corto',
      long: 'Descanso Largo',
      interval: 'Intervalo Descanso Largo',
      saved: 'Los cambios se aplican automáticamente',
      integrations: 'Integraciones API',
      integrationsDesc: 'Conecta con Notion, Slack y más.'
    },
    en: {
      title: 'Settings',
      language: 'System Language',
      timers: 'Timer Durations',
      focus: 'Focus',
      short: 'Short Break',
      long: 'Long Break',
      interval: 'Long Break Interval',
      saved: 'Changes are applied automatically',
      integrations: 'API Integrations',
      integrationsDesc: 'Connect with Notion, Slack and more.'
    }
  }[settings.language];

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 animate-in fade-in">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h2>
        <p className="text-slate-500 text-sm dark:text-slate-400 mt-2">{t.saved}</p>
      </div>

      <div className="space-y-8">
        {/* Language Section */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-5 h-5 text-pomo" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">{t.language}</h3>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => onUpdateSettings({...settings, language: 'es'})}
              className={cn("flex-1 py-3 rounded-lg text-sm font-bold transition-all", settings.language === 'es' ? "bg-white shadow dark:bg-slate-700 dark:text-white text-pomo" : "text-slate-400")}
            >
              Español
            </button>
            <button 
              onClick={() => onUpdateSettings({...settings, language: 'en'})}
              className={cn("flex-1 py-3 rounded-lg text-sm font-bold transition-all", settings.language === 'en' ? "bg-white shadow dark:bg-slate-700 dark:text-white text-pomo" : "text-slate-400")}
            >
              English
            </button>
          </div>
        </section>

        {/* Timers Section */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-pomo" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100">{t.timers}</h3>
          </div>
          
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t.focus}</label>
                <span className="text-sm font-bold text-pomo">{settings.focusDuration} min</span>
              </div>
              <input 
                type="range" min="15" max="60" step="5"
                value={settings.focusDuration}
                onChange={(e) => onUpdateDuration('focus', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pomo"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t.short}</label>
                <span className="text-sm font-bold text-emerald-500">{settings.shortBreakDuration} min</span>
              </div>
              <input 
                type="range" min="3" max="15" step="1"
                value={settings.shortBreakDuration}
                onChange={(e) => onUpdateDuration('short', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t.long}</label>
                <span className="text-sm font-bold text-violet-500">{settings.longBreakDuration} min</span>
              </div>
              <input 
                type="range" min="10" max="45" step="5"
                value={settings.longBreakDuration}
                onChange={(e) => onUpdateDuration('long', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-800">
               <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">{t.interval}</label>
                  <select 
                    value={settings.longBreakInterval}
                    onChange={(e) => onUpdateSettings({...settings, longBreakInterval: parseInt(e.target.value)})}
                    className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 text-sm font-bold outline-none dark:text-white"
                  >
                    {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} sessions</option>)}
                  </select>
               </div>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer hover:border-pomo/30 transition-all group" onClick={onOpenIntegrations}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-violet-500" />
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{t.integrations}</h3>
                    <p className="text-xs text-slate-400">{t.integrationsDesc}</p>
                </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-pomo group-hover:text-white transition-all">
                <CheckCircle className="w-4 h-4" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
