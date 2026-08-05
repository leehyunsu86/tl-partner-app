# 티엘정보통신 가맹점 파트너 웹앱

가맹점주가 로그인해서 용지/A·S/매출자료를 요청하고, 진행 상황을 확인하고,
고객소개 이벤트(건당 신세계상품권 5만원)에 참여할 수 있는 웹앱입니다.

## 로컬에서 실행하기

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속. 로그인 화면에 값이 미리 채워져 있어 바로 로그인 버튼만 눌러도 됩니다.

## 지금 상태

**Supabase 데이터베이스와 연동되어 있습니다.** 가맹점 코드별로 데이터가 구분되고, 여러 가맹점이 동시에 로그인해도 서로 다른 데이터만 보여요.

### Supabase 설정 방법 (처음 한 번만)

1. `supabase_setup.sql` 파일 내용을 전체 복사
2. Supabase 대시보드 → SQL Editor → New query → 붙여넣기 → Run
3. 그러면 `merchants`(가맹점), `notices`(공지), `requests`(요청), `referrals`(고객소개) 테이블이 생기고 테스트 데이터가 들어갑니다
4. 테스트 로그인 계정: 가맹점 코드 `MP-2291`, 연락처 `010-4821-7730`

### 환경변수 설정 (필수, 이게 없으면 로그인이 안 돼요)

1. `.env.local.example` 파일을 복사해서 `.env.local`로 이름 바꾸기
2. Supabase 대시보드 → Settings → API 에서 값 확인해서 채워넣기:
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — Secret key (⚠️ 절대 공개 저장소나 채팅에 붙여넣지 마세요)
3. **Vercel에 배포한 경우**: Vercel 대시보드 → 프로젝트 → Settings → Environment Variables 에서 같은 이름으로 값 등록 → 다시 배포(Redeploy)해야 적용됩니다

### 새 가맹점 추가하는 법 (지금은 수동)

Supabase 대시보드 → Table Editor → `merchants` 테이블 → 우측 상단 `Insert` → `code`, `name`, `owner`, `phone`, `addr` 채우고 저장. 그러면 그 코드+연락처로 바로 로그인할 수 있어요.
(나중에는 임직원 시스템에서 가맹점 등록하면 자동으로 여기도 추가되게 연동하는 게 이상적입니다.)

## 임직원 시스템(tl-work-tool.vercel.app) 연동을 위해 다음 단계에서 필요한 것

1. **tl-work-tool의 기술 스택 확인** — Vercel 프로젝트 설정(Framework Preset) 또는 GitHub 저장소의 `package.json`에서 확인 가능
2. **데이터베이스 확인** — Supabase/Firebase/자체 DB 중 무엇을 쓰는지. 브라우저 개발자도구 Network 탭에서 요청 주소를 보면 대략 알 수 있습니다
3. 연동 방식 결정:
   - 같은 DB를 두 프로젝트가 함께 쓸지 (가장 간단하지만 두 코드베이스가 강하게 결합됨)
   - 아니면 이 가맹점 앱이 자체 DB/API를 갖고, 임직원 시스템과는 API(또는 웹훅)로 데이터를 주고받을지 (더 유연하지만 별도 개발 필요) — 이전 대화에서 이 방식으로 하기로 했습니다
4. 가맹점 인증 방식 — 임직원 시스템에서 가맹점 계정을 발급/관리할지, 이 앱에서 자체적으로 관리할지

## 폴더 구조

```
app/
  page.js               메인 화면 (로그인 + 홈/요청함/이벤트/마이 탭 전체)
  layout.js             공통 레이아웃, 폰트 로드
  globals.css           전체 스타일
  api/
    login/route.js       가맹점 코드+연락처 로그인 검증
    bootstrap/route.js   로그인 후 초기 데이터 조회
    requests/route.js    용지/A·S/매출자료 요청 생성
    referrals/route.js   고객소개 이벤트 접수
components/
  Icon.js                아이콘 모음
  Status.js              상태뱃지 / 진행 트랙 컴포넌트
lib/
  constants.js            요청유형, 진행단계 등 공용 상수
  supabaseServer.js        Supabase 서버 클라이언트 (API 라우트 전용)
public/
  logo.png                 회사 로고
supabase_setup.sql          Supabase 테이블 생성 스크립트 (최초 1회 실행)
.env.local.example          환경변수 예시 파일
```

## 다음 단계 제안

- [x] Supabase 실제 DB 연동
- [x] 가맹점 코드 기반 데이터 구분 (가맹점끼리 서로 다른 데이터만 보임)
- [ ] tl-work-tool(임직원 시스템) 스택 확인 후 두 시스템 연동 방식 확정
- [ ] 관리자(임직원) 쪽에서 가맹점 요청/소개 내역을 확인·상태 변경할 수 있는 화면 연결 (지금은 Supabase Table Editor에서 수동으로 상태를 바꿔야 해요)
- [ ] 새 가맹점을 임직원 시스템에서 등록하면 자동으로 `merchants` 테이블에도 추가되게 연동
- [ ] 소개 이벤트 상품권 지급 처리 방식 확정 (수동 지급 후 상태 변경 vs 자동 연동)
- [ ] 정식 인증(비밀번호, 문자인증 등)으로 로그인 방식 강화
