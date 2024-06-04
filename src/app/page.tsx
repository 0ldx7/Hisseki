"use client";
import React, { useRef, useEffect } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const canvas = canvasRef.current;
    // getContextではなくuseRefを使用した参照
    // 初期値はnullに設定され、コンポーネントがマウントすると
    // currentはcanvas要素を指す
    if (canvas) {
    // canvasがnullでないことを確認
      const ctx = canvas.getContext('2d');
      // ここで初めてgetContext 描画の準備が整う
      console.log(ctx);
      if (ctx) {
        // ctxがnullでないことを確認
        ctx.clearRect(0, 0, canvas.width, canvas.height); //描画領域を初期化
        ctx.font = "24px Arial";  // フォント設定を入力のたびに設定
        ctx.fillStyle = "black";  // 色設定を入力のたびに設定
        ctx.fillText(text, 10, 50); //e.target.valueを描画
      }
    }
  };

  return (
    <div className="p-4">
      <header className="mb-4">
      </header>
      <main>
        <canvas
          className="flex shadow-md rounded mx-auto border-gray-200 mb-4"
          ref={canvasRef} width={500} height={250}  // サイズを大きくして確認
        />
        <textarea
          className="flex shadow-md rounded mx-auto py-2 px-3 w-2/3 max-w-lg  focus:outline-none leading-9 border-gray-200"
          placeholder="文字を入力" rows={5}
          onChange={handleInput}
        />
      </main>
    </div>
  );
}
