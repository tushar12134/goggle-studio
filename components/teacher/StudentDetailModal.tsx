import React from 'react';
import { UserProfile, Assignment } from '../../types';

interface StudentDetailModalProps {
  student: UserProfile;
  assignments: Assignment[]; // Pass in all assignments for this student
  onClose: () => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ student, assignments, onClose }) => {
    
    const calculateOverallProgress = (progress?: any): number => {
        if (!progress) return 0;
        const { completedAssignments = 0, totalAssignments = 1, averageQuizScore = 0, studyHours = 0, studyGoal = 1 } = progress;
        const assignmentProgress = (completedAssignments / totalAssignments) * 100;
        const studyProgress = (studyHours / studyGoal) * 100;
        return Math.round((assignmentProgress + averageQuizScore + studyProgress) / 3);
    };

    const overallProgress = calculateOverallProgress(student.learningProgress);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg transform transition-all duration-300 animate-pop-in">
        <div className="relative p-6">
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="flex items-center space-x-4 mb-4">
            <img src={student.profileImageUrl || `https://i.pravatar.cc/150?u=${student.uid}`} alt={student.name} className="w-20 h-20 rounded-full object-cover" />
            <div>
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <p className="text-md text-gray-600 dark:text-gray-400">{student.institution} - {student.grade}</p>
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
                <h3 className="font-semibold text-lg border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">Overall Progress</h3>
                <div className="flex items-center gap-4">
                    <p className="text-4xl font-bold text-purple-600">{overallProgress}%</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div className="bg-purple-600 h-4 rounded-full" style={{width: `${overallProgress}%`}}></div>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-lg border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">Assignments</h3>
                <div className="space-y-2">
                    {assignments.length > 0 ? assignments.map(assignment => (
                        <div key={assignment.id} className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{assignment.title}</p>
                                <p className="text-xs text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">{assignment.status}</span>
                        </div>
                    )) : (
                        <p className="text-sm text-gray-500">No assignments from you for this student yet.</p>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
