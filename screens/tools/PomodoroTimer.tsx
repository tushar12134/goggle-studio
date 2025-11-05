


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CogIcon, ForwardIcon } from '../../constants';

const DEFAULT_SETTINGS = {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    cycles: 4,
};

// Helper to get settings from localStorage
const getSettings = () => {
    try {
        const storedSettings = localStorage.getItem('pomodoroSettings');
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            // Validate parsed settings to ensure all keys are present
            return { ...DEFAULT_SETTINGS, ...parsed };
        }
    } catch (error) {
        console.error("Failed to parse pomodoro settings from localStorage", error);
    }
    return DEFAULT_SETTINGS;
};


export const PomodoroTimer: React.FC = () => {
    const [settings, setSettings] = useState(getSettings);
    const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
    const [time, setTime] = useState(settings.work * 60);
    const [isActive, setIsActive] = useState(false);
    const [cyclesCompleted, setCyclesCompleted] = useState(0);
    const [showSettings, setShowSettings] = useState(false);

    // --- Notification Logic ---
    const requestNotificationPermission = useCallback(() => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        } else if (Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);
    
    useEffect(() => {
        requestNotificationPermission();
    }, [requestNotificationPermission]);

    const sendNotification = (message: string) => {
        console.log(`Pomodoro Timer: ${message}`); // Always log to console
        if (Notification.permission === "granted") {
            new Notification("Edgelearn Pomodoro", {
                body: message,
                icon: '/vite.svg', // Assuming vite.svg is the app icon
            });
        } else {
             // Fallback for when notifications are not granted
             alert(`Pomodoro Timer:\n${message}`);
        }
    };
    
    // --- Timer Core Logic ---
    const startNextInterval = useCallback(() => {
        setIsActive(false);
        let nextMode: typeof mode = 'work';
        let notificationMessage = '';
        
        if (mode === 'work') {
            const newCyclesCompleted = cyclesCompleted + 1;
            setCyclesCompleted(newCyclesCompleted);
            
            if (newCyclesCompleted > 0 && newCyclesCompleted % settings.cycles === 0) {
                nextMode = 'longBreak';
                notificationMessage = `Work session complete! Time for a long break (${settings.longBreak} minutes).`;
            } else {
                nextMode = 'shortBreak';
                notificationMessage = `Work session complete! Time for a short break (${settings.shortBreak} minutes).`;
            }
        } else { // shortBreak or longBreak
            nextMode = 'work';
            notificationMessage = "Break's over! Time to get back to work.";
        }
        
        sendNotification(notificationMessage);
        setMode(nextMode);
    }, [mode, cyclesCompleted, settings]);


    useEffect(() => {
        // FIX: Use window.setInterval to explicitly use the browser's timer function,
        // which returns a `number`, resolving the type conflict with NodeJS.Timeout.
        let interval: number | null = null;
        if (isActive && time > 0) {
            interval = window.setInterval(() => {
                setTime(t => t - 1);
            }, 1000);
        } else if (time === 0 && isActive) {
            startNextInterval();
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [isActive, time, startNextInterval]);

     // Update time display when mode or settings change
    useEffect(() => {
        // Only reset time if the timer is not active, to prevent jarring changes
        if (!isActive) {
            let newTime;
            switch(mode) {
                case 'work': newTime = settings.work * 60; break;
                case 'shortBreak': newTime = settings.shortBreak * 60; break;
                case 'longBreak': newTime = settings.longBreak * 60; break;
            }
            setTime(newTime);
        }
    }, [mode, settings]);


    // --- User Actions ---
    const toggleTimer = useCallback(() => setIsActive(prev => !prev), []);

    const resetTimer = useCallback(() => {
        setIsActive(false);
        setMode('work');
        setTime(settings.work * 60);
        setCyclesCompleted(0);
    }, [settings.work]);

    const skipInterval = useCallback(() => {
        if(window.confirm(`Are you sure you want to skip the rest of this ${mode} session?`)) {
            startNextInterval();
        }
    }, [mode, startNextInterval]);

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.target as HTMLElement).tagName === 'INPUT') return; // Ignore keypresses in settings inputs

            switch (event.key) {
                case ' ': // Spacebar
                    event.preventDefault();
                    toggleTimer();
                    break;
                case 'r':
                case 'R':
                    resetTimer();
                    break;
                case 's':
                case 'S':
                    skipInterval();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [toggleTimer, resetTimer, skipInterval]);

    
    // --- Settings Management ---
    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newSettings = { ...settings, [name]: parseInt(value, 10) || 0 };
        setSettings(newSettings);
        localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
    };

    // --- UI Computations ---
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    const totalDuration = useMemo(() => {
        switch(mode) {
            case 'work': return settings.work * 60;
            case 'shortBreak': return settings.shortBreak * 60;
            case 'longBreak': return settings.longBreak * 60;
        }
    }, [mode, settings]);
    
    const progress = (totalDuration - time) / totalDuration;
    const circumference = 2 * Math.PI * 110; // 110 is the radius
    const strokeDashoffset = circumference - progress * circumference;

    const modeText = useMemo(() => {
        switch(mode) {
            case 'work': return 'Work';
            case 'shortBreak': return 'Short Break';
            case 'longBreak': return 'Long Break';
        }
    }, [mode]);

    return (
        <div className="flex flex-col items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-[calc(100vh-150px)] relative">
            
            {/* Settings Button */}
            <div className="w-full flex justify-end">
                <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                    <CogIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Timer Display */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="124" cy="132" r="110" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-300 dark:text-gray-600" />
                    <circle
                        cx="124"
                        cy="132"
                        r="110"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className={`transition-all duration-500 ${mode === 'work' ? 'text-purple-500' : 'text-emerald-500'}`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="text-center">
                    <p className="text-5xl font-bold text-gray-800 dark:text-gray-200">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</p>
                    <p className="text-lg uppercase tracking-wider text-gray-500 dark:text-gray-400">{modeText}</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
                <button onClick={resetTimer} className="px-6 py-3 font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors">
                    Reset
                </button>
                <button onClick={toggleTimer} className={`px-10 py-4 text-2xl font-semibold rounded-lg transition-colors text-white ${isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-600 hover:bg-purple-700'}`}>
                    {isActive ? 'Pause' : 'Start'}
                </button>
                 <button onClick={skipInterval} className="p-3 font-semibold rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors" title="Skip Interval (s)">
                    <ForwardIcon className="w-6 h-6" />
                </button>
            </div>
            
            {/* Cycles Display */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Cycles until long break: {settings.cycles - (cyclesCompleted % settings.cycles)}
            </p>

            {/* Settings Panel */}
            {showSettings && (
                 <div className="absolute inset-0 bg-white dark:bg-gray-800 p-4 rounded-lg flex flex-col space-y-4 animate-fade-in z-10">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Settings</h3>
                        <button onClick={() => setShowSettings(false)} className="text-2xl font-bold">&times;</button>
                    </div>
                     <div className="space-y-3">
                         <SettingInput label="Work (minutes)" name="work" value={settings.work} onChange={handleSettingsChange} />
                         <SettingInput label="Short Break (minutes)" name="shortBreak" value={settings.shortBreak} onChange={handleSettingsChange} />
                         <SettingInput label="Long Break (minutes)" name="longBreak" value={settings.longBreak} onChange={handleSettingsChange} />
                         <SettingInput label="Cycles until long break" name="cycles" value={settings.cycles} onChange={handleSettingsChange} />
                     </div>
                     <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <p><strong>Keyboard Shortcuts:</strong></p>
                        <p><kbd className="font-mono p-1 bg-gray-200 dark:bg-gray-700 rounded">Spacebar</kbd> to Start/Pause</p>
                        <p><kbd className="font-mono p-1 bg-gray-200 dark:bg-gray-700 rounded">s</kbd> to Skip</p>
                        <p><kbd className="font-mono p-1 bg-gray-200 dark:bg-gray-700 rounded">r</kbd> to Reset</p>
                     </div>
                 </div>
            )}
        </div>
    );
};

interface SettingInputProps {
    label: string;
    name: keyof typeof DEFAULT_SETTINGS;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const SettingInput: React.FC<SettingInputProps> = ({ label, name, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <input
            type="number"
            name={name}
            value={value}
            onChange={onChange}
            min="1"
            className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
        />
    </div>
);