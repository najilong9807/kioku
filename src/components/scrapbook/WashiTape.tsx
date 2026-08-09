// 스크랩북 다이어리 디자인 시스템의 워시테이프예요. 사진이나 카드 모서리에
// 살짝 걸쳐놓는 장식용이라, 배경이 투명하고 기본값으로 position: absolute를
// 써요 — 부모에 position: relative만 잡아주고 top/left(또는 style)로
// 위치만 지정하면 바로 걸쳐놓을 수 있어요.
import { useId, type CSSProperties } from "react";
import { WASHI_PINK, WASHI_SAGE } from "../../theme";

export type WashiTapeColor = "sage" | "pink";

const WASHI_TAPE_COLORS: Record<WashiTapeColor, string> = {
  sage: WASHI_SAGE,
  pink: WASHI_PINK,
};

export interface WashiTapeProps {
  /** 테이프 색상 계열이에요. */
  color?: WashiTapeColor;
  /** 테이프가 기울어지는 각도(도)예요. */
  rotation?: number;
  /** 테이프 길이(px)예요. */
  width?: number;
  /** 테이프 두께(px)예요. */
  height?: number;
  className?: string;
  style?: CSSProperties;
}

// 체크무늬(깅엄) 패턴을 SVG pattern으로 그려서, 실제 워시테이프처럼 반투명한
// 느낌을 내요. 여러 개를 한 화면에 겹쳐 놓을 수 있어서 pattern id는
// useId()로 인스턴스마다 고유하게 만들어요.
export function WashiTape({
  color = "sage",
  rotation = -6,
  width = 90,
  height = 26,
  className,
  style,
}: WashiTapeProps) {
  const tapeColor = WASHI_TAPE_COLORS[color];
  const patternId = `washi-tape-${useId()}`;
  const cell = 8;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        display: "block",
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center",
        pointerEvents: "none",
        overflow: "visible",
        ...style,
      }}
    >
      <defs>
        <pattern
          id={patternId}
          width={cell * 2}
          height={cell * 2}
          patternUnits="userSpaceOnUse"
        >
          <rect width={cell * 2} height={cell * 2} fill={tapeColor} fillOpacity="0.32" />
          <rect width={cell} height={cell} fill={tapeColor} fillOpacity="0.5" />
          <rect x={cell} y={cell} width={cell} height={cell} fill={tapeColor} fillOpacity="0.5" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill={`url(#${patternId})`} />
      {/* 위에 옅은 흰 막을 한 겹 덮어서, 인쇄된 패턴이 아니라 반투명한 테이프
          위로 배경이 살짝 비치는 느낌을 살려요. */}
      <rect width={width} height={height} fill="#ffffff" fillOpacity="0.15" />
    </svg>
  );
}
