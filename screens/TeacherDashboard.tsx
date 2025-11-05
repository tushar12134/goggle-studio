import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Connection } from '../types';
import { CheckIcon, XMarkIcon, BriefcaseIcon, UsersIcon, BellIcon, BookIcon } from '../constants';
import { getConnectionsForTeacher, updateConnectionStatus } from '../services/firebaseService';

interface TeacherDashboardProps {
  userProfile: UserProfile;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ userProfile }) => {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userProfile?.uid) {
            setLoading(true);
            const unsubscribe = getConnectionsForTeacher(userProfile.uid, (fetchedConnections) => {
                setConnections(fetchedConnections);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [userProfile?.uid]);

    const pendingRequests = useMemo(() => connections.filter(c => c.status === 'pending'), [connections]);
    const acceptedStudents = useMemo(() => connections.filter(c => c.status === 'accepted'), [connections]);

    const handleConnectionUpdate = async (connectionId: string, status: 'accepted' | 'rejected') => {
        try {
            await updateConnectionStatus(connectionId, status);
        } catch (error) {
            console.error(`Failed to update connection status to ${status}`, error);
            alert("There was an error processing the request.");
        }
    };

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-500 text-white shadow-lg flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
                <p className="mt-1 text-sky-200">Welcome, {userProfile.name}!</p>
            </div>
            {userProfile.profileImageUrl && (
                <img src={userProfile.profileImageUrl} alt={userProfile.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/50" />
            )}
        </div>
      
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<UsersIcon className="w-7 h-7" />} label="Total Students" value={acceptedStudents.length} color="text-purple-500" bgColor="bg-purple-100 dark:bg-purple-900/30" />
            <StatCard icon={<BellIcon className="w-7 h-7" />} label="New Requests" value={pendingRequests.length} color="text-amber-500" bgColor="bg-amber-100 dark:bg-amber-900/30" />
            <StatCard icon={<BriefcaseIcon className="w-7 h-7" />} label="Classes" value={2} color="text-sky-500" bgColor="bg-sky-100 dark:bg-sky-900/30" />
            <StatCard icon={<BookIcon className="w-7 h-7" />} label="Subjects" value={userProfile.subjects.length} color="text-emerald-500" bgColor="bg-emerald-100 dark:bg-emerald-900/30" />
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionCard label="Create Assignment" onClick={() => alert("Feature coming soon!")} />
                <QuickActionCard label="Share Material" onClick={() => alert("Feature coming soon!")} />
                <QuickActionCard label="Schedule Class" onClick={() => alert("Feature coming soon!")} />
                <QuickActionCard label="View Reports" onClick={() => alert("Feature coming soon!")} />
            </div>
        </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Connection Requests ({pendingRequests.length})</h2>
                {loading ? <p>Loading requests...</p> : 
                pendingRequests.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {pendingRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <img src={req.studentProfileImageUrl || `https://i.pravatar.cc/150?u=${req.studentId}`} alt={req.studentName} className="w-10 h-10 rounded-full" />
                                    <span className="font-semibold">{req.studentName}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => handleConnectionUpdate(req.id, 'accepted')} className="p-2 bg-green-500/20 text-green-600 rounded-full hover:bg-green-500/30 transition-colors"><CheckIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleConnectionUpdate(req.id, 'rejected')} className="p-2 bg-red-500/20 text-red-600 rounded-full hover:bg-red-500/30 transition-colors"><XMarkIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500 dark:text-gray-400">No new connection requests.</p>
                }
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">My Students ({acceptedStudents.length})</h2>
                {loading ? <p>Loading students...</p> : 
                acceptedStudents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                        {acceptedStudents.map(student => (
                            <div key={student.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <img src={student.studentProfileImageUrl || `https://i.pravatar.cc/150?u=${student.studentId}`} alt={student.studentName} className="w-10 h-10 rounded-full" />
                                <div className="ml-3">
                                    <p className="font-semibold">{student.studentName}</p>
                                    <button className="text-xs text-purple-500 hover:underline">View Progress</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-gray-500 dark:text-gray-400">You haven't accepted any students yet.</p>
                }
            </div>
        </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bgColor }: { icon: React.ReactNode, label: string, value: string | number, color: string, bgColor: string}) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center space-x-4 border border-gray-200 dark:border-gray-700">
        <div className={`p-3 rounded-full ${bgColor} ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const QuickActionCard = ({ label, onClick }: { label: string, onClick: () => void }) => (
    <button onClick={onClick} className="bg-gray-100 dark:bg-gray-700/60 p-4 rounded-2xl text-center transition-all duration-300 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700 transform hover:-translate-y-1 active:scale-95 border border-gray-200 dark:border-gray-700/60">
        <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
    </button>
);
