import React, { useState, useEffect } from 'react';
import { UserProfile, Connection } from '../../types';
import { UserPlusIcon, EyeIcon, CheckIcon } from '../../constants';
import TeacherProfileModal from '../../components/TeacherProfileModal';
import { auth, createConnectionRequest, getConnectionsForStudent, getAllTeachers } from '../../services/firebaseService';

export const FindTeacher: React.FC = () => {
    const [teachers, setTeachers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
    const [studentConnections, setStudentConnections] = useState<Connection[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeachers = async () => {
            setLoading(true);
            try {
                const fetchedTeachers = await getAllTeachers();
                setTeachers(fetchedTeachers);
            } catch (error) {
                console.error("Failed to fetch teachers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();

        if (auth.currentUser) {
            const unsubscribe = getConnectionsForStudent(auth.currentUser.uid, setStudentConnections);
            return () => unsubscribe();
        }
    }, []);

    const handleSendRequest = async (teacherId: string) => {
        if (!auth.currentUser) {
            alert("You must be logged in to send a request.");
            return;
        }
        setIsSubmitting(teacherId);
        try {
            await createConnectionRequest(auth.currentUser.uid, teacherId);
        } catch (error) {
            console.error("Failed to send connection request:", error);
            alert("There was an error sending your request. Please try again.");
        } finally {
            setIsSubmitting(null);
        }
    };

    const getButtonState = (teacherId: string) => {
        const connection = studentConnections.find(c => c.teacherId === teacherId);
        if (connection) {
            if (connection.status === 'pending') {
                return { text: 'Request Sent', disabled: true, icon: <CheckIcon className="w-4 h-4" /> };
            }
            if (connection.status === 'accepted') {
                return { text: 'Connected', disabled: true, icon: <CheckIcon className="w-4 h-4" /> };
            }
        }
        if (isSubmitting === teacherId) {
             return { text: 'Sending...', disabled: true, icon: <UserPlusIcon className="w-4 h-4 animate-pulse" /> };
        }
        return { text: 'Send Request', disabled: false, icon: <UserPlusIcon className="w-4 h-4" /> };
    };

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Find a Teacher</h1>
            <p className="text-gray-500 dark:text-gray-400">Browse experts from around the world and connect for 1-on-1 help.</p>
            {loading ? <p>Loading teachers...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teachers.map(teacher => {
                        const { text, disabled, icon } = getButtonState(teacher.uid);
                        return (
                            <div key={teacher.uid} className="flex flex-col p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all transform hover:-translate-y-1">
                                <div className="flex items-center mb-3">
                                    <div className="relative">
                                        <img src={teacher.profileImageUrl || `https://i.pravatar.cc/150?u=${teacher.uid}`} alt={teacher.name} className="w-16 h-16 rounded-full object-cover" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{teacher.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{teacher.subjects.join(', ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 mt-auto">
                                    <button onClick={() => setViewingProfile(teacher)} className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                        <EyeIcon className="w-4 h-4" />
                                        <span>View Profile</span>
                                    </button>
                                    <button 
                                        onClick={() => handleSendRequest(teacher.uid)} 
                                        disabled={disabled}
                                        className={`w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-semibold text-white rounded-md transition-colors ${
                                            disabled ? 'bg-purple-400 dark:bg-purple-800 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                                        }`}
                                    >
                                        {icon}
                                        <span>{text}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {viewingProfile && (
                <TeacherProfileModal teacher={viewingProfile} onClose={() => setViewingProfile(null)} />
            )}
        </div>
    );
};