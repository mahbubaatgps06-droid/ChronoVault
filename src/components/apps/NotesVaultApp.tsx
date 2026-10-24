import React, { useState } from 'react';
import { VaultNote } from '../../types';
import { storage } from '../../utils/storage';
import { playSound, triggerHaptic } from '../../utils/sound';
import { ArrowLeft, Plus, Search, Pin, Trash2, Edit3, Lock, Check } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const NotesVaultApp: React.FC<Props> = ({ onBack }) => {
  const [notes, setNotes] = useState<VaultNote[]>(() => storage.getNotes());
  const [search, setSearch] = useState('');
  const [activeNote, setActiveNote] = useState<VaultNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('Personal');

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartCreate = () => {
    setActiveNote(null);
    setEditTitle('');
    setEditContent('');
    setEditCategory('Secret');
    setIsEditing(true);
    playSound.keyPress();
  };

  const handleStartEdit = (note: VaultNote) => {
    setActiveNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategory(note.category);
    setIsEditing(true);
    playSound.keyPress();
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;

    if (activeNote) {
      // Update existing
      const updated = notes.map(n =>
        n.id === activeNote.id
          ? {
              ...n,
              title: editTitle.trim(),
              content: editContent,
              category: editCategory,
              dateModified: 'Just now',
            }
          : n
      );
      setNotes(updated);
      storage.setNotes(updated);
    } else {
      // Create new
      const newNote: VaultNote = {
        id: `note-${Date.now()}`,
        title: editTitle.trim(),
        content: editContent,
        category: editCategory,
        dateModified: 'Just now',
        isPinned: false,
      };
      const updated = [newNote, ...notes];
      setNotes(updated);
      storage.setNotes(updated);
    }

    setIsEditing(false);
    setActiveNote(null);
    playSound.keyPress();
    triggerHaptic(15);
  };

  const handleDelete = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    storage.setNotes(updated);
    if (activeNote?.id === id) {
      setActiveNote(null);
      setIsEditing(false);
    }
    playSound.lockClick();
  };

  const handleTogglePin = (id: string) => {
    const updated = notes.map(n =>
      n.id === id ? { ...n, isPinned: !n.isPinned } : n
    );
    setNotes(updated);
    storage.setNotes(updated);
    playSound.keyPress();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <button
          onClick={isEditing ? () => setIsEditing(false) : onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEditing ? 'Cancel' : 'Vault'}</span>
        </button>
        <div className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-white">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Vault Notes</span>
        </div>
        {isEditing ? (
          <button
            onClick={handleSave}
            disabled={!editTitle.trim()}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 transition-all active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        ) : (
          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        )}
      </div>

      {isEditing ? (
        /* Edit Note Mode */
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Note Title..."
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <select
              value={editCategory}
              onChange={e => setEditCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-amber-400 focus:outline-none"
            >
              <option value="Security">Security</option>
              <option value="Finance">Finance</option>
              <option value="Personal">Personal</option>
              <option value="Secret">Secret</option>
            </select>
          </div>
          <textarea
            rows={12}
            placeholder="Type confidential note content here..."
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className="w-full flex-1 bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono leading-relaxed resize-none"
          />
        </div>
      ) : (
        /* Notes List Mode */
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search secret notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {filteredNotes.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <p className="text-sm">No notes found</p>
              <p className="text-xs text-slate-600 mt-1">
                Tap 'New Note' to store encrypted information.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => handleStartEdit(note)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    note.isPinned
                      ? 'bg-amber-950/20 border-amber-900/50 hover:border-amber-700/60'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {note.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400 rotate-45" />
                      )}
                      <h4 className="text-sm font-semibold text-slate-100 truncate">
                        {note.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {note.category}
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleTogglePin(note.id);
                        }}
                        className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                        title="Toggle Pin"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(note.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 font-mono">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800/40">
                    <span>Modified {note.dateModified}</span>
                    <span className="text-amber-400/70">Encrypted</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
