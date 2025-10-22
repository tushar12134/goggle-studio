import React, { useState, useEffect } from 'react';
import { ChatSession, Teacher } from '../../types';
import { auth, getChatSessions } from '../../services/firebaseService';
import { MOCK_TEACHERS } from '../../constants';
import { ChatScreen } from './ChatScreen';

export const CommunicationHub: React.FC = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState<{ session: ChatSession, teacher: Teacher } | null>(null);
    const currentUserId = auth.currentUser?.uid;

    useEffect(() => {
        if (!currentUserId) return;
        setLoading(true);
        const unsubscribe = getChatSessions(currentUserId, (fetchedSessions) => {
            setSessions(fetchedSessions as ChatSession[]);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUserId]);

    const getTeacherForSession = (session: ChatSession): Teacher | undefined => {
        const teacherId = session.members.find(id => id !== currentUserId);
        return MOCK_TEACHERS.find(t => t.id === teacherId);
    };

    if (activeChat) {
        return <ChatScreen session={activeChat.session} teacher={activeChat.teacher} onBack={() => setActiveChat(null)} />;
    }

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Communication Hub</h1>
            <p className="text-gray-500 dark:text-gray-400">Your conversations with teachers.</p>
            {loading ? (
                <p>Loading chats...</p>
            ) : sessions.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-500 dark:text-gray-400">You have no active chats.</p>
                    <p className="text-gray-500 dark:text-gray-400">Use "Find a Teacher" to start a conversation.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sessions.map(session => {
                        const teacher = getTeacherForSession(session);
                        if (!teacher) return null; // In a real app, you might fetch teacher profiles
                        return (
                            <button key={session.id} onClick={() => setActiveChat({ session, teacher })} className="w-full flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 text-left transition-colors">
                                <img src={teacher.avatar} alt={teacher.name} className="w-12 h-12 rounded-full object-cover" />
                                <div className="ml-4 flex-1 overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{teacher.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">{teacher.subject}</p>
                                        </div>
                                        <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                            {session.lastUpdated?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">{session.lastMessage}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};