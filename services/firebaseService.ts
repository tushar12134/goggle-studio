// FIX: Changed imports to use the Firebase v9 compat layer, which allows v8 syntax to work with the newer SDK version.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { UserProfile, Note, FlashcardDeck, ChatSession, WhiteboardEvent } from '../types';

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual Firebase config from your Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyDPYyr_gLB41Tgf6hQMZiHbi0VksRH7oxc",
  authDomain: "adgelearn.firebaseapp.com",
  projectId: "adgelearn",
  storageBucket: "adgelearn.firebasestorage.app",
  messagingSenderId: "640475078527",
  appId: "1:640475078527:android:035ad7da9818b37aa4844a"
};

// Initialize Firebase using the compat layer
const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// --- User Profile Functions ---
// This v8-style code now works correctly because of the compat imports above.
export const createUserProfile = async (uid: string, profileData: Omit<UserProfile, 'uid'>): Promise<void> => {
    const userRef = db.collection('users').doc(uid);
    await userRef.set({ uid, ...profileData });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = db.collection('users').doc(uid);
    const docSnap = await userRef.get();

    if (docSnap.exists) {
        return docSnap.data() as UserProfile;
    } else {
        return null;
    }
};

export const updateUserProfile = async (uid: string, profileData: Partial<UserProfile>): Promise<void> => {
    const userRef = db.collection('users').doc(uid);
    await userRef.update(profileData);
};


// --- Note Creator Functions ---
export const saveNote = async (userId: string, note: Note): Promise<string> => {
    const noteRef = db.collection('users').doc(userId).collection('notes').doc(note.id);
    
    // Create the base data object, overwriting lastUpdated with the server timestamp.
    const dataToSave: { [key: string]: any } = { ...note, lastUpdated: firebase.firestore.FieldValue.serverTimestamp() };

    // Sanitize the object to remove any `undefined` values, which are not supported by Firestore.
    Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined) {
            delete dataToSave[key];
        }
    });

    await noteRef.set(dataToSave, { merge: true });
    return note.id;
};

export const getNotes = (userId: string, callback: (notes: Note[]) => void): (() => void) => {
    const notesQuery = db.collection('users').doc(userId).collection('notes').orderBy('lastUpdated', 'desc');
    return notesQuery.onSnapshot((querySnapshot) => {
        const notes = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamp to JS Date to match the Note type
            const lastUpdated = (data.lastUpdated as firebase.firestore.Timestamp)?.toDate() || new Date();
            return {
                id: doc.id,
                ...data,
                lastUpdated,
            } as Note;
        });
        callback(notes);
    });
};

export const deleteNote = async (userId: string, noteId: string): Promise<void> => {
    await db.collection('users').doc(userId).collection('notes').doc(noteId).delete();
};

// --- Flashcard Functions ---
export const saveDeck = async (userId: string, deck: FlashcardDeck): Promise<string> => {
    const deckRef = db.collection('users').doc(userId).collection('flashcardDecks').doc(deck.id);
    const deckData = {
        ...deck,
        cards: deck.cards.map(card => ({...card})), // Ensure cards are plain objects
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };
    await deckRef.set(deckData, { merge: true });
    return deck.id;
};

export const getDecks = (userId: string, callback: (decks: FlashcardDeck[]) => void): (() => void) => {
    const decksQuery = db.collection('users').doc(userId).collection('flashcardDecks').orderBy('lastUpdated', 'desc');
    return decksQuery.onSnapshot((querySnapshot) => {
        const decks = querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            // Convert Firestore Timestamp to JS Date
            const lastUpdated = (data.lastUpdated as firebase.firestore.Timestamp)?.toDate() || new Date();
            return {
                id: docSnap.id,
                ...data,
                cards: data.cards || [], // Ensure cards is always an array
                lastUpdated,
            } as FlashcardDeck;
        });
        callback(decks);
    });
};

export const deleteDeck = async (userId: string, deckId: string): Promise<void> => {
    await db.collection('users').doc(userId).collection('flashcardDecks').doc(deckId).delete();
};

// --- Communication / Chat Functions ---
export const getChatSessions = (userId: string, callback: (sessions: any[]) => void): (() => void) => {
    const sessionsQuery = db.collection('chats').where('members', 'array-contains', userId);
    return sessionsQuery.onSnapshot((querySnapshot) => {
        const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(sessions);
    });
};

export const findOrCreateChatSession = async (userId: string, teacherId: string): Promise<ChatSession> => {
    // Query for existing 1-on-1 chats between these two users
    const chatsRef = db.collection('chats');
    const querySnapshot = await chatsRef
        .where('isGroup', '==', false)
        .where('members', 'array-contains', userId)
        .get();

    for (const doc of querySnapshot.docs) {
        const session = { id: doc.id, ...doc.data() } as ChatSession;
        // Ensure the other member is the teacher and it has exactly 2 members
        if (session.members.includes(teacherId) && session.members.length === 2) {
            return session; // Found it, return immediately
        }
    }

    // If no session exists, create a new one
    const newSessionRef = chatsRef.doc();
    const newSessionData = {
        members: [userId, teacherId],
        isGroup: false,
        lastMessage: 'Chat initiated.',
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    };
    
    await newSessionRef.set(newSessionData);
    
    const newSession: ChatSession = {
        id: newSessionRef.id,
        ...newSessionData
    };
    return newSession;
};


export const getChatMessages = (chatId: string, callback: (messages: any[]) => void): (() => void) => {
    const messagesQuery = db.collection('chats').doc(chatId).collection('messages').orderBy('timestamp', 'asc');
    return messagesQuery.onSnapshot((querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(messages);
    });
};

export const sendChatMessage = async (chatId: string, senderId: string, text: string): Promise<void> => {
    const messagesCol = db.collection('chats').doc(chatId).collection('messages');
    await messagesCol.add({
        text,
        senderId,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    // Also update the chat session's last message
    await db.collection('chats').doc(chatId).update({
        lastMessage: text,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
};

export const uploadFileToChat = async (chatId: string, senderId: string, file: File): Promise<void> => {
    const storageRef = storage.ref(`chat_files/${chatId}/${Date.now()}_${file.name}`);
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();

    const messagesCol = db.collection('chats').doc(chatId).collection('messages');
    await messagesCol.add({
        senderId,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        file: {
            name: file.name,
            url: downloadURL,
            type: file.type
        }
    });
     await db.collection('chats').doc(chatId).update({
        lastMessage: `📎 ${file.name}`,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    });
};


// --- Whiteboard Functions ---
const whiteboardEventsCollection = (sessionId: string) => db.collection('whiteboards').doc(sessionId).collection('events');

export const sendWhiteboardEvent = async (sessionId: string, event: Omit<WhiteboardEvent, 'id'>): Promise<void> => {
    const eventRef = whiteboardEventsCollection(sessionId).doc();
    await eventRef.set({ ...event, id: eventRef.id });
};

export const subscribeToWhiteboardEvents = (sessionId: string, callback: (events: WhiteboardEvent[]) => void): (() => void) => {
    return whiteboardEventsCollection(sessionId).orderBy('id').onSnapshot(snapshot => {
        const events = snapshot.docs.map(doc => doc.data() as WhiteboardEvent);
        callback(events);
    });
};

export const clearWhiteboardEvents = async (sessionId: string): Promise<void> => {
    const snapshot = await whiteboardEventsCollection(sessionId).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
};