'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { diff_match_patch } from 'diff-match-patch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaste, faPenToSquare, faReply } from '@fortawesome/free-solid-svg-icons';
import { logError } from '@/utils/errorHandler';
import Footer from '@/app/Footer';
import Link from 'next/link';

type InputRecord = {
    diffs: any;
    timestamp: number;
    timeDiff: number;
};

const MIN_INTERVAL = 100;

const generateSessionId = () => '_' + Math.random().toString(36).substr(2, 9);

const Playback: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const [initialPlaybackTime, setInitialPlaybackTime] = useState<string | null>(null); //初回再生時刻
    const [isReplayDisabled, setIsReplayDisabled] = useState<boolean>(true);  //リプレイボタンの使用可否
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [initialPlaybackDone, setInitialPlaybackDone] = useState<boolean>(false);
    const [copyButtonText, setCopyButtonText] = useState<string>('リンクをコピー');
    const searchParams = useSearchParams();
    const dmp = new diff_match_patch();
    const lastUpdateRef = useRef<number>(Date.now());
    const [shareLink, setShareLink] = useState<string>('');

    const fetchRecordsFromLocalStorage = (): InputRecord[] => {
        const storedData = localStorage.getItem('records'); //ローカルストレージからrecordsを取得
        return storedData ? JSON.parse(storedData) : []; //JSに変換
    };

    const fetchRecordsFromDatabase = async (sessionId: string): Promise<InputRecord[]> => {
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
                return data;
            } else {
                const errorData = await response.json();
                logError('Failed to fetch records', errorData);
                return [];
            }
        } catch (error) {
            logError('Error fetching records:', error);
            return [];
        }
    };

    const fetchRecords = async () => {
        const sessionId = searchParams.get('sessionId');

        let data: InputRecord[] = [];
        if (sessionId) {
            data = await fetchRecordsFromDatabase(sessionId);
        } else {
            data = fetchRecordsFromLocalStorage();
        }

        setRecords(data);

        if (sessionId) {
            setShareLink(`${window.location.origin}/components/Playback?sessionId=${sessionId}`);
            const storedTime = localStorage.getItem(`initialPlaybackTime-${sessionId}`);
            if (storedTime) {
                setInitialPlaybackTime(storedTime);
            }
        }

        setIsLoading(false);

        // ローディング終了後の時刻をinitialPlaybackTimeとして設定
        const currentTime = new Date().toLocaleString();
        if (!initialPlaybackTime) {
            setInitialPlaybackTime(currentTime);
            if (sessionId) {
                localStorage.setItem(`initialPlaybackTime-${sessionId}`, currentTime);
            }
        }

        setIsReplayDisabled(false); // ローディング完了後にリプレイボタンを有効化
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const playback = (isInitialPlayback: boolean, onPlaybackComplete?: () => void) => {
        setIsReplayDisabled(true);
        let currentIndex = 0;
        let currentText = '';

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

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopyButtonText('URL is copied!');
            setTimeout(() => setCopyButtonText('リンクをコピー'), 2000);
        } catch (error) {
            logError('リンクのコピーに失敗しました', error);
        }
    };

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

    const handleCopyAndSave = async () => {
        const sessionId = generateSessionId();
        const records = fetchRecordsFromLocalStorage();
        if (records.length > 0) {
            await saveToDatabase(sessionId, records);
        }
    
        const newShareLink = `${window.location.origin}/components/Playback?sessionId=${sessionId}`;
        setShareLink(newShareLink);
        localStorage.setItem(`initialPlaybackTime-${sessionId}`, new Date().toLocaleString());
    };
    
    useEffect(() => {
        if (shareLink) {
            copyToClipboard();
        }
    }, [shareLink]);
    

    return (
        <div className='flex flex-col min-h-screen relative bg-gradient-to-t from-transparent from-0% via-neutral-100 via-50%'>
            <div className='flex-grow p-6 max-w-xl mx-auto text-black rounded-lg space-y-4'>
                <div className='mt-4 text-right'>
                    {initialPlaybackDone && initialPlaybackTime && <p className='text-sm text-gray-600'>{initialPlaybackTime}</p>}
                </div>
                <div
                    className={`whitespace-pre-wrap p-4 rounded-lg tracking-wide text-lg text-black ${isLoading || !initialPlaybackDone ? 'animate-pulse' : ''}`}
                    style={isLoading || !initialPlaybackDone ? { opacity: 0 } : { opacity: 1 }}>
                    {isLoading || !initialPlaybackDone ? 'Loading...' : text}
                </div>
                <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                    <button
                        className='
                            group
                            py-3
                            px-4
                            mt-2
                            mb-4 
                            m-auto 
                            text-neutral-700
                            font-light
                            bg-neutral-200
                            focus:ring-blue-500 
                            focus:ring-opacity-50
                            '
                        onClick={() => playback(false)}
                        disabled={isReplayDisabled}
                    >
                        <div className='inline-flex items-center'>
                            <FontAwesomeIcon icon={faReply} className='mr-2' style={{ width: '1em', height: '1em' }} />
                            リプレイ
                        </div>
                        <div className='bg-neutral-600 h-[2px] w-0 group-hover:w-full transition-all duration-500 group-disabled:w-0'></div>
                    </button>
                    <Link href='/'>
                        <button
                            className='
                                group
                                py-3
                                px-4
                                mt-2
                                mb-4 
                                font-light
                                text-neutral-700
                                m-auto
                                focus:ring-blue-500 
                                bg-neutral-200 
                                '
                        >
                            <div className='inline-flex items-center'>
                                <FontAwesomeIcon icon={faPenToSquare} className='mr-2' style={{ width: '1em', height: '1em' }} />
                                新しい筆跡を残す
                            </div>
                            <div className='bg-neutral-600 h-[2px] w-0 group-hover:w-full transition-all duration-500'></div>
                        </button>
                    </Link>
                    <button
                        className='
                            group
                            py-3
                            px-4
                            mt-2
                            mb-4 
                            font-light
                            text-neutral-700
                            m-auto
                            focus:ring-blue-500 
                            bg-neutral-200 
                            '
                        onClick={handleCopyAndSave}
                    >
                        <div className='inline-flex items-center'>
                            <FontAwesomeIcon icon={faPaste} className='mr-2' style={{ width: '1em', height: '1em' }} />
                            {copyButtonText}
                        </div>
                        <div className='bg-neutral-600 h-[2px] w-0 group-hover:w-full transition-all duration-500'></div>
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Playback;
