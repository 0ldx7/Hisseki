import { diff_match_patch } from 'diff-match-patch';

export type InputRecord = {
    diffs: object[];
    timestamp: number;
    timeDiff: number;
};

export const playback = (
    records: InputRecord[],
    setText: (text: string) => void,
    initialText: string = ''
) => {
    const dmp = new diff_match_patch();
    let currentIndex = 0;
    let currentText = initialText;
    setText('');

    const playNext = () => {
        if (currentIndex >= records.length) {
            return;
        }

        const record = records[currentIndex++];
        const [newText, results] = dmp.patch_apply(record.diffs, currentText);

        if (results.some(result => !result)) {
            console.error('Patch application failed:', record.diffs, currentText);
        }

        setText(newText);
        currentText = newText;

        if (currentIndex < records.length) {
            const nextTimeDiff = records[currentIndex]?.timeDiff ?? 1000;
            setTimeout(playNext, nextTimeDiff);
        }
    };

    playNext();
};
