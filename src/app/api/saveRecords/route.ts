import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: Request) {
    try {
        const { sessionId, records } = await request.json();
        console.log('Received sessionId:', sessionId);
        console.log('Received records:', records);

        if (!sessionId || !records || !Array.isArray(records)) {
            console.error('Invalid sessionId or records format');
            return NextResponse.json({ error: 'sessionId and records are required and records should be an array' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('text_records')
            .insert(records.map((record: any) => ({
                session_id: sessionId,
                diffs: record.diffs,
                timestamp: record.timestamp,
                time_diff: record.timeDiff
            })));
        console.log('Insert result:', { data, error });

        if (error) {
            console.error('Error inserting records:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Records saved successfully', data }, { status: 200 });

    } catch (err) {
        console.error('Exception caught:', err);
        return NextResponse.json({ error: 'Failed to parse request body' }, { status: 400 });
    }
}
