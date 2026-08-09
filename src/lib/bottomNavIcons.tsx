// 하단 네비게이션(홈/맛있는 하루/오늘의 한 입/다가올 한 입/맛집 도감) 전용
// 아이콘 세트예요. lib/quickActionIcons.tsx와 같은 손그림 라인아트 톤(28x28
// viewBox, 둥근 stroke)을 이어가되, 이번 리디자인의 Dark Navy 기본색에 맞춰
// 새로 그렸어요. 레퍼런스 이미지 속 하단 네비 아이콘 구성은 화면마다 서로
// 달라(가운데 + 버튼, 지도/스크랩 등) 정확한 사양이 아니라서 그대로 베끼지
// 않았고, 톤(굵기·손그림 느낌)만 참고해서 실제 5개 탭에 맞춰 그렸어요.
import { DARK_NAVY } from "../theme";

interface BottomNavIconProps {
  size?: number;
  color?: string;
}

// 홈: 지붕+몸체를 한 번에 잇는 단순한 집 모양이에요. 지붕 꼭짓점을 살짝
// 비대칭으로 그려서 손그림 느낌을 살렸어요.
export function HomeNavIcon({ size = 24, color = DARK_NAVY }: BottomNavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M5 13.2 L14 5.4 L23.2 13.2"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.4 11.4 L7.4 22.1 Q7.4 22.6 7.9 22.6 L20.1 22.6 Q20.6 22.6 20.6 22.1 L20.6 11.4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6 22.4 L11.6 16.4 Q11.6 15.6 12.4 15.6 L15.6 15.6 Q16.4 15.6 16.4 16.4 L16.4 22.4"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 맛있는 하루: 밥그릇 + 김. quickActionIcons의 오늘의 식사 아이콘과 같은
// 모티프를 쓰되, 젓가락을 빼고 24px에서도 뭉개지지 않도록 더 단순화했어요.
export function DiaryNavIcon({ size = 24, color = DARK_NAVY }: BottomNavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M4.8 13.9 Q4.8 22.2 14 22.2 Q23.2 22.2 23.2 13.9"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <ellipse cx="14" cy="13.9" rx="9.2" ry="1.9" stroke={color} strokeWidth="1.8" />
      <path
        d="M11.4 12.1 Q10.8 9 12.9 7.4"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M15 11.9 Q15.4 8.6 17.6 6.9"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

// 오늘의 한 입: 말풍선 + 작은 하트. ChatHeartIcon과 같은 모티프를 24px에
// 맞게 다시 그렸어요.
export function TodayBiteNavIcon({ size = 24, color = DARK_NAVY }: BottomNavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M5 9.8 Q5 5.6 9.2 5.6 L18.8 5.6 Q23 5.6 23 9.8 L23 14.9 Q23 19.1 18.8 19.1 L12.3 19.1 L7.4 22.9 L8.3 18.8 Q5 18.5 5 14.9 Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M14 13.6 C10.7 11.3 10.7 9 12.6 9 C13.5 9 14 9.7 14 9.7 C14 9.7 14.5 9 15.4 9 C17.3 9 17.3 11.3 14 13.6 Z"
        fill={color}
      />
    </svg>
  );
}

// 다가올 한 입: 달력 페이지 + 체크. 오늘의 한 입(말풍선)과 확실히 구분되도록
// 네모난 실루엣 + 상단 스프링 두 개로 "일정표" 느낌을 줬어요.
export function UpcomingNavIcon({ size = 24, color = DARK_NAVY }: BottomNavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect
        x="4.8"
        y="6.6"
        width="18.4"
        height="16.2"
        rx="2.6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M4.8 11.4 L23.2 11.4" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.4 4.6 L9.4 8.4" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M18.6 4.6 L18.6 8.4" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M10.3 16.6 L12.7 19 L18 13.6"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
    </svg>
  );
}

// 맛집 도감: 펼쳐진 책. FieldGuideIcon과 같은 모티프를 24px 네비 크기에 맞춰
// 별 장식 없이 더 단순화했어요(작은 크기에서 별까지 넣으면 뭉개져서 뺐어요).
export function FoodDexNavIcon({ size = 24, color = DARK_NAVY }: BottomNavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M14 9.4 C11.5 7.6 8 7 5 7.8 Q4.3 8 4.3 8.8 L4.3 19.6 Q4.3 20.4 5 20.2 C8 19.4 11.5 20 14 21.8"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 9.4 C16.5 7.6 20 7 23 7.8 Q23.7 8 23.7 8.8 L23.7 19.6 Q23.7 20.4 23 20.2 C20 19.4 16.5 20 14 21.8"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 9.4 L14 21.8" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
