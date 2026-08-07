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
    <svg width="92" height="128" viewBox="0 0 108 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 바닥 그림자 */}
      <ellipse cx="54" cy="144" rx="34" ry="5" fill="#191F28" opacity="0.07" />

      {/* 받침대 */}
      <path d="M20 138C20 135 22 133 25 133H83C86 133 88 135 88 138C88 141 84 143 76 143H32C24 143 20 141 20 138Z" fill="#DCE1E6" />

      {/* 본체 (세로형 키오스크) */}
      <rect x="16" y="6" width="76" height="130" rx="18" fill="#191F28" />
      <rect x="22" y="12" width="64" height="82" rx="9" fill="#3182F6" />
      <rect x="28" y="19" width="28" height="6" rx="3" fill="#FFFFFF" opacity="0.92" />
      <rect x="28" y="32" width="52" height="4" rx="2" fill="#FFFFFF" opacity="0.5" />
      <rect x="28" y="41" width="44" height="4" rx="2" fill="#FFFFFF" opacity="0.36" />
      <rect x="28" y="72" width="52" height="16" rx="8" fill="#FFFFFF" opacity="0.95" />
      <rect x="34" y="78" width="24" height="4" rx="2" fill="#3182F6" />

      {/* 카메라 / 프린터 / 결제 모듈 */}
      <rect x="28" y="100" width="16" height="16" rx="4" fill="#2A3441" stroke="#4A5666" strokeWidth="1.2" />
      <circle cx="36" cy="108" r="3.6" fill="#5B6B7E" />
      <rect x="50" y="102" width="30" height="4" rx="2" fill="#4A5666" />
      <rect x="28" y="122" width="52" height="3" rx="1.5" fill="#3A4552" />

      {/* 결제 카드 */}
      <g transform="rotate(-10 96 90)">
        <rect x="83" y="80" width="30" height="19" rx="3.5" fill="#FFFFFF" stroke="#DCE1E6" strokeWidth="1.4" />
        <rect x="87" y="84" width="9" height="6.5" rx="1.3" fill="#F5A623" />
        <rect x="87" y="93" width="18" height="2.2" rx="1.1" fill="#DCE1E6" />
      </g>
      <path d="M80 78C77 74 77 68 80 64" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
