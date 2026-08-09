import type { ReactElement } from "react";
import { SAGE_GREEN_DARK } from "../theme";

// "먹보조사" 각 문항 상단에 보여줄 미니멀 일러스트예요. 아바타 시스템(lib/avatars.tsx)과
// 톤을 맞추되, 색은 세이지그린 계열 포인트 하나로 통일해서 문항 일러스트만의
// 차분한 느낌을 줘요. 100x100 viewBox, 원형 배경 + 잉크색 선 + 세이지 포인트
// 조합으로 그려요.

const INK = "#191f28";
const SAGE = "#9CAF9A";
const SAGE_DARK = SAGE_GREEN_DARK;
const BG = "#EAF0EA";

function IconBg() {
  return <circle cx="50" cy="50" r="48" fill={BG} />;
}

// ── 여정스타일 ───────────────────────────────────────────────
// 정해둔 목적지 없이 발길 닿는 대로 갈라지는 길 - IconMapPin(저장된 핀)과
// 대비되는, 목적지가 없는 방랑을 표현해요.
function IconWander() {
  return (
    <g>
      <IconBg />
      <path
        d="M 50 78 Q 50 60 38 52 Q 27 45 29 32"
        fill="none"
        stroke={SAGE}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M 50 78 Q 50 60 63 52 Q 74 44 70 28"
        fill="none"
        stroke={SAGE}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="0.5 9"
      />
      <circle cx="50" cy="78" r="4" fill={INK} />
      <circle cx="29" cy="30" r="3" fill={INK} opacity="0.55" />
      <circle cx="70" cy="26" r="3" fill={INK} opacity="0.55" />
    </g>
  );
}

function IconMapPin() {
  return (
    <g>
      <IconBg />
      <rect x="22" y="26" width="56" height="42" rx="4" fill="#fff" stroke={INK} strokeWidth="2.5" />
      <path d="M 34 26 L 34 68 M 50 26 L 50 68 M 66 26 L 66 68" stroke="#d7e2d8" strokeWidth="1.6" strokeDasharray="3 4" />
      <path
        d="M 50 40 Q 60 40 60 50 Q 60 60 50 68 Q 40 60 40 50 Q 40 40 50 40 Z"
        fill={SAGE}
        stroke={INK}
        strokeWidth="2.4"
      />
      <circle cx="50" cy="50" r="3.4" fill="#fff" />
    </g>
  );
}

function IconGameController() {
  return (
    <g>
      <IconBg />
      <rect x="24" y="38" width="52" height="30" rx="15" fill={SAGE} stroke={INK} strokeWidth="2.5" />
      <path d="M 36 47 L 36 59 M 30 53 L 42 53" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="62" cy="49" r="3" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <circle cx="68" cy="57" r="3" fill="#fff" stroke={INK} strokeWidth="1.6" />
    </g>
  );
}

function IconMarketStall() {
  return (
    <g>
      <IconBg />
      <path d="M 24 42 L 76 42 L 70 30 L 30 30 Z" fill={SAGE} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M 30 42 L 26 50 M 42 42 L 39 50 M 54 42 L 52 50 M 66 42 L 64 50" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <rect x="34" y="54" width="32" height="18" rx="3" fill="#fff" stroke={INK} strokeWidth="2.2" />
    </g>
  );
}

// 친구의 파격적인 스타일 - 선글라스 + 반짝임으로 대담한 패션을 표현해요.
function IconBoldOutfit() {
  return (
    <g>
      <IconBg />
      <path
        d="M 26 44 Q 26 38 32 38 L 42 38 Q 47 38 48 43 L 52 43 Q 53 38 58 38 L 68 38 Q 74 38 74 44"
        fill="none"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="37" cy="49" r="11" fill={SAGE} stroke={INK} strokeWidth="2.4" />
      <circle cx="63" cy="49" r="11" fill={SAGE} stroke={INK} strokeWidth="2.4" />
      <path d="M 70 25 L 72 31 L 78 33 L 72 35 L 70 41 L 68 35 L 62 33 L 68 31 Z" fill={SAGE_DARK} />
    </g>
  );
}

function IconGiftNew() {
  return (
    <g>
      <IconBg />
      <rect x="28" y="42" width="44" height="30" rx="3" fill={SAGE} stroke={INK} strokeWidth="2.4" />
      <rect x="28" y="42" width="44" height="10" fill="#fff" stroke={INK} strokeWidth="2" />
      <line x1="50" y1="42" x2="50" y2="72" stroke={INK} strokeWidth="2.2" />
      <circle cx="70" cy="30" r="10" fill="#fff" stroke={INK} strokeWidth="2" />
      <text x="70" y="34" fontSize="9" fontWeight="700" textAnchor="middle" fill={SAGE_DARK}>NEW</text>
    </g>
  );
}

function IconMenuBook() {
  return (
    <g>
      <IconBg />
      <path d="M 50 30 Q 40 24 26 28 L 26 66 Q 40 62 50 68 Z" fill="#fff" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M 50 30 Q 60 24 74 28 L 74 66 Q 60 62 50 68 Z" fill="#fff" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <line x1="32" y1="38" x2="46" y2="36" stroke={SAGE} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="32" y1="46" x2="46" y2="44" stroke={SAGE} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="54" y1="36" x2="68" y2="38" stroke={SAGE} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="54" y1="44" x2="68" y2="46" stroke={SAGE} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

function IconPuzzle() {
  return (
    <g>
      <IconBg />
      <path
        d="M 30 30 H 48 V 36 A 5 5 0 0 1 58 36 V 30 H 70 V 44 H 64 A 5 5 0 0 0 64 54 H 70 V 68 H 30 Z"
        fill={SAGE}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </g>
  );
}

// ── 선택기준 ─────────────────────────────────────────────────
function IconShoppingBag() {
  return (
    <g>
      <IconBg />
      <path d="M 32 40 L 68 40 L 65 72 L 35 72 Z" fill={SAGE} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M 40 40 Q 40 26 50 26 Q 60 26 60 40" fill="none" stroke={INK} strokeWidth="2.4" />
    </g>
  );
}

function IconLamp() {
  return (
    <g>
      <IconBg />
      <line x1="50" y1="22" x2="50" y2="34" stroke={INK} strokeWidth="2.2" />
      <path d="M 34 34 L 66 34 L 58 54 L 42 54 Z" fill={SAGE} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <line x1="50" y1="54" x2="50" y2="66" stroke={INK} strokeWidth="2.2" />
      <path d="M 40 62 Q 50 58 60 62" fill="none" stroke={SAGE_DARK} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
    </g>
  );
}

function IconBed() {
  return (
    <g>
      <IconBg />
      <rect x="24" y="52" width="52" height="16" rx="3" fill={SAGE} stroke={INK} strokeWidth="2.4" />
      <rect x="24" y="42" width="18" height="12" rx="3" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <line x1="24" y1="68" x2="24" y2="74" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <line x1="76" y1="68" x2="76" y2="74" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

function IconGiftRibbon() {
  return (
    <g>
      <IconBg />
      <rect x="28" y="44" width="44" height="28" rx="3" fill={SAGE} stroke={INK} strokeWidth="2.4" />
      <line x1="50" y1="44" x2="50" y2="72" stroke={INK} strokeWidth="2.2" />
      <line x1="28" y1="56" x2="72" y2="56" stroke={INK} strokeWidth="2.2" />
      <path d="M 50 44 Q 40 30 32 38 Q 36 46 50 44 Z" fill="#fff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M 50 44 Q 60 30 68 38 Q 64 46 50 44 Z" fill="#fff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </g>
  );
}

function IconCamera() {
  return (
    <g>
      <IconBg />
      <rect x="24" y="38" width="52" height="34" rx="6" fill={SAGE} stroke={INK} strokeWidth="2.4" />
      <rect x="38" y="30" width="16" height="10" rx="2" fill={SAGE} stroke={INK} strokeWidth="2.2" />
      <circle cx="50" cy="55" r="11" fill="#fff" stroke={INK} strokeWidth="2.4" />
      <circle cx="50" cy="55" r="4.5" fill={SAGE_DARK} />
    </g>
  );
}

function IconShirt() {
  return (
    <g>
      <IconBg />
      <path d="M 42 28 L 50 34 L 58 28 L 70 36 L 64 46 L 60 42 L 60 72 L 40 72 L 40 42 L 36 46 L 30 36 Z" fill={SAGE} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
    </g>
  );
}

function IconWindowSeat() {
  return (
    <g>
      <IconBg />
      <rect x="30" y="26" width="40" height="26" rx="3" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <line x1="50" y1="26" x2="50" y2="52" stroke={INK} strokeWidth="1.6" />
      <line x1="30" y1="39" x2="70" y2="39" stroke={INK} strokeWidth="1.6" />
      <path d="M 40 58 Q 40 50 50 50 Q 60 50 60 58 L 58 72 L 42 72 Z" fill={SAGE} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
    </g>
  );
}

function IconSunset() {
  return (
    <g>
      <IconBg />
      <line x1="24" y1="58" x2="76" y2="58" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 32 58 A 18 18 0 0 1 68 58 Z" fill={SAGE} stroke={INK} strokeWidth="2.4" />
      <line x1="50" y1="30" x2="50" y2="24" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <line x1="33" y1="41" x2="29" y2="37" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <line x1="67" y1="41" x2="71" y2="37" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

// ── 식사방식 ─────────────────────────────────────────────────
function IconMegaphone() {
  return (
    <g>
      <IconBg />
      <path d="M 28 48 L 44 40 L 44 60 L 28 52 Z" fill={SAGE} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 44 40 L 68 30 L 68 70 L 44 60 Z" fill={SAGE} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 34 60 L 38 68 L 44 66 L 41 58 Z" fill="#fff" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M 72 40 Q 78 45 72 50" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function IconClockFree() {
  return (
    <g>
      <IconBg />
      <circle cx="50" cy="50" r="24" fill="#fff" stroke={INK} strokeWidth="2.6" />
      <line x1="50" y1="50" x2="50" y2="34" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="50" y1="50" x2="62" y2="56" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="50" cy="50" r="3" fill={SAGE_DARK} />
    </g>
  );
}

function IconSuitcase() {
  return (
    <g>
      <IconBg />
      <rect x="26" y="40" width="48" height="32" rx="5" fill={SAGE} stroke={INK} strokeWidth="2.4" />
      <path d="M 40 40 L 40 34 Q 40 30 44 30 L 56 30 Q 60 30 60 34 L 60 40" fill="none" stroke={INK} strokeWidth="2.4" />
      <line x1="26" y1="54" x2="74" y2="54" stroke={INK} strokeWidth="1.8" opacity="0.5" />
    </g>
  );
}

function IconQueue() {
  return (
    <g>
      <IconBg />
      {[30, 50, 70].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="38" r="7" fill={SAGE} stroke={INK} strokeWidth="2" />
          <path d={`M ${cx - 9} 62 Q ${cx} 48 ${cx + 9} 62`} fill={SAGE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </g>
      ))}
    </g>
  );
}

function IconSavor() {
  return (
    <g>
      <IconBg />
      <path
        d="M 50 68 Q 28 54 28 40 Q 28 28 40 28 Q 46 28 50 36 Q 54 28 60 28 Q 72 28 72 40 Q 72 54 50 68 Z"
        fill={SAGE}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M 20 34 Q 24 30 28 34 M 72 34 Q 76 30 80 34" stroke={SAGE_DARK} strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  );
}

function IconGroup() {
  return (
    <g>
      <IconBg />
      <circle cx="38" cy="42" r="9" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <circle cx="62" cy="42" r="9" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <circle cx="50" cy="38" r="10" fill={SAGE} stroke={INK} strokeWidth="2.2" />
      <path d="M 26 70 Q 30 54 42 54 Q 50 54 50 62 Q 50 54 58 54 Q 70 54 74 70 Z" fill={SAGE} stroke={INK} strokeWidth="2" strokeLinejoin="round" opacity="0.9" />
    </g>
  );
}

function IconAlone() {
  return (
    <g>
      <IconBg />
      <circle cx="50" cy="38" r="11" fill={SAGE} stroke={INK} strokeWidth="2.4" />
      <path d="M 32 72 Q 36 52 50 52 Q 64 52 68 72 Z" fill={SAGE} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
    </g>
  );
}

function IconDoor() {
  return (
    <g>
      <IconBg />
      <rect x="34" y="24" width="32" height="50" rx="3" fill={SAGE} stroke={INK} strokeWidth="2.4" />
      <circle cx="58" cy="50" r="2.6" fill={INK} />
    </g>
  );
}

function IconStarburst() {
  return (
    <g>
      <IconBg />
      <path
        d="M 50 24 L 55 42 L 74 42 L 59 53 L 64 72 L 50 60 L 36 72 L 41 53 L 26 42 L 45 42 Z"
        fill={SAGE}
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </g>
  );
}

// ── 음식 취향 ───────────────────────────────────────────────
function IconUtensils() {
  return (
    <g>
      <IconBg />
      <g transform="rotate(-20 50 50)">
        <line x1="38" y1="26" x2="38" y2="74" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M 33 26 L 33 38 M 38 26 L 38 38 M 43 26 L 43 38" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <g transform="rotate(20 62 50)">
        <path d="M 62 26 Q 70 34 62 44 L 62 74" fill="none" stroke={SAGE_DARK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}

function IconBowlSteam() {
  return (
    <g>
      <IconBg />
      <path d="M 26 52 Q 26 72 50 72 Q 74 72 74 52 Z" fill={SAGE} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M 40 44 Q 36 36 40 30 M 50 44 Q 46 36 50 30 M 60 44 Q 56 36 60 30" fill="none" stroke={SAGE_DARK} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </g>
  );
}

function IconStopwatch() {
  return (
    <g>
      <IconBg />
      <rect x="46" y="20" width="8" height="6" rx="2" fill={INK} />
      <circle cx="50" cy="52" r="22" fill="#fff" stroke={INK} strokeWidth="2.6" />
      <line x1="50" y1="52" x2="50" y2="38" stroke={SAGE_DARK} strokeWidth="2.6" strokeLinecap="round" />
      <line x1="50" y1="52" x2="60" y2="58" stroke={SAGE_DARK} strokeWidth="2.6" strokeLinecap="round" />
    </g>
  );
}

function IconTwoPlates() {
  return (
    <g>
      <IconBg />
      <circle cx="40" cy="54" r="18" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <circle cx="40" cy="54" r="8" fill={SAGE} opacity="0.7" />
      <circle cx="64" cy="46" r="18" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <circle cx="64" cy="46" r="8" fill={SAGE} opacity="0.7" />
    </g>
  );
}

function IconStressCloud() {
  return (
    <g>
      <IconBg />
      <path
        d="M 34 56 Q 24 56 24 46 Q 24 38 32 38 Q 34 28 46 28 Q 58 28 60 38 Q 70 38 70 48 Q 70 56 60 56 Z"
        fill={SAGE}
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M 42 42 L 46 48 L 42 48 L 46 54" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function IconFootstepsStop() {
  return (
    <g>
      <IconBg />
      <ellipse cx="38" cy="40" rx="7" ry="10" fill={SAGE} stroke={INK} strokeWidth="2" transform="rotate(-10 38 40)" />
      <ellipse cx="60" cy="54" rx="7" ry="10" fill={SAGE} stroke={INK} strokeWidth="2" transform="rotate(8 60 54)" />
      <circle cx="76" cy="66" r="9" fill="none" stroke={INK} strokeWidth="2.4" />
      <line x1="70" y1="60" x2="82" y2="72" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

function IconTripFork() {
  return (
    <g>
      <IconBg />
      <rect x="26" y="46" width="34" height="24" rx="4" fill={SAGE} stroke={INK} strokeWidth="2.2" />
      <path d="M 34 46 L 34 40 Q 34 36 38 36 L 48 36 Q 52 36 52 40 L 52 46" fill="none" stroke={INK} strokeWidth="2.2" />
      <g transform="translate(64, 32)">
        <line x1="0" y1="0" x2="0" y2="38" stroke={SAGE_DARK} strokeWidth="2.6" strokeLinecap="round" />
        <path d="M -4 0 L -4 8 M 0 0 L 0 8 M 4 0 L 4 8" stroke={SAGE_DARK} strokeWidth="2" strokeLinecap="round" />
      </g>
    </g>
  );
}

function IconRefreshSpark() {
  return (
    <g>
      <IconBg />
      <path
        d="M 32 42 A 20 20 0 1 1 30 58"
        fill="none"
        stroke={SAGE}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M 32 32 L 32 42 L 42 42" fill="none" stroke={SAGE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 66 26 L 68 32 L 74 34 L 68 36 L 66 42 L 64 36 L 58 34 L 64 32 Z" fill={SAGE_DARK} />
    </g>
  );
}

function IconGiftBasket() {
  return (
    <g>
      <IconBg />
      <path d="M 28 48 L 72 48 L 66 72 L 34 72 Z" fill={SAGE} stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M 34 48 Q 50 30 66 48" fill="none" stroke={INK} strokeWidth="2.4" />
      <circle cx="42" cy="58" r="4" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <circle cx="54" cy="60" r="4" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <circle cx="62" cy="56" r="4" fill="#fff" stroke={INK} strokeWidth="1.6" />
    </g>
  );
}

function IconChefHat() {
  return (
    <g>
      <IconBg />
      <path
        d="M 36 46 Q 30 46 30 38 Q 30 30 38 30 Q 40 22 50 22 Q 60 22 62 30 Q 70 30 70 38 Q 70 46 64 46 Z"
        fill="#fff"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <rect x="36" y="46" width="28" height="8" fill="#fff" stroke={INK} strokeWidth="2.2" />
      <rect x="34" y="60" width="32" height="12" rx="3" fill={SAGE} stroke={INK} strokeWidth="2.2" />
    </g>
  );
}

export const QUESTION_ICONS: Record<string, () => ReactElement> = {
  "journey-1": IconWander,
  "journey-2": IconMapPin,
  "journey-3": IconGameController,
  "journey-4": IconMarketStall,
  "journey-5": IconBoldOutfit,
  "journey-6": IconGiftNew,
  "journey-7": IconMenuBook,
  "journey-9": IconPuzzle,
  "choice-1": IconShoppingBag,
  "choice-2": IconLamp,
  "choice-3": IconBed,
  "choice-4": IconGiftRibbon,
  "choice-5": IconCamera,
  "choice-6": IconShirt,
  "choice-7": IconWindowSeat,
  "choice-9": IconSunset,
  "dining-1": IconMegaphone,
  "dining-2": IconClockFree,
  "dining-3": IconSuitcase,
  "dining-4": IconQueue,
  "dining-5": IconSavor,
  "dining-6": IconGroup,
  "dining-7": IconAlone,
  "dining-8": IconDoor,
  "dining-10": IconStarburst,
  "food-1": IconBowlSteam,
  "food-2": IconUtensils,
  "food-3": IconStopwatch,
  "food-4": IconTwoPlates,
  "food-5": IconStressCloud,
  "food-6": IconFootstepsStop,
  "food-7": IconTripFork,
  "food-8": IconRefreshSpark,
  "food-9": IconGiftBasket,
  "food-10": IconChefHat,
};

export function QuestionIllustration({
  questionId,
  size = 72,
}: {
  questionId: string;
  size?: number;
}) {
  const Render = QUESTION_ICONS[questionId];
  if (!Render) {
    return null;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-hidden="true">
      <Render />
    </svg>
  );
}
