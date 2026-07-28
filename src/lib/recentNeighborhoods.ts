// 사용자가 직접 입력했던 동네 이름을 기기(브라우저)에 최근순으로 보관해요.
// 맛집 기록/오늘뭐먹 두 화면에서 동일한 자동완성 후보로 재사용해요.
const RECENT_NEIGHBORHOODS_KEY = "kioku:recentNeighborhoods";
const MAX_RECENT_NEIGHBORHOODS = 10;

export function getRecentNeighborhoods(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_NEIGHBORHOODS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

// 새로 입력한 동네를 맨 앞으로 올리고, 중복은 제거하고, 개수를 제한해서 저장해요.
export function addRecentNeighborhood(value: string): void {
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }

  try {
    const withoutDuplicate = getRecentNeighborhoods().filter(
      (item) => item !== trimmed,
    );
    const next = [trimmed, ...withoutDuplicate].slice(
      0,
      MAX_RECENT_NEIGHBORHOODS,
    );
    localStorage.setItem(RECENT_NEIGHBORHOODS_KEY, JSON.stringify(next));
  } catch {
    // 저장 공간 부족 등으로 실패해도 조용히 무시해요. 자동완성 편의 기능일 뿐이라
    // 실패하더라도 글쓰기 자체에는 영향이 없어야 해요.
  }
}
