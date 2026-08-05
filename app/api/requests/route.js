import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

function nowStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// POST /api/requests
// body: { code, type, reason, note, phone }
// TODO(연동): 여기서 임직원 시스템의 "가맹점 요청관리" 메뉴로 실시간 전달되도록
// (예: webhook 전송, 또는 임직원 시스템도 같은 Supabase 프로젝트를 보게 하기)
export async function POST(req) {
  const body = await req.json();
  const { code, type, reason, note, phone } = body;

  if (!code || !type || !note) {
    return NextResponse.json({ error: "code, type, note는 필수입니다." }, { status: 400 });
  }

  const prefix = { paper: "PP-", as: "AS-", sales: "SL-" }[type] || "RQ-";
  const id = prefix + Math.floor(50000 + Math.random() * 9000);
  const now = nowStr();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("requests")
    .insert({
      id,
      merchant_code: code,
      type,
      reason_label: reason || note,
      status: "received",
      created_at_label: now,
      scheduled_at: null,
      technician: null,
      phone: phone || null,
      note,
      history: { received: now, assigned: null, scheduled: null, in_progress: null, done: null },
      history_note: {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "요청 저장에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
