"use client";
import React, { useState, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { diff_match_patch } from 'diff-match-patch';
import { InputRecord } from '../../utils/paragraphPlayback';
// import { logError } from '../../utils/errorHandler';

// セッションIDを生成する関数。ランダムな文字列を生成。
const generateSessionId = () => '_' + Math.random().toString(36).substr(2, 9);

const TextRecorder: React.FC = () => {
    const [text, setText] = useState<string>(''); // 入力されたテキスト
    const [lastText, setLastText] = useState<string>(''); // 最後に保存されたテキスト
    const [records, setRecords] = useState<InputRecord[]>([]); // テキストの変化履歴
    const [sessionId, setSessionId] = useState<string>(generateSessionId()); // セッションID
    const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 初期値15分のカウントダウンタイマー
    const [recordingStatus, setRecordingStatus] = useState<'notStarted' | 'recording' | 'stopped'>('notStarted'); // 録音状態
    const dmp = new diff_match_patch(); // diff-match-patch インスタンス
    const router = useRouter(); // Next.js のルーター

    // タイマーが開始されたら、1秒ごとにカウントダウンを行う
    useEffect(() => {
        if (recordingStatus === 'recording') {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        setRecordingStatus('stopped'); // 残り時間が1秒以下なら録音を停止
                        clearInterval(timer); // タイマーをクリア
                        // return 0;
                        location.reload(); //ページを自動リロードしリセット
                    }
                    return prevTime - 1;
                });
            }, 1000); //一秒ごとにuseEffect更新

            return () => clearInterval(timer); // クリーンアップ関数
        }
    }, [recordingStatus]);

    // テキストエリアの変更を処理する関数
    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        if (recordingStatus === 'stopped') return; // 録音が停止している場合は何もしない

        if (recordingStatus === 'notStarted') {
            setRecordingStatus('recording'); // 初回入力時にタイマーを開始
        }

        const newText = event.target.value; // 新しいテキストの内容

        if (newText.length > 500) {
            return; // 500文字を超える入力を拒否
        }

        setText(newText); // 新しいテキストを状態にセット
        const diffs = dmp.diff_main(lastText, newText); // テキストの差分を計算
        dmp.diff_cleanupSemantic(diffs); // 差分をセマンティックにクリーンアップ
        const patches = dmp.patch_make(lastText, newText, diffs); // 差分からパッチを作成
        const currentTime = Date.now(); // 現在のタイムスタンプ
        const timeDiff = records.length > 0 ? currentTime - records[records.length - 1].timestamp : 0; // 最後のレコードからの時間差

        if (records.length < 1500) { // レコード数が1500未満の場合
            setRecords((prevRecords) => [
                ...prevRecords,
                { diffs: patches, timestamp: currentTime, timeDiff: timeDiff }
            ]); // 新しいレコードを追加
        }

        setLastText(newText); // 最後のテキストを更新
    };

    // レコードを保存する関数
    const saveRecords = async () => {
        if (records.length === 0) { // レコードがない場合はエラー
            // logError('No records to save', null);
            return;
        }

        try {
            const response = await fetch('/api/saveRecords', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionId, records }) // セッションIDとレコードを送信
            });

            if (response.ok) {
                console.log('Records saved successfully');
                router.push(`/playback?sessionId=${sessionId}`); // 再生画面にリダイレクト
            } else {
                const errorData = await response.json();
                // logError('Failed to save records', errorData);
            }
        } catch (error) {
            // logError('An unexpected error occurred', error);
        }
    };

    return (
        <div className="">
            <textarea
                className="w-full h-48 p-2 text-sm border-2 border-gray-300 focus:ring-2 focus:ring-gray-500 rounded"
                value={text}
                onChange={handleInputChange}
                maxLength={500} // 直接HTMLの属性としても設定
                disabled={recordingStatus === 'stopped'}
            />
            <div className="">
                <h4 className="">limit: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</h4>
                <button
                    className="py-2 px-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    onClick={saveRecords}
                    disabled={recordingStatus !== 'recording'}
                >
                    筆跡を再生する
                </button>
                <ul className='pt-3'>
                    <li>文字数制限は500文字です。</li>
                    <li>タイマーが時間切れになると自動的に再生画面に遷移します。</li>
                    <li>入力した筆跡は共有URLで保存することができます。</li>
                </ul>
            </div>
        </div>
    );
};

export default TextRecorder;
