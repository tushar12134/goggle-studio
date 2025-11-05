import React, { useState } from 'react';
import { UserProfile, SharedMaterial } from '../types';
import { uploadSharedFile, shareMaterial } from '../services/firebaseService';

interface ShareMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

const ShareMaterialModal: React.FC<ShareMaterialModalProps> = ({ isOpen, onClose, userProfile }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'file' | 'link'>('file');
    const [file, setFile] = useState<File | null>(null);
    const [link, setLink] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                setError('File is too large. Maximum size is 10MB.');
                setFile(null);
            } else {
                setError('');
                setFile(selectedFile);
            }
        }
    };

    const handleShare = async () => {
        if (!title.trim() || !description.trim()) {
            setError('Please fill out the title and description.');
            return;
        }
        if (type === 'file' && !file) {
            setError('Please select a file to upload.');
            return;
        }
        if (type === 'link' && !link.trim()) {
            setError('Please enter a valid URL.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            let materialData: Omit<SharedMaterial, 'id' | 'createdAt'>;

            if (type === 'file' && file) {
                const uploadResult = await uploadSharedFile(file, userProfile.uid);
                materialData = {
                    teacherId: userProfile.uid,
                    teacherName: userProfile.name,
                    title, description, type: 'file',
                    url: uploadResult.url,
                    fileName: uploadResult.name,
                    fileType: uploadResult.type,
                };
            } else {
                materialData = {
                    teacherId: userProfile.uid,
                    teacherName: userProfile.name,
                    title, description, type: 'link', url: link,
                };
            }
            await shareMaterial(materialData);
            onClose();
        } catch (err) {
            console.error("Failed to share material:", err);
            setError("Could not share material. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg transform transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Share Material</h2>
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
                    </div>
                    {error && <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded-md">{error}</p>}
                    <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 h-24 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <button onClick={() => setType('file')} className={`w-full py-2 rounded-md font-semibold ${type === 'file' ? 'bg-white dark:bg-gray-800 shadow text-purple-600' : ''}`}>File</button>
                        <button onClick={() => setType('link')} className={`w-full py-2 rounded-md font-semibold ${type === 'link' ? 'bg-white dark:bg-gray-800 shadow text-purple-600' : ''}`}>Link</button>
                    </div>
                    {type === 'file' ? (
                        <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                            <input type="file" onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-purple-100 dark:file:bg-purple-900 file:text-purple-700 dark:file:text-purple-300 hover:file:bg-purple-200"/>
                            {file && <p className="text-xs mt-2 text-gray-500">Selected: {file.name}</p>}
                        </div>
                    ) : (
                        <input type="url" placeholder="https://example.com" value={link} onChange={e => setLink(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"/>
                    )}
                    <button onClick={handleShare} disabled={isLoading} className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 disabled:bg-purple-400">
                        {isLoading ? 'Sharing...' : 'Share Material'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareMaterialModal;