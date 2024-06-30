"use client";
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { diff_match_patch } from 'diff-match-patch';
import { logError } from '../../utils/errorHandler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faEraser } from '@fortawesome/free-solid-svg-icons';

type InputRecord = {
    diffs: object[];
    timestamp: number;
    timeDiff: number;
};

const generateSessionId = () => '_' + Math.random().toString(36).substr(2, 9);

const TextRecorder: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [lastText, setLastText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const [sessionId, setSessionId] = useState<string>(generateSessionId());
    const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
    const [recordingStatus, setRecordingStatus] = useState<'notStarted' | 'recording' | 'stopped'>('notStarted');
    const timerRef = useRef<NodeJS.Timeout | null>(null); // タイマーの参照を保持
    const dmp = new diff_match_patch();
    const router = useRouter();

    useEffect(() => {
        if (recordingStatus === 'recording') {
            timerRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        setRecordingStatus('stopped');
                        clearInterval(timerRef.current!);
                        location.reload();
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [recordingStatus]);

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        if (recordingStatus === 'stopped') return;

        if (recordingStatus === 'notStarted') {
            setRecordingStatus('recording');
        }

        const newText = event.target.value;

        if (newText.length > 500) {
            alert("文字数の上限に達しています");
            return;
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
                { diffs: patches, timestamp: currentTime, timeDiff }
            ]);
        }

        if (records.length > 1500) {
            location.reload();
        };

        setLastText(newText);
    };

    const saveRecords = async () => {
        if (records.length === 0) {
            logError('No records to save', null);
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
                logError('Failed to save records', errorData);
            }
        } catch (error) {
            logError('An unexpected error occurred', error);
        }
    };

    const resetRecorder = () => {
        setText('');
        setLastText('');
        setRecords([]);
        setSessionId(generateSessionId());
        setTimeLeft(15 * 60);
        setRecordingStatus('notStarted');
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-lg">
            <textarea
                className="w-full h-48 p-4 mb-4 text-sm border-2 border-gray-300 focus:ring-2 focus:ring-gray-500 rounded-lg"
                value={text}
                onChange={handleInputChange}
                maxLength={500}
                disabled={recordingStatus === 'stopped'}
            />
            <div className="text-center">
                <h4 className="text-md text-gray-600">Limit: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</h4>
                <div className="flex flex-col sm:flex-row items-center">
                    <button
                        className="
                            py-2 
                            px-3
                            mt-2
                            mb-4 
                            m-auto 
                            bg-neutral-800 
                            text-white
                            font-semibold 
                            hover:bg-neutral-600 
                            focus:ring-blue-500 
                            focus:ring-opacity-50
                            disabled:bg-neutral-600 
                            flex 
                            items-center 
                            justify-center
                            "
                        onClick={saveRecords}
                        disabled={recordingStatus !== 'recording'}
                    >
                        <FontAwesomeIcon icon={faPlay} className="mr-2" style={{ width: '1em', height: '1em' }} />
                        筆跡を再生する
                    </button>
                    <button
                        className="
                            py-2 
                            px-3
                            mt-2
                            mb-4 
                            m-auto 
                            bg-neutral-800 
                            text-white
                            font-semibold 
                            hover:bg-neutral-600 
                            focus:ring-blue-500 
                            focus:ring-opacity-50
                            flex 
                            items-center 
                            justify-center
                            "
                        onClick={resetRecorder} // リセットボタンにクリックイベントハンドラを追加
                    >
                        <FontAwesomeIcon icon={faEraser} className="mr-2" style={{ width: '1em', height: '1em' }} />
                        筆跡をリセット
                    </button>
                </div>
                <ul className="list-disc list-inside text-left mx-auto max-w-md tracking-wide">
                    <li>別ページでアニメーションが再生されます。</li>
                    <li>文字数制限は500文字です。</li>
                    <li>タイマーが時間切れになると自動的に再生画面に遷移します。</li>
                    <li>入力した文章記録は共有URLで保存することができます。</li>
                </ul>
            </div>
        </div>
    );
};

export default TextRecorder;
