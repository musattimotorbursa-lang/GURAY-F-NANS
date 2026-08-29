import React, { useState } from 'react';
import { X, Tags, Plus, Trash2, Edit2, Check, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CustomCategory } from '../../types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CustomCategory[];
  onSaveCategories: (categories: CustomCategory[]) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  if (!isOpen) return null;

  const currentCategories = categories.filter(
    (c) => c.type === activeTab || c.type === 'both'
  );

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: CustomCategory = {
      id: `cat_custom_${Date.now()}`,
      name: newCatName.trim(),
      type: activeTab,
    };

    const updated = [...categories, newCat];
    onSaveCategories(updated);
    setNewCatName('');
  };

  const handleStartEdit = (cat: CustomCategory) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingCatName.trim()) return;
    const updated = categories.map((c) =>
      c.id === id ? { ...c, name: editingCatName.trim() } : c
    );
    onSaveCategories(updated);
    setEditingCatId(null);
    setEditingCatName('');
  };

  const handleDelete = (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    onSaveCategories(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl bg-[#111122] border border-purple-800/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 p-[1.5px]">
              <div className="w-full h-full bg-[#111122] rounded-[14px] flex items-center justify-center text-purple-300">
                <Tags className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Kategori Yönetimi
              </h3>
              <p className="text-xs text-slate-400">
                Gelir ve gider kategorilerini ekleyin, düzenleyin veya silin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="p-4 border-b border-slate-800 bg-[#0e0e1a]">
          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('expense')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'expense'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" /> Gider Kategorileri
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'income'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> Gelir Kategorileri
            </button>
          </div>

          {/* Add New Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2 mt-3">
            <input
              type="text"
              required
              placeholder={`Yeni ${activeTab === 'expense' ? 'gider' : 'gelir'} kategorisi adı...`}
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-950/50 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Ekle</span>
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {currentCategories.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">Bu grupta kategori bulunmuyor.</p>
          ) : (
            currentCategories.map((cat) => {
              const isEditing = editingCatId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-800 border border-purple-500 rounded-lg text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingCatId(null)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            cat.type === 'income' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-200">{cat.name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(cat)}
                          title="Düzenle"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-purple-300 hover:bg-slate-700 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          title="Sil"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
