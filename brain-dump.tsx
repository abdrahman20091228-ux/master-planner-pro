'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Check, X, Lightbulb, Clock } from 'lucide-react';
import { useApp } from './app-context';
import { Note } from '@/lib/types';

export function BrainDump() {
  const { data, t, updateData } = useApp();
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newNote]);

  const addNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    updateData({ notes: [note, ...data.notes] });
    setNewNote('');
  };

  const deleteNote = (noteId: string) => {
    updateData({ notes: data.notes.filter(n => n.id !== noteId) });
  };

  const startEdit = (note: Note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const saveEdit = (noteId: string) => {
    if (!editContent.trim()) return;

    updateData({
      notes: data.notes.map(n =>
        n.id === noteId
          ? { ...n, content: editContent.trim(), updatedAt: Date.now() }
          : n
      ),
    });
    setEditingNote(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const isArabic = data.settings.language === 'ar';
    return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t.brainDump}</h1>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary">
          <Lightbulb className="w-5 h-5" />
          <span className="text-base font-semibold">{data.notes.length}</span>
        </div>
      </div>

      {/* Add note input */}
      <div className="glass rounded-xl p-4">
        <textarea
          ref={textareaRef}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              addNote();
            }
          }}
          placeholder={t.addNote}
          rows={3}
          className="w-full px-4 py-3.5 rounded-lg bg-background/50 text-foreground text-base placeholder:text-muted-foreground focus:outline-none resize-none min-h-[100px]"
        />
        <div className="flex justify-end mt-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={addNote}
            disabled={!newNote.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            {t.addNote.split('...')[0]}
          </motion.button>
        </div>
      </div>

      {/* Notes grid */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {data.notes.map((note, index) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl overflow-hidden"
            >
              {editingNote === note.id ? (
                <div className="p-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-background/50 text-foreground text-base focus:outline-none resize-none min-h-[120px]"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => setEditingNote(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground font-medium"
                    >
                      <X className="w-5 h-5" />
                      {t.cancel}
                    </button>
                    <button
                      onClick={() => saveEdit(note.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-success-foreground font-medium"
                    >
                      <Check className="w-5 h-5" />
                      {t.save}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <p className="text-foreground text-base whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDate(note.updatedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(note)}
                        className="p-2.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-2.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {data.notes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-12 text-muted-foreground"
          >
            <Lightbulb className="w-14 h-14 opacity-50" />
            <p className="text-lg">{t.noNotes}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
