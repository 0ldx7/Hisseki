import React from 'react';

export const Concept: React.FC = () => {
    return (
        <div className="bg-[#F2F2F2] text-black p-6 rounded-xl shadow-md space-y-4">
            {/* <h2 className="text-2xl font-bold">Hisseki: あなたの筆跡を未来に残す</h2> */}
            <p>
                Hissekiは、あなたが入力したテキストの編集履歴をリアルタイムで記録し、再生することができる革新的なウェブアプリです。文章作成のプロセスをトレースして視覚化することで、あなたの思考の流れやアイデアの変遷を鮮明に記録します。
            </p>
            <ul className="list-disc list-inside space-y-2">
                <li>文章構成のスキルアップ</li>
                <li>共同執筆とチームのコラボレーション</li>
                <li>アイデアのブレインストーミング</li>
                <li>ライフログと個人の日記</li>
                <li>教育とトレーニング</li>
            </ul>
        </div>
    );
};

export default Concept;
