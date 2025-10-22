import React, { useState, useRef, useEffect } from 'react';
// FIX: Removed 'LiveSession' as it is not an exported member of the module.
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAI_Blob } from "@google/genai";
import { ScreenShareIcon } from '../../constants';

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
const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(blob);
});

const FRAME_RATE = 1; // frames per second
const JPEG_QUALITY = 0.7;

export const ScreenTutor: React.FC = () => {
    const [isSharing, setIsSharing] = useState(false);
    const [transcription, setTranscription] = useState('');
    
    // FIX: Changed LiveSession to any because it's not exported from the library.
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameIntervalRef = useRef<number | null>(null);

    const audioRefs = useRef<{
        inputAudioContext: AudioContext | null;
        outputAudioContext: AudioContext | null;
        scriptProcessor: ScriptProcessorNode | null;
        mediaStream: MediaStream | null;
        displayStream: MediaStream | null;
    }>({ inputAudioContext: null, outputAudioContext: null, scriptProcessor: null, mediaStream: null, displayStream: null });


    const stopSharing = () => {
        if (frameIntervalRef.current) {
            clearInterval(frameIntervalRef.current);
            frameIntervalRef.current = null;
        }
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        
        audioRefs.current.displayStream?.getTracks().forEach(track => track.stop());
        audioRefs.current.mediaStream?.getTracks().forEach(track => track.stop());
        audioRefs.current.scriptProcessor?.disconnect();
        audioRefs.current.inputAudioContext?.close();
        audioRefs.current.outputAudioContext?.close();

        if (videoRef.current) videoRef.current.srcObject = null;
        setIsSharing(false);
        setTranscription('');
    };

    useEffect(() => {
        return () => stopSharing();
    }, []);

    const startSharing = async () => {
        try {
            audioRefs.current.displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = audioRefs.current.displayStream;
            }

            setIsSharing(true);
            setTranscription('Starting session...');
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            // FIX: Cast window to `any` to allow for `webkitAudioContext` for broader browser support without TypeScript errors.
            audioRefs.current.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            // FIX: Cast window to `any` to allow for `webkitAudioContext` for broader browser support without TypeScript errors.
            audioRefs.current.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = audioRefs.current.outputAudioContext.createGain();
            outputNode.connect(audioRefs.current.outputAudioContext.destination);
            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: async () => {
                        try {
                            // Start streaming audio
                            audioRefs.current.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                            const source = audioRefs.current.inputAudioContext!.createMediaStreamSource(audioRefs.current.mediaStream);
                            audioRefs.current.scriptProcessor = audioRefs.current.inputAudioContext!.createScriptProcessor(4096, 1, 1);
                            audioRefs.current.scriptProcessor.onaudioprocess = (event) => {
                                const inputData = event.inputBuffer.getChannelData(0);
                                const pcmBlob: GenAI_Blob = {
                                    data: encode(new Uint8Array(new Int16Array(inputData.map(d => d * 32768)).buffer)),
                                    mimeType: 'audio/pcm;rate=16000',
                                };
                                 if (sessionPromiseRef.current) {
                                    sessionPromiseRef.current.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                                }
                            };
                            source.connect(audioRefs.current.scriptProcessor);
                            audioRefs.current.scriptProcessor.connect(audioRefs.current.inputAudioContext!.destination);

                            // Start streaming video frames
                            frameIntervalRef.current = window.setInterval(() => {
                                if (!videoRef.current || !canvasRef.current || !sessionPromiseRef.current) return;
                                const videoEl = videoRef.current;
                                const canvasEl = canvasRef.current;
                                canvasEl.width = videoEl.videoWidth;
                                canvasEl.height = videoEl.videoHeight;
                                canvasEl.getContext('2d')?.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
                                canvasEl.toBlob(async (blob) => {
                                    if (blob) {
                                        const base64Data = await blobToBase64(blob);
                                        sessionPromiseRef.current!.then((session) => {
                                            session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } });
                                        });
                                    }
                                }, 'image/jpeg', JPEG_QUALITY);
                            }, 1000 / FRAME_RATE);
                        } catch (err) {
                            console.error("Microphone access error:", err);
                            alert("Microphone access was denied. Please allow microphone access in your browser settings to use the Screen Share Tutor's voice features.");
                            stopSharing();
                        }
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription) {
                            setTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
                        }
                         if (message.serverContent?.turnComplete) {
                            setTranscription(prev => prev + '\n\n');
                        }
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            const ctx = audioRefs.current.outputAudioContext!;
                            nextStartTime = Math.max(nextStartTime, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => { sources.delete(source); });
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(source);
                        }
                    },
                    onerror: (e) => {
                        console.error(e);
                        stopSharing();
                    },
                    onclose: () => {
                        console.log("Session closed");
                        stopSharing();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {},
                    systemInstruction: `You are a helpful AI tutor from Edgelearn. The user is sharing their screen. Analyze the visual information from the screen frames and the user's voice commands to provide assistance. Be concise and helpful.`
                },
            });

        } catch (error: any) {
            console.error("Error starting screen share:", error);
            if (error.name === 'NotAllowedError') {
                 alert("Screen sharing permission was denied. Please allow screen sharing to use this feature.");
            } else {
                 alert("An error occurred while trying to start screen sharing.");
            }
            setIsSharing(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4">
             <div className="relative flex-1 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                <canvas ref={canvasRef} className="hidden" />
                {!isSharing && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-4">
                        <ScreenShareIcon className="w-16 h-16 mb-4 text-gray-400"/>
                        <h3 className="text-xl font-bold">Screen Sharing Tutor</h3>
                        <p className="text-center text-gray-300">Share your screen and talk to the AI for interactive help.</p>
                    </div>
                )}
            </div>
            <div className="flex-shrink-0 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                        <h4 className="font-semibold text-gray-800 dark:text-white">Live Transcription</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap h-16 overflow-y-auto">
                            {transcription || "Transcription will appear here..."}
                        </p>
                    </div>
                    <button
                        onClick={isSharing ? stopSharing : startSharing}
                        className={`px-4 py-2 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2 ${isSharing ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                        <ScreenShareIcon className="w-5 h-5"/>
                        <span>{isSharing ? 'Stop Sharing' : 'Start Sharing'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};