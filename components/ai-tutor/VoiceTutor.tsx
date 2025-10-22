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
];

export const VoiceTutor: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcriptionHistory, setTranscriptionHistory] = useState<Transcription[]>([]);
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

    useEffect(scrollToBottom, [transcriptionHistory]);

    const stopSession = () => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }

        audioRefs.current.mediaStream?.getTracks().forEach(track => track.stop());
        audioRefs.current.scriptProcessor?.disconnect();
        audioRefs.current.inputAudioContext?.close();
        audioRefs.current.outputAudioContext?.close();
        audioRefs.current.sources.forEach(source => source.stop());

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
        setTranscriptionHistory([]);
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let currentInput = "";
        let currentOutput = "";

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

        sessionPromiseRef.current = ai.live.connect({
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
                                data: encode(new Uint8Array(new Int16Array(inputData.map(d => d * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        source.connect(audioRefs.current.scriptProcessor);
                        audioRefs.current.scriptProcessor.connect(audioRefs.current.inputAudioContext!.destination);
                    } catch (err) {
                        console.error("Microphone access error:", err);
                        alert("Microphone access was denied. Please allow microphone access in your browser settings to use the Voice Tutor.");
                        stopSession();
                    }
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.outputTranscription) {
                        currentOutput += message.serverContent.outputTranscription.text;
                    }
                    if (message.serverContent?.inputTranscription) {
                        currentInput += message.serverContent.inputTranscription.text;
                    }
                    if (message.serverContent?.turnComplete) {
                        // FIX: Refactored to be more readable and to fix a TypeScript type inference error
                        // where the 'source' property was being widened to 'string' instead of 'user' | 'model'.
                        const newEntries: Transcription[] = [];
                        if (currentInput.trim()) {
                            newEntries.push({ source: 'user', text: currentInput });
                        }
                        if (currentOutput.trim()) {
                            newEntries.push({ source: 'model', text: currentOutput });
                        }

                        if (newEntries.length > 0) {
                            setTranscriptionHistory(prev => [...prev, ...newEntries]);
                        }
                        currentInput = "";
                        currentOutput = "";
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
                systemInstruction: `You are a helpful AI tutor from Edgelearn. Your name is Edgelearn AI. Please respond in ${selectedLanguage.name}. Be friendly, encouraging, and clear in your explanations.`
            },
        });
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
                {transcriptionHistory.length === 0 && (
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