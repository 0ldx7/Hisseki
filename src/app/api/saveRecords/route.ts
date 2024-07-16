import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: Request) {
    try {
        const { sessionId, records } = await request.json();
        if (!sessionId || !records || !Array.isArray(records)) { 
        //sessionIdまたはrecordsが存在しない場合、またはrecordsが配列でない場合
        //予期できるエラー
            return NextResponse.json({ error: 'sessionId and records are required and records should be an array' }, { status: 400 });
        }

        const { data, error } = await supabase //
            .from('text_records') //text_recordsテーブルを指定
            .insert(records.map((record: any) => ({ //recodesの各配列をinsert
                session_id: sessionId,
                diffs: record.diffs,
                timestamp: record.timestamp,
                time_diff: record.timeDiff
            })));

        if (error) { //予期できるエラー
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Records saved successfully', data }, { status: 200 });

    } catch (err) { //予期できないエラーを捕捉
        return NextResponse.json({ error: 'Failed to parse request body' }, { status: 400 });
    }
}