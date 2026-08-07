// 홈 화면 "이번 주/이번 달" 요약 카드, 프로필 화면 "계절 스탬프"를 위한 순수
// 계산 유틸이에요. Supabase 스키마 변경이나 별도 저장 테이블 없이, 이미
// 로컬(kioku:restaurants)에 있는 맛있는 하루 기록의 visitDate만으로 매번
// 다시 계산해요.
import { toDateInputValue, type Restaurant } from "../restaurantStorage";
import { seasonForMonth, type Season } from "./seasonIcon";

export interface VisitSummary {
  weekCount: number;
  monthCount: number;
  weekLabel: string; // 예: "8월 2주차"
  monthLabel: string; // 예: "8월"
}

// 이번 주의 월요일~일요일 범위를 "YYYY-MM-DD" 문자열로 돌려줘요(한국 관례에
// 맞춰 월요일 시작). date.getDay()는 0(일)~6(토)예요.
function getWeekRange(date: Date): { start: string; end: string } {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toDateInputValue(monday), end: toDateInputValue(sunday) };
}

function getMonthRange(date: Date): { start: string; end: string } {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: toDateInputValue(first), end: toDateInputValue(last) };
}

// visitDate가 "YYYY-MM-DD" 형식이라 문자열 비교만으로 범위 판정이 가능해요
// (restaurantStorage.ts의 다른 날짜 함수들과 동일한 방식이에요).
function countInRange(
  restaurants: Restaurant[],
  start: string,
  end: string,
): number {
  return restaurants.filter(
    (restaurant) =>
      restaurant.visitDate >= start && restaurant.visitDate <= end,
  ).length;
}

export function computeVisitSummary(
  restaurants: Restaurant[],
  now: Date = new Date(),
): VisitSummary {
  const week = getWeekRange(now);
  const month = getMonthRange(now);
  const weekOfMonth = Math.ceil(now.getDate() / 7);

  return {
    weekCount: countInRange(restaurants, week.start, week.end),
    monthCount: countInRange(restaurants, month.start, month.end),
    weekLabel: `${now.getMonth() + 1}월 ${weekOfMonth}주차`,
    monthLabel: `${now.getMonth() + 1}월`,
  };
}

// 프로필 화면 "계절 스탬프"용이에요. 등급 시스템과 별개로, 올해(year) 기록을
// 방문월 기준 계절별로 세어요. 영구 저장하는 스탬프가 아니라 볼 때마다
// 로컬 기록에서 다시 계산하는 가벼운 집계예요. visitDate 문자열에서 월을
// 직접 뽑아 쓰기 때문에(Date 파싱 없음) 타임존에 영향받지 않아요.
export function computeSeasonStamps(
  restaurants: Restaurant[],
  year: number = new Date().getFullYear(),
): Record<Season, number> {
  const counts: Record<Season, number> = {
    spring: 0,
    summer: 0,
    autumn: 0,
    winter: 0,
  };

  for (const restaurant of restaurants) {
    const [visitYear, visitMonth] = restaurant.visitDate
      .split("-")
      .map(Number);
    if (visitYear !== year) {
      continue;
    }
    counts[seasonForMonth(visitMonth)] += 1;
  }

  return counts;
}
