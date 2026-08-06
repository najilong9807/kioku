// 공유용 카드 이미지(먹보조사 결과, 맛집 기록)를 Canvas API로 그릴 때 여러 카드가
// 공통으로 쓰는 유틸리티예요. 카드마다 다른 내용은 lib/shareCard.ts에서 그리고,
// 여기서는 "둥근 사각형 그리기", "긴 텍스트 줄바꿈" 같은 범용 도구만 모아둬요.

// 레티나 화면에서도 텍스트가 흐릿하지 않도록, 실제 캔버스 픽셀은 2배로 만들고
// ctx.scale(2, 2)로 보정해요. 이후 그리기 좌표는 전부 "논리 크기"(width/height에
// 넘긴 값) 기준으로 그대로 쓰면 돼요.
const CANVAS_PIXEL_SCALE = 2;

export function createCardCanvas(
  width: number,
  height: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = width * CANVAS_PIXEL_SCALE;
  canvas.height = height * CANVAS_PIXEL_SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D 컨텍스트를 가져오지 못했어요.");
  }
  ctx.scale(CANVAS_PIXEL_SCALE, CANVAS_PIXEL_SCALE);
  return { canvas, ctx };
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

export function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string,
) {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

export function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  strokeStyle: string,
  lineWidth: number,
) {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

// 이후 그리는 내용(주로 drawImage)이 둥근 사각형 밖으로 나가지 않게 잘라내요.
// 호출한 뒤엔 ctx.save()/ctx.restore()로 감싸서 이 클립이 다른 그리기에
// 영향을 주지 않도록 해야 해요.
export function clipRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.clip();
}

export interface WrapTextOptions {
  x: number;
  y: number;
  maxWidth: number;
  lineHeight: number;
  // 이 줄 수를 넘어가면 마지막 줄을 "…"으로 잘라요.
  maxLines?: number;
  align?: CanvasTextAlign;
}

// 문단(줄바꿈 문자 "\n") 단위로 나누고, 각 문단 안에서는 띄어쓰기 기준 단어
// 단위로 maxWidth를 넘지 않게 접어요. maxLines를 넘으면 마지막 줄을 "…"으로
// 잘라요. wrapText(실제로 그리기)와 measureWrappedLineCount(줄 수만 미리
// 계산하기)가 이 로직을 공유해요 — 폰트(ctx.font)는 호출 전에 맞춰둬야 해요.
function splitIntoWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.split(" ").filter((word) => word.length > 0);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of words) {
      const attempt = current ? `${current} ${word}` : word;
      if (current && ctx.measureText(attempt).width > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = attempt;
      }
    }
    lines.push(current);
  }

  if (lines.length <= maxLines) {
    return lines;
  }

  const drawnLines = lines.slice(0, maxLines);
  const lastIndex = drawnLines.length - 1;
  let last = drawnLines[lastIndex];
  while (last.length > 0 && ctx.measureText(`${last}…`).width > maxWidth) {
    last = last.slice(0, -1);
  }
  drawnLines[lastIndex] = `${last}…`;
  return drawnLines;
}

// wrapText를 실제로 호출하기 전에, 카드 레이아웃을 세로로 가운데 정렬하는 등
// 미리 줄 수를 알아야 할 때 써요. ctx.font를 이 텍스트에 쓸 폰트로 먼저
// 맞춰두고 호출해야 해요.
export function measureWrappedLineCount(
  ctx: CanvasRenderingContext2D,
  text: string,
  { maxWidth, maxLines = Infinity }: Pick<WrapTextOptions, "maxWidth" | "maxLines">,
): number {
  return splitIntoWrappedLines(ctx, text, maxWidth, maxLines).length;
}

// 긴 텍스트를 maxWidth에 맞춰 여러 줄로 접어서 그려요.
// 그린 줄 수와 마지막 줄의 y좌표(다음 요소를 이어 그릴 때 기준점으로 쓰기 좋아요)를 돌려줘요.
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  { x, y, maxWidth, lineHeight, maxLines = Infinity, align = "left" }: WrapTextOptions,
): { lineCount: number; endY: number } {
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";

  const drawnLines = splitIntoWrappedLines(ctx, text, maxWidth, maxLines);

  drawnLines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });

  return {
    lineCount: drawnLines.length,
    endY: y + (drawnLines.length - 1) * lineHeight,
  };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 불러오지 못했어요."));
    img.src = src;
  });
}

// CSS의 object-fit: cover와 동일하게, 원본 비율을 유지한 채 대상 영역을 꽉
// 채우고 넘치는 부분은 잘라서 그려요.
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dWidth: number,
  dHeight: number,
) {
  const imgRatio = img.width / img.height;
  const targetRatio = dWidth / dHeight;

  let sx = 0;
  let sy = 0;
  let sWidth = img.width;
  let sHeight = img.height;

  if (imgRatio > targetRatio) {
    sWidth = img.height * targetRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / targetRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}

// 웹폰트(예: 손글씨 폰트)가 실제로 로드된 뒤에 그려야 대체 폰트로 그려지지
// 않아요. 로드에 실패해도(오프라인 등) 무시하고 넘어가요 — 이 경우 대체
// 폰트로라도 카드는 만들어지는 게, 아예 실패하는 것보다 나아요.
export async function ensureFontLoaded(fontSpec: string, sampleText?: string): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) {
    return;
  }
  try {
    await document.fonts.load(fontSpec, sampleText);
    await document.fonts.ready;
  } catch {
    // ignore
  }
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("이미지를 만들지 못했어요."));
      }
    }, type, quality);
  });
}
