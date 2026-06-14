
import React, { useState, useRef, useEffect } from 'react';
import { InboxItem, Category, Project } from '../types';
import { calculateDaysAgo, cn, generateId } from '../utils';

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
import { 
    Trash2, CheckCircle, Play, Clock, Zap, CircleCheckBig, Edit3, Calendar, Bell, X, Plus, ChevronDown, Check, ChevronRight, Folder, Archive as ArchiveIcon, Inbox as InboxIcon, Tag
} from 'lucide-react';

interface InboxProps {
  items: InboxItem[];
  onAction: (id: string, action: 'complete' | 'delete' | 'schedule' | 'nextAction' | 'update' | 'calendar' | 'archive' | 'someday' | 'create-folder' | 'create-project', payload?: any) => void;
  categories?: Category[];
  onStartSession: (taskId: string) => void;
  onSaveNote: (content: string, categoryId?: string, title?: string) => string;
  language?: 'en' | 'es';
  onAddCategory?: (cat: Category) => void;
  projects?: Project[];
  initialTab?: 'inbox' | 'projects' | 'someday';
}

const CATEGORY_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 
  'bg-emerald-500', 'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 
  'bg-purple-500', 'bg-pink-500', 'bg-rose-500', 'bg-slate-500'
];

const Inbox: React.FC<InboxProps> = ({ items, onAction, categories = [], onStartSession, onSaveNote, language = 'es', onAddCategory, projects = [], initialTab }) => {
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'delete' | 'resolve' | 'archive' } | null>(null);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'inbox' | 'projects' | 'someday'>(initialTab || 'inbox');
  
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);
  
  const [isNewTaskFormOpen, setIsNewTaskFormOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);

  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState<string | null>(null); // projectId
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(CATEGORY_COLORS[0]);
  
  const [quickAddText, setQuickAddText] = useState('');
  
  const [confetti, setConfetti] = useState<{id: number, x: number, y: number, color: string}[]>([]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      title: 'Bandeja de entrada',
      newTask: 'New focus ⚡',
      all: 'Todas',
      noTag: 'Sin Área',
      today: 'Hoy',
      ago: 'Hace',
      days: 'd',
      noTasks: 'No hay tareas activas.',
      detailTitle: 'Detalle de Tarea',
      fieldTitle: 'Título',
      scheduleTitle: 'Agendar Alerta (Focus Time)',
      scheduleBtn: 'Agendar',
      contentTitle: 'Contenido (Sólo lectura)',
      noContent: 'Sin contenido adicional.',
      focusNow: 'Enfoque Ahora',
      continue: 'Continuar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      confirmTitle: '¿Confirmar Acción?',
      archiveText: 'Se archivará la tarea como completada.',
      deleteText: 'Se eliminará permanentemente.',
      taskPlaceholder: 'Título del nuevo Focus...',
      createNewCat: 'Crear nueva área',
      catName: 'Nombre del área',
      catColor: 'Color',
      selectExisting: 'Seleccionar existente',
      category: 'Área',
      areaDescription: 'Estas categorías representan las áreas principales de tu vida.',
      projects: 'Proyectos',
      someday: 'Algún día / Tal vez',
      inbox: 'Bandeja de entrada',
      noSomeday: 'No hay elementos en Algún día.',
      noProjects: 'No hay proyectos activos.',
      archive: 'Archivar',
      moveToProject: 'Mover a Proyecto',
      moveToSomeday: 'Mover a Algún día'
    },
    en: {
      title: 'Inbox',
      newTask: 'New focus ⚡',
      all: 'All',
      noTag: 'No Tag',
      today: 'Today',
      ago: 'Ago',
      days: 'd',
      noTasks: 'No active tasks.',
      detailTitle: 'Task Detail',
      fieldTitle: 'Title',
      scheduleTitle: 'Schedule Alert (Focus Time)',
      scheduleBtn: 'Schedule',
      contentTitle: 'Content (Read-only)',
      noContent: 'No additional content.',
      focusNow: 'Focus Now',
      continue: 'Continue',
      cancel: 'Cancel',
      confirm: 'Confirm',
      confirmTitle: 'Confirm Action?',
      archiveText: 'The task will be archived as completed.',
      deleteText: 'It will be permanently deleted.',
      taskPlaceholder: 'New Focus Title...',
      createNewCat: 'Create new category',
      catName: 'Category Name',
      catColor: 'Color',
      selectExisting: 'Select existing',
      category: 'Category',
      projects: 'Projects',
      someday: 'Someday / Maybe',
      inbox: 'Inbox',
      noSomeday: 'No items in Someday.',
      noProjects: 'No active projects.',
      archive: 'Archive',
      moveToProject: 'Move to Project',
      moveToSomeday: 'Move to Someday'
    }
  }[language];

  const triggerConfetti = (e: React.MouseEvent) => {
      const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
      const newConfetti = Array.from({ length: 20 }).map((_, i) => ({
          id: Date.now() + i, x: e.clientX, y: e.clientY,
          color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setConfetti(prev => [...prev, ...newConfetti]);
      setTimeout(() => setConfetti(prev => prev.filter(c => !newConfetti.find(n => n.id === c.id))), 1000);
  };

  const filteredItems = items.filter(item => {
    const isNote = item.type === 'note' && item.status !== 'completed' && !item.isArchived;
    const matchesCategory = !selectedFilterCategory || item.categoryId === selectedFilterCategory;
    
    if (activeTab === 'inbox') {
      return isNote && matchesCategory && !item.isProcessed && !item.isSomedayMaybe && !item.projectId;
    } else if (activeTab === 'someday') {
      return isNote && matchesCategory && item.isSomedayMaybe;
    } else if (activeTab === 'projects') {
      return isNote && matchesCategory && !!item.projectId;
    }
    
    return isNote && matchesCategory;
  });

  const getCategoryColor = (id?: string) => categories?.find(c => c.id === id)?.color || 'bg-slate-200 dark:bg-slate-700';
  const getCategoryName = (id?: string) => categories?.find(c => c.id === id)?.name || t.noTag;

  const handleUpdateItem = (updates: Partial<InboxItem>) => {
      if (selectedItem) {
          onAction(selectedItem.id, 'update', updates);
          setSelectedItem(prev => prev ? { ...prev, ...updates } : null);
      }
  };

  const handleCreateAndStartFocus = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTaskTitle.trim()) return;

      let finalCategoryId = newTaskCategory;

      if (isCreatingNewCategory && newCategoryName.trim() && onAddCategory) {
          const newCat: Category = {
            id: generateId(),
            name: newCategoryName.trim(),
            color: newCategoryColor
          };
          onAddCategory(newCat);
          finalCategoryId = newCat.id;
      }

      const defaultContent = language === 'es' ? "Acción Siguiente\n[ ] \n[ ] \n[ ] \n\n---\n\n" : "Next Action\n[ ] \n[ ] \n[ ] \n\n---\n\n";
      const newId = onSaveNote(defaultContent, finalCategoryId || undefined, newTaskTitle);
      
      onStartSession(newId);
      
      // Reset form
      setIsNewTaskFormOpen(false);
      setNewTaskTitle('');
      setNewTaskCategory('');
      setIsCreatingNewCategory(false);
      setNewCategoryName('');
  };

  const getStatusBadgeClass = (status: string) => {
      switch(status) {
          case 'in-progress': return 'text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900';
          case 'scheduled': return 'text-blue-500 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900';
          default: return 'text-slate-500 bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700';
      }
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderCard = (item: InboxItem) => {
      const daysAgo = calculateDaysAgo(item.createdAt);
      return (
        <div 
            key={item.id} 
            onClick={() => activeTab !== 'someday' && onStartSession(item.id)}
            className={cn(
                "group relative bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 cursor-pointer overflow-hidden",
                item.status === 'completed' && "opacity-60 grayscale"
            )}
        >
            <div className="flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-4 min-w-0">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:rotate-3", item.categoryId ? categories.find(c => c.id === item.categoryId)?.color || 'bg-slate-100' : 'bg-slate-100 dark:bg-slate-800')}>
                        {item.type === 'note' ? <Zap className="w-6 h-6 text-slate-400" /> : <CheckCircle className="w-6 h-6 text-slate-400" />}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 dark:text-white truncate group-hover:text-pomo transition-colors">{item.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {daysAgo === 0 ? t.today : `${t.ago} ${daysAgo}${t.days}`}
                            </span>
                            {item.pausedTime !== undefined && (
                                <span className="text-pomo flex items-center gap-1 font-black">
                                    <Clock className="w-3 h-3" /> {language === 'es' ? 'Sesión' : 'Session'} {item.currentSessionNumber || 1} • {formatTime(item.pausedTime)}
                                </span>
                            )}
                            {item.scheduledDate && (
                                <span className="text-blue-500 flex items-center gap-1">
                                    <Bell className="w-3 h-3" /> {new Date(item.scheduledDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { day: 'numeric', month: 'short' })}
                                </span>
                            )}
                        </div>
                    </div>
                 </div>

                 <div className="flex gap-1 ml-4 shrink-0">
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation();
                            setSelectedItem(item); 
                            setScheduleDate(item.scheduledDate ? new Date(item.scheduledDate).toISOString().split('T')[0] : ''); 
                        }} 
                        className="p-2 text-slate-400 hover:text-pomo hover:bg-slate-50 rounded-lg transition-all dark:hover:bg-slate-800"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
            </div>
        </div>
      );
  };

  const selectedCategoryData = categories.find(c => c.id === newTaskCategory);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 relative">
      <div className="fixed inset-0 pointer-events-none z-[100]">
          {confetti.map(c => (
              <div key={c.id} className="absolute w-2 h-2 rounded-full animate-ping" style={{ left: c.x, top: c.y, backgroundColor: c.color }} />
          ))}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {activeTab === 'inbox' ? t.inbox : activeTab === 'projects' ? t.projects : t.someday}
            </h2>
            {!initialTab && (
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('inbox')}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                            activeTab === 'inbox' ? "bg-white dark:bg-slate-700 text-pomo shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        )}
                    >
                        <InboxIcon className="w-3.5 h-3.5" /> {t.inbox}
                    </button>
                    <button 
                        onClick={() => setActiveTab('projects')}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                            activeTab === 'projects' ? "bg-white dark:bg-slate-700 text-pomo shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        )}
                    >
                        <Folder className="w-3.5 h-3.5" /> {t.projects}
                    </button>
                    <button 
                        onClick={() => setActiveTab('someday')}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                            activeTab === 'someday' ? "bg-white dark:bg-slate-700 text-pomo shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        )}
                    >
                        <Clock className="w-3.5 h-3.5" /> {t.someday}
                    </button>
                </div>
            )}
        </div>
        <div className="flex items-center gap-3">
             <div className="relative" ref={filterRef}>
                <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={cn(
                        "p-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border",
                        selectedFilterCategory ? "bg-pomo/10 border-pomo/20 text-pomo" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500"
                    )}
                >
                    <Tag className="w-4 h-4" />
                    <span className="hidden sm:inline">{selectedFilterCategory ? categories.find(c => c.id === selectedFilterCategory)?.name : (language === 'es' ? 'Filtrar' : 'Filter')}</span>
                </button>
                {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => { setSelectedFilterCategory(''); setIsFilterOpen(false); }}
                            className={cn("w-full text-left px-4 py-2 rounded-lg text-xs font-bold transition-colors", !selectedFilterCategory ? "bg-slate-100 dark:bg-slate-800 text-pomo" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800")}
                        >
                            {t.all}
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id}
                                onClick={() => { setSelectedFilterCategory(cat.id); setIsFilterOpen(false); }}
                                className={cn("w-full text-left px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2", selectedFilterCategory === cat.id ? "bg-slate-100 dark:bg-slate-800 text-pomo" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800")}
                            >
                                <div className={cn("w-2 h-2 rounded-full", cat.color)} />
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}
             </div>
             <button onClick={() => setIsNewTaskFormOpen(!isNewTaskFormOpen)} className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all bg-pomo text-white shadow-lg shadow-pomo/20 hover:scale-105 active:scale-95">
               {isNewTaskFormOpen ? <X className="w-4 h-4" /> : null}
               {t.newTask}
             </button>
        </div>
      </div>

      {isNewTaskFormOpen && (
          <form onSubmit={handleCreateAndStartFocus} className="mb-8 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-6">
                  <div>
                    <input 
                      type="text" 
                      autoFocus 
                      value={newTaskTitle} 
                      onChange={(e) => setNewTaskTitle(e.target.value)} 
                      placeholder={t.taskPlaceholder} 
                      className="w-full bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl text-xl font-bold outline-none border border-transparent focus:border-pomo/30 transition-all dark:text-white" 
                    />
                  </div>

                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isCreatingNewCategory ? t.createNewCat : t.category}</label>
                            <span className="text-[10px] text-slate-400 italic mt-1">{t.areaDescription}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            setIsCreatingNewCategory(!isCreatingNewCategory);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className="text-[10px] font-bold text-pomo uppercase tracking-wider flex items-center gap-1 hover:underline"
                        >
                          {isCreatingNewCategory ? (
                            <>Ver existentes <ChevronRight className="w-3 h-3" /></>
                          ) : (
                            <><Plus className="w-3 h-3" /> Crear nueva</>
                          )}
                        </button>
                    </div>

                    {!isCreatingNewCategory ? (
                      <div className="relative" ref={dropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                          className="w-full bg-white dark:bg-slate-800 p-3 rounded-xl text-sm font-bold flex items-center justify-between border border-slate-200 dark:border-slate-700 dark:text-white transition-all hover:border-pomo/30"
                        >
                          <div className="flex items-center gap-2">
                             <div className={cn("w-3 h-3 rounded-full", selectedCategoryData?.color || 'bg-slate-300')} />
                             <span>{selectedCategoryData?.name || t.noTag}</span>
                          </div>
                          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isCategoryDropdownOpen && "rotate-180")} />
                        </button>
                        
                        {isCategoryDropdownOpen && (
                          <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl shadow-2xl z-[110] max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2">
                             <div className="p-1">
                                <button
                                  type="button"
                                  onClick={() => { setNewTaskCategory(''); setIsCategoryDropdownOpen(false); }}
                                  className={cn("w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors", !newTaskCategory ? "bg-slate-100 dark:bg-slate-800 text-pomo" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800")}
                                >
                                  <div className="flex items-center gap-2">
                                     <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                     {t.noTag}
                                  </div>
                                  {!newTaskCategory && <Check className="w-3.5 h-3.5" />}
                                </button>
                                {categories.map(cat => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => { setNewTaskCategory(cat.id); setIsCategoryDropdownOpen(false); }}
                                    className={cn("w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors", newTaskCategory === cat.id ? "bg-slate-100 dark:bg-slate-800 text-pomo" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800")}
                                  >
                                    <div className="flex items-center gap-2">
                                       <div className={cn("w-2.5 h-2.5 rounded-full", cat.color)} />
                                       {cat.name}
                                    </div>
                                    {newTaskCategory === cat.id && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                ))}
                             </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in duration-300">
                          <input 
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder={t.catName}
                            className="w-full bg-white dark:bg-slate-800 p-3 rounded-xl text-sm font-bold outline-none border border-slate-200 dark:border-slate-700 dark:text-white focus:border-pomo/30"
                          />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{t.catColor}</p>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORY_COLORS.map(color => (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewCategoryColor(color)}
                                    className={cn(
                                      "w-6 h-6 rounded-full transition-all hover:scale-125",
                                      color,
                                      newCategoryColor === color ? "ring-2 ring-offset-2 ring-pomo scale-110 shadow-lg" : "opacity-80"
                                    )}
                                  />
                                ))}
                            </div>
                          </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button 
                        type="button" 
                        onClick={() => setIsNewTaskFormOpen(false)} 
                        className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        type="submit" 
                        disabled={!newTaskTitle.trim() || (isCreatingNewCategory && !newCategoryName.trim())} 
                        className="bg-pomo text-white px-8 py-3 rounded-2xl shadow-xl shadow-pomo/20 font-bold hover:bg-pomo-dark disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current" /> {t.focusNow}
                      </button>
                  </div>
              </div>
          </form>
      )}

      {activeTab === 'inbox' && (
          <div className="mb-8 group">
              <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Plus className="w-5 h-5 text-slate-400 group-focus-within:text-pomo transition-colors" />
                  </div>
                  <input 
                      type="text"
                      value={quickAddText}
                      onChange={(e) => setQuickAddText(e.target.value)}
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && quickAddText.trim()) {
                              onSaveNote(quickAddText);
                              setQuickAddText('');
                          }
                      }}
                      placeholder={language === 'es' ? 'Recopilar: ¿Qué tienes en mente?' : 'Collect: What\'s on your mind?'}
                      className="w-full bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-pomo/30 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm font-medium dark:text-white"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden sm:block">Press Enter</span>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'projects' && (
          <div className="flex justify-end mb-6">
              <button 
                  onClick={() => setIsCreatingProject(true)}
                  className="bg-slate-900 text-white dark:bg-white dark:text-black px-6 py-2 rounded-full text-xs font-bold hover:scale-105 transition-all flex items-center gap-2"
              >
                  <Plus className="w-4 h-4" /> {language === 'es' ? 'Nuevo Proyecto' : 'New Project'}
              </button>
          </div>
      )}

      <div className="grid gap-3">
          {activeTab === 'projects' ? (
              projects.length === 0 ? (
                  <p className="text-center py-16 text-slate-400 italic">{t.noProjects}</p>
              ) : (
                  projects.map(project => {
                      const projectItems = items.filter(i => i.projectId === project.id && !i.isArchived);
                      const rootItems = projectItems.filter(i => !i.folderId);
                      const folders = project.folders || [];
                      
                      return (
                          <div key={project.id} className="space-y-4 mb-8 bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                              <div className="flex items-center justify-between px-2">
                                  <div className="flex items-center gap-3">
                                      <div className={cn("w-4 h-4 rounded-full shadow-lg", project.color)} />
                                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{project.name}</h3>
                                  </div>
                                  <button 
                                      onClick={() => setIsCreatingFolder(project.id)}
                                      className="text-[10px] font-bold text-pomo uppercase tracking-wider hover:underline flex items-center gap-1"
                                  >
                                      <Plus className="w-3 h-3" /> {language === 'es' ? 'Nueva Carpeta' : 'New Folder'}
                                  </button>
                              </div>
                              
                              <div className="space-y-3">
                                  {rootItems.length === 0 && folders.length === 0 && (
                                      <p className="text-[10px] text-slate-400 italic ml-2">{language === 'es' ? 'Proyecto vacío' : 'Empty project'}</p>
                                  )}
                                  
                                  {rootItems.map(renderCard)}
                                  
                                  {folders.map(folder => {
                                      const folderItems = projectItems.filter(i => i.folderId === folder.id);
                                      return (
                                          <div key={folder.id} className="ml-4 space-y-3">
                                              <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                                                  <Folder className="w-3 h-3 text-slate-400" />
                                                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{folder.name}</span>
                                              </div>
                                              {folderItems.length === 0 ? (
                                                  <p className="text-[10px] text-slate-400 italic ml-4">{language === 'es' ? 'Carpeta vacía' : 'Empty folder'}</p>
                                              ) : (
                                                  <div className="ml-2 space-y-3 border-l-2 border-slate-100 dark:border-slate-800 pl-4">
                                                      {folderItems.map(renderCard)}
                                                  </div>
                                              )}
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      );
                  })
              )
          ) : filteredItems.length === 0 ? (
              <p className="text-center py-16 text-slate-400 italic">
                  {activeTab === 'inbox' ? t.noTasks : t.noSomeday}
              </p>
          ) : (
              filteredItems.map(renderCard)
          )}
      </div>
      
      {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
              <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl p-6 border dark:border-slate-800 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                   <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Edit3 className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t.detailTitle}</span>
                        </div>
                        <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="w-5 h-5" /></button>
                   </div>
                   
                   <div className="space-y-6">
                       <section>
                           <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t.fieldTitle}</label>
                           <input 
                                value={selectedItem.title} 
                                onChange={(e) => handleUpdateItem({ title: e.target.value })} 
                                className="text-lg font-bold dark:text-white w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-transparent focus:border-pomo/30 outline-none" 
                           />
                       </section>

                       <section>
                           <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t.scheduleTitle}</label>
                           <div className="flex gap-2">
                               <input 
                                    type="date"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-sm font-bold border border-transparent focus:border-blue-500/30 outline-none dark:text-white"
                               />
                               <button 
                                 onClick={() => {
                                     if (scheduleDate) {
                                         onAction(selectedItem.id, 'schedule', { date: new Date(scheduleDate) });
                                         setSelectedItem(null);
                                     }
                                 }}
                                 disabled={!scheduleDate}
                                 className="px-6 bg-blue-600 text-white rounded-xl font-bold text-xs disabled:opacity-50 hover:bg-blue-700 transition-colors"
                               >
                                   {t.scheduleBtn}
                               </button>
                           </div>
                           <button 
                             onClick={() => onAction(selectedItem.id, 'calendar')}
                             className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                           >
                               <Calendar className="w-4 h-4 text-blue-500" />
                               {language === 'es' ? 'Agendar en Google Calendar' : 'Schedule on Google Calendar'}
                           </button>
                       </section>

                       <div className="pt-4 flex flex-wrap gap-3">
                           {activeTab !== 'someday' && (
                               <button onClick={() => { onStartSession(selectedItem.id); setSelectedItem(null); }} className="flex-1 bg-pomo text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 min-w-[140px]"><Play className="w-4 h-4 fill-current" /> {t.continue}</button>
                           )}
                           <button onClick={() => setConfirmAction({ id: selectedItem.id, type: 'archive' })} className="flex-1 bg-slate-100 dark:bg-slate-800 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 min-w-[140px]"><ArchiveIcon className="w-4 h-4" /> {t.archive}</button>
                           <button onClick={() => setConfirmAction({ id: selectedItem.id, type: 'delete' })} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                           <button onClick={() => setConfirmAction({ id: selectedItem.id, type: 'resolve' })} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-green-500 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                           <button 
                                onClick={() => { onAction(selectedItem.id, 'someday'); setSelectedItem(null); }}
                                className="flex items-center justify-center gap-2 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold border border-amber-100 dark:border-amber-900 hover:bg-amber-100 transition-all"
                           >
                               <Clock className="w-4 h-4" /> {t.moveToSomeday}
                           </button>
                           <div className="relative group">
                               <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-900 hover:bg-blue-100 transition-all">
                                   <Folder className="w-4 h-4" /> {t.moveToProject}
                               </button>
                               <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1 hidden group-hover:block z-[110] max-h-48 overflow-y-auto">
                                   {projects.map(p => (
                                       <div key={p.id} className="space-y-1">
                                           <button 
                                               onClick={() => { onAction(selectedItem.id, 'update', { projectId: p.id, folderId: undefined, isSomedayMaybe: false, isProcessed: true }); setSelectedItem(null); }}
                                               className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                                           >
                                               <div className={cn("w-2 h-2 rounded-full", p.color)} />
                                               {p.name}
                                           </button>
                                           {p.folders?.map(f => (
                                               <button 
                                                   key={f.id}
                                                   onClick={() => { onAction(selectedItem.id, 'update', { projectId: p.id, folderId: f.id, isSomedayMaybe: false, isProcessed: true }); setSelectedItem(null); }}
                                                   className="w-full text-left px-6 py-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                                               >
                                                   <Folder className="w-2.5 h-2.5" />
                                                   {f.name}
                                               </button>
                                           ))}
                                       </div>
                                   ))}
                               </div>
                           </div>
                       </div>
                   </div>
              </div>
          </div>
      )}

      {isCreatingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreatingProject(false)} />
              <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-8 border dark:border-slate-800 animate-in fade-in zoom-in-95">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tight">{language === 'es' ? 'Nuevo Proyecto' : 'New Project'}</h3>
                  <div className="space-y-6">
                      <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{language === 'es' ? 'Nombre' : 'Name'}</label>
                          <input 
                              autoFocus
                              value={newProjectName}
                              onChange={(e) => setNewProjectName(e.target.value)}
                              placeholder={language === 'es' ? 'Nombre del proyecto...' : 'Project name...'}
                              className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 outline-none focus:border-pomo transition-all dark:text-white font-bold"
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{language === 'es' ? 'Color' : 'Color'}</label>
                          <div className="grid grid-cols-6 gap-2">
                              {CATEGORY_COLORS.map(color => (
                                  <button 
                                      key={color}
                                      onClick={() => setNewProjectColor(color)}
                                      className={cn(
                                          "w-full aspect-square rounded-lg transition-all",
                                          color,
                                          newProjectColor === color ? "ring-2 ring-offset-2 ring-slate-400 scale-90" : "hover:scale-105"
                                      )}
                                  />
                              ))}
                          </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                          <button onClick={() => setIsCreatingProject(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">{language === 'es' ? 'Cancelar' : 'Cancel'}</button>
                          <button 
                              onClick={() => {
                                  if (newProjectName.trim()) {
                                      onAction('', 'create-project', { name: newProjectName, color: newProjectColor });
                                      setNewProjectName('');
                                      setIsCreatingProject(false);
                                  }
                              }}
                              disabled={!newProjectName.trim()}
                              className="flex-1 py-4 bg-pomo text-white rounded-2xl font-bold shadow-xl shadow-pomo/20 hover:bg-pomo-dark disabled:opacity-50 transition-all"
                          >
                              {language === 'es' ? 'Crear Proyecto' : 'Create Project'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {isCreatingFolder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreatingFolder(null)} />
              <div className="relative bg-white dark:bg-slate-900 w-full max-w-xs rounded-2xl p-6 shadow-2xl border dark:border-slate-800 animate-in fade-in zoom-in-95">
                  <h3 className="text-lg font-bold dark:text-white mb-4">{language === 'es' ? 'Nueva Carpeta' : 'New Folder'}</h3>
                  <input 
                    type="text" 
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder={language === 'es' ? 'Nombre de la carpeta...' : 'Folder name...'}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-sm font-bold border border-transparent focus:border-pomo/30 outline-none dark:text-white mb-6"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setIsCreatingFolder(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium dark:text-slate-300">{t.cancel}</button>
                    <button 
                        onClick={() => { 
                            if (newFolderName.trim()) {
                                onAction('', 'create-folder', { name: newFolderName.trim(), projectId: isCreatingFolder });
                                setIsCreatingFolder(null);
                                setNewFolderName('');
                            }
                        }} 
                        disabled={!newFolderName.trim()}
                        className="flex-1 py-2.5 rounded-xl bg-pomo text-white font-medium shadow-lg disabled:opacity-50"
                    >
                        {t.confirm}
                    </button>
                  </div>
              </div>
          </div>
      )}

      {confirmAction && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
              <div className="relative bg-white dark:bg-slate-900 w-full max-w-xs rounded-2xl p-6 text-center shadow-2xl border dark:border-slate-800 animate-in fade-in zoom-in-95">
                  <h3 className="text-lg font-bold dark:text-white mb-2">{t.confirmTitle}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                      {confirmAction.type === 'resolve' ? t.archiveText : confirmAction.type === 'archive' ? t.archiveText : t.deleteText}
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium dark:text-slate-300">{t.cancel}</button>
                    <button onClick={(e) => { 
                        if(confirmAction.type === 'resolve' || confirmAction.type === 'archive') {
                            triggerConfetti(e);
                            onAction(confirmAction.id, 'archive');
                        } else {
                            onAction(confirmAction.id, 'delete');
                        }
                        setConfirmAction(null); 
                    }} className={cn("flex-1 py-2.5 rounded-xl text-white font-medium shadow-lg", (confirmAction.type === 'resolve' || confirmAction.type === 'archive') ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700")}>{t.confirm}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Inbox;
