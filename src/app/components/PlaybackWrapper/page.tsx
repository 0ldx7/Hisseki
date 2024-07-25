'use client';
import React, { Suspense } from 'react';
import Playback from '../Concept/Playback/page';

const PlaybackWrapper: React.FC = () => {
    return (
        <Suspense>
            <Playback />
        </Suspense>
    );
};

export default PlaybackWrapper;
