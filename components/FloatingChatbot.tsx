

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatBubbleOvalIcon, XMarkIcon } from '../constants';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set for FloatingChatbot. It may not function.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });


export const FloatingChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
    const [isDragging, setIsDragging] = useState(false);
    
    const botRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Refs for robust drag handling
    const dragHappenedRef = useRef(false);
    const dragStartOffset = useRef({ x: 0, y: 0 });

    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Initial greeting message logic
    const getGreeting = () => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) return 'Good Morning! How can I help you?';
        if (currentHour < 18) return 'Good Afternoon! How can I help you?';
        return 'Good Evening! How can I assist you?';
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'model', text: getGreeting() }]);
        }
    }, [isOpen, messages.length]);
    
    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Effect to keep chatbot on screen during window resize
    useEffect(() => {
        const handleResize = () => {
            setPosition(prev => {
                if (!botRef.current) return prev;
                const botRect = botRef.current.getBoundingClientRect();
                const currentWidth = isOpen ? botRect.width : 64;
                const currentHeight = isOpen ? botRect.height : 64;
    
                const newX = Math.max(16, Math.min(prev.x, window.innerWidth - currentWidth - 16));
                const newY = Math.max(16, Math.min(prev.y, window.innerHeight - currentHeight - 16));
                return { x: newX, y: newY };
            });
        };
    
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
    
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    // --- Drag and Drop Logic ---
    const handleDragStart = useCallback((clientX: number, clientY: number) => {
        if (!botRef.current) return;
        setIsDragging(true);
        dragHappenedRef.current = false;
        
        const botRect = botRef.current.getBoundingClientRect();
        dragStartOffset.current = {
            x: clientX - botRect.left,
            y: clientY - botRect.top,
        };
        // Add a class to disable text selection while dragging
        document.body.style.userSelect = 'none';
    }, []);

    const handleDragMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging) return;
        dragHappenedRef.current = true;
        
        let newX = clientX - dragStartOffset.current.x;
        let newY = clientY - dragStartOffset.current.y;
        
        if (botRef.current) {
            const botRect = botRef.current.getBoundingClientRect();
            const currentWidth = isOpen ? botRect.width : 64;
            const currentHeight = isOpen ? botRect.height : 64;

            newX = Math.max(16, Math.min(newX, window.innerWidth - currentWidth - 16));
            newY = Math.max(16, Math.min(newY, window.innerHeight - currentHeight - 16));
        }
        setPosition({ x: newX, y: newY });
    }, [isOpen, isDragging]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        document.body.style.userSelect = '';
        // Use a short timeout to allow click event to process `dragHappenedRef`
        setTimeout(() => {
            dragHappenedRef.current = false;
        }, 0);
    }, []);

    // Effect to manage global event listeners for dragging
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const onUp = () => handleDragEnd();

        // These listeners are only active while dragging is happening.
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('touchmove', onTouchMove, { passive: true });
            window.addEventListener('mouseup', onUp);
            window.addEventListener('touchend', onUp);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchend', onUp);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);
    
    // --- Chat Logic (already streaming, which is good for performance) ---
    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;
    
        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
    
        setMessages(prev => [...prev, { role: 'model', text: '' }]);
    
        try {
            const systemPrompt = `You are a friendly and helpful AI assistant from Edgelearn. Provide concise and helpful answers.`;
            const fullPrompt = `${systemPrompt}\n\nUser Question: ${currentInput}`;
    
            const stream = await ai.models.generateContentStream({
                model: 'gemini-flash-latest',
                contents: fullPrompt,
                config: {
                    thinkingConfig: { thinkingBudget: 0 }
                }
            });
    
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === 'model') {
                        lastMessage.text += chunkText;
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error generating streaming response:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.role === 'model' && lastMessage.text === '') {
                    lastMessage.text = "Sorry, I encountered an error. Please try again.";
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleToggleOpen = () => {
        if (!dragHappenedRef.current) {
            setIsOpen(prev => !prev);
        }
    };

    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        handleDragStart(e.clientX, e.clientY);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    };

    return (
        <div
            ref={botRef}
            className="fixed z-50 select-none"
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`,
            }}
        >
            {isOpen ? (
                <div
                    className="absolute bottom-0 right-0 w-80 sm:w-96 h-[450px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-pop-in origin-bottom-right"
                >
                    <div 
                        className="chatbot-header flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 cursor-grab active:cursor-grabbing"
                        onMouseDown={onMouseDown}
                        onTouchStart={onTouchStart}
                    >
                        <h3 className="font-bold text-lg">AI Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer" aria-label="Close chat">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 p-3 overflow-y-auto space-y-3">
                         {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-up`}>
                                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200'}`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.text === '' && (
                            <div className="flex justify-start animate-slide-in-up">
                                <div className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700">
                                    <div className="flex items-center space-x-1.5">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.1s]"></div>
                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask me anything..."
                                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-200"
                                disabled={isLoading}
                            />
                            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400" aria-label="Send message">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                    onClick={handleToggleOpen}
                    className="floating-chatbot-button w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-xl flex items-center justify-center transition-transform focus:outline-none cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95"
                    aria-label="Open chatbot"
                >
                   <ChatBubbleOvalIcon className="w-8 h-8" />
                </button>
            )}
        </div>
    );
};