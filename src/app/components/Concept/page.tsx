"use client";
import Header from '@/app/Header';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { diff_match_patch } from 'diff-match-patch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

type InputRecord = {
    diffs: any;
    timestamp: number;
    timeDiff: number;
};

const MIN_INTERVAL = 100;

// 一つのセッションIDを指定
const DEMO_SESSION_ID = '_0.ca4919abr1a';

const Concept: React.FC = () => {
    const [text, setText] = useState<string>('');
    const [records, setRecords] = useState<InputRecord[]>([]);
    const dmp = new diff_match_patch();
    const lastUpdateRef = useRef<number>(Date.now());

    // Supabaseからデモデータを取得
    const fetchDemoRecords = async () => {
        try {
            const { data, error } = await supabase
                .from('text_records')
                .select('*')
                .eq('session_id', DEMO_SESSION_ID);

            if (error) {
                console.error('Error fetching records for session ID:', DEMO_SESSION_ID, error.message);
                return [];
            }

            const sessionRecords = data.map(record => ({
                diffs: record.diffs,
                timestamp: record.timestamp,
                timeDiff: record.time_diff || 1000
            }));

            // timestampでソート
            sessionRecords.sort((a, b) => a.timestamp - b.timestamp);
            return sessionRecords;
        } catch (error) {
            console.error('Error fetching records:', error);
            return [];
        }
    };

    // 文章再生ロジック
    const playback = () => {
        let currentIndex = 0;
        let currentText = '';

        const playNext = () => {
            if (currentIndex >= records.length) {
                return; // すべてのレコードの再生が完了
            }

            const record = records[currentIndex++];
            const [newText, results] = dmp.patch_apply(record.diffs, currentText);

            if (results.some(result => !result)) {
                console.error('Patch application failed:', record.diffs, currentText);
            }

            // テキストの状態を更新
            setText(newText);
            currentText = newText;
            lastUpdateRef.current = Date.now();

            // 次の再生タイミングを設定
            const nextTimeDiff = Math.max(records[currentIndex]?.timeDiff ?? 1000, MIN_INTERVAL);
            setTimeout(playNext, nextTimeDiff);
        };

        playNext();
    };

    useEffect(() => {
        const loadRecords = async () => {
            // データ取得後に状態に設定
            const fetchedRecords = await fetchDemoRecords();
            setRecords(fetchedRecords);
        };

        loadRecords();
    }, []);

    useEffect(() => {
        if (records.length > 0) {
            playback();
        }
    }, [records]);

    return (
        <div className='h-screen items-center mt-24 leading-loose bg-gradient-to-t from-transparent from-0% via-neutral-100 via-50%'>
            <Header />
            <div className='mt-20 text-center'>
                <p className='pb-4'>Hissekiは、あなたが入力したテキストの編集履歴をリアルタイムで記録し、再生することができるアプリです。</p>
                <p className='pb-4'>文章作成のプロセスをトレースすることで、あなたの思考の流れやアイデアの変遷を目に見える形で表現します。</p>
            </div>
            <div className='mt-10 text-center'>
                <p className='text-center pb-4'>個人的な日記、小説や詩、ポエミーなときの独り言など、</p>
                <p className='pb-14'>入力する文章はなんでも構いません。</p>
                <p className='tracking-wide'>あなたの言葉が生まれる瞬間を、少し振り返ってみませんか。</p>
                {/* <div className='animate-initial-invisible'>
                    <FontAwesomeIcon icon={faChevronDown} className='mt-10 animate-fade-down' style={{ width: '2em', height: '2em' }} />
                </div> */}
                <div className="max-h-80 ml-10">
                    <p className='tracking-wide text-left text-5xl font-serif -z-10 [writing-mode:vertical-rl]'>{text}</p>
                </div>
            </div>
        </div>
    );
};

export default Concept;
