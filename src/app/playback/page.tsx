"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { diff_match_patch, patch_obj } from 'diff-match-patch';

// 型定義：入力記録の構造を定義
type InputRecord = {
    diffs: patch_obj[];
    timestamp: number;
    timeDiff: number;
};

const Playback: React.FC = () => {
    const [text, setText] = useState<string>('');  // 現在のテキスト状態
    const [records, setRecords] = useState<InputRecord[]>([]);  // 変更記録の配列
    const searchParams = useSearchParams();  // URLのクエリパラメータを取得するフック
    const dmp = new diff_match_patch();  // diff-match-patchライブラリのインスタンス

    // 記録を取得する非同期関数
    const fetchRecords = async () => {
        const sessionId = searchParams.get('sessionId');  // URLのクエリパラメータからsessionIdを取得
        if (!sessionId) {
            console.error('Session ID not found');
            return;
        }

        // APIエンドポイントから記録を取得
        const response = await fetch(`/api/getRecords?sessionId=${sessionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data: InputRecord[] = await response.json();  // JSONレスポンスをパース
            console.log('Fetched records:', data);  // デバッグ用ログ

            // すべてのレコードの`timeDiff`を確認し、未定義の場合はデフォルト値を設定
            data.forEach((record, index) => {
                if (record.timeDiff === undefined) {
                    data[index].timeDiff = 1000;  // デフォルト値として1000msを設定
                }
            });

            setRecords(data);  // 記録を状態に設定
        } else {
            console.error('Failed to fetch records');
        }
    };

    // コンポーネントがマウントされた時に記録を取得
    useEffect(() => {
        fetchRecords();
    }, []);

    // 記録を再生する関数
    const playback = () => {
        let currentIndex = 0;  // 現在の記録のインデックス
        let currentText = '';  // 現在のテキスト状態
        setText('');  // テキストを初期化

        const playNext = () => {
            if (currentIndex >= records.length) {
                console.log('All records have been played');
                return;  // 全ての記録が再生された場合、終了
            }

            const record = records[currentIndex++];
            console.log(`Record ${currentIndex - 1}:`, record); // 各記録の詳細をログに出力
            const [newText, results] = dmp.patch_apply(record.diffs, currentText);
            console.log(`Applying patches for record ${currentIndex - 1}:`, record.diffs);  // デバッグ用ログ
            console.log(`Patch results for record ${currentIndex - 1}:`, results);  // デバッグ用ログ
            console.log(`Updated text for record ${currentIndex - 1}:`, newText);  // デバッグ用ログ

            if (results.some(result => !result)) {
                console.error('Patch application failed:', record.diffs, currentText);  // パッチ適用に失敗した場合のエラーログ
            }

            setText(newText);  // テキスト状態を更新
            currentText = newText;  // 現在のテキストを更新

            if (currentIndex < records.length) {
                const nextTimeDiff = records[currentIndex]?.timeDiff ?? 1000; // 次の記録のtimeDiffを取得し、undefinedの場合はデフォルト値1000msを設定
                console.log(`TimeDiff for record ${currentIndex - 1}:`, record.timeDiff);  // デバッグ用ログ
                console.log(`Next timeDiff:`, nextTimeDiff); // 次のtimeDiffをログに出力
                setTimeout(playNext, record.timeDiff);  // 次の変更を記録された時間差後に実行
            }
        };

        playNext();  // 再生を開始
    };

    // 記録が更新された時に再生を開始
    useEffect(() => {
        if (records.length > 0) {
            playback();
        }
    }, [records]);

    return (
        <div className="p-6 max-w-lg mx-auto bg-white text-gray-900 rounded-xl shadow-md space-y-4">
            <h1 className="text-2xl font-bold">Playback Screen</h1>
            <div className="whitespace-pre-wrap">{text}</div>  // テキストを表示
            <button
                className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={() => window.history.back()}  // 戻るボタン
            >
                Go Back
            </button>
        </div>
    );
};

export default Playback;
