// import { NextResponse } from 'next/server';
// import { supabase } from '../../utils/supabaseClient';

// export async function GET(request: Request) {
//     try {
//         const { data, error } = await supabase
//             .from('text_records')
//             .select('*')
//             .eq('session_id', '_7brf3yew1'); // 自動再生用の特定のセッションID

//         if (error) {
//             return NextResponse.json({ error: error.message }, { status: 500 });
//         }

//         const mappedData = data.map(record => ({
//             ...record,
//             timeDiff: record.time_diff || 1000
//         }));

//         return NextResponse.json(mappedData, { status: 200 });
//     } catch (err) {
//         return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//     }
// }
