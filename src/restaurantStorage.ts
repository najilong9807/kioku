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

// "1년 전 오늘"(정확히 1년 전 같은 월/일)의 "YYYY-MM-DD"예요. 예: 오늘이
// 2026-08-06이면 "2025-08-06"을 돌려줘요. 오늘이 윤년의 2월 29일이어도(작년엔
// 그 날짜 자체가 없었을 거라) 그대로 "YYYY-02-29"를 돌려줘요 — 어차피 그
// 날짜로 저장된 기록은 있을 수 없으니(<input type="date">가 그 해엔 2/29를
// 허용하지 않아요) 자연스럽게 일치하는 기록이 없는 것으로 처리돼요.
export function oneYearAgoDateInputValue(baseDate: Date = new Date()): string {
  const yyyy = baseDate.getFullYear() - 1;
  const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
  const dd = String(baseDate.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// 화면에 보여줄 때는 기존처럼 "YYYY.MM.DD" 형태로 표시해요.
export function formatDisplayDate(value: string): string {
  return value.replaceAll("-", ".");
}

// 상세보기 헤더에 쓰는 "2026년 7월 31일" 형태예요. "YYYY-MM-DD" 문자열을 직접
// 쪼개서 만들기 때문에 Date 파싱에 따른 타임존 오차가 없어요.
export function formatFullKoreanDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

export interface Restaurant {
  id: string;
  name: string;
  title: string; // 일기 제목처럼 쓰는 선택 입력, 없으면 빈 문자열(이 경우 name을 대신 보여줘요)
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
// - title 필드가 없던 예전 데이터는 빈 문자열로 채워요(이름을 대신 보여줘요).
// - companion/weather/neighborhood 필드가 없으면 빈 문자열로 채워요.
// - menus 필드가 없던 예전 데이터는 빈 배열로 채워요.
// - visitDate 이전에는 visitedAt("YYYY.MM.DD")이라는 이름으로 저장했어서, 있으면 변환해서 사용해요.
// - isReservation 필드가 없던 예전 데이터는 예약 안 함(false)으로 채워요.
// - isSpecialDay 필드가 없던 예전 데이터는 특별한 날 아님(false)으로 채워요.
function parseRestaurants(value: string): Restaurant[] {
  const parsed = JSON.parse(value) as Array<{
    id: string;
    name: string;
    title?: string;
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
    title: item.title ?? "",
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
