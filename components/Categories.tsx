
import React, { useState } from 'react';
import { Category, InboxItem } from '../types';
import { Plus, Trash2, Tag, ArrowLeft, Clock } from 'lucide-react';
import { generateId, cn } from '../utils';

interface CategoriesProps {
  categories: Category[];
  onAdd: (category: Category) => void;
  onDelete: (id: string) => void;
  inboxItems: InboxItem[];
  language?: 'en' | 'es';
}

const COLORS = [
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Amber', value: 'bg-amber-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Emerald', value: 'bg-emerald-500' },
  { name: 'Teal', value: 'bg-teal-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Violet', value: 'bg-violet-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Fuchsia', value: 'bg-fuchsia-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Rose', value: 'bg-rose-500' },
  { name: 'Slate', value: 'bg-slate-500' },
];

const Categories: React.FC<CategoriesProps> = ({ categories, onAdd, onDelete, inboxItems, language = 'es' }) => {
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const t = {
    es: {
      title: 'Centro de Categorías',
      subtitle: 'Gestiona etiquetas y profundiza en contextos específicos.',
      existing: 'Etiquetas Existentes',
      noCategories: 'No hay categorías definidas aún.',
      newCategory: 'Nueva Categoría',
      labelName: 'Nombre de la Etiqueta',
      visualColor: 'Color Visual',
      createBtn: 'Crear Categoría',
      placeholder: 'Ej. Trabajo, Proyecto X, Lectura...',
      noActiveTasks: 'No hay tareas activas en esta categoría.',
      items: 'items',
      delete: 'Eliminar'
    },
    en: {
      title: 'Category Center',
      subtitle: 'Manage tags and deep dive into specific contexts.',
      existing: 'Existing Tags',
      noCategories: 'No categories defined yet.',
      newCategory: 'New Category',
      labelName: 'Tag Name',
      visualColor: 'Visual Color',
      createBtn: 'Create Category',
      placeholder: 'e.g. Work, Project X, Reading...',
      noActiveTasks: 'No active tasks in this category.',
      items: 'items',
      delete: 'Delete'
    }
  }[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAdd({
      id: generateId(),
      name: newName.trim(),
      color: selectedColor
    });
    setNewName('');
  };

  if (activeCategory) {
    const categoryItems = inboxItems.filter(item => item.categoryId === activeCategory.id && item.type === 'note' && item.status !== 'completed' && item.status !== 'scheduled');
    
    return (
      <div className="w-full max-w-2xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-right-8 text-center">
        <div className="mb-8 flex items-center justify-center gap-4">
           <button 
             onClick={() => setActiveCategory(null)}
             className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
           >
             <ArrowLeft className="w-6 h-6 text-slate-500" />
           </button>
           <div className="flex items-center gap-3">
              <div className={cn("w-6 h-6 rounded-full", activeCategory.color)} />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{activeCategory.name}</h2>
              <span className="text-slate-400 text-sm font-medium border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                {categoryItems.length} {t.items}
              </span>
           </div>
        </div>

        <div className="grid gap-4">
            {categoryItems.length === 0 && (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400">{t.noActiveTasks}</p>
                </div>
            )}
            {categoryItems.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between text-left">
                    <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{item.title}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                             <span className={cn("px-1.5 py-0.5 rounded border capitalize", 
                                item.status === 'in-progress' ? 'border-amber-200 text-amber-600 bg-amber-50' : 'border-slate-200'
                             )}>
                                {item.status.replace('-', ' ')}
                             </span>
                             {item.timeSpent ? (
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.timeSpent}m</span>
                             ) : null}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 animate-in fade-in flex flex-col items-center">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h2>
        <p className="text-slate-500 text-sm dark:text-slate-400 mt-2">{t.subtitle}</p>
      </div>

      <div className="w-full space-y-12">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold dark:text-white">{t.existing}</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {categories.length === 0 && (
               <p className="text-slate-400 text-sm italic text-center">{t.noCategories}</p>
            )}
            {categories.map((cat) => {
                const count = inboxItems.filter(i => i.categoryId === cat.id && i.status !== 'completed' && i.status !== 'scheduled' && i.type === 'note').length;
                return (
                    <div 
                        key={cat.id} 
                        onClick={() => setActiveCategory(cat)}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800 group cursor-pointer hover:border-pomo transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn("w-4 h-4 rounded-full ring-2 ring-offset-2 ring-transparent group-hover:ring-slate-200", cat.color)} />
                            <span className="font-bold text-slate-700 dark:text-slate-200">{cat.name}</span>
                            <span className="text-xs bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full dark:bg-slate-800">{count}</span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(cat.id); }}
                            className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                            title={t.delete}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 w-full">
          <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center justify-center gap-2">
            <Plus className="w-5 h-5 text-pomo" /> {t.newCategory}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.labelName}</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.placeholder}
                className="w-full bg-slate-50 border border-transparent rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-pomo/20 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{t.visualColor}</label>
              <div className="flex flex-wrap justify-center gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c.value)}
                    className={cn(
                      "w-7 h-7 rounded-full transition-all hover:scale-125",
                      c.value,
                      selectedColor === c.value ? "ring-2 ring-offset-2 ring-pomo scale-110 shadow-lg shadow-pomo/20" : "opacity-80"
                    )}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!newName.trim()}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg dark:bg-pomo dark:hover:bg-pomo-dark"
            >
              {t.createBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Categories;
