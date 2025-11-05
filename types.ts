// FIX: Import React to provide the JSX namespace and React types.
import React from 'react';

export enum Screen {
  Home = 'home',
  AITutor = 'ai-tutor',
  Tools = 'tools',
  Report = 'report',
  Profile = 'profile',
  Services = 'services',
}

export enum UserRole {
  Student = 'student',
  Teacher = 'teacher',
}

export interface NavItem {
  id: Screen;
  label: string;
  // FIX: Changed type from JSX.Element to React.ReactNode for consistency with other components.
  icon: React.ReactNode;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AITutorMode {
    Chat = 'chat',
    YouTube = 'youtube',
    Text = 'text',
    Code = 'code',
    Image = 'image',
    Voice = 'voice',
    Screen = 'screen',
}

export interface AITutorModeInfo {
    id: AITutorMode;
    label: string;
    // FIX: Changed type from JSX.Element to React.ReactNode for consistency with other components.
    icon: React.ReactNode;
}

export interface UserProfile {
    uid: string;
    role: UserRole;
    name: string;
    institution: string;
    grade?: string;
    subjects: string[];
    profileImageUrl?: string;
}

// --- New Types for Tools ---

export enum ToolType {
    NoteCreator = 'note-creator',
    Flashcards = 'flashcards',
    Pomodoro = 'pomodoro',
    Calculator = 'calculator',
    ResumeBuilder = 'resume-builder',
    Communication = 'communication',
    Whiteboard = 'whiteboard',
    Chat = 'chat',
}

export interface ToolInfo {
    id: ToolType;
    label: string;
    description: string;
    icon: React.ReactNode;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    summary?: string;
    lastUpdated: Date;
}

export interface Flashcard {
    id: string;
    front: string;
    back: string;
}

export interface FlashcardDeck {
    id: string;
    title: string;
    cards: Flashcard[];
    lastUpdated: Date;
}

export interface FirebaseChatMessage {
    id: string;
    text: string;
    senderId: string;
    timestamp: any; // Firestore Timestamp
    file?: {
        name: string;
        url: string;
        type: string;
    };
}

export interface ChatSession {
    id: string;
    members: string[]; // array of user UIDs
    lastMessage?: string;
    lastUpdated: any; // Firestore Timestamp
    isGroup: boolean;
    groupName?: string;
}

export interface WhiteboardEvent {
    id: string; // Unique ID for the event
    type: 'draw' | 'erase'; // Type of event
    path: [number, number][]; // Array of [x, y] coordinates for the path
    color: string;
    lineWidth: number;
}


export interface Teacher {
    id: string; // This will be a mock UID for the teacher
    name: string;
    subject: string;
    rating: number;
    avatar: string;
    isOnline: boolean;
    // New fields for detailed profile
    bio: string;
    experience: string[];
    teachingStyle: string;
}

export interface Connection {
    id: string;
    studentId: string;
    studentName: string;
    studentProfileImageUrl?: string;
    teacherId: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: any; // Firestore Timestamp
}

// --- New Types for Reports ---
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    unlocked: boolean;
}

// --- New Types for Dashboard ---
export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

export interface QuizResponse {
    quiz: QuizQuestion[];
}

// --- New Types for Classroom ---
export interface Assignment {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    status: 'Pending' | 'Submitted' | 'Graded';
}

export interface SharedMaterial {
    id: string;
    title: string;
    type: 'file' | 'link';
    description: string;
}

export interface ClassroomInfo {
    id: string;
    teacherName: string;
    subject: string;
    nextSession: string;
}

export interface ClassroomQuiz {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    score: number | null; // null if not taken
}