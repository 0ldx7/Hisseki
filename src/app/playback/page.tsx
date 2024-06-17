"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { diff_match_patch, patch_obj } from 'diff-match-patch';
import { supabase } from '../../utils/supabaseClient';

type InputRecord = {
    diffs: patch_obj[];
    timestamp: number;
    timeDiff: number;
};

const Playback: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const searchParams = useSearchParams();
    const dmp = new diff_match_patch();

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
            <h1 className="text-2xl font-bold">Playback Screen</h1>
            <div className="whitespace-pre-wrap">{text}</div>
            <button
                className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={() => window.history.back()}
            >
                新しく筆跡を残す
            </button>
        </div>
    );
};

export default Playback;
