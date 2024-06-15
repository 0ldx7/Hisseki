import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// SupabaseのURLとキーを取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    try {
        // リクエストボディをJSONとして解析
        const records = await request.json();
        console.log('Received records:', records);

        // recordsが存在しない場合は400エラーを返す
        if (!records || !Array.isArray(records)) {
            console.error('Invalid records format:', records);
            return NextResponse.json({ error: 'Records are required and should be an array' }, { status: 400 });
        }

        // Supabaseにレコードを挿入
        const { data, error } = await supabase
            .from('text_records')
            .insert(records.map((record: any) => ({
                diffs: record.diffs,
                timestamp: record.timestamp,
                time_diff: record.timeDiff
            })));
        console.log('Insert result:', { data, error });

        // エラーが発生した場合は500エラーを返す
        if (error) {
            console.error('Error inserting records:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // 成功した場合は200ステータスを返す
        return NextResponse.json({ message: 'Records saved successfully', data }, { status: 200 });

    } catch (err) {
        // リクエストボディの解析に失敗した場合は400エラーを返す
        console.error('Exception caught:', err);
        return NextResponse.json({ error: 'Failed to parse request body' }, { status: 400 });
    }
}
