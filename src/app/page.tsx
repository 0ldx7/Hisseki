import TextRecorder from './components/TextRecorder/page';
import Concept from './components/Concept/page';

export default function HomePage() {
    return (
        <div className='relative min-h-screen'>
            <Concept />
            <TextRecorder />
        </div>
    );
}
