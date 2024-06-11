import Link from 'next/link';
import TextRecorder from './TextRecorder';

export default function HomePage() {
    return (
        <div>
            <TextRecorder />
            <Link href="/playback">Go to Playback</Link>
        </div>
    );
}
