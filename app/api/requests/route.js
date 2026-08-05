import { NextResponse } from "next/server";
import { DB, nowStr } from "@/lib/store";

// POST /api/requests
// body: { type: 'paper'|'as'|'sales', reason, note, phone }
// TODO(연동): 여기서 임직원 시스템의 "가맹점 요청관리" 메뉴로 실시간 전달되도록
// (예: tl-work-tool 쪽 DB에 바로 insert 하거나, webhook으로 알림 전송)
export async function POST(req) {
  const body = await req.json();
  const { type, reason, note, phone } = body;

  if (!type || !note) {
    return NextResponse.json({ error: "type, note는 필수입니다." }, { status: 400 });
  }

  const prefix = { paper: "PP-", as: "AS-", sales: "SL-" }[type] || "RQ-";
  const id = prefix + Math.floor(50000 + Math.random() * 9000);
  const now = nowStr();

  const request = {
    id,
    type,
    reasonLabel: reason || note,
    status: "received",
    createdAt: now,
    scheduledAt: null,
    technician: null,
    phone: phone || DB.store.phone,
    note,
    history: { received: now, assigned: null, scheduled: null, in_progress: null, done: null },
    historyNote: {},
  };

  DB.requests.unshift(request);
  return NextResponse.json(request, { status: 201 });
}

export async function GET() {
  return NextResponse.json(DB.requests);
}
