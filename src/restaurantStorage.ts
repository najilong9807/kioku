import { Storage } from "@apps-in-toss/web-framework";

const RESTAURANTS_STORAGE_KEY = "kioku:restaurants";

export const CATEGORIES = [
  "한식",
  "중식",
  "일식",
  "양식",
  "분식",
  "카페·디저트",
  "술집",
  "기타",
] as const;

export type Category = (typeof CATEGORIES)[number];

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

export interface Restaurant {
  id: string;
  name: string;
  category: Category;
  memo: string;
  rating: number;
  visitedAt: string;
}

// 예전에 자유 텍스트로 저장된 음식 종류는 고정 목록에 없을 수 있어요.
// 그런 값은 "기타"로 취급해서 항상 정해진 카테고리 중 하나가 되도록 해요.
function parseRestaurants(value: string): Restaurant[] {
  const parsed = JSON.parse(value) as Array<Omit<Restaurant, "category"> & { category: unknown }>;
  return parsed.map((item) => ({
    ...item,
    category: isCategory(item.category) ? item.category : "기타",
  }));
}

// 앱인토스 네이티브 Storage는 토스 앱/샌드박스 웹뷰 안에서만 동작해요.
// 일반 브라우저(로컬 개발 미리보기)에는 네이티브 브릿지가 없어서 호출이
// 실패하기 때문에, 그런 경우엔 브라우저 localStorage로 대체해요.
export async function loadRestaurants(): Promise<Restaurant[]> {
  try {
    const value = await Storage.getItem(RESTAURANTS_STORAGE_KEY);
    if (value) {
      return parseRestaurants(value);
    }
  } catch {
    // 네이티브 브릿지를 사용할 수 없는 환경이에요. localStorage로 대체해요.
  }

  try {
    const value = localStorage.getItem(RESTAURANTS_STORAGE_KEY);
    if (value) {
      return parseRestaurants(value);
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
