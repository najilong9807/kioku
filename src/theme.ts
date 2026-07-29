import type { CSSProperties } from "react";

// index.css에서 @font-face로 등록한 손글씨 폰트예요.
export const HANDWRITING_FONT_FAMILY =
  "'Ownglyph_ParkDaHyun', 'Pretendard', sans-serif";

// 감성 메모(맛집 기록의 "메모" 필드, 오늘뭐먹 글 등)에 적용하는 손글씨 스타일이에요.
// 손글씨 폰트는 획이 성글고 커 보여서, 본문 폰트보다 살짝 크게 + 줄간격을 넉넉하게 줘야
// 답답해 보이지 않아요.
export const HANDWRITING_TEXT_STYLE: CSSProperties = {
  fontFamily: HANDWRITING_FONT_FAMILY,
  fontSize: "18px",
  lineHeight: 1.8,
  letterSpacing: "0.2px",
};
