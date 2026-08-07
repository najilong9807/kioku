import type { ReactNode } from "react";

// 맛있는 하루/오늘의 한 입/다가올 한 입/스크랩, 4개 화면이 완전히 비어있을 때
// Result의 figure로 넣는 손그림 라인아트 아이콘이에요. quickActionIcons.tsx와
// 같은 톤(28x28 viewBox, 얇은 stroke, 둥근 선 끝)으로 맞췄고, 홈 화면 퀵액션
// 타일과 같은 세이지그린 원형 배지(#EAF0EA 배경 + #9CAF9A 아이콘) 안에 담아요.

interface EmptyStateIconProps {
  size?: number;
  color?: string;
}

// 맛있는 하루: 펼쳐진 노트. 아직 채워지지 않은 줄무늬로 "쓸 준비가 된 빈 페이지"를 표현해요.
export function EmptyDiaryIcon({
  size = 28,
  color = "#191f28",
}: EmptyStateIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M4 8.3 Q4 6.4 5.9 6.2 L13 5.5 L13 21.6 L5.9 22.3 Q4 22.5 4 20.6 Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M24 8.3 Q24 6.4 22.1 6.2 L15 5.5 L15 21.6 L22.1 22.3 Q24 22.5 24 20.6 Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="10.4"
        x2="11.2"
        y2="10"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="7"
        y1="13.6"
        x2="11.2"
        y2="13.2"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="7"
        y1="16.8"
        x2="10"
        y2="16.5"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

// 오늘의 한 입: 빈 말풍선 + "+". 홈 화면 ChatHeartIcon과 같은 말풍선 윤곽을 쓰되,
// 하트 대신 "첫 글을 남겨보세요"를 뜻하는 + 표시를 넣었어요.
export function EmptyChatIcon({
  size = 28,
  color = "#191f28",
}: EmptyStateIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M5 9.5 Q5 5.2 9.3 5.2 L18.7 5.2 Q23 5.2 23 9.5 L23 14.8 Q23 19.1 18.7 19.1 L12.2 19.1 L7.2 23 L8.2 18.7 Q5 18.4 5 14.8 Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="8.6"
        x2="14"
        y2="15.6"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="10.5"
        y1="12.1"
        x2="17.5"
        y2="12.1"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

// 다가올 한 입: 아무 표시 없는 달력. 아직 아무 일정도 잡히지 않은 상태를 뜻해요.
export function EmptyCalendarIcon({
  size = 28,
  color = "#191f28",
}: EmptyStateIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect
        x="4.5"
        y="6.5"
        width="19"
        height="17"
        rx="3"
        stroke={color}
        strokeWidth="1.6"
      />
      <line
        x1="4.5"
        y1="11.3"
        x2="23.5"
        y2="11.3"
        stroke={color}
        strokeWidth="1.6"
      />
      <line
        x1="9"
        y1="4"
        x2="9"
        y2="8"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="19"
        y1="4"
        x2="19"
        y2="8"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="9.7"
        y1="16"
        x2="13.3"
        y2="16"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.5"
      />
      <line
        x1="9.7"
        y1="19.3"
        x2="12"
        y2="19.3"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

// 스크랩: 리본 북마크 + "+". BookmarkRibbonIcon과 같은 윤곽에, 안쪽 텍스트
// 줄 대신 + 표시로 "아직 저장한 게 없다"는 느낌을 줘요.
export function EmptyBookmarkIcon({
  size = 28,
  color = "#191f28",
}: EmptyStateIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M8.5 4.5 Q7.5 4.5 7.5 5.6 L7.5 23.5 L14 18.2 L20.5 23.5 L20.5 5.6 Q20.5 4.5 19.5 4.5 Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <line
        x1="11"
        y1="11"
        x2="17"
        y2="11"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      <line
        x1="14"
        y1="8"
        x2="14"
        y2="14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

// Result의 figure로 넣는 원형 배지예요. 홈 화면 퀵액션 타일과 같은 배경색
// (#EAF0EA)을 써서, 빈 상태에서도 같은 브랜드 톤이 이어지도록 해요.
export function EmptyStateFigure({
  icon,
  size = 72,
}: {
  icon: ReactNode;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#EAF0EA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
      }}
    >
      {icon}
    </div>
  );
}
