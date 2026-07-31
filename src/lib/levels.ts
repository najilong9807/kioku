// 등록한 맛집 개수로 매기는 등급이에요. DB에 따로 저장하지 않고, 맛집 기록 개수로
// 그때그때 계산해서 보여줘요. 1~10단계로, 초반에는 구간을 촘촘하게 둬서 쉽게
// 레벨업하는 느낌을 주고, 뒤로 갈수록 구간을 넓혀서 뒷단계가 희소하게 느껴지도록
// 했어요(구간 폭: 3,3,4,5,6,7,8,9,10곳 — 점점 넓어져요).
export interface LevelTier {
  level: number;
  name: string;
  description: string;
  minCount: number;
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, name: "새싹", description: "이제 막 기록을 시작했어요", minCount: 0 },
  { level: 2, name: "한 입", description: "맛집 기록에 재미를 붙이고 있어요", minCount: 3 },
  { level: 3, name: "동네 산책자", description: "동네 맛집을 하나둘 늘려가고 있어요", minCount: 6 },
  { level: 4, name: "발품러", description: "발품 팔아 맛집을 찾아다녀요", minCount: 10 },
  { level: 5, name: "탐험가", description: "취향의 지도를 넓혀가고 있어요", minCount: 15 },
  { level: 6, name: "단골 수집가", description: "나만의 단골집을 모으고 있어요", minCount: 21 },
  { level: 7, name: "미식가", description: "맛을 보는 눈이 또렷해졌어요", minCount: 28 },
  { level: 8, name: "맛집 큐레이터", description: "누구에게나 추천할 목록이 쌓였어요", minCount: 36 },
  { level: 9, name: "마스터", description: "웬만한 맛집은 다 꿰고 있어요", minCount: 45 },
  { level: 10, name: "명예의 전당", description: "이 동네 맛집 역사 그 자체예요", minCount: 55 },
];

export interface LevelInfo {
  tier: LevelTier;
  /** 다음 등급이 없으면(최고 등급) null이에요. */
  nextTier: LevelTier | null;
  /** 다음 등급까지 남은 맛집 개수예요. 최고 등급이면 0이에요. */
  remainingToNext: number;
}

export function getLevelInfo(restaurantCount: number): LevelInfo {
  let currentIndex = 0;
  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (restaurantCount >= LEVEL_TIERS[i].minCount) {
      currentIndex = i;
    }
  }

  const tier = LEVEL_TIERS[currentIndex];
  const nextTier = LEVEL_TIERS[currentIndex + 1] ?? null;
  const remainingToNext = nextTier ? nextTier.minCount - restaurantCount : 0;

  return { tier, nextTier, remainingToNext };
}

// 등급표 화면에서 각 등급의 구간을 "N곳 ~ M곳"처럼 사람이 읽기 좋은 문구로 만들어요.
// 마지막 등급은 위쪽이 열려 있으니 "N곳 이상"으로 표시해요.
export function formatTierRange(tier: LevelTier, index: number): string {
  const nextTier = LEVEL_TIERS[index + 1];
  if (!nextTier) {
    return `${tier.minCount}곳 이상`;
  }
  if (nextTier.minCount - 1 === tier.minCount) {
    return `${tier.minCount}곳`;
  }
  return `${tier.minCount}~${nextTier.minCount - 1}곳`;
}
