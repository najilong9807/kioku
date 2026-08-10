import type { CSSProperties } from "react";

// index.css에서 @font-face로 등록한 손글씨 폰트예요. Regular 굵기만 배포되어 있어서
// fontWeight는 항상 400으로 고정해서 써야, 브라우저가 가짜로 굵게 그려 획이 뭉개지는
// 문제를 피할 수 있어요.
export const HANDWRITING_FONT_FAMILY =
  "'GriunXHangeul_DAHL', 'Pretendard', sans-serif";

// index.css에 등록한 브랜드 디스플레이 폰트(잘난체)예요. 로고/큰 타이틀
// ("이게맛다", "AUGUST", "TODAY'S BITE", "NEXT BITE" 등) 전용이고, 본문에는
// 쓰지 않아요. Bold 계열 폰트라 fontWeight는 700으로 둬요.
export const BRAND_DISPLAY_FONT_FAMILY = "'Jalnan', 'Pretendard', sans-serif";

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

// 2026-08 리디자인("뜸부기" 레퍼런스)에서 도입한 브랜드 색상 토큰이에요.
// 기존 THEME_YELLOW/SAGE_GREEN 계열과 함께 쓰되, 아래 4개는 새 브랜드 톤
// (Pastel Sky Blue + Warm Cream + Dark Navy + Coral 포인트) 전용이에요.
// - SKY_BLUE: 홈/스플래시 배경의 대표 색
// - SKY_BLUE_BG: 스카이블루보다 옅은, 카드 등에 쓰는 배경
// - DARK_NAVY: 로고/제목/핵심 텍스트·아이콘. 기존 코드 곳곳의 #191f28과는
//   별개 토큰이에요 — 이번에 새로 손대는 화면에서만 점진적으로 적용해요.
// - CORAL_RED: CTA/좋아요/삭제 등 강조색(기존 THEME_YELLOW의 강조 역할 대체)
// - DUSTY_PINK: 테이프/작은 장식용 핑크(기존 WASHI_PINK와 거의 동일한 톤)
export const SKY_BLUE = "#B8CCE8";
export const SKY_BLUE_BG = "#E3ECF7";
export const DARK_NAVY = "#182338";
export const CORAL_RED = "#D95145";
export const DUSTY_PINK = "#E7B6B1";

// 확정 PNG 에셋(사진/ 폴더) 반입 단계에서 추가한 토큰이에요. 위 4개와 값이
// 겹치는 색(Main Blue/Dark Navy/Accent Red/Dusty Pink)은 새로 만들지 않고
// 그대로 재사용했고, 값이 다른 2개만 새로 추가했어요.
// - WARM_PAPER: 에셋 기준 종이색(#F6F1E7). 기존 PAPER_CREAM(#FDF6E9)과
//   톤은 비슷하지만 값이 달라서 별도 토큰으로 둬요 — 기존 PAPER_CREAM
//   사용처는 그대로 두고, 새 PNG 에셋과 나란히 쓰는 자리에서만 이걸 써요.
// - SAGE_MUTED: 에셋 기준 세이지(#A8B9A5). 기존 SAGE_GREEN(#9CAF9A)과
//   마찬가지로 톤은 비슷하지만 값이 달라서 별도 토큰으로 둬요.
export const WARM_PAPER = "#F6F1E7";
export const SAGE_MUTED = "#A8B9A5";

// 2026-08 "당근마켓 스타일" 레이아웃 정리에서 도입한 공통 타이포/리스트/카드
// 토큰이에요. 화면마다 제각각이던 리스트 아이템 구성, 폰트 크기/굵기 단계,
// 카드 radius를 아래 값으로 통일해요. 적용 범위는 콘텐츠가 많은 화면(맛있는
// 하루 목록, 오늘의 한 입 피드, 다가올 한 입의 예정 목록, 맛집 도감)이고,
// 홈 화면의 브랜드 히어로 영역(고양이 이미지+로고)은 이 스케일 밖이에요.
//
// 텍스트 위계: 화면 타이틀 > 섹션 제목 > 리스트 제목 > 부가정보
export const SCREEN_TITLE_TEXT_STYLE: CSSProperties = {
  fontSize: "22px",
  fontWeight: 800,
  color: DARK_NAVY,
  letterSpacing: "-0.3px",
};
export const SECTION_TITLE_TEXT_STYLE: CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  color: DARK_NAVY,
};
export const LIST_TITLE_TEXT_STYLE: CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#191f28",
};
// 부가정보(동네, 날짜, 별점 등)에 쓰는 회색 톤이에요. 당근마켓 리스트의
// 옅은 회색 메타 텍스트와 같은 역할이에요.
export const META_TEXT_COLOR = "#8b95a1";
export const META_TEXT_STYLE: CSSProperties = {
  fontSize: "13px",
  fontWeight: 500,
  color: META_TEXT_COLOR,
};

// 리스트 아이템 공통 규격이에요: 72x72 정사각형 썸네일(고정 크기) + 제목 +
// 부가정보 한 줄 + (있으면) 우측 뱃지, 좌우 16px padding, 아이템 사이 얇은
// divider. 장식(워시테이프/회전/스티커 프레임)은 리스트 아이템에는 쓰지
// 않고, 화면 상단 브랜드 영역에만 남겨요.
export const LIST_ITEM_PADDING_X = "16px";
export const LIST_THUMBNAIL_SIZE = 72;
export const LIST_THUMBNAIL_RADIUS = "12px";

// 카드(진행률 카드, 요약 카드 등) 공통 radius예요. 화면마다 14/16/20px로
// 흩어져 있던 걸 16px 하나로 통일해요. 그림자는 당근마켓처럼 아주 옅게만
// 써서(진하면 종이 질감과 안 어울려요), 꼭 필요한 곳(플로팅 버튼, 강조
// 카드)에만 CARD_SHADOW를 더해요.
export const CARD_RADIUS = "16px";
export const CARD_SHADOW = "0 2px 8px rgba(24, 35, 56, 0.06)";

// 리스트 아이템 사이 얇은 구분선 색이에요. 화면마다 #E5DFC9/#f2f4f6 등으로
// 흩어져 있던 걸 하나로 통일해요.
export const DIVIDER_COLOR = "#EFEAE0";
