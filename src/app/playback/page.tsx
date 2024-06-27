"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation'; // Next.jsのルーターからクエリパラメータを取得するためのフック
import { diff_match_patch, patch_obj } from 'diff-match-patch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaste } from '@fortawesome/free-regular-svg-icons';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { faReply } from '@fortawesome/free-solid-svg-icons/faReply';
import { logError } from '@/utils/errorHandler';

// 入力レコードの型定義
type InputRecord = {
    diffs: object[];
    timestamp: number;
    timeDiff: number;
};

const MIN_INTERVAL = 100; // 最低時間間隔を100msに設定

// Playbackコンポーネントの定義
const Playback: React.FC = () => {
    const [text, setText] = useState<string>(''); // 再生中のテキストを保持
    const [records, setRecords] = useState<InputRecord[]>([]); // 入力レコードを保持
    const [initialPlaybackTime, setInitialPlaybackTime] = useState<string | null>(null); // 初回再生時刻を保持
    const [isReplayDisabled, setIsReplayDisabled] = useState<boolean>(false); // 再生中かどうかを追跡
    const searchParams = useSearchParams(); // クエリパラメータを取得
    const dmp = new diff_match_patch();
    const lastUpdateRef = useRef<number>(Date.now()); // 最後の更新時刻を保持する参照
    const [shareLink, setShareLink] = useState<string>(''); // 共有リンクを保持

    // レコードを取得する非同期関数
    const fetchRecords = async () => {
        const sessionId = searchParams.get('sessionId'); // クエリパラメータからセッションIDを取得
        if (!sessionId) {
            logError('Session ID not found', null); // セッションIDが見つからない場合のエラーメッセージ
            return;
        }

        try {
            const response = await fetch(`/api/getRecords?sessionId=${sessionId}`); // APIからレコードを取得
            if (response.ok) { //リクエストが成功した場合、
                const data: InputRecord[] = await response.json(); // レスポンスをJSONとしてパース
                data.forEach((record, index) => { //recodesのtimeDiffを確認する
                    if (record.timeDiff === undefined || record.timeDiff === 0) {
                        data[index].timeDiff = 1000; // timeDiffが未定義または0の場合、1000msに設定
                        console.log('TimeDiff is null or undefined');
                    }
                });
                setRecords(data); // レコードをstateにセット
                setShareLink(`${window.location.origin}/playback?sessionId=${sessionId}`); // 共有リンクを生成しstateに反映
                const storedTime = localStorage.getItem(`initialPlaybackTime-${sessionId}`); // ローカルストレージから初回再生時刻を取得
                if (storedTime) {
                    setInitialPlaybackTime(storedTime); // 初回再生時刻を状態にセット
                }
            } else {
                const errorData = await response.json();
                logError('Failed to fetch records', errorData); // レコードの取得に失敗した場合のエラーメッセージ
            }
        } catch (error) {
            logError('Error fetching records:', error); // 非同期操作でエラーが発生した場合のエラーメッセージ
        }
    };

    // コンポーネントの初回マウント時にレコードを取得
    useEffect(() => {
        fetchRecords();
    }, []);

    // テキスト再生機能
    const playback = () => {
        setIsReplayDisabled(true); // 再生中に設定
        let currentIndex = 0; // 現在の再生インデックスを初期化
        let currentText = ''; // 現在のテキストを初期化
        setText(''); // 表示テキストをリセット

        //初回再生時刻を記録
        const sessionId = searchParams.get('sessionId'); // クエリパラメータからセッションIDを取得
        if (!initialPlaybackTime && sessionId) {
            const currentTime = new Date().toLocaleString(); // ローカライズした現在時刻を文字列として取得
            localStorage.setItem(`initialPlaybackTime-${sessionId}`, currentTime); // 一意のキーを設定し、初回再生時刻をローカルストレージに保存
            setInitialPlaybackTime(currentTime); // 初回再生時刻を状態にセット
        }

        // 次のレコードを再生する関数
        const playNext = () => {
            if (currentIndex >= records.length) {
                setIsReplayDisabled(false); // 再生が終了した場合、再生中フラグをオフにする
                return; // 再生が終了した場合、関数を終了
            }

            const record = records[currentIndex++]; // 現在のレコードを取得し、次のインデックスをインクリメント
            const [newText, results] = dmp.patch_apply(record.diffs, currentText); // パッチを適用して新しいテキストを生成

            if (results.some(result => !result)) { //resultがfalseの場合、
                console.error('Patch application failed:', record.diffs, currentText); // パッチの適用に失敗した場合のエラーメッセージ
            }

            setText(newText); // 新しいテキストを状態にセット
            currentText = newText; // 現在のテキストを更新
            lastUpdateRef.current = Date.now(); // 最後の更新時刻を現在の時刻に設定

            if (currentIndex < records.length) {
                const nextTimeDiff = Math.max(records[currentIndex]?.timeDiff ?? 1000, MIN_INTERVAL); // 次の再生タイミングを計算
                setTimeout(playNext, nextTimeDiff); // 次の再生をスケジュール
            } else {
                setIsReplayDisabled(false); // 再生が終了した場合、再生中フラグをオフにする
            }
        };

        playNext(); // 初回再生を開始
    };

    // レコードが取得された後に再生を開始するuseEffectフック
    useEffect(() => {
        if (records.length > 0) {
            playback(); // 再生を開始
        }
    }, [records]);

    // 共有リンクをクリップボードにコピーする関数
    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            alert('共有リンクをクリップボードにコピーしました'); // コピー成功時のアラート
        }).catch(error => {
            logError('リンクのコピーに失敗しました', error); // コピー失敗時のエラーメッセージ
        });
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white text-gray-900 rounded-xl shadow-md space-y-4">
            <div className="whitespace-pre-wrap p-4 bg-gray-100 rounded-lg min-h-[200px]">
                {text}
            </div>
            <div className="mt-4 text-center">
                <p className="
                    text-sm
                    text-gray-600
                ">{initialPlaybackTime}</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <button
                    className="
                        py-2
                        px-4
                        bg-gray-800 
                        text-white 
                        font-semibold 
                        rounded-lg 
                        hover:bg-gray-600 
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-blue-500 
                        focus:ring-opacity-50 
                        flex 
                        items-center 
                        justify-center 
                        disabled:bg-gray-400
                    "
                    onClick={playback}
                    disabled={isReplayDisabled}
                >
                    <FontAwesomeIcon icon={faReply} className="mr-2" style={{ width: '1em', height: '1em' }} />
                    Replay
                </button>
                <button
                    className="
                        py-2 
                        px-4 
                        bg-gray-800 
                        text-white 
                        font-semibold 
                        rounded-lg 
                        hover:bg-gray-600 
                        focus:outline-none focus:ring-2 
                        focus:ring-blue-500 
                        focus:ring-opacity-50 
                        flex 
                        items-center 
                        justify-center
                    "
                    onClick={() => window.history.back()}
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="mr-2" style={{ width: '1em', height: '1em' }} />
                    Rewrite
                </button>
                <button
                    className="
                        py-2 
                        px-4 
                        bg-gray-800 
                        text-white 
                        font-semibold 
                        rounded-lg 
                        hover:bg-gray-600 
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-blue-500 
                        focus:ring-opacity-50
                        flex 
                        items-center 
                        justify-center
                    "
                    onClick={copyToClipboard}
                >
                    <FontAwesomeIcon icon={faPaste} className="mr-2" style={{ width: '1em', height: '1em' }} />
                    Share
                </button>
            </div>
        </div>
    );
};

export default Playback; // Playbackコンポーネントをエクスポート
