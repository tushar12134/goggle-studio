import React, { useState, useEffect, useMemo } from 'react';
import { Flashcard, FlashcardDeck } from '../../types';
import { auth, db, saveDeck, getDecks, deleteDeck } from '../../services/firebaseService';
import { generateText } from '../../services/geminiService';
import { RestartIcon, ShuffleIcon, PencilIcon, CheckIcon, XMarkIcon, SparklesIcon, FolderIcon } from '../../constants';

type CreatorMode = 'select' | 'manual' | 'ai';

// --- Main Component ---
export const FlashcardCreator: React.FC = () => {
    const [mode, setMode] = useState<CreatorMode>('select');
    const [initialDeckId, setInitialDeckId] = useState<string | null>(null);

    const handleAiDeckSaved = (deckId: string) => {
        setInitialDeckId(deckId);
        setMode('manual');
    };
    
    const handleModeSelect = (selectedMode: CreatorMode) => {
        setInitialDeckId(null); // Reset initial deck when changing modes manually
        setMode(selectedMode);
    }
    
    const handleBackToModes = () => {
        setMode('select');
        setInitialDeckId(null);
    }

    const renderContent = () => {
        switch (mode) {
            case 'manual':
                return <ManualCreator initialDeckId={initialDeckId} />;
            case 'ai':
                return <AIGenerator onDeckSaved={handleAiDeckSaved} />;
            case 'select':
            default:
                return <ModeSelection onSelectMode={handleModeSelect} />;
        }
    };
    
    return (
        <div>
            {mode !== 'select' && (
                 <button onClick={handleBackToModes} className="mb-4 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    Back to Modes
                </button>
            )}
            {renderContent()}
        </div>
    );
};


// --- ModeSelection Component ---
interface ModeSelectionProps {
    onSelectMode: (mode: CreatorMode) => void;
}
const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelectMode }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flashcards</h1>
             <p className="text-gray-500 dark:text-gray-400">Choose your creation method.</p>
            <div className="flex flex-wrap justify-center gap-4">
                 <ModeCard 
                    title="My Decks"
                    description="View, edit, and study your saved flashcard decks."
                    icon={<FolderIcon className="w-10 h-10" />}
                    onClick={() => onSelectMode('manual')} 
                />
                <ModeCard 
                    title="Create Manually" 
                    description="Build your deck card by card for full control."
                    icon={<PencilIcon className="w-10 h-10" />}
                    onClick={() => onSelectMode('manual')} 
                />
                <ModeCard 
                    title="Generate with AI" 
                    description="Paste text or upload a doc to create cards automatically."
                    icon={<SparklesIcon className="w-10 h-10" />}
                    onClick={() => onSelectMode('ai')} 
                />
            </div>
        </div>
    );
};
const ModeCard: React.FC<{title: string, description: string, icon: React.ReactNode, onClick: () => void}> = ({ title, description, icon, onClick }) => (
    <button onClick={onClick} className="w-64 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center space-y-2 transform hover:-translate-y-2 transition-transform shadow-sm hover:shadow-xl hover:shadow-purple-500/10">
        <div className="mx-auto w-16 h-16 flex items-center justify-center text-purple-500 bg-purple-100 dark:bg-purple-900/30 rounded-full">{icon}</div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </button>
);


// --- ManualCreator Component ---
const ManualCreator: React.FC<{initialDeckId: string | null}> = ({ initialDeckId }) => {
    const [decks, setDecks] = useState<FlashcardDeck[]>([]);
    const [activeDeckId, setActiveDeckId] = useState<string | null>(initialDeckId);
    const [isLoading, setIsLoading] = useState(true);
    const [studyMode, setStudyMode] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newDeckTitle, setNewDeckTitle] = useState('');
    const [isCreatingDeck, setIsCreatingDeck] = useState(false);
    const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
    const [editingDeckTitle, setEditingDeckTitle] = useState('');

    const activeDeck = useMemo(() => decks.find(d => d.id === activeDeckId), [decks, activeDeckId]);

    useEffect(() => {
        if (!auth.currentUser) return;
        setIsLoading(true);
        const unsubscribe = getDecks(auth.currentUser.uid, (fetchedDecks) => {
            setDecks(fetchedDecks);
            if (activeDeckId === null && fetchedDecks.length > 0) {
                // If no deck is active (e.g., coming from "My Decks"), select the first one.
                setActiveDeckId(fetchedDecks[0].id);
            } else if (fetchedDecks.length === 0) {
                setActiveDeckId(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // This effect ensures that if the currently active deck is deleted,
    // the selection moves to the first available deck or null.
    useEffect(() => {
        if (!isLoading && activeDeckId && !decks.some(d => d.id === activeDeckId)) {
            setActiveDeckId(decks.length > 0 ? decks[0].id : null);
        }
    }, [decks, activeDeckId, isLoading]);

    const handleCreateDeck = async () => {
        if (!newDeckTitle.trim() || !auth.currentUser) return;
    
        setIsCreatingDeck(true);
        const newDeckRef = db.collection(`users/${auth.currentUser.uid}/flashcardDecks`).doc();
        const newDeck: FlashcardDeck = {
            id: newDeckRef.id, title: newDeckTitle.trim(), cards: [], lastUpdated: new Date(),
        };
    
        setDecks(prevDecks => [newDeck, ...prevDecks]);
        setActiveDeckId(newDeck.id);
        setNewDeckTitle('');
        setShowCreateForm(false);
        setIsCreatingDeck(false);
    
        try {
            await saveDeck(auth.currentUser.uid, newDeck);
        } catch (error) {
            console.error("Failed to save new deck:", error);
            alert("Error: Could not save your new deck.");
            setDecks(prevDecks => prevDecks.filter(deck => deck.id !== newDeck.id));
        }
    };
    
    const handleDeleteDeck = async (deckId: string) => {
        if (window.confirm("Are you sure you want to delete this deck?") && auth.currentUser) {
            // Optimistically remove from UI
            const originalDecks = decks;
            setDecks(decks.filter(d => d.id !== deckId));
            try {
                await deleteDeck(auth.currentUser.uid, deckId);
            } catch (error) {
                alert("Failed to delete deck. Please try again.");
                setDecks(originalDecks); // Revert on error
            }
        }
    };


    const handleStartEditDeck = (deck: FlashcardDeck) => {
        setEditingDeckId(deck.id);
        setEditingDeckTitle(deck.title);
    };

    const handleSaveDeckTitle = async () => {
        if (!editingDeckId || !editingDeckTitle.trim() || !auth.currentUser) return;
        const deckToUpdate = decks.find(d => d.id === editingDeckId);
        if (deckToUpdate) {
            await saveDeck(auth.currentUser.uid, { ...deckToUpdate, title: editingDeckTitle.trim() });
        }
        setEditingDeckId(null);
        setEditingDeckTitle('');
    };

    const handleUpdateDeckCards = async (updatedDeck: FlashcardDeck) => {
        if (!auth.currentUser) return;
        await saveDeck(auth.currentUser.uid, updatedDeck);
    };

    if (studyMode && activeDeck) {
        return <StudyMode deck={activeDeck} onExit={() => setStudyMode(false)} />;
    }

    return (
        <div className="flex h-[calc(100vh-190px)] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold">My Decks</h2>
                        <button onClick={() => setShowCreateForm(!showCreateForm)} className="text-purple-600 dark:text-purple-400 font-bold text-2xl hover:opacity-80 leading-none">
                           {showCreateForm ? '×' : '+'}
                        </button>
                    </div>
                    {showCreateForm && (
                        <div className="flex space-x-2 animate-fade-in">
                            <input type="text" value={newDeckTitle} onChange={(e) => setNewDeckTitle(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleCreateDeck()} placeholder="New deck title..." className="flex-1 p-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600" />
                            <button onClick={handleCreateDeck} disabled={isCreatingDeck || !newDeckTitle.trim()} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400">
                                Create
                            </button>
                        </div>
                    )}
                </div>
                <div className="overflow-y-auto flex-1">
                    {decks.map(deck => (
                        <div key={deck.id} onClick={() => setActiveDeckId(deck.id)} className={`p-3 cursor-pointer border-b border-gray-200 dark:border-gray-700/50 ${activeDeckId === deck.id ? 'bg-purple-100 dark:bg-purple-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
                           {editingDeckId === deck.id ? (
                                <div className="space-y-2"><input type="text" value={editingDeckTitle} onChange={(e) => setEditingDeckTitle(e.target.value)} className="w-full p-1 text-sm bg-white dark:bg-gray-800 rounded border border-purple-400" autoFocus /><div className="flex space-x-2"><button onClick={handleSaveDeckTitle} className="w-full text-xs p-1 bg-green-500 text-white rounded hover:bg-green-600">Save</button><button onClick={() => setEditingDeckId(null)} className="w-full text-xs p-1 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button></div></div>
                           ) : (
                                <div className="flex justify-between items-center"><span className="truncate pr-2 font-semibold">{deck.title}</span><div className="flex items-center space-x-2"><button onClick={(e) => { e.stopPropagation(); handleStartEditDeck(deck); }} className="text-gray-400 hover:text-purple-500"><PencilIcon className="w-4 h-4"/></button><button onClick={(e) => { e.stopPropagation(); handleDeleteDeck(deck.id); }} className="text-gray-400 hover:text-red-500"><XMarkIcon className="w-4 h-4"/></button></div></div>
                           )}
                        </div>
                    ))}
                     {decks.length === 0 && !isLoading && <p className="text-center text-sm text-gray-500 p-4">No decks yet. Create one!</p>}
                </div>
            </div>
            <div className="w-2/3 p-4">
                {activeDeck ? <CardManager deck={activeDeck} onUpdateDeck={handleUpdateDeckCards} onStudy={() => setStudyMode(true)} /> : <div className="flex flex-col items-center justify-center h-full text-gray-500"><p className="text-lg">{isLoading ? 'Loading...' : 'Select or create a deck.'}</p></div>}
            </div>
        </div>
    );
};

// --- AIGenerator Component ---
interface AIGeneratorProps {
    onDeckSaved: (deckId: string) => void;
}
const AIGenerator: React.FC<AIGeneratorProps> = ({ onDeckSaved }) => {
    const [inputText, setInputText] = useState('');
    const [fileName, setFileName] = useState('');
    const [generatedCards, setGeneratedCards] = useState<Flashcard[] | null>(null);
    const [deckTitle, setDeckTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'text/plain') {
            setFileName(file.name);
            setInputText(await file.text());
        } else {
            alert("Please upload a valid .txt file.");
        }
    };
    
    const handleGenerate = async () => {
        if (!inputText.trim()) {
            alert("Please provide some text to generate flashcards from.");
            return;
        }
        setIsLoading(true);
        setGeneratedCards(null);
        const prompt = `Analyze the following text and generate a set of flashcards for studying. Each flashcard should have a "front" (a clear question or key term) and a "back" (a concise answer or definition). Return the output as a single, valid JSON array of objects, where each object has "front" and "back" keys. Do not include any other text or explanations outside of the JSON array.

Text to analyze:
---
${inputText}
---`;

        try {
            const response = await generateText(prompt, 'gemini-2.5-pro');
            const jsonString = response.substring(response.indexOf('['), response.lastIndexOf(']') + 1);
            const cards = JSON.parse(jsonString).map((card: any, index: number) => ({...card, id: `ai_card_${index}`}));
            setGeneratedCards(cards);
            setDeckTitle(fileName.replace('.txt', '') || 'AI Generated Deck');
        } catch (error) {
            console.error("Failed to generate or parse flashcards:", error);
            alert("Sorry, the AI couldn't generate flashcards from this text. Please try again or with different content.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveDeck = async () => {
        if (!deckTitle.trim() || !generatedCards || !auth.currentUser) return;
        setIsSaving(true);
        const newDeckRef = db.collection(`users/${auth.currentUser.uid}/flashcardDecks`).doc();
        const newDeck: FlashcardDeck = {
            id: newDeckRef.id, title: deckTitle, cards: generatedCards, lastUpdated: new Date(),
        };
        await saveDeck(auth.currentUser.uid, newDeck);
        setIsSaving(false);
        alert(`Deck "${deckTitle}" saved successfully!`);
        onDeckSaved(newDeck.id);
    };
    
    const handleUpdateCard = (cardId: string, newFront: string, newBack: string) => {
        setGeneratedCards(cards => cards!.map(c => c.id === cardId ? {...c, front: newFront, back: newBack} : c));
    };

    if (generatedCards) {
        return (
            <div className="p-4 space-y-4">
                <h2 className="text-xl font-bold">Review Your Cards</h2>
                <div className="flex items-center gap-2"><input type="text" value={deckTitle} onChange={e => setDeckTitle(e.target.value)} className="flex-1 p-2 text-lg font-semibold bg-gray-100 dark:bg-gray-700 rounded" /><button onClick={handleSaveDeck} disabled={isSaving} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400">{isSaving ? "Saving..." : "Save Deck"}</button></div>
                <div className="h-[calc(100vh-280px)] overflow-y-auto space-y-2 pr-2">
                    {generatedCards.map(card => (
                        <div key={card.id} className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                           <textarea value={card.front} onChange={e => handleUpdateCard(card.id, e.target.value, card.back)} className="w-full p-1 bg-white dark:bg-gray-700 rounded mb-1" rows={2}/>
                           <textarea value={card.back} onChange={e => handleUpdateCard(card.id, card.front, e.target.value)} className="w-full p-1 bg-white dark:bg-gray-700 rounded" rows={3}/>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Generate Cards with AI</h2>
            <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Paste your notes or text here..." className="w-full h-64 p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700" disabled={isLoading} />
            <div className="flex items-center justify-between">
                <label className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/80 file:text-white hover:file:bg-purple-600"><input type="file" accept=".txt" onChange={handleFileChange} disabled={isLoading} className="hidden"/><span>Upload .txt File</span>{fileName && <span className="ml-2 text-xs italic">({fileName})</span>}</label>
                <button onClick={handleGenerate} disabled={isLoading || !inputText.trim()} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 flex items-center">{isLoading ? 'Generating...' : 'Generate Flashcards'}</button>
            </div>
        </div>
    );
};


// --- Components from original FlashcardCreator ---
const CardManager: React.FC<CardManagerProps> = ({ deck, onUpdateDeck, onStudy }) => {
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');
    const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        setNewFront(''); setNewBack(''); setEditingCard(null);
    }, [deck.id]);

    const handleAddCard = async () => {
        if (!newFront.trim() || !newBack.trim()) return;
        setIsAdding(true);
        const newCard: Flashcard = { id: 'card_' + Date.now().toString(36) + Math.random().toString(36).substring(2), front: newFront.trim(), back: newBack.trim() };
        try {
            await onUpdateDeck({ ...deck, cards: [...deck.cards, newCard] });
            setNewFront(''); setNewBack('');
        } finally { setIsAdding(false); }
    };

    const handleSaveEdit = async () => {
        if (!editingCard || !editingCard.front.trim() || !editingCard.back.trim()) return;
        setIsSaving(true);
        try {
            const updatedCards = deck.cards.map(c => c.id === editingCard.id ? editingCard : c);
            await onUpdateDeck({ ...deck, cards: updatedCards });
            setEditingCard(null);
        } finally { setIsSaving(false); }
    };

    const handleDeleteCard = (cardId: string) => {
        if (window.confirm("Delete this card?")) {
            onUpdateDeck({ ...deck, cards: deck.cards.filter(c => c.id !== cardId) });
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700"><h2 className="text-xl font-bold truncate pr-4">{deck.title}</h2><button onClick={onStudy} disabled={deck.cards.length === 0} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400">Study</button></div>
            <div className="flex-shrink-0 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg space-y-3 mb-4"><h3 className="font-semibold text-lg">Add New Card</h3><input type="text" value={newFront} onChange={e => setNewFront(e.target.value)} placeholder="Front of card (Question)" className="w-full p-3 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" /><textarea value={newBack} onChange={e => setNewBack(e.target.value)} placeholder="Back of card (Answer)" className="w-full p-3 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600" rows={3}></textarea><button onClick={handleAddCard} disabled={isAdding || !newFront.trim() || !newBack.trim()} className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded disabled:bg-blue-300">{isAdding ? 'Adding...' : 'Add Card'}</button></div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {deck.cards.map(card => (
                    editingCard?.id === card.id ? (
                        <div key={card.id} className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700 rounded-lg space-y-2"><label className="text-xs font-semibold">Front</label><input type="text" value={editingCard.front} onChange={e => setEditingCard({ ...editingCard, front: e.target.value })} className="w-full p-2 bg-white dark:bg-gray-800 rounded" /><label className="text-xs font-semibold">Back</label><textarea value={editingCard.back} onChange={e => setEditingCard({ ...editingCard, back: e.target.value })} className="w-full p-2 bg-white dark:bg-gray-800 rounded" rows={2}></textarea><div className="flex space-x-2"><button onClick={handleSaveEdit} disabled={isSaving} className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold disabled:bg-green-300">{isSaving ? 'Saving...' : 'Save'}</button><button onClick={() => setEditingCard(null)} className="w-full py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-semibold">Cancel</button></div></div>
                    ) : (
                        <div key={card.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg"><div className="flex justify-between items-start"><div><p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Front</p><p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{card.front}</p></div><div className="flex space-x-2 flex-shrink-0 ml-2"><button onClick={() => setEditingCard(card)} className="p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400"><PencilIcon className="w-4 h-4"/></button><button onClick={() => handleDeleteCard(card.id)} className="p-2 text-gray-500 hover:text-red-500"><XMarkIcon className="w-4 h-4"/></button></div></div><hr className="my-2 border-gray-200 dark:border-gray-600" /><p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Back</p><p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{card.back}</p></div>
                    )
                ))}
                {deck.cards.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 pt-8">This deck is empty. Add some cards!</p>}
            </div>
        </div>
    );
};
interface CardManagerProps { deck: FlashcardDeck; onUpdateDeck: (deck: FlashcardDeck) => Promise<void>; onStudy: () => void; }

const StudyMode: React.FC<StudyModeProps> = ({ deck, onExit }) => {
    const [studyDeck, setStudyDeck] = useState<Flashcard[]>([...deck.cards]);
    const [cardIndex, setCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const card = studyDeck[cardIndex];
    const resetFlip = (callback: () => void) => { isFlipped ? (setIsFlipped(false), setTimeout(callback, 250)) : callback(); };
    const nextCard = () => resetFlip(() => setCardIndex((prev) => (prev + 1) % studyDeck.length));
    const prevCard = () => resetFlip(() => setCardIndex((prev) => (prev - 1 + studyDeck.length) % studyDeck.length));
    const handleShuffle = () => resetFlip(() => { setStudyDeck([...deck.cards].sort(() => Math.random() - 0.5)); setCardIndex(0); });
    const handleRestart = () => resetFlip(() => setCardIndex(0));
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === ' ') setIsFlipped(f => !f);
        else if (event.key === 'ArrowRight') nextCard();
        else if (event.key === 'ArrowLeft') prevCard();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cardIndex, studyDeck.length, isFlipped]);
    if (!card) return (<div className="p-4 space-y-4 flex flex-col h-full items-center justify-center"><p className="text-lg text-gray-500">This deck has no cards to study!</p><button onClick={onExit} className="font-semibold text-purple-600 dark:text-purple-400">&larr; Back to Deck</button></div>)
    return (
        <div className="p-4 space-y-4 flex flex-col h-full">
            <div className="flex-shrink-0 flex justify-between items-center"><button onClick={onExit} className="font-semibold text-purple-600 dark:text-purple-400">&larr; Back to Deck</button><div className="flex items-center space-x-4"><button onClick={handleShuffle} title="Shuffle" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><ShuffleIcon className="w-5 h-5" /></button><button onClick={handleRestart} title="Restart" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><RestartIcon className="w-5 h-5" /></button><p className="text-gray-500 dark:text-gray-400">{cardIndex + 1} / {studyDeck.length}</p></div></div>
            <div className="flex-1 flex items-center justify-center perspective-1000">
                <div onClick={() => setIsFlipped(!isFlipped)} className={`w-full max-w-lg h-80 rounded-lg shadow-xl cursor-pointer transition-transform duration-500 transform-style-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
                    <div className="absolute w-full h-full backface-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center"><p className="text-2xl">{card.front}</p></div>
                    <div className="absolute w-full h-full backface-hidden flex items-center justify-center bg-purple-100 dark:bg-purple-900/70 rounded-lg p-4 text-center rotate-y-180"><p className="text-2xl">{card.back}</p></div>
                </div>
            </div>
            <div className="flex-shrink-0 flex justify-center space-x-4"><button onClick={prevCard} className="w-full p-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Previous</button><button onClick={nextCard} className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Next Card</button></div>
        </div>
    );
}
interface StudyModeProps { deck: FlashcardDeck; onExit: () => void; }

const style = document.createElement('style');
style.innerHTML = `.perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .rotate-y-180 { transform: rotateY(180deg); } .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }`;
document.head.appendChild(style);