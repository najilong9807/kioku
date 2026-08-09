// 스크랩북 다이어리 디자인 시스템의 손그림 장식 아이콘 세트예요.
// lib/quickActionIcons.tsx와 같은 톤(28x28 viewBox, 가는 stroke, 둥근 선
// 끝)을 맞추되, 이 세트는 장식 용도라 기본 색을 세이지그린 계열로 잡았어요.
import { SAGE_GREEN, SAGE_GREEN_DARK } from "../../theme";

export interface DecorationIconProps {
  size?: number;
  color?: string;
}

// 반짝이는 별: 4개의 뾰족한 꼭짓점을 가진 별 하나에, 옆에 작은 별 두 개를
// 더해서 "반짝임"을 표현해요.
export function SparkleStarIcon({
  size = 24,
  color = SAGE_GREEN_DARK,
}: DecorationIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M14 3 C14.8 9 15 12.2 21 14 C15 15.8 14.8 19 14 25 C13.2 19 13 15.8 7 14 C13 12.2 13.2 9 14 3 Z"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M22.5 4.5 L23 6.3 L24.8 6.8 L23 7.3 L22.5 9.1 L22 7.3 L20.2 6.8 L22 6.3 Z"
        fill={color}
        opacity="0.7"
      />
      <path
        d="M5 19 L5.4 20.3 L6.7 20.7 L5.4 21.1 L5 22.4 L4.6 21.1 L3.3 20.7 L4.6 20.3 Z"
        fill={color}
        opacity="0.55"
      />
    </svg>
  );
}

// 손그림 하트: 좌우가 살짝 비대칭이라 자연스러운 손그림 느낌이 나요.
export function HandDrawnHeartIcon({
  size = 24,
  color = SAGE_GREEN_DARK,
}: DecorationIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M14 23.5 C6 18 3.5 13.8 3.5 10 C3.5 6.6 6.1 4.5 9 4.5 C11.2 4.5 13 5.9 14 8 C15 5.9 16.8 4.5 19 4.5 C21.9 4.5 24.5 6.6 24.5 10 C24.5 13.8 22 18 14 23.5 Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 작은 X자 반짝임: 손글씨 인사말이나 제목 옆에 콕콕 찍는 작은 반짝임이에요.
export function SparkleIcon({
  size = 16,
  color = SAGE_GREEN_DARK,
}: DecorationIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <g stroke={color} strokeWidth="1.8" strokeLinecap="round">
        <line x1="14" y1="5" x2="14" y2="23" />
        <line x1="5" y1="14" x2="23" y2="14" />
      </g>
      <g stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6">
        <line x1="9" y1="9" x2="19" y2="19" />
        <line x1="19" y1="9" x2="9" y2="19" />
      </g>
    </svg>
  );
}

export interface SwashUnderlineProps {
  /** 밑줄 길이(px)예요. 손글씨 문구 폭에 맞춰 가변으로 써요. */
  width?: number;
  /** 밑줄 두께(획 굵기, px)예요. */
  strokeWidth?: number;
  color?: string;
}

// 물결 밑줄: 손글씨 인사말/제목 아래에 까는 가변 폭 물결선이에요. width에
// 맞춰 물결 개수를 자동으로 나눠요.
export function SwashUnderline({
  width = 120,
  strokeWidth = 2,
  color = SAGE_GREEN,
}: SwashUnderlineProps) {
  const height = 10;
  const waveLength = 18;
  const waveCount = Math.max(2, Math.round(width / waveLength));
  const segmentWidth = width / waveCount;

  let path = `M0,${height / 2}`;
  for (let i = 0; i < waveCount; i++) {
    const controlX = (i + 0.5) * segmentWidth;
    const controlY = i % 2 === 0 ? 1.5 : height - 1.5;
    const endX = (i + 1) * segmentWidth;
    path += ` Q${controlX},${controlY} ${endX},${height / 2}`;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
