import React from 'react';

export const Concept: React.FC = () => {
    return (
        <div className="my-5 p-4 bg-gray-100 rounded-xl shadow-md text-gray-900">
            <p className="mb-4 text-gray-700">
                Hissekiは、あなたが入力したテキストの編集履歴をリアルタイムで記録し、再生することができるアプリです。<br />
                文章作成のプロセスをトレースして視覚化することで、あなたの思考の流れやアイデアの変遷を鮮明に記録します。
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>文章構成のスキルアップ</li>
                <li>アイデアのブレインストーミング</li>
                <li>個人的な日記</li>
            </ul>
        </div>
    );
};

export default Concept;
