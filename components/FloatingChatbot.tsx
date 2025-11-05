
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatBubbleOvalIcon, XMarkIcon } from '../constants';
import { generateText } from '../services/geminiService';
import { ChatMessage } from '../types';

export const FloatingChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    // Initialize position to the bottom right corner with some padding
    const [position, setPosition] = useState({ x: window.innerWidth - 64 - 16, y: window.innerHeight - 64 - 16 });
    const [isDragging, setIsDragging] = useState(false);
    
    // Refs to manage drag state and element dimensions
    const dragStartOffset = useRef({ x: 0, y: 0 });
    const botRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dragHappened = useRef(false);

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

    // Keep the bot within the viewport on window resize
    const updatePositionForResize = useCallback(() => {
        if (!botRef.current) return;
        const botRect = botRef.current.getBoundingClientRect();
        // Adjust position based on whether the chat window is open or just the button
        const currentWidth = isOpen ? botRect.width : 64; // 64px is the button width
        const currentHeight = isOpen ? botRect.height : 64; // 64px is the button height

        setPosition(currentPos => ({
            x: Math.max(16, Math.min(currentPos.x, window.innerWidth - currentWidth - 16)),
            y: Math.max(16, Math.min(currentPos.y, window.innerHeight - currentHeight - 16)),
        }));
    }, [isOpen]);

    useEffect(() => {
        window.addEventListener('resize', updatePositionForResize);
        updatePositionForResize(); // Initial check
        return () => window.removeEventListener('resize', updatePositionForResize);
    }, [updatePositionForResize]);

    // --- Drag and Drop Logic ---

    const handleDragStart = useCallback((clientX: number, clientY: number) => {
        if (!botRef.current) return;
        dragHappened.current = false;
        setIsDragging(true);
        const botRect = botRef.current.getBoundingClientRect();
        dragStartOffset.current = {
            x: clientX - botRect.left,
            y: clientY - botRect.top,
        };
    }, []);

    const handleDragMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging) return;
        dragHappened.current = true;
        
        let newX = clientX - dragStartOffset.current.x;
        let newY = clientY - dragStartOffset.current.y;
        
        if (botRef.current) {
            const botRect = botRef.current.getBoundingClientRect();
            // Clamp position to stay within the viewport with a 16px padding
            const currentWidth = isOpen ? botRect.width : 64;
            const currentHeight = isOpen ? botRect.height : 64;

            newX = Math.max(16, Math.min(newX, window.innerWidth - currentWidth - 16));
            newY = Math.max(16, Math.min(newY, window.innerHeight - currentHeight - 16));
        }

        setPosition({ x: newX, y: newY });
    }, [isDragging, isOpen]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        setTimeout(() => { dragHappened.current = false; }, 0);
    }, []);

    // Mouse event handlers for dragging
    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;
        if ((isOpen && target.closest('.chatbot-header')) || (!isOpen && target.closest('.floating-chatbot-button'))) {
            handleDragStart(e.clientX, e.clientY);
        }
    };

    // Touch event handlers for dragging
    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length !== 1) return;
        const target = e.target as HTMLElement;
        if ((isOpen && target.closest('.chatbot-header')) || (!isOpen && target.closest('.floating-chatbot-button'))) {
            handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }
    };
    
    // Effect to add/remove global event listeners for dragging
    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                e.preventDefault(); // Prevent page scroll while dragging
                handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchend', handleDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    // --- Chat Logic ---

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;
        
        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        const systemPrompt = `You are a friendly and helpful AI assistant from Edgelearn. Provide concise and helpful answers.`;
        const fullPrompt = `${systemPrompt}\n\nUser Question: ${currentInput}`;

        const responseText = await generateText(fullPrompt); // Uses default 'gemini-flash-lite-latest' from the service
        const modelMessage: ChatMessage = { role: 'model', text: responseText };
        setMessages(prev => [...prev, modelMessage]);
        setIsLoading(false);
    };
    
    // Toggles the chat window open/closed if no drag occurred
    const handleButtonClick = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation(); 
        if (!dragHappened.current) {
            setIsOpen(prev => !prev);
        }
    };

    return (
        <div
            ref={botRef}
            className="fixed z-50"
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`, 
                touchAction: 'none'
            }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            {isOpen && (
                <div
                    className="absolute bottom-0 right-0 w-80 sm:w-96 h-[450px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col animate-pop-in origin-bottom-right"
                    onMouseDown={(e) => e.stopPropagation()} 
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <div className="chatbot-header flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 cursor-grab active:cursor-grabbing">
                        <h3 className="font-bold text-lg">AI Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close chat">
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
                        {isLoading && (
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
            )}
            <button
                onMouseUp={handleButtonClick}
                onTouchEnd={handleButtonClick}
                className={`floating-chatbot-button w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-xl flex items-center justify-center transition-transform focus:outline-none ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-110 active:scale-95'}`}
                aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
            >
                {isOpen ? <XMarkIcon className="w-8 h-8" /> : <ChatBubbleOvalIcon className="w-8 h-8" />}
            </button>
        </div>
    );
};
