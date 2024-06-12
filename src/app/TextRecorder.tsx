"use client";
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // 正しいフックのインポート
import { diff_match_patch, patch_obj } from 'diff-match-patch';

type InputRecord = {
    diffs: patch_obj[];
    timestamp: number;
    timeDiff: number;
};

const TextRecorder: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [lastText, setLastText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const dmp = new diff_match_patch();
    const router = useRouter(); // next/navigationからuseRouterを利用

    useEffect(() => {
        const savedRecords = localStorage.getItem('textRecords');
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedRecords) {
            setRecords(JSON.parse(savedRecords));
        }
        if (savedDarkMode) {
            setDarkMode(JSON.parse(savedDarkMode));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('textRecords', JSON.stringify(records));
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [records, darkMode]);

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const newText = event.target.value;
        setText(newText);
        const diffs = dmp.diff_main(lastText, newText);
        dmp.diff_cleanupSemantic(diffs);
        const patches = dmp.patch_make(lastText, newText, diffs);
        const currentTime = Date.now();
        const timeDiff = records.length > 0 ? currentTime - records[records.length - 1].timestamp : 0;

        setRecords((prevRecords) => [
            ...prevRecords,
            { diffs: patches, timestamp: currentTime, timeDiff: timeDiff }
        ]);
        setLastText(newText);
    };

    const goToPlaybackScreen = () => {
        const url = `/playback?text=${encodeURIComponent(text)}`;
        router.push(url);
    };
    

    return (
        <div className={`p-6 max-w-lg mx-auto ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-xl shadow-md space-y-4`}>
            <textarea
                className="w-full h-48 p-2 text-sm border-2 border-gray-300 focus:ring-2 focus:ring-gray-500 rounded"
                value={text}
                onChange={handleInputChange}
            />
            <button
                className="w-full py-2 px-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                onClick={goToPlaybackScreen}
            >
                Go to Playback Screen
            </button>
            <button
                className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={() => setDarkMode(!darkMode)}
            >
                Toggle Dark Mode
            </button>
            <div>
                <h4 className="text-lg font-semibold">Input Records</h4>
                <ul className="list-disc space-y-2">
                    {records.map((record, index) => (
                        <li key={index} className="text-sm">{`Changes recorded at ${record.timestamp}`}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TextRecorder;
