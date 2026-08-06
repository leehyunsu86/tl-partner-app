-- ============================================================
-- 로그인 방식 변경: 휴대폰번호 + 비밀번호(초기값 0000)
-- Supabase 대시보드 > SQL Editor > New query 에 복사해서 Run 하세요
-- (기존 가맹점들도 자동으로 비밀번호가 '0000'으로 설정됩니다)
-- ============================================================

alter table merchants
  add column if not exists password text not null default '0000';

-- phone으로 로그인하므로, 같은 번호가 중복 등록되지 않도록 유니크 제약을 걸어둡니다.
-- (이미 중복된 번호가 있으면 이 줄에서 에러가 날 수 있어요 - 그 경우 이 줄만 건너뛰고 나머지는 정상 적용됩니다)
alter table merchants
  add constraint merchants_phone_unique unique (phone);
