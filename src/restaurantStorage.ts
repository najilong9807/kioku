import { Storage } from "@apps-in-toss/web-framework";

const RESTAURANTS_STORAGE_KEY = "kioku:restaurants";

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  memo: string;
  rating: number;
  visitedAt: string;
}

// 앱인토스 네이티브 Storage는 토스 앱/샌드박스 웹뷰 안에서만 동작해요.
// 일반 브라우저(로컬 개발 미리보기)에는 네이티브 브릿지가 없어서 호출이
// 실패하기 때문에, 그런 경우엔 브라우저 localStorage로 대체해요.
export async function loadRestaurants(): Promise<Restaurant[]> {
  try {
    const value = await Storage.getItem(RESTAURANTS_STORAGE_KEY);
    if (value) {
      return JSON.parse(value) as Restaurant[];
    }
  } catch {
    // 네이티브 브릿지를 사용할 수 없는 환경이에요. localStorage로 대체해요.
  }

  try {
    const value = localStorage.getItem(RESTAURANTS_STORAGE_KEY);
    if (value) {
      return JSON.parse(value) as Restaurant[];
    }
  } catch {
    // ignore
  }

  return [];
}

export async function saveRestaurants(restaurants: Restaurant[]): Promise<void> {
  const serialized = JSON.stringify(restaurants);

  try {
    await Storage.setItem(RESTAURANTS_STORAGE_KEY, serialized);
    return;
  } catch {
    // 네이티브 브릿지를 사용할 수 없는 환경이에요. localStorage로 대체해요.
  }

  try {
    localStorage.setItem(RESTAURANTS_STORAGE_KEY, serialized);
  } catch {
    // ignore (예: 저장 공간 부족)
  }
}
