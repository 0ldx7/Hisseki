"use client";
import React, { useRef, useEffect } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "24px Arial";  // フォント設定を入力のたびに設定
        ctx.fillStyle = "black";  // 色設定を入力のたびに設定
        ctx.fillText(text, 10, 50);
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
          ref={canvasRef} width={300} height={200}  // サイズを大きくして確認
        />
        <textarea
          className="flex shadow-md border rounded mx-auto py-2 px-3 w-1/2 focus:outline-none leading-tight border-gray-200"
          placeholder="文字を入力" rows={5}
          onChange={handleInput}
        />
      </main>
    </div>
  );
}
