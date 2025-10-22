import React, { useState } from 'react';
import { Achievement } from '../types';
import { AcademicCapIcon, FireIcon, BoltIcon, TrophyIcon } from '../constants';

// --- MOCK DATA ---
const recentSubjects = [
    { name: 'Quantum Physics', progress: 75, color: 'bg-purple-500' },
    { name: 'Calculus II', progress: 40, color: 'bg-sky-500' },
    { name: 'Organic Chemistry', progress: 90, color: 'bg-emerald-500' },
];

const allSubjects = [
    ...recentSubjects,
    { name: 'Linear Algebra', progress: 100, color: 'bg-amber-500' },
    { name: 'English Literature', progress: 65, color: 'bg-pink-500' },
    { name: 'World History', progress: 20, color: 'bg-rose-500' },
];

const studyData = {
    week: [
        { day: 'Mon', hours: 2 }, { day: 'Tue', hours: 3 }, { day: 'Wed', hours: 2.5 },
        { day: 'Thu', hours: 4 }, { day: 'Fri', hours: 1.5 }, { day: 'Sat', hours: 5 },
        { day: 'Sun', hours: 1 },
    ],
    month: [
        { day: 'W1', hours: 15 }, { day: 'W2', hours: 18 }, { day: 'W3', hours: 12 },
        { day: 'W4', hours: 20 },
    ],
};

const achievements: Achievement[] = [
    { id: 'streak_7', title: '7-Day Study Streak', description: 'Consistency is key!', icon: <FireIcon className="w-8 h-8" />, unlocked: true },
    { id: 'master_algebra', title: 'Algebra Master', description: 'Completed the Linear Algebra course.', icon: <AcademicCapIcon className="w-8 h-8" />, unlocked: true },
    { id: 'quick_learner', title: 'Quick Learner', description: 'Mastered 5 topics in a single day.', icon: <BoltIcon className="w-8 h-8" />, unlocked: false },
    { id: 'top_performer', title: 'Top Performer', description: 'Scored 95%+ in a subject test.', icon: <TrophyIcon className="w-8 h-8" />, unlocked: true },
];
// --- END MOCK DATA ---

export const ReportScreen: React.FC = () => {
    const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');

    const pieChartData = allSubjects.map(s => ({ name: s.name, value: s.progress, color: s.color.replace('bg-', '') }));
    const conicGradient = pieChartData.reduce((acc, subject, index, arr) => {
        const total = arr.reduce((sum, s) => sum + s.value, 0);
        const start = acc.lastEnd;
        const end = start + (subject.value / total) * 360;
        const color = subject.color.includes('-') ? subject.color.split('-')[0] + `-${subject.color.split('-')[1]}` : 'gray-500';
        acc.str += `, var(--tw-color-${color}) ${start}deg ${end}deg`;
        acc.lastEnd = end;
        return acc;
    }, { str: '', lastEnd: 0 }).str.substring(2);

    return (
        <div className="space-y-6">
            {/* Continue Learning */}
            <ReportSection title="🚀 Continue Learning">
                <div className="grid md:grid-cols-3 gap-4">
                    {recentSubjects.map(subject => (
                        <SubjectProgressCard key={subject.name} subject={subject} />
                    ))}
                </div>
            </ReportSection>

            {/* Overall Progress */}
            <ReportSection title="📚 Overall Subject Progress">
                 <div className="space-y-3">
                    {allSubjects.map(subject => (
                        <SubjectProgressBar key={subject.name} subject={subject} />
                    ))}
                </div>
            </ReportSection>

            {/* Study Time Analysis */}
            <div className="grid lg:grid-cols-2 gap-6">
                <ReportSection title="📊 Study Distribution">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div
                            className="w-32 h-32 rounded-full flex-shrink-0"
                            style={{ background: `conic-gradient(${conicGradient})` }}
                        ></div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            {pieChartData.map(d => (
                                <div key={d.name} className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-sm bg-${d.color}`}></div>
                                    <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ReportSection>
                <ReportSection title="🗓️ Personalized Study Log">
                    <div className="flex justify-end mb-2">
                        <div className="flex p-1 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">
                            <button onClick={() => setTimeFilter('week')} className={`px-3 py-1 rounded-md ${timeFilter === 'week' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>This Week</button>
                            <button onClick={() => setTimeFilter('month')} className={`px-3 py-1 rounded-md ${timeFilter === 'month' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>This Month</button>
                        </div>
                    </div>
                    <div className="h-40 flex items-end justify-between gap-2 px-2">
                        {studyData[timeFilter].map(d => (
                             <div key={d.day} className="flex-1 flex flex-col items-center group">
                                <div className="w-full h-full flex items-end">
                                    <div style={{ height: `${(d.hours / Math.max(...studyData[timeFilter].map(s => s.hours))) * 100}%` }} className="w-full bg-purple-300 dark:bg-purple-700 rounded-t-md group-hover:bg-purple-500 transition-colors"></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{d.day}</p>
                            </div>
                        ))}
                    </div>
                </ReportSection>
            </div>

            {/* Achievements */}
            <ReportSection title="🏆 Achievements">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {achievements.map(ach => (
                        <AchievementCard key={ach.id} achievement={ach} />
                    ))}
                </div>
            </ReportSection>
        </div>
    );
};

// --- Sub-components ---
const ReportSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
        {children}
    </div>
);

const SubjectProgressCard: React.FC<{ subject: { name: string; progress: number; color: string } }> = ({ subject }) => (
    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{subject.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subject.progress}% complete</p>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
            <div className={`${subject.color} h-2 rounded-full`} style={{ width: `${subject.progress}%` }}></div>
        </div>
    </div>
);

const SubjectProgressBar: React.FC<{ subject: { name: string; progress: number; color: string } }> = ({ subject }) => (
     <div className="flex items-center gap-4">
        <p className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{subject.name}</p>
        <div className="w-2/3 bg-gray-200 dark:bg-gray-600 rounded-full h-4">
            <div className={`${subject.color} h-4 rounded-full flex items-center justify-center text-xs font-bold text-white`} style={{ width: `${subject.progress}%` }}>
                {subject.progress}%
            </div>
        </div>
    </div>
);

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <div className={`p-4 rounded-xl border-2 flex flex-col items-center text-center transition-all ${achievement.unlocked ? 'border-amber-400 bg-amber-500/10' : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700'}`}>
        <div className={`w-14 h-14 mb-2 flex items-center justify-center rounded-full ${achievement.unlocked ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
            {achievement.icon}
        </div>
        <h4 className={`font-bold text-sm ${achievement.unlocked ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{achievement.title}</h4>
        {!achievement.unlocked && <p className="text-xs text-gray-400 dark:text-gray-500">(Locked)</p>}
    </div>
);