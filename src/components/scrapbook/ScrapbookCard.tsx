// 스크랩북 다이어리 디자인 시스템의 카드 배경이에요. 크림색 종이 + 옅은
// 그리드 패턴을 기본으로 하고, showRings를 켜면 왼쪽에 스프링 바인더
// 링(3~5개)을 곁들여요. 기존 카드형 UI를 그대로 감싸는 wrapper로 써요.
import type { CSSProperties, ReactNode } from "react";
import { PAPER_CREAM, PAPER_GRID_LINE, RING_METAL } from "../../theme";

const GRID_SIZE = 20;

export interface ScrapbookCardProps {
  /** 왼쪽에 스프링 바인더 링을 보여줄지 정해요. */
  showRings?: boolean;
  /** 링 개수(3~5개 권장)예요. */
  ringCount?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function BinderRings({ count }: { count: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: "1px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-evenly",
        padding: "16px 0",
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          style={{
            display: "block",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            border: `3px solid ${RING_METAL}`,
            backgroundColor: PAPER_CREAM,
            boxShadow:
              "inset 0 1px 1px rgba(255, 255, 255, 0.6), 0 1px 2px rgba(25, 31, 40, 0.15)",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

export function ScrapbookCard({
  showRings = false,
  ringCount = 4,
  children,
  className,
  style,
}: ScrapbookCardProps) {
  const clampedRingCount = Math.min(5, Math.max(3, ringCount));

  return (
    <div
      className={className}
      style={{
        position: "relative",
        borderRadius: "18px",
        backgroundColor: PAPER_CREAM,
        backgroundImage: `linear-gradient(${PAPER_GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${PAPER_GRID_LINE} 1px, transparent 1px)`,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        boxShadow: "0 4px 16px rgba(74, 99, 80, 0.12)",
        padding: showRings ? "20px 20px 20px 36px" : "20px",
        boxSizing: "border-box",
        overflow: "hidden",
        ...style,
      }}
    >
      {showRings && <BinderRings count={clampedRingCount} />}
      {children}
    </div>
  );
}
