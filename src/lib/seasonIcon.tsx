// 홈 화면 인사말 옆에 곁들이는 작은 계절 아이콘이에요. quickActionIcons.tsx와
// 같은 손그림 라인아트 톤(28x28 viewBox, 얇은 stroke, 둥근 선 끝)으로 맞췄어요.

interface SeasonIconProps {
  size?: number;
  color?: string;
}

export type Season = "spring" | "summer" | "autumn" | "winter";

// 월(1~12) 기준으로 계절을 판단해요. 3~5월 봄, 6~8월 여름, 9~11월 가을, 12~2월
// 겨울. "YYYY-MM-DD" 문자열에서 뽑은 월처럼, Date 객체 없이 순수 숫자로 판단해야
// 할 때(예: lib/recordSummary.ts) 이 함수를 바로 써요 — new Date(dateString)로
// 파싱하면 타임존에 따라 자정 근처 날짜의 월이 하루 밀릴 수 있어서예요
// (restaurantStorage.ts의 다른 날짜 함수들과 동일한 이유로 문자열을 직접 다뤄요).
export function seasonForMonth(month: number): Season {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function getCurrentSeason(date: Date = new Date()): Season {
  return seasonForMonth(date.getMonth() + 1);
}

// 봄: 벚꽃. 꽃잎 하나를 그려서 중심을 기준으로 72도씩 회전시켜 다섯 장을 만들어요.
function SakuraIcon({ size = 20, color = "#191f28" }: SeasonIconProps) {
  const petal =
    "M0,-1 Q-3.2,-3 -2.6,-6.2 Q-2.2,-8.4 0,-9.2 Q2.2,-8.4 2.6,-6.2 Q3.2,-3 0,-1 Z";
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      {[0, 72, 144, 216, 288].map((angle) => (
        <g key={angle} transform={`translate(14,14) rotate(${angle})`}>
          <path
            d={petal}
            stroke={color}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </g>
      ))}
      <circle cx="14" cy="14" r="1.5" fill={color} />
    </svg>
  );
}

// 여름: 해가 살짝 걸린 장마 구름과 빗방울. 한국 여름의 "해+장마" 느낌을 한
// 아이콘에 같이 담았어요.
function MonsoonSunIcon({ size = 20, color = "#191f28" }: SeasonIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="18.2" cy="9" r="3.2" stroke={color} strokeWidth="1.4" />
      <g stroke={color} strokeWidth="1.2" strokeLinecap="round">
        <line x1="18.2" y1="3.3" x2="18.2" y2="1.4" />
        <line x1="23.2" y1="5.6" x2="24.6" y2="4.2" />
        <line x1="23.5" y1="10.3" x2="25.3" y2="11" />
      </g>
      <path
        d="M6 18 Q3.5 18 3.5 15.3 Q3.5 12.8 6.3 12.6 Q7 9.8 10 9.8 Q13.3 9.8 14 12.7 Q17 12.5 17 15.5 Q17 18 14 18 Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 21 Q8 22.6 6.7 22.6 Q5.4 22.6 5.4 21 Q5.4 19.8 6.7 18.5 Q8 19.8 8 21 Z"
        stroke={color}
        strokeWidth="1.1"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path
        d="M13.7 22.3 Q13.7 23.6 12.5 23.6 Q11.4 23.6 11.4 22.3 Q11.4 21.3 12.5 20.2 Q13.7 21.3 13.7 22.3 Z"
        stroke={color}
        strokeWidth="1.1"
        strokeLinejoin="round"
        opacity="0.45"
      />
    </svg>
  );
}

// 가을: 단풍잎. 8개의 뾰족한 점을 잇는 별 모양 윤곽 + 잎자루.
function MapleLeafIcon({ size = 20, color = "#191f28" }: SeasonIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path
        d="M14 4 L15.6 8.4 L19.6 6.3 L18 10.4 L22.6 10.7 L19 13.4 L22.9 16.6 L18.3 16.3 L19.5 20.6 L15.8 18 L14.6 22.6 L13.4 18 L9.7 20.6 L10.9 16.3 L6.3 16.6 L10.2 13.4 L6.6 10.7 L11.2 10.4 L9.6 6.3 L13.6 8.4 Z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <line
        x1="14"
        y1="13"
        x2="14"
        y2="24.3"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 겨울: 눈송이. 세 개의 직선이 교차하고, 세로축에 작은 가지를 더했어요.
function SnowflakeIcon({ size = 20, color = "#191f28" }: SeasonIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round">
        <line x1="14" y1="4" x2="14" y2="24" />
        <line x1="5.7" y1="9" x2="22.3" y2="19" />
        <line x1="22.3" y1="9" x2="5.7" y2="19" />
      </g>
      <g stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.7">
        <line x1="14" y1="8" x2="11.3" y2="6.5" />
        <line x1="14" y1="8" x2="16.7" y2="6.5" />
        <line x1="14" y1="20" x2="11.3" y2="21.5" />
        <line x1="14" y1="20" x2="16.7" y2="21.5" />
      </g>
    </svg>
  );
}

// 계절별 아이콘 컴포넌트예요. 프로필 화면의 "계절 스탬프"처럼 특정 계절
// 하나를 지정해서 그려야 할 때는 이 맵을 바로 써요.
export const SEASON_ICONS: Record<
  Season,
  (props: SeasonIconProps) => React.JSX.Element
> = {
  spring: SakuraIcon,
  summer: MonsoonSunIcon,
  autumn: MapleLeafIcon,
  winter: SnowflakeIcon,
};

export const SEASON_LABELS: Record<Season, string> = {
  spring: "봄",
  summer: "여름",
  autumn: "가을",
  winter: "겨울",
};

// 현재 월 기준 계절 아이콘을 보여줘요. 홈 화면 인사말 옆처럼 작은 보조
// 요소로 쓰는 걸 기준으로 기본 크기를 20px로 잡았어요.
export function SeasonIcon({ size = 20, color = "#191f28" }: SeasonIconProps) {
  const season = getCurrentSeason();
  const Icon = SEASON_ICONS[season];
  return <Icon size={size} color={color} />;
}
