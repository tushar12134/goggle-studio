import React, { useState, useEffect, useCallback } from 'react';
import { SubjectStudyPlan, YouTubeVideoSuggestion } from '../types';
import { generateSubjectStudyPlan, generateYoutubeVideoSuggestions } from '../services/geminiService';
import { ChevronDownIcon, SparklesIcon, YouTubeIcon, MagnifyingGlassIcon } from '../constants';

interface SubjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
}

const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({ isOpen, onClose, subject }) => {
  const [studyPlan, setStudyPlan] = useState<SubjectStudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [videoSuggestions, setVideoSuggestions] = useState<YouTubeVideoSuggestion[]>([]);
  const [isSearchingVideos, setIsSearchingVideos] = useState(false);


  // Load notes from localStorage when component mounts for a subject
  useEffect(() => {
    if (isOpen) {
        const savedNotes = localStorage.getItem(`notes_${subject}`);
        if (savedNotes) {
            setNotes(savedNotes);
        } else {
            setNotes(''); // Clear notes for a new subject
        }
    }
  }, [isOpen, subject]);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (isOpen) {
        localStorage.setItem(`notes_${subject}`, notes);
    }
  }, [notes, isOpen, subject]);


  const fetchStudyPlan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await generateSubjectStudyPlan(subject);
      if (plan) {
        setStudyPlan(plan);
      } else {
        throw new Error("Failed to generate a study plan.");
      }
    } catch (err) {
      setError("Sorry, the AI couldn't create a study plan for this subject. Please try again or select a different subject.");
    } finally {
      setIsLoading(false);
    }
  }, [subject]);

  useEffect(() => {
    if (isOpen) {
      fetchStudyPlan();
    }
  }, [isOpen, fetchStudyPlan]);
  
  const handleGenerateNew = () => {
      setStudyPlan(null); // Clear old plan
      fetchStudyPlan();
  }

  const handleVideoSearch = async () => {
      if (!videoSearchQuery.trim()) return;
      setIsSearchingVideos(true);
      setVideoSuggestions([]);
      const suggestions = await generateYoutubeVideoSuggestions(videoSearchQuery);
      if (suggestions) {
          setVideoSuggestions(suggestions);
      }
      setIsSearchingVideos(false);
  };

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl h-[90vh] flex flex-col transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="relative p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
          <h2 className="text-2xl font-bold text-center">Study Plan: {subject}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
            {isLoading && <LoadingSkeleton />}
            {error && <ErrorDisplay message={error} onRetry={fetchStudyPlan} />}
            {studyPlan && (
                 <div className="space-y-6 animate-fade-in">
                    <button onClick={handleGenerateNew} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-semibold rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/80 transition-colors">
                        <SparklesIcon className="w-5 h-5"/>
                        Generate New Plan
                    </button>

                    <Section title="🎯 Learning Objectives">
                        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                            {studyPlan.learningObjectives.map((obj, i) => <li key={i}>{obj}</li>)}
                        </ul>
                    </Section>

                    <Section title="📚 Key Topics">
                        <Accordion items={studyPlan.keyTopics} />
                    </Section>

                    <Section title="🎬 Recommended Videos">
                        <div className="space-y-3">
                        {studyPlan.recommendedVideos.map((video, i) => (
                           <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex-1">
                                    <p className="font-semibold text-purple-600 dark:text-purple-400">{video.title}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{video.description}</p>
                                </div>
                                <a 
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.youtubeSearchQuery)}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <YouTubeIcon className="w-5 h-5 text-red-500" />
                                    <span>Search</span>
                                </a>
                            </div>
                        ))}
                        </div>
                    </Section>
                    
                     <Section title="🔍 Find More Videos">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={videoSearchQuery}
                                onChange={e => setVideoSearchQuery(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleVideoSearch()}
                                placeholder="Search for more video topics..."
                                className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                            />
                            <button onClick={handleVideoSearch} disabled={isSearchingVideos} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400">
                                {isSearchingVideos ? '...' : <MagnifyingGlassIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        {isSearchingVideos && <p className="text-sm text-center mt-2">AI is searching...</p>}
                        {videoSuggestions.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {videoSuggestions.map((video, i) => (
                                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.youtubeSearchQuery)}`} target="_blank" rel="noopener noreferrer" key={i} className="block p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-700 transition-colors">
                                        <p className="font-semibold text-purple-600 dark:text-purple-400">{video.title}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{video.description}</p>
                                    </a>
                                ))}
                            </div>
                        )}
                    </Section>

                     <Section title="✍️ Practice Problems">
                        <ul className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                             {studyPlan.practiceProblems.map((prob, i) => <li key={i} className="pl-2">{prob.question}</li>)}
                        </ul>
                    </Section>
                    
                    <Section title="📝 My Notes">
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Jot down your thoughts, questions, or key points here..."
                            className="w-full h-32 p-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </Section>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-components for the Modal ---
const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
        ))}
    </div>
);

const ErrorDisplay: React.FC<{message: string, onRetry: () => void}> = ({ message, onRetry }) => (
    <div className="text-center space-y-4 py-8">
        <p className="text-red-500">{message}</p>
        <button onClick={onRetry} className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">Try Again</button>
    </div>
);

const Section: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div>
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white border-b-2 border-purple-300 dark:border-purple-700 pb-2">{title}</h3>
        {children}
    </div>
);

const Accordion: React.FC<{items: {title: string, summary: string}[]}> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex justify-between items-center p-3 text-left font-semibold">
                        <span>{item.title}</span>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                    </button>
                    {openIndex === index && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 animate-fade-in">
                            {item.summary}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default SubjectDetailModal;