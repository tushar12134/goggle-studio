import React, { useState, useEffect } from 'react';
import { UserProfile, Connection, Assignment } from '../types';
import { getConnectionsForTeacher, createAssignment } from '../services/firebaseService';
import firebase from 'firebase/compat/app';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherProfile: UserProfile;
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose, teacherProfile }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(teacherProfile.subjects[0] || '');
  const [dueDate, setDueDate] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = getConnectionsForTeacher(teacherProfile.uid, (fetchedConnections) => {
        setConnections(fetchedConnections.filter(c => c.status === 'accepted'));
      });
      return () => unsubscribe();
    }
  }, [isOpen, teacherProfile.uid]);

  const handleSelectAll = () => {
    if (selectedStudents.length === connections.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(connections.map(c => c.studentId));
    }
  };
  
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const handleSubmit = async () => {
    if (!title || !description || !subject || !dueDate || selectedStudents.length === 0) {
      setError('Please fill all fields and select at least one student.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const assignmentData: Omit<Assignment, 'id'> = {
        title,
        description,
        subject,
        dueDate: firebase.firestore.Timestamp.fromDate(new Date(dueDate)),
        teacherId: teacherProfile.uid,
        assignedTo: selectedStudents,
        status: 'Assigned',
      };
      await createAssignment(assignmentData);
      onClose();
    } catch (err) {
      console.error("Failed to create assignment:", err);
      setError("Could not create assignment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg transform transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Create Assignment</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
          </div>
          {error && <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded-md">{error}</p>}
          
          <input type="text" placeholder="Assignment Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" />
          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 h-24 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" />
          
          <div className="grid grid-cols-2 gap-4">
            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
              {teacherProfile.subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Assign to Students</h3>
                <button onClick={handleSelectAll} className="text-sm font-semibold text-purple-600 hover:underline">
                    {selectedStudents.length === connections.length ? 'Deselect All' : 'Select All'}
                </button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                {connections.map(conn => (
                    <div key={conn.studentId} className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                        <input 
                            type="checkbox" 
                            id={`student-${conn.studentId}`} 
                            checked={selectedStudents.includes(conn.studentId)}
                            onChange={() => handleStudentSelect(conn.studentId)}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor={`student-${conn.studentId}`} className="flex-1 cursor-pointer">{conn.studentName}</label>
                    </div>
                ))}
            </div>
          </div>
          
          <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 disabled:bg-purple-400">
            {isLoading ? 'Assigning...' : 'Create Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignmentModal;
