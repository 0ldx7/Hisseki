"use client";
import React, { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { diff_match_patch, patch_obj } from 'diff-match-patch';
import { InputRecord } from '../utils/paragraphPlayback';

// セッションIDの生成
const generateSessionId = () => '_' + Math.random().toString(36).substr(2, 9);
const LOCAL_STORAGE_KEY = 'textRecords';

const TextRecorder: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [lastText, setLastText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const [sessionId, setSessionId] = useState<string>(generateSessionId());
    const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15分のカウントダウンタイマー
    const [isRecording, setIsRecording] = useState<boolean>(true);
    const [hasStarted, setHasStarted] = useState<boolean>(false); // 初回入力トリガー
    const dmp = new diff_match_patch();
    const router = useRouter();

    useEffect(() => {
        try {
            const savedRecords = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedRecords) {
                setRecords(JSON.parse(savedRecords));
            }
        } catch (error) {
            console.error('Failed to load records from localStorage:', error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
        } catch (error) {
            console.error('Failed to save records to localStorage:', error);
        }
    }, [records]);

    useEffect(() => {
        if (hasStarted) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        setIsRecording(false);
                        clearInterval(timer);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [hasStarted]);

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        if (!isRecording) return;

        if (!hasStarted) {
            setHasStarted(true); // 初回入力時にタイマーを開始
        }

        const newText = event.target.value;

        if (newText.length > 500) {
            return; // 500文字を超える入力を拒否
        }

        setText(newText);
        const diffs = dmp.diff_main(lastText, newText);
        dmp.diff_cleanupSemantic(diffs);
        const patches = dmp.patch_make(lastText, newText, diffs);
        const currentTime = Date.now();
        const timeDiff = records.length > 0 ? currentTime - records[records.length - 1].timestamp : 0;

        if (records.length < 1500) {
            setRecords((prevRecords) => [
                ...prevRecords,
                { diffs: patches, timestamp: currentTime, timeDiff: timeDiff }
            ]);
        }
        
        setLastText(newText);
    };

    const saveRecords = async () => {
        if (records.length === 0) {
            console.error('No records to save');
            return;
        }

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
                maxLength={500} // 直接HTMLの属性としても設定
                disabled={!isRecording}
            />
            <div className="items-center">
                <h4 className="text-sm font-semibold">limit: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</h4>
                <button
                    className="py-2 px-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    onClick={saveRecords}
                    disabled={!isRecording}
                >
                    筆跡を再生する
                </button>
                <ul className='pt-3'>
                    <li>文字数制限は500文字です。</li>
                    <li>タイマーが時間切れになると自動的に再生画面に遷移します。</li>
                    <li>入力した筆跡は共有URLで保存することができます。再生ボタンを</li>
                </ul>
                
            </div>
        </div>
    );
};

export default TextRecorder;
