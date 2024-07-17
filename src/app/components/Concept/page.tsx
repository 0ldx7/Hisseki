'use client';

import Header from '@/app/Header';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { diff_match_patch } from 'diff-match-patch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
// import ColorThemeSelector from '../ColorThemeSelector/page';

type InputRecord = {
    diffs: any;
    timestamp: number;
    timeDiff: number;
};

const MIN_INTERVAL = 100;
const DEMO_SESSION_ID = '_n5hulccn0'; // デモ用のセッションIDを指定


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
        <div className='h-screen items-center mt-40 leading-loose bg-gradient-to-t from-transparent from-0% via-neutral-100 via-50%'>
            <Header />
            {/* <ColorThemeSelector /> */}
            <div className='mt-20 text-center'>
                <p className='pb-4'>Hissekiは、あなたが入力したテキストの編集履歴をリアルタイムで記録し、再生することができるアプリです。</p>
                <p className='pb-4'>文章作成のプロセスをトレースすることで、あなたの思考の流れやアイデアの変遷を目に見える形で表現します。</p>
            </div>
            <div className='mt-10 relative text-center'>
                <p className='text-center pb-4'>個人的な日記、小説や詩、ポエミーなときの独り言など、</p>
                <p className='pb-14'>どんな文章でもOKです。</p>
                <p className='tracking-wide'>あなたの言葉が生まれる瞬間を、少し振り返ってみませんか。</p>
                {/* <p className='tracking-wide'>{text}</p> */}
                <FontAwesomeIcon icon={faChevronDown} className='mt-20 animate-fade-down' style={{ width: '2em', height: '2em' }} />
            </div>
        </div>      
    );
};

export default Concept;
