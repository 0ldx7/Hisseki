"use client"; 
import React, { useState, ChangeEvent, useEffect } from 'react'; // 必要なReactフックと型をインポート
import { useRouter } from 'next/navigation'; // Next.jsのルーティングをインポート
import { diff_match_patch, patch_obj } from 'diff-match-patch'; // テキスト差分を扱うためのライブラリをインポート

// 入力記録の型を定義
type InputRecord = {
    diffs: patch_obj[];
    timestamp: number;
    timeDiff: number;
};

const TextRecorder: React.FC = () => {
    const [text, setText] = useState<string>(''); // 現在のテキストを管理
    const [lastText, setLastText] = useState<string>(''); // 前回のテキストを管理
    const [records, setRecords] = useState<InputRecord[]>([]); // テキストの変更記録を管理
    const dmp = new diff_match_patch(); 
    const router = useRouter(); 

    // 初回レンダリング時に以前の入力記録をlocalから読み込み、入力情報をstateに反映
    useEffect(() => {
        const savedRecords = localStorage.getItem('textRecords'); // webStorageAPIのの'textRecords'に保存された文字列を取得
        if (savedRecords) { //ローカルストレージにデータが存在するか確認
            setRecords(JSON.parse(savedRecords)); // json文字列をjsに変換し、stateに反映
        }
    }, []); //初回レンダリング後にのみ実行するよう第二引数に指定

    // recordsが変更されるたびにlocalStorageに保存する
    useEffect(() => {
        localStorage.setItem('textRecords', JSON.stringify(records)); // 'texRecords'をjson文字列に変換し、localStorageに保存
    }, [records]); //recordsが変更されるたびに実行

    // テキストエリアの入力が変更された時に呼び出される関数
    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const newText = event.target.value; 
        setText(newText); // 新しいテキストをstateに設定
        const diffs = dmp.diff_main(lastText, newText); // lastText,NewTextの違いを計算
        dmp.diff_cleanupSemantic(diffs); // diffsから不要な差分を削除する
        const patches = dmp.patch_make(lastText, newText, diffs); // パッチを作成
        const currentTime = Date.now(); // 現在のタイムスタンプを取得
        const timeDiff = records.length > 0 ? currentTime - records[records.length - 1].timestamp : 0; 
        // 既存記録がある場合、前回の記録からの経過時間を計算

        // 新しい記録を追加
        setRecords((prevRecords) => [ 
            ...prevRecords, //現在のRecords（prevRecords）に以下の記録を追加
            { diffs: patches, timestamp: currentTime, timeDiff: timeDiff }
        ]);
        setLastText(newText); // 現在のテキストを前回のテキストとして設定
    };

    // 再生画面への移動を処理する関数
    const goToPlaybackScreen = () => {
        const url = `/playback?records=${encodeURIComponent(JSON.stringify(records))}`; // 記録をURLパラメータとしてエンコード
        router.push(url); // 指定したURLに遷移
    };

    return (
        // スタイルを適用
        <div className="p-6 max-w-lg mx-auto bg-white text-gray-900 rounded-xl shadow-md space-y-4">
            <textarea
                className="w-full h-48 p-2 text-sm border-2 border-gray-300 focus:ring-2 focus:ring-gray-500 rounded"
                value={text}
                onChange={handleInputChange} // テキストエリアの変更を監視
            />
            <button
                className="w-full py-2 px-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                onClick={goToPlaybackScreen} // 再生画面への移動を処理
            >
                Go to Playback Screen
            </button>
            <div>
                <h4 className="text-lg font-semibold">Input Records</h4>
                <ul className="list-disc space-y-2">
                    {records.map((record, index) => (
                        <li key={index} className="text-sm">{`Changes recorded at ${record.timestamp}`}</li> // 記録のタイムスタンプを表示
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TextRecorder; // コンポーネントをエクスポート
