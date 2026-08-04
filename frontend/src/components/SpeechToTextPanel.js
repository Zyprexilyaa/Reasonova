import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import './SpeechToTextPanel.css';
export const SpeechToTextPanel = ({ value, onChange, placeholder, lang = 'th-TH', label = 'Voice input', }) => {
    const [listening, setListening] = useState(false);
    const [status, setStatus] = useState('Tap the mic to start speaking');
    const [error, setError] = useState(null);
    const [liveText, setLiveText] = useState('');
    const recognitionRef = useRef(null);
    const valueRef = useRef(value);
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);
    useEffect(() => {
        const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionCtor) {
            return;
        }
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = lang.split(',')[0];
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event) => {
            let interim = '';
            let finalChunk = '';
            for (let index = event.resultIndex; index < event.results.length; index += 1) {
                const transcript = event.results[index][0].transcript;
                if (event.results[index].isFinal) {
                    finalChunk += transcript;
                }
                else {
                    interim += transcript;
                }
            }
            if (finalChunk.trim()) {
                const nextValue = valueRef.current
                    ? `${valueRef.current.trimEnd()}\n${finalChunk.trim()}`
                    : finalChunk.trim();
                onChangeRef.current(nextValue);
                setLiveText('');
            }
            else if (interim.trim()) {
                setLiveText(interim.trim());
            }
            setStatus(finalChunk.trim() ? 'Captured speech' : 'Listening…');
            setError(null);
        };
        recognition.onerror = (event) => {
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setError('Microphone permission is required.');
            }
            else if (event.error === 'no-speech') {
                setError('No speech detected. Please try again.');
            }
            else {
                setError(`Speech recognition error: ${event.error}`);
            }
            setListening(false);
            setStatus('Speech input paused');
        };
        recognition.onend = () => {
            setListening(false);
            setStatus('Voice input stopped');
        };
        recognitionRef.current = recognition;
        return () => {
            recognition.onresult = null;
            recognition.onerror = null;
            recognition.onend = null;
            try {
                recognition.stop();
            }
            catch {
                // Ignore cleanup errors.
            }
        };
    }, [lang]);
    const startListening = async () => {
        const recognition = recognitionRef.current;
        if (!recognition) {
            setError('Speech recognition is not supported in this browser.');
            setStatus('Voice input unavailable');
            return;
        }
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            catch {
                setError('Microphone permission was denied. Please allow access and try again.');
                setStatus('Permission required');
                return;
            }
        }
        try {
            recognition.start();
            setListening(true);
            setError(null);
            setStatus('Listening…');
        }
        catch {
            setError('Unable to start speech recognition right now.');
            setStatus('Voice input unavailable');
        }
    };
    const stopListening = () => {
        const recognition = recognitionRef.current;
        if (recognition) {
            try {
                recognition.stop();
            }
            catch {
                // Ignore stop errors.
            }
        }
        setListening(false);
        setStatus('Voice input stopped');
    };
    const clearSpeechPreview = () => {
        setLiveText('');
        setStatus('Ready');
    };
    const supported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    return (_jsxs("div", { className: "speech-input-panel", children: [_jsxs("div", { className: "speech-input-toolbar", children: [_jsxs("button", { type: "button", className: `speech-toggle ${listening ? 'active' : ''}`, onClick: () => (listening ? stopListening() : startListening()), disabled: !supported, children: [listening ? '⏹' : '🎤', " ", listening ? 'Stop' : 'Speak'] }), _jsxs("div", { className: "speech-meta", children: [_jsx("strong", { children: label }), _jsx("span", { children: supported ? status : 'Not supported in this browser' })] })] }), supported && (_jsxs("div", { className: "speech-preview", children: [_jsx("div", { className: "speech-preview-label", children: "Live transcript" }), _jsx("div", { className: "speech-preview-text", children: liveText || placeholder || 'Speech will appear here and be appended to the answer field.' }), _jsx("button", { type: "button", className: "speech-secondary", onClick: clearSpeechPreview, children: "Clear preview" })] })), error && _jsx("div", { className: "speech-error", children: error })] }));
};
