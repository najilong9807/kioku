import type { ReactElement } from "react";

// 프로필 사진 대신 고를 수 있는 캐릭터 아바타예요. "사람"과 "음식" 두 카테고리로
// 나뉘고, 각 캐릭터는 체형 구분 없이 하나씩만 있어요(이모지 같은 단일 캐릭터 느낌).
// DB(anon_profiles.profile_image)에는 실제 사진이면 base64 데이터 URL을, 아바타를
// 골랐으면 "avatar:{category}_{styleId}" 형태의 식별자 문자열을 저장해요.
// 예) "avatar:person_short_black", "avatar:food_gimbap"
// styleId 자체에도 밑줄이 들어갈 수 있어서, 파싱할 때는 접두사를 뗀 뒤 첫 번째
// 밑줄까지만 카테고리로 잘라내요(split("_")가 아니라 indexOf 사용).

export const AVATAR_PREFIX = "avatar:";

export const AVATAR_CATEGORIES = ["person", "food"] as const;
export type AvatarCategory = (typeof AVATAR_CATEGORIES)[number];

export const AVATAR_CATEGORY_LABELS: Record<AvatarCategory, string> = {
  person: "사람",
  food: "음식",
};

export const PERSON_STYLES = [
  "short_black",
  "bun_brown",
  "curly_afro",
  "long_wavy",
  "bald_glasses",
  "twintails",
  "cap",
  "silver_short",
] as const;
export type PersonStyle = (typeof PERSON_STYLES)[number];

export const PERSON_LABELS: Record<PersonStyle, string> = {
  short_black: "단발머리",
  bun_brown: "쪽머리",
  curly_afro: "곱슬머리",
  long_wavy: "웨이브 긴머리",
  bald_glasses: "안경",
  twintails: "양갈래",
  cap: "모자",
  silver_short: "은발머리",
};

export const FOOD_STYLES = [
  "onigiri",
  "mandu",
  "donut",
  "sushi",
  "bungeoppang",
  "gimbap",
  "tteokbokki",
  "ramen",
] as const;
export type FoodStyle = (typeof FOOD_STYLES)[number];

export const FOOD_LABELS: Record<FoodStyle, string> = {
  onigiri: "주먹밥",
  mandu: "만두",
  donut: "도넛",
  sushi: "초밥",
  bungeoppang: "붕어빵",
  gimbap: "김밥",
  tteokbokki: "떡볶이",
  ramen: "라면",
};

export type AvatarStyle = PersonStyle | FoodStyle;

export interface AvatarId {
  category: AvatarCategory;
  style: AvatarStyle;
}

export function toAvatarValue({ category, style }: AvatarId): string {
  return `${AVATAR_PREFIX}${category}_${style}`;
}

export function isAvatarValue(value: string | null | undefined): value is string {
  return typeof value === "string" && value.startsWith(AVATAR_PREFIX);
}

// "avatar:person_short_black" -> { category: "person", style: "short_black" }
// styleId 쪽에 밑줄이 더 있을 수 있어서, 카테고리 뒤 첫 번째 밑줄까지만 잘라내요.
// 형식이 깨졌거나 모르는 카테고리/스타일이면 null을 반환해요(사진으로 취급).
export function parseAvatarValue(value: string | null | undefined): AvatarId | null {
  if (!isAvatarValue(value)) {
    return null;
  }
  const rest = value.slice(AVATAR_PREFIX.length);
  const separatorIndex = rest.indexOf("_");
  if (separatorIndex === -1) {
    return null;
  }
  const category = rest.slice(0, separatorIndex);
  const style = rest.slice(separatorIndex + 1);

  if (category === "person" && (PERSON_STYLES as readonly string[]).includes(style)) {
    return { category: "person", style: style as PersonStyle };
  }
  if (category === "food" && (FOOD_STYLES as readonly string[]).includes(style)) {
    return { category: "food", style: style as FoodStyle };
  }
  return null;
}

export function avatarLabel({ category, style }: AvatarId): string {
  return category === "person"
    ? PERSON_LABELS[style as PersonStyle]
    : FOOD_LABELS[style as FoodStyle];
}

const INK = "#191f28";
const BLUSH = "#ffb4a3";

// 사람 캐릭터가 공통으로 쓰는 얼굴이에요(음식 캐릭터보다 눈 간격이 좁고 살짝 위에 있어요).
function PersonFace({ cy = 56 }: { cy?: number }) {
  return (
    <g>
      <ellipse cx="42" cy={cy} rx="2.6" ry="3.4" fill={INK} />
      <ellipse cx="58" cy={cy} rx="2.6" ry="3.4" fill={INK} />
      <path
        d={`M 44 ${cy + 8} Q 50 ${cy + 12} 56 ${cy + 8}`}
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="32" cy={cy + 7} r="4.2" fill={BLUSH} opacity="0.7" />
      <circle cx="68" cy={cy + 7} r="4.2" fill={BLUSH} opacity="0.7" />
    </g>
  );
}

// 음식 캐릭터가 공통으로 쓰는 얼굴이에요. (cx, cy)를 중심으로 그려요.
function FoodFace({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <ellipse cx={cx - 10} cy={cy} rx="2.6" ry="3.4" fill={INK} />
      <ellipse cx={cx + 10} cy={cy} rx="2.6" ry="3.4" fill={INK} />
      <path
        d={`M ${cx - 6} ${cy + 7} Q ${cx} ${cy + 11} ${cx + 6} ${cy + 7}`}
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx={cx - 17} cy={cy + 6} r="4.5" fill={BLUSH} opacity="0.7" />
      <circle cx={cx + 17} cy={cy + 6} r="4.5" fill={BLUSH} opacity="0.7" />
    </g>
  );
}

// 몸통 양옆에 붙는 작은 팔이에요(음식 캐릭터 전용). y/spread로 붙는 위치를 조절해요.
function StubArms({ y, spread }: { y: number; spread: number }) {
  return (
    <g stroke={INK} strokeWidth="3" strokeLinecap="round">
      <path d={`M ${50 - spread} ${y} q -8 6 -6 14`} fill="none" />
      <path d={`M ${50 + spread} ${y} q 8 6 6 14`} fill="none" />
    </g>
  );
}

// ── 사람 캐릭터 ──────────────────────────────────────────────
// 모두 같은 얼굴/머리 크기 기준(머리 원: cx 50, cy 52, r 34)을 공유하고, 헤어스타일과
// 피부톤만 바꿔서 8명을 구성해요.
function PersonHead({ skin }: { skin: string }) {
  return <circle cx="50" cy="52" r="34" fill={skin} stroke={INK} strokeWidth="3" />;
}

function PersonShortBlack() {
  return (
    <g>
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 17 46 Q 20 14 50 14 Q 80 14 83 46 Q 70 34 50 34 Q 30 34 17 46 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonBunBrown() {
  return (
    <g>
      <circle cx="50" cy="14" r="10" fill="#6b4423" stroke={INK} strokeWidth="2.5" />
      <PersonHead skin="#e8b088" />
      <path
        d="M 17 44 Q 19 20 50 20 Q 81 20 83 44 Q 68 30 50 30 Q 32 30 17 44 Z"
        fill="#6b4423"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonCurlyAfro() {
  const bumps = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
    const angle = Math.PI * (0.92 - (i / 8) * 0.84);
    return { x: 50 + Math.cos(angle) * 38, y: 40 - Math.sin(angle) * 38 };
  });
  return (
    <g>
      {bumps.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="11" fill="#2b2b2b" stroke={INK} strokeWidth="2.5" />
      ))}
      <PersonHead skin="#8a5a3a" />
      <PersonFace />
    </g>
  );
}

function PersonLongWavy() {
  return (
    <g>
      <path
        d="M 14 40 Q 8 70 16 92 Q 22 74 20 58 Z"
        fill="#935e35"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M 86 40 Q 92 70 84 92 Q 78 74 80 58 Z"
        fill="#935e35"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 16 46 Q 18 15 50 15 Q 82 15 84 46 Q 68 32 50 32 Q 32 32 16 46 Z"
        fill="#935e35"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonBaldGlasses() {
  return (
    <g>
      <PersonHead skin="#c98a5e" />
      <PersonFace />
      <g fill="none" stroke={INK} strokeWidth="2.4">
        <circle cx="42" cy="56" r="7.5" />
        <circle cx="58" cy="56" r="7.5" />
        <path d="M 49.5 56 L 50.5 56" />
        <path d="M 34.5 56 L 30 54" strokeLinecap="round" />
        <path d="M 65.5 56 L 70 54" strokeLinecap="round" />
      </g>
    </g>
  );
}

function PersonTwintails() {
  return (
    <g>
      <ellipse cx="18" cy="58" rx="8" ry="11" fill="#4a2f1f" stroke={INK} strokeWidth="2.5" />
      <ellipse cx="82" cy="58" rx="8" ry="11" fill="#4a2f1f" stroke={INK} strokeWidth="2.5" />
      <rect x="14" y="46" width="8" height="6" rx="3" fill="#ffc107" stroke={INK} strokeWidth="1.5" />
      <rect x="78" y="46" width="8" height="6" rx="3" fill="#ffc107" stroke={INK} strokeWidth="1.5" />
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 17 44 Q 19 16 50 16 Q 81 16 83 44 Q 68 30 50 30 Q 32 30 17 44 Z"
        fill="#4a2f1f"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonCap() {
  return (
    <g>
      <PersonHead skin="#e8b088" />
      <path d="M 18 44 Q 30 34 40 34 L 40 46 Q 28 46 18 50 Z" fill="#3a2b22" />
      <path d="M 82 44 Q 70 34 60 34 L 60 46 Q 72 46 82 50 Z" fill="#3a2b22" />
      <path
        d="M 15 40 Q 18 12 50 12 Q 82 12 85 40 Q 68 26 50 26 Q 32 26 15 40 Z"
        fill="#4e8cff"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M 50 26 Q 78 26 88 42 Q 76 34 50 32 Z" fill="#3f74d1" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <PersonFace />
    </g>
  );
}

function PersonSilverShort() {
  return (
    <g>
      <PersonHead skin="#c98a5e" />
      <path
        d="M 17 46 Q 19 15 50 15 Q 81 15 83 46 Q 66 33 50 33 Q 34 33 17 46 Z"
        fill="#c8c8d0"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M 50 15 L 46 30" stroke="#a9a9b2" strokeWidth="2" strokeLinecap="round" />
      <PersonFace />
    </g>
  );
}

// ── 음식 캐릭터 ──────────────────────────────────────────────

function OnigiriBody() {
  // 삼각형 주먹밥 + 김 띠.
  return (
    <g>
      <polygon
        points="50,14 18,86 82,86"
        fill="#fffef7"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <polygon points="28.5,62 71.5,62 82,86 18,86" fill={INK} />
      <StubArms y={70} spread={28} />
      <FoodFace cx={50} cy={46} />
    </g>
  );
}

function ManduBody() {
  // 반달 모양 만두 + 위쪽 주름(펼침살) 점.
  return (
    <g>
      <ellipse cx="50" cy="60" rx="38" ry="29" fill="#f6e3c2" stroke={INK} strokeWidth="3" />
      {[24, 37, 50, 63, 76].map((x) => (
        <circle key={x} cx={x} cy={35} r="4.5" fill="#f6e3c2" stroke={INK} strokeWidth="2" />
      ))}
      <StubArms y={66} spread={34} />
      <FoodFace cx={50} cy={62} />
    </g>
  );
}

function DonutBody() {
  // 링(구멍) 모양 도넛 + 글레이즈 물결 + 스프링클.
  // 글레이즈를 구멍보다 먼저 그리고 구멍(크림색 원)을 나중에 덮어서, 글레이즈가
  // 구멍 위로 떠 보이지 않고 반죽 위에만 얹힌 것처럼 보이게 해요.
  return (
    <g>
      <circle cx="50" cy="55" r="37" fill="#d9945f" stroke={INK} strokeWidth="3" />
      <path
        d="M 18 44 Q 30 34 42 44 T 66 44 T 82 44"
        fill="none"
        stroke="#ffc107"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="50" cy="55" r="14" fill="#fffef7" stroke={INK} strokeWidth="2.5" />
      {[[26, 68], [40, 80], [60, 80], [74, 68], [50, 84]].map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x - 3}
          y={y - 1.2}
          width="6"
          height="2.4"
          rx="1.2"
          fill="#4e8cff"
          transform={`rotate(${(x * 37) % 180} ${x} ${y})`}
        />
      ))}
      <StubArms y={78} spread={35} />
      <FoodFace cx={50} cy={80} />
    </g>
  );
}

function SushiBody() {
  // 밥 받침 + 김 띠 + 연어 토핑.
  return (
    <g>
      <rect x="20" y="54" width="60" height="32" rx="12" fill="#fffef7" stroke={INK} strokeWidth="3" />
      <rect x="18" y="61" width="64" height="11" fill={INK} />
      <ellipse cx="50" cy="46" rx="33" ry="21" fill="#ff9d7a" stroke={INK} strokeWidth="3" />
      <StubArms y={74} spread={30} />
      <FoodFace cx={50} cy={44} />
    </g>
  );
}

function BungeoppangBody() {
  // 붕어빵 몸통 + 꼬리 지느러미 + 굽는 결 무늬.
  return (
    <g>
      <path
        d="M 12 55 C 12 30 34 22 48 22 C 66 22 78 38 78 55 C 78 72 66 88 48 88 C 34 88 12 80 12 55 Z"
        fill="#dfa15c"
        stroke={INK}
        strokeWidth="3"
      />
      <polygon points="76,40 94,30 92,55 94,80 76,70" fill="#dfa15c" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M 30 34 Q 24 55 30 76" fill="none" stroke="#b97b3c" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 44 26 Q 38 55 44 84" fill="none" stroke="#b97b3c" strokeWidth="2.5" strokeLinecap="round" />
      <FoodFace cx={48} cy={52} />
    </g>
  );
}

function GimbapBody() {
  // 김밥 단면: 김 테두리 + 밥 링 + 가운데 속재료(당근/시금치/단무지/달걀).
  return (
    <g>
      <circle cx="50" cy="55" r="37" fill={INK} />
      <circle cx="50" cy="55" r="30" fill="#fffef7" stroke={INK} strokeWidth="2" />
      <circle cx="50" cy="42" r="7" fill="#f2a33c" />
      <rect x="34" y="52" width="12" height="9" rx="2" fill="#3a8c4a" />
      <rect x="52" y="52" width="12" height="9" rx="2" fill="#f4d35e" />
      <rect x="40" y="63" width="20" height="8" rx="2" fill="#e0949c" />
      <StubArms y={80} spread={33} />
      <FoodFace cx={50} cy={80} />
    </g>
  );
}

function TteokbokkiBody() {
  // 빨간 소스 접시 + 떡 3개 + 어묵.
  return (
    <g>
      <ellipse cx="50" cy="62" rx="38" ry="26" fill="#e0483f" stroke={INK} strokeWidth="3" />
      {[32, 50, 68].map((x) => (
        <rect
          key={x}
          x={x - 6}
          y={30}
          width="12"
          height="30"
          rx="6"
          fill="#fff2e0"
          stroke={INK}
          strokeWidth="2.5"
        />
      ))}
      <path
        d="M 20 58 Q 30 50 40 58 Q 50 66 60 58 Q 70 50 80 58"
        fill="none"
        stroke="#f2a33c"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <StubArms y={78} spread={35} />
      <FoodFace cx={50} cy={80} />
    </g>
  );
}

function RamenBody() {
  // 그릇 + 국물 위 면발 물결 + 반숙 달걀 + 파.
  return (
    <g>
      <path
        d="M 12 52 Q 12 86 50 88 Q 88 86 88 52 Z"
        fill="#fffef7"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M 12 52 Q 50 64 88 52" fill="#e8b463" stroke={INK} strokeWidth="2.5" />
      <path
        d="M 22 50 Q 28 44 34 50 T 46 50 T 58 50 T 70 50"
        fill="none"
        stroke="#f2d38a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <ellipse cx="68" cy="56" rx="9" ry="7" fill="#fffef7" stroke={INK} strokeWidth="2" />
      <circle cx="68" cy="56" r="4" fill="#f2a33c" />
      <circle cx="28" cy="58" r="3.5" fill="#3a8c4a" />
      <circle cx="35" cy="61" r="3" fill="#3a8c4a" />
      <FoodFace cx={42} cy={70} />
    </g>
  );
}

const PERSON_RENDERERS: Record<PersonStyle, () => ReactElement> = {
  short_black: PersonShortBlack,
  bun_brown: PersonBunBrown,
  curly_afro: PersonCurlyAfro,
  long_wavy: PersonLongWavy,
  bald_glasses: PersonBaldGlasses,
  twintails: PersonTwintails,
  cap: PersonCap,
  silver_short: PersonSilverShort,
};

const FOOD_RENDERERS: Record<FoodStyle, () => ReactElement> = {
  onigiri: OnigiriBody,
  mandu: ManduBody,
  donut: DonutBody,
  sushi: SushiBody,
  bungeoppang: BungeoppangBody,
  gimbap: GimbapBody,
  tteokbokki: TteokbokkiBody,
  ramen: RamenBody,
};

// 모든 캐릭터를 (카테고리별로) 순회할 때 쓰는 목록이에요(선택 그리드용).
export const ALL_AVATARS: AvatarId[] = [
  ...PERSON_STYLES.map((style): AvatarId => ({ category: "person", style })),
  ...FOOD_STYLES.map((style): AvatarId => ({ category: "food", style })),
];

// 아바타 하나를 그려요. size는 렌더링될 정사각형 픽셀 크기예요.
export function AvatarIcon({
  category,
  style,
  size = 64,
  backgroundColor = "#fff8e6",
}: {
  category: AvatarCategory;
  style: AvatarStyle;
  size?: number;
  backgroundColor?: string | null;
}) {
  const Render =
    category === "person"
      ? PERSON_RENDERERS[style as PersonStyle]
      : FOOD_RENDERERS[style as FoodStyle];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${avatarLabel({ category, style })} 아바타`}
    >
      {backgroundColor && <circle cx="50" cy="50" r="50" fill={backgroundColor} />}
      <Render />
    </svg>
  );
}
