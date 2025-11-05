import React, { useState, useEffect } from 'react';
import { ChatSession, UserProfile } from '../../types';
import { auth, getChatSessions, getUserProfile } from '../../services/firebaseService';
import { ChatScreen } from './ChatScreen';

export const CommunicationHub: React.FC = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [participantProfiles, setParticipantProfiles] = useState<Record<string, UserProfile>>({});
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState<{ session: ChatSession, otherUser: UserProfile } | null>(null);
    const currentUserId = auth.currentUser?.uid;

    useEffect(() => {
        if (!currentUserId) return;
        setLoading(true);
        const unsubscribe = getChatSessions(currentUserId, (fetchedSessions) => {
            setSessions(fetchedSessions as ChatSession[]);
            
            // Fetch profiles for all participants across all sessions
            const allParticipantIds = new Set<string>();
            fetchedSessions.forEach(s => s.members.forEach(id => {
                if (id !== currentUserId) allParticipantIds.add(id);
            }));

            const idsToFetch = Array.from(allParticipantIds).filter(id => !participantProfiles[id]);
            if (idsToFetch.length > 0) {
                const fetchPromises = idsToFetch.map(id => getUserProfile(id));
                Promise.all(fetchPromises).then(profiles => {
                    const newProfiles: Record<string, UserProfile> = {};
                    profiles.forEach(p => p && (newProfiles[p.uid] = p));
                    setParticipantProfiles(prev => ({ ...prev, ...newProfiles }));
                });
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUserId]);

    if (activeChat) {
        return <ChatScreen session={activeChat.session} otherUser={activeChat.otherUser} onBack={() => setActiveChat(null)} />;
    }

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Communication Hub</h1>
            <p className="text-gray-500 dark:text-gray-400">Your conversations.</p>
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
                        const otherUserId = session.members.find(id => id !== currentUserId);
                        const otherUser = otherUserId ? participantProfiles[otherUserId] : null;

                        if (!otherUser) return (
                             <div key={session.id} className="w-full flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse">
                                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                                <div className="ml-4 flex-1 space-y-2">
                                    <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                    <div className="h-3 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        );

                        return (
                            <button key={session.id} onClick={() => setActiveChat({ session, otherUser })} className="w-full flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 text-left transition-colors">
                                <img src={otherUser.profileImageUrl || `https://i.pravatar.cc/150?u=${otherUser.uid}`} alt={otherUser.name} className="w-12 h-12 rounded-full object-cover" />
                                <div className="ml-4 flex-1 overflow-hidden">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{otherUser.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">{otherUser.role}</p>
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
