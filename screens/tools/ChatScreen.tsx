

import React, { useState, useEffect, useRef } from 'react';
import { ChatSession, FirebaseChatMessage, Teacher } from '../../types';
import { auth, getChatMessages, sendChatMessage, uploadFileToChat } from '../../services/firebaseService';
import { VideoIcon, PhoneIcon } from '../../constants';

interface ChatScreenProps {
    session: ChatSession;
    teacher: Teacher;
    onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ session, teacher, onBack }) => {
    const [messages, setMessages] = useState<FirebaseChatMessage[]>([]);
    const [input, setInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUserId = auth.currentUser?.uid;

    useEffect(() => {
        const unsubscribe = getChatMessages(session.id, (msgs) => setMessages(msgs as FirebaseChatMessage[]));
        return () => unsubscribe();
    }, [session.id]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() && currentUserId) {
            await sendChatMessage(session.id, currentUserId, input);
            setInput('');
        }
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && currentUserId) {
            // Reset the file input so the same file can be selected again
            event.target.value = ''; 
            await uploadFileToChat(session.id, currentUserId, file);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-150px)] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Header */}
            <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <img src={teacher.avatar} alt={teacher.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="ml-3">
                    <h2 className="font-bold text-gray-900 dark:text-white">{teacher.name}</h2>
                    <p className={`text-xs ${teacher.isOnline ? 'text-green-500' : 'text-gray-500'}`}>{teacher.isOnline ? 'Online' : 'Offline'}</p>
                </div>
                <div className="flex items-center space-x-2 ml-auto">
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><PhoneIcon className="w-6 h-6" /></button>
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"><VideoIcon className="w-6 h-6" /></button>
                </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-900/50">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col items-start ${msg.senderId === currentUserId ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-md ${msg.senderId === currentUserId ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-bl-none'}`}>
                            {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                            {msg.file && (
                                <a href={msg.file.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 mt-1 text-sm underline hover:opacity-80">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" /></svg>
                                    <span className="truncate">{msg.file.name}</span>
                                </a>
                            )}
                            <p className="text-xs text-right mt-1 opacity-70">
                                {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '...'}
                            </p>
                        </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden"/>
                     <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" /></svg>
                     </button>
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button onClick={handleSend} className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:bg-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
