"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Icon from "@/components/Icon";
import PosIllustration from "@/components/PosIllustration";
import { Badge, MiniTrack, Track } from "@/components/Status";
import {
  REQUEST_TYPES,
  NOTE_PLACEHOLDERS,
  stepsFor,
  REFERRAL_STEP_DEFS,
  BIZ_TYPES,
} from "@/lib/constants";

export default function Page() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberId, setRememberId] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [merchantCode, setMerchantCode] = useState(null);

  const [data, setData] = useState(null); // { store, notices, requests, referrals }
  const [tab, setTab] = useState("home");
  const [detail, setDetail] = useState(null); // { id, kind }
  const [sheet, setSheet] = useState(null); // 'request' | 'referral' | null
  const [sheetDefaultType, setSheetDefaultType] = useState("paper");
  const [sheetTypeLocked, setSheetTypeLocked] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [jobsFilter, setJobsFilter] = useState("all");

  const loadData = useCallback(() => {
    if (!merchantCode) return;
    fetch(`/api/bootstrap?code=${encodeURIComponent(merchantCode)}`)
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        try {
          window.localStorage.setItem("tl_cached_data", JSON.stringify(json));
        } catch (e) {
          // 무시
        }
      })
      .catch(() => showToast("데이터를 불러오지 못했어요"));
  }, [merchantCode]);

  useEffect(() => {
    if (loggedIn && merchantCode) loadData();
  }, [loggedIn, merchantCode, loadData]);

  // 뒤로가기(모바일 브라우저/제스처) 처리
  // 화면 상태(탭/팝업/상세보기)는 평소엔 그냥 React 상태로만 다루고,
  // 뒤로가기 버튼을 눌렀을 때만 별도로 감지해서 처리해요.
  // 핵심: 페이지가 열리자마자 여분의 히스토리 항목을 미리 쌓아둬야
  // 뒤로가기를 눌렀을 때 앱이 즉시 종료되지 않고 우리 코드가 먼저 반응할 수 있어요.
  const navStateRef = useRef({ tab: "home", sheet: null, detail: null });
  navStateRef.current = { tab, sheet, detail };
  const lastBackPressRef = useRef(0);

  useEffect(() => {
    // 여분의 히스토리 항목을 2개 쌓아서 뒤로가기가 바로 앱을 벗어나지 않게 함
    window.history.pushState({ appGuard: true }, "");
    window.history.pushState({ appGuard: true }, "");

    function onPopState() {
      const { tab, sheet, detail } = navStateRef.current;
      if (sheet) {
        setSheet(null);
        window.history.pushState({ appGuard: true }, "");
        return;
      }
      if (detail) {
        setDetail(null);
        window.history.pushState({ appGuard: true }, "");
        return;
      }
      if (tab !== "home") {
        setTab("home");
        window.history.pushState({ appGuard: true }, "");
        return;
      }
      // 홈 화면(맨 처음 상태)에서 뒤로가기 -> 종료 확인
      const now = Date.now();
      if (now - lastBackPressRef.current < 2200) {
        // 2.2초 안에 다시 뒤로가기 -> 진짜 종료되도록 한번 더 뒤로 이동시켜요
        window.history.back();
        return;
      }
      lastBackPressRef.current = now;
      showToast("뒤로가기를 한번 더 누르면 종료돼요");
      window.history.pushState({ appGuard: true }, "");
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("tl_saved_phone");
      if (saved) {
        setLoginPhone(saved);
        setRememberId(true);
      }
      const sessionCode = window.localStorage.getItem("tl_session_code");
      if (sessionCode) {
        setMerchantCode(sessionCode);
        setLoggedIn(true);
        const cached = window.localStorage.getItem("tl_cached_data");
        if (cached) {
          try {
            setData(JSON.parse(cached));
          } catch (e) {
            // 캐시가 손상됐으면 무시하고 새로 불러오게 둠
          }
        }
      }
    } catch (e) {
      // localStorage 접근 불가 (프라이빗 모드 등) - 그냥 무시
    }
  }, []);

  function showToast(msg) {
    setToastMsg(msg);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 2400);
  }

  async function doLogin() {
    if (!loginPhone.trim() || !loginPassword.trim()) return;
    setLoginBusy(true);
    setLoginError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone.trim(), password: loginPassword.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setLoginError(json.error || "로그인에 실패했어요.");
        setLoginBusy(false);
        return;
      }
      try {
        if (rememberId) {
          window.localStorage.setItem("tl_saved_phone", loginPhone.trim());
        } else {
          window.localStorage.removeItem("tl_saved_phone");
        }
        // 로그인 세션을 저장해둬서, 뒤로가기 등으로 화면이 다시 그려져도
        // 로그인 화면이 다시 뜨지 않고 바로 복구되게 해요.
        window.localStorage.setItem("tl_session_code", json.merchant.code);
      } catch (e) {
        // localStorage 접근 불가 - 그냥 무시
      }
      setMerchantCode(json.merchant.code);
      setLoggedIn(true);
    } catch (e) {
      setLoginError("서버에 연결하지 못했어요. Supabase 환경변수 설정을 확인해주세요.");
    }
    setLoginBusy(false);
  }

  function logout() {
    setLoggedIn(false);
    setMerchantCode(null);
    setData(null);
    setTab("home");
    setSheet(null);
    setDetail(null);
    try {
      window.localStorage.removeItem("tl_session_code");
      window.localStorage.removeItem("tl_cached_data");
    } catch (e) {
      // 무시
    }
  }

  function openDetail(id, kind) {
    setDetail({ id, kind });
  }
  function closeDetail() {
    setDetail(null);
  }
  function goTab(t) {
    setTab(t);
    setSheet(null);
    setDetail(null);
  }
  function closeSheet() {
    setSheet(null);
  }
  function completeTo(next) {
    setTab(next.tab);
    setSheet(next.sheet || null);
    setDetail(next.detail || null);
  }

  async function submitRequest({ type, note, phone }) {
    const reason = note.length > 18 ? note.slice(0, 18) + "…" : note;
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: merchantCode, type, reason, note, phone }),
    });
    if (!res.ok) {
      showToast("요청 접수에 실패했어요");
      return;
    }
    completeTo({ tab: "jobs", sheet: null, detail: null });
    showToast("요청이 접수되었어요. 임직원 시스템으로 전달됩니다.");
    setJobsFilter("all");
    loadData();
  }

  async function submitReferral(payload) {
    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: merchantCode, ...payload }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(err.error || "소개 접수에 실패했어요");
      return;
    }
    completeTo({ tab: "referral", sheet: null, detail: null });
    showToast("소개가 접수되었어요! 심사 진행 상황을 이벤트 탭에서 확인하세요.");
    loadData();
  }

  async function submitPasswordChange({ currentPassword, newPassword }) {
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: merchantCode, currentPassword, newPassword }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(json.error || "비밀번호 변경에 실패했어요");
      return false;
    }
    completeTo({ tab: "my", sheet: null, detail: null });
    showToast("비밀번호가 변경되었어요.");
    return true;
  }

  if (!loggedIn) {
    return (
      <div className="app-shell">
        <div id="login">
          <div className="login-logo">
            <img src="/logo.png" alt="티엘정보통신" />
          </div>
          <div className="login-illust">
            <PosIllustration />
          </div>
          <h1>가맹점 파트너 로그인</h1>
          <p>휴대폰번호(아이디)와 비밀번호로 접속하세요.</p>
          <div className="field">
            <label>휴대폰번호 (아이디)</label>
            <input
              type="tel"
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value)}
              placeholder="예: 01048217730 (- 없이 입력)"
            />
          </div>
          <div className="field">
            <label>비밀번호</label>
            <input
              type="password"
              inputMode="numeric"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="초기 비밀번호는 0000 이에요"
            />
          </div>
          <label className="remember-row">
            <input type="checkbox" checked={rememberId} onChange={(e) => setRememberId(e.target.checked)} />
            아이디 저장
          </label>
          {loginError && (
            <div style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 14, fontWeight: 600 }}>
              {loginError}
            </div>
          )}
          <button className="btn btn-primary btn-block" onClick={doLogin} disabled={loginBusy}>
            {loginBusy ? "확인 중…" : "로그인"}
          </button>
          <div className="apibar">
            <span className="led"></span> Supabase 데이터베이스 연동됨
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app-shell">
        <div className="view" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          불러오는 중…
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div id="app">
        <div>
          {detail ? (
            detail.kind === "referral" ? (
              <ReferralDetail data={data} id={detail.id} onBack={closeDetail} />
            ) : (
              <RequestDetail data={data} id={detail.id} onBack={closeDetail} />
            )
          ) : tab === "home" ? (
            <Home
              data={data}
              onOpenNotices={() => showToast("공지 상세는 준비 중이에요")}
              onOpenDetail={openDetail}
              onGoTab={goTab}
              onNewRequest={(type) => {
                setSheetDefaultType(type);
                setSheetTypeLocked(true);
                setSheet("request");
              }}
              onNewReferral={() => setSheet("referral")}
            />
          ) : tab === "jobs" ? (
            <Jobs
              data={data}
              filter={jobsFilter}
              setFilter={setJobsFilter}
              onOpenDetail={openDetail}
              onNewRequest={() => {
                setSheetDefaultType("paper");
                setSheetTypeLocked(false);
                setSheet("request");
              }}
            />
          ) : tab === "referral" ? (
            <Referral
              data={data}
              onOpenDetail={openDetail}
              onNewReferral={() => setSheet("referral")}
              onGoTab={goTab}
            />
          ) : (
            <My data={data} onLogout={logout} onToast={showToast} onChangePassword={() => setSheet("password")} />
          )}
        </div>

        <div id="tabbar">
          <TabButton active={tab === "home" && !detail} onClick={() => goTab("home")} label="홈" iconPath="M3 11l9-8 9 8M5 10v10h14V10" />
          <TabButton active={tab === "jobs" && !detail} onClick={() => goTab("jobs")} label="요청함" iconPath="M9 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-3M9 15L19 5M13 5h6v6" />
          <TabButton active={tab === "referral" && !detail} onClick={() => goTab("referral")} label="이벤트" iconPath="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7S9 3 6.5 3 3 5 3 6.5 5 9 12 7zM12 7s3-4 5.5-4S21 5 21 6.5 19 9 12 7z" />
          <TabButton active={tab === "my" && !detail} onClick={() => goTab("my")} label="마이" iconPath="M12 8a4 4 0 100-8 4 4 0 000 8zM4 21c1.6-4 5-6 8-6s6.4 2 8 6" />
        </div>

        <div className={`sheet-backdrop ${sheet ? "show" : ""}`} onClick={closeSheet}></div>
        <div className={`sheet ${sheet ? "show" : ""}`}>
          {sheet === "request" && (
            <NewRequestSheet
              defaultType={sheetDefaultType}
              lockType={sheetTypeLocked}
              defaultPhone={data.store.phone}
              onClose={closeSheet}
              onSubmit={submitRequest}
            />
          )}
          {sheet === "referral" && (
            <ReferralSheet onClose={closeSheet} onSubmit={submitReferral} />
          )}
          {sheet === "password" && (
            <PasswordChangeSheet
              onClose={closeSheet}
              onSubmit={submitPasswordChange}
            />
          )}
        </div>

        <div className={`toast ${toastShow ? "show" : ""}`}>{toastMsg}</div>
      </div>
    </div>
  );
}

/* ---------------- shared bits ---------------- */

function TabButton({ active, onClick, label, iconPath }) {
  return (
    <button className={`tab ${active ? "active" : ""}`} onClick={onClick}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={iconPath} />
      </svg>
      {label}
    </button>
  );
}

function ReqListItem({ r, onOpenDetail }) {
  const t = REQUEST_TYPES[r.type];
  const isAs = r.type === "as";
  return (
    <div className="list-item" onClick={() => onOpenDetail(r.id, "request")}>
      <div
        className="li-ic"
        style={{
          background: isAs ? "var(--accent-soft)" : "var(--primary-soft)",
          color: isAs ? "#9A6212" : "var(--primary)",
        }}
      >
        <Icon name={t.icon} />
      </div>
      <div>
        <div className="li-title">{r.reasonLabel}</div>
        <div className="li-sub mono">
          {r.id} · {t.label}
        </div>
      </div>
      <div className="li-right">
        <Badge status={r.status} />
      </div>
    </div>
  );
}

function EmptyMini({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "22px 0", color: "var(--ink-faint)", fontSize: 13 }}>
      {text}
    </div>
  );
}

/* ---------------- 홈 ---------------- */
function Home({ data, onOpenNotices, onOpenDetail, onGoTab, onNewRequest, onNewReferral }) {
  const openCount = data.requests.filter((r) => r.status !== "done").length;
  const rewardCount = data.referrals.filter((r) => r.status === "rewarded").length;
  return (
    <>
      <div className="topbar">
        <div className="topbar-spacer"></div>
        <div className="brand-top">
          <img src="/logo.png" alt="TL" />
        </div>
        <div className="icon-btn" onClick={onOpenNotices}>
          <Icon name="bell" />
        </div>
      </div>
      <div className="view">
        <div className="hero">
          <div className="name" style={{ marginTop: 0 }}>{data.store.name} 사장님, 안녕하세요 👋</div>
          <div className="stats">
            <div className="stat">
              <span>진행중 요청</span>
              <b>{openCount}건</b>
            </div>
            <div className="stat">
              <span>누적 지급 상품권</span>
              <b>{rewardCount * 5}만원</b>
            </div>
          </div>
        </div>

        <div className="gift-banner" onClick={() => onGoTab("referral")}>
          <span className="eyebrow">고객소개 이벤트</span>
          <div className="title">사장님, 아는 사장님 소개하고 상품권 받으세요</div>
          <div className="desc">소개 1건당 신세계상품권 5만원 · 가맹 완료 시 지급</div>
        </div>

        <div className="quick-row">
          <div className="quick" onClick={() => onNewRequest("paper")}>
            <div className="ic">
              <Icon name="paper" />
            </div>
            <span>
              용지
              <br />
              요청
            </span>
          </div>
          <div className="quick" onClick={() => onNewRequest("as")}>
            <div className="ic">
              <Icon name="as" />
            </div>
            <span>
              A/S
              <br />
              요청
            </span>
          </div>
          <div className="quick" onClick={() => onNewRequest("sales")}>
            <div className="ic">
              <Icon name="sales" />
            </div>
            <span>
              매출자료
              <br />
              요청
            </span>
          </div>
          <div className="quick" onClick={onNewReferral}>
            <div className="ic" style={{ background: "var(--gift-soft)", color: "var(--gift)" }}>
              <Icon name="gift" />
            </div>
            <span>
              고객
              <br />
              소개
            </span>
          </div>
        </div>

        <div className="section-title">
          최근 요청
          <span className="link" onClick={() => onGoTab("jobs")}>
            전체보기
          </span>
        </div>
        <div className="card">
          {data.requests.length ? (
            data.requests.slice(0, 3).map((r) => <ReqListItem key={r.id} r={r} onOpenDetail={onOpenDetail} />)
          ) : (
            <EmptyMini text="요청 내역이 없어요" />
          )}
        </div>

        <div className="section-title">
          공지사항
          <span className="link" onClick={onOpenNotices}>
            전체보기
          </span>
        </div>
        <div className="card">
          {data.notices.map((n) => (
            <div className="list-item" key={n.id} onClick={onOpenNotices}>
              <div className="li-ic" style={{ background: "var(--primary-soft)", color: "var(--primary)" }}>
                <Icon name="bell" />
              </div>
              <div>
                <div className="li-title">{n.title}</div>
                <div className="li-sub">{n.date}</div>
              </div>
              <div className="li-right">
                <Icon name="chev" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------- 요청함 ---------------- */
function Jobs({ data, filter, setFilter, onOpenDetail, onNewRequest }) {
  const filtered = data.requests.filter((r) => (filter === "all" ? true : r.type === filter));
  return (
    <>
      <div className="topbar">
        <div>
          <h1>요청함</h1>
          <div className="sub">용지 · A/S · 매출자료 요청 내역</div>
        </div>
        <div className="icon-btn" onClick={onNewRequest}>
          <Icon name="plus" />
        </div>
      </div>
      <div className="view">
        <div className="seg">
          {[
            ["all", "전체"],
            ["paper", "용지"],
            ["as", "A/S"],
            ["sales", "매출자료"],
          ].map(([k, label]) => (
            <button key={k} className={filter === k ? "active" : ""} onClick={() => setFilter(k)}>
              {label}
            </button>
          ))}
        </div>
        {filtered.length ? (
          filtered.map((r) => {
            const steps = stepsFor(r.type);
            return (
              <div className="card req-card" key={r.id} onClick={() => onOpenDetail(r.id, "request")}>
                <div className="req-top">
                  <div>
                    <Badge status={r.status} />
                    <div className="req-id mono">
                      {r.id} · {REQUEST_TYPES[r.type].label}
                    </div>
                  </div>
                  <Icon name="chev" />
                </div>
                <div className="req-title">{r.reasonLabel}</div>
                <div className="req-meta">{r.scheduledAt ? "방문예정 " + r.scheduledAt : "접수 " + r.createdAt}</div>
                <MiniTrack steps={steps} status={r.status} />
              </div>
            );
          })
        ) : (
          <div className="empty">
            <div className="ic">
              <Icon name="empty" />
            </div>
            <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>해당 내역이 없어요</div>
            <div style={{ fontSize: 12.5 }}>위 + 버튼으로 새 요청을 등록해보세요</div>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------- 요청 상세 ---------------- */
function RequestDetail({ data, id, onBack }) {
  const r = data.requests.find((x) => x.id === id);
  if (!r) return null;
  const steps = stepsFor(r.type);
  return (
    <>
      <div className="topbar">
        <div className="icon-btn" onClick={onBack}>
          <Icon name="back" />
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="sub mono">{r.id}</div>
        </div>
      </div>
      <div className="view">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11.5, color: "var(--ink-soft)", fontWeight: 700 }}>{REQUEST_TYPES[r.type].label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{r.reasonLabel}</div>
            </div>
            <Badge status={r.status} />
          </div>
          <div className="kv-row" style={{ marginTop: 14 }}>
            <span className="k">접수일시</span>
            <span className="v">{r.createdAt}</span>
          </div>
          {r.type === "as" && (
            <>
              <div className="kv-row">
                <span className="k">방문 예정</span>
                <span className="v">{r.scheduledAt || "배정 대기"}</span>
              </div>
              <div className="kv-row">
                <span className="k">담당 기사</span>
                <span className="v">{r.technician || "배정 대기"}</span>
              </div>
            </>
          )}
          <div className="kv-row">
            <span className="k">연락처</span>
            <span className="v mono">{r.phone}</span>
          </div>
        </div>

        <div className="section-title">진행 상황</div>
        <div className="card">
          <Track steps={steps} status={r.status} history={r.history} historyNote={r.historyNote} />
        </div>

        <div className="section-title">요청 내용</div>
        <div className="card" style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)" }}>
          {r.note}
        </div>

        {r.status !== "done" && (
          <button className="btn btn-ghost btn-block" style={{ marginTop: 20 }}>
            문의하기 · 일정 변경 요청
          </button>
        )}
      </div>
    </>
  );
}

/* ---------------- 고객소개 이벤트 ---------------- */
function Referral({ data, onOpenDetail, onNewReferral, onGoTab }) {
  const rewarded = data.referrals.filter((r) => r.status === "rewarded").length;
  return (
    <>
      <div className="topbar">
        <div className="icon-btn" onClick={() => onGoTab("home")}>
          <Icon name="back" />
        </div>
        <div style={{ flex: 1, marginLeft: 10 }}>
          <h1>고객소개 이벤트</h1>
          <div className="sub">소개해주시고 상품권 받아가세요</div>
        </div>
      </div>
      <div className="view">
        <div className="gift-hero">
          <span
            style={{
              background: "rgba(255,255,255,.22)",
              padding: "3px 9px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            진행중 이벤트
          </span>
          <div className="amount">소개 1건당 50,000원</div>
          <div className="cap">
            신세계상품권 지급 · 소개하신 분이 가맹 완료되면 자동으로 지급 절차가 시작돼요.
            <br />
            지금까지 <b>{rewarded}건</b> 지급받으셨어요.
          </div>
        </div>

        <div className="steps-h">
          {[
            ["1", "고객", "정보 등록"],
            ["2", "가맹", "심사 진행"],
            ["3", "가맹", "완료"],
            ["4", "상품권", "지급"],
          ].map(([n, l1, l2]) => (
            <div className="s" key={n}>
              <div className="n">{n}</div>
              <p>
                {l1}
                <br />
                {l2}
              </p>
            </div>
          ))}
        </div>

        <button className="btn btn-gift btn-block" style={{ marginTop: 20 }} onClick={onNewReferral}>
          <Icon name="gift" /> 고객 소개하기
        </button>

        <div className="section-title">내가 소개한 내역</div>
        {data.referrals.length ? (
          data.referrals.map((r) => (
            <div className="card req-card" key={r.id} onClick={() => onOpenDetail(r.id, "referral")}>
              <div className="req-top">
                <div>
                  <Badge status={r.status} />
                  <div className="req-id mono">{r.id}</div>
                </div>
                <Icon name="chev" />
              </div>
              <div className="req-title">
                {r.name} 사장님 · {r.bizType}
              </div>
              <div className="req-meta">{r.createdAt} 접수</div>
              <MiniTrack steps={REFERRAL_STEP_DEFS} status={r.status} />
            </div>
          ))
        ) : (
          <div className="card">
            <EmptyMini text="아직 소개한 고객이 없어요" />
          </div>
        )}
      </div>
    </>
  );
}

function ReferralDetail({ data, id, onBack }) {
  const r = data.referrals.find((x) => x.id === id);
  if (!r) return null;
  return (
    <>
      <div className="topbar">
        <div className="icon-btn" onClick={onBack}>
          <Icon name="back" />
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="sub mono">{r.id}</div>
        </div>
      </div>
      <div className="view">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11.5, color: "var(--ink-soft)", fontWeight: 700 }}>고객소개</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{r.name} 사장님</div>
            </div>
            <Badge status={r.status} />
          </div>
          <div className="kv-row" style={{ marginTop: 14 }}>
            <span className="k">전화번호</span>
            <span className="v mono">{r.phone}</span>
          </div>
          <div className="kv-row">
            <span className="k">사업장주소</span>
            <span className="v">{r.addr}</span>
          </div>
          <div className="kv-row">
            <span className="k">사업장유형</span>
            <span className="v">{r.bizType}</span>
          </div>
          <div className="kv-row">
            <span className="k">사업자등록증</span>
            <span className="v">{r.hasLicense}</span>
          </div>
        </div>

        <div className="section-title">진행 상황</div>
        <div className="card">
          <Track steps={REFERRAL_STEP_DEFS} status={r.status} history={r.history} historyNote={{}} />
        </div>
        <div className="card" style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.6 }}>
          상품권은 가맹 완료 후 영업일 기준 5일 이내 등록하신 연락처로 지급됩니다.
        </div>
      </div>
    </>
  );
}

/* ---------------- 마이 ---------------- */
function My({ data, onLogout, onToast, onChangePassword }) {
  const s = data.store;
  return (
    <>
      <div className="topbar">
        <div>
          <h1>마이</h1>
          <div className="sub">가맹점 정보 및 계정</div>
        </div>
      </div>
      <div className="view">
        <div className="card" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "var(--primary-soft)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            {s.name[0]}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{s.name}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
              {s.code} · {s.owner} 사장님
            </div>
          </div>
        </div>
        <div className="section-title">매장 정보</div>
        <div className="card">
          <div className="kv-row">
            <span className="k">주소</span>
            <span className="v">{s.addr}</span>
          </div>
          <div className="kv-row">
            <span className="k">연락처 (아이디)</span>
            <span className="v mono">{s.phone}</span>
          </div>
        </div>
        <div className="section-title">계정</div>
        <div className="card">
          <div className="list-item" onClick={onChangePassword}>
            <div className="li-title">비밀번호 변경</div>
            <div className="li-right">
              <Icon name="chev" />
            </div>
          </div>
        </div>
        <div className="section-title">시스템 연동</div>
        <div className="card">
          <div className="kv-row">
            <span className="k">임직원 시스템</span>
            <span className="v" style={{ color: "var(--accent)" }}>
              연동 대기
            </span>
          </div>
          <div className="kv-row">
            <span className="k">대상 시스템</span>
            <span className="v mono" style={{ fontSize: 11.5 }}>
              tl-work-tool.vercel.app
            </span>
          </div>
        </div>
        <div className="section-title">지원</div>
        <div className="card">
          <div className="list-item" onClick={() => onToast("1:1 문의는 준비 중이에요")}>
            <div className="li-title">1:1 문의하기</div>
            <div className="li-right">
              <Icon name="chev" />
            </div>
          </div>
          <div className="list-item" onClick={() => onToast("고객센터: 1588-0000")}>
            <div className="li-title">고객센터 안내</div>
            <div className="li-right">
              <Icon name="chev" />
            </div>
          </div>
        </div>
        <button className="btn btn-ghost btn-block" style={{ marginTop: 20 }} onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </>
  );
}

/* ---------------- 새 요청 시트 ---------------- */
function NewRequestSheet({ defaultType, lockType, defaultPhone, onClose, onSubmit }) {
  const [type, setType] = useState(defaultType);
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState(defaultPhone);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    await onSubmit({ type, note: note.trim() || REQUEST_TYPES[type].label + " 문의", phone: phone.trim() || defaultPhone });
    setSubmitting(false);
  }

  return (
    <>
      <div className="grabber"></div>
      <div className="sheet-back" onClick={onClose}>
        <Icon name="back" /> 뒤로가기
      </div>
      <div className="sheet-head">
        <div>
          <h2>{lockType ? REQUEST_TYPES[type].label : "새 요청"}</h2>
          <div className="h-sub">{lockType ? "아래 내용을 작성해주세요" : "용지 · A/S · 매출자료 중 선택해주세요"}</div>
        </div>
        <div className="icon-btn" onClick={onClose}>
          <Icon name="close" />
        </div>
      </div>
      {!lockType && (
        <div className="field">
          <label>요청 유형</label>
          <div className="chip-row">
            {Object.entries(REQUEST_TYPES).map(([k, v]) => (
              <div key={k} className={`chip ${type === k ? "on" : ""}`} onClick={() => setType(k)}>
                {v.label}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="field">
        <label>요청 내용</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={NOTE_PLACEHOLDERS[type]} />
      </div>
      <div className="field">
        <label>연락처</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <button className="btn btn-primary btn-block" disabled={submitting} onClick={handleSubmit}>
        {submitting ? "접수 중…" : "요청하기"}
      </button>
    </>
  );
}

/* ---------------- 고객소개 시트 ---------------- */
function ReferralSheet({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [bizType, setBizType] = useState(BIZ_TYPES[0]);
  const [hasLicense, setHasLicense] = useState("유");
  const [submitting, setSubmitting] = useState(false);
  const [warn, setWarn] = useState("");

  async function handleSubmit() {
    if (!name.trim() || !phone.trim() || !addr.trim()) {
      setWarn("성함, 전화번호, 사업장주소를 입력해주세요");
      return;
    }
    setWarn("");
    setSubmitting(true);
    await onSubmit({ name: name.trim(), phone: phone.trim(), addr: addr.trim(), bizType, hasLicense });
    setSubmitting(false);
  }

  return (
    <>
      <div className="grabber"></div>
      <div className="sheet-back" onClick={onClose}>
        <Icon name="back" /> 뒤로가기
      </div>
      <div className="sheet-head">
        <div>
          <h2>고객 소개하기</h2>
          <div className="h-sub">소개 1건당 신세계상품권 5만원 지급</div>
        </div>
        <div className="icon-btn" onClick={onClose}>
          <Icon name="close" />
        </div>
      </div>

      <div className="divider-label">
        <span>소개받는 고객 정보</span>
      </div>

      <div className="field">
        <label>
          성함 <span className="req-mark">*</span>
        </label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 홍길동" />
      </div>
      <div className="field">
        <label>
          전화번호 <span className="req-mark">*</span>
        </label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" />
      </div>
      <div className="field">
        <label>
          사업장주소 <span className="req-mark">*</span>
        </label>
        <input type="text" value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="예: 서울시 강남구 테헤란로 123" />
      </div>
      <div className="field">
        <label>
          사업장유형 <span className="req-mark">*</span>
        </label>
        <div className="chip-row">
          {BIZ_TYPES.map((b) => (
            <div key={b} className={`chip ${bizType === b ? "on" : ""}`} onClick={() => setBizType(b)}>
              {b}
            </div>
          ))}
        </div>
      </div>
      <div className="field">
        <label>
          사업자등록증 유무 <span className="req-mark">*</span>
        </label>
        <div className="chip-row">
          <div className={`chip ${hasLicense === "유" ? "gift-on" : ""}`} onClick={() => setHasLicense("유")}>
            있음
          </div>
          <div className={`chip ${hasLicense === "무" ? "gift-on" : ""}`} onClick={() => setHasLicense("무")}>
            없음
          </div>
        </div>
      </div>

      {warn && <div style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 12, fontWeight: 600 }}>{warn}</div>}

      <button className="btn btn-gift btn-block" style={{ marginTop: 6 }} disabled={submitting} onClick={handleSubmit}>
        <Icon name="gift" /> {submitting ? "접수 중…" : "소개 접수하기"}
      </button>
      <div style={{ fontSize: 11, color: "var(--ink-faint)", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
        등록하신 정보는 가맹 심사 목적으로만 사용되며,
        <br />
        가맹 완료 시 등록하신 사장님께 상품권이 지급됩니다.
      </div>
    </>
  );
}

/* ---------------- 비밀번호 변경 시트 ---------------- */
function PasswordChangeSheet({ onClose, onSubmit }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [warn, setWarn] = useState("");

  async function handleSubmit() {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setWarn("모든 항목을 입력해주세요");
      return;
    }
    if (newPassword !== confirmPassword) {
      setWarn("새 비밀번호가 서로 일치하지 않아요");
      return;
    }
    setWarn("");
    setSubmitting(true);
    await onSubmit({ currentPassword: currentPassword.trim(), newPassword: newPassword.trim() });
    setSubmitting(false);
  }

  return (
    <>
      <div className="grabber"></div>
      <div className="sheet-back" onClick={onClose}>
        <Icon name="back" /> 뒤로가기
      </div>
      <div className="sheet-head">
        <div>
          <h2>비밀번호 변경</h2>
          <div className="h-sub">현재 비밀번호를 확인 후 변경돼요</div>
        </div>
        <div className="icon-btn" onClick={onClose}>
          <Icon name="close" />
        </div>
      </div>

      <div className="field">
        <label>현재 비밀번호</label>
        <input
          type="password"
          inputMode="numeric"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="초기 비밀번호는 0000 이에요"
        />
      </div>
      <div className="field">
        <label>새 비밀번호</label>
        <input
          type="password"
          inputMode="numeric"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="4자리 이상 입력해주세요"
        />
      </div>
      <div className="field">
        <label>새 비밀번호 확인</label>
        <input
          type="password"
          inputMode="numeric"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="새 비밀번호를 한번 더 입력해주세요"
        />
      </div>

      {warn && <div style={{ color: "var(--danger)", fontSize: 12.5, marginBottom: 12, fontWeight: 600 }}>{warn}</div>}

      <button className="btn btn-primary btn-block" disabled={submitting} onClick={handleSubmit}>
        {submitting ? "변경 중…" : "비밀번호 변경하기"}
      </button>
    </>
  );
}
