
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Note } from '../../types';
import { auth, saveNote, getNotes, deleteNote, db } from '../../services/firebaseService';
import { generateText } from '../../services/geminiService';
import { BrainIcon, NoteIcon, PencilIcon, CheckIcon, XMarkIcon } from '../../constants';
import { Remarkable } from 'remarkable';
// FIX: Removed unused v9 imports that are incompatible with the v8 refactor.
// import { doc, collection } from 'firebase/firestore';

const md = new Remarkable({ html: false, breaks: true });

export const NoteCreator: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editorState, setEditorState] = useState<{ title: string; content: string; summary?: string } | null>(null);
    const [isLoading, setIsLoading] = useState({ save: false, summary: false, delete: false });

    const activeNote = useMemo(() => notes.find(note => note.id === activeNoteId), [notes, activeNoteId]);
    
    const hasUnsavedChanges = useMemo(() => {
        if (!isEditing || !activeNote || !editorState) return false;
        return activeNote.title !== editorState.title || activeNote.content !== editorState.content;
    }, [isEditing, activeNote, editorState]);

    // Effect 1: Sync notes list with Firestore
    useEffect(() => {
        if (!auth.currentUser) return;
        const unsubscribe = getNotes(auth.currentUser.uid, setNotes);
        return () => unsubscribe();
    }, []);

    // Effect 2: Manage selection based on notes list changes
    useEffect(() => {
        const activeNoteExists = activeNoteId && notes.some(note => note.id === activeNoteId);

        // If no note is selected (and there are notes) or the active note was deleted, select the first one.
        if (!activeNoteExists && notes.length > 0) {
            const firstNote = notes[0];
            setActiveNoteId(firstNote.id);
            setEditorState({ title: firstNote.title, content: firstNote.content, summary: firstNote.summary });
            setIsEditing(false); // Default to view mode when auto-selecting
        } 
        // If all notes are deleted, clear the editor state.
        else if (notes.length === 0) {
            setActiveNoteId(null);
            setEditorState(null);
        }
    }, [notes, activeNoteId]);

    const handleSelectNote = useCallback((noteId: string) => {
        if (isEditing && hasUnsavedChanges) {
            if (!window.confirm("You have unsaved changes. Discard them?")) {
                return;
            }
        }
        const noteToView = notes.find(n => n.id === noteId);
        if (noteToView) {
            setActiveNoteId(noteId);
            setEditorState({ title: noteToView.title, content: noteToView.content, summary: noteToView.summary });
            setIsEditing(false);
        }
    }, [isEditing, hasUnsavedChanges, notes]);

    const handleNewNote = async () => {
        if (!auth.currentUser) return;

        if (isEditing && hasUnsavedChanges) {
            if (!window.confirm("You have unsaved changes that will be lost. Create a new note anyway?")) {
                return;
            }
        }
        
        // FIX: Use Firebase v8 syntax to generate a client-side ID for the new note.
        const newNoteRef = db.collection(`users/${auth.currentUser.uid}/notes`).doc();
        const newNote: Note = {
            id: newNoteRef.id,
            title: 'Untitled Note',
            content: '',
            lastUpdated: new Date() // This is a placeholder; serverTimestamp is used on save
        };
        
        // Set the UI to the new note in editing mode immediately for a responsive feel
        setActiveNoteId(newNote.id);
        setEditorState({ title: newNote.title, content: newNote.content });
        setIsEditing(true);
        
        // Save the new note to Firestore. The real-time listener will then update the `notes` state automatically.
        await saveNote(auth.currentUser.uid, newNote);
    };

    const handleSave = async () => {
        if (!auth.currentUser || !activeNoteId || !editorState) return;
        setIsLoading(prev => ({ ...prev, save: true }));
        const noteToSave: Note = {
            id: activeNoteId,
            title: editorState.title,
            content: editorState.content,
            summary: editorState.summary,
            lastUpdated: new Date() // Will be replaced by serverTimestamp in service
        };
        await saveNote(auth.currentUser.uid, noteToSave);
        setIsEditing(false);
        setIsLoading(prev => ({ ...prev, save: false }));
    };

    const handleCancel = () => {
        if (activeNote) {
            setEditorState({ title: activeNote.title, content: activeNote.content, summary: activeNote.summary });
        }
        setIsEditing(false);
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!auth.currentUser || !window.confirm("Are you sure you want to delete this note?")) return;
        
        setIsLoading(prev => ({ ...prev, delete: true }));
        await deleteNote(auth.currentUser.uid, noteId);
        setIsLoading(prev => ({ ...prev, delete: false }));
    };

    const handleGenerateSummary = async () => {
        if (!editorState || !editorState.content.trim() || !auth.currentUser) return;
        
        setIsLoading(prev => ({ ...prev, summary: true }));
        const prompt = `Summarize the following notes into a few key bullet points:\n\n---\n${editorState.content}`;
        const summary = await generateText(prompt);
        setEditorState(prev => prev ? { ...prev, summary } : null);
        setIsLoading(prev => ({ ...prev, summary: false }));
    };

    return (
        <div className="flex h-[calc(100vh-150px)] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Note List Panel */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <button onClick={handleNewNote} className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                        + New Note
                    </button>
                </div>
                <div className="overflow-y-auto flex-1">
                    {notes.map(note => (
                        <div key={note.id} onClick={() => handleSelectNote(note.id)} className={`p-3 cursor-pointer border-b border-gray-200 dark:border-gray-700/50 ${activeNoteId === note.id ? 'bg-purple-100 dark:bg-purple-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
                           <div className="flex justify-between items-start">
                             <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate pr-2">{note.title}</h3>
                             <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }} className="text-gray-400 hover:text-red-500 text-xs font-bold">✕</button>
                           </div>
                           <p className="text-xs text-gray-500 dark:text-gray-400">{note.lastUpdated.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor/Viewer Panel */}
            <div className="w-2/3 flex flex-col">
                {activeNote && editorState ? (
                    isEditing ? (
                        // EDITING VIEW
                        <>
                            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                                <input
                                    type="text"
                                    value={editorState.title}
                                    onChange={e => setEditorState(prev => prev ? { ...prev, title: e.target.value } : null)}
                                    className="w-full text-lg font-bold bg-transparent focus:outline-none text-gray-900 dark:text-white"
                                />
                                <div className="flex items-center space-x-2">
                                     <button onClick={handleCancel} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors" title="Cancel"><XMarkIcon className="w-5 h-5"/></button>
                                     <button onClick={handleSave} disabled={!hasUnsavedChanges || isLoading.save} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors" title="Save">
                                        <CheckIcon className="w-5 h-5"/>
                                        <span>{isLoading.save ? 'Saving...' : 'Save'}</span>
                                     </button>
                                </div>
                            </div>
                            <div className="flex-1 p-3 overflow-y-auto">
                                <textarea
                                    value={editorState.content}
                                    onChange={e => setEditorState(prev => prev ? { ...prev, content: e.target.value } : null)}
                                    className="w-full h-full bg-transparent focus:outline-none resize-none text-gray-800 dark:text-gray-200"
                                    placeholder="Start writing your notes here..."
                                />
                            </div>
                             <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                {editorState.summary && (
                                    <div className="mb-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <h4 className="font-semibold text-sm mb-1 text-gray-800 dark:text-gray-200">AI Summary:</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{editorState.summary}</p>
                                    </div>
                                )}
                                <button onClick={handleGenerateSummary} disabled={isLoading.summary || !editorState.content.trim()} className="w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700/60 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                   <BrainIcon className="w-5 h-5 mr-2" />
                                   {isLoading.summary ? 'Summarizing...' : 'Update AI Summary'}
                                </button>
                            </div>
                        </>
                    ) : (
                        // VIEWING VIEW
                        <>
                            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{activeNote.title}</h2>
                                <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors" title="Edit">
                                    <PencilIcon className="w-5 h-5"/>
                                    <span>Edit</span>
                                </button>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto prose prose-sm prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: md.render(activeNote.content) }} />
                            {activeNote.summary && (
                                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <h4 className="font-semibold text-sm mb-1 text-gray-800 dark:text-gray-200">AI Summary:</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{activeNote.summary}</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <NoteIcon className="w-24 h-24" />
                        <p className="mt-4 text-lg">Select a note or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
