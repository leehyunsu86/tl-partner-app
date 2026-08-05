import { createClient } from "@supabase/supabase-js";

// ⚠️ 이 파일은 서버(API 라우트)에서만 import 하세요. 절대 클라이언트 컴포넌트에서 쓰지 마세요.
// SUPABASE_SERVICE_ROLE_KEY는 RLS를 무시하고 전체 접근이 가능한 키라서,
// 반드시 브라우저에 노출되지 않는 서버 환경변수로만 관리해야 합니다.
//
// 로컬 개발: .env.local 파일에 아래 값들을 채워주세요 (.env.local.example 참고)
// Vercel 배포: 프로젝트 Settings > Environment Variables 에 동일하게 등록하세요

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

export function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase 환경변수가 설정되지 않았어요. NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 .env.local(로컬) 또는 Vercel 환경변수(배포)에 등록해주세요."
    );
  }
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return supabaseAdmin;
}
