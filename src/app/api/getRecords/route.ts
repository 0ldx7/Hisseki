import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// SupabaseのURLとキーを取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    const url = new URL(request.url);
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
            console.error('Error fetching records:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 200 });

    } catch (err) {
        console.error('Exception caught:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
