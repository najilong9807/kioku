import { useId, type ReactElement } from "react";
import { THEME_YELLOW_BG } from "../theme";

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

// 사람 캐릭터의 "기본형"이에요. 여기 있는 20개는 각각 완전히 다른
// 헤어스타일/액세서리로 그려져요. 아래 PERSON_STYLES에서는 이 기본형에 더해,
// 각 기본형마다 뺨에 별 스티커를 붙인 "_star" 배리에이션을 하나씩 더 만들어서
// 총 40개(기본 20 + 스티커 20)를 구성해요.
const PERSON_BASE_STYLES = [
  "short_black",
  "bun_brown",
  "curly_afro",
  "long_wavy",
  "bald_glasses",
  "twintails",
  "cap",
  "silver_short",
  "ponytail",
  "bangs_bob",
  "beanie",
  "headband_bow",
  "mohawk",
  "undercut",
  "flower_crown",
  "round_glasses",
  "long_straight",
  "perm_curl",
  "buzzcut",
  "hairpin",
  "bucket_hat",
  "side_braid",
  "side_swept",
  "headphones",
  "beret",
  "ringlet_curls",
  "layered_cut",
  "micro_bangs",
  "high_ponytail",
  "sweatband",
  "side_ponytail",
  "pompom_beanie",
  "glasses_mask",
  "beard",
  "slicked_earring",
  "quiff",
  "victory_rolls",
  "mullet",
  "cat_ears_hood",
  "turban",
] as const;
type PersonBaseStyle = (typeof PERSON_BASE_STYLES)[number];

export const PERSON_STYLES = [
  ...PERSON_BASE_STYLES,
  ...PERSON_BASE_STYLES.map((style) => `${style}_star` as const),
] as const;
export type PersonStyle = (typeof PERSON_STYLES)[number];

const PERSON_BASE_LABELS: Record<PersonBaseStyle, string> = {
  short_black: "단발머리",
  bun_brown: "쪽머리",
  curly_afro: "곱슬머리",
  long_wavy: "웨이브 긴머리",
  bald_glasses: "안경",
  twintails: "양갈래",
  cap: "모자",
  silver_short: "은발머리",
  ponytail: "포니테일",
  bangs_bob: "앞머리 단발",
  beanie: "비니",
  headband_bow: "리본 헤어밴드",
  mohawk: "모히칸",
  undercut: "언더컷",
  flower_crown: "꽃관",
  round_glasses: "동그란 안경",
  long_straight: "긴 생머리",
  perm_curl: "파마머리",
  buzzcut: "버즈컷",
  hairpin: "헤어핀",
  bucket_hat: "버킷햇",
  side_braid: "땋은머리",
  side_swept: "사이드 스웹",
  headphones: "헤드폰",
  beret: "베레모",
  ringlet_curls: "링렛 컬",
  layered_cut: "레이어드 컷",
  micro_bangs: "마이크로 뱅",
  high_ponytail: "하이 포니",
  sweatband: "헤어밴드",
  side_ponytail: "사이드 포니",
  pompom_beanie: "폼폼 비니",
  glasses_mask: "안경 마스크",
  beard: "수염",
  slicked_earring: "슬릭백",
  quiff: "퀴프",
  victory_rolls: "빅토리롤",
  mullet: "울프컷",
  cat_ears_hood: "고양이 후드",
  turban: "터번",
};

export const PERSON_LABELS: Record<PersonStyle, string> = {
  ...PERSON_BASE_LABELS,
  ...(Object.fromEntries(
    PERSON_BASE_STYLES.map((style) => [
      `${style}_star`,
      `${PERSON_BASE_LABELS[style]} (별 스티커)`,
    ]),
  ) as Record<`${PersonBaseStyle}_star`, string>),
};

// 음식 캐릭터의 "기본형"이에요. 여기 있는 20개는 각각 완전히 다른 소재로
// 그려져요. 아래 FOOD_STYLES에서는 이 기본형에 더해, 각 기본형마다 색조만 다른
// "_special" 배리에이션을 하나씩 더 만들어서 총 40개(기본 20 + 컬러 20)를
// 구성해요.
const FOOD_BASE_STYLES = [
  "onigiri",
  "mandu",
  "donut",
  "sushi",
  "bungeoppang",
  "gimbap",
  "tteokbokki",
  "ramen",
  "naengmyeon",
  "samgyeopsal",
  "hotteok",
  "dimsum",
  "cake",
  "icecream",
  "tteok",
  "mandu_guk",
  "jjajangmyeon",
  "bibimbap",
  "eomuk",
  "twigim",
  "chicken_drumstick",
  "corn",
  "salt_bread",
  "corndog",
  "churros",
  "macaron",
  "pancake",
  "inari",
  "sandwich",
  "steak",
  "strawberry",
  "watermelon",
  "croffle",
  "chocolate_bar",
  "popcorn",
  "iced_latte",
  "fries",
  "roll_cake",
] as const;
type FoodBaseStyle = (typeof FOOD_BASE_STYLES)[number];

export const FOOD_STYLES = [
  ...FOOD_BASE_STYLES,
  ...FOOD_BASE_STYLES.map((style) => `${style}_special` as const),
] as const;
export type FoodStyle = (typeof FOOD_STYLES)[number];

const FOOD_BASE_LABELS: Record<FoodBaseStyle, string> = {
  onigiri: "주먹밥",
  mandu: "만두",
  donut: "도넛",
  sushi: "초밥",
  bungeoppang: "붕어빵",
  gimbap: "김밥",
  tteokbokki: "떡볶이",
  ramen: "라면",
  naengmyeon: "냉면",
  samgyeopsal: "삼겹살",
  hotteok: "호떡",
  dimsum: "딤섬",
  cake: "케이크",
  icecream: "아이스크림",
  tteok: "떡",
  mandu_guk: "만둣국",
  jjajangmyeon: "짜장면",
  bibimbap: "비빔밥",
  eomuk: "어묵꼬치",
  twigim: "튀김",
  chicken_drumstick: "치킨다리",
  corn: "옥수수",
  salt_bread: "소금빵",
  corndog: "핫도그",
  churros: "츄러스",
  macaron: "마카롱",
  pancake: "팬케이크",
  inari: "유부초밥",
  sandwich: "샌드위치",
  steak: "스테이크",
  strawberry: "딸기",
  watermelon: "수박",
  croffle: "크로플",
  chocolate_bar: "초코바",
  popcorn: "팝콘",
  iced_latte: "아이스라떼",
  fries: "감자튀김",
  roll_cake: "롤케이크",
};

export const FOOD_LABELS: Record<FoodStyle, string> = {
  ...FOOD_BASE_LABELS,
  ...(Object.fromEntries(
    FOOD_BASE_STYLES.map((style) => [
      `${style}_special`,
      `${FOOD_BASE_LABELS[style]} 스페셜`,
    ]),
  ) as Record<`${FoodBaseStyle}_special`, string>),
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

function PersonPonytail() {
  return (
    <g>
      <path
        d="M 78 40 Q 96 46 92 68 Q 88 84 74 90 Q 84 70 74 52 Z"
        fill="#4a2f1f"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="72" y="38" width="9" height="7" rx="3" fill="#ff8fa3" stroke={INK} strokeWidth="1.5" />
      <PersonHead skin="#e8b088" />
      <path
        d="M 17 44 Q 19 15 50 15 Q 81 15 83 44 Q 68 30 50 30 Q 32 30 17 44 Z"
        fill="#4a2f1f"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonBangsBob() {
  return (
    <g>
      <path
        d="M 15 50 Q 12 78 22 90 L 30 90 Q 22 74 24 52 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M 85 50 Q 88 78 78 90 L 70 90 Q 78 74 76 52 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 16 46 Q 18 15 50 15 Q 82 15 84 46 Q 68 32 50 32 Q 32 32 16 46 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M 30 40 L 33 52 M 42 38 L 44 51 M 58 38 L 56 51 M 70 40 L 67 52" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
      <PersonFace />
    </g>
  );
}

function PersonBeanie() {
  return (
    <g>
      <PersonHead skin="#c98a5e" />
      <path
        d="M 15 44 Q 17 10 50 10 Q 83 10 85 44 Q 68 30 50 30 Q 32 30 15 44 Z"
        fill="#5a7d63"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="14" y="38" width="72" height="12" rx="6" fill="#456b4d" stroke={INK} strokeWidth="2.5" />
      <circle cx="50" cy="12" r="5" fill="#fffef7" stroke={INK} strokeWidth="2" />
      <PersonFace />
    </g>
  );
}

function PersonHeadbandBow() {
  return (
    <g>
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 17 46 Q 20 14 50 14 Q 80 14 83 46 Q 70 34 50 34 Q 30 34 17 46 Z"
        fill="#935e35"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="16" y="30" width="68" height="8" rx="4" fill="#ff6f91" stroke={INK} strokeWidth="2" />
      <g transform="translate(78, 26)">
        <polygon points="0,0 -10,-7 -10,7" fill="#ff6f91" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <polygon points="0,0 10,-7 10,7" fill="#ff6f91" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="0" cy="0" r="3" fill="#e0483f" stroke={INK} strokeWidth="1.5" />
      </g>
      <PersonFace />
    </g>
  );
}

function PersonMohawk() {
  return (
    <g>
      <PersonHead skin="#e8b088" />
      <polygon
        points="40,10 60,10 56,32 44,32"
        fill="#ff4f6e"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M 44 20 L 38 14 M 56 20 L 62 14 M 47 12 L 44 6 M 53 12 L 56 6" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <PersonFace />
    </g>
  );
}

function PersonUndercut() {
  return (
    <g>
      <PersonHead skin="#c98a5e" />
      <path d="M 18 50 Q 18 40 24 34 L 30 50 Z" fill="#c98a5e" />
      <path
        d="M 22 40 Q 26 14 50 14 Q 74 14 78 40 Q 64 26 50 26 Q 36 26 22 40 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M 20 40 Q 22 32 28 28" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      <PersonFace />
    </g>
  );
}

function PersonFlowerCrown() {
  return (
    <g>
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 17 46 Q 19 16 50 16 Q 81 16 83 46 Q 68 32 50 32 Q 32 32 17 46 Z"
        fill="#935e35"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {[22, 38, 50, 62, 78].map((x, i) => (
        <g key={x} transform={`translate(${x}, ${18 - (i % 2 === 0 ? 0 : 4)})`}>
          <circle cx="-4" cy="0" r="4" fill="#ff8fa3" stroke={INK} strokeWidth="1.4" />
          <circle cx="4" cy="0" r="4" fill="#ff8fa3" stroke={INK} strokeWidth="1.4" />
          <circle cx="0" cy="-4" r="4" fill="#ff8fa3" stroke={INK} strokeWidth="1.4" />
          <circle cx="0" cy="4" r="4" fill="#ff8fa3" stroke={INK} strokeWidth="1.4" />
          <circle cx="0" cy="0" r="3" fill="#f4d35e" stroke={INK} strokeWidth="1.2" />
        </g>
      ))}
      <PersonFace />
    </g>
  );
}

function PersonRoundGlasses() {
  return (
    <g>
      <PersonHead skin="#e8b088" />
      <path
        d="M 17 46 Q 20 14 50 14 Q 80 14 83 46 Q 70 34 50 34 Q 30 34 17 46 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M 32 32 L 34 40 M 44 30 L 45 40 M 56 30 L 55 40 M 68 32 L 66 40" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
      <PersonFace />
      <g fill="none" stroke={INK} strokeWidth="2.4">
        <circle cx="42" cy="56" r="8" />
        <circle cx="58" cy="56" r="8" />
        <path d="M 50 56 L 50 56" />
        <path d="M 34 56 L 29 54" strokeLinecap="round" />
        <path d="M 66 56 L 71 54" strokeLinecap="round" />
      </g>
    </g>
  );
}

function PersonLongStraight() {
  return (
    <g>
      <path
        d="M 14 42 Q 10 78 18 94 L 26 94 Q 20 76 22 50 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M 86 42 Q 90 78 82 94 L 74 94 Q 80 76 78 50 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 16 46 Q 18 14 50 14 Q 82 14 84 46 Q 68 30 50 30 Q 32 30 16 46 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonPermCurl() {
  return (
    <g>
      <path
        d="M 14 40 Q 6 52 14 62 Q 8 72 16 84 Q 20 74 16 64 Q 22 56 16 48 Z"
        fill="#935e35"
        stroke={INK}
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <path
        d="M 86 40 Q 94 52 86 62 Q 92 72 84 84 Q 80 74 84 64 Q 78 56 84 48 Z"
        fill="#935e35"
        stroke={INK}
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <PersonHead skin="#e8b088" />
      <path
        d="M 17 44 Q 19 15 50 15 Q 81 15 83 44 Q 68 30 50 30 Q 32 30 17 44 Z"
        fill="#935e35"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonBuzzcut() {
  return (
    <g>
      <PersonHead skin="#c98a5e" />
      <path
        d="M 18 42 Q 20 16 50 16 Q 80 16 82 42 Q 68 28 50 28 Q 32 28 18 42 Z"
        fill="#3a3a3a"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M 26 30 L 24 24 M 36 24 L 35 18 M 50 22 L 50 16 M 64 24 L 65 18 M 74 30 L 76 24"
        stroke="#3a3a3a"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonHairpin() {
  return (
    <g>
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 17 46 Q 20 14 50 14 Q 80 14 83 46 Q 70 34 50 34 Q 30 34 17 46 Z"
        fill="#4a2f1f"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <g transform="translate(30, 24) rotate(-20)">
        <rect x="-8" y="-2.5" width="16" height="5" rx="2.5" fill="#4e8cff" stroke={INK} strokeWidth="1.4" />
      </g>
      <g transform="translate(66, 22) rotate(15)">
        <rect x="-8" y="-2.5" width="16" height="5" rx="2.5" fill="#ff6f91" stroke={INK} strokeWidth="1.4" />
      </g>
      <PersonFace />
    </g>
  );
}

function PersonBucketHat() {
  // 버킷햇: 챙이 앞쪽만 있는 cap과 달리, 챙이 머리 전체를 360도로 둘러싸요.
  return (
    <g>
      <PersonHead skin="#e8b088" />
      <ellipse cx="50" cy="40" rx="42" ry="10" fill="#6b8f71" stroke={INK} strokeWidth="3" />
      <path
        d="M 20 40 Q 22 12 50 12 Q 78 12 80 40 Q 65 30 50 30 Q 35 30 20 40 Z"
        fill="#7fa787"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonSideBraid() {
  // 땋은머리: 지그재그 세그먼트로 한쪽 어깨 위에 늘어뜨려요. 뒤로 넘긴
  // ponytail과 달리 몸 앞쪽으로, 한쪽으로만 치우쳐 내려와요.
  return (
    <g>
      <PersonHead skin="#e8b088" />
      <path
        d="M 17 44 Q 19 15 50 15 Q 81 15 83 44 Q 68 30 50 30 Q 32 30 17 44 Z"
        fill="#4a2f1f"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 66 46 L 78 54 L 68 62 L 80 70 L 70 78 L 82 86"
        fill="none"
        stroke="#4a2f1f"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="76" y="84" width="10" height="6" rx="3" fill="#ff8fa3" stroke={INK} strokeWidth="1.4" />
      <PersonFace />
    </g>
  );
}

function PersonSideSwept() {
  // 사이드 스웹: 앞머리를 한쪽으로 완전히 쓸어넘긴 비대칭 실루엣이에요. 반대쪽은
  // 머리숱이 적어 보이게 비워둬서, 좌우가 대칭인 다른 헤어스타일들과 뚜렷이 달라요.
  return (
    <g>
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 16 44 Q 20 14 52 14 Q 74 14 80 34 Q 60 22 44 30 Q 30 36 34 56 Q 22 52 16 44 Z"
        fill="#935e35"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonHeadphones() {
  // 헤드폰: 정수리를 가로지르는 굵은 아치 밴드 + 양쪽 귀의 큰 원형 이어컵.
  // 다른 헤어스타일들과 달리 머리 위를 연결하는 아치가 실루엣의 핵심이에요.
  return (
    <g>
      <PersonHead skin="#c98a5e" />
      <path
        d="M 16 50 Q 10 10 50 8 Q 90 10 84 50"
        fill="none"
        stroke="#2b2b2b"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse cx="16" cy="54" rx="8" ry="12" fill="#2b2b2b" stroke={INK} strokeWidth="2.2" />
      <ellipse cx="84" cy="54" rx="8" ry="12" fill="#2b2b2b" stroke={INK} strokeWidth="2.2" />
      <ellipse cx="16" cy="54" rx="4" ry="7" fill="#ff6f91" />
      <ellipse cx="84" cy="54" rx="4" ry="7" fill="#ff6f91" />
      <PersonFace />
    </g>
  );
}

function PersonBeret() {
  // 베레모: 다른 모자들과 달리 납작하고 한쪽으로 기울어진 원반 모양 + 꼭지 매듭.
  return (
    <g>
      <PersonHead skin="#ffe0c2" />
      <ellipse
        cx="46"
        cy="22"
        rx="34"
        ry="16"
        fill="#8a3b3b"
        stroke={INK}
        strokeWidth="3"
        transform="rotate(-8 46 22)"
      />
      <circle cx="66" cy="10" r="4" fill="#8a3b3b" stroke={INK} strokeWidth="2" />
      <PersonFace />
    </g>
  );
}

function PersonRingletCurls() {
  // 링렛 컬: 양옆으로 늘어지는 나선형 지그재그 컬. long_wavy의 매끄러운 곡선,
  // curly_afro의 둥근 헤일로와 달리 촘촘한 S자 꼬임이 반복돼요.
  return (
    <g>
      <path
        d="M 14 42 Q 6 48 14 54 Q 6 60 14 66 Q 6 72 14 78 Q 6 84 16 88"
        fill="none"
        stroke="#935e35"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M 86 42 Q 94 48 86 54 Q 94 60 86 66 Q 94 72 86 78 Q 94 84 84 88"
        fill="none"
        stroke="#935e35"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 16 46 Q 18 14 50 14 Q 82 14 84 46 Q 68 30 50 30 Q 32 30 16 46 Z"
        fill="#935e35"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonLayeredCut() {
  // 레이어드 컷: 길이가 다른 층이 계단식으로 잘린 지그재그 윤곽이에요.
  return (
    <g>
      <path
        d="M 14 44 L 10 62 L 20 58 L 16 74 L 26 68 L 22 82"
        fill="none"
        stroke="#4a2f1f"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 86 44 L 90 62 L 80 58 L 84 74 L 74 68 L 78 82"
        fill="none"
        stroke="#4a2f1f"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <PersonHead skin="#e8b088" />
      <path
        d="M 17 44 Q 19 15 50 15 Q 81 15 83 44 Q 68 30 50 30 Q 32 30 17 44 Z"
        fill="#4a2f1f"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonMicroBangs() {
  // 마이크로 뱅: 머리숱 자체가 정수리 부근에만 짧게 있어서(short_black보다
  // 훨씬 적은 면적) 이마/옆머리 피부가 넓게 드러나고, 그 아래 짧은 일자
  // 앞머리 띠가 따로 붙어요. 덮는 면적 차이가 커서 한눈에 다른 헤어스타일로
  // 읽혀요.
  return (
    <g>
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 22 30 Q 26 15 50 15 Q 74 15 78 30 Q 64 22 50 22 Q 36 22 22 30 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="36" y="26" width="28" height="7" rx="2.5" fill="#2b2b2b" stroke={INK} strokeWidth="1.6" />
      <PersonFace />
    </g>
  );
}

function PersonHighPonytail() {
  // 하이 포니: 정수리에서 부풀린 뒤 위쪽으로 솟구치는 포니테일. 기존 ponytail은
  // 옆/뒤쪽 낮은 위치에서 늘어지는 형태라 붙는 위치와 방향이 뚜렷이 달라요.
  return (
    <g>
      <ellipse cx="50" cy="14" rx="16" ry="10" fill="#4a2f1f" stroke={INK} strokeWidth="2.5" />
      <path
        d="M 62 10 Q 84 8 82 30 Q 80 46 66 48 Q 76 30 62 14 Z"
        fill="#4a2f1f"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <PersonHead skin="#e8b088" />
      <path
        d="M 18 42 Q 20 18 50 18 Q 80 18 82 42 Q 66 26 50 26 Q 34 26 18 42 Z"
        fill="#4a2f1f"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonSweatband() {
  // 헤어밴드: 짧은 머리 + 이마를 가로지르는 두꺼운 스포츠 밴드.
  return (
    <g>
      <PersonHead skin="#c98a5e" />
      <path
        d="M 18 42 Q 20 16 50 16 Q 80 16 82 42 Q 66 28 50 28 Q 34 28 18 42 Z"
        fill="#3a3a3a"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="16" y="34" width="68" height="10" rx="5" fill="#4e8cff" stroke={INK} strokeWidth="2.2" />
      <PersonFace />
    </g>
  );
}

function PersonSidePonytail() {
  // 사이드 포니: 한쪽 어깨 앞으로 매끄럽게 늘어지는 다발머리(지그재그 없음).
  // 땋은머리(side_braid)와 달리 세그먼트 구분 없는 매끈한 하나의 덩어리예요.
  return (
    <g>
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 17 44 Q 19 15 50 15 Q 81 15 83 44 Q 68 30 50 30 Q 32 30 17 44 Z"
        fill="#935e35"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 68 48 Q 82 54 78 70 Q 76 84 64 90 Q 74 74 66 60 Z"
        fill="#935e35"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="64" y="46" width="10" height="7" rx="3" fill="#ff8fa3" stroke={INK} strokeWidth="1.4" />
      <PersonFace />
    </g>
  );
}

function PersonPompomBeanie() {
  // 폼폼 비니: 꼭대기에 큼직한 방울(폼폼)이 달린 비니. 기존 beanie는 작은
  // 단추 정도라 이 큰 방울이 실루엣을 뚜렷이 다르게 만들어요.
  return (
    <g>
      <PersonHead skin="#e8b088" />
      <path
        d="M 15 44 Q 17 10 50 10 Q 83 10 85 44 Q 68 30 50 30 Q 32 30 15 44 Z"
        fill="#c1445e"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="14" y="38" width="72" height="12" rx="6" fill="#9e3550" stroke={INK} strokeWidth="2.5" />
      <circle cx="50" cy="8" r="9" fill="#fdf6e6" stroke={INK} strokeWidth="2.2" />
      <PersonFace />
    </g>
  );
}

function PersonGlassesMask() {
  // 안경 마스크: 얼굴 아래쪽 절반을 마스크가 가려요. 기존 PersonFace()를
  // 그대로 쓰지 않고 눈만 직접 그린 뒤 마스크로 입/볼을 덮어서, 실루엣뿐 아니라
  // 얼굴이 보이는 영역 자체가 달라져요.
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
      <ellipse cx="42" cy="56" rx="2.6" ry="3.4" fill={INK} />
      <ellipse cx="58" cy="56" rx="2.6" ry="3.4" fill={INK} />
      <g fill="none" stroke={INK} strokeWidth="2.4">
        <circle cx="42" cy="56" r="7.5" />
        <circle cx="58" cy="56" r="7.5" />
        <path d="M 49.5 56 L 50.5 56" />
      </g>
      <path
        d="M 24 62 Q 50 78 76 62 L 76 80 Q 50 94 24 80 Z"
        fill="#dbe4ea"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </g>
  );
}

function PersonBeard() {
  // 수염: 턱과 입 주변을 덮는 수염이 얼굴 아래쪽 윤곽 자체를 넓혀요. 입은
  // PersonFace() 대신 눈/볼만 직접 그려서 수염 아래 감춰지게 했어요.
  return (
    <g>
      <PersonHead skin="#c98a5e" />
      <path
        d="M 18 42 Q 20 16 50 16 Q 80 16 82 42 Q 66 28 50 28 Q 34 28 18 42 Z"
        fill="#3a2b22"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M 26 58 Q 24 78 50 84 Q 76 78 74 58 Q 66 72 50 72 Q 34 72 26 58 Z"
        fill="#3a2b22"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <ellipse cx="42" cy="58" rx="2.6" ry="3.4" fill={INK} />
      <ellipse cx="58" cy="58" rx="2.6" ry="3.4" fill={INK} />
      <circle cx="32" cy="65" r="4.2" fill={BLUSH} opacity="0.7" />
      <circle cx="68" cy="65" r="4.2" fill={BLUSH} opacity="0.7" />
    </g>
  );
}

function PersonSlickedEarring() {
  // 슬릭백: 부피 없이 머리에 딱 붙은 매끈한 헤어 + 귀 옆에 작은 귀걸이 액센트.
  return (
    <g>
      <PersonHead skin="#e8b088" />
      <path
        d="M 17 40 Q 22 14 50 14 Q 78 14 83 40 Q 78 24 50 22 Q 22 24 17 40 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="60" r="3" fill="#f4d35e" stroke={INK} strokeWidth="1.2" />
      <path d="M 18 63 L 18 70" stroke="#f4d35e" strokeWidth="1.6" strokeLinecap="round" />
      <PersonFace />
    </g>
  );
}

function PersonQuiff() {
  // 퀴프: 앞머리가 위로 말려 올라가는 볼륨감 있는 웨이브 실루엣이에요.
  return (
    <g>
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 30 34 Q 24 14 44 8 Q 58 4 68 16 Q 76 26 66 34 Q 72 20 56 16 Q 42 12 36 24 Q 32 30 30 34 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 18 42 Q 20 30 32 30 Q 44 30 46 42 Q 34 38 26 40 Q 20 42 18 42 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M 54 40 Q 66 32 82 42 Q 78 44 68 42 Q 60 40 54 40 Z"
        fill="#2b2b2b"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonVictoryRolls() {
  // 빅토리 롤: 앞머리 양쪽을 둥글게 만 롤 두 개가 상단에 나란히 있어요.
  return (
    <g>
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 17 46 Q 19 22 50 22 Q 81 22 83 46 Q 70 36 50 36 Q 30 36 17 46 Z"
        fill="#935e35"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="18" r="11" fill="#935e35" stroke={INK} strokeWidth="2.4" />
      <circle cx="66" cy="18" r="11" fill="#935e35" stroke={INK} strokeWidth="2.4" />
      <circle cx="34" cy="18" r="4" fill="none" stroke={INK} strokeWidth="1.6" />
      <circle cx="66" cy="18" r="4" fill="none" stroke={INK} strokeWidth="1.6" />
      <PersonFace />
    </g>
  );
}

function PersonMullet() {
  // 울프컷(샤기): 정수리는 짧고, 머리 옆/뒤에서 아래로 길게 늘어지는 가는
  // 머리카락 가닥들이 머리 원 밖으로 뚜렷하게 삐져나와요. 얼굴을 가로지르지
  // 않도록 가닥을 양옆(20/80)과 뒤쪽 중앙에 배치하고, 머리 위에 덧그려서
  // 가려지지 않게 했어요.
  return (
    <g>
      <PersonHead skin="#c98a5e" />
      <path
        d="M 18 42 Q 20 16 50 16 Q 80 16 82 42 Q 66 28 50 28 Q 34 28 18 42 Z"
        fill="#4a2f1f"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 20 50 Q 14 70 20 94 M 50 56 Q 48 76 52 98 M 80 50 Q 86 70 80 94"
        fill="none"
        stroke="#4a2f1f"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonCatEarsHood() {
  // 고양이 후드: 정수리 위로 삐죽 솟은 삼각형 고양이 귀 두 개가 핵심이에요.
  return (
    <g>
      <polygon points="26,20 38,4 42,26" fill="#f4a6b8" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <polygon points="74,20 62,4 58,26" fill="#f4a6b8" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <PersonHead skin="#ffe0c2" />
      <path
        d="M 14 46 Q 16 12 50 12 Q 84 12 86 46 Q 68 26 50 26 Q 32 26 14 46 Z"
        fill="#f4a6b8"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <PersonFace />
    </g>
  );
}

function PersonTurban() {
  // 터번: 감아 두른 천 재질이라 머리카락 가닥이 전혀 없고, 표면에 가로 주름
  // 선만 있는 매끈한 돔 모양이에요.
  return (
    <g>
      <PersonHead skin="#8a5a3a" />
      <path
        d="M 15 44 Q 17 8 50 8 Q 83 8 85 44 Q 68 24 50 24 Q 32 24 15 44 Z"
        fill="#3f74d1"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 22 34 Q 50 42 78 34 M 20 24 Q 50 32 80 24"
        fill="none"
        stroke="#2f5aa8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="50" cy="10" r="4" fill="#f4d35e" stroke={INK} strokeWidth="1.6" />
      <PersonFace />
    </g>
  );
}

// 뺨 쪽에 작은 별 스티커를 붙이는 배리에이션이에요. 모든 사람 캐릭터가 머리
// 원(cx 50, cy 52, r 34) 기준을 공유해서, 이 위치는 어떤 헤어스타일과도 겹치지
// 않고 자연스럽게 붙어요.
function StarSticker() {
  return (
    <g transform="translate(74, 68)">
      <path
        d="M 0 -7 L 2.1 -2.1 L 7 -1.5 L 3.3 2 L 4.3 7 L 0 4.5 L -4.3 7 L -3.3 2 L -7 -1.5 L -2.1 -2.1 Z"
        fill="#ffc72c"
        stroke={INK}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </g>
  );
}

// 기본형 렌더러 위에 별 스티커만 덧그려서 "_star" 배리에이션을 만들어요.
// 기존 렌더러(Base)는 그대로 호출하기 때문에 기본형 모습은 전혀 바뀌지 않아요.
function withSticker(Base: () => ReactElement): () => ReactElement {
  return function StickerVariant() {
    return (
      <>
        <Base />
        <StarSticker />
      </>
    );
  };
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

function NaengmyeonBody() {
  // 스테인리스 그릇 + 국물 위 면발 물결 + 삶은 달걀 반쪽 + 오이 고명.
  return (
    <g>
      <ellipse cx="50" cy="42" rx="40" ry="10" fill="#c9ccd1" stroke={INK} strokeWidth="3" />
      <path
        d="M 10 42 Q 10 84 50 88 Q 90 84 90 42 Z"
        fill="#dde1e6"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 20 48 Q 28 42 36 48 T 52 48 T 68 48 T 82 48"
        fill="none"
        stroke="#f2d38a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <ellipse cx="68" cy="52" rx="9" ry="7" fill="#fffef7" stroke={INK} strokeWidth="2" />
      <circle cx="68" cy="52" r="3.8" fill="#f2a33c" />
      <rect x="24" y="49" width="12" height="4.5" rx="2" fill="#4a9a5a" />
      <FoodFace cx={42} cy={64} />
    </g>
  );
}

function SamgyeopsalBody() {
  // 불판 위 고기 세 장 + 아지랑이 김. 그릇형 캐릭터라 팔은 판 아래에 붙여요.
  return (
    <g>
      <ellipse cx="50" cy="58" rx="40" ry="27" fill="#43494f" stroke={INK} strokeWidth="3" />
      <ellipse cx="50" cy="58" rx="32" ry="20" fill="#5b636b" />
      {[[36, 48], [64, 48], [50, 68]].map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x - 13}
          y={y - 6}
          width="26"
          height="13"
          rx="5"
          fill="#e8a693"
          stroke={INK}
          strokeWidth="2.2"
        />
      ))}
      <path
        d="M 30 24 Q 26 16 32 10 M 50 22 Q 46 14 52 8 M 70 24 Q 66 16 72 10"
        fill="none"
        stroke="#c9ccd1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <StubArms y={82} spread={36} />
      <FoodFace cx={50} cy={84} />
    </g>
  );
}

function HotteokBody() {
  // 납작한 황금빛 호떡 + 그릴 자국 + 흘러내리는 시럽.
  return (
    <g>
      <ellipse cx="50" cy="56" rx="39" ry="30" fill="#d99a4e" stroke={INK} strokeWidth="3" />
      <ellipse cx="50" cy="52" rx="30" ry="22" fill="#e8b06a" />
      {[-16, 0, 16].map((dx) => (
        <path
          key={dx}
          d={`M ${50 + dx - 8} 40 Q ${50 + dx} 48 ${50 + dx - 8} 56`}
          fill="none"
          stroke="#b9782f"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      ))}
      <path
        d="M 34 66 Q 32 78 36 86 M 64 66 Q 66 78 62 86"
        fill="none"
        stroke="#a9631f"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <StubArms y={78} spread={34} />
      <FoodFace cx={50} cy={80} />
    </g>
  );
}

function DimsumBody() {
  // 대나무 찜기 바구니 + 그 위에 놓인 딤섬 세 알.
  return (
    <g>
      <path
        d="M 14 54 L 20 40 L 80 40 L 86 54 Z"
        fill="#e4c48a"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 14 54 Q 14 82 50 86 Q 86 82 86 54 Z"
        fill="#f0d9a8"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {[28, 44, 60, 76].map((x) => (
        <line key={x} x1={x} y1="54" x2={x} y2="82" stroke="#c9a966" />
      ))}
      {[32, 50, 68].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="34" rx="10" ry="8" fill="#fffef7" stroke={INK} strokeWidth="2.2" />
          <circle cx={x} cy="28" r="2" fill="#fffef7" stroke={INK} strokeWidth="1.6" />
        </g>
      ))}
      <FoodFace cx={50} cy={64} />
    </g>
  );
}

function CakeBody() {
  // 삼각형 케이크 조각 + 크림 층 + 체리 토핑.
  return (
    <g>
      <polygon
        points="22,84 50,24 78,84"
        fill="#f7c9d6"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <polygon points="30,84 50,44 70,84" fill="#fdeef2" />
      <rect x="18" y="78" width="64" height="8" rx="3" fill="#fffef7" stroke={INK} strokeWidth="2" />
      <circle cx="50" cy="30" r="7" fill="#e0483f" stroke={INK} strokeWidth="2" />
      <StubArms y={80} spread={30} />
      <FoodFace cx={50} cy={62} />
    </g>
  );
}

function IcecreamBody() {
  // 콘 + 물결 아이스크림 스쿱 두 단.
  return (
    <g>
      <polygon
        points="36,60 64,60 50,90"
        fill="#e0a85c"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 30 30 Q 30 16 50 16 Q 70 16 70 30 Q 70 42 50 46 Q 30 42 30 30 Z"
        fill="#ffe9f0"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 32 46 Q 32 34 50 32 Q 68 34 68 46 Q 68 58 50 62 Q 32 58 32 46 Z"
        fill="#fff6f9"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <FoodFace cx={50} cy={44} />
    </g>
  );
}

function TteokBody() {
  // 가래떡 세 줄이 나란히 놓인 모습(단면에 살짝 콩고물).
  return (
    <g>
      {[26, 50, 74].map((x) => (
        <rect
          key={x}
          x={x - 11}
          y="20"
          width="22"
          height="60"
          rx="11"
          fill="#fffef7"
          stroke={INK}
          strokeWidth="3"
        />
      ))}
      <ellipse cx="26" cy="24" rx="9" ry="5" fill="#f2e8c9" stroke={INK} strokeWidth="2" />
      <ellipse cx="74" cy="24" rx="9" ry="5" fill="#f2e8c9" stroke={INK} strokeWidth="2" />
      <StubArms y={78} spread={34} />
      <FoodFace cx={50} cy={78} />
    </g>
  );
}

function ManduGukBody() {
  // 만둣국: 국물 그릇 + 동동 뜬 만두 세 개 + 지단/파 고명.
  return (
    <g>
      <path
        d="M 10 50 Q 10 86 50 88 Q 90 86 90 50 Z"
        fill="#fdf6e6"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <ellipse cx="50" cy="50" rx="40" ry="10" fill="#f4e0ab" stroke={INK} strokeWidth="3" />
      {[32, 50, 68].map((x) => (
        <ellipse
          key={x}
          cx={x}
          cy={x === 50 ? 40 : 46}
          rx="11"
          ry="8"
          fill="#f6e3c2"
          stroke={INK}
          strokeWidth="2.2"
        />
      ))}
      <rect x="20" y="52" width="10" height="3.5" rx="1.5" fill="#f2a33c" />
      <rect x="70" y="52" width="10" height="3.5" rx="1.5" fill="#3a8c4a" />
      <FoodFace cx={50} cy={68} />
    </g>
  );
}

function JjajangmyeonBody() {
  // 짜장면: 그릇 + 검은 자장소스 + 면발 물결 + 오이채.
  return (
    <g>
      <path
        d="M 12 52 Q 12 86 50 88 Q 88 86 88 52 Z"
        fill="#fdf6e6"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <ellipse cx="50" cy="52" rx="38" ry="10" fill="#3b2b23" stroke={INK} strokeWidth="3" />
      <path
        d="M 22 50 Q 28 44 34 50 T 46 50 T 58 50 T 70 50"
        fill="none"
        stroke="#f2d38a"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect x="30" y="45" width="11" height="4.5" rx="2" fill="#4a9a5a" transform="rotate(-15 35.5 47.25)" />
      <rect x="59" y="45" width="11" height="4.5" rx="2" fill="#4a9a5a" transform="rotate(15 64.5 47.25)" />
      <FoodFace cx={50} cy={68} />
    </g>
  );
}

function BibimbapBody() {
  // 돌솥 + 흰쌀밥 + 방사형으로 얹은 색색의 나물/달걀노른자.
  const petals: Array<{ angle: number; color: string }> = [
    { angle: -60, color: "#3a8c4a" },
    { angle: -20, color: "#e0483f" },
    { angle: 20, color: "#f2a33c" },
    { angle: 60, color: "#8a5a3a" },
    { angle: 100, color: "#c9a966" },
  ];
  return (
    <g>
      <ellipse cx="50" cy="58" rx="40" ry="27" fill="#4a4a4a" stroke={INK} strokeWidth="3" />
      <ellipse cx="50" cy="54" rx="32" ry="20" fill="#fffef7" stroke={INK} strokeWidth="2" />
      {petals.map((p) => (
        <ellipse
          key={p.angle}
          cx={50}
          cy={38}
          rx="7"
          ry="14"
          fill={p.color}
          opacity="0.9"
          transform={`rotate(${p.angle} 50 54)`}
        />
      ))}
      <circle cx="50" cy="54" r="7" fill="#f4d35e" stroke={INK} strokeWidth="1.6" />
      <StubArms y={78} spread={35} />
      <FoodFace cx={50} cy={80} />
    </g>
  );
}

function EomukBody() {
  // 어묵꼬치: 종이컵 + 꼬치에 꿴 물결 모양 어묵 3개.
  return (
    <g>
      <path
        d="M 20 50 L 24 88 L 76 88 L 80 50 Z"
        fill="#e8b463"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M 20 50 Q 50 58 80 50" fill="none" stroke={INK} strokeWidth="2.5" />
      {[35, 50, 65].map((x) => (
        <path
          key={x}
          d={`M ${x} 20 Q ${x - 6} 32 ${x} 44 Q ${x + 6} 56 ${x} 68`}
          fill="none"
          stroke="#f2d9a0"
          strokeWidth="9"
          strokeLinecap="round"
        />
      ))}
      <line x1="50" y1="12" x2="50" y2="70" stroke="#c9966b" strokeWidth="3" strokeLinecap="round" />
      <FoodFace cx={50} cy={72} />
    </g>
  );
}

function TwigimBody() {
  // 튀김 바구니 + 튀김옷 결이 있는 튀김 3개.
  return (
    <g>
      <path
        d="M 14 58 L 22 84 L 78 84 L 86 58 Z"
        fill="#e4c48a"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M 14 58 Q 50 68 86 58" fill="none" stroke={INK} strokeWidth="2.5" />
      {[
        [30, 44],
        [50, 38],
        [70, 46],
      ].map(([x, y]) => (
        <g key={x}>
          <ellipse cx={x} cy={y} rx="12" ry="16" fill="#f2c66b" stroke={INK} strokeWidth="2.4" />
          <path
            d={`M ${x - 6} ${y - 8} L ${x - 4} ${y + 8} M ${x} ${y - 10} L ${x} ${y + 9} M ${x + 6} ${y - 8} L ${x + 4} ${y + 8}`}
            stroke="#c99a3f"
            strokeWidth="1.4"
          />
        </g>
      ))}
      <FoodFace cx={50} cy={64} />
    </g>
  );
}

function ChickenDrumstickBody() {
  // 치킨 다리: 위쪽 통통한 살 부분(울퉁불퉁한 블롭) + 아래로 뻗은 얇은 뼈 손잡이.
  return (
    <g>
      <path
        d="M 26 34 Q 22 16 44 12 Q 66 8 74 28 Q 80 44 68 56 Q 74 64 66 68 Q 56 74 44 68 Q 30 62 26 48 Q 22 40 26 34 Z"
        fill="#e0a85c"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 44 66 L 40 92 Q 46 96 52 94 L 50 66 Z"
        fill="#fdf6e6"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <FoodFace cx={48} cy={38} />
    </g>
  );
}

function CornBody() {
  // 옥수수: 위아래로 갸름한 타원형 몸통 + 위쪽 초록 잎/수염 + 알갱이 텍스처.
  return (
    <g>
      <path
        d="M 50 10 Q 38 14 36 30 L 40 78 Q 40 90 50 92 Q 60 90 60 78 L 64 30 Q 62 14 50 10 Z"
        fill="#f4d35e"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {[24, 36, 48, 60, 72].map((y) => (
        <g key={y}>
          <circle cx="45" cy={y} r="2.4" fill="#e0483f" opacity="0.18" />
          <circle cx="55" cy={y} r="2.4" fill="#e0483f" opacity="0.18" />
        </g>
      ))}
      <path
        d="M 40 20 Q 30 14 26 4 M 60 20 Q 70 14 74 4"
        fill="none"
        stroke="#3a8c4a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <FoodFace cx={50} cy={50} />
    </g>
  );
}

function SaltBreadBody() {
  // 소금빵: 초승달처럼 휘어진 롤 + 나선형 결. 만두의 부채꼴 반달과 달리
  // 길게 늘어진 크루아상형 곡선이에요.
  return (
    <g>
      <path
        d="M 14 50 Q 10 20 40 14 Q 70 8 86 34 Q 92 50 80 62 Q 60 44 40 50 Q 20 56 14 50 Z"
        fill="#f2d9a0"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 30 30 Q 40 40 34 52 M 50 22 Q 58 34 50 46 M 68 26 Q 74 38 66 48"
        fill="none"
        stroke="#d9b56a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <FoodFace cx={42} cy={68} />
    </g>
  );
}

function CorndogBody() {
  // 핫도그(콘도그): 하나의 굵은 원기둥 + 아래 막대 손잡이 + 케찹 지그재그.
  // 떡(tteok)의 가늘고 곧은 3개 기둥과 달리 두껍고 하나뿐이에요.
  return (
    <g>
      <rect x="32" y="10" width="36" height="64" rx="18" fill="#f2c66b" stroke={INK} strokeWidth="3" />
      <path
        d="M 38 24 Q 50 18 62 24 M 38 40 Q 50 34 62 40 M 38 56 Q 50 50 62 56"
        fill="none"
        stroke="#e0483f"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="44" y="74" width="12" height="20" rx="4" fill="#c99a3f" stroke={INK} strokeWidth="2.5" />
      <FoodFace cx={50} cy={44} />
    </g>
  );
}

function ChurrosBody() {
  // 츄러스: 종이컵에 꽂힌 여러 개의 곧은 홈 무늬 막대. 어묵꼬치의 물결
  // 모양 하나와 달리, 직선 막대 여러 개가 부채꼴로 벌어져요.
  return (
    <g>
      <path
        d="M 24 60 L 30 90 L 70 90 L 76 60 Z"
        fill="#e8b463"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {[
        [38, -8],
        [50, 0],
        [62, 8],
      ].map(([x, rot]) => (
        <g key={x} transform={`rotate(${rot} ${x} 60)`}>
          <rect x={x - 5} y="10" width="10" height="52" rx="5" fill="#e0a85c" stroke={INK} strokeWidth="2.4" />
          <path d={`M ${x - 2} 16 L ${x - 2} 56 M ${x + 2} 16 L ${x + 2} 56`} stroke="#b9782f" strokeWidth="1.2" />
        </g>
      ))}
      <FoodFace cx={50} cy={76} />
    </g>
  );
}

function MacaronBody() {
  // 마카롱: 위아래 둥근 셸 사이에 크림 층이 낀 UFO 모양.
  return (
    <g>
      <ellipse cx="50" cy="34" rx="34" ry="15" fill="#f4a6c8" stroke={INK} strokeWidth="3" />
      <rect x="18" y="42" width="64" height="12" fill="#fdeef2" stroke={INK} strokeWidth="2" />
      <ellipse cx="50" cy="62" rx="34" ry="15" fill="#f4a6c8" stroke={INK} strokeWidth="3" />
      <StubArms y={78} spread={34} />
      <FoodFace cx={50} cy={34} />
    </g>
  );
}

function PancakeBody() {
  // 팬케이크: 넓고 납작한 원판이 층층이 쌓인 모양. 떡의 가늘고 긴 기둥과
  // 달리 폭이 넓고 낮게 쌓여요.
  return (
    <g>
      <ellipse cx="50" cy="76" rx="36" ry="10" fill="#e0a85c" stroke={INK} strokeWidth="3" />
      <ellipse cx="50" cy="60" rx="32" ry="9" fill="#e8b463" stroke={INK} strokeWidth="3" />
      <ellipse cx="50" cy="45" rx="28" ry="8" fill="#f2c66b" stroke={INK} strokeWidth="3" />
      <rect x="42" y="30" width="16" height="10" rx="3" fill="#f4d35e" stroke={INK} strokeWidth="2" />
      <path
        d="M 30 40 Q 40 48 50 42 Q 60 50 70 40"
        fill="none"
        stroke="#c9862e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <FoodFace cx={50} cy={60} />
    </g>
  );
}

function InariBody() {
  // 유부초밥: 각진 주먹밥 삼각형과 달리, 둥글게 부풀어오른 주머니 모양이고
  // 위쪽 트인 입구로 밥이 살짝 보여요.
  return (
    <g>
      <path
        d="M 50 20 Q 24 30 20 60 Q 18 82 50 88 Q 82 82 80 60 Q 76 30 50 20 Z"
        fill="#c9862e"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <ellipse cx="50" cy="30" rx="22" ry="8" fill="#fffef7" stroke={INK} strokeWidth="2.2" />
      <StubArms y={78} spread={34} />
      <FoodFace cx={50} cy={58} />
    </g>
  );
}

function SandwichBody() {
  // 샌드위치: 대각선으로 자른 삼각형 두 쪽이 가운데서 맞닿는 나비 넥타이
  // 모양. 주먹밥/케이크의 온전한 삼각형 하나와는 뚜렷이 달라요.
  return (
    <g>
      <polygon points="12,18 46,50 12,82" fill="#f2d9a0" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <polygon points="88,18 54,50 88,82" fill="#f2d9a0" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <rect x="8" y="46" width="84" height="8" fill="#3a8c4a" opacity="0.85" />
      <FoodFace cx={29} cy={50} />
    </g>
  );
}

function SteakBody() {
  // 스테이크: 나무 도마 위 두꺼운 고기 한 덩어리 + 격자 그릴 자국.
  // 삼겹살의 얇고 겹친 살점 여러 장과 달리 두꺼운 단일 블록이에요.
  return (
    <g>
      <rect x="10" y="60" width="80" height="14" rx="4" fill="#c9966b" stroke={INK} strokeWidth="2.5" />
      <rect x="22" y="24" width="56" height="42" rx="14" fill="#a9483f" stroke={INK} strokeWidth="3" />
      <path
        d="M 30 34 L 70 50 M 30 50 L 70 34 M 30 42 L 46 30 M 54 58 L 70 46"
        stroke="#7a2c26"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <FoodFace cx={50} cy={46} />
    </g>
  );
}

function StrawberryBody() {
  // 딸기: 뾰족한 아래쪽 + 씨앗 점무늬 + 위쪽 초록 꼭지 잎.
  return (
    <g>
      <path
        d="M 50 30 Q 20 34 22 58 Q 24 82 50 92 Q 76 82 78 58 Q 80 34 50 30 Z"
        fill="#e0483f"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {[
        [38, 48],
        [56, 46],
        [34, 64],
        [52, 66],
        [66, 58],
        [44, 78],
        [60, 74],
      ].map(([x, y]) => (
        <ellipse
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          rx="2"
          ry="2.6"
          fill="#ffe27a"
          transform={`rotate(${((x * 13) % 40) - 20} ${x} ${y})`}
        />
      ))}
      <path
        d="M 34 28 L 42 16 L 50 26 L 58 14 L 66 28"
        fill="#3a8c4a"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <FoodFace cx={50} cy={58} />
    </g>
  );
}

function WatermelonBody() {
  // 수박: 곧은 두 변이 만나는 뾰족한 꼭짓점 + 둥글게 휜 겉껍질 테두리.
  // 주먹밥의 대칭 직선 삼각형과 달리, 아래쪽 한 변이 완만한 곡선이에요.
  return (
    <g>
      <path d="M 50 16 L 18 82 Q 50 94 82 82 Z" fill="#e0483f" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M 18 82 Q 50 88 82 82 Q 50 92 18 82 Z" fill="#fffef7" />
      <path
        d="M 18 82 Q 50 98 82 82 Q 50 92 18 82 Z"
        fill="#3a8c4a"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {[
        [42, 48],
        [58, 48],
        [50, 64],
        [38, 70],
        [62, 70],
      ].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="2" ry="3" fill={INK} />
      ))}
      <FoodFace cx={50} cy={50} />
    </g>
  );
}

function CroffleBody() {
  // 크로플: 원판 전체에 와플 격자 무늬가 있어요. 도넛의 매끈한 표면과
  // 달리 표면 텍스처 자체가 실루엣의 특징이에요.
  const clipId = useId();
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="52" r="36" />
        </clipPath>
      </defs>
      <circle cx="50" cy="52" r="36" fill="#e0a85c" stroke={INK} strokeWidth="3" />
      <g clipPath={`url(#${clipId})`}>
        {[-20, -10, 0, 10, 20].map((d) => (
          <g key={d}>
            <line x1="10" y1={52 + d} x2="90" y2={52 + d} stroke="#b9782f" strokeWidth="2" />
            <line x1={50 + d} y1="10" x2={50 + d} y2="94" stroke="#b9782f" strokeWidth="2" />
          </g>
        ))}
      </g>
      <FoodFace cx={50} cy={72} />
    </g>
  );
}

function ChocolateBarBody() {
  // 초코바: 홈으로 나뉜 직사각형 조각들 + 한입 베어문 자국.
  return (
    <g>
      <rect x="14" y="30" width="72" height="40" rx="6" fill="#6b4423" stroke={INK} strokeWidth="3" />
      {[32, 50, 68].map((x) => (
        <line key={x} x1={x} y1="30" x2={x} y2="70" stroke="#4a2f1a" strokeWidth="2" />
      ))}
      <path
        d="M 86 40 Q 76 50 86 60"
        fill="#fdf6e6"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <FoodFace cx={45} cy={50} />
    </g>
  );
}

function PopcornBody() {
  // 팝콘: 세로 줄무늬 통 + 위로 봉긋하게 넘치는 팝콘 알갱이들.
  return (
    <g>
      <path
        d="M 26 46 L 32 88 L 68 88 L 74 46 Z"
        fill="#fffef7"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M 32 46 L 36 88 M 50 46 L 50 88 M 68 46 L 64 88" stroke="#e0483f" strokeWidth="4" />
      {[
        [32, 42],
        [44, 34],
        [56, 34],
        [68, 42],
        [50, 26],
        [40, 44],
        [60, 44],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="8" fill="#fdf6e6" stroke={INK} strokeWidth="2.2" />
      ))}
      <FoodFace cx={50} cy={66} />
    </g>
  );
}

function IcedLatteBody() {
  // 아이스라떼: 세로로 긴 컵 + 기울어진 빨대 + 위쪽 크림 돔.
  // 어묵꼬치의 넓은 컵+수직 꼬치와 달리, 좁고 길며 빨대가 비스듬해요.
  return (
    <g>
      <path
        d="M 28 40 L 34 88 L 66 88 L 72 40 Z"
        fill="#c9966b"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M 30 46 Q 50 52 70 46" fill="none" stroke="#fffef7" strokeWidth="3" opacity="0.6" />
      <path
        d="M 24 40 Q 50 48 76 40 Q 70 30 50 30 Q 30 30 24 40 Z"
        fill="#fdf6e6"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect
        x="46"
        y="6"
        width="7"
        height="34"
        rx="3"
        fill="#fffef7"
        stroke={INK}
        strokeWidth="2"
        transform="rotate(8 50 22)"
      />
      <FoodFace cx={50} cy={66} />
    </g>
  );
}

function FriesBody() {
  // 감자튀김: 위가 좁은 종이 포장지 + 위로 삐죽삐죽 솟은 튀김 막대들.
  return (
    <g>
      <path
        d="M 30 50 L 24 90 L 76 90 L 70 50 Z"
        fill="#e0483f"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {[
        [36, -6],
        [46, 4],
        [56, -4],
        [66, 6],
      ].map(([x, rot]) => (
        <rect
          key={x}
          x={x - 4}
          y="18"
          width="8"
          height="40"
          rx="3"
          fill="#f2c66b"
          stroke={INK}
          strokeWidth="2.2"
          transform={`rotate(${rot} ${x} 50)`}
        />
      ))}
      <FoodFace cx={50} cy={72} />
    </g>
  );
}

function RollCakeBody() {
  // 롤케이크: 옆으로 누운 원기둥 + 한쪽 단면에 소용돌이 무늬. 떡의 세워진
  // 기둥들과 달리 눕혀져 있고, 나선 단면이 실루엣의 핵심이에요.
  return (
    <g>
      <rect x="16" y="34" width="60" height="40" rx="20" fill="#f2d9a0" stroke={INK} strokeWidth="3" />
      <ellipse cx="76" cy="54" rx="14" ry="20" fill="#fdeef2" stroke={INK} strokeWidth="3" />
      <path
        d="M 76 40 Q 68 47 76 54 Q 84 61 76 68"
        fill="none"
        stroke="#e0a85c"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <StubArms y={64} spread={30} />
      <FoodFace cx={40} cy={54} />
    </g>
  );
}

// 색상 배리에이션이에요. 모양은 그대로 두고 CSS hue-rotate 필터로 색조만
// 돌려서, 같은 캐릭터의 "스페셜" 버전처럼 보이게 해요. 사람 캐릭터는 피부색이
// 이상하게 바뀔 수 있어서 색상 배리에이션은 음식 캐릭터에만 써요.
function withHueShift(Base: () => ReactElement): () => ReactElement {
  return function HueShiftVariant() {
    return (
      <g style={{ filter: "hue-rotate(200deg) saturate(1.2)" }}>
        <Base />
      </g>
    );
  };
}

const PERSON_BASE_RENDERERS: Record<PersonBaseStyle, () => ReactElement> = {
  short_black: PersonShortBlack,
  bun_brown: PersonBunBrown,
  curly_afro: PersonCurlyAfro,
  long_wavy: PersonLongWavy,
  bald_glasses: PersonBaldGlasses,
  twintails: PersonTwintails,
  cap: PersonCap,
  silver_short: PersonSilverShort,
  ponytail: PersonPonytail,
  bangs_bob: PersonBangsBob,
  beanie: PersonBeanie,
  headband_bow: PersonHeadbandBow,
  mohawk: PersonMohawk,
  undercut: PersonUndercut,
  flower_crown: PersonFlowerCrown,
  round_glasses: PersonRoundGlasses,
  long_straight: PersonLongStraight,
  perm_curl: PersonPermCurl,
  buzzcut: PersonBuzzcut,
  hairpin: PersonHairpin,
  bucket_hat: PersonBucketHat,
  side_braid: PersonSideBraid,
  side_swept: PersonSideSwept,
  headphones: PersonHeadphones,
  beret: PersonBeret,
  ringlet_curls: PersonRingletCurls,
  layered_cut: PersonLayeredCut,
  micro_bangs: PersonMicroBangs,
  high_ponytail: PersonHighPonytail,
  sweatband: PersonSweatband,
  side_ponytail: PersonSidePonytail,
  pompom_beanie: PersonPompomBeanie,
  glasses_mask: PersonGlassesMask,
  beard: PersonBeard,
  slicked_earring: PersonSlickedEarring,
  quiff: PersonQuiff,
  victory_rolls: PersonVictoryRolls,
  mullet: PersonMullet,
  cat_ears_hood: PersonCatEarsHood,
  turban: PersonTurban,
};

// 기본형 20개 + 뺨에 별 스티커를 붙인 "_star" 배리에이션 20개 = 총 40개예요.
const PERSON_RENDERERS: Record<PersonStyle, () => ReactElement> = {
  ...PERSON_BASE_RENDERERS,
  ...(Object.fromEntries(
    PERSON_BASE_STYLES.map((style) => [
      `${style}_star`,
      withSticker(PERSON_BASE_RENDERERS[style]),
    ]),
  ) as Record<`${PersonBaseStyle}_star`, () => ReactElement>),
};

const FOOD_BASE_RENDERERS: Record<FoodBaseStyle, () => ReactElement> = {
  onigiri: OnigiriBody,
  mandu: ManduBody,
  donut: DonutBody,
  sushi: SushiBody,
  bungeoppang: BungeoppangBody,
  gimbap: GimbapBody,
  tteokbokki: TteokbokkiBody,
  ramen: RamenBody,
  naengmyeon: NaengmyeonBody,
  samgyeopsal: SamgyeopsalBody,
  hotteok: HotteokBody,
  dimsum: DimsumBody,
  cake: CakeBody,
  icecream: IcecreamBody,
  tteok: TteokBody,
  mandu_guk: ManduGukBody,
  jjajangmyeon: JjajangmyeonBody,
  bibimbap: BibimbapBody,
  eomuk: EomukBody,
  twigim: TwigimBody,
  chicken_drumstick: ChickenDrumstickBody,
  corn: CornBody,
  salt_bread: SaltBreadBody,
  corndog: CorndogBody,
  churros: ChurrosBody,
  macaron: MacaronBody,
  pancake: PancakeBody,
  inari: InariBody,
  sandwich: SandwichBody,
  steak: SteakBody,
  strawberry: StrawberryBody,
  watermelon: WatermelonBody,
  croffle: CroffleBody,
  chocolate_bar: ChocolateBarBody,
  popcorn: PopcornBody,
  iced_latte: IcedLatteBody,
  fries: FriesBody,
  roll_cake: RollCakeBody,
};

// 기본형 20개 + 색조를 돌린 "_special" 배리에이션 20개 = 총 40개예요.
const FOOD_RENDERERS: Record<FoodStyle, () => ReactElement> = {
  ...FOOD_BASE_RENDERERS,
  ...(Object.fromEntries(
    FOOD_BASE_STYLES.map((style) => [
      `${style}_special`,
      withHueShift(FOOD_BASE_RENDERERS[style]),
    ]),
  ) as Record<`${FoodBaseStyle}_special`, () => ReactElement>),
};

// 선택 화면(그리드)에 실제로 보여줄 목록이에요. PERSON_STYLES/FOOD_STYLES에는
// "_star"/"_special" 배리에이션까지 전부 들어있지만(코드/타입 자체는 그대로 두고,
// 예전에 저장된 avatar:xxx 식별자를 계속 인식하기 위해서), 그 배리에이션들은
// 실루엣이 같고 색/장식만 다른 거라 "다른 아바타"로 보기 어려워서 선택 목록에서는
// 빼요. 또, 기본형 20개 중에도 서로 실루엣이 겹치는 것들(예: 국물 그릇류가 여럿,
// 원판 모양이 여럿)은 추리고, 완전히 새로운 실루엣만 추가로 골라 넣었어요.
export const PERSON_SELECTABLE_STYLES: readonly PersonStyle[] = [
  "short_black",
  "curly_afro",
  "long_wavy",
  "bald_glasses",
  "twintails",
  "cap",
  "beanie",
  "ponytail",
  "mohawk",
  "flower_crown",
  "bucket_hat",
  "side_braid",
  "side_swept",
  "headphones",
  "beret",
  "ringlet_curls",
  "layered_cut",
  "micro_bangs",
  "high_ponytail",
  "sweatband",
  "side_ponytail",
  "pompom_beanie",
  "glasses_mask",
  "beard",
  "slicked_earring",
  "quiff",
  "victory_rolls",
  "mullet",
  "cat_ears_hood",
  "turban",
];

export const FOOD_SELECTABLE_STYLES: readonly FoodStyle[] = [
  "onigiri",
  "mandu",
  "donut",
  "sushi",
  "bungeoppang",
  "tteokbokki",
  "dimsum",
  "icecream",
  "tteok",
  "samgyeopsal",
  "ramen",
  "eomuk",
  "chicken_drumstick",
  "corn",
  "salt_bread",
  "corndog",
  "churros",
  "macaron",
  "pancake",
  "inari",
  "sandwich",
  "steak",
  "strawberry",
  "watermelon",
  "croffle",
  "chocolate_bar",
  "popcorn",
  "iced_latte",
  "fries",
  "roll_cake",
];

// 모든 캐릭터를 (카테고리별로) 순회할 때 쓰는 목록이에요(선택 그리드용).
export const ALL_AVATARS: AvatarId[] = [
  ...PERSON_SELECTABLE_STYLES.map((style): AvatarId => ({ category: "person", style })),
  ...FOOD_SELECTABLE_STYLES.map((style): AvatarId => ({ category: "food", style })),
];

// 아바타 하나를 그려요. size는 렌더링될 정사각형 픽셀 크기예요.
export function AvatarIcon({
  category,
  style,
  size = 64,
  backgroundColor = THEME_YELLOW_BG,
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
