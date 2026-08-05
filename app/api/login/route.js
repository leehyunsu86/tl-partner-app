import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

// POST /api/login
// body: { code, phone }
// 가맹점 코드 + 연락처가 merchants 테이블과 일치하는지 확인합니다.
// TODO(향후): 임직원 시스템에서 발급한 정식 계정/토큰 방식으로 교체 가능
export async function POST(req) {
  const { code, phone } = await req.json();
  if (!code || !phone) {
    return NextResponse.json({ error: "가맹점 코드와 연락처를 입력해주세요." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("merchants")
    .select("*")
    .eq("code", code.trim())
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "로그인 처리 중 오류가 발생했어요." }, { status: 500 });
  }
  if (!data || data.phone !== phone.trim()) {
    return NextResponse.json({ error: "가맹점 코드 또는 연락처가 일치하지 않아요." }, { status: 401 });
  }

  return NextResponse.json({ ok: true, merchant: data });
}
