// import { diff_match_patch } from 'diff-match-patch';
// import { logError } from '@/utils/errorHandler';

// type InputRecord = {
//     diffs: any;
//     timestamp: number;
//     timeDiff: number;
// };

// const fetchRecords = async (setRecords: React.Dispatch<React.SetStateAction<InputRecord[]>>, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
//     try {
//         const response = await fetch('/api/getConceptPlayback'); // APIエンドポイントを呼び出し
//         if (response.ok) {
//             const data: InputRecord[] = await response.json();
//             data.forEach((record, index) => {
//                 if (record.timeDiff === undefined || record.timeDiff === 0) {
//                     data[index].timeDiff = 1000;
//                 }
//             });
//             setRecords(data);
//             setIsLoading(false);
//         } else {
//             const errorData = await response.json();
//             logError('Failed to fetch records', errorData);
//             setIsLoading(false);
//         }
//     } catch (error) {
//         logError('Error fetching records:', error);
//         setIsLoading(false);
//     }
// };

// const playback = (
//     records: InputRecord[],
//     setText: React.Dispatch<React.SetStateAction<string>>,
//     lastUpdateRef: React.MutableRefObject<number>
// ) => {
//     const dmp = new diff_match_patch();
//     let currentIndex = 0;
//     let currentText = '';

//     const playNext = () => {
//         if (currentIndex >= records.length) {
//             return;
//         }

//         const record = records[currentIndex++];
//         const [newText, results] = dmp.patch_apply(record.diffs, currentText);

//         if (results.some(result => !result)) {
//             console.error('Patch application failed:', record.diffs, currentText);
//         }

//         setText(newText);
//         currentText = newText;
//         lastUpdateRef.current = Date.now();

//         const nextTimeDiff = Math.max(records[currentIndex]?.timeDiff ?? 1000, 100);
//         setTimeout(playNext, nextTimeDiff);
//     };

//     playNext();
// };

// export { fetchRecords, playback };
