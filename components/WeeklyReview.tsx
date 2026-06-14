
import React, { useState } from 'react';
import { X, Check, Brain, Inbox, Folder, Clock, Calendar, ArrowRight, ArrowLeft, Zap } from 'lucide-react';
import { cn } from '../utils';

interface WeeklyReviewProps {
  onClose: () => void;
  language?: 'en' | 'es';
}

const WeeklyReview: React.FC<WeeklyReviewProps> = ({ onClose, language = 'es' }) => {
  const [step, setStep] = useState(0);

  const steps = [
    { 
      id: 'brain-dump', 
      title: language === 'es' ? 'Vaciar Mente' : 'Brain Dump', 
      icon: <Brain className="w-6 h-6" />,
      desc: language === 'es' ? 'Escribe todo lo que tengas en la cabeza. No juzgues, solo captura.' : 'Write down everything on your mind. Don\'t judge, just capture.'
    },
    { 
      id: 'process-inbox', 
      title: language === 'es' ? 'Procesar Inbox' : 'Process Inbox', 
      icon: <Inbox className="w-6 h-6" />,
      desc: language === 'es' ? 'Procesa todos los elementos de tu bandeja de entrada.' : 'Process all items in your inbox.'
    },
    { 
      id: 'review-projects', 
      title: language === 'es' ? 'Revisar Proyectos' : 'Review Projects', 
      icon: <Folder className="w-6 h-6" />,
      desc: language === 'es' ? 'Asegúrate de que cada proyecto tenga al menos una Acción Siguiente.' : 'Ensure every project has at least one Next Action.'
    },
    { 
      id: 'review-someday', 
      title: language === 'es' ? 'Revisar Algún día' : 'Review Someday', 
      icon: <Clock className="w-6 h-6" />,
      desc: language === 'es' ? '¿Hay algo que quieras activar ahora? ¿O algo que debas borrar?' : 'Anything you want to activate now? Or anything to delete?'
    },
    { 
      id: 'review-calendar', 
      title: language === 'es' ? 'Revisar Calendario' : 'Review Calendar', 
      icon: <Calendar className="w-6 h-6" />,
      desc: language === 'es' ? 'Revisa tus compromisos para la próxima semana.' : 'Review your commitments for the coming week.'
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in duration-500">
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-3 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="max-w-4xl w-full space-y-12">
        <div className="flex justify-center gap-4 mb-12">
          {steps.map((s, i) => (
            <div 
              key={s.id}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                step === i ? "w-12 bg-pomo" : i < step ? "w-6 bg-emerald-500" : "w-6 bg-slate-800"
              )}
            />
          ))}
        </div>

        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="w-20 h-20 bg-pomo/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-pomo/20">
            {React.cloneElement(currentStep.icon as React.ReactElement<any>, { className: "w-10 h-10 text-pomo" })}
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">{currentStep.title}</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">{currentStep.desc}</p>
        </div>

        <div className="flex justify-center gap-6 pt-12">
          {step > 0 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> {language === 'es' ? 'Anterior' : 'Previous'}
            </button>
          )}
          
          {step < steps.length - 1 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="px-12 py-4 bg-pomo text-white rounded-2xl font-bold shadow-2xl shadow-pomo/20 hover:bg-pomo-dark hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {language === 'es' ? 'Siguiente' : 'Next'} <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={onClose}
              className="px-12 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-2xl shadow-emerald-900/20 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {language === 'es' ? 'Finalizar Ritual' : 'Finish Ritual'} <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="absolute bottom-12 left-12 flex items-center gap-3">
        <div className="w-10 h-10 bg-pomo rounded-xl flex items-center justify-center text-white font-black">P</div>
        <div className="text-left">
          <p className="text-white font-bold text-sm">PomoDeep</p>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">{language === 'es' ? 'Ritual de Revisión' : 'Review Ritual'}</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReview;
