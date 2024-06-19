"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { diff_match_patch, patch_obj } from 'diff-match-patch';

type InputRecord = {
    diffs: object[];
    timestamp: number;
    timeDiff: number;
};

const Playback: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const searchParams = useSearchParams();
    const dmp = new diff_match_patch();
    const lastUpdateRef = useRef<number>(Date.now());

    const fetchRecords = async () => {
        const sessionId = searchParams.get('sessionId');
        if (!sessionId) {
            console.error('Session ID not found');
            return;
        }

        try {
            const response = await fetch(`/api/getRecords?sessionId=${sessionId}`);
            if (response.ok) {
                const data: InputRecord[] = await response.json();
                data.forEach((record, index) => {
                    if (record.timeDiff === undefined || record.timeDiff === 0) {
                        data[index].timeDiff = 1000;
                    }
                });
                setRecords(data);
            } else {
                console.error('Failed to fetch records');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const playback = () => {
        let currentIndex = 0;
        let currentText = '';
        setText('');

        const playNext = () => {
            if (currentIndex >= records.length) {
                return;
            }

            const record = records[currentIndex++];
            const [newText, results] = dmp.patch_apply(record.diffs, currentText);

            if (results.some(result => !result)) {
                console.error('Patch application failed:', record.diffs, currentText);
            }

            setText(newText);
            currentText = newText;
            lastUpdateRef.current = Date.now();

            if (currentIndex < records.length) {
                const nextTimeDiff = records[currentIndex]?.timeDiff ?? 1000;
                setTimeout(playNext, nextTimeDiff);
            }
        };

        playNext();
    };

    useEffect(() => {
        if (records.length > 0) {
            playback();
        }
    }, [records]);

    return (
        <div className="p-6 max-w-lg mx-auto bg-white text-gray-900 rounded-xl shadow-md space-y-4">
            {/* <h1 className="text-2xl font-bold">Playback Screen</h1> */}
            <div className="whitespace-pre-wrap">
                {text}
            </div>
            <div className="flex justify-between items-center">
                <button
                    className="py-2 px-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={playback}
                >
                    最初から再生
                </button>
                <button
                    className="py-2 px-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={() => window.history.back()}
                >
                    新しく筆跡を残す
                </button>
            </div>
        </div>
    );
};

export default Playback;
