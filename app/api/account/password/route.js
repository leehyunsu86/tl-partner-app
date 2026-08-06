import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

// POST /api/account/password
// body: { code, currentPassword, newPassword }
export async function POST(req) {
  const { code, currentPassword, newPassword } = await req.json();
  if (!code || !currentPassword || !newPassword) {
    return NextResponse.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });
  }
  if (newPassword.length < 4) {
    return NextResponse.json({ error: "새 비밀번호는 4자리 이상으로 설정해주세요." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("merchants")
    .select("code, password")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "계정 정보를 찾을 수 없어요." }, { status: 404 });
  }
  if (data.password !== currentPassword) {
    return NextResponse.json({ error: "현재 비밀번호가 일치하지 않아요." }, { status: 401 });
  }

  const { error: updateError } = await supabase
    .from("merchants")
    .update({ password: newPassword })
    .eq("code", code);

  if (updateError) {
    return NextResponse.json({ error: "비밀번호 변경에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
