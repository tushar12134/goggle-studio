import React, { useState, useEffect } from 'react';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion } from '../types';

interface InteractiveQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type QuizStep = 'select' | 'loading' | 'quiz' | 'results';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

const InteractiveQuizModal: React.FC<InteractiveQuizModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<QuizStep>('select');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset state when the modal is closed
    if (!isOpen) {
      setTimeout(() => { // Allow closing animation to finish
        setStep('select');
        setSubject('');
        setDifficulty('Medium');
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setScore(0);
        setError('');
      }, 300);
    }
  }, [isOpen]);

  const handleStartQuiz = async () => {
    if (!subject.trim()) {
      setError('Please enter a subject.');
      return;
    }
    setError('');
    setStep('loading');
    
    const quizData = await generateQuiz(subject, difficulty);
    if (quizData && quizData.quiz.length > 0) {
      setQuestions(quizData.quiz);
      setStep('quiz');
    } else {
      setError('Could not generate a quiz for this topic. Please try again or be more specific.');
      setStep('select');
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent changing answer after selection
    
    setSelectedAnswer(answerIndex);
    if (answerIndex === questions[currentQuestionIndex].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
    } else {
      setStep('results');
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'select':
        return <QuizSelection subject={subject} setSubject={setSubject} difficulty={difficulty} setDifficulty={setDifficulty} onStart={handleStartQuiz} error={error} />;
      case 'loading':
        return <QuizLoading subject={subject} />;
      case 'quiz':
        return <QuizQuestionDisplay question={questions[currentQuestionIndex]} questionNumber={currentQuestionIndex + 1} totalQuestions={questions.length} selectedAnswer={selectedAnswer} onAnswerSelect={handleAnswerSelect} onNext={handleNextQuestion} />;
      case 'results':
        return <QuizResults score={score} totalQuestions={questions.length} onRestart={handleStartQuiz} />;
      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="relative p-6">
            <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

// --- Sub-components for each step ---

const QuizSelection: React.FC<{ subject: string; setSubject: (s: string) => void; difficulty: Difficulty; setDifficulty: (d: Difficulty) => void; onStart: () => void; error: string; }> = ({ subject, setSubject, difficulty, setDifficulty, onStart, error }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Interactive Quiz</h2>
        <p className="text-center text-gray-500 dark:text-gray-400">Test your knowledge on any subject!</p>
        {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">{error}</p>}
        <div>
            <label className="text-sm font-medium">Subject</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Quantum Physics" className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"/>
        </div>
        <div>
            <label className="text-sm font-medium">Difficulty</label>
             <div className="flex p-1 mt-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
                    <button key={d} onClick={() => setDifficulty(d)} className={`w-full py-2 rounded-md font-semibold transition-colors ${difficulty === d ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>{d}</button>
                ))}
            </div>
        </div>
        <button onClick={onStart} className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors">Start Quiz</button>
    </div>
);

const QuizLoading: React.FC<{ subject: string }> = ({ subject }) => (
    <div className="text-center space-y-4 py-8">
         <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
         <h2 className="text-xl font-semibold">Generating Quiz...</h2>
         <p className="text-gray-500 dark:text-gray-400">Crafting questions for: <span className="font-bold">{subject}</span></p>
    </div>
);

const QuizQuestionDisplay: React.FC<{ question: QuizQuestion; questionNumber: number; totalQuestions: number; selectedAnswer: number | null; onAnswerSelect: (i: number) => void; onNext: () => void; }> = ({ question, questionNumber, totalQuestions, selectedAnswer, onAnswerSelect, onNext }) => {
    const getButtonClass = (index: number) => {
        if (selectedAnswer === null) return 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
        if (index === question.correctAnswerIndex) return 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500';
        if (index === selectedAnswer) return 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500';
        return 'bg-gray-100 dark:bg-gray-700 opacity-60';
    };
    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Question {questionNumber} of {totalQuestions}</p>
            <h3 className="text-lg font-semibold">{question.question}</h3>
            <div className="space-y-2">
                {question.options.map((option, index) => (
                    <button key={index} onClick={() => onAnswerSelect(index)} disabled={selectedAnswer !== null} className={`w-full p-3 text-left font-medium rounded-lg border-2 transition-colors ${getButtonClass(index)}`}>
                        {option}
                    </button>
                ))}
            </div>
            {selectedAnswer !== null && (
                <button onClick={onNext} className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors animate-fade-in">
                    {questionNumber === totalQuestions ? 'Finish Quiz' : 'Next Question'}
                </button>
            )}
        </div>
    );
};

const QuizResults: React.FC<{ score: number; totalQuestions: number; onRestart: () => void; }> = ({ score, totalQuestions, onRestart }) => {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
        <div className="text-center space-y-4 py-8">
            <h2 className="text-3xl font-bold">Quiz Complete!</h2>
            <p className="text-xl">Your Score:</p>
            <p className="text-5xl font-bold text-purple-600 dark:text-purple-400">{score} / {totalQuestions}</p>
            <p className="font-semibold">({percentage}%)</p>
            <button onClick={onRestart} className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-colors">Try Another Quiz</button>
        </div>
    );
};


export default InteractiveQuizModal;