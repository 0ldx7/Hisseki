import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: Request) {
    const url = new URL(request.url);
    //sessionIDをURLから取得
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
        return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('text_records')
            .select('*')
            .eq('session_id', sessionId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        //mappedDataに取得したRecordsを代入
        const mappedData = data.map(record => ({
            ...record,
            timeDiff: record.time_diff || 1000
        }));

        return NextResponse.json(mappedData, { status: 200 });

    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
