"use client";
import React, { useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null); //初期値null指定で、指定した型の値で書き換えできる
  const [textAreaValue, setTextAreaValue] = useState<string>("");

  // 30字毎にテキストに改行を挟む
  const InputLineAdd = (text: string) => {// textは引数に渡したe.target.value
    const inputLines = text.split('\n');//テキストの改行分割を変数化
    const processedLines = inputLines.map((line: string) => {//Lineはmap配列の各要素
      let result = "";//生成した文字列をここにadd joinされるまで配列化する
      while (line.length > 30) {//Lineが30文字以上か確認
        result += line.slice(0, 30) + '\n';//0~30文字をsliceし改行
        line = line.slice(30);//30~最後尾までをslice、再度代入し変数を更新、再びループ
      }
      return result + line;//while終了後、余ったLine文字列をresultに追加
    });
    return processedLines.join('\n');//mapの戻り値の各配列を再統合する
  };

  // canvasに文字列を反映
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const formattedText = InputLineAdd(e.target.value); // テキストを整形
    setTextAreaValue(formattedText); // 状態を更新

    const canvas = canvasRef.current; // Canvas要素を参照
    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvasをクリア
        ctx.font = "16px Arial"; // フォントの設定
        ctx.fillStyle = "black"; // 色設定

        // 分割されたテキストを行ごとに描画
        const lines = formattedText.split('\n');
        let y = 20; // 開始のy座標
        lines.forEach(line => {
          ctx.fillText(line, 10, y); // テキストを描画
          y += 20; // 次の行のy座標（行の高さに応じて調整）
        });
      }
    }
};


  return (
    <div className="p-4 bg-gray-200">
      <header className="mb-4">
      </header>
      <main>
        <canvas
          className="flex shadow-md rounded mx-auto border-gray-200 mb-4"
          ref={canvasRef} //値をrefで管理
          width={500} height={250}
        />
        <textarea
          className="shadow-md border border-gray-200"
          rows={5}
          value={textAreaValue}// 値をstateで管理
          onChange={handleInput}
          style={{ width: '100%', resize: 'none' }}
        />
      </main>
    </div>
  );
}
