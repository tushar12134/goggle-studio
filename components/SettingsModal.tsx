import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => (
    <button onClick={() => onChange(!enabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('notificationSound') === 'true');
  const [volume, setVolume] = useState(() => parseInt(localStorage.getItem('notificationVolume') || '80', 10));

  useEffect(() => {
    localStorage.setItem('notificationSound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('notificationVolume', String(volume));
  }, [volume]);

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="relative p-6">
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
          <h2 className="text-2xl font-bold text-center mb-6">Settings</h2>
          
          <div className="space-y-6">
            {/* Notification Settings */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <h3 className="font-semibold mb-3">Notifications</h3>
                 <div className="flex items-center justify-between mb-4">
                    <p>Notification Sound</p>
                    <ToggleSwitch enabled={soundEnabled} onChange={setSoundEnabled} />
                </div>
                <div className="flex items-center justify-between">
                    <p>Volume</p>
                    <div className="flex items-center space-x-3 w-1/2">
                         <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                            disabled={!soundEnabled}
                        />
                        <span className="text-sm font-semibold w-10 text-right">{volume}%</span>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;