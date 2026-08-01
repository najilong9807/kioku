import { Storage } from "@apps-in-toss/web-framework";
import { todayDateInputValue } from "../restaurantStorage";

const PLANNED_VISITS_STORAGE_KEY = "kioku:plannedVisits";

// 맛집 기록(restaurantStorage.ts)과 똑같이 기기에만 저장해요. 아직 다녀오지 않은
// "방문 예정"이라 서버에 공유할 필요가 없고, 기존 맛집 기록과 저장 방식을
// 일관되게 맞추기 위해서예요.
export interface PlannedVisit {
  id: string;
  name: string; // 가게 이름
  memo: string; // 선택 입력, 없으면 빈 문자열
  visitDate: string; // "YYYY-MM-DD" 방문 예정일
}

function parsePlannedVisits(value: string): PlannedVisit[] {
  const parsed = JSON.parse(value) as Array<{
    id: string;
    name: string;
    memo?: string;
    visitDate: string;
  }>;

  return parsed.map((item) => ({
    id: item.id,
    name: item.name,
    memo: item.memo ?? "",
    visitDate: item.visitDate,
  }));
}

// 앱인토스 네이티브 Storage는 토스 앱/샌드박스 웹뷰 안에서만 동작해요. 일반
// 브라우저(로컬 개발 미리보기)에는 네이티브 브릿지가 없어서 호출이 실패하기
// 때문에, 그런 경우엔 브라우저 localStorage로 대체해요. (restaurantStorage.ts와
// 동일한 패턴이에요.)
export async function loadPlannedVisits(): Promise<PlannedVisit[]> {
  try {
    const value = await Storage.getItem(PLANNED_VISITS_STORAGE_KEY);
    if (value) {
      return parsePlannedVisits(value);
    }
  } catch {
    // 네이티브 브릿지를 사용할 수 없는 환경이에요. localStorage로 대체해요.
  }

  try {
    const value = localStorage.getItem(PLANNED_VISITS_STORAGE_KEY);
    if (value) {
      return parsePlannedVisits(value);
    }
  } catch {
    // ignore
  }

  return [];
}

export async function savePlannedVisits(
  visits: PlannedVisit[],
): Promise<void> {
  const serialized = JSON.stringify(visits);

  try {
    await Storage.setItem(PLANNED_VISITS_STORAGE_KEY, serialized);
    return;
  } catch {
    // 네이티브 브릿지를 사용할 수 없는 환경이에요. localStorage로 대체해요.
  }

  try {
    localStorage.setItem(PLANNED_VISITS_STORAGE_KEY, serialized);
  } catch {
    // ignore (예: 저장 공간 부족)
  }
}

// 오늘부터 visitDate까지 남은 일수예요. 지난 날짜면 음수가 나와요. 둘 다
// "YYYY-MM-DD" 형태라서 Date로 파싱해도(둘 다 UTC 자정 기준으로 동일하게
// 해석되어) 타임존에 영향받지 않고 일수 차이만 정확히 계산돼요.
export function getDaysUntil(visitDate: string): number {
  const today = new Date(todayDateInputValue());
  const target = new Date(visitDate);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// D-day 표시 문구예요. 오늘이면 "D-day", 미래면 "D-N", 지났으면 "D+N"으로 보여줘요.
export function formatDDay(daysUntil: number): string {
  if (daysUntil === 0) {
    return "D-day";
  }
  return daysUntil > 0 ? `D-${daysUntil}` : `D+${Math.abs(daysUntil)}`;
}

// 방문 예정 목록을 방문 예정일 가까운 순(오름차순)으로 정렬해요. 지난 일정도
// 함께 포함되어 있으면 그게 먼저 나와요(가장 급한 것부터).
export function sortPlannedVisitsByDate(
  visits: PlannedVisit[],
): PlannedVisit[] {
  return [...visits].sort((a, b) => a.visitDate.localeCompare(b.visitDate));
}
