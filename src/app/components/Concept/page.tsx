"use client";

import Header from '@/app/Header';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { diff_match_patch } from 'diff-match-patch';

type InputRecord = {
    diffs: any;
    timestamp: number;
    timeDiff: number;
};

const MIN_INTERVAL = 100;
const DEMO_SESSION_ID = '_5vc66v43d'; // デモ用のセッションIDを指定

const Concept: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const [isReplayDisabled, setIsReplayDisabled] = useState<boolean>(false);
    const dmp = new diff_match_patch();
    const lastUpdateRef = useRef<number>(Date.now());

    // Supabaseからデモ用のデータを取得
    const fetchDemoRecords = async () => {
        try {
            const { data, error } = await supabase
                .from('text_records')
                .select('*')
                .eq('session_id', DEMO_SESSION_ID);

            if (error) {
                console.error('Error fetching records:', error.message);
                return [];
            }

            return data.map(record => ({
                diffs: record.diffs,
                timestamp: record.timestamp,
                timeDiff: record.time_diff || 1000
            }));
        } catch (error) {
            console.error('Error fetching records:', error);
            return [];
        }
    };

    // 文章再生ロジック
    const playback = () => {
        setIsReplayDisabled(true);
        let currentIndex = 0;
        let currentText = '';

        const playNext = () => {
            if (currentIndex >= records.length) {
                setIsReplayDisabled(false);
                return;
            }

            const record = records[currentIndex++];
            const [newText, results] = dmp.patch_apply(record.diffs, currentText);

            if (results.some(result => !result)) {
                console.error('Patch application failed:', record.diffs, currentText);
            }

            setText(newText);
            currentText = newText;
            lastUpdateRef.current = Date.now();

            const nextTimeDiff = Math.max(records[currentIndex]?.timeDiff ?? 1000, MIN_INTERVAL);
            setTimeout(playNext, nextTimeDiff);
        };

        playNext();
    };

    useEffect(() => {
        const loadDemoRecords = async () => {
            const demoRecords = await fetchDemoRecords();
            setRecords(demoRecords);
        };
        loadDemoRecords();
    }, []);

    useEffect(() => {
        if (records.length > 0) {
            playback();
        }
    }, [records]);

    return (
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center bg-white">
            <Header />
            <div className="m-10 text-center">
                <p>
                    Hissekiは、あなたが入力したテキストの編集履歴をリアルタイムで記録し、再生することができるアプリです。<br />
                    文章作成のプロセスをトレースして視覚化することで、あなたの思考の流れやアイデアの変遷を鮮明に記録します。<br />
                </p>
                <div className="whitespace-pre-wrap p-4 rounded-lg bg-white text-black mt-4">
                    {text}
                </div>
            </div>
            <ul className="p-12 list-none list-inside space-y-2">
                <li>個人的な日記</li>
                <li>詩や小説</li>
                <li>深い内省や思考の観察</li>
                <li>ポエミーなときの独り言</li>
                <li>誰かに向けたメッセージ</li>
            </ul>
        </div>
    );
};

export default Concept;
