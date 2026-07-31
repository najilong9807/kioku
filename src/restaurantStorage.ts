import { Storage } from "@apps-in-toss/web-framework";

const RESTAURANTS_STORAGE_KEY = "kioku:restaurants";

export const CATEGORIES = [
  "한식",
  "중식",
  "일식",
  "양식",
  "분식",
  "패스트푸드",
  "카페·디저트",
  "술집",
  "기타",
] as const;

export type Category = (typeof CATEGORIES)[number];

function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

// <input type="date">의 value/max 형식("YYYY-MM-DD")과 맞춰서 문자열 비교만으로도
// 날짜 순 정렬·비교가 가능하도록 이 형식으로 저장해요.
export function toDateInputValue(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function todayDateInputValue(): string {
  return toDateInputValue(new Date());
}

// 화면에 보여줄 때는 기존처럼 "YYYY.MM.DD" 형태로 표시해요.
export function formatDisplayDate(value: string): string {
  return value.replaceAll("-", ".");
}

export interface Restaurant {
  id: string;
  name: string;
  category: Category;
  companion: string;
  weather: string;
  neighborhood: string;
  menus: string[];
  memo: string;
  rating: number;
  visitDate: string; // "YYYY-MM-DD"
  receiptImage?: string; // base64 데이터 URL
  photos?: string[]; // 음식/가게 사진, base64 데이터 URL 배열 (최대 4장)
  isReservation: boolean; // 예약하고 갔는지 여부, 기본값 false
  isSpecialDay: boolean; // 특별한 날이었는지 여부, 기본값 false
}

// 예전 데이터 호환:
// - 자유 텍스트로 저장된 음식 종류가 고정 목록에 없으면 "기타"로 취급해요.
// - companion/weather/neighborhood 필드가 없으면 빈 문자열로 채워요.
// - menus 필드가 없던 예전 데이터는 빈 배열로 채워요.
// - visitDate 이전에는 visitedAt("YYYY.MM.DD")이라는 이름으로 저장했어서, 있으면 변환해서 사용해요.
// - isReservation 필드가 없던 예전 데이터는 예약 안 함(false)으로 채워요.
// - isSpecialDay 필드가 없던 예전 데이터는 특별한 날 아님(false)으로 채워요.
function parseRestaurants(value: string): Restaurant[] {
  const parsed = JSON.parse(value) as Array<{
    id: string;
    name: string;
    category: unknown;
    companion?: string;
    weather?: string;
    neighborhood?: string;
    menus?: string[];
    memo: string;
    rating: number;
    visitDate?: string;
    visitedAt?: string;
    receiptImage?: string;
    photos?: string[];
    isReservation?: boolean;
    isSpecialDay?: boolean;
  }>;

  return parsed.map((item) => ({
    id: item.id,
    name: item.name,
    category: isCategory(item.category) ? item.category : "기타",
    companion: item.companion ?? "",
    weather: item.weather ?? "",
    neighborhood: item.neighborhood ?? "",
    menus: Array.isArray(item.menus) ? item.menus : [],
    memo: item.memo,
    rating: item.rating,
    visitDate:
      item.visitDate ??
      (item.visitedAt ? item.visitedAt.replaceAll(".", "-") : todayDateInputValue()),
    receiptImage: item.receiptImage,
    photos: Array.isArray(item.photos) ? item.photos : [],
    isReservation: item.isReservation ?? false,
    isSpecialDay: item.isSpecialDay ?? false,
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
