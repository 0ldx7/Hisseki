"use client";

import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { diff_match_patch, patch_obj } from 'diff-match-patch';

// InputRecord型にtimeDiffを追加して、前回の入力からの時間差を記録
type InputRecord = {
    diffs: patch_obj[];
    timestamp: number;
    timeDiff: number; // 前回の記録からの時間差
};

const TextRecorder: React.FC = () => {
    const [text, setText] = useState<string>(''); // 現在のテキスト状態
    const [lastText, setLastText] = useState<string>(''); // 前回のテキスト状態
    const [records, setRecords] = useState<InputRecord[]>([]); // 変更記録の配列
    const dmp = new diff_match_patch(); // diff-match-patchライブラリのインスタンス

    useEffect(() => {
        // ローカルストレージから記録をロードする
        const savedRecords = localStorage.getItem('textRecords');
        if (savedRecords) {
            setRecords(JSON.parse(savedRecords));
        }
    }, []);

    useEffect(() => {
        // 記録が更新されるたびにローカルストレージに保存する
        localStorage.setItem('textRecords', JSON.stringify(records));
    }, [records]);

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const newText = event.target.value;
        setText(newText);

        const diffs = dmp.diff_main(lastText, newText);
        dmp.diff_cleanupSemantic(diffs);
        const patches = dmp.patch_make(lastText, newText, diffs);
        const currentTime = Date.now();
        // 最後のレコードからの時間差を計算
        const timeDiff = records.length > 0 ? currentTime - records[records.length - 1].timestamp : 0;

        setRecords((prevRecords) => [
            ...prevRecords,
            { diffs: patches, timestamp: currentTime, timeDiff: timeDiff }
        ]);
        setLastText(newText);
    };

    // 再生機能: 各変更を保存された時間差を考慮して再生
    const handlePlayback = () => {
        let currentIndex = 0;
        let currentText = '';
        setText('');

        const playNext = () => {
            if (currentIndex >= records.length) {
                return;
            }

            const record = records[currentIndex++];
            const [newText, _] = dmp.patch_apply(record.diffs, currentText);
            setText(newText);
            currentText = newText;

            if (currentIndex < records.length) {
                // 次の変更を記録された時間差後に実行
                setTimeout(playNext, records[currentIndex].timeDiff);
            }
        };

        playNext();
    };

    return (
        <div>
            <textarea value={text} onChange={handleInputChange} />
            <button onClick={handlePlayback}>Playback</button>
            <div>
                <h4>Input Records</h4>
                <ul>
                    {records.map((record, index) => (
                        <li key={index}>{`Changes recorded at ${record.timestamp}`}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TextRecorder;
