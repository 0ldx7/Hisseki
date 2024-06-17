"use client";
import React, { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { diff_match_patch, patch_obj } from 'diff-match-patch';
import { supabase } from '../utils/supabaseClient';

// 入力記録の型を定義
type InputRecord = {
    diffs: patch_obj[];
    timestamp: number;
    timeDiff: number;
};

// セッションIDの生成
const generateSessionId = () => '_' + Math.random().toString(36).substr(2, 9);

const TextRecorder: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [lastText, setLastText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const [sessionId, setSessionId] = useState<string>(generateSessionId());
    const dmp = new diff_match_patch();
    const router = useRouter();

    useEffect(() => {
        const savedRecords = localStorage.getItem('textRecords');
        if (savedRecords) {
            setRecords(JSON.parse(savedRecords));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('textRecords', JSON.stringify(records));
    }, [records]);

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

    const saveRecords = async () => {
        try {
            const response = await fetch('/api/saveRecords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionId, records })
            });

            if (response.ok) {
                console.log('Records saved successfully');
                router.push(`/playback?sessionId=${sessionId}`);
            } else {
                const errorData = await response.json();
                console.error('Failed to save records:', errorData);
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white text-gray-900 rounded-xl shadow-md space-y-4">
            <textarea
                className="w-full h-48 p-2 text-sm border-2 border-gray-300 focus:ring-2 focus:ring-gray-500 rounded"
                value={text}
                onChange={handleInputChange}
            />
            <button
                className="w-full py-2 px-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                onClick={saveRecords}
            >
                記述を終える
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
