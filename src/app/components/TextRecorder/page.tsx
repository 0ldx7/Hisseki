'use client';
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
    const timerRef = useRef<number | null>(null);
    const dmp = new diff_match_patch();
    const router = useRouter();

    useEffect(() => {
        if (recordingStatus === 'recording') { //テキスト入力時にタイマーが始動
            timerRef.current = window.setInterval(() => { //一秒ごとに実行
                setTimeLeft((prevTime) => { //timeLeftの初期値を渡す
                    if (prevTime <= 1) { //0になったら停止
                        setRecordingStatus('stopped');
                        clearInterval(timerRef.current!);
                        router.push('/components/Playback');
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
    }, [recordingStatus]);


    const handleInputRecords = (event: ChangeEvent<HTMLTextAreaElement>) => {
        if (recordingStatus === 'stopped') return;

        if (recordingStatus === 'notStarted') {
            setRecordingStatus('recording');
        }

        const newText = event.target.value;

        setText(newText);
        const diffs = dmp.diff_main(lastText, newText); //入力前と後の差分を計算し、リスト化
        dmp.diff_cleanupSemantic(diffs); //差分リストの不要部分を削除
        const patches = dmp.patch_make(lastText, newText, diffs); //テキスト生成のための操作を定義
        const currentTime = Date.now();
        //配列が空でない場合、最後のtimestampと現在時刻から時間差を求める
        const timeDiff = records.length > 0 ? currentTime - records[records.length - 1].timestamp : 0;

        //差分情報をローカルストレージに保存する
        if (records.length < 1500) {
            setRecords((prevRecords) => {
                const updatedRecords = [
                    ...prevRecords,
                    { diffs: patches, timestamp: currentTime, timeDiff }
                ];
                saveToLocalStorage(updatedRecords); //ローカルストレージへの保存
                return updatedRecords; //setRecordsを改めて返す
            });
        }

        //差分のrecordsが1500を超えたら自動で初期化、リロード
        if (records.length > 1500) {
            resetRecorder();
            location.reload();
        }

        setLastText(newText);
    };

    const saveToLocalStorage = (records: InputRecord[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('records', JSON.stringify(records));
        }
    };
    
    //生成された差分情報とカウントダウン、フラグを初期化する
    const resetRecorder = () => {
        setText('');
        setLastText('');
        setRecords([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('records');
        }
        setTimeLeft(15 * 60);
        setRecordingStatus('notStarted');
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };
    

    return (
        <div className='h-screen flex flex-col min-h-screen text-black bg-gradient-to-t from-transparent from-0% via-neutral-100 via-50%'>
            <div className='flex-grow flex flex-col items-center justify-center'>
                <textarea
                    className='w-full max-w-4xl h-48 p-4 mb-4 text-base leading-normal border-2 bg-white border-gray-300 focus:ring-2 focus:ring-gray-500 rounded-lg'
                    value={text}
                    onChange={handleInputRecords}
                    maxLength={500}
                    disabled={recordingStatus === 'stopped'}
                    placeholder='ここに文章を入力してください'
                />
                <div className='text-center'>
                    {/* (timeLeft / 60)で分数を求め、(timeLeft % 60)であまりの秒数を求める */}
                    <h4 className='text-md text-gray-600'>Limit: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</h4>
                    <div className='flex flex-col sm:flex-row items-center mt-3'>
                        <button
                            className='
                                group
                                py-3
                                px-4
                                mt-2
                                mb-4 
                                m-auto 
                                text-white
                                font-medium
                                bg-neutral-700
                                focus:ring-blue-500 
                                focus:ring-opacity-50
                                '
                            onClick={() => router.push('/components/Playback')}
                            disabled={recordingStatus !== 'recording'}
                        >
                            <div className='inline-flex items-center'>
                                <FontAwesomeIcon icon={faPlay} className='mr-2' style={{ width: '1em', height: '1em' }} />
                                筆跡を再生する
                            </div>
                            <div className='bg-white h-[2px] w-0 group-hover:w-full transition-all duration-500 group-disabled:w-0'></div>
                        </button>
                        <button
                            className='
                                group
                                py-3
                                px-4
                                mt-2
                                mb-4 
                                font-medium
                                text-neutral-700
                                m-auto
                                focus:ring-blue-500 
                                bg-neutral-200 
                                '
                            onClick={resetRecorder}
                        >
                            <div className='inline-flex items-center'>
                                <FontAwesomeIcon icon={faEraser} className='mr-2' style={{ width: '1em', height: '1em' }} />
                                筆跡をリセット
                            </div>
                            <div className='bg-neutral-600 h-[2px] w-0 group-hover:w-full transition-all duration-500'></div>
                        </button>
                    </div>
                    <ul className='mt-5 list-disc list-inside text-left text-base mx-auto max-w-lg tracking-wider leading-normal'>
                        <li>別ページでアニメーションが再生されます。</li>
                        <li>文字数制限は500文字です。</li>
                        <li>タイマーが時間切れになると自動的に再生を開始します。</li>
                        <li>再生画面で共有リンクをコピーすると、好きな時にアニメーションが鑑賞できます。</li>
                    </ul>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TextRecorder;
