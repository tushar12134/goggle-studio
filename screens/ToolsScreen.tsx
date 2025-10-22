

import React, { useState } from 'react';
import { ToolType, ToolInfo } from '../types';
import { TOOL_DEFINITIONS } from '../constants';
import { NoteCreator } from './tools/NoteCreator';
import { ResumeBuilder } from './tools/ResumeBuilder';
import { FlashcardCreator } from './tools/FlashcardCreator';
import { PomodoroTimer } from './tools/PomodoroTimer';
import { Calculator } from './tools/Calculator';
import { FindTeacher } from './tools/FindTeacher';
import { Whiteboard } from './tools/Whiteboard';
import { CommunicationHub } from './tools/CommunicationHub';

interface ToolsScreenProps {
    initialTool?: ToolType | null;
    onToolExited?: () => void;
}

export const ToolsScreen: React.FC<ToolsScreenProps> = ({ initialTool, onToolExited }) => {
    const [activeTool, setActiveTool] = useState<ToolType | null>(initialTool || null);

    const renderActiveTool = () => {
        switch (activeTool) {
            case ToolType.NoteCreator:
                return <NoteCreator />;
            case ToolType.ResumeBuilder:
                return <ResumeBuilder />;
            case ToolType.Flashcards:
                return <FlashcardCreator />;
            case ToolType.Pomodoro:
                return <PomodoroTimer />;
            case ToolType.Calculator:
                return <Calculator />;
            case ToolType.Communication:
                return <FindTeacher />;
            case ToolType.Chat:
                return <CommunicationHub />;
            case ToolType.Whiteboard:
                return <Whiteboard />;
            default:
                return <ToolsDashboard onSelectTool={setActiveTool} />;
        }
    };

    const handleBackToDashboard = () => {
        setActiveTool(null);
        if (onToolExited) {
            onToolExited();
        }
    };
    
    if (activeTool) {
        return (
            <div className="animate-fade-in">
                <button
                    onClick={handleBackToDashboard}
                    className="mb-4 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    Back to Tools
                </button>
                {renderActiveTool()}
            </div>
        )
    }

    return <ToolsDashboard onSelectTool={setActiveTool} />;
};

interface ToolsDashboardProps {
    onSelectTool: (tool: ToolType) => void;
}

const ToolsDashboard: React.FC<ToolsDashboardProps> = ({ onSelectTool }) => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Productivity Tools</h1>
                <p className="text-gray-500 dark:text-gray-400">Everything you need to enhance your learning.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {TOOL_DEFINITIONS.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} onClick={() => onSelectTool(tool.id)} />
                ))}
            </div>
        </div>
    );
};

interface ToolCardProps {
    tool: ToolInfo;
    onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => (
    <button
        onClick={onClick}
        className="bg-white dark:bg-gray-800 p-4 rounded-2xl text-center transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700/60 transform hover:-translate-y-1.5 active:scale-95 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
    >
        <div className="text-purple-500 dark:text-purple-400 w-14 h-14 mx-auto flex items-center justify-center bg-purple-500/10 dark:bg-purple-400/10 rounded-xl mb-3">
            {tool.icon}
        </div>
        <p className="font-semibold text-gray-800 dark:text-white">{tool.label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tool.description}</p>
    </button>
);