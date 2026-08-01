import type { CSSProperties } from "react";

// index.css에서 @font-face로 등록한 손글씨 폰트예요. Regular 굵기만 배포되어 있어서
// fontWeight는 항상 400으로 고정해서 써야, 브라우저가 가짜로 굵게 그려 획이 뭉개지는
// 문제를 피할 수 있어요.
export const HANDWRITING_FONT_FAMILY =
  "'GriunXHangeul_DAHL', 'Pretendard', sans-serif";

// 감성 메모(맛집 기록의 "메모" 필드, 오늘뭐먹 글 등)에 적용하는 손글씨 스타일이에요.
// 손글씨 폰트는 획이 성글고 커 보여서, 본문 폰트보다 살짝 크게 + 줄간격을 넉넉하게 줘야
// 답답해 보이지 않아요.
export const HANDWRITING_TEXT_STYLE: CSSProperties = {
  fontFamily: HANDWRITING_FONT_FAMILY,
  fontWeight: 400,
  fontSize: "18px",
  lineHeight: 1.8,
  letterSpacing: "0.2px",
};
