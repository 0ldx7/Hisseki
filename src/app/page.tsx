"use client";
import React, { useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const formattedText = InputLineAdd(e.target.value);
    // 整形関数にvalueを渡す
    setTextAreaValue(formattedText);
    // 整形結果がstateに渡されtextarea更新
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "24px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(formattedText, 10, 50);
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
          ref={canvasRef} width={500} height={250}
        />
        <textarea
          className="shadow-md border border-gray-200"
          rows={5}
          value={textAreaValue}
          onChange={handleInput}
          style={{ width: '100%', resize: 'none' }}
        />
      </main>
    </div>
  );
}
