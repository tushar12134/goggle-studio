import React, { useState, useRef, useEffect } from 'react';
// FIX: Removed 'LiveSession' as it is not an exported member of the module.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { MicrophoneIcon } from '../../constants';

// --- Audio Utility Functions ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  // FIX: Corrected typo from dataInt116 to dataInt16.
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
// --- End Audio Utility Functions ---

interface Transcription {
    text: string;
    source: 'user' | 'model';
}

const LANGUAGES = [
    { code: 'en-US', name: 'English' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Mandarin' },
    { code: 'or-IN', name: 'Odia' },
];

const GREETINGS: { [key: string]: string } = {
    'en-US': 'Hello! I am ready to learn with you. What topic shall we discuss?',
    'es-ES': '¡Hola! Estoy listo para aprender contigo. ¿Qué tema discutiremos?',
    'fr-FR': 'Bonjour! Je suis prêt à apprendre avec vous. De quel sujet discuterons-nous?',
    'de-DE': 'Hallo! Ich bin bereit, mit dir zu lernen. Welches Thema sollen wir besprechen?',
    'ja-JP': 'こんにちは！一緒に学ぶ準備ができました。どのトピックについて話しましょうか？',
    'zh-CN': '你好！我准备好和你一起学习了。我们讨论什么话题？',
    'or-IN': 'ନମସ୍କାର! ମୁଁ ତୁମ ସହିତ ଶିଖିବାକୁ ପ୍ରସ୍ତୁତ | ଆମେ କେଉଁ ବିଷୟରେ ଆଲୋଚନା କରିବା?',
};


export const VoiceTutor: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcriptionHistory, setTranscriptionHistory] = useState<Transcription[]>([]);
    const [currentTranscription, setCurrentTranscription] = useState<{ user: string, model: string }>({ user: '', model: '' });
    const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
    // FIX: Changed LiveSession to any because it's not exported from the library.
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const audioRefs = useRef<{
        inputAudioContext: AudioContext | null;
        outputAudioContext: AudioContext | null;
        scriptProcessor: ScriptProcessorNode | null;
        mediaStream: MediaStream | null;
        sources: Set<AudioBufferSourceNode>;
        nextStartTime: number;
    }>({ inputAudioContext: null, outputAudioContext: null, scriptProcessor: null, mediaStream: null, sources: new Set(), nextStartTime: 0 });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [transcriptionHistory, currentTranscription]);

    const stopSession = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }

        audioRefs.current.mediaStream?.getTracks().forEach(track => track.stop());
        audioRefs.current.scriptProcessor?.disconnect();
        
        // FIX: Check if the audio context is already closed before attempting to close it again.
        if (audioRefs.current.inputAudioContext && audioRefs.current.inputAudioContext.state !== 'closed') {
            audioRefs.current.inputAudioContext.close();
        }
        if (audioRefs.current.outputAudioContext && audioRefs.current.outputAudioContext.state !== 'closed') {
            audioRefs.current.outputAudioContext.close();
        }
        
        audioRefs.current.sources.forEach(source => source.stop());
        // FIX: Clear the sources set and reset audio refs to prevent memory leaks and redundant calls.
        audioRefs.current.sources.clear();
        audioRefs.current.inputAudioContext = null;
        audioRefs.current.outputAudioContext = null;
        audioRefs.current.scriptProcessor = null;
        audioRefs.current.mediaStream = null;

        setIsRecording(false);
    };
    
    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopSession();
        };
    }, []);

    const startSession = async () => {
        setIsRecording(true);
        // Provide an immediate greeting in the selected language for better UX.
        setTranscriptionHistory([]);
        setCurrentTranscription({ user: '', model: ''});
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // --- Initialize Audio ---
        // FIX: Cast window to `any` to allow for `webkitAudioContext` for broader browser support without TypeScript errors.
        audioRefs.current.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        // FIX: Cast window to `any` to allow for `webkitAudioContext` for broader browser support without TypeScript errors.
        audioRefs.current.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioRefs.current.nextStartTime = 0;
        audioRefs.current.sources.clear();
        const outputNode = audioRefs.current.outputAudioContext.createGain();
        outputNode.connect(audioRefs.current.outputAudioContext.destination);
        // --- End Initialize Audio ---

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: async () => {
                    try {
                        audioRefs.current.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        const source = audioRefs.current.inputAudioContext!.createMediaStreamSource(audioRefs.current.mediaStream);
                        audioRefs.current.scriptProcessor = audioRefs.current.inputAudioContext!.createScriptProcessor(4096, 1, 1);

                        audioRefs.current.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(d => Math.max(-1.0, Math.min(1.0, d)) * 32767)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(audioRefs.current.scriptProcessor);
                        audioRefs.current.scriptProcessor.connect(audioRefs.current.inputAudioContext!.destination);

                        // Send an initial silent audio packet with the greeting text to start the conversation
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({
                                text: GREETINGS[selectedLanguage.code] || GREETINGS['en-US']
                            });
                        });

                    } catch (err) {
                        console.error("Microphone access error:", err);
                        alert("Microphone access was denied. Please allow microphone access in your browser settings to use the Voice Tutor.");
                        stopSession();
                    }
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.outputTranscription) {
                        const text = message.serverContent.outputTranscription.text;
                        setCurrentTranscription(prev => ({ ...prev, model: prev.model + text}));
                    }
                    if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        setCurrentTranscription(prev => ({ ...prev, user: prev.user + text}));
                    }
                    if (message.serverContent?.turnComplete) {
                        const { user, model } = currentTranscription;
                        setTranscriptionHistory(prev => {
                            const newHistory = [...prev];
                            if (user.trim()) newHistory.push({ source: 'user', text: user });
                            if (model.trim()) newHistory.push({ source: 'model', text: model });
                            return newHistory;
                        });
                        setCurrentTranscription({ user: '', model: '' });
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio) {
                        const ctx = audioRefs.current.outputAudioContext!;
                        audioRefs.current.nextStartTime = Math.max(audioRefs.current.nextStartTime, ctx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        source.addEventListener('ended', () => { audioRefs.current.sources.delete(source); });
                        source.start(audioRefs.current.nextStartTime);
                        audioRefs.current.nextStartTime += audioBuffer.duration;
                        audioRefs.current.sources.add(source);
                    }

                    if (message.serverContent?.interrupted) {
                        audioRefs.current.sources.forEach(s => s.stop());
                        audioRefs.current.sources.clear();
                        audioRefs.current.nextStartTime = 0;
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error("Session error:", e);
                    stopSession();
                },
                onclose: () => {
                    console.log("Session closed.");
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                outputAudioTranscription: {},
                inputAudioTranscription: {},
                systemInstruction: `You are a helpful AI tutor from Edgelearn. Your name is Edgelearn AI. Your entire conversation with the user MUST be in ${selectedLanguage.name}. Be friendly, encouraging, and clear in your explanations.`,
                thinkingConfig: { thinkingBudget: 0 }
            },
        });
        sessionPromiseRef.current = sessionPromise;
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg p-4 space-y-4">
            <div className="flex-shrink-0 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Multi-Language Voice Tutor</h3>
                <select
                    value={selectedLanguage.code}
                    onChange={(e) => setSelectedLanguage(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}
                    disabled={isRecording}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                {transcriptionHistory.length === 0 && !currentTranscription.user && !currentTranscription.model && (
                     <div className="text-center text-gray-500 dark:text-gray-400">
                        <p>{isRecording ? 'Listening...' : 'Press the microphone to start the conversation.'}</p>
                    </div>
                )}
                {transcriptionHistory.map((item, index) => (
                    <div key={index} className={`flex ${item.source === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow ${item.source === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}>
                           <p><span className="font-bold capitalize">{item.source}: </span>{item.text}</p>
                        </div>
                    </div>
                ))}
                {currentTranscription.user && (
                    <div className="flex justify-end">
                        <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow bg-purple-600/50 text-white">
                           <p><span className="font-bold capitalize">User: </span>{currentTranscription.user}</p>
                        </div>
                    </div>
                )}
                 {currentTranscription.model && (
                    <div className="flex justify-start">
                        <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow bg-gray-100/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200">
                           <p><span className="font-bold capitalize">Model: </span>{currentTranscription.model}</p>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>

            <div className="flex-shrink-0 flex justify-center items-center">
                <button
                    onClick={isRecording ? stopSession : startSession}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-100 focus:outline-none ${
                        isRecording ? 'bg-red-500/20 text-red-500' : 'bg-purple-500/20 text-purple-500'
                    }`}
                >
                    <div className={`absolute w-20 h-20 rounded-full ${isRecording ? 'bg-red-500/30 animate-ping' : ''}`}></div>
                    <MicrophoneIcon className="w-10 h-10" />
                </button>
            </div>
        </div>
    );
};