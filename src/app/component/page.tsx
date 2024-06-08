"use client";

import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { diff_match_patch, patch_obj } from 'diff-match-patch';

type InputRecord = {
    diffs: patch_obj[];
    timestamp: number;
};

const TextRecorder: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [lastText, setLastText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const dmp = new diff_match_patch();
    const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // ローカルストレージから記録をロード
        const savedRecords = localStorage.getItem('textRecords');
        if (savedRecords) {
            setRecords(JSON.parse(savedRecords));
        }
    }, []);

    useEffect(() => {
        // 記録が更新されるたびにローカルストレージに保存
        localStorage.setItem('textRecords', JSON.stringify(records));
    }, [records]);

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const newText = event.target.value;
        setText(newText);

        const diffs = dmp.diff_main(lastText, newText);
        dmp.diff_cleanupSemantic(diffs);
        const patches = dmp.patch_make(lastText, newText, diffs);

        setRecords(prevRecords => [
            ...prevRecords,
            { diffs: patches, timestamp: Date.now() }
        ]);
        setLastText(newText);
    };

    const handlePlayback = () => {
        let currentIndex = 0;
        let currentText = '';
        setText('');

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
            const [newText, _] = dmp.patch_apply(record.diffs, currentText);
            setText(newText);
            currentText = newText;
        }, 1000); // Adjust playback speed as needed
    };

    return (
        <div>
            <textarea value={text} onChange={handleInputChange} />
            <button onClick={handlePlayback}>Playback</button>
            <div>
                <h4>Input Records</h4>
                <ul>
                    {records.map((record, index) => (
                        <li key={index}>{`Changes recorded at ${record.timestamp}`}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TextRecorder;
