import React from 'react';
import { NavItem, Screen, AITutorMode, AITutorModeInfo, ToolType, ToolInfo, Teacher } from './types';

// Icons
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>
);
export const AITutorIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V8.25a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 8.25v7.5A2.25 2.25 0 0 0 6.75 18z" /></svg>
);
export const ToolsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-.95.591.054 1.022.572 1.022 1.159v.188l-2.132 3.196-1.558.23-2.25-3.001.527-1.621 1.022-.159zM12 6.38l.537.805 2.132-3.196-.527-1.62-1.022.158-.537.805zm8.822 1.631l-1.022-.159-.527 1.621-2.25 3.001-1.558-.23 2.132-3.196V4.159c0-.587.43-1.105 1.022-1.159.55-.057 1.02.408 1.11.95zM4.755 18.06l.537-.805 2.132 3.196-.527 1.62-1.022-.158-.537-.805zm9.49 0l.537-.805 2.132 3.196-.527 1.62-1.022-.158-.537-.805z" /></svg>
);
export const ReportIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5z" /></svg>
);
export const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);
export const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);
export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.742-.587 9.094 9.094 0 0 0-3.742.587m-12 0a9.094 9.094 0 0 1 3.742-.587 9.094 9.094 0 0 1-3.742.587m15.75-12a9.094 9.094 0 0 0-3.742-.587m-12 0a9.094 9.094 0 0 1 3.742-.587m0 0V21m6-21v21m-6-15a9.094 9.094 0 0 1 6 0v15a9.094 9.094 0 0 1-6 0v-15Z" /></svg>
);
export const StreakIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>
);
export const BookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></svg>
);
export const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>
);
export const ChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5z" /></svg>
);
export const ChatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 0 1-2.53-0.417m-4.75-2.132a9.76 9.76 0 0 1-1.423-3.083A4.5 4.5 0 0 1 7.5 6h9A4.5 4.5 0 0 1 21 10.5v1.5Z" /></svg>
);
export const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12.04,11.02c-1.3,0-2.36,1.06-2.36,2.36s1.06,2.36,2.36,2.36s2.36-1.06,2.36-2.36S13.34,11.02,12.04,11.02z M12.04,14.9c-0.86,0-1.56-0.7-1.56-1.56s0.7-1.56,1.56-1.56s1.56,0.7,1.56,1.56S12.9,14.9,12.04,14.9z"/><path d="M18,3H6C4.3,3,3,4.3,3,6v12c0,1.7,1.3,3,3,3h12c1.7,0,3-1.3,3-3V6C21,4.3,19.7,3,18,3z M19,17.6c0,0.8-0.7,1.4-1.4,1.4H6.4c-0.8,0-1.4-0.7-1.4-1.4V6.4C5,5.7,5.7,5,6.4,5h11.2C18.3,5,19,5.7,19,6.4V17.6z"/><path d="M10.2,9.3L15,12l-4.8,2.7V9.3z"/></svg>
);
export const TextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>
);
export const CodeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" /></svg>
);
export const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
);
export const MicrophoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5a6 6 0 0 0-12 0v1.5a6 6 0 0 0 6 6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75v6" />
    </svg>
);
export const ScreenShareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m12 8.25 4.5 4.5m0 0-4.5 4.5m4.5-4.5H7.5" />
    </svg>
);
export const GraduationCapIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-2.072-1.036A48.922 48.922 0 0112 3.493a48.922 48.922 0 0111.542 5.617l-2.072 1.036m-16.974 0a50.57 50.57 0 002.658-.813" />
  </svg>
);
export const StudentRoleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path d="M12 14l9-5-9-5-9-5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
);
export const TeacherRoleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75h-7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 12.75h-7.5" />
    </svg>
);
export const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
    </svg>
);
export const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
);
export const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);
// Report Screen Icons
export const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.075c0 1.313-.964 2.446-2.25 2.612A32.38 32.38 0 0 1 12 21.03a32.38 32.38 0 0 1-6-0.243c-1.286-.166-2.25-1.299-2.25-2.612v-4.075m12 0c0-3.494-2.402-6.445-5.5-7.183m-1.41-1.41a1.5 1.5 0 0 1 1.41-1.41h1.41a1.5 1.5 0 0 1 1.41 1.41m-5.32 0a1.5 1.5 0 0 1 1.41 1.41h.21a1.5 1.5 0 0 1 1.41-1.41m-5.32 0h-1.41a1.5 1.5 0 0 0-1.41 1.41v.21a1.5 1.5 0 0 0 1.41 1.41h1.41m0-2.82a1.5 1.5 0 0 1 1.41-1.41" /></svg>);
export const ChipIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.59.435-1.087 1.023-1.154l.872-.065a1.855 1.855 0 0 1 1.633 1.096 1.855 1.855 0 0 1-1.096 2.502l-.872.436c-.588.293-1.25.048-1.54-.492V6.087z" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.875 15.333c0 .59-.435 1.087-1.023 1.154l-.872.065a1.855 1.855 0 0 1-1.633-1.096 1.855 1.855 0 0 1 1.096-2.502l.872-.436c.588-.293 1.25-.048 1.54.492v2.323z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.087c0-.59.435-1.087 1.023-1.154l.872-.065a1.855 1.855 0 0 1 1.633 1.096 1.855 1.855 0 0 1-1.096 2.502l-.872.436c-.588.293-1.25.048-1.54-.492V6.087z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15.333c0 .59-.435 1.087-1.023 1.154l-.872.065a1.855 1.855 0 0 1-1.633-1.096 1.855 1.855 0 0 1 1.096-2.502l.872-.436c.588-.293 1.25-.048 1.54.492v2.323z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" /></svg>);
export const CubeTransparentIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>);
export const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008h-.008v-.008Z" /></svg>);
export const ChatBubbleLeftRightIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.05 1.05 0 0 1-1.485 0l-3.72-3.72A2.123 2.123 0 0 1 9 17.286V13.5a9 9 0 0 1 6-8.25M15 13.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9.75 5.25A2.123 2.123 0 0 1 3 17.286V13.5a9 9 0 0 1 6-8.25M3 13.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);
export const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 3.75h16.5M5.25 19.5h13.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6.75v10.5A2.25 2.25 0 0 0 5.25 19.5Z" /></svg>);
export const CogIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-.95.591.054 1.022.572 1.022 1.159v.188l-2.132 3.196-1.558.23-2.25-3.001.527-1.621 1.022-.159zM12 6.38l.537.805 2.132-3.196-.527-1.62-1.022.158-.537.805zm8.822 1.631l-1.022-.159-.527 1.621-2.25 3.001-1.558-.23 2.132-3.196V4.159c0-.587.43-1.105 1.022-1.159.55-.057 1.02.408 1.11.95zM4.755 18.06l.537-.805 2.132 3.196-.527 1.62-1.022-.158-.537-.805zm9.49 0l.537-.805 2.132 3.196-.527 1.62-1.022-.158-.537-.805zm-4.745-6.38a3.75 3.75 0 0 1 5.036 0l.964 1.285a.75.75 0 0 0 1.25-.845l-1.09-1.453a5.25 5.25 0 0 0-7.05 0l-1.09 1.453a.75.75 0 0 0 1.25.845l.964-1.285z" /></svg>);
export const PaintBrushIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 4.5V3.375A1.875 1.875 0 0 0 10.875 1.5H9.75A1.875 1.875 0 0 0 7.875 3.375V4.5m4.875 0a4.5 4.5 0 0 1 4.5 4.5v.375m-4.5-4.875a4.5 4.5 0 0 0-4.5 4.5v.375m4.5-4.875c-2.438 0-4.5 2.063-4.5 4.5v.375m11.25 3.375v-3.375a4.5 4.5 0 0 0-4.5-4.5h-3.375a4.5 4.5 0 0 0-4.5 4.5v3.375m11.25 0a1.875 1.875 0 0 1 1.875 1.875v3.375a1.875 1.875 0 0 1-1.875 1.875h-3.375a1.875 1.875 0 0 1-1.875-1.875v-3.375a1.875 1.875 0 0 1 1.875-1.875h3.375Zm0 0h-3.375" /></svg>);
export const CommandLineIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5 3 12m0 0 3.75 4.5M3 12h18" /></svg>);
export const PuzzlePieceIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c.594-.28 1.255-.429 1.954-.429 1.132 0 2.21.378 3.054 1.054.845.676 1.341 1.638 1.341 2.659 0 .963-.424 1.84-1.125 2.485-1.29.585-2.731.54-3.99-.125l-2.095-.911a.75.75 0 0 0-.912.052l-2.095.911c-1.26.55-2.7.5-3.99.125-.7-.645-1.125-1.522-1.125-2.485 0-1.02.496-1.983 1.341-2.659.844-.676 1.922-1.054 3.054-1.054 1.132 0 2.21.378 3.054 1.054l2.095.911a.75.75 0 0 0 .912-.052l2.095-.911Z" /></svg>);
export const RocketLaunchIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v.08h.08a6 6 0 0 1 7.38-5.84l.08.08a6 6 0 0 1-5.84 7.38v.08h.08a6 6 0 0 1 7.38-5.84l.08.08a6 6 0 0 1-5.84 7.38v.08h.08a6 6 0 0 1 7.38-5.84z" /><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z" /></svg>);
export const MapIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.5-10.5h-7a.5.5 0 0 0-.5.5v12.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V5a.5.5 0 0 0-.5-.5z" /></svg>);
export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);
export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>);

// --- NEW TOOL ICONS ---
export const NoteIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>);
export const FlashcardIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 3h.008v.008H8.25v-.008zm0 3h.008v.008H8.25v-.008zm3-6h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm3-6h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zM9.75 6.75h4.5M11.25 18H3.75a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 013.75 4.5h16.5a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25h-6.75" /></svg>);
export const PomodoroIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v-1.5" /></svg>);
export const CalculatorIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v.01M12 18v.01" /></svg>);
export const ResumeIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632zM8.25 15h7.5" /></svg>);
export const VideoIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" /></svg>);
export const WhiteboardIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.5l-1.5-1.5" /></svg>);
export const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
);
export const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);
export const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);
export const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);
export const ClipboardDocumentIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m9.375 2.25c.621 0 1.125.504 1.125 1.125v3.5m0 0a3.375 3.375 0 0 1-3.375 3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-3.5m3.375 0h-3.375" />
    </svg>
);
export const ShuffleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h18M16.5 3l4.5 4.5m0 0L16.5 12m4.5-4.5H3" /></svg>);
export const RestartIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.691V5.25a2.25 2.25 0 0 0-2.25-2.25h-4.5a2.25 2.25 0 0 0-2.25 2.25v4.992m2.25 0-3.181-3.182a8.25 8.25 0 0 0-11.667 0l-3.181 3.182" /></svg>);
export const ForwardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
    </svg>
);
export const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
);
export const BeakerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.39.02.78.046 1.17.086a10.463 10.463 0 015.34 1.541M9.75 3.104a10.463 10.463 0 00-5.34 1.541m11.35 1.541c.44-.26.903-.49 1.385-.69a10.463 10.463 0 01-1.385-.69M4 14.5c0 .62.152 1.21.428 1.743A9.75 9.75 0 0012 21c.848 0 1.666-.102 2.45-.294A9.75 9.75 0 0020 14.5c0-.62-.152-1.21-.428-1.743m0-1.057a10.463 10.463 0 00-1.385.69m-11.35-1.541a10.463 10.463 0 011.385.69" />
    </svg>
);
export const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);


// --- NEW ACHIEVEMENT ICONS ---
export const FireIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 00-4.24-1.29 8.25 8.25 0 00-2.836.411 8.22 8.22 0 015.58-1.879 8.225 8.225 0 014.24 1.29Z" /></svg>);
export const AcademicCapIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14v6m-6-3.479V19.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-2.979" /></svg>);
export const BoltIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>);
export const TrophyIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 1011.64-8.03A9.75 9.75 0 0016.5 18.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75V3.75m0 16.5V18" /></svg>);
// --- END NEW TOOL ICONS ---
export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);
export const EraserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.75a8.966 8.966 0 0 1-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.5 12.75-9-9" />
    </svg>
);


export const NAV_ITEMS: NavItem[] = [
  { id: Screen.Home, label: 'Home', icon: <HomeIcon className="w-6 h-6" /> },
  { id: Screen.AITutor, label: 'AI Tutor', icon: <AITutorIcon className="w-6 h-6" /> },
  { id: Screen.Tools, label: 'Tools', icon: <ToolsIcon className="w-6 h-6" /> },
  { id: Screen.Report, label: 'Reports', icon: <ReportIcon className="w-6 h-6" /> },
  { id: Screen.Services, label: 'Services', icon: <BriefcaseIcon className="w-6 h-6" /> },
];

export const AI_TUTOR_MODES: AITutorModeInfo[] = [
    { id: AITutorMode.Chat, label: 'Chat Tutor', icon: <ChatIcon className="w-5 h-5 mr-2" /> },
    { id: AITutorMode.Voice, label: 'Voice Tutor', icon: <MicrophoneIcon className="w-5 h-5 mr-2" /> },
    { id: AITutorMode.Screen, label: 'Screen Share', icon: <ScreenShareIcon className="w-5 h-5 mr-2" /> },
    { id: AITutorMode.YouTube, label: 'YouTube', icon: <YouTubeIcon className="w-5 h-5 mr-2" /> },
    { id: AITutorMode.Text, label: 'Text/Doc', icon: <TextIcon className="w-5 h-5 mr-2" /> },
    { id: AITutorMode.Code, label: 'Code', icon: <CodeIcon className="w-5 h-5 mr-2" /> },
    { id: AITutorMode.Image, label: 'Image', icon: <ImageIcon className="w-5 h-5 mr-2" /> },
];

export const TOOL_DEFINITIONS: ToolInfo[] = [
    {
        id: ToolType.NoteCreator,
        label: 'Note Creator',
        description: 'Create rich text notes with AI summaries.',
        icon: <NoteIcon className="w-8 h-8" />
    },
    {
        id: ToolType.ResumeBuilder,
        label: 'Resume Builder',
        description: 'Build and export a professional resume.',
        icon: <ResumeIcon className="w-8 h-8" />
    },
    {
        id: ToolType.Flashcards,
        label: 'Flashcards',
        description: 'Create decks manually or from notes.',
        icon: <FlashcardIcon className="w-8 h-8" />
    },
    {
        id: ToolType.Pomodoro,
        label: 'Pomodoro Timer',
        description: 'Focus with a 25/5 timer and log study time.',
        icon: <PomodoroIcon className="w-8 h-8" />
    },
    {
        id: ToolType.Calculator,
        label: 'Calculator',
        description: 'Basic and scientific calculations.',
        icon: <CalculatorIcon className="w-8 h-8" />
    },
    {
        id: ToolType.Communication,
        label: 'Find a Teacher',
        description: 'Browse and connect with expert teachers.',
        icon: <UsersIcon className="w-8 h-8" />
    },
    {
        id: ToolType.Chat,
        label: 'Communication Hub',
        description: 'Access your existing chats with teachers.',
        icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />
    },
    {
        id: ToolType.Whiteboard,
        label: 'Whiteboard',
        description: 'Collaborate in real-time on a shared canvas.',
        icon: <WhiteboardIcon className="w-8 h-8" />
    },
];

export const MOCK_TEACHERS: Teacher[] = [
    {
        id: 'teacher_jane_doe_123',
        name: 'Dr. Jane Doe',
        subject: 'Physics',
        rating: 4.9,
        avatar: `https://i.pravatar.cc/150?u=jane_doe`,
        isOnline: true,
        bio: 'Passionate physicist with a PhD from MIT, specializing in quantum mechanics. I believe in making complex topics accessible and exciting for all students.',
        experience: ['10+ years as a University Professor', 'Researcher at CERN', 'Author of "The Quantum Leap"'],
        teachingStyle: 'Inquiry-based learning with hands-on experiments and real-world examples.',
    },
    {
        id: 'teacher_john_smith_456',
        name: 'John Smith, M.Sc.',
        subject: 'Mathematics',
        rating: 4.8,
        avatar: `https://i.pravatar.cc/150?u=john_smith`,
        isOnline: false,
        bio: 'Dedicated mathematician with a Master\'s in Applied Mathematics. My goal is to build strong problem-solving skills and a love for numbers.',
        experience: ['5 years as a High School Math Teacher', 'Actuarial Analyst at FinCorp', 'Math Olympiad Coach'],
        teachingStyle: 'Problem-based learning, focusing on step-by-step solutions and conceptual understanding.',
    },
    {
        id: 'teacher_emily_white_789',
        name: 'Prof. Emily White',
        subject: 'Literature',
        rating: 4.9,
        avatar: `https://i.pravatar.cc/150?u=emily_white`,
        isOnline: true,
        bio: 'Literature enthusiast and university professor with a focus on Shakespearean and modern classics. Let\'s explore the power of storytelling together.',
        experience: ['Professor of English Literature at State University', 'Published literary critic', 'Editor for "Literary Perspectives" journal'],
        teachingStyle: 'Socratic seminars, critical analysis, and creative writing workshops.',
    },
    {
        id: 'teacher_michael_b_101',
        name: 'Michael Brown, Ph.D.',
        subject: 'Computer Science',
        rating: 5.0,
        avatar: `https://i.pravatar.cc/150?u=michael_brown`,
        isOnline: false,
        bio: 'Software engineer turned educator with a PhD in AI from Stanford. I love mentoring the next generation of coders and tech innovators.',
        experience: ['Senior Software Engineer at Google', 'AI Researcher', 'Bootcamp Instructor for Full-Stack Development'],
        teachingStyle: 'Project-based learning, live coding sessions, and code reviews.',
    },
    {
        id: 'teacher_sara_jones_202',
        name: 'Dr. Sarah Jones',
        subject: 'Chemistry',
        rating: 4.7,
        avatar: `https://i.pravatar.cc/150?u=sara_jones`,
        isOnline: true,
        bio: 'Organic chemist with a passion for making chemistry intuitive and fun. I use interactive simulations and lab demos to bring molecules to life.',
        experience: ['Postdoctoral Fellow at Harvard', '8 years of teaching undergraduate chemistry', 'Curriculum developer for online science platforms'],
        teachingStyle: 'Visual and interactive. I use models, simulations, and mnemonics to help with memorization and understanding.',
    },
    {
        id: 'teacher_david_lee_303',
        name: 'David Lee',
        subject: 'History',
        rating: 4.8,
        avatar: `https://i.pravatar.cc/150?u=david_lee`,
        isOnline: true,
        bio: 'A historian who believes that understanding the past is the key to understanding the present. I specialize in World History and political movements.',
        experience: ['High School History Department Head', 'Museum Curator', 'Historical documentary consultant'],
        teachingStyle: 'Storytelling, debate, and analysis of primary source documents.',
    },
    {
        id: 'teacher_maria_garcia_404',
        name: 'Maria Garcia',
        subject: 'Spanish',
        rating: 4.9,
        avatar: `https://i.pravatar.cc/150?u=maria_garcia`,
        isOnline: false,
        bio: 'Native Spanish speaker and certified language instructor. My classes are immersive, conversational, and focused on practical communication skills.',
        experience: ['Certified DELE instructor', '12 years of language tutoring experience', 'Lived and taught in Spain, Mexico, and Colombia'],
        teachingStyle: 'Communicative Language Teaching (CLT). Lots of conversation, role-playing, and cultural immersion.',
    },
    {
        id: 'teacher_chen_wang_505',
        name: 'Dr. Chen Wang',
        subject: 'Biology',
        rating: 4.8,
        avatar: `https://i.pravatar.cc/150?u=chen_wang`,
        isOnline: true,
        bio: 'Molecular biologist fascinated by the secrets of DNA. My goal is to demystify genetics and cellular biology for students of all levels.',
        experience: ['Researcher in genetics', 'University lecturer', 'Co-author on several peer-reviewed papers'],
        teachingStyle: 'Concept mapping, case studies, and linking biological processes to health and disease.',
    },
    {
        id: 'teacher_olivia_taylor_606',
        name: 'Olivia Taylor, M.A.',
        subject: 'Art History',
        rating: 5.0,
        avatar: `https://i.pravatar.cc/150?u=olivia_taylor`,
        isOnline: false,
        bio: 'Art historian with a Master\'s from The Courtauld. I connect art to its cultural and historical context, from Renaissance masterpieces to contemporary installations.',
        experience: ['Gallery guide at the Met', 'Art history tutor for university students', 'Freelance art writer'],
        teachingStyle: 'Visual analysis and discussion-based. We will learn to "read" a work of art.',
    },
    {
        id: 'teacher_james_wilson_707',
        name: 'James Wilson',
        subject: 'Economics',
        rating: 4.7,
        avatar: `https://i.pravatar.cc/150?u=james_wilson`,
        isOnline: true,
        bio: 'Former financial analyst who now teaches economics. I make sense of markets, policies, and graphs, connecting theory to today\'s headlines.',
        experience: ['Financial Analyst at Goldman Sachs', 'AP Economics Teacher', 'Advisor for student investment clubs'],
        teachingStyle: 'Real-world data analysis, case studies of current events, and simplified models.',
    },
    {
        id: 'teacher_linda_harris_808',
        name: 'Linda Harris, CPA',
        subject: 'Accounting',
        rating: 4.9,
        avatar: `https://i.pravatar.cc/150?u=linda_harris`,
        isOnline: true,
        bio: 'Certified Public Accountant with 15 years of industry experience. I simplify debits, credits, and financial statements for aspiring accountants.',
        experience: ['Senior Auditor at Deloitte', 'Corporate Controller', 'Tutor for CPA exam candidates'],
        teachingStyle: 'Practical, problem-solving approach with a focus on real business scenarios.',
    },
    {
        id: 'teacher_robert_clark_909',
        name: 'Robert Clark',
        subject: 'Music Theory',
        rating: 4.8,
        avatar: `https://i.pravatar.cc/150?u=robert_clark`,
        isOnline: false,
        bio: 'Composer and pianist with a degree from Juilliard. I teach the language of music, from basic scales to complex harmonic analysis.',
        experience: ['Professional composer for film', 'Private piano and theory instructor for 20+ years', 'Orchestra conductor'],
        teachingStyle: 'Aural skills training (ear training), practical application on an instrument, and analysis of great works.',
    },
];