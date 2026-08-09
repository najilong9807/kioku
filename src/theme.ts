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

// 브랜드 "테마 노랑" 색상 토큰이에요. 예전에는 화면마다 #FFC107/#ffc107,
// #f2a33c, #fff8e1/#fff8e6/#fff4cc, #9a6b00처럼 미묘하게 다른 값이 흩어져
// 있었어요. 아래 4개로 역할을 나눠서 통일해요.
// - THEME_YELLOW: 아이콘/포인트에 쓰는 순수 테마 노랑
// - THEME_YELLOW_ACCENT: 별점처럼 살짝 더 진한 주황 계열 강조색
// - THEME_YELLOW_BG: 옅은 하이라이트 배경(카드/배지/모달 강조 행 등)
// - THEME_YELLOW_TEXT: 옅은 노랑 배경 위에 쓰는 진한 텍스트 색
export const THEME_YELLOW = "#FFC107";
export const THEME_YELLOW_ACCENT = "#f2a33c";
export const THEME_YELLOW_BG = "#fff8e1";
export const THEME_YELLOW_TEXT = "#9a6b00";

// 브랜드 "세이지그린" 색상 토큰이에요. #4A6350(진한 세이지)을 표준으로 삼고,
// 예전에 일부 화면(먹보조사 등)에 남아있던 #6b8f71은 이걸로 통일해요.
// - SAGE_GREEN: 아이콘/배지 등에 쓰는 밝은 세이지(기존 #9CAF9A와 동일)
// - SAGE_GREEN_DARK: 밝은 세이지 배경 위에 쓰는 진한 세이지(텍스트/아이콘)
// - SAGE_GREEN_BG: 옅은 세이지 배경(원형 배지, 카드 등)
export const SAGE_GREEN = "#9CAF9A";
export const SAGE_GREEN_DARK = "#4A6350";
export const SAGE_GREEN_BG = "#EAF0EA";

// "스크랩북 다이어리" 디자인 시스템(components/scrapbook/) 전용 색상 토큰이에요.
// 실물 다이어리 질감(크림색 종이, 그리드 노트, 워시테이프, 스프링 바인더)을
// 표현하는 재사용 컴포넌트 세트에서 함께 써요.
// - PAPER_CREAM: 스크랩북 카드 바탕에 쓰는 크림색 종이
// - PAPER_GRID_LINE: 종이 위에 옅게 깔리는 격자선
// - WASHI_SAGE / WASHI_PINK: 워시테이프 2종 색상(세이지그린은 기존 SAGE_GREEN과 동일)
// - RING_METAL: 스프링 바인더 링 색
export const PAPER_CREAM = "#FDF6E9";
export const PAPER_GRID_LINE = "#ECE0C7";
export const WASHI_SAGE = SAGE_GREEN;
export const WASHI_PINK = "#E3B7AE";
export const RING_METAL = "#B5BAC2";
