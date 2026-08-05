import { NextResponse } from "next/server";
import { DB, nowStr } from "@/lib/store";

// POST /api/referrals
// body: { name, phone, addr, bizType, hasLicense }
// TODO(연동): 임직원 시스템의 "가맹점 접수현황" / 심사 플로우로 이어지도록 연결
// 가맹 완료(status: 'done') 처리는 임직원 시스템 쪽 관리자 액션에서 발생 → 여기로 웹훅/폴링으로 상태 동기화 필요
// 상품권(rewarded) 지급은 실제 지급 완료 후 임직원 시스템에서 상태 업데이트하는 것을 권장
export async function POST(req) {
  const body = await req.json();
  const { name, phone, addr, bizType, hasLicense } = body;

  if (!name || !phone || !addr) {
    return NextResponse.json({ error: "성함, 전화번호, 사업장주소는 필수입니다." }, { status: 400 });
  }

  const id = "RF-" + Math.floor(1000 + Math.random() * 9000);
  const now = nowStr();

  const referral = {
    id,
    name,
    phone,
    addr,
    bizType: bizType || "기타 소매업",
    hasLicense: hasLicense || "무",
    status: "received",
    createdAt: now,
    history: { received: now, reviewing: null, done: null, rewarded: null },
  };

  DB.referrals.unshift(referral);
  return NextResponse.json(referral, { status: 201 });
}

export async function GET() {
  return NextResponse.json(DB.referrals);
}
