import { NextResponse } from "next/server";
import { supabase } from "../../../utils/supabaseClient";

export async function GET(request: Request) {
    const url = new URL(request.url); //URLオブジェクトを作成する
    const sessionId = url.searchParams.get('sessionId'); //クエリからsessionID取得

    if (!sessionId) { //sessionIdが存在しない場合
        return NextResponse.json({ error: 'sessionId is required' }, { status: 400 }); //400エラー
    }

    try {//クエリから得たIDがすでにテーブルに存在するか確認
        const { data, error } = await supabase
            .from('text_records')
            .select('session_id')
            .eq('session_id', sessionId);

        if  (error) { //サーバーにリクエスト処理されない場合
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (data.length > 0) { //レコードが一つ以上存在する場合
            return NextResponse.json({ exists: true }, { status: 200});
        } else { //レコードが存在しない場合
            return NextResponse.json({ exists: false }, { status: 200});
        }

    } catch (err) { //予期しないエラー
        return NextResponse.json({ error: 'Initial Server Error' }, { status: 500 });
    }
}