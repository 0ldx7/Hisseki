"use client";

import Header from '@/app/Header';
import React, { useEffect, useState, useRef } from 'react';
import { fetchRecords, playback } from '@/utils/conceptPlayback';

type InputRecord = {
    diffs: any;
    timestamp: number;
    timeDiff: number;
};

const Concept: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const lastUpdateRef = useRef<number>(Date.now());

    useEffect(() => {
        fetchRecords(setRecords, setIsLoading);
    }, []);

    useEffect(() => {
        if (records.length > 0 && !isLoading) {
            playback(records, setText, lastUpdateRef);
        }
    }, [records, isLoading]);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300">
            <Header />
            <p className="m-10">
                Hissekiは、あなたが入力したテキストの編集履歴をリアルタイムで記録し、再生することができるアプリです。<br />
                文章作成のプロセスをトレースして視覚化することで、あなたの思考の流れやアイデアの変遷を鮮明に記録します。<br />
            </p>
            <ul className="p-12 list-none list-inside space-y-2">
                <li>個人的な日記</li>
                <li>詩や小説</li>
                <li>深い内省や思考の観察</li>
                <li>ポエミーなときの独り言</li>
                <li>誰かに向けたメッセージ</li>
            </ul>
            <div 
                className="whitespace-pre-wrap p-4 rounded-lg bg-white text-black animate-pulse"
                style={isLoading ? { opacity: 0 } : { opacity: 1 }}>
                {isLoading ? 'Loading...' : text}
            </div>
        </div>
    );
};

export default Concept;
