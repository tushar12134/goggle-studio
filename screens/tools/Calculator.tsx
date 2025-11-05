


import React, { useState } from 'react';

type Operator = '+' | '-' | '*' | '/' | '^';

// Helper function for factorial
const factorial = (n: number): number => {
    if (n < 0) return NaN; // Factorial is not defined for negative numbers
    if (n === 0) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
};


export const Calculator: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [isScientific, setIsScientific] = useState(false);
    const [isRadians, setIsRadians] = useState(false); // false = degrees, true = radians

    const handleInput = (value: string) => {
        // If display is '0' or an error, replace it. Otherwise, append.
        if (display === '0' || display === 'Error' || display === 'NaN') {
            setDisplay(value);
        } else {
            setDisplay(display + value);
        }
    };

    const handleOperator = (op: Operator) => {
        const lastChar = display.slice(-1);
        if (['+', '-', '*', '/', '^'].includes(lastChar)) {
            // Replace the last operator if it's another operator
            setDisplay(display.slice(0, -1) + op);
        } else {
            setDisplay(display + op);
        }
    };
    
    const handleUnaryOperation = (func: string) => {
        try {
            // For functions like sin, cos, etc., we evaluate the current display first
            const currentVal = new Function('return ' + display)();
            if (typeof currentVal !== 'number' || isNaN(currentVal)) {
                setDisplay('Error');
                return;
            }

            let result;
            switch(func) {
                case 'sqrt': result = Math.sqrt(currentVal); break;
                case 'sin': result = isRadians ? Math.sin(currentVal) : Math.sin(currentVal * Math.PI / 180); break;
                case 'cos': result = isRadians ? Math.cos(currentVal) : Math.cos(currentVal * Math.PI / 180); break;
                case 'tan': result = isRadians ? Math.tan(currentVal) : Math.tan(currentVal * Math.PI / 180); break;
                case 'log': result = Math.log10(currentVal); break;
                case 'ln': result = Math.log(currentVal); break;
                case 'sq': result = Math.pow(currentVal, 2); break;
                case '!': result = factorial(currentVal); break;
                case '±': result = currentVal * -1; break;
                default: result = 'Error';
            }
            setDisplay(String(result));
        } catch {
            setDisplay('Error');
        }
    };
    
    const handleConstant = (c: 'π' | 'e') => {
         const val = c === 'π' ? String(Math.PI) : String(Math.E);
         // A simple logic: if last char is a number, multiply. Otherwise, append.
         const lastChar = display.slice(-1);
         if (!isNaN(parseInt(lastChar)) && display !== '0') {
             setDisplay(display + '*' + val);
         } else if (display === '0') {
             setDisplay(val);
         }
         else {
             setDisplay(display + val);
         }
    }

    const handleEquals = () => {
        try {
            // Replace user-friendly symbols with JS equivalents
            let expr = display.replace(/\^/g, '**');
            // Use a safer evaluation method than direct eval()
            const result = new Function('return ' + expr)();
            setDisplay(String(result));
        } catch {
            setDisplay('Error');
        }
    };
    
    const handleClear = () => setDisplay('0');
    const handleBackspace = () => setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
    const handleParenthesis = (p: '(' | ')') => {
        if (display === '0') {
            setDisplay(p);
        } else {
            setDisplay(display + p);
        }
    }
    
    // FIX: Defined a proper interface for CalcButton props and defined it as a React.FC to solve typing issues.
    interface CalcButtonProps {
        children: React.ReactNode;
        onClick: () => void;
        className?: string;
    }

    const CalcButton: React.FC<CalcButtonProps> = ({ children, onClick, className = '' }) => (
        <button onClick={onClick} className={`bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-xl sm:text-2xl font-semibold transition-colors active:scale-95 py-3 ${className}`}>
            {children}
        </button>
    );

    return (
        <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-4 text-right text-4xl font-light break-all h-20 flex items-center justify-end">{display}</div>
            
            <button onClick={() => setIsScientific(!isScientific)} className="w-full mb-4 text-sm text-purple-600 dark:text-purple-400 font-semibold">{isScientific ? 'Standard' : 'Scientific'} Mode</button>
            
            {/* FIX: The 'CalcButton' component requires a 'children' prop. Added the button's text/symbol as a child for each instance. */}
            <div className={`grid ${isScientific ? 'grid-cols-5' : 'grid-cols-4'} gap-2`}>
                {isScientific && <>
                    <CalcButton onClick={() => setIsRadians(!isRadians)} className="!text-sm">{isRadians ? 'RAD' : 'DEG'}</CalcButton>
                    <CalcButton onClick={() => handleUnaryOperation('sin')}>sin</CalcButton>
                    <CalcButton onClick={() => handleUnaryOperation('cos')}>cos</CalcButton>
                    <CalcButton onClick={() => handleUnaryOperation('tan')}>tan</CalcButton>
                    <CalcButton onClick={() => handleUnaryOperation('!')}>x!</CalcButton>

                    <CalcButton onClick={() => handleParenthesis('(')}>(</CalcButton>
                    <CalcButton onClick={() => handleParenthesis(')')}>)</CalcButton>
                    <CalcButton onClick={() => handleUnaryOperation('ln')}>ln</CalcButton>
                    <CalcButton onClick={() => handleUnaryOperation('log')}>log</CalcButton>
                    <CalcButton onClick={() => handleOperator('^')}>xʸ</CalcButton>
                    
                    <CalcButton onClick={() => handleConstant('π')}>π</CalcButton>
                    <CalcButton onClick={() => handleConstant('e')}>e</CalcButton>
                    <CalcButton onClick={() => handleUnaryOperation('sq')}>x²</CalcButton>
                    <CalcButton onClick={() => handleUnaryOperation('sqrt')}>√</CalcButton>
                    <CalcButton onClick={() => handleUnaryOperation('±')}>±</CalcButton>
                </>}

                <CalcButton onClick={handleClear} className="!bg-red-500/20 !text-red-500">AC</CalcButton>
                {!isScientific && <CalcButton onClick={handleBackspace}>⌫</CalcButton>}
                {!isScientific && <CalcButton onClick={() => handleOperator('/')} className="!bg-purple-500/20 !text-purple-500">÷</CalcButton>}
                {isScientific && <CalcButton onClick={handleBackspace} className="col-span-2">⌫</CalcButton>}
                <CalcButton onClick={() => handleOperator('/')} className="!bg-purple-500/20 !text-purple-500">÷</CalcButton>


                {'789'.split('').map(n => <CalcButton key={n} onClick={() => handleInput(n)}>{n}</CalcButton>)}
                <CalcButton onClick={() => handleOperator('*')} className="!bg-purple-500/20 !text-purple-500">×</CalcButton>
                
                {'456'.split('').map(n => <CalcButton key={n} onClick={() => handleInput(n)}>{n}</CalcButton>)}
                <CalcButton onClick={() => handleOperator('-')} className="!bg-purple-500/20 !text-purple-500">-</CalcButton>

                {'123'.split('').map(n => <CalcButton key={n} onClick={() => handleInput(n)}>{n}</CalcButton>)}
                <CalcButton onClick={() => handleOperator('+')} className="!bg-purple-500/20 !text-purple-500">+</CalcButton>
                
                <CalcButton onClick={() => handleInput('0')} className="col-span-2">0</CalcButton>
                <CalcButton onClick={() => handleInput('.')}>.</CalcButton>
                <CalcButton onClick={handleEquals} className="!bg-emerald-500/20 !text-emerald-500">=</CalcButton>
            </div>
        </div>
    );
};