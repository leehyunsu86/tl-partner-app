import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

function nowStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// POST /api/referrals
// body: { code, name, phone, addr, bizType, hasLicense }
// TODO(연동): 임직원 시스템의 가맹 심사 플로우와 연결, 상태(reviewing/done/rewarded) 변경은
// 임직원 시스템 쪽 관리자 화면에서 발생하도록 하는 것을 권장
export async function POST(req) {
  const body = await req.json();
  const { code, name, phone, addr, bizType, hasLicense } = body;

  if (!code || !name || !phone || !addr) {
    return NextResponse.json({ error: "가맹점 코드, 성함, 전화번호, 사업장주소는 필수입니다." }, { status: 400 });
  }

  const id = "RF-" + Math.floor(1000 + Math.random() * 9000);
  const now = nowStr();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("referrals")
    .insert({
      id,
      merchant_code: code,
      name,
      phone,
      addr,
      biz_type: bizType || "기타 소매업",
      has_license: hasLicense || "무",
      status: "received",
      created_at_label: now,
      history: { received: now, reviewing: null, done: null, rewarded: null },
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "소개 접수 저장에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
