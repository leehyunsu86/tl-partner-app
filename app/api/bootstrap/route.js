import { NextResponse } from "next/server";
import { DB } from "@/lib/store";

// GET /api/bootstrap
// 로그인 직후 화면 구성에 필요한 매장정보 + 요청내역 + 소개내역 + 공지를 한번에 내려줍니다.
// TODO(연동): 임직원 시스템(tl-work-tool) 인증 토큰으로 실제 가맹점 데이터를 조회하도록 교체
export async function GET() {
  return NextResponse.json(DB);
}
