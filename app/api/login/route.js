import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

// POST /api/login
// body: { phone, password }
// 휴대폰번호(아이디) + 비밀번호(초기값 0000)로 로그인합니다.
export async function POST(req) {
  const { phone, password } = await req.json();
  if (!phone || !password) {
    return NextResponse.json({ error: "휴대폰번호와 비밀번호를 입력해주세요." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("merchants")
    .select("*")
    .eq("phone", phone.trim())
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "로그인 처리 중 오류가 발생했어요." }, { status: 500 });
  }
  if (!data || data.password !== password.trim()) {
    return NextResponse.json({ error: "휴대폰번호 또는 비밀번호가 일치하지 않아요." }, { status: 401 });
  }

  const { password: _pw, ...merchantSafe } = data;
  return NextResponse.json({ ok: true, merchant: merchantSafe });
}
