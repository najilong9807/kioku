// "먹보조사" 결과와 "맛있는 하루" 기록을 공유용 이미지 카드로 그려요. 요즘 성향
// 테스트 앱들처럼, 텍스트만 보내는 대신 예쁜 카드 이미지를 만들어서 공유해요.
// 실제 공유/저장/폴백 동작은 lib/share.ts가 맡고, 여기서는 순수하게
// "데이터 → 이미지(Blob)" 변환만 담당해요.
import { formatFullKoreanDate, type Restaurant } from "../restaurantStorage";
import { HANDWRITING_FONT_FAMILY } from "../theme";
import {
  canvasToBlob,
  clipRoundedRect,
  createCardCanvas,
  drawImageCover,
  ensureFontLoaded,
  fillRoundedRect,
  loadImage,
  measureWrappedLineCount,
  strokeRoundedRect,
  wrapText,
} from "./canvasCard";
import type { FoodCategory, FoodTestResult } from "./foodTest";
import type { VisitSummary } from "./recordSummary";

const SAGE_GREEN = "#9CAF9A";
const INK = "#191f28";
const APP_NAME = "이게맛다";

// 결과 화면(FoodTestView.tsx ResultStep)은 음식취향 카테고리를 아바타
// 캐릭터로 보여주지만, 캐릭터는 인라인 SVG라 캔버스에 그대로 옮기려면 별도
// 래스터화가 필요해요. 카드에서는 대신 같은 카테고리를 대표하는 이모지로
// 간단히 표현해요.
const FOOD_CATEGORY_EMOJI: Record<FoodCategory, string> = {
  한식: "🍚",
  분식: "🍢",
  중식: "🥡",
  일식: "🍣",
  동남아: "🍜",
  양식: "🍝",
  패스트푸드: "🍔",
  디저트: "🍰",
};

const EMOJI_FONT_STACK =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

// 앱 전체에서 쓰는 본문 폰트 스택과 맞춰요(index.css의 :root font-family와 동일).
const SANS_FONT_STACK =
  '"Pretendard", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

function sansFont(weight: number, px: number): string {
  return `${weight} ${px}px ${SANS_FONT_STACK}`;
}

function handwritingFont(px: number): string {
  return `400 ${px}px ${HANDWRITING_FONT_FAMILY}`;
}

// BrandMarkIcon.tsx와 같은 모양(세이지 그린 노트 표지 + 책등 그림자 줄)을 작게
// 그려서 워터마크로 써요. 카드 배경이 세이지그린이라 아이콘 자체는 흰 배경으로
// 그려야 도드라져 보여요.
function drawBrandMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const scale = size / 24;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  fillRoundedRect(ctx, 3, 2, 18, 20, 3.5, "#ffffff");
  strokeRoundedRect(ctx, 3, 2, 18, 20, 3.5, INK, 1.4);
  ctx.fillStyle = "rgba(25, 31, 40, 0.18)";
  ctx.fillRect(8.2, 2, 2.1, 20);
  ctx.restore();
}

// 카드 하단에 "이 앱에서 만든 이미지"라는 걸 알아볼 수 있게 작은 워터마크를 그려요.
function drawWatermark(ctx: CanvasRenderingContext2D, centerX: number, bottomY: number) {
  const markSize = 18;
  const gap = 7;

  ctx.font = sansFont(700, 17);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const textWidth = ctx.measureText(APP_NAME).width;
  const totalWidth = markSize + gap + textWidth;
  const startX = centerX - totalWidth / 2;
  const iconY = bottomY - markSize;

  drawBrandMark(ctx, startX, iconY, markSize);

  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.fillText(APP_NAME, startX + markSize + gap, bottomY - 3);
}

const FOOD_TEST_CARD_WIDTH = 720;
const FOOD_TEST_CARD_HEIGHT = 960;

// 먹보조사 결과 카드예요: 세이지그린 배경, 음식취향 이모지 배지, 유형명을
// 크게, 한 줄 설명, 하단에 앱 워터마크를 작게 넣어요.
export async function renderFoodTestResultCard(
  result: Pick<FoodTestResult, "title" | "description" | "foodCategory">,
): Promise<Blob> {
  const w = FOOD_TEST_CARD_WIDTH;
  const h = FOOD_TEST_CARD_HEIGHT;
  const { canvas, ctx } = createCardCanvas(w, h);

  // 배경
  ctx.fillStyle = SAGE_GREEN;
  ctx.fillRect(0, 0, w, h);

  // 은은한 장식용 원 두 개 — 배경이 밋밋해 보이지 않게 해요.
  ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
  ctx.beginPath();
  ctx.arc(w * 0.86, h * 0.16, 170, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w * 0.08, h * 0.92, 140, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // 내용(뱃지+제목+설명)이 짧을 때 카드 가운데가 휑하게 비어 보이지 않도록,
  // 먼저 실제로 몇 줄이 나올지 재본 뒤(그리지 않고) 전체 블록 높이를 구하고,
  // 워터마크가 차지하는 하단 공간을 뺀 나머지 영역 안에서 세로 가운데로
  // 배치해요.
  const badgeDiameter = 152;
  const titleMaxWidth = w - 120;
  const descMaxWidth = w - 168;
  const titleLineHeight = 70;
  const descLineHeight = 41;
  const gapBadgeToEyebrow = 46;
  const gapEyebrowToTitle = 76;
  const gapTitleToDesc = 66;

  ctx.font = sansFont(800, 58);
  const titleLineCount = measureWrappedLineCount(ctx, result.title, {
    maxWidth: titleMaxWidth,
    maxLines: 2,
  });
  ctx.font = sansFont(500, 27);
  const descLineCount = measureWrappedLineCount(ctx, result.description, {
    maxWidth: descMaxWidth,
    maxLines: 4,
  });

  const blockHeight =
    badgeDiameter +
    gapBadgeToEyebrow +
    gapEyebrowToTitle +
    (titleLineCount - 1) * titleLineHeight +
    gapTitleToDesc +
    (descLineCount - 1) * descLineHeight +
    24; // 마지막 줄 밑으로 남기는 여백

  const topMargin = 72;
  const bottomReserved = 150; // 워터마크 + 여백
  const availableHeight = h - topMargin - bottomReserved;
  const blockTop = topMargin + Math.max(0, (availableHeight - blockHeight) / 2);

  // 음식취향 이모지 배지
  const badgeCenterY = blockTop + badgeDiameter / 2;
  ctx.beginPath();
  ctx.arc(w / 2, badgeCenterY, badgeDiameter / 2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
  ctx.fill();
  ctx.textBaseline = "middle";
  ctx.font = `76px ${EMOJI_FONT_STACK}`;
  ctx.fillText(FOOD_CATEGORY_EMOJI[result.foodCategory], w / 2, badgeCenterY + 4);
  ctx.textBaseline = "alphabetic";

  const eyebrowY = blockTop + badgeDiameter + gapBadgeToEyebrow;

  // 상단 eyebrow 라벨
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = sansFont(700, 22);
  ctx.fillText("먹 보 조 사   결 과", w / 2, eyebrowY);

  // 큰 유형명(두 줄까지 허용)
  ctx.fillStyle = "#ffffff";
  ctx.font = sansFont(800, 58);
  const titleResult = wrapText(ctx, result.title, {
    x: w / 2,
    y: eyebrowY + gapEyebrowToTitle,
    maxWidth: titleMaxWidth,
    lineHeight: titleLineHeight,
    maxLines: 2,
    align: "center",
  });

  // 한 줄 설명
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.font = sansFont(500, 27);
  wrapText(ctx, result.description, {
    x: w / 2,
    y: titleResult.endY + gapTitleToDesc,
    maxWidth: descMaxWidth,
    lineHeight: descLineHeight,
    maxLines: 4,
    align: "center",
  });

  drawWatermark(ctx, w / 2, h - 52);

  return canvasToBlob(canvas);
}

const RESTAURANT_CARD_WIDTH = 720;
const RESTAURANT_CARD_HEIGHT = 1040;

// 맛있는 하루 기록 카드예요: 가게 이름, 별점, 사진(있으면), 메모 일부(손글씨
// 폰트), 방문일을 흰 종이 카드 위에 담고, 카드 밖 배경은 먹보조사 카드와 같은
// 세이지그린 톤으로 맞춰요.
export async function renderRestaurantCard(restaurant: Restaurant): Promise<Blob> {
  // 메모에 쓰는 손글씨 폰트가 화면에 이미 쓰인 적 없다면(예: 사진 첨부 없이
  // 바로 공유) 미리 로드해둬요. 실패해도 대체 폰트로 계속 진행해요.
  await ensureFontLoaded(handwritingFont(32), restaurant.memo || "다녀온 맛집을 기록해요");

  const w = RESTAURANT_CARD_WIDTH;
  const h = RESTAURANT_CARD_HEIGHT;
  const { canvas, ctx } = createCardCanvas(w, h);

  // 배경
  ctx.fillStyle = SAGE_GREEN;
  ctx.fillRect(0, 0, w, h);

  // 흰 종이 카드 패널
  const panelX = 40;
  const panelY = 44;
  const panelW = w - panelX * 2;
  const panelH = h - 168;
  fillRoundedRect(ctx, panelX, panelY, panelW, panelH, 28, "#fffef9");

  const contentX = panelX + 40;
  const contentW = panelW - 80;

  const displayTitle = restaurant.title.trim() || restaurant.name;
  const memoText = restaurant.memo.trim();
  const photo = restaurant.photos?.[0];
  const hasPhoto = Boolean(photo);

  // 제목 폰트
  ctx.font = sansFont(800, 40);
  const titleLineCount = measureWrappedLineCount(ctx, displayTitle, {
    maxWidth: contentW,
    maxLines: 2,
  });

  // 사진이 없을 때는 내용(제목+별점/날짜+메모)이 패널보다 짧으면 아래가 휑해
  // 보이니, 실제로 몇 줄이 나올지 미리 재서 패널 안에서 세로 가운데로
  // 정렬해요. 사진이 있을 때는 사진이 자연스럽게 공간을 채워주니 기존처럼
  // 위에서부터 순서대로 그려요.
  let cursorY: number;
  if (hasPhoto) {
    cursorY = panelY + 74;
  } else {
    ctx.font = handwritingFont(30);
    const memoLineCount = memoText
      ? measureWrappedLineCount(ctx, memoText, { maxWidth: contentW, maxLines: 6 })
      : 0;
    const blockHeight =
      titleLineCount * 48 +
      46 + // 제목 → 별점 줄 간격
      34 + // 별점/날짜 한 줄
      40 + // 별점 → 메모 간격
      (memoLineCount > 0 ? 38 + memoLineCount * 46 : 0);
    cursorY = panelY + Math.max(74, (panelH - blockHeight) / 2);
  }

  // 가게 이름(커스텀 제목이 있으면 제목, 없으면 가게 이름 — 상세보기와 동일한 규칙)
  ctx.fillStyle = INK;
  ctx.font = sansFont(800, 40);
  const titleWrap = wrapText(ctx, displayTitle, {
    x: contentX,
    y: cursorY,
    maxWidth: contentW,
    lineHeight: 48,
    maxLines: 2,
    align: "left",
  });
  cursorY = titleWrap.endY + 46;

  // 별점(왼쪽) + 방문일(오른쪽)
  const filledStars = Math.max(0, Math.min(5, Math.round(restaurant.rating)));
  const stars = "★".repeat(filledStars) + "☆".repeat(5 - filledStars);
  ctx.textAlign = "left";
  ctx.fillStyle = "#f2a33c";
  ctx.font = sansFont(700, 30);
  ctx.fillText(stars, contentX, cursorY);

  ctx.textAlign = "right";
  ctx.fillStyle = "#8b95a1";
  ctx.font = sansFont(500, 22);
  ctx.fillText(formatFullKoreanDate(restaurant.visitDate), contentX + contentW, cursorY);
  ctx.textAlign = "left";

  cursorY += 40;

  // 사진(있으면 첫 장만)
  if (photo) {
    try {
      const img = await loadImage(photo);
      const photoH = 320;
      ctx.save();
      clipRoundedRect(ctx, contentX, cursorY, contentW, photoH, 18);
      drawImageCover(ctx, img, contentX, cursorY, contentW, photoH);
      ctx.restore();
      cursorY += photoH + 40;
    } catch {
      // 사진을 못 불러오면(손상된 데이터 등) 그냥 건너뛰고 메모만 보여줘요.
    }
  } else {
    cursorY += 8;
  }

  // 메모 일부 — 손글씨 폰트로, 사진이 있으면 공간이 좁으니 3줄까지만, 없으면 6줄까지 보여줘요.
  if (memoText) {
    ctx.fillStyle = INK;
    ctx.font = handwritingFont(30);
    wrapText(ctx, memoText, {
      x: contentX,
      y: cursorY + 38,
      maxWidth: contentW,
      lineHeight: 46,
      maxLines: photo ? 3 : 6,
      align: "left",
    });
  }

  drawWatermark(ctx, w / 2, h - 46);

  return canvasToBlob(canvas);
}

const VISIT_SUMMARY_CARD_WIDTH = 720;
const VISIT_SUMMARY_CARD_HEIGHT = 860;

// "이번 주/이번 달" 기록 요약 카드예요. 먹보조사 결과 카드와 같은 세이지그린
// 배경 + 장식 원을 쓰되, 가운데는 큰 숫자 두 개(이번 주/이번 달)를 나란히
// 보여줘요.
export async function renderVisitSummaryCard(
  summary: VisitSummary,
): Promise<Blob> {
  const w = VISIT_SUMMARY_CARD_WIDTH;
  const h = VISIT_SUMMARY_CARD_HEIGHT;
  const { canvas, ctx } = createCardCanvas(w, h);

  ctx.fillStyle = SAGE_GREEN;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
  ctx.beginPath();
  ctx.arc(w * 0.9, h * 0.12, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(w * 0.06, h * 0.88, 130, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = sansFont(700, 24);
  ctx.fillText("나 의   맛 있 는   기 록", w / 2, 108);

  ctx.fillStyle = "#ffffff";
  ctx.font = sansFont(800, 42);
  ctx.fillText(`${summary.monthLabel} 기록 요약`, w / 2, 168);

  // 이번 주 / 이번 달, 두 스탯을 하나의 흰 카드 안에 나란히 담아요.
  const panelX = 60;
  const panelY = 236;
  const panelW = w - panelX * 2;
  const panelH = 420;
  fillRoundedRect(ctx, panelX, panelY, panelW, panelH, 28, "#fffef9");

  const half = panelW / 2;
  const statCenterY = panelY + panelH / 2 - 20;

  ctx.fillStyle = "#8b95a1";
  ctx.font = sansFont(600, 24);
  ctx.fillText(`이번 주(${summary.weekLabel})`, panelX + half / 2, statCenterY - 74);
  ctx.fillText("이번 달", panelX + half * 1.5, statCenterY - 74);

  ctx.fillStyle = INK;
  ctx.font = sansFont(800, 96);
  ctx.fillText(`${summary.weekCount}`, panelX + half / 2, statCenterY + 30);
  ctx.fillText(`${summary.monthCount}`, panelX + half * 1.5, statCenterY + 30);

  ctx.fillStyle = "#4A6350";
  ctx.font = sansFont(700, 28);
  ctx.fillText("곳", panelX + half / 2, statCenterY + 70);
  ctx.fillText("곳", panelX + half * 1.5, statCenterY + 70);

  // 두 스탯 사이 구분선
  ctx.strokeStyle = "rgba(25, 31, 40, 0.12)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(panelX + half, panelY + 48);
  ctx.lineTo(panelX + half, panelY + panelH - 48);
  ctx.stroke();

  drawWatermark(ctx, w / 2, h - 52);

  return canvasToBlob(canvas);
}
