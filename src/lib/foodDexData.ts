// "맛집 도감"의 마스터 데이터예요. 사용자가 실제로 먹고 등록한 기록과는
// 별개로, 도감에 존재하는 음식 70종 전체 목록이에요(FoodDexView가 이 목록
// 전체를 그리고, 그중 사용자가 태그로 남긴 것만 "발견"으로 표시해요).
//
// 도감 번호(dexNumber)는 이 배열에서의 위치로 정해져요. 항목을 추가할 때는
// 항상 배열 "끝"에만 추가하세요 — 중간에 끼워넣거나 순서를 바꾸면 이미
// 부여된 기존 번호가 밀려서, 사용자가 이미 발견해 둔 기록과 번호가
// 어긋나게 돼요.
export const FOOD_DEX_CATEGORIES = [
  "한식",
  "분식",
  "중식",
  "일식",
  "양식",
  "카페·디저트",
  "술안주·야식",
] as const;

export type FoodDexCategory = (typeof FOOD_DEX_CATEGORIES)[number];

export interface FoodDexMasterEntry {
  dexNumber: number;
  name: string;
  category: FoodDexCategory;
}

interface FoodDexSeed {
  name: string;
  category: FoodDexCategory;
}

// dexNumber를 뺀 원본 목록이에요. 이 배열의 순서 = 도감 번호 순서예요.
const FOOD_DEX_SEEDS: readonly FoodDexSeed[] = [
  // 한식(1~20)
  { name: "김치찌개", category: "한식" },
  { name: "된장찌개", category: "한식" },
  { name: "순두부찌개", category: "한식" },
  { name: "부대찌개", category: "한식" },
  { name: "갈비탕", category: "한식" },
  { name: "삼계탕", category: "한식" },
  { name: "설렁탕", category: "한식" },
  { name: "육개장", category: "한식" },
  { name: "비빔밥", category: "한식" },
  { name: "불고기", category: "한식" },
  { name: "갈비찜", category: "한식" },
  { name: "제육볶음", category: "한식" },
  { name: "돼지갈비", category: "한식" },
  { name: "소고기구이", category: "한식" },
  { name: "삼겹살", category: "한식" },
  { name: "냉면", category: "한식" },
  { name: "잡채", category: "한식" },
  { name: "떡국", category: "한식" },
  { name: "보쌈", category: "한식" },
  { name: "갈비", category: "한식" },
  // 분식(21~30)
  { name: "떡볶이", category: "분식" },
  { name: "순대", category: "분식" },
  { name: "튀김", category: "분식" },
  { name: "김밥", category: "분식" },
  { name: "어묵", category: "분식" },
  { name: "라면", category: "분식" },
  { name: "쫄면", category: "분식" },
  { name: "만두", category: "분식" },
  { name: "핫도그", category: "분식" },
  { name: "떡꼬치", category: "분식" },
  // 중식(31~38)
  { name: "짜장면", category: "중식" },
  { name: "짬뽕", category: "중식" },
  { name: "탕수육", category: "중식" },
  { name: "마라탕", category: "중식" },
  { name: "마라샹궈", category: "중식" },
  { name: "양꼬치", category: "중식" },
  { name: "볶음밥", category: "중식" },
  { name: "딤섬", category: "중식" },
  // 일식(39~48)
  { name: "초밥", category: "일식" },
  { name: "라멘", category: "일식" },
  { name: "우동", category: "일식" },
  { name: "돈까스", category: "일식" },
  { name: "규동", category: "일식" },
  { name: "오코노미야키", category: "일식" },
  { name: "타코야끼", category: "일식" },
  { name: "카레라이스", category: "일식" },
  { name: "텐동", category: "일식" },
  { name: "사시미", category: "일식" },
  // 양식(49~58)
  { name: "파스타", category: "양식" },
  { name: "피자", category: "양식" },
  { name: "스테이크", category: "양식" },
  { name: "리조또", category: "양식" },
  { name: "햄버거", category: "양식" },
  { name: "샐러드", category: "양식" },
  { name: "브런치", category: "양식" },
  { name: "오믈렛", category: "양식" },
  { name: "수프", category: "양식" },
  { name: "그라탱", category: "양식" },
  // 카페·디저트(59~66)
  { name: "커피", category: "카페·디저트" },
  { name: "빙수", category: "카페·디저트" },
  { name: "케이크", category: "카페·디저트" },
  { name: "마카롱", category: "카페·디저트" },
  { name: "크로플", category: "카페·디저트" },
  { name: "와플", category: "카페·디저트" },
  { name: "도넛", category: "카페·디저트" },
  { name: "베이글", category: "카페·디저트" },
  // 술안주·야식(67~70)
  { name: "치킨", category: "술안주·야식" },
  { name: "족발", category: "술안주·야식" },
  { name: "곱창", category: "술안주·야식" },
  { name: "회", category: "술안주·야식" },
];

// 위 시드 배열에 번호만 덧붙인, 실제로 쓰는 도감 마스터 목록이에요.
export const FOOD_DEX_MASTER: readonly FoodDexMasterEntry[] = FOOD_DEX_SEEDS.map(
  (seed, index) => ({ ...seed, dexNumber: index + 1 }),
);

export const FOOD_DEX_TOTAL_COUNT = FOOD_DEX_MASTER.length;
