
import React, { useState } from 'react';
import { InboxItem, Project } from '../types';
import { X, Trash2, Archive, Check, ArrowRight, FolderPlus, Tag, Clock, Zap, Play } from 'lucide-react';
import { cn } from '../utils';

interface ProcessingModalProps {
  item: InboxItem;
  projects: Project[];
  onClose: () => void;
  onAction: (id: string, action: 'delete' | 'archive' | 'done-now' | 'process' | 'someday', payload?: any) => void;
  language?: 'en' | 'es';
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({ item, projects, onClose, onAction, language = 'es' }) => {
  const [step, setStep] = useState<'actionable' | 'two-minutes' | 'organize'>('actionable');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(item.projectId || '');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(item.folderId || '');
  const [context, setContext] = useState<string>(item.context || '');

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const folders = selectedProject?.folders || [];

  const t = {
    es: {
      title: 'Procesar Bandeja de Entrada',
      isActionable: '¿Es accionable?',
      yes: 'Sí',
      no: 'No',
      delete: 'Borrar',
      archive: 'Archivar',
      someday: 'Algún día / Tal vez',
      twoMinutes: '¿Toma menos de 2 minutos?',
      doneNow: 'Hecho ya',
      moreTime: 'Toma más tiempo',
      organize: 'Organizar Tarea',
      project: 'Proyecto',
      folder: 'Carpeta',
      noProject: 'Sin Proyecto',
      noFolder: 'Sin Carpeta',
      context: 'Contexto (obligatorio si no hay proyecto)',
      startFocus: 'Iniciar Enfoque',
      moveToSomeday: 'Mover a Algún día'
    },
    en: {
      title: 'Process Inbox',
      isActionable: 'Is it actionable?',
      yes: 'Yes',
      no: 'No',
      delete: 'Delete',
      archive: 'Archive',
      someday: 'Someday / Maybe',
      twoMinutes: 'Does it take < 2 minutes?',
      doneNow: 'Done now',
      moreTime: 'Takes more time',
      organize: 'Organize Task',
      project: 'Project',
      folder: 'Folder',
      noProject: 'No Project',
      noFolder: 'No Folder',
      context: 'Context (required if no project)',
      startFocus: 'Start Focus',
      moveToSomeday: 'Move to Someday'
    }
  }[language];

  const handleActionable = (isActionable: boolean) => {
    if (isActionable) {
      setStep('two-minutes');
    } else {
      // Show options for non-actionable
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'actionable':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-center dark:text-white">{t.isActionable}</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleActionable(true)}
                className="flex flex-col items-center justify-center p-6 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-900 rounded-2xl hover:border-emerald-500 transition-all group"
              >
                <Check className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{t.yes}</span>
              </button>
              <div className="space-y-2">
                <button 
                  onClick={() => onAction(item.id, 'delete')}
                  className="w-full flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-xl hover:border-red-500 transition-all text-red-600 dark:text-red-400 font-bold text-sm"
                >
                  <Trash2 className="w-4 h-4" /> {t.delete}
                </button>
                <button 
                  onClick={() => onAction(item.id, 'archive')}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-400 transition-all text-slate-600 dark:text-slate-300 font-bold text-sm"
                >
                  <Archive className="w-4 h-4" /> {t.archive}
                </button>
                <button 
                  onClick={() => onAction(item.id, 'someday')}
                  className="w-full flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900 rounded-xl hover:border-amber-500 transition-all text-amber-600 dark:text-amber-400 font-bold text-sm"
                >
                  <Clock className="w-4 h-4" /> {t.someday}
                </button>
              </div>
            </div>
          </div>
        );
      case 'two-minutes':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-center dark:text-white">{t.twoMinutes}</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => onAction(item.id, 'done-now', { isTwoMinutes: true })}
                className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-900 rounded-2xl hover:border-blue-500 transition-all group"
              >
                <Zap className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-blue-700 dark:text-blue-400">{t.doneNow}</span>
              </button>
              <button 
                onClick={() => setStep('organize')}
                className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:border-pomo transition-all group"
              >
                <ArrowRight className="w-8 h-8 text-slate-400 mb-2 group-hover:translate-x-1 transition-transform" />
                <span className="font-bold text-slate-700 dark:text-slate-300">{t.moreTime}</span>
              </button>
            </div>
          </div>
        );
      case 'organize':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-center dark:text-white">{t.organize}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.project}</label>
                  <select 
                    value={selectedProjectId}
                    onChange={(e) => {
                        setSelectedProjectId(e.target.value);
                        setSelectedFolderId('');
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-pomo transition-all dark:text-white text-sm"
                  >
                    <option value="">{t.noProject}</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.folder}</label>
                  <select 
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    disabled={!selectedProjectId}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-pomo transition-all dark:text-white text-sm disabled:opacity-50"
                  >
                    <option value="">{t.noFolder}</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.context}</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="@casa, @oficina..."
                    className="w-full bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-pomo transition-all dark:text-white"
                  />
                </div>
              </div>
              <button 
                onClick={() => onAction(item.id, 'process', { projectId: selectedProjectId, folderId: selectedFolderId, context, isTwoMinutes: false })}
                disabled={!context.trim() && !selectedProjectId}
                className="w-full bg-pomo text-white py-4 rounded-2xl font-bold shadow-xl shadow-pomo/20 hover:bg-pomo-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
              >
                <Play className="w-4 h-4 fill-current" /> {t.startFocus}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pomo/10 rounded-2xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-pomo" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">{t.title}</h2>
              <p className="text-lg font-bold dark:text-white truncate max-w-[200px]">{item.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {renderStep()}

        <div className="mt-8 flex justify-center gap-2">
          {['actionable', 'two-minutes', 'organize'].map((s, i) => (
            <div 
              key={s} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                step === s ? "w-8 bg-pomo" : "w-1.5 bg-slate-200 dark:bg-slate-800"
              )} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessingModal;
