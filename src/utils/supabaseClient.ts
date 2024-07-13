import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 環境変数からSupabaseのURLとキーを取得
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

// セッションIDを取得する関数
const getSessionId = (): string => {
  return localStorage.getItem('sessionId') || 'default-session-id'; // ローカルストレージからsessionIdを取得、存在しない場合はデフォルト値を返す
};

// カスタムfetch関数を作成
const customFetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const sessionId = getSessionId(); // セッションIDを取得
    const customHeaders = {
        ...init?.headers,
        'apikey': supabaseKey, // APIキーをヘッダーに追加
        'Authorization': `Bearer ${supabaseKey}`, // 認証ヘッダーにAPIキーを追加
        'X-Session-ID': sessionId, // セッションIDをヘッダーに追加
    };

  return fetch(input, { ...init, headers: customHeaders }); // fetch関数を呼び出す
};

// Supabaseクライアントの作成
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
    // fetchオプションは使わず、環境変数やミドルウェアを使用する
    global: { fetch: customFetch } // カスタムfetch関数をグローバル設定として使用
} as any); // 暫定でas型推論を使用
