// "맛집 도감"에서 사용자가 실제로 "발견"한 항목을 계산해요. 도감 번호/이름은
// FOOD_DEX_MASTER(append-only 고정 목록)에 이미 정해져 있으니, 여기서는 각 항목을
// 사용자가 발견했는지(=그 이름으로 기록한 적이 있는지)와, 발견했다면 대표
// 맛집이 어디인지만 계산해요. 별도 저장 테이블 없이 매번 로컬 기록에서
// 다시 계산해요.
import { FOOD_DEX_MASTER } from "./foodDexData";
import type { Restaurant } from "../restaurantStorage";

// 태그(도감 항목 이름) -> 대표 맛집. 대표는 별점(0.5 단위 반영)이 가장 높은
// 곳이고, 동점이면 가장 최근 방문일 기록이에요. 도감에 없는 이름(예전
// 자유 텍스트 태그)은 여기서 다루지 않아요 — 도감은 어디까지나
// FOOD_DEX_MASTER 기준이에요.
export function computeFoodDexDiscoveries(
  restaurants: Restaurant[],
): Map<string, Restaurant> {
  const discoveries = new Map<string, Restaurant>();

  for (const entry of FOOD_DEX_MASTER) {
    const candidates = restaurants.filter((restaurant) =>
      restaurant.menus.includes(entry.name),
    );
    if (candidates.length === 0) {
      continue;
    }

    const representative = candidates.reduce((best, current) => {
      if (current.rating !== best.rating) {
        return current.rating > best.rating ? current : best;
      }
      return current.visitDate > best.visitDate ? current : best;
    });
    discoveries.set(entry.name, representative);
  }

  return discoveries;
}
