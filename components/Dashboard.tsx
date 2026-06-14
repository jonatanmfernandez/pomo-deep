
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UserCredits, InboxItem } from '../types';
import { Download, Share2, CreditCard, Check, Copy, Mail, FileText } from 'lucide-react';

interface DashboardProps {
  credits: UserCredits;
  onExport: (type: 'notion' | 'sheets' | 'mail' | 'pdf' | 'md') => void;
  language: 'en' | 'es';
  history: InboxItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ credits, onExport, language, history }) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  // Calculate weekly data from history
  const getWeeklyData = () => {
    const days = language === 'es' 
      ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday
    const startOfWeek = new Date(now);
    // Adjust to Monday as start of week
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyStats = days.map((name, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);
      const nextDayDate = new Date(dayDate);
      nextDayDate.setDate(dayDate.getDate() + 1);

      const dayMinutes = history
        .filter(item => {
          const itemDate = new Date(item.createdAt);
          return itemDate >= dayDate && itemDate < nextDayDate;
        })
        .reduce((acc, item) => acc + (item.timeSpent || 0), 0);

      return { name, minutes: dayMinutes };
    });

    return weeklyStats;
  };

  const weeklyData = getWeeklyData();
  const totalWeeklyMinutes = weeklyData.reduce((acc, day) => acc + day.minutes, 0);
  const totalWeeklyHours = (totalWeeklyMinutes / 60).toFixed(1);

  const t = {
    es: {
      credits: 'Créditos de Exportación',
      buyCredits: 'Comprar 50 Créditos ($10)',
      weeklyFocus: 'Enfoque Semanal',
      focusDesc: `Te enfocaste por ${totalWeeklyHours} horas esta semana.`,
      exportData: 'Exportar Datos',
      pdfReport: 'Reporte PDF',
      markdown: 'Markdown',
      googleSheets: 'Google Sheets',
      email: 'Email',
      integrations: 'Integraciones',
      notion: 'Notion',
      notionDesc: 'Sincronizar vía Portapapeles',
      prepareSync: 'Preparar Sincronización',
      download: 'Descargar',
      free: 'Gratis',
      credit: '1 Crédito'
    },
    en: {
      credits: 'Export Credits',
      buyCredits: 'Buy 50 Credits ($10)',
      weeklyFocus: 'Weekly Focus',
      focusDesc: `You focused for ${totalWeeklyHours} hours this week.`,
      exportData: 'Export Data',
      pdfReport: 'PDF Report',
      markdown: 'Markdown',
      googleSheets: 'Google Sheets',
      email: 'Email',
      integrations: 'Integrations',
      notion: 'Notion',
      notionDesc: 'Sync items via Clipboard',
      prepareSync: 'Prepare Sync',
      download: 'Download',
      free: 'Free',
      credit: '1 Credit'
    }
  }[language];

  const handleExportClick = (type: 'notion' | 'sheets' | 'mail' | 'pdf' | 'md', label: string) => {
    onExport(type);
    setFeedback(`Exported to ${label}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 space-y-8 relative">
      
      {feedback && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 font-bold text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              {feedback}
          </div>
      )}

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group dark:bg-black dark:border dark:border-slate-800">
            <div className="absolute top-0 right-0 p-32 bg-red-600/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-red-600/20 transition-all"></div>
            <div className="relative z-10">
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">{t.credits}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{credits.available}</span>
                    <span className="text-slate-400">/ ∞</span>
                </div>
                <button className="mt-6 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20">
                    <CreditCard className="w-4 h-4" /> {t.buyCredits}
                </button>
            </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800">
            <div>
                 <h3 className="text-slate-900 text-lg font-bold mb-1 dark:text-white">{t.weeklyFocus}</h3>
                 <p className="text-slate-500 text-sm dark:text-slate-400">{t.focusDesc}</p>
            </div>
            <div className="h-32 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                        <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} stroke="#94a3b8" />
                        <Tooltip 
                            cursor={{fill: 'var(--tw-prose-invert)'}} 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                            {weeklyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.minutes > 0 ? '#dc2626' : '#cbd5e1'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 dark:text-white">
                <Download className="w-5 h-5" /> {t.exportData}
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => handleExportClick('pdf', t.pdfReport)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50 transition-all text-left group dark:border-slate-700 dark:hover:border-red-500 dark:hover:bg-red-900/20"
                >
                    <span className="block font-bold text-slate-700 group-hover:text-red-700 dark:text-slate-200 dark:group-hover:text-red-400">{t.pdfReport}</span>
                    <span className="text-xs text-slate-400 mt-1">{t.credit}</span>
                </button>
                <button 
                    onClick={() => handleExportClick('md', t.markdown)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50 transition-all text-left group dark:border-slate-700 dark:hover:border-red-500 dark:hover:bg-red-900/20"
                >
                    <span className="block font-bold text-slate-700 group-hover:text-red-700 dark:text-slate-200 dark:group-hover:text-red-400">{t.markdown}</span>
                    <span className="text-xs text-slate-400 mt-1">{t.free}</span>
                </button>
                <button 
                    onClick={() => handleExportClick('sheets', t.googleSheets)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all text-left group dark:border-slate-700 dark:hover:border-green-500 dark:hover:bg-green-900/20"
                >
                    <span className="block font-bold text-slate-700 group-hover:text-green-700 dark:text-slate-200 dark:group-hover:text-green-400">{t.googleSheets}</span>
                    <span className="text-xs text-slate-400 mt-1">{t.free}</span>
                </button>
                <button 
                    onClick={() => handleExportClick('mail', t.email)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                >
                    <span className="block font-bold text-slate-700 group-hover:text-blue-700 dark:text-slate-200 dark:group-hover:text-blue-400">{t.email}</span>
                    <span className="text-xs text-slate-400 mt-1">{t.free}</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
