"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { diff_match_patch, patch_obj } from 'diff-match-patch';

const Playback: React.FC = () => {
    const [text, setText] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        if (router.isReady) {
            const { text: encodedText } = router.query;
            if (encodedText) {
                try {
                    const decodedText = decodeURIComponent(encodedText as string);
                    setText(decodedText);
                } catch (e) {
                    console.error("Failed to decode text:", e);
                }
            }
        }
    }, [router.isReady, router.query]);

    return (
        <div className="p-6 max-w-lg mx-auto bg-white text-gray-900 rounded-xl shadow-md space-y-4">
            <h1 className="text-2xl font-bold">Playback Screen</h1>
            <p className="whitespace-pre-wrap">{text}</p>
            <button
                className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                onClick={() => router.back()}
            >
                Go Back
            </button>
        </div>
    );
};
 
export default Playback;
