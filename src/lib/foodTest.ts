import { Storage } from "@apps-in-toss/web-framework";
import type { FoodStyle as AvatarFoodStyle } from "./avatars";

// "먹보조사" 음식 성향 테스트예요. 4개 축(여정스타일/선택기준/식사방식/음식취향)에
// 10문항씩, 총 40문항의 3지선다로 구성돼요. 앞 3개 축은 A/B/C에 각각 +1/0/-1
// 점수를 매겨 합산 후 성향 코드를 정하고, 음식취향 축은 각 보기가 가리키는
// 음식 카테고리의 등장 빈도로 판정해요. 두 결과를 조합해서 최종 별명을 만들어요.

const RESULT_STORAGE_KEY = "kioku:foodTestResult";
const HIDE_INTRO_STORAGE_KEY = "kioku:foodTestHideIntro";

export type ScoredAxis = "journey" | "choice" | "dining";
export type FoodCategory =
  | "한식"
  | "분식"
  | "중식"
  | "일식"
  | "동남아"
  | "양식"
  | "패스트푸드"
  | "디저트";

export interface ScoredQuestion {
  id: string;
  axis: ScoredAxis;
  prompt: string;
  // [A, B, C] 순서예요. A=+1, B=0, C=-1로 채점해요.
  options: [string, string, string];
}

export interface FoodQuestion {
  id: string;
  axis: "food";
  prompt: string;
  options: [string, string, string];
  categories: [FoodCategory, FoodCategory, FoodCategory];
}

export type FoodTestQuestion = ScoredQuestion | FoodQuestion;

// ── 여정스타일 (A=모험형 / C=안정형) ────────────────────────────
const JOURNEY_QUESTIONS: ScoredQuestion[] = [
  {
    id: "journey-1",
    axis: "journey",
    prompt: "낯선 골목에 못 보던 간판이 있다면",
    options: ["바로 들어가본다", "사진만 찍어두고 다음에", "원래 가던 길로"],
  },
  {
    id: "journey-2",
    axis: "journey",
    prompt: "여행지에서 지도 앱을 켤 때",
    options: [
      "핀 없는 골목으로 걸어들어간다",
      "대략 동선만 잡고 즉흥적으로",
      "찍어둔 곳들만 순서대로",
    ],
  },
  {
    id: "journey-3",
    axis: "journey",
    prompt: "새 게임을 시작할 때",
    options: [
      "튜토리얼 건너뛰고 바로 플레이",
      "훑어만 보고 대충 시작",
      "공략부터 찾아보고 시작",
    ],
  },
  {
    id: "journey-4",
    axis: "journey",
    prompt: "처음 가는 동네에서 골목시장을 마주치면",
    options: ["눈에 띄는 아무 데나 들어간다", "사람 많은 곳 위주로", "미리 찾아둔 곳만"],
  },
  {
    id: "journey-5",
    axis: "journey",
    prompt: "친구가 \"이거 완전 다른 스타일이야\" 하면",
    options: [
      "\"재밌겠다, 해보자\"",
      "\"일단 들어보고\"",
      "\"익숙한 게 낫지 않아?\"",
    ],
  },
  {
    id: "journey-6",
    axis: "journey",
    prompt: "처음 보는 브랜드의 신상품을 마주치면",
    options: ["궁금해서 바로 써본다", "리뷰 몇 개 보고 결정", "쓰던 거 계속 쓴다"],
  },
  {
    id: "journey-7",
    axis: "journey",
    prompt: "낯선 언어로 된 메뉴판을 받으면",
    options: ["대충 찍어서 모험해본다", "직원에게 추천받는다", "아는 단어 있는 걸로"],
  },
  {
    id: "journey-8",
    axis: "journey",
    prompt: "새로 생긴 산책로를 발견하면",
    options: ["바로 걸어본다", "다음에 가보자 하고 넘어감", "늘 걷던 길로"],
  },
  {
    id: "journey-9",
    axis: "journey",
    prompt: "\"이 조합 은근 어울려\" 하는 실험적인 걸 보면",
    options: ["나도 해보고 싶다", "남이 먼저 해보면 따라간다", "검증된 조합이 낫다"],
  },
  {
    id: "journey-10",
    axis: "journey",
    prompt: "낯선 동네에서 하루를 보낸다면",
    options: ["계획 없이 돌아다닌다", "큰 틀만 잡고 세부는 즉흥", "동선을 촘촘히 짠다"],
  },
];

// ── 선택기준 (A=감성 / C=효율) ──────────────────────────────────
const CHOICE_QUESTIONS: ScoredQuestion[] = [
  {
    id: "choice-1",
    axis: "choice",
    prompt: "물건 살 때 마음이 가는 건",
    options: ["디자인이 예쁜 것", "적당히 둘 다 보는 것", "실용적인 것"],
  },
  {
    id: "choice-2",
    axis: "choice",
    prompt: "방을 꾸민다면",
    options: ["분위기 있는 조명부터", "예쁘고 실용적인 걸 같이", "수납이 편한 가구부터"],
  },
  {
    id: "choice-3",
    axis: "choice",
    prompt: "여행 숙소를 고를 때",
    options: [
      "뷰 좋고 감성적인 곳",
      "위치랑 가격 둘 다 고려",
      "가격 대비 실속 있는 곳",
    ],
  },
  {
    id: "choice-4",
    axis: "choice",
    prompt: "선물을 받는다면",
    options: ["정성이 느껴지는 포장", "예쁘면서 쓸모도 있으면", "진짜 필요했던 실용적인 것"],
  },
  {
    id: "choice-5",
    axis: "choice",
    prompt: "사진 찍을 때 신경 쓰는 건",
    options: ["분위기와 구도", "적당히 잘 나오면 됨", "정확하게 잘 보이는지"],
  },
  {
    id: "choice-6",
    axis: "choice",
    prompt: "옷을 고를 때",
    options: ["입었을 때 느낌이 좋은가", "예쁘고 활용도 둘 다", "얼마나 자주 입을 수 있나"],
  },
  {
    id: "choice-7",
    axis: "choice",
    prompt: "카페에서 자리를 고른다면",
    options: ["창가 분위기 좋은 자리", "적당히 편한 자리", "콘센트 있는 효율적인 자리"],
  },
  {
    id: "choice-8",
    axis: "choice",
    prompt: "무언가를 후회 없이 샀다고 느낄 때는",
    options: [
      "볼 때마다 기분이 좋을 때",
      "만족스럽게 잘 썼을 때",
      "본전을 확실히 뽑았을 때",
    ],
  },
  {
    id: "choice-9",
    axis: "choice",
    prompt: "퇴근하고 소파에 눕는 순간, 오늘 하루가 버틸 만했다고 느끼게 하는 건",
    options: ["예쁜 걸 눈에 담았던 기억", "둘 다 적당히", "뭔가 해냈다는 확실한 성취감"],
  },
  {
    id: "choice-10",
    axis: "choice",
    prompt: "뭔가를 고르고 나서 만족감을 느끼는 순간은",
    options: ["\"예쁘다\" 싶을 때", "딱히 아쉬움 없을 때", "\"이득이다\" 싶을 때"],
  },
];

// ── 식사방식 (A=함께 / C=혼자) ──────────────────────────────────
const DINING_QUESTIONS: ScoredQuestion[] = [
  {
    id: "dining-1",
    axis: "dining",
    prompt: "맛있는 곳을 새로 발견했을 때",
    options: [
      "바로 누군가에게 알린다",
      "나중에 얘기해줘야지 정도",
      "혼자만의 발견으로 남긴다",
    ],
  },
  {
    id: "dining-2",
    axis: "dining",
    prompt: "시간이 붕 떴을 때",
    options: ["누구랑 뭘 할지부터 생각", "그때그때 다르다", "혼자 뭘 할지부터 생각"],
  },
  {
    id: "dining-3",
    axis: "dining",
    prompt: "여행을 간다면",
    options: ["왁자지껄한 단체 여행", "소수 인원과 함께", "혼자 떠나는 여행"],
  },
  {
    id: "dining-4",
    axis: "dining",
    prompt: "대기 줄에서 지루해지면",
    options: ["옆 사람과 수다 떤다", "폰 보며 시간 때운다", "혼자만의 생각에 잠긴다"],
  },
  {
    id: "dining-5",
    axis: "dining",
    prompt: "좋아하는 걸 즐길 때 더 좋은 건",
    options: [
      "누군가와 나누는 순간",
      "상황 따라 다르다",
      "온전히 나에게 집중하는 순간",
    ],
  },
  {
    id: "dining-6",
    axis: "dining",
    prompt: "모임 자리에서 나는",
    options: ["여기저기 옮겨다니며 대화", "적당히 어울린다", "조용히 한쪽에서 지켜본다"],
  },
  {
    id: "dining-7",
    axis: "dining",
    prompt: "\"혼자가 제일 편해\"라는 말을 들으면",
    options: ["잘 이해가 안 된다", "어느 정도 공감된다", "격하게 공감한다"],
  },
  {
    id: "dining-8",
    axis: "dining",
    prompt: "새로운 공간에 들어설 때 편한 건",
    options: ["여럿이 함께 들어가는 것", "한두 명과 함께", "혼자 들어가는 것"],
  },
  {
    id: "dining-9",
    axis: "dining",
    prompt: "기념일이나 특별한 날엔",
    options: ["사람들을 불러모은다", "가까운 몇 명과 조용히", "나만의 방식으로 혼자 보낸다"],
  },
  {
    id: "dining-10",
    axis: "dining",
    prompt: "어떤 경험이 진짜 좋았다고 느끼는 건",
    options: [
      "함께한 사람들 덕분일 때",
      "상황에 따라 다르다",
      "혼자여서 온전히 몰입했을 때",
    ],
  },
];

// ── 음식 취향 (카테고리 다수결) ──────────────────────────────────
const FOOD_QUESTIONS: FoodQuestion[] = [
  {
    id: "food-1",
    axis: "food",
    prompt: "저녁 6시, 딱히 정한 것 없이 배가 고파올 때 제일 끌리는 건",
    options: [
      "뜨끈한 국물이 있는 한 상",
      "포장마차에서 파는 떡볶이·순대",
      "레스토랑에서 나이프로 써는 요리",
    ],
    categories: ["한식", "분식", "양식"],
  },
  {
    id: "food-2",
    axis: "food",
    prompt: "일요일 저녁, 아무 약속 없이 배달앱을 켰을 때 자연스럽게 검색하는 건",
    options: [
      "마라탕이나 짜장면 같은 얼큰한 중화요리",
      "스시나 우동 같은 정갈한 일식",
      "팟타이나 쌀국수 같은 향신료 요리",
    ],
    categories: ["중식", "일식", "동남아"],
  },
  {
    id: "food-3",
    axis: "food",
    prompt: "직장인의 짧은 점심시간, 12시 5분에 주문해서 12시 40분엔 다 먹어야 한다면",
    options: [
      "편의점에서 산 빵이나 버거 하나",
      "카페에서 조각 케이크 하나로 때움",
      "국밥집에 가서 빠르게 한 그릇",
    ],
    categories: ["패스트푸드", "디저트", "한식"],
  },
  {
    id: "food-4",
    axis: "food",
    prompt: "오랜만에 본가에 온 친구에게 대접하고 싶은 건",
    options: [
      "스시·사시미 같은 정갈한 일식",
      "스테이크처럼 나이프로 써는 양식",
      "탕수육·양장피처럼 다 같이 나눠먹는 중식",
    ],
    categories: ["일식", "양식", "중식"],
  },
  {
    id: "food-5",
    axis: "food",
    prompt: "야근하고 퇴근한 날, 나를 달래주는 음식은",
    options: [
      "얼큰한 찌개에 밥 한 공기",
      "똠양꿍처럼 향신료 진한 국물요리",
      "조각 케이크나 마카롱",
    ],
    categories: ["한식", "동남아", "디저트"],
  },
  {
    id: "food-6",
    axis: "food",
    prompt: "길을 걷다 나를 멈춰세우는 건",
    options: ["음식 냄새", "음식 비주얼", "가게 위치·간판"],
    categories: ["분식", "디저트", "패스트푸드"],
  },
  {
    id: "food-7",
    axis: "food",
    prompt: "해외여행 중 로컬 맛집을 발견했을 때 가장 끌리는 메뉴는",
    options: [
      "쌀국수·팟타이처럼 향신료 가득한 현지요리",
      "마라샹궈처럼 불맛 나는 요리",
      "스시처럼 정갈한 한 접시 요리",
    ],
    categories: ["동남아", "중식", "일식"],
  },
  {
    id: "food-8",
    axis: "food",
    prompt: "기분이 축 처지는 날, 나를 일으켜 세우는 음식은",
    options: [
      "레스토랑에서의 근사한 한 끼",
      "달콤한 디저트 한 조각",
      "집에서 먹는 뜨끈한 국물 한 그릇",
    ],
    categories: ["양식", "디저트", "한식"],
  },
  {
    id: "food-9",
    axis: "food",
    prompt: "친구 집들이에 가져가고 싶은 건",
    options: ["집에서 담근 김치", "이국적인 향신료 소스", "직접 구운 디저트"],
    categories: ["한식", "동남아", "디저트"],
  },
  {
    id: "food-10",
    axis: "food",
    prompt: "자신 있게 만들 수 있는 요리는",
    options: ["볶음밥·중화요리", "파스타·스테이크", "라면에 계란·파 넣어 끓이기"],
    categories: ["중식", "양식", "분식"],
  },
];

export const FOOD_TEST_QUESTIONS: FoodTestQuestion[] = [
  ...JOURNEY_QUESTIONS,
  ...CHOICE_QUESTIONS,
  ...DINING_QUESTIONS,
  ...FOOD_QUESTIONS,
];

export const FOOD_TEST_QUESTION_COUNT = FOOD_TEST_QUESTIONS.length;

export function isFoodQuestion(
  question: FoodTestQuestion,
): question is FoodQuestion {
  return question.axis === "food";
}

// Fisher-Yates shuffle이에요. 문제 순서를 매번 새로 섞어서, 축이 뭉쳐 나오는
// 패턴을 사용자가 눈치채지 못하게 해요.
export function shuffleQuestions(
  questions: FoodTestQuestion[] = FOOD_TEST_QUESTIONS,
): FoodTestQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export type AnswerLetter = "A" | "B" | "C";
export type Answers = Record<string, AnswerLetter>;

export type PersonalityCode =
  | "탐험대장"
  | "방랑자"
  | "모험가"
  | "탐구자"
  | "인싸메이트"
  | "단골지킴이"
  | "정찬러"
  | "루틴러";

const PERSONALITY_MAP: Record<
  "adventurous" | "stable",
  Record<"emotional" | "efficient", Record<"together" | "alone", PersonalityCode>>
> = {
  adventurous: {
    emotional: { together: "탐험대장", alone: "방랑자" },
    efficient: { together: "모험가", alone: "탐구자" },
  },
  stable: {
    emotional: { together: "인싸메이트", alone: "단골지킴이" },
    efficient: { together: "정찬러", alone: "루틴러" },
  },
};

const PERSONALITY_DESCRIPTIONS: Record<PersonalityCode, string> = {
  탐험대장: "메뉴든 낯선 골목이든, 일단 가보고 사람들과 그 설렘을 나눠야 완성되는 타입이에요.",
  방랑자: "한 끼를 찾아 혼자 낯선 골목 구석구석을 누비는 타입이에요.",
  모험가: "한 끼도 새로운 시도로 접근하고, 그 경험을 사람들과 실속 있게 나누는 타입이에요.",
  탐구자: "메뉴를 마주치면 직접 부딪혀보고, 그 답을 혼자 차분히 파고드는 타입이에요.",
  인싸메이트: "단골집에서 좋아하는 사람들과 함께할 때 가장 편안한 타입이에요.",
  단골지킴이: "단골집의 분위기를 홀로 음미하며 조용히 지키는 타입이에요.",
  정찬러: "검증된 메뉴를 신뢰하고, 그 만족을 가까운 사람들과 나누는 타입이에요.",
  루틴러: "메뉴만 골라 나만의 루틴 속에서 안정을 찾는 타입이에요.",
};

const FOOD_ADJECTIVES: Record<FoodCategory, string> = {
  한식: "든든한",
  분식: "소소한",
  중식: "화끈한",
  일식: "깔끔한",
  동남아: "이색적인",
  양식: "근사한",
  패스트푸드: "간편한",
  디저트: "달콤한",
};

// 결과 화면에서 음식취향을 나타낼 때, 이미 만들어둔 프로필 아바타 음식
// 캐릭터(lib/avatars.tsx) 중 카테고리에 가장 잘 어울리는 것 하나를 재사용해요.
// "동남아"는 정확히 들어맞는 기존 캐릭터가 없어서, 꼬치 형태로 가장 가까운
// chicken_drumstick으로 대신해요.
export const FOOD_CATEGORY_AVATAR_STYLE: Record<FoodCategory, AvatarFoodStyle> = {
  한식: "bibimbap",
  분식: "tteokbokki",
  중식: "jjajangmyeon",
  일식: "sushi",
  동남아: "chicken_drumstick",
  양식: "steak",
  패스트푸드: "fries",
  디저트: "macaron",
};

export interface FoodTestResult {
  personalityCode: PersonalityCode;
  foodCategory: FoodCategory;
  adjective: string;
  title: string; // "{adjective} {personalityCode}"
  description: string;
  completedAt: string; // ISO
}

function scoreAxis(answers: Answers, questions: ScoredQuestion[]): number {
  return questions.reduce((sum, question) => {
    const answer = answers[question.id];
    if (answer === "A") return sum + 1;
    if (answer === "C") return sum - 1;
    return sum;
  }, 0);
}

function judgeFoodCategory(answers: Answers): FoodCategory {
  const counts = new Map<FoodCategory, number>();
  const firstSeenIndex = new Map<FoodCategory, number>();

  FOOD_QUESTIONS.forEach((question, index) => {
    const answer = answers[question.id];
    if (!answer) {
      return;
    }
    const letterIndex = answer === "A" ? 0 : answer === "B" ? 1 : 2;
    const category = question.categories[letterIndex];
    counts.set(category, (counts.get(category) ?? 0) + 1);
    if (!firstSeenIndex.has(category)) {
      firstSeenIndex.set(category, index);
    }
  });

  let best: FoodCategory = "한식";
  let bestCount = -1;
  let bestFirstSeen = Number.POSITIVE_INFINITY;

  for (const [category, count] of counts) {
    const seenAt = firstSeenIndex.get(category) ?? Number.POSITIVE_INFINITY;
    if (
      count > bestCount ||
      (count === bestCount && seenAt < bestFirstSeen)
    ) {
      best = category;
      bestCount = count;
      bestFirstSeen = seenAt;
    }
  }

  return best;
}

// 세 축(여정스타일/선택기준/식사방식) 합산 점수로 8가지 성향 중 하나를 정하고,
// 음식취향 축의 다수결 카테고리와 조합해서 최종 결과를 만들어요.
// 합산이 정확히 0인 동점 상황은(모험형/안정형처럼) 항상 A/C 개수도 같이
// 동점이 되므로 별도 기준이 필요해요 — 이 테스트에서는 0점을 "안정/효율/혼자"
// 같은 차분한 쪽이 아니라 A(모험형/감성/함께)쪽으로 판정해요. 완전히 무난하게
// 답했다는 건 오히려 이것저것 다 열려있다는 뜻으로 보고, 더 적극적인 쪽 손을
// 들어주기로 했어요.
export function computeFoodTestResult(answers: Answers): FoodTestResult {
  const journeyScore = scoreAxis(answers, JOURNEY_QUESTIONS);
  const choiceScore = scoreAxis(answers, CHOICE_QUESTIONS);
  const diningScore = scoreAxis(answers, DINING_QUESTIONS);

  const journeySide: "adventurous" | "stable" =
    journeyScore >= 0 ? "adventurous" : "stable";
  const choiceSide: "emotional" | "efficient" =
    choiceScore >= 0 ? "emotional" : "efficient";
  const diningSide: "together" | "alone" = diningScore >= 0 ? "together" : "alone";

  const personalityCode = PERSONALITY_MAP[journeySide][choiceSide][diningSide];
  const foodCategory = judgeFoodCategory(answers);
  const adjective = FOOD_ADJECTIVES[foodCategory];

  return {
    personalityCode,
    foodCategory,
    adjective,
    title: `${adjective} ${personalityCode}`,
    description: `${adjective} ${PERSONALITY_DESCRIPTIONS[personalityCode]}`,
    completedAt: new Date().toISOString(),
  };
}

function parseResult(value: string): FoodTestResult | null {
  try {
    return JSON.parse(value) as FoodTestResult;
  } catch {
    return null;
  }
}

// 다른 로컬 데이터(restaurantStorage.ts 등)와 동일하게, 네이티브 Storage를
// 먼저 시도하고 실패하면(일반 브라우저 미리보기 등) localStorage로 대체해요.
export async function loadFoodTestResult(): Promise<FoodTestResult | null> {
  try {
    const value = await Storage.getItem(RESULT_STORAGE_KEY);
    if (value) {
      return parseResult(value);
    }
  } catch {
    // 네이티브 브릿지를 사용할 수 없는 환경이에요.
  }

  try {
    const value = localStorage.getItem(RESULT_STORAGE_KEY);
    if (value) {
      return parseResult(value);
    }
  } catch {
    // ignore
  }

  return null;
}

export async function saveFoodTestResult(result: FoodTestResult): Promise<void> {
  const serialized = JSON.stringify(result);

  try {
    await Storage.setItem(RESULT_STORAGE_KEY, serialized);
    return;
  } catch {
    // 네이티브 브릿지를 사용할 수 없는 환경이에요.
  }

  try {
    localStorage.setItem(RESULT_STORAGE_KEY, serialized);
  } catch {
    // ignore
  }
}

export async function loadFoodTestHideIntro(): Promise<boolean> {
  try {
    const value = await Storage.getItem(HIDE_INTRO_STORAGE_KEY);
    if (value) {
      return value === "true";
    }
  } catch {
    // ignore
  }

  try {
    return localStorage.getItem(HIDE_INTRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export async function saveFoodTestHideIntro(hide: boolean): Promise<void> {
  const serialized = hide ? "true" : "false";

  try {
    await Storage.setItem(HIDE_INTRO_STORAGE_KEY, serialized);
    return;
  } catch {
    // ignore
  }

  try {
    localStorage.setItem(HIDE_INTRO_STORAGE_KEY, serialized);
  } catch {
    // ignore
  }
}
