// 별점을 0.5점 단위(1, 1.5, 2, ... 5)로 표시/입력하는 공용 컴포넌트예요.
// TDS의 Rating 컴포넌트는 정수 단위 선택만 지원해서, 반쪽 별이 필요한 이
// 앱에서는 대신 lucide의 Star 아이콘 두 장을 겹쳐 쓰는 방식으로 직접
// 구현해요(배경에 빈 별, 그 위에 fillRatio만큼만 보이는 채워진 별을 겹침).
import { Star } from "lucide-react";
import { type MouseEvent } from "react";
import { THEME_YELLOW } from "../theme";

// 저장은 계속 number로 해요(예전 정수 데이터와 100% 호환). 이 타입은 사용자가
// "직접 입력"하는 값(폼의 별점 선택, 도감 대표 선정 등)에서 0.5 단위만
// 허용하고 싶을 때 씁니다.
export type Rating = 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;

const MIN_RATING = 1;
const MAX_RATING = 5;

// 임의의 숫자를 1~5 범위의 0.5 단위로 반올림해요.
export function clampToHalfStepRating(value: number): Rating {
  const clamped = Math.min(MAX_RATING, Math.max(MIN_RATING, value));
  return (Math.round(clamped * 2) / 2) as Rating;
}

function StarCell({
  fillRatio,
  size,
  color,
  emptyColor,
}: {
  fillRatio: number;
  size: number;
  color: string;
  emptyColor: string;
}) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        width: size,
        height: size,
        flexShrink: 0,
        lineHeight: 0,
      }}
    >
      <Star size={size} color={emptyColor} style={{ position: "absolute", top: 0, left: 0 }} />
      {fillRatio > 0 && (
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${fillRatio * 100}%`,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Star size={size} color={color} fill={color} />
        </span>
      )}
    </span>
  );
}

// 읽기 전용 별점 표시예요. value가 4.5라면 별 4개는 꽉 채우고 5번째 별만
// 절반 채워서 보여줘요.
export function RatingStars({
  value,
  size = 16,
  color = THEME_YELLOW,
  emptyColor = "#e5e8eb",
  gap = 2,
}: {
  value: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  gap?: number;
}) {
  return (
    <div style={{ display: "flex", gap: `${gap}px` }}>
      {Array.from({ length: MAX_RATING }, (_, index) => {
        const fillRatio = Math.max(0, Math.min(1, value - index));
        return (
          <StarCell
            key={index}
            fillRatio={fillRatio}
            size={size}
            color={color}
            emptyColor={emptyColor}
          />
        );
      })}
    </div>
  );
}

// 별점 입력이에요. 별의 오른쪽 절반을 탭하면 정수(예: 4점), 왼쪽 절반을
// 탭하면 .5점(예: 3.5점)이 선택돼요 — 탭 위치의 x좌표로 판단해요.
export function RatingStarsInput({
  value,
  onChange,
  size = 32,
  color = THEME_YELLOW,
  emptyColor = "#e5e8eb",
  gap = 4,
}: {
  value: Rating;
  onChange: (value: Rating) => void;
  size?: number;
  color?: string;
  emptyColor?: string;
  gap?: number;
}) {
  const handleClick =
    (starIndex: number) => (event: MouseEvent<HTMLButtonElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const tapX = event.clientX - rect.left;
      const isLeftHalf = tapX < rect.width / 2;
      onChange(clampToHalfStepRating(starIndex + (isLeftHalf ? 0.5 : 1)));
    };

  return (
    <div style={{ display: "flex", gap: `${gap}px` }}>
      {Array.from({ length: MAX_RATING }, (_, index) => {
        const fillRatio = Math.max(0, Math.min(1, value - index));
        return (
          <button
            key={index}
            type="button"
            onClick={handleClick(index)}
            aria-label={`별점 ${index + 1}점`}
            style={{
              border: "none",
              background: "none",
              padding: 0,
              cursor: "pointer",
              lineHeight: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <StarCell
              fillRatio={fillRatio}
              size={size}
              color={color}
              emptyColor={emptyColor}
            />
          </button>
        );
      })}
    </div>
  );
}
