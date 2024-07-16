// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/utils/supabaseClient'; // Supabaseクライアントをインポート

// export async function middleware(request: NextRequest) { //リクエスト毎に実行
//     const sessionId = request.headers.get('X-Session-ID'); //ヘッダーからID取得

//     if (sessionId) { //sessionIDが存在する場合
//         // rpc関数でPostgresセッション変数を設定
//         const { error } = await supabase.rpc('set_config', {
//             key: 'app.current_session_id',
//             value: sessionId,
//         });

//         if (error) {
//             console.error('Failed to set session ID:', error.message);
//             return new NextResponse('Failed to set session ID', { status: 500 });
//         }
//     }
//     //次のミドルウェア、またはリクエストに処理を渡す
//     return NextResponse.next();
// }
