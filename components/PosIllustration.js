export default function PosIllustration({ variant = "dark" }) {
  if (variant === "mono") {
    // 블루 배경 카드 위에 은은하게 얹는 워터마크형 버전
    return (
      <svg width="150" height="130" viewBox="0 0 150 130" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(-4 75 55)" opacity="0.9">
          <rect x="34" y="8" width="82" height="90" rx="16" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
          <rect x="41" y="15" width="68" height="58" rx="8" fill="rgba(255,255,255,0.16)" />
          <rect x="47" y="22" width="38" height="6" rx="3" fill="rgba(255,255,255,0.55)" />
          <rect x="47" y="34" width="56" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
          <rect x="47" y="42" width="48" height="4" rx="2" fill="rgba(255,255,255,0.22)" />
          <rect x="47" y="58" width="28" height="10" rx="5" fill="rgba(255,255,255,0.5)" />
        </g>
        <path d="M28 46C24 42 24 36 28 32" stroke="rgba(255,255,255,0.4)" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M22 50C15 43 15 28 22 21" stroke="rgba(255,255,255,0.25)" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="132" height="112" viewBox="0 0 132 112" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 바닥 그림자 */}
      <ellipse cx="66" cy="103" rx="46" ry="6" fill="#191F28" opacity="0.06" />

      {/* 단말기 받침대 */}
      <path d="M30 96C30 93 32 91 35 91H97C100 91 102 93 102 96V97C102 99 100 101 97 101H35C32 101 30 99 30 97V96Z" fill="#DCE1E6" />
      <path d="M40 91L46 60H86L92 91H40Z" fill="#EDF0F2" />

      {/* 단말기 본체 (기울어진 화면) */}
      <g transform="rotate(-3 66 46)">
        <rect x="30" y="10" width="72" height="78" rx="14" fill="#191F28" />
        <rect x="36" y="16" width="60" height="52" rx="7" fill="#3182F6" />
        <rect x="41" y="22" width="34" height="5" rx="2.5" fill="#FFFFFF" opacity="0.92" />
        <rect x="41" y="33" width="50" height="4" rx="2" fill="#FFFFFF" opacity="0.55" />
        <rect x="41" y="41" width="42" height="4" rx="2" fill="#FFFFFF" opacity="0.4" />
        <rect x="41" y="53" width="26" height="10" rx="5" fill="#FFFFFF" />
        <circle cx="66" cy="77" r="3.4" fill="#3A4552" />
      </g>

      {/* 카드 (탭 결제) */}
      <g transform="rotate(12 20 40)">
        <rect x="0" y="30" width="34" height="21" rx="4" fill="#FFFFFF" stroke="#DCE1E6" strokeWidth="1.5" />
        <rect x="4" y="35" width="10" height="7" rx="1.5" fill="#F5A623" />
        <rect x="4" y="45" width="20" height="2.4" rx="1.2" fill="#DCE1E6" />
      </g>
      {/* 신호 웨이브 */}
      <path d="M28 32C25 29 25 24 28 21" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <path d="M32 35C27 30 27 21 32 16" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}
