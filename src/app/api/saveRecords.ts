import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const records = req.body;
        if (!records) {
            res.status(400).json({ error: 'Records are required' });
            return;
        }

        // レコードをSupabaseに挿入
        const { data, error } = await supabase
            .from('text_records')
            .insert(records.map((record: any) => ({
                diffs: record.diffs,
                timestamp: record.timestamp,
                time_diff: record.timeDiff
            })));

        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(200).json({ message: 'Records saved successfully', data });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
