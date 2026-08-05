// =========================================================
// ⚠️ 임시 인메모리 스토어입니다.
// Vercel 서버리스 환경에서는 요청마다 인스턴스가 새로 뜰 수 있어
// 이 데이터가 초기화되거나 인스턴스 간 공유되지 않을 수 있습니다.
// 실제 서비스 전환 시 이 파일을 Supabase(or 다른 DB) 호출로 교체하세요.
// =========================================================

export const REQUEST_TYPES = {
  paper: { label: "용지요청" },
  as: { label: "A/S요청" },
  sales: { label: "매출자료요청" },
};

const globalStore = globalThis;

if (!globalStore.__TL_DB__) {
  globalStore.__TL_DB__ = {
    store: {
      name: "산본커피",
      code: "MP-2291",
      owner: "김국선",
      addr: "경기 군포시 산본로 12",
      phone: "010-4821-7730",
    },
    notices: [
      { id: 1, pin: true, title: "[공지] 8월 정기 카드단말기 점검 안내", date: "2026-08-05" },
      { id: 2, pin: false, title: "추석 연휴 접수 일정 변경 안내", date: "2026-08-02" },
    ],
    requests: [
      {
        id: "AS-58213", type: "as", reasonLabel: "카드단말기 인식 오류",
        status: "in_progress", createdAt: "2026-08-04 10:12",
        scheduledAt: "2026-08-05 14:00~16:00", technician: "박정민 기사", phone: "010-4821-7730",
        note: "단말기 전원은 들어오나 카드 인식이 간헐적으로 실패합니다.",
        history: { received: "2026-08-04 10:12", assigned: "2026-08-04 11:40", scheduled: "2026-08-04 15:00", in_progress: "2026-08-05 14:05", done: null },
        historyNote: { in_progress: "기사님이 현장에 도착해 단말기를 점검 중입니다." },
      },
      {
        id: "PP-58190", type: "paper", reasonLabel: "감열지 10롤 요청",
        status: "done", createdAt: "2026-08-01 09:20", scheduledAt: null, technician: null, phone: "010-4821-7730",
        note: "카드단말기 감열지 소진, 10롤 배송 요청드립니다.",
        history: { received: "2026-08-01 09:20", in_progress: "2026-08-01 13:10", done: "2026-08-02 10:40" },
        historyNote: { done: "택배로 발송 완료했습니다. (등기 123456789)" },
      },
      {
        id: "SL-58150", type: "sales", reasonLabel: "7월 매출자료 요청",
        status: "in_progress", createdAt: "2026-08-03 11:02", scheduledAt: null, technician: null, phone: "010-4821-7730",
        note: "세무신고용 7월 카드매출 전표 자료 부탁드립니다.",
        history: { received: "2026-08-03 11:02", in_progress: "2026-08-03 16:00", done: null },
        historyNote: {},
      },
    ],
    referrals: [
      {
        id: "RF-1042", name: "이서준", phone: "010-9911-2280", addr: "경기 군포시 금정로 45",
        bizType: "음식점", hasLicense: "유", status: "reviewing", createdAt: "2026-08-01 14:20",
        history: { received: "2026-08-01 14:20", reviewing: "2026-08-02 10:00", done: null, rewarded: null },
      },
      {
        id: "RF-0988", name: "박다인", phone: "010-2231-7789", addr: "경기 안양시 동안구 관평로 88",
        bizType: "카페/커피전문점", hasLicense: "유", status: "rewarded", createdAt: "2026-07-18 09:40",
        history: { received: "2026-07-18 09:40", reviewing: "2026-07-19 11:00", done: "2026-07-25 15:00", rewarded: "2026-07-27 10:00" },
      },
    ],
  };
}

export const DB = globalStore.__TL_DB__;

export function nowStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
