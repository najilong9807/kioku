import type { ReactElement } from "react";
import type { PersonalityCode } from "./foodTest";

// "먹보조사" 결과 화면에서 음식 아바타 캐릭터와 나란히 보여줄 8가지 성향 아이콘이에요.
// 아바타 시스템(lib/avatars.tsx)과 같은 톤(INK 외곽선 + 플랫 컬러)으로 그려서
// 옆에 놓였을 때 어색하지 않게 맞췄어요.

const INK = "#191f28";

function IconBadgeBg({ color }: { color: string }) {
  return <circle cx="50" cy="50" r="48" fill={color} />;
}

// 탐험대장: 나침반 + 깃발 (앞장서서 이끄는 리더).
function ExplorerLeaderIcon() {
  return (
    <g>
      <IconBadgeBg color="#fff4cc" />
      <circle cx="42" cy="54" r="20" fill="#fffef7" stroke={INK} strokeWidth="2.6" />
      <path d="M 42 40 L 48 54 L 42 68 L 36 54 Z" fill="#f2a33c" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="68" y1="24" x2="68" y2="56" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M 68 24 L 86 30 L 68 38 Z" fill="#e0483f" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    </g>
  );
}

// 방랑자: 배낭 + 발자국 (혼자 유유히 떠도는 방랑).
function WandererIcon() {
  return (
    <g>
      <IconBadgeBg color="#f2e8d5" />
      <path
        d="M 36 42 Q 36 28 50 28 Q 64 28 64 42 L 64 70 Q 64 76 58 76 L 42 76 Q 36 76 36 70 Z"
        fill="#c9966b"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <rect x="42" y="46" width="16" height="14" rx="3" fill="#fffef7" stroke={INK} strokeWidth="1.8" />
      <path d="M 44 28 Q 50 20 56 28" fill="none" stroke={INK} strokeWidth="2.2" />
      <ellipse cx="26" cy="82" rx="5" ry="3.4" fill={INK} opacity="0.5" transform="rotate(-20 26 82)" />
      <ellipse cx="16" cy="88" rx="5" ry="3.4" fill={INK} opacity="0.3" transform="rotate(-20 16 88)" />
    </g>
  );
}

// 모험가: 쌍안경 (효율적으로 함께 탐험).
function AdventurerIcon() {
  return (
    <g>
      <IconBadgeBg color="#e3f0e6" />
      <circle cx="36" cy="54" r="16" fill="#fffef7" stroke={INK} strokeWidth="2.4" />
      <circle cx="64" cy="54" r="16" fill="#fffef7" stroke={INK} strokeWidth="2.4" />
      <circle cx="36" cy="54" r="7" fill="#3a8c4a" />
      <circle cx="64" cy="54" r="7" fill="#3a8c4a" />
      <rect x="44" y="46" width="12" height="8" fill="#fffef7" stroke={INK} strokeWidth="2" />
      <path d="M 30 40 L 24 30 M 70 40 L 76 30" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

// 탐구자: 돋보기 (혼자 파고드는 탐구).
function ResearcherIcon() {
  return (
    <g>
      <IconBadgeBg color="#ece4f7" />
      <circle cx="44" cy="44" r="18" fill="#fffef7" stroke={INK} strokeWidth="2.6" />
      <circle cx="44" cy="44" r="10" fill="#b79ce0" opacity="0.6" />
      <line x1="57" y1="57" x2="74" y2="74" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
    </g>
  );
}

// 인싸메이트: 하트 3개(사람들과 함께 나누는 감성).
function SocialMateIcon() {
  return (
    <g>
      <IconBadgeBg color="#ffe3ea" />
      {[
        { x: 34, y: 46, s: 0.75 },
        { x: 60, y: 44, s: 0.95 },
        { x: 50, y: 64, s: 0.6 },
      ].map((h, i) => (
        <g key={i} transform={`translate(${h.x}, ${h.y}) scale(${h.s})`}>
          <path
            d="M 0 14 Q -16 4 -16 -6 Q -16 -14 -8 -14 Q -3 -14 0 -8 Q 3 -14 8 -14 Q 16 -14 16 -6 Q 16 4 0 14 Z"
            fill="#ff6f91"
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </g>
  );
}

// 단골지킴이: 가게 처마 + 하트(혼자 조용히 지키는 단골 가게).
function RegularKeeperIcon() {
  return (
    <g>
      <IconBadgeBg color="#f5e6d8" />
      <path d="M 26 46 L 30 30 L 70 30 L 74 46 Z" fill="#c9862e" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="30" y="46" width="40" height="28" fill="#fffef7" stroke={INK} strokeWidth="2.2" />
      <path
        d="M 50 68 Q 38 60 38 52 Q 38 46 44 46 Q 48 46 50 50 Q 52 46 56 46 Q 62 46 62 52 Q 62 60 50 68 Z"
        fill="#e0483f"
        stroke={INK}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </g>
  );
}

// 정찬러: 포크·나이프 + 체크(검증된 선택을 함께 확실하게).
function DinerIcon() {
  return (
    <g>
      <IconBadgeBg color="#dcf0ec" />
      <line x1="36" y1="26" x2="36" y2="74" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M 31 26 L 31 40 M 36 26 L 36 40 M 41 26 L 41 40" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 64 26 Q 72 34 64 44 L 64 74" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="52" r="14" fill="#2fae8f" stroke={INK} strokeWidth="1.8" opacity="0.9" />
      <path d="M 44 52 L 48 57 L 57 46" fill="none" stroke="#fffef7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

// 루틴러: 반복 화살표 + 시계(나만의 루틴 속 안정).
function RoutineIcon() {
  return (
    <g>
      <IconBadgeBg color="#e6eaf2" />
      <circle cx="50" cy="50" r="24" fill="#fffef7" stroke={INK} strokeWidth="2.6" />
      <path
        d="M 38 34 A 18 18 0 1 1 34 50"
        fill="none"
        stroke="#6b84c4"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M 38 26 L 38 34 L 46 34" fill="none" stroke="#6b84c4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="50" y1="50" x2="50" y2="40" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="50" y1="50" x2="58" y2="54" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

const PERSONALITY_ICON_RENDERERS: Record<PersonalityCode, () => ReactElement> = {
  탐험대장: ExplorerLeaderIcon,
  방랑자: WandererIcon,
  모험가: AdventurerIcon,
  탐구자: ResearcherIcon,
  인싸메이트: SocialMateIcon,
  단골지킴이: RegularKeeperIcon,
  정찬러: DinerIcon,
  루틴러: RoutineIcon,
};

export function PersonalityIcon({
  code,
  size = 72,
}: {
  code: PersonalityCode;
  size?: number;
}) {
  const Render = PERSONALITY_ICON_RENDERERS[code];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${code} 아이콘`}>
      <Render />
    </svg>
  );
}
