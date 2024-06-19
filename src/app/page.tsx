import Link from 'next/link';
import TextRecorder from './TextRecorder';
import Concept from './Concept/page';

export default function HomePage() {
    return (
        <div>
            <TextRecorder />
            <Concept />
        </div>
    );
}
