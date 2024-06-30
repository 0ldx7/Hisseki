import Header from '@/app/Header';
import React from 'react';

export const Concept: React.FC = () => {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300">
            <Header />
            <p className="m-10">
                Hissekiは、あなたが入力したテキストの編集履歴をリアルタイムで記録し、再生することができるアプリです。<br />
                文章作成のプロセスをトレースして視覚化することで、あなたの思考の流れやアイデアの変遷を鮮明に記録します。<br />
            </p>
            <ul className="p-12 list-none list-inside space-y-2">
                <li>個人的な日記</li>
                <li>詩や小説</li>
                <li>深い内省や思考の観察</li>
                <li>ポエミーなときの独り言</li>
                <li>誰かに向けたメッセージ</li>
            </ul>
        </div>
    );
};

export default Concept;
