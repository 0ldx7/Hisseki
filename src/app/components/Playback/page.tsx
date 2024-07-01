"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { diff_match_patch } from 'diff-match-patch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaste, faPenToSquare, faReply } from '@fortawesome/free-solid-svg-icons';
import { logError } from '@/utils/errorHandler';
import Header from '@/app/Header';
import Footer from '@/app/Footer';

type InputRecord = {
    diffs: any;
    timestamp: number;
    timeDiff: number;
};

const MIN_INTERVAL = 100;

const Playback: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const [initialPlaybackTime, setInitialPlaybackTime] = useState<string | null>(null);
    const [isReplayDisabled, setIsReplayDisabled] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [initialPlaybackDone, setInitialPlaybackDone] = useState<boolean>(false);
    const [copyButtonText, setCopyButtonText] = useState<string>('リンクをコピー');
    const searchParams = useSearchParams();
    const dmp = new diff_match_patch();
    const lastUpdateRef = useRef<number>(Date.now());
    const [shareLink, setShareLink] = useState<string>('');

    const fetchRecords = async () => {
        const sessionId = searchParams.get('sessionId');
        if (!sessionId) {
            logError('Session ID not found', null);
            return;
        }

        try {
            const response = await fetch(`/api/getRecords?sessionId=${sessionId}`);
            if (response.ok) {
                const data: InputRecord[] = await response.json();
                data.forEach((record, index) => {
                    if (record.timeDiff === undefined || record.timeDiff === 0) {
                        data[index].timeDiff = 1000;
                        console.log('TimeDiff is null or undefined');
                    }
                });
                setRecords(data);
                setShareLink(`${window.location.origin}/playback?sessionId=${sessionId}`);
                const storedTime = localStorage.getItem(`initialPlaybackTime-${sessionId}`);
                if (storedTime) {
                    setInitialPlaybackTime(storedTime);
                }
                setIsLoading(false);
            } else {
                const errorData = await response.json();
                logError('Failed to fetch records', errorData);
                setIsLoading(false);
            }
        } catch (error) {
            logError('Error fetching records:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const playback = (isInitialPlayback: boolean, onPlaybackComplete?: () => void) => {
        setIsReplayDisabled(true);
        let currentIndex = 0;
        let currentText = '';

        const sessionId = searchParams.get('sessionId');
        if (!initialPlaybackTime && sessionId) {
            const currentTime = new Date().toLocaleString();
            localStorage.setItem(`initialPlaybackTime-${sessionId}`, currentTime);
            setInitialPlaybackTime(currentTime);
        }

        const playNext = () => {
            if (currentIndex >= records.length) {
                setIsReplayDisabled(false);
                if (onPlaybackComplete) onPlaybackComplete();
                return;
            }

            const record = records[currentIndex++];
            const [newText, results] = dmp.patch_apply(record.diffs, currentText);

            if (results.some(result => !result)) {
                console.error('Patch application failed:', record.diffs, currentText);
            }

            if (!isInitialPlayback) {
                setText(newText);
            }
            currentText = newText;
            lastUpdateRef.current = Date.now();

            const nextTimeDiff = isInitialPlayback ? MIN_INTERVAL : Math.max(records[currentIndex]?.timeDiff ?? 1000, MIN_INTERVAL);
            setTimeout(playNext, nextTimeDiff);
        };

        playNext();
    };

    useEffect(() => {
        if (records.length > 0 && !isLoading) {
            playback(true, () => {
                setInitialPlaybackDone(true);
                setTimeout(() => {
                    playback(false);
                }, 0); // 初回再生が終わったら直ちに再度再生
            });
        }
    }, [records, isLoading]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            setCopyButtonText('URL is copied!');
            setTimeout(() => setCopyButtonText('リンクをコピー'), 2000);
        }).catch(error => {
            logError('リンクのコピーに失敗しました', error);
        });
    };

    // ローカルストレージからデータを取得する関数
    const getFromLocalStorage = (sessionId: string): InputRecord[] => {
        const storedData = localStorage.getItem(sessionId);
        return storedData ? JSON.parse(storedData) : [];
    };

    // DBにデータをPOSTする関数
    const saveToDatabase = async (sessionId: string, records: InputRecord[]) => {
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
            } else {
                const errorData = await response.json();
                logError('Failed to save records', errorData);
            }
        } catch (error) {
            logError('An unexpected error occurred', error);
        }
    };

    // 共有リンクボタンのクリックイベントに紐付ける関数
    const handleCopyAndSave = async () => {
        const sessionId = searchParams.get('sessionId');
        if (!sessionId) {
            logError('Session ID not found', null);
            return;
        }

        const records = getFromLocalStorage(sessionId);
        if (records.length > 0) {
            await saveToDatabase(sessionId, records);
        }

        copyToClipboard();
    };

    return (
        <div className='flex flex-col min-h-screen relative'>
            <Header />
            <div className="flex-grow p-6 max-w-xl mx-auto bg-white text-black rounded-lg space-y-4">
                <div className="mt-4 text-right">
                    {initialPlaybackDone && <p className="text-sm text-gray-600">{initialPlaybackTime}</p>}
                </div>
                <div
                    className={`whitespace-pre-wrap p-4 rounded-lg bg-white text-black ${isLoading || !initialPlaybackDone ? 'animate-pulse' : ''}`}
                    style={isLoading || !initialPlaybackDone ? { opacity: 0 } : { opacity: 1 }}>
                    {isLoading || !initialPlaybackDone ? 'Loading...' : text}
                </div>
                <div className="flex flex-col p-2 sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                        className="
                            py-2
                            px-4
                            disabled:hover:bg-gray-800
                            bg-gray-800 
                            text-white 
                            font-semibold
                            hover:bg-gray-500 
                            focus:outline-none 
                            focus:ring-2 
                            focus:ring-blue-500 
                            focus:ring-opacity-50 
                            flex 
                            items-center 
                            justify-center 
                        "
                        onClick={() => playback(false)}
                        disabled={isReplayDisabled}
                    >
                        <FontAwesomeIcon icon={faReply} className="mr-2" style={{ width: '1em', height: '1em' }} />
                        リプレイ
                    </button>
                    <button
                        className="
                            py-2 
                            px-4 
                            bg-gray-800 
                            text-white 
                            font-semibold 
                            hover:bg-gray-500 
                            focus:outline-none 
                            focus:ring-2 
                            focus:ring-blue-500 
                            focus:ring-opacity-50 
                            flex 
                            items-center 
                            justify-center
                        "
                        onClick={() => window.history.back()}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} className="mr-2" style={{ width: '1em', height: '1em' }} />
                        新しい筆跡を残す
                    </button>
                    <button
                        className="
                            py-2 
                            px-4 
                            bg-gray-800 
                            text-white 
                            font-semibold 
                            hover:bg-gray-500 
                            focus:outline-none 
                            focus:ring-2 
                            focus:ring-blue-500 
                            focus:ring-opacity-50
                            flex 
                            items-center 
                            justify-center
                        "
                        onClick={handleCopyAndSave}
                    >
                        <FontAwesomeIcon icon={faPaste} className="mr-2" style={{ width: '1em', height: '1em' }} />
                        {copyButtonText}
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Playback;
