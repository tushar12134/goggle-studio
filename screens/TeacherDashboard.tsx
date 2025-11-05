import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Connection, LearningProgress, SharedMaterial, Assignment } from '../types';
import { CheckIcon, XMarkIcon, BriefcaseIcon, UsersIcon, BellIcon, BookIcon } from '../constants';
import { getConnectionsForTeacher, updateConnectionStatus, getUserProfile, getMaterialsForTeacher, getAssignmentsForStudent } from '../services/firebaseService';
import StudentDetailModal from '../components/teacher/StudentDetailModal';

interface TeacherDashboardProps {
  userProfile: UserProfile;
}

// Helper function to calculate progress
const calculateOverallProgress = (progress?: LearningProgress): number => {
    if (!progress || !progress.totalAssignments || !progress.studyGoal) return 0;

    const assignmentProgress = (progress.completedAssignments / progress.totalAssignments) * 100;
    const quizProgress = progress.averageQuizScore; // Assumed to be a percentage already
    const studyProgress = (progress.studyHours / progress.studyGoal) * 100;

    const overall = (assignmentProgress + quizProgress + studyProgress) / 3;
    
    return Math.min(100, Math.round(overall)); // Cap at 100
};


export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ userProfile }) => {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [studentProfiles, setStudentProfiles] = useState<Record<string, UserProfile>>({});
    const [studentAssignments, setStudentAssignments] = useState<Record<string, Assignment[]>>({});
    const [loading, setLoading] = useState(true);
    const [sharedMaterials, setSharedMaterials] = useState<SharedMaterial[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);


    useEffect(() => {
        if (userProfile?.uid) {
            setLoading(true);
            const unsubscribeConnections = getConnectionsForTeacher(userProfile.uid, (fetchedConnections) => {
                setConnections(fetchedConnections);
                setLoading(false);
            });
            const unsubscribeMaterials = getMaterialsForTeacher(userProfile.uid, setSharedMaterials);
            return () => {
                unsubscribeConnections();
                unsubscribeMaterials();
            };
        }
    }, [userProfile?.uid]);

    const pendingRequests = useMemo(() => connections.filter(c => c.status === 'pending'), [connections]);
    const acceptedStudents = useMemo(() => connections.filter(c => c.status === 'accepted'), [connections]);

    useEffect(() => {
        const studentIds = acceptedStudents.map(c => c.studentId);
        const unsubscribers: (() => void)[] = [];

        const fetchStudentData = async () => {
            const profilesToFetch = studentIds.filter(id => !studentProfiles[id]);
            if (profilesToFetch.length > 0) {
                const profilePromises = profilesToFetch.map(id => getUserProfile(id));
                const profiles = await Promise.all(profilePromises);
                const newProfiles: Record<string, UserProfile> = {};
                profiles.forEach(p => p && (newProfiles[p.uid] = p));
                setStudentProfiles(prev => ({ ...prev, ...newProfiles }));
            }
            
            // Subscribe to assignments for each student
            studentIds.forEach(studentId => {
                const unsubscribe = getAssignmentsForStudent(studentId, (assignments) => {
                    setStudentAssignments(prev => ({...prev, [studentId]: assignments.filter(a => a.teacherId === userProfile.uid)}));
                });
                unsubscribers.push(unsubscribe);
            });
        };

        if (acceptedStudents.length > 0) {
            fetchStudentData();
        }

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [acceptedStudents, userProfile.uid]);


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
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Connection Requests ({pendingRequests.length})</h2>
                {loading ? <p>Loading requests...</p> : 
                pendingRequests.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
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

            <div className="lg:col-span-2 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">My Students ({acceptedStudents.length})</h2>
                {loading ? <p>Loading students...</p> : 
                acceptedStudents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                        {acceptedStudents.map(studentConnection => {
                            const studentProfile = studentProfiles[studentConnection.studentId];
                            if (!studentProfile) return <div key={studentConnection.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg animate-pulse h-28"></div>;
                            const progress = calculateOverallProgress(studentProfile.learningProgress);
                            return (
                                <button key={studentConnection.id} onClick={() => setSelectedStudent(studentProfile)} className="text-left flex flex-col p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors">
                                    <div className="flex items-center">
                                        <img src={studentProfile.profileImageUrl || `https://i.pravatar.cc/150?u=${studentProfile.uid}`} alt={studentProfile.name} className="w-10 h-10 rounded-full" />
                                        <div className="ml-3 flex-1">
                                            <p className="font-semibold">{studentProfile.name}</p>
                                            <span className="text-xs text-purple-500 hover:underline">View Details</span>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Overall Progress</span>
                                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : <p className="text-gray-500 dark:text-gray-400">You haven't accepted any students yet.</p>
                }
            </div>
        </div>
         <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Recently Shared Materials</h2>
            {sharedMaterials.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {sharedMaterials.map(material => (
                        <div key={material.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
                            <p className="font-semibold truncate pr-4">{material.title}</p>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600 uppercase font-semibold">{material.type}</span>
                        </div>
                    ))}
                </div>
            ) : <p className="text-gray-500 dark:text-gray-400">You haven't shared any materials yet.</p>}
        </div>
        {selectedStudent && (
            <StudentDetailModal 
                student={selectedStudent} 
                assignments={studentAssignments[selectedStudent.uid] || []}
                onClose={() => setSelectedStudent(null)}
            />
        )}
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