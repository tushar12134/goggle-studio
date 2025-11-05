

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { GoogleGenAI } from "@google/genai";
import { MicrophoneIcon } from '../../constants';

// Add types for the browser's SpeechRecognition API to resolve TypeScript errors.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onresult: ((event: any) => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
}

// Add SpeechRecognition types for browsers that support it
interface IWindow extends Window {
  SpeechRecognition: { new (): SpeechRecognition };
  webkitSpeechRecognition: { new (): SpeechRecognition };
}
declare const window: IWindow;

export const ChatTutor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your Edgelearn AI Tutor. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Cleanup effect to stop recognition when the component unmounts
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    // Stop recording if active before sending
    if (isRecording) {
      recognitionRef.current?.stop();
    }

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    // Add a placeholder for the model's streaming response
    setMessages(prev => [...prev, { role: 'model', text: '' }]);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const systemPrompt = `You are a helpful AI tutor from Edgelearn. Your name is Edgelearn AI. Answer the following question clearly and concisely. Use markdown for formatting when appropriate.`;
        const fullPrompt = `${systemPrompt}\n\nQuestion: ${currentInput}`;
        
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-pro',
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
                if (lastMessage && lastMessage.role === 'model') {
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
            if (lastMessage && lastMessage.role === 'model' && lastMessage.text === '') {
                lastMessage.text = "Sorry, I encountered an error. Please try again.";
            }
            return newMessages;
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setInput(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        alert("Microphone access was denied. Please allow microphone access in your browser settings to use voice input.");
      } else {
        alert(`An error occurred during speech recognition: ${event.error}`);
      }
    };
    
    // onend is called automatically when speech stops or when stop() is called
    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.start();
  };


  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-up`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow-md ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.text === '' && (
          <div className="flex justify-start animate-slide-in-up">
            <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isRecording ? 'Listening...' : 'Ask anything...'}
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            onClick={handleMicClick}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors transform hover:scale-110 active:scale-100 relative ${
              isRecording 
              ? 'bg-red-500/20 text-red-500' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording && <span className="absolute inset-0 bg-red-500 rounded-lg animate-ping opacity-50"></span>}
            <MicrophoneIcon className="h-6 w-6" />
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="p-2 bg-purple-600 text-white rounded-lg disabled:bg-purple-400 disabled:cursor-not-allowed hover:bg-purple-700 transition-all transform hover:scale-110 active:scale-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};