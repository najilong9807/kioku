// Lv.N 등급 표시를 원형 우표 모양(톱니 테두리 + 중앙 레벨 숫자)으로 그려요.
// ProfileView(등급 배지, 등급표 모달)와 MyRecordsView("나의 기록" 표지)에서
// 함께 써서, 앱 전체에서 같은 등급 배지가 같은 모양으로 보이게 해요.
import { THEME_YELLOW_ACCENT, THEME_YELLOW_BG, THEME_YELLOW_TEXT } from "../theme";

export function LevelStamp({
  level,
  size = 40,
  active = true,
}: {
  level: number;
  size?: number;
  active?: boolean;
}) {
  const center = size / 2;
  const perforationRadius = size / 2 - 1;
  const perforationCount = size >= 36 ? 14 : 10;
  const dots = Array.from({ length: perforationCount }, (_, index) => {
    const angle = (index / perforationCount) * Math.PI * 2;
    return {
      cx: center + Math.cos(angle) * perforationRadius,
      cy: center + Math.sin(angle) * perforationRadius,
    };
  });
  const showIcon = size >= 36;
  const ringColor = active ? THEME_YELLOW_ACCENT : "#c3c9d1";
  const fillColor = active ? THEME_YELLOW_BG : "#f2f4f6";
  const textColor = active ? THEME_YELLOW_TEXT : "#8b95a1";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {dots.map((dot) => (
        <circle
          key={`${dot.cx}-${dot.cy}`}
          cx={dot.cx}
          cy={dot.cy}
          r={showIcon ? 1.4 : 1.1}
          fill={ringColor}
        />
      ))}
      <circle
        cx={center}
        cy={center}
        r={center - 6}
        fill={fillColor}
        stroke={ringColor}
        strokeWidth="1.3"
      />
      {showIcon && (
        <text
          x={center}
          y={center - size * 0.16}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.2}
          fill={ringColor}
        >
          ★
        </text>
      )}
      <text
        x={center}
        y={showIcon ? center + size * 0.17 : center + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * (showIcon ? 0.3 : 0.38)}
        fontWeight={700}
        fill={textColor}
      >
        {level}
      </text>
    </svg>
  );
}
