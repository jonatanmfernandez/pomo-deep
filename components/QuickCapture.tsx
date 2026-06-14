
import React, { useState } from 'react';
import { X, Send, Loader2, PenLine, Clock, Play, ChevronDown, Check } from 'lucide-react';
import { Category, TimerMode } from '../types';
import { cn, formatTime } from '../utils';

interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onStart: (content: string, categoryId?: string, title?: string) => void;
  timeLeft: number;
  timerMode: TimerMode;
  language?: 'en' | 'es';
}

const QuickCapture: React.FC<QuickCaptureProps> = ({ isOpen, onClose, categories, onStart, timeLeft, timerMode, language = 'es' }) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = {
    es: {
      title: 'Captura Rápida',
      placeholderTitle: 'Título de la tarea...',
      placeholderNote: 'Captura pensamientos o notas...',
      noTag: 'Sin Área',
      cancel: 'Cancelar',
      start: 'Iniciar',
      areaLabel: 'Área',
      areaDescription: 'Selecciona el área de enfoque para esta tarea.'
    },
    en: {
      title: 'Quick Capture',
      placeholderTitle: 'Task Title...',
      placeholderNote: 'Capture thoughts or notes...',
      noTag: 'No Area',
      cancel: 'Cancel',
      start: 'Start',
      areaLabel: 'Area',
      areaDescription: 'Select the focus area for this task.'
    }
  }[language];

  if (!isOpen) return null;

  const handleStart = () => {
    if (!title.trim()) return;
    onStart('', selectedCategory, title);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 pointer-events-none">
         <Clock className={cn("w-4 h-4", timerMode === TimerMode.FOCUS ? "text-pomo-light" : "text-emerald-400")} />
         <span className="font-mono text-xl font-bold tracking-widest tabular-nums">{formatTime(timeLeft)}</span>
      </div>
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
                <PenLine className="w-5 h-5 text-pomo" />
                <h3>{t.title}</h3>
            </div>
          <button onClick={onClose} className="text-slate-400 hover:text-pomo hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl transition-all"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Título</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder={t.placeholderTitle} 
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-lg font-bold outline-none focus:ring-2 focus:ring-pomo/10 dark:text-white"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.areaLabel}</label>
              <span className="text-[10px] text-slate-400 italic">{t.areaDescription}</span>
            </div>
            <div className="relative w-full" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-sm font-bold flex items-center justify-between border border-slate-200 dark:border-slate-700 dark:text-white transition-all hover:border-pomo/30"
                >
                  <div className="flex items-center gap-2">
                     <div className={cn("w-3 h-3 rounded-full", categories.find(c => c.id === selectedCategory)?.color || 'bg-slate-300')} />
                     <span>{categories.find(c => c.id === selectedCategory)?.name || t.noTag}</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isCategoryDropdownOpen && "rotate-180")} />
                </button>
                
                {isCategoryDropdownOpen && (
                  <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl shadow-2xl z-[110] max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-2">
                     <div className="p-1">
                        <button
                          type="button"
                          onClick={() => { setSelectedCategory(''); setIsCategoryDropdownOpen(false); }}
                          className={cn("w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors", !selectedCategory ? "bg-slate-100 dark:bg-slate-800 text-pomo" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800")}
                        >
                          <div className="flex items-center gap-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                             {t.noTag}
                          </div>
                          {!selectedCategory && <Check className="w-3.5 h-3.5" />}
                        </button>
                        {categories.map(cat => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => { setSelectedCategory(cat.id); setIsCategoryDropdownOpen(false); }}
                            className={cn("w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors", selectedCategory === cat.id ? "bg-slate-100 dark:bg-slate-800 text-pomo" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800")}
                          >
                            <div className="flex items-center gap-2">
                               <div className={cn("w-2.5 h-2.5 rounded-full", cat.color)} />
                               {cat.name}
                            </div>
                            {selectedCategory === cat.id && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                     </div>
                  </div>
                )}
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
             <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">{t.cancel}</button>
             <button onClick={handleStart} disabled={!title.trim()} className="bg-pomo text-white px-8 py-2.5 rounded-xl font-bold shadow-xl shadow-pomo/20 hover:bg-pomo-dark transition-all flex items-center gap-2"><Play className="w-4 h-4 fill-current" />{t.start}</button>
        </div>
      </div>
    </div>
  );
};

export default QuickCapture;
