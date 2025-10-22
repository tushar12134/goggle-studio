
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { WhiteboardEvent } from '../../types';
import { sendWhiteboardEvent, subscribeToWhiteboardEvents, clearWhiteboardEvents } from '../../services/firebaseService';
import { PencilIcon, EraserIcon, TrashIcon } from '../../constants';

// For simplicity, using a hardcoded session ID for the shared whiteboard.
// In a real app, this would be dynamic (e.g., based on a chat room ID).
const SHARED_WHITEBOARD_ID = 'global_whiteboard_session';

const COLORS = ['#000000', '#EF4444', '#3B82F6', '#22C55E', '#A855F7', '#F97316'];

export const Whiteboard: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tool, setTool] = useState<'draw' | 'erase'>('draw');
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(5);
    
    // State to manage the drawing path
    const currentPath = useRef<[number, number][]>([]);
    const isDrawing = useRef(false);

    const getCanvasContext = useCallback(() => canvasRef.current?.getContext('2d'), []);

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = getCanvasContext();
        if (canvas && ctx) {
            // To prevent clearing on resize, we can redraw everything, but for now, just resize
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
    }, [getCanvasContext]);

    // Redraws the entire canvas from a list of events
    const redrawAll = useCallback((events: WhiteboardEvent[]) => {
        const ctx = getCanvasContext();
        if (!ctx) return;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        events.forEach(event => {
            ctx.beginPath();
            ctx.strokeStyle = event.type === 'draw' ? event.color : '#FFFFFF'; // Eraser is just drawing in white
            ctx.lineWidth = event.lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            if (event.path.length > 0) {
                 ctx.moveTo(event.path[0][0], event.path[0][1]);
                 for (let i = 1; i < event.path.length; i++) {
                     ctx.lineTo(event.path[i][0], event.path[i][1]);
                 }
                 ctx.stroke();
            }
        });
    }, [getCanvasContext]);

    useEffect(() => {
        handleResize(); // Initial resize
        window.addEventListener('resize', handleResize);

        // Subscribe to Firestore events
        const unsubscribe = subscribeToWhiteboardEvents(SHARED_WHITEBOARD_ID, (events) => {
             redrawAll(events);
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            unsubscribe();
        };
    }, [handleResize, redrawAll]);

    const getMousePos = (e: React.MouseEvent): [number, number] => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return [e.clientX - rect.left, e.clientY - rect.top];
    };

    const startDrawing = (e: React.MouseEvent) => {
        isDrawing.current = true;
        const pos = getMousePos(e);
        currentPath.current = [pos];
    };

    const stopDrawing = () => {
        if (!isDrawing.current || currentPath.current.length === 0) return;
        isDrawing.current = false;
        
        const event: Omit<WhiteboardEvent, 'id'> = {
            type: tool,
            path: currentPath.current,
            color: color,
            lineWidth: tool === 'erase' ? 20 : lineWidth, // Eraser has a fixed, larger size
        };
        sendWhiteboardEvent(SHARED_WHITEBOARD_ID, event);
        currentPath.current = [];
    };
    
    const drawing = (e: React.MouseEvent) => {
        if (!isDrawing.current) return;
        const pos = getMousePos(e);
        currentPath.current.push(pos);
        
        // Draw locally for immediate feedback
        const ctx = getCanvasContext();
        if (!ctx || currentPath.current.length < 2) return;
        
        ctx.beginPath();
        ctx.strokeStyle = tool === 'draw' ? color : '#FFFFFF';
        ctx.lineWidth = tool === 'erase' ? 20 : lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        const lastPos = currentPath.current[currentPath.current.length - 2];
        ctx.moveTo(lastPos[0], lastPos[1]);
        ctx.lineTo(pos[0], pos[1]);
        ctx.stroke();
    };
    
    const handleClearCanvas = () => {
        if (window.confirm("Are you sure you want to clear the whiteboard for everyone?")) {
            clearWhiteboardEvents(SHARED_WHITEBOARD_ID);
        }
    };


    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <button onClick={() => setTool('draw')} className={`p-2 rounded-lg ${tool === 'draw' ? 'bg-purple-200 dark:bg-purple-900' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><PencilIcon className="w-6 h-6" /></button>
                    <button onClick={() => setTool('erase')} className={`p-2 rounded-lg ${tool === 'erase' ? 'bg-purple-200 dark:bg-purple-900' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><EraserIcon className="w-6 h-6" /></button>
                </div>
                 <div className="flex items-center gap-2">
                    {COLORS.map(c => (
                        <button key={c} onClick={() => setColor(c)} style={{ backgroundColor: c }} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${color === c && tool === 'draw' ? 'ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-purple-500' : ''}`}></button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <input type="range" min="1" max="50" value={lineWidth} onChange={e => setLineWidth(Number(e.target.value))} className="w-32" disabled={tool === 'erase'} />
                    <span className="text-sm w-10">{lineWidth}px</span>
                </div>
                 <button onClick={handleClearCanvas} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"><TrashIcon className="w-6 h-6" /></button>
            </div>
            <div className="relative w-full h-[calc(100vh-270px)] bg-white dark:bg-white rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onMouseMove={drawing}
                    className="w-full h-full"
                />
            </div>
        </div>
    );
};