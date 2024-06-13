"use client"; // クライアントサイドで実行するコンポーネントであることを示す
import React, { useEffect, useState } from 'react'; // Reactのフックをインポート
import { useSearchParams } from 'next/navigation'; // Next.jsの検索パラメータフックをインポート
import { diff_match_patch, patch_obj } from 'diff-match-patch'; // テキスト差分を扱うためのライブラリをインポート

// 入力記録の型を定義
type InputRecord = {
    diffs: patch_obj[];
    timestamp: number;
    timeDiff: number;
};

const Playback: React.FC = () => {
    const [text, setText] = useState<string>(''); // 現在のテキストを管理するための状態フック
    const [records, setRecords] = useState<InputRecord[]>([]); // テキストの変更記録を管理するための状態フック
    const searchParams = useSearchParams(); // URLの検索パラメータを取得するためのフック
    const dmp = new diff_match_patch(); // diff_match_patchのインスタンスを作成

    // コンポーネントがマウントされた時、および検索パラメータが変更された時に実行される
    useEffect(() => {
        const queryRecords = searchParams.get('records'); // URLから'records'を取得
        if (queryRecords) { // 'records'が存在する場合
            try {
                // 取得した'records'をデコードし、JSONパースしてInputRecord型の配列に変換
                const decodedRecords: InputRecord[] = JSON.parse(decodeURIComponent(queryRecords));
                setRecords(decodedRecords); // 'records'の状態を更新
            } catch (e) {
                console.error("Failed to decode records:", e); // デコードやパースに失敗した場合のエラーハンドリング
            }
        }
    }, [searchParams]); // 依存配列に'searchParams'を指定することで、'searchParams'が変更されるたびにこのeffectが実行される

    // テキストの変更を再生するための関数
    const playback = () => {
        let playbackText = ''; // 再生中のテキストを保持する変数
        let lastText = ''; // 前回のテキストを保持する変数
        records.forEach((record, index) => { // 各レコードを順番に処理
            setTimeout(() => { // 各レコードのtimeDiffに基づいて遅延を設定
                const patches = record.diffs; // 現在のレコードのパッチを取得
                const [newText] = dmp.patch_apply(patches, lastText); // パッチを適用して新しいテキストを取得
                lastText = newText; // 前回のテキストを更新
                setText(newText); // 新しいテキストを状態に設定
            }, record.timeDiff * index); // 遅延時間を設定
        });
    };

    // 'records'の状態が変更された時に再生を開始
    useEffect(() => {
        if (records.length > 0) { // 'records'が存在する場合に再生を実行
            playback(); // 再生を開始
        }
    }, [records]); // 依存配列に'records'を指定することで、'records'が変更されるたびにこのeffectが実行される

    return (
        // コンポーネントのレンダリング
        <div className="p-6 max-w-lg mx-auto bg-white text-gray-900 rounded-xl shadow-md space-y-4">
            <h1 className="text-2xl font-bold">Playback Screen</h1>
            <div className="whitespace-pre-wrap">{text}</div> {/* 現在のテキストを表示 */}
            <button
                className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={() => window.history.back()} // ボタンをクリックするとブラウザの履歴を戻る
            >
                Go Back
            </button>
        </div>
    );
};

export default Playback; // コンポーネントをエクスポート
