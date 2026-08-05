import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";

// GET /api/bootstrap?code=MP-2291
// 로그인한 가맹점의 매장정보 + 요청내역 + 소개내역 + 공지를 한번에 내려줍니다.
export async function GET(req) {
  const code = new URL(req.url).searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "가맹점 코드가 필요해요." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const [{ data: store, error: storeErr }, { data: notices }, { data: requests }, { data: referrals }] =
    await Promise.all([
      supabase.from("merchants").select("*").eq("code", code).maybeSingle(),
      supabase.from("notices").select("*").order("pin", { ascending: false }).order("id", { ascending: false }),
      supabase
        .from("requests")
        .select("*")
        .eq("merchant_code", code)
        .order("created_at", { ascending: false }),
      supabase
        .from("referrals")
        .select("*")
        .eq("merchant_code", code)
        .order("created_at", { ascending: false }),
    ]);

  if (storeErr || !store) {
    return NextResponse.json({ error: "가맹점 정보를 찾을 수 없어요." }, { status: 404 });
  }

  const mapRequest = (r) => ({
    id: r.id,
    type: r.type,
    reasonLabel: r.reason_label,
    status: r.status,
    createdAt: r.created_at_label,
    scheduledAt: r.scheduled_at,
    technician: r.technician,
    phone: r.phone,
    note: r.note,
    history: r.history || {},
    historyNote: r.history_note || {},
  });
  const mapReferral = (r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    addr: r.addr,
    bizType: r.biz_type,
    hasLicense: r.has_license,
    status: r.status,
    createdAt: r.created_at_label,
    history: r.history || {},
  });

  return NextResponse.json({
    store: { name: store.name, code: store.code, owner: store.owner, addr: store.addr, phone: store.phone },
    notices: (notices || []).map((n) => ({ id: n.id, pin: n.pin, title: n.title, date: n.date })),
    requests: (requests || []).map(mapRequest),
    referrals: (referrals || []).map(mapReferral),
  });
}
