import DiffMatchPatch from 'diff-match-patch';

const dmp = new DiffMatchPatch();
const diff = dmp.diff_main('dogs bark', 'cats bark');

// You can also use the following properties:
DiffMatchPatch.DIFF_DELETE = -1;
DiffMatchPatch.DIFF_INSERT = 1;
DiffMatchPatch.DIFF_EQUAL = 0;

// class TextEntry {
//     constructor(timeStamp, diff, event = null) {
//       this.timeStamp = timeStamp;
//       this.diff = diff;
//       this.event = event; // "enter", "delete", etc.
//     }
//   }

//   class TextRecorder {
//     constructor(textarea) {
//       this.textarea = textarea;
//       this.previousText = textarea.value;
//       this.entries = [];
//       this.startTime = Date.now();
  
//       textarea.addEventListener('input', (event) => this.recordEntry(event));
//     }
  
//     recordEntry(event) {
//       const currentTime = Date.now() - this.startTime;
//       const currentText = this.textarea.value;
//       const diff = this.calculateDiff(this.previousText, currentText);
//       const entry = new TextEntry(currentTime, diff);
//       this.entries.push(entry);
//       this.previousText = currentText; // 更新前のテキストを現在のテキストで更新
//     }
  
//     calculateDiff(previousText, currentText) {
//       // 差分を計算する簡単な方法は、diff-match-patch ライブラリを使用することです
//       const dmp = new diff_match_patch();
//       const diffs = dmp.diff_main(previousText, currentText);
//       dmp.diff_cleanupSemantic(diffs);
//       return dmp.diff_toDelta(diffs); // 差分をdelta形式で返す
//     }
//   }
  