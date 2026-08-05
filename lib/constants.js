export const REQUEST_TYPES = {
  paper: { label: "용지요청", icon: "paper" },
  as: { label: "A/S요청", icon: "as" },
  sales: { label: "매출자료요청", icon: "sales" },
};

export const STEP_DEFS_AS = [
  { key: "received", label: "접수 완료" },
  { key: "assigned", label: "담당 기사 배정" },
  { key: "scheduled", label: "방문 예정" },
  { key: "in_progress", label: "현장 작업 중" },
  { key: "done", label: "작업 완료" },
];

export const STEP_DEFS_GENERAL = [
  { key: "received", label: "접수 완료" },
  { key: "in_progress", label: "처리 중" },
  { key: "done", label: "발송 · 완료" },
];

export function stepsFor(type) {
  return type === "as" ? STEP_DEFS_AS : STEP_DEFS_GENERAL;
}

export const REFERRAL_STEP_DEFS = [
  { key: "received", label: "접수 완료" },
  { key: "reviewing", label: "가맹 심사 중" },
  { key: "done", label: "가맹 완료" },
  { key: "rewarded", label: "상품권 지급" },
];

export const BIZ_TYPES = ["카페/커피전문점", "음식점", "편의점/마트", "미용/뷰티", "기타 소매업"];

export const BADGE_LABEL = {
  received: "접수됨",
  assigned: "배정됨",
  scheduled: "방문예정",
  in_progress: "진행중",
  processing: "처리중",
  reviewing: "심사중",
  done: "완료",
  rewarded: "지급완료",
};
