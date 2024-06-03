import Image from "next/image";

export default function Home() {
  return (
    <div className="p-4">
      <header className="mb-4">
        <h1>hi!</h1>
      </header>
      <main className="p-">
        <canvas 
          className="shadow border rounded w-full border-black mb-4" 
        />
        <textarea 
          className="shadow border rounded w-full py-2 px-3 focus:outline-none leading-tight border-black"
          name="" id="" 
        />

        <button 
          className="py-2 px-4 border bg-blue-200 hover:bg-blue-300 rounded">
            Click me!
        </button>

      </main>
    </div>
  );
}
