"use client";

import React from 'react';
import { useLocation } from 'react-router-dom';
import { useRouter } from 'next/navigation';


const PlaybackScreen: React.FC = () => {
    const location = useLocation();
    // const { text } = location.state as { text: string }; // TextRecorderから渡された状態を取得

    const router = useRouter();
    const { text } = router.query; // クエリからテキストを取得

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
        <div>
            <h2>Text Playback</h2>
            <p>{text}</p>
        </div>
        </div>
    );
};
