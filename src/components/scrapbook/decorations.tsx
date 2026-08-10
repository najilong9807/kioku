// 스크랩북 다이어리 디자인 시스템의 손그림 장식 아이콘 세트예요.
// lib/quickActionIcons.tsx와 같은 톤(28x28 viewBox, 가는 stroke, 둥근 선
// 끝)을 맞추되, 이 세트는 장식 용도라 기본 색을 세이지그린 계열로 잡았어요.
import heartImage from "../../assets/images/decorations/heart.png";
import starFilledImage from "../../assets/images/decorations/star-filled.png";
import { SAGE_GREEN, SAGE_GREEN_DARK } from "../../theme";

export interface DecorationIconProps {
  size?: number;
  color?: string;
}

// 반짝이는 별: 확정 PNG 에셋(손그림 채색 별 스티커)을 그대로 써요. PNG라
// 색을 바꿀 수 없어서 `color` prop은 기존 호출부 호환을 위해 시그니처에는
// 남겨두되 내부에서는 쓰지 않아요.
export function SparkleStarIcon({ size = 24 }: DecorationIconProps) {
  return (
    <img
      src={starFilledImage}
      alt=""
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        objectFit: "contain",
      }}
    />
  );
}

// 손그림 하트: 확정 PNG 에셋(손그림 하트 스티커)을 그대로 써요. PNG라 색을
// 바꿀 수 없어서 `color` prop은 기존 호출부 호환을 위해 시그니처에는
// 남겨두되 내부에서는 쓰지 않아요.
export function HandDrawnHeartIcon({ size = 24 }: DecorationIconProps) {
  return (
    <img
      src={heartImage}
      alt=""
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        objectFit: "contain",
      }}
    />
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
