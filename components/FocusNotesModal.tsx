
import React, { useState } from 'react';
import { InboxItem } from '../types';
import { X, Save, CheckCircle, Circle, Zap, FileText, ListTodo } from 'lucide-react';
import { cn } from '../utils';

interface FocusNotesModalProps {
  task: InboxItem;
  onClose: () => void;
  onUpdate: (id: string, content: string, title?: string) => void;
  language?: 'en' | 'es';
}

const FocusNotesModal: React.FC<FocusNotesModalProps> = ({ task, onClose, onUpdate, language = 'es' }) => {
  const [content, setContent] = useState(task.noteContent || '');
  const [title, setTitle] = useState(task.title);

  const handleSave = () => {
    onUpdate(task.id, content, title);
    onClose();
  };

  const t = {
    es: {
      title: 'Misión en Curso',
      notes: 'Notas del Focus',
      nextActions: 'Acciones Siguientes',
      save: 'Guardar Cambios',
      placeholder: 'Escribe tus notas aquí...',
      taskTitle: 'Título de la Misión'
    },
    en: {
      title: 'Mission in Progress',
      notes: 'Focus Notes',
      nextActions: 'Next Actions',
      save: 'Save Changes',
      placeholder: 'Write your notes here...',
      taskTitle: 'Mission Title'
    }
  }[language];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pomo rounded-2xl flex items-center justify-center shadow-lg shadow-pomo/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-pomo mb-1">{t.title}</h2>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-black text-slate-800 dark:text-white bg-transparent border-none outline-none focus:ring-0 p-0 w-full"
              />
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.notes}</h3>
            </div>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.placeholder}
              className="w-full h-64 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 outline-none focus:border-pomo/30 transition-all dark:text-white font-medium leading-relaxed resize-none"
            />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <ListTodo className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t.nextActions}</h3>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30">
                <p className="text-sm text-amber-800 dark:text-amber-400 font-medium italic">
                    {language === 'es' 
                        ? 'Usa el área de notas arriba para enlistar tus acciones usando [ ] o simplemente una lista.' 
                        : 'Use the notes area above to list your actions using [ ] or a simple list.'}
                </p>
            </div>
          </section>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-50 dark:border-slate-800">
          <button 
            onClick={handleSave}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FocusNotesModal;
