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

const generateSessionId = () => '_' + Math.random().toString(36);

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

    useEffect(() => {
        fetchRecords();
    }, []);

    //ローカルまたはDBからのGETに分岐する
    const fetchRecords = async () => {
        const sessionId = searchParams.get('sessionId'); //クエリからsessionID取得

        let data: InputRecord[] = [];
        if (sessionId) { //sessionID保持の際はDBからGET
            data = await fetchRecordsFromDatabase(sessionId);
        } else { //リンク共有前はクエリないのでローカルから取得
            data = fetchRecordsFromLocalStorage();
        }

        setRecords(data); //取得データをstateに反映

        if (data.length > 0) { //取得したdataにrecordsが存在する場合
            const lastRecord = data[data.length - 1]; // 最終レコードを取得
            const lastTimestamp = new Date(lastRecord.timestamp).toLocaleString(); // 最終レコードのタイムスタンプを時刻に変換
            setInitialPlaybackTime(lastTimestamp); // initialPlaybackTimeに設定
        }

        if (sessionId) { //DBからGETした場合
            setShareLink(`${location.origin}/components/Playback?sessionId=${sessionId}`); //共有リンク設定
        }

        setIsLoading(false);
        setIsReplayDisabled(false); // ローディング完了後にリプレイボタンを有効化
    };

    const fetchRecordsFromLocalStorage = (): InputRecord[] => {
        const response = localStorage.getItem('records'); //ローカルストレージからrecordsを取得
        return response ? JSON.parse(response) : []; //JSに変換
    };

    const fetchRecordsFromDatabase = async (sessionId: string): Promise<InputRecord[]> => {
        try {
            const response = await fetch(`/api/getRecords?sessionId=${sessionId}`);
            if (response.ok) {
                const data: InputRecord[] = await response.json(); //inputRecordsを取得
                data.forEach((record, index) => {
                    //timeDiffが未定義の場合分岐
                    if (record.timeDiff === undefined || record.timeDiff === 0) {
                        data[index].timeDiff = 1000;
                        console.log('TimeDiff is null or undefined');
                    }
                });
                return data;
                //エラー発生時分岐
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

    //recordsとisLoadingが変更するたびに実行
    useEffect(() => {
        if (records.length > 0 && !isLoading) { //入力履歴の存在と、ローディング状態でないことを確認
            playbackRecords(true, () => { //isInitialPlaybackで初回再生であることを確認
                setInitialPlaybackDone(true); //初回再生であることを示す
                setTimeout(() => {
                    playbackRecords(false); //初回再生完了後、isInitialPlaybackをfalseに
                }, 0);
            });
        }
    }, [records, isLoading]);

    //リプレイ関数
    //isInitialPlayback:初回再生であることを示す
    const playbackRecords = (isInitialPlayback: boolean, onPlaybackComplete?: () => void) => {
        //再生完了時の初期化処理
        setIsReplayDisabled(true);
        let currentIndex = 0;
        let currentText = '';

        //差分を順次再生する
        const playNext = () => {
            if (currentIndex >= records.length) { //再生完了時
                setIsReplayDisabled(false); //リプレイボタンを押せるように
                if (onPlaybackComplete) onPlaybackComplete();
                return;
            }

            const record = records[currentIndex++];
            const [newText, results] = dmp.patch_apply(record.diffs, currentText);

            //エラー時に分岐
            if (results.some(result => !result)) {
                console.error('Patch application failed:', record.diffs, currentText);
            }

            //初回再生はローディングとみなし、stateに反映しない
            //初回再生でない場合、テキストをstateに反映
            if (!isInitialPlayback) {
                setText(newText);
            }
            currentText = newText; //現在のテキストを新しいテキストに更新
            lastUpdateRef.current = Date.now(); //最後の更新時刻を現在時刻に設定

            //初回再生時はMIN_INTERVAL、以降はtimeDiffとMIN_INTERVALのうち長いほうを選択
            const nextTimeDiff = isInitialPlayback ? MIN_INTERVAL : Math.max(records[currentIndex]?.timeDiff ?? MIN_INTERVAL);
            setTimeout(playNext, nextTimeDiff); //差分時間を考慮し次のテキストを再生
        };

        playNext();
    };

    //sessionID生成、DB保存、共有リンク生成とコピー
    const handleClickCopyAndSave = async () => {
        const sessionId = generateSessionId(); //ID生成
        const records = fetchRecordsFromLocalStorage(); //ローカルストレージから差分情報を取得

        setCopyButtonText('Now Loading...');

        if (shareLink) { //URLにクエリが含まれる場合、共有リンクのコピーだけする
            copyToClipboard();
            return;
        }

        if (records.length > 0) { //recordsが存在する場合、DBに保存
            await saveToDatabase(sessionId, records);
        }

        //共有リンクの生成
        const newShareLink = `${location.origin}/components/Playback?sessionId=${sessionId}`;
        setShareLink(newShareLink);
        localStorage.setItem(`initialPlaybackTime-${sessionId}`, new Date().toLocaleString());
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

    //共有リンクをクリップボードにコピー
    useEffect(() => {
        if (shareLink) {
            copyToClipboard();
        }
    }, [shareLink]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopyButtonText('URL is copied!');
            setTimeout(() => setCopyButtonText('リンクをコピー'), 2000);
        } catch (error) {
            logError('リンクのコピーに失敗しました', error);
        }
    };

    return (
        <div className='flex flex-col min-h-screen relative bg-gradient-to-t from-transparent from-0% via-neutral-100 via-50%'>
            <div className='flex-grow p-6 max-w-xl mx-auto text-black rounded-lg space-y-4'>
                <div className='mt-4 text-right'>
                    {initialPlaybackDone && initialPlaybackTime && <p className='text-sm text-gray-600'>{initialPlaybackTime}</p>}
                </div>
                <div
                    className={`whitespace-pre-wrap p-4 rounded-lg tracking-wide text-2xl text-gray-900 ${isLoading || !initialPlaybackDone ? 'animate-pulse' : ''}`}
                    style={isLoading || !initialPlaybackDone ? { opacity: 0 } : { opacity: 1, fontFamily: 'serif' }}>
                    {isLoading || !initialPlaybackDone ? 'Loading...' : text}
                </div>
                <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                    <button
                        className='group py-3 px-4 mt-2 mb-4 m-auto text-neutral-700 font-light bg-neutral-200 focus:ring-blue-500 focus:ring-opacity-50
                            '
                        onClick={() => playbackRecords(false)}
                        disabled={isReplayDisabled}
                    >
                        <div className='inline-flex items-center'>
                            <FontAwesomeIcon icon={faReply} className='mr-2' style={{ width: '1em', height: '1em' }} />
                            リプレイ
                        </div>
                        <div className='bg-neutral-600 h-[2px] w-0 group-hover:w-full transition-all duration-500 group-disabled:w-0'></div>
                    </button>
                    <Link href='/'>
                        <button className='group py-3 px-4 mt-2 mb-4 font-light text-neutral-700 m-auto focus:ring-blue-500 bg-neutral-200'>
                            <div className='inline-flex items-center'>
                                <FontAwesomeIcon icon={faPenToSquare} className='mr-2' style={{ width: '1em', height: '1em' }} />
                                新しい筆跡を残す
                            </div>
                            <div className='bg-neutral-600 h-[2px] w-0 group-hover:w-full transition-all duration-500'></div>
                        </button>
                    </Link>
                    <button 
                        className='group py-3 px-4 mt-2 mb-4 font-light text-neutral-700 m-auto focus:ring-blue-500 bg-neutral-200'
                        onClick={handleClickCopyAndSave}
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