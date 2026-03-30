/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  MapPin, 
  Map,
  ExternalLink, 
  Calendar, 
  Trash2, 
  Edit2, 
  X, 
  Check,
  ChevronRight,
  Car,
  Settings,
  ArrowLeft,
  Trophy,
  Smile
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Activity, Category } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES: Category[] = ['bezienswaardigheid', 'attractie', 'activiteit', 'idee'];

const CATEGORY_COLORS: Record<Category, string> = {
  bezienswaardigheid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  attractie: 'bg-blue-100 text-blue-800 border-blue-200',
  activiteit: 'bg-orange-100 text-orange-800 border-orange-200',
  idee: 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'alle'>('alle');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState<Activity | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBingo, setShowBingo] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [bingoItems, setBingoItems] = useState<{id: number, text: string, checked: boolean}[]>([]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "ditishetlaatstejaar") {
      setIsAdmin(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  const toggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowPasswordModal(true);
    }
  };

  const toggleBingoItem = async (id: number) => {
    const newItems = bingoItems.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setBingoItems(newItems);
    await saveBingo(newItems);
  };

  const saveBingo = async (items: any[]) => {
    try {
      await fetch('/api/bingo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
    } catch (error) {
      console.error("Failed to save bingo:", error);
    }
  };

  // Form state
  const [formData, setFormData] = useState<Partial<Activity>>({
    title: '',
    description: '',
    url: '',
    distance: 0,
    category: 'activiteit',
    image: '',
  });

  useEffect(() => {
    Promise.all([fetchActivities(), fetchBingo()]).finally(() => setLoading(false));
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities');
      const data = await res.json();
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const fetchBingo = async () => {
    try {
      const res = await fetch('/api/bingo');
      const data = await res.json();
      setBingoItems(data);
    } catch (error) {
      console.error('Failed to fetch bingo:', error);
    }
  };

  const filteredActivities = useMemo(() => {
    let result = [...activities];
    if (selectedCategory !== 'alle') {
      result = result.filter(a => a.category === selectedCategory);
    }
    return result.sort((a, b) => a.distance - b.distance);
  }, [activities, selectedCategory]);

  const estimateTravelTime = (distance: number) => {
    if (distance <= 2) return Math.round(distance * 2); // Very close
    if (distance <= 15) return Math.round(distance * 1.5); // Local roads
    return Math.round(distance * 1.2); // Faster roads
  };

  const getGoogleMapsUrl = (title: string) => {
    return `https://www.google.com/maps/dir/Summio+Villapark+Emslandermeer,+Vlagtwedde/${encodeURIComponent(title)}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `/api/activities/${isEditing.id}` : '/api/activities';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchActivities();
        setIsEditing(null);
        setIsAdding(false);
        setFormData({
          title: '',
          description: '',
          url: '',
          distance: 0,
          category: 'activiteit',
          image: '',
        });
      }
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit wilt verwijderen?')) return;
    try {
      const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
      if (res.ok) fetchActivities();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcf9] flex items-center justify-center">
        <div className="animate-pulse text-stone-400 font-serif italic">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf9] text-stone-900 font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="relative overflow-hidden pt-16 pb-12 px-6 border-b border-stone-200">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <span className="text-xs font-semibold tracking-widest uppercase text-stone-400">Paasweekend 2026</span>
              <h1 className="text-4xl md:text-7xl font-serif italic tracking-tight text-stone-900 leading-tight">
                Vlagtwedde <br />
                <span className="not-italic font-sans font-black uppercase text-orange-600">Weekend Planner</span>
              </h1>
            </motion.div>
            <div className="flex flex-wrap gap-2">
              <a 
                href="https://media.summio.nl/emslandermeer/index.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 md:px-4 md:py-2 bg-white border border-stone-200 rounded-full text-sm font-bold text-stone-900 hover:bg-stone-50 transition-all shadow-sm"
              >
                <Map className="w-4 h-4 text-orange-600" />
                Plattegrond
              </a>
              <button 
                onClick={() => setShowBingo(!showBingo)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 md:px-4 md:py-2 border rounded-full text-sm font-bold transition-all shadow-sm",
                  showBingo ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-stone-200 text-stone-900 hover:bg-stone-50"
                )}
                title="Familie Bingo"
              >
                <Trophy className="w-4 h-4" />
                Bingo
              </button>
              <button 
                onClick={toggleAdmin}
                className="p-3 md:p-2 rounded-full hover:bg-stone-100 transition-colors text-stone-400"
                title="Admin Mode"
              >
                <Settings className={cn("w-5 h-5", isAdmin && "text-orange-600")} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-8">
            <FilterButton 
              active={selectedCategory === 'alle'} 
              onClick={() => setSelectedCategory('alle')}
              label="Alles"
            />
            {CATEGORIES.map(cat => (
              <FilterButton 
                key={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
              />
            ))}
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-50/50 -skew-x-12 translate-x-1/2 pointer-events-none" />
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence>
          {showBingo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative">
                <div className="absolute top-6 right-8 opacity-10">
                  <Smile className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-3xl font-serif italic mb-2">Familie Weekend Bingo</h2>
                      <p className="text-stone-400 text-sm">Wie heeft als eerste een volle kaart? (Of een volle blaas van het lachen)</p>
                    </div>
                    <div className="bg-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                      {bingoItems.filter(i => i.checked).length} / {bingoItems.length}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {bingoItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleBingoItem(item.id)}
                        className={cn(
                          "p-4 rounded-2xl text-left text-sm transition-all duration-300 border-2 flex items-start gap-3",
                          item.checked 
                            ? "bg-orange-600 border-orange-600 text-white translate-y-1 shadow-inner" 
                            : "bg-stone-800 border-stone-700 text-stone-300 hover:border-stone-500"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5",
                          item.checked ? "bg-white border-white" : "border-stone-600"
                        )}>
                          {item.checked && <Check className="w-3 h-3 text-orange-600" />}
                        </div>
                        {item.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isAdmin && (
          <div className="space-y-8 mb-12">
            <div className="p-6 bg-white border border-stone-200 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif italic">Bingo Items Aanpassen</h2>
                <button 
                  onClick={() => {
                    const newItems = [...bingoItems, { id: Date.now(), text: 'Nieuw item', checked: false }];
                    setBingoItems(newItems);
                    saveBingo(newItems);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-all"
                >
                  <Plus className="w-4 h-4" /> Item Toevoegen
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bingoItems.map((item, idx) => (
                  <div key={item.id} className="flex gap-2">
                    <input 
                      type="text"
                      value={item.text}
                      onChange={e => {
                        const newItems = [...bingoItems];
                        newItems[idx].text = e.target.value;
                        setBingoItems(newItems);
                      }}
                      onBlur={() => saveBingo(bingoItems)}
                      className="flex-1 px-4 py-2 bg-stone-50 border border-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                    />
                    <button 
                      onClick={() => {
                        const newItems = bingoItems.filter(i => i.id !== item.id);
                        setBingoItems(newItems);
                        saveBingo(newItems);
                      }}
                      className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white border border-stone-200 rounded-3xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif italic">Admin Paneel</h2>
                {!isAdding && !isEditing && (
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full text-sm font-medium hover:bg-stone-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Nieuw Idee
                  </button>
                )}
              </div>

              {(isAdding || isEditing) && (
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-stone-400">Titel</label>
                      <input 
                        required
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Bijv. Dinopark Landgoed Tenaxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-stone-400">Afstand (km vanaf Summio)</label>
                      <input 
                        type="number"
                        required
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                        value={formData.distance}
                        onChange={e => setFormData({ ...formData, distance: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase text-stone-400">Beschrijving</label>
                      <textarea 
                        required
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors min-h-[100px]"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-stone-400">URL (Optioneel)</label>
                      <input 
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                        value={formData.url}
                        onChange={e => setFormData({ ...formData, url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-stone-400">Categorie</label>
                      <select 
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase text-stone-400">Afbeelding URL (Optioneel)</label>
                      <input 
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                        value={formData.image}
                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="submit"
                      className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
                    >
                      {isEditing ? 'Opslaan' : 'Toevoegen'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setIsAdding(false); setIsEditing(null); }}
                      className="px-6 py-3 border border-stone-200 rounded-xl font-bold hover:bg-stone-50 transition-colors"
                    >
                      Annuleren
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-white border border-stone-200 rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img 
                    src={activity.image || `https://picsum.photos/seed/${activity.id}/800/600`} 
                    alt={activity.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      CATEGORY_COLORS[activity.category]
                    )}>
                      {activity.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-stone-900 shadow-sm">
                      <MapPin className="w-3 h-3 text-orange-600" />
                      {activity.distance} km
                    </div>
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-stone-900 shadow-sm">
                      <Car className="w-3 h-3 text-blue-600" />
                      ± {estimateTravelTime(activity.distance)} min
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-serif italic text-stone-900">{activity.title}</h3>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setIsEditing(activity);
                            setFormData(activity);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-900 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(activity.id)}
                          className="p-2 hover:bg-red-50 rounded-full text-stone-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {activity.description}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    {activity.url && (
                      <a 
                        href={activity.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-bold text-stone-900 hover:text-orange-600 transition-colors group/link"
                      >
                        Bekijk Website
                        <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </a>
                    )}
                    <a 
                      href={getGoogleMapsUrl(activity.title)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-stone-900 hover:text-orange-600 transition-colors group/link"
                    >
                      Bekijk Route
                      <MapPin className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredActivities.length === 0 && (
          <div className="py-24 text-center">
            <div className="inline-flex p-6 bg-stone-50 rounded-full mb-4">
              <Car className="w-8 h-8 text-stone-300" />
            </div>
            <p className="text-stone-400 font-serif italic">Geen activiteiten gevonden in deze categorie.</p>
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-stone-100 text-center">
        <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">
          Summio Emslandermeer &bull; Vlagtwedde &bull; 2026
        </p>
      </footer>

      <AnimatePresence>
        {showPasswordModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full"
            >
              <h2 className="text-2xl font-serif italic mb-6 text-center">Admin Toegang</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <input 
                    type="password"
                    autoFocus
                    value={passwordInput}
                    onChange={e => {
                      setPasswordInput(e.target.value);
                      setPasswordError(false);
                    }}
                    placeholder="Wachtwoord..."
                    className={cn(
                      "w-full px-6 py-4 bg-stone-50 border rounded-2xl focus:outline-none focus:ring-2 transition-all text-center",
                      passwordError ? "border-red-500 focus:ring-red-100" : "border-stone-100 focus:ring-orange-100"
                    )}
                  />
                  {passwordError && (
                    <p className="text-xs text-red-500 text-center font-bold">Fout wachtwoord!</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-stone-400 hover:bg-stone-50 transition-all"
                  >
                    Annuleren
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
                  >
                    Inloggen
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 md:px-6 md:py-2.5 rounded-full text-sm font-bold transition-all duration-300 border",
        active 
          ? "bg-stone-900 border-stone-900 text-white shadow-lg shadow-stone-200" 
          : "bg-white border-stone-200 text-stone-500 hover:border-stone-400"
      )}
    >
      {label}
    </button>
  );
}
