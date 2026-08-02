// 홈 화면 퀵액션 타일(오늘의 식사/오늘의 한 입 보기/지도/스크랩)에 쓰는 커스텀
// 라인아트 아이콘이에요. lucide 기본 아이콘 대신, 아바타·문항 일러스트와 톤을
// 맞춘 손그림 느낌의 SVG로 새로 그렸어요. lucide 아이콘과 같은 방식으로
// size/color props를 받아서 기존 사용부(QuickActionButton)를 그대로 재사용해요.

interface QuickActionIconProps {
  size?: number;
  color?: string;
}

// 오늘의 식사: 밥그릇 + 김이 피어오르는 모습 + 젓가락.
export function RiceBowlIcon({ size = 24, color = "#191f28" }: QuickActionIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M5 13.5 Q5 22 14 22 Q23 22 23 13.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M4 13.5 L24 13.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M8.7 13 Q8.7 10.3 11.2 9.7"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M13.2 9.3 Q13.2 6.6 15.4 6"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />
      <line x1="17.5" y1="4" x2="21.5" y2="15.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="20.3" y1="4" x2="23.3" y2="15" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// 오늘의 한 입 보기: 둥글고 부드러운 말풍선 + 안에 작은 하트(따뜻한 공감/나눔 느낌).
export function ChatHeartIcon({ size = 24, color = "#191f28" }: QuickActionIconProps) {
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
        d="M14 13.6 Q10.2 11.2 10.2 9 Q10.2 7.3 11.9 7.3 Q13.1 7.3 14 8.8 Q14.9 7.3 16.1 7.3 Q17.8 7.3 17.8 9 Q17.8 11.2 14 13.6 Z"
        fill={color}
        opacity="0.85"
      />
    </svg>
  );
}

// 지도: 접힌 지도(접힘선) + 그 위에 놓인 위치 핀.
export function FoldedMapPinIcon({ size = 24, color = "#191f28" }: QuickActionIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M5 7.5 L11 5.3 L17 7.5 L23 5.3 L23 20.5 L17 22.7 L11 20.5 L5 22.7 Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M11 5.3 L11 20.5 M17 7.5 L17 22.7"
        stroke={color}
        strokeWidth="1.1"
        strokeDasharray="1.4 2.2"
        opacity="0.55"
      />
      <path
        d="M15 9.6 Q19.2 9.6 19.2 13.3 Q19.2 16.4 15 20.2 Q10.8 16.4 10.8 13.3 Q10.8 9.6 15 9.6 Z"
        fill={color}
      />
      <circle cx="15" cy="13.1" r="1.6" fill="#ffffff" />
    </svg>
  );
}

// 스크랩: 리본형 북마크 + 안쪽 포인트 선.
export function BookmarkRibbonIcon({ size = 24, color = "#191f28" }: QuickActionIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M8 4.5 L20 4.5 L20 24 L14 18.8 L8 24 Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M11 9.2 L17 9.2" stroke={color} strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
