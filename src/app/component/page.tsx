"use client";

import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { diff_match_patch } from 'diff-match-patch';

type InputRecord = {
    delta: string;
    timestamp: number;
};

const TextRecorder: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [lastText, setLastText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const dmp = new diff_match_patch();
    const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Load records from local storage
        const savedRecords = localStorage.getItem('textRecords');
        if (savedRecords) {
            setRecords(JSON.parse(savedRecords));
        }
    }, []);

    useEffect(() => {
        // Save records to local storage on update
        localStorage.setItem('textRecords', JSON.stringify(records));
    }, [records]);

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const newText = event.target.value;
        setText(newText);

        const diffs = dmp.diff_main(lastText, newText);
        dmp.diff_cleanupSemantic(diffs);
        const delta = dmp.diff_toDelta(diffs);

        if (delta !== '=0') {
            setRecords(prevRecords => [
                ...prevRecords,
                { delta, timestamp: Date.now() }
            ]);
            setLastText(newText);
        }
    };

    const handlePlayback = () => {
        let currentIndex = 0;
        let currentText = '';
        setText(''); // Clear the textarea before playback

        if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current);
        }

        playbackIntervalRef.current = setInterval(() => {
            if (currentIndex >= records.length) {
                clearInterval(playbackIntervalRef.current);
                playbackIntervalRef.current = null;
                return;
            }

            const record = records[currentIndex++];
            console.log(encodeURIComponent(record.delta));
            console.log(decodeURIComponent(record.delta));
            const patches = dmp.patch_fromText(record.delta);
            const [newText] = dmp.patch_apply(patches, currentText);
            setText(newText);
            currentText = newText;
        }, 1000);  // Adjust playback speed as needed
    };

    return (
        <div>
            <textarea value={text} onChange={handleInputChange} />
            <button onClick={handlePlayback}>Playback</button>
            <div>
                <h4>Input Records</h4>
                <ul>
                    {records.map((record, index) => (
                        <li key={index}>{`${record.delta} (Timestamp: ${record.timestamp})`}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TextRecorder;
