// 홈 화면 퀵액션 타일(오늘의 식사/오늘의 한 입 보기/지도/스크랩)에 쓰는 커스텀
// 라인아트 아이콘이에요. lucide 기본 아이콘 대신, 아바타·문항 일러스트와 톤을
// 맞춘 손그림 느낌의 SVG로 새로 그렸어요. lucide 아이콘과 같은 방식으로
// size/color props를 받아서 기존 사용부(QuickActionButton)를 그대로 재사용해요.
// color는 호출부(HomeScreen)에서 세이지그린 계열(#4A6350, #9CAF9A 톤)로 통일해서
// 넘겨줘요.

interface QuickActionIconProps {
  size?: number;
  color?: string;
}

// 오늘의 식사: 밥그릇 + 김이 피어오르는 모습 + 젓가락. 그릇 입구를 얇은 타원으로
// 따로 그려서 위에서 살짝 내려다보는 느낌을 주고, 김/젓가락이 서로 겹치지
// 않도록 위치를 정리했어요.
export function RiceBowlIcon({
  size = 24,
  color = "#191f28",
}: QuickActionIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M4.5 13.7 Q4.5 22.3 14 22.3 Q23.5 22.3 23.5 13.7"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <ellipse
        cx="14"
        cy="13.7"
        rx="9.5"
        ry="1.9"
        stroke={color}
        strokeWidth="1.8"
      />
      <path
        d="M9.8 12.3 Q9.1 9.3 11.6 8"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M13.9 12 Q13.9 8.4 16.6 6.9"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />
      <line
        x1="18.6"
        y1="4.3"
        x2="22.3"
        y2="15.3"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="21.3"
        y1="4.6"
        x2="24.3"
        y2="14.6"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 오늘의 한 입 보기: 둥글고 부드러운 말풍선 + 안에 작은 하트(따뜻한 공감/나눔
// 느낌). 하트를 말풍선 정중앙에 맞추고 좌우 대칭을 다듬었어요.
export function ChatHeartIcon({
  size = 24,
  color = "#191f28",
}: QuickActionIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M5 9.5 Q5 5.2 9.3 5.2 L18.7 5.2 Q23 5.2 23 9.5 L23 14.8 Q23 19.1 18.7 19.1 L12.2 19.1 L7.2 23 L8.2 18.7 Q5 18.4 5 14.8 Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M14 13.9 C10.5 11.5 10.5 9 12.5 9 C13.5 9 14 9.8 14 9.8 C14 9.8 14.5 9 15.5 9 C17.5 9 17.5 11.5 14 13.9 Z"
        fill={color}
      />
    </svg>
  );
}

// 지도: 실제 지도 화면(시/도별 기록 클러스터)으로 이어지는 아이콘이에요. 국토
// 실루엣을 옅게 깔고 그 위에 위치 핀을 또렷하게 올려서, "이 앱에서 기록한
// 장소들을 지도로 본다"는 느낌을 바로 전달해요.
export function FoldedMapPinIcon({
  size = 24,
  color = "#191f28",
}: QuickActionIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M13 4.3 Q17 4.8 17.6 8.3 Q20.6 10.9 19.1 14.4 Q20.2 17.9 16.6 19.9 Q17.1 22.9 13.6 23.4 Q9.5 23.9 8 20.9 Q5 20.4 5.5 16.9 Q3.4 14.9 5 11.9 Q4.4 8.9 7.5 7.4 Q8.5 4.8 13 4.3 Z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
        opacity="0.45"
      />
      <path
        d="M17 8 Q21.3 8 21.3 12.3 Q21.3 15.6 17 20.4 Q12.7 15.6 12.7 12.3 Q12.7 8 17 8 Z"
        fill={color}
      />
      <circle cx="17" cy="12.1" r="1.7" fill="#ffffff" />
    </svg>
  );
}

// 맛집 도감: 펼쳐진 책(양쪽 페이지 + 가운데 책등) + 오른쪽 위 작은 별로,
// "모아서 정리해 둔 기록집" 느낌을 줘요.
export function FieldGuideIcon({
  size = 24,
  color = "#191f28",
}: QuickActionIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M14 9.2 C11.5 7.4 8 6.8 5 7.6 Q4.3 7.8 4.3 8.6 L4.3 19.6 Q4.3 20.4 5 20.2 C8 19.4 11.5 20 14 21.8"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 9.2 C16.5 7.4 20 6.8 23 7.6 Q23.7 7.8 23.7 8.6 L23.7 19.6 Q23.7 20.4 23 20.2 C20 19.4 16.5 20 14 21.8"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="14"
        y1="9.2"
        x2="14"
        y2="21.8"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M21.5 4.3 L22.2 5.9 L23.9 6.1 L22.6 7.2 L23 8.9 L21.5 8 L20 8.9 L20.4 7.2 L19.1 6.1 L20.8 5.9 Z"
        fill={color}
      />
    </svg>
  );
}

// 스크랩: 리본형 북마크예요. 아래쪽 V자 노치를 좀 더 뾰족하게, 안쪽 텍스트
// 줄(굵기 다른 두 줄)을 더해서 "저장해 둔 글" 느낌을 또렷하게 살렸어요.
export function BookmarkRibbonIcon({
  size = 24,
  color = "#191f28",
}: QuickActionIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M8.5 4.5 Q7.5 4.5 7.5 5.6 L7.5 23.5 L14 18.2 L20.5 23.5 L20.5 5.6 Q20.5 4.5 19.5 4.5 Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M10.5 8.4 L17.5 8.4"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M10.5 11.6 L15.3 11.6"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
