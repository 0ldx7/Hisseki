"use client";
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { diff_match_patch } from 'diff-match-patch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faEraser } from '@fortawesome/free-solid-svg-icons';
import Footer from '@/app/Footer';

type InputRecord = {
    diffs: object[];
    timestamp: number;
    timeDiff: number;
};

const TextRecorder: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [lastText, setLastText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
    const [recordingStatus, setRecordingStatus] = useState<'notStarted' | 'recording' | 'stopped'>('notStarted');
    const timerRef = useRef<NodeJS.Timeout | null>(null);
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

    const saveToLocalStorage = (records: InputRecord[]) => {
        localStorage.setItem('records', JSON.stringify(records));
    };

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
            setRecords((prevRecords) => {
                const updatedRecords = [
                    ...prevRecords,
                    { diffs: patches, timestamp: currentTime, timeDiff }
                ];
                saveToLocalStorage(updatedRecords);
                return updatedRecords;
            });
        }

        if (records.length > 1500) {
            location.reload();
        }

        setLastText(newText);
    };

    const resetRecorder = () => {
        setText('');
        setLastText('');
        setRecords([]);
        localStorage.removeItem('records');
        setTimeLeft(15 * 60);
        setRecordingStatus('notStarted');
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    return (
        <div className="sticky top-0 h-screen flex flex-col min-h-screen text-black">
            <div className='flex-grow flex flex-col items-center justify-center bg-white'>
                <textarea
                    className="w-full max-w-4xl h-48 p-4 mb-4 text-sm border-2 border-gray-300 focus:ring-2 focus:ring-gray-500 rounded-lg"
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
                            onClick={() => router.push('/components/Playback')}
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
                            onClick={resetRecorder}
                        >
                            <FontAwesomeIcon icon={faEraser} className="mr-2" style={{ width: '1em', height: '1em' }} />
                            筆跡をリセット
                        </button>
                    </div>
                    <ul className="list-disc list-inside text-left mx-auto max-w-md tracking-wide">
                        <li>別ページでアニメーションが再生されます。</li>
                        <li>文字数制限は500文字です。</li>
                        <li>タイマーが時間切れになると自動的に再生画面に遷移します。</li>
                        <li>入力した文章は共有リンクから見返すことができます。</li>
                    </ul>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TextRecorder;
