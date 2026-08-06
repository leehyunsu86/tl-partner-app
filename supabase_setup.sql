-- ============================================================
-- 티엘정보통신 가맹점 앱 - Supabase 테이블 생성 스크립트
-- Supabase 대시보드 > SQL Editor > New query 에 전체 복사해서 Run 누르세요
-- ============================================================

-- 1) 가맹점 테이블 (가맹점 코드로 로그인/구분)
create table if not exists merchants (
  code text primary key,
  name text not null,
  owner text,
  phone text unique,
  password text not null default '0000',
  addr text,
  created_at timestamptz default now()
);

-- 2) 공지사항 (전체 가맹점 공통)
create table if not exists notices (
  id serial primary key,
  pin boolean default false,
  title text not null,
  date text not null,
  created_at timestamptz default now()
);

-- 3) 설치/AS/용지/매출자료 요청
create table if not exists requests (
  id text primary key,
  merchant_code text references merchants(code) not null,
  type text not null,               -- 'paper' | 'as' | 'sales'
  reason_label text not null,
  status text not null default 'received',
  created_at_label text,            -- 화면 표시용 문자열 (예: 2026-08-04 10:12)
  scheduled_at text,
  technician text,
  phone text,
  note text,
  history jsonb default '{}',
  history_note jsonb default '{}',
  created_at timestamptz default now()
);

-- 4) 고객소개 이벤트
create table if not exists referrals (
  id text primary key,
  merchant_code text references merchants(code) not null,
  name text not null,
  phone text not null,
  addr text not null,
  biz_type text,
  has_license text,
  status text not null default 'received',
  created_at_label text,
  history jsonb default '{}',
  created_at timestamptz default now()
);

-- ============================================================
-- 보안 설정: RLS(Row Level Security) 켜기
-- 브라우저에서 직접 접근을 막고, 우리 서버(API 라우트)만 접근하도록 함
-- ============================================================
alter table merchants enable row level security;
alter table notices enable row level security;
alter table requests enable row level security;
alter table referrals enable row level security;
-- 별도 정책(policy)을 만들지 않으면, service role 키를 쓰는 서버만 접근 가능하고
-- 브라우저(publishable key)는 아무것도 못 봅니다. 지금 우리 구조와 맞습니다.

-- ============================================================
-- 초기 데이터 (기존 목업 데이터를 그대로 옮겨왔어요)
-- ============================================================

insert into merchants (code, name, owner, phone, addr) values
  ('MP-2291', '산본커피', '김국선', '010-4821-7730', '경기 군포시 산본로 12')
on conflict (code) do nothing;

insert into notices (pin, title, date) values
  (true, '[공지] 8월 정기 카드단말기 점검 안내', '2026-08-05'),
  (false, '추석 연휴 접수 일정 변경 안내', '2026-08-02')
on conflict do nothing;

insert into requests (id, merchant_code, type, reason_label, status, created_at_label, scheduled_at, technician, phone, note, history, history_note) values
  ('AS-58213', 'MP-2291', 'as', '카드단말기 인식 오류', 'in_progress', '2026-08-04 10:12',
   '2026-08-05 14:00~16:00', '박정민 기사', '010-4821-7730',
   '단말기 전원은 들어오나 카드 인식이 간헐적으로 실패합니다.',
   '{"received":"2026-08-04 10:12","assigned":"2026-08-04 11:40","scheduled":"2026-08-04 15:00","in_progress":"2026-08-05 14:05","done":null}',
   '{"in_progress":"기사님이 현장에 도착해 단말기를 점검 중입니다."}'),
  ('PP-58190', 'MP-2291', 'paper', '감열지 10롤 요청', 'done', '2026-08-01 09:20',
   null, null, '010-4821-7730', '카드단말기 감열지 소진, 10롤 배송 요청드립니다.',
   '{"received":"2026-08-01 09:20","in_progress":"2026-08-01 13:10","done":"2026-08-02 10:40"}',
   '{"done":"택배로 발송 완료했습니다. (등기 123456789)"}'),
  ('SL-58150', 'MP-2291', 'sales', '7월 매출자료 요청', 'in_progress', '2026-08-03 11:02',
   null, null, '010-4821-7730', '세무신고용 7월 카드매출 전표 자료 부탁드립니다.',
   '{"received":"2026-08-03 11:02","in_progress":"2026-08-03 16:00","done":null}', '{}')
on conflict (id) do nothing;

insert into referrals (id, merchant_code, name, phone, addr, biz_type, has_license, status, created_at_label, history) values
  ('RF-1042', 'MP-2291', '이서준', '010-9911-2280', '경기 군포시 금정로 45', '음식점', '유', 'reviewing', '2026-08-01 14:20',
   '{"received":"2026-08-01 14:20","reviewing":"2026-08-02 10:00","done":null,"rewarded":null}'),
  ('RF-0988', 'MP-2291', '박다인', '010-2231-7789', '경기 안양시 동안구 관평로 88', '카페/커피전문점', '유', 'rewarded', '2026-07-18 09:40',
   '{"received":"2026-07-18 09:40","reviewing":"2026-07-19 11:00","done":"2026-07-25 15:00","rewarded":"2026-07-27 10:00"}')
on conflict (id) do nothing;

-- 다른 가맹점도 로그인해서 테스트해보고 싶으면 이렇게 하나 더 추가하세요 (예시)
insert into merchants (code, name, owner, phone, addr) values
  ('MP-3310', '동안치킨', '박현수', '010-2233-4455', '경기 안양시 동안구 평촌대로 100')
on conflict (code) do nothing;
