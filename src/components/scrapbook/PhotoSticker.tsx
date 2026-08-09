// 스크랩북 다이어리 디자인 시스템의 사진 스티커예요. 사진을 흰 여백(폴라로이드
// 느낌) + 그림자 + 살짝 기울어진 각도로 감싸서, 다이어리에 사진을 붙여둔
// 듯한 느낌을 내요. src가 없으면 자리표시 아이콘을 보여줘요.
import type { CSSProperties } from "react";
import { SAGE_GREEN, SAGE_GREEN_BG } from "../../theme";

export interface PhotoStickerProps {
  /** 사진 URL(base64 데이터 URL도 가능)이에요. 없으면 자리표시 아이콘을 보여줘요. */
  src?: string;
  /** 스크린 리더용 대체 텍스트예요. */
  alt?: string;
  /** 스티커가 기울어지는 각도(도)예요. */
  rotation?: number;
  /** 스티커 한 변의 길이(px)예요. */
  size?: number;
  /** 여러 장을 겹쳐 놓을 때 위아래 순서를 정해요. */
  zIndex?: number;
  className?: string;
  style?: CSSProperties;
}

// 사진이 없을 때 보여주는 손그림 톤 자리표시 아이콘(산 + 해)이에요.
// lib/quickActionIcons.tsx와 같은 28x28 viewBox·가는 stroke 톤을 맞췄어요.
function PhotoPlaceholderIcon() {
  return (
    <svg width="40%" height="40%" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="20" cy="8" r="2.6" stroke={SAGE_GREEN} strokeWidth="1.4" />
      <path
        d="M3.5 21 L10 12.5 L14.5 18 L18 14 L24.5 21 Z"
        stroke={SAGE_GREEN}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PhotoSticker({
  src,
  alt = "",
  rotation = -4,
  size = 120,
  zIndex,
  className,
  style,
}: PhotoStickerProps) {
  const framePadding = Math.max(6, Math.round(size * 0.06));

  return (
    <div
      className={className}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        padding: framePadding,
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        borderRadius: "6px",
        boxShadow: "0 8px 16px rgba(25, 31, 40, 0.2)",
        transform: `rotate(${rotation}deg)`,
        zIndex,
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: "2px",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "2px",
            backgroundColor: SAGE_GREEN_BG,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PhotoPlaceholderIcon />
        </div>
      )}
    </div>
  );
}
