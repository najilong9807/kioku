import { useEffect, useState } from "react";
import catSunglassesSplash from "./assets/cat-sunglasses-splash.png";
import dietSpeechBubble from "./assets/images/splash/diet-speech-bubble.png";
import "./SplashScreen.css";
import { BRAND_DISPLAY_FONT_FAMILY, DARK_NAVY } from "./theme";

// 정적인 포스터형 화면을 잠깐 멈춰서 보여주는 시간이에요(진입 애니메이션
// 이후). 이 값이 끝나면 페이드아웃(EXIT_DURATION_MS)하고 onFinish를 불러요.
const HOLD_DURATION_MS = 2600;
const EXIT_DURATION_MS = 400;

interface FoodStickerSpec {
  emoji: string;
  label: string;
  style: React.CSSProperties;
  size: number;
  rotation: number;
  animationDelay: number;
  animationDuration: number;
}

// 음식 콜라주예요. 실제 배경 제거된 음식 사진 에셋은 아직 없어서, 이모지를
// 흰 스티커 카드에 담아 임시로 대체했어요(사진 에셋이 오면 교체 예정). 각
// 아이템은 위치·회전·애니메이션 타이밍을 조금씩 다르게 줘서, 모두 똑같이
// 움직이지 않고 콜라주 전체가 자연스럽게 살아있는 느낌이 나도록 했어요.
const FOOD_STICKERS: FoodStickerSpec[] = [
  {
    emoji: "🍜",
    label: "라멘",
    style: { top: "0px", left: "6px" },
    size: 108,
    rotation: -4,
    animationDelay: 0,
    animationDuration: 1.8,
  },
  {
    emoji: "🍰",
    label: "딸기 케이크",
    style: { top: "6px", right: "10px" },
    size: 74,
    rotation: 7,
    animationDelay: 0.3,
    animationDuration: 1.6,
  },
  {
    emoji: "🍝",
    label: "짜장면",
    style: { top: "92px", right: "0px" },
    size: 92,
    rotation: -5,
    animationDelay: 0.6,
    animationDuration: 2,
  },
  {
    emoji: "🥤",
    label: "아이스커피",
    style: { top: "118px", left: "0px" },
    size: 72,
    rotation: 5,
    animationDelay: 0.9,
    animationDuration: 1.7,
  },
  {
    emoji: "🥩",
    label: "스테이크",
    style: { top: "132px", left: "92px" },
    size: 82,
    rotation: 2,
    animationDelay: 1.2,
    animationDuration: 1.9,
  },
  {
    emoji: "🍢",
    label: "떡볶이",
    style: { bottom: "0px", right: "22px" },
    size: 116,
    rotation: -3,
    animationDelay: 0.45,
    animationDuration: 2,
  },
];

// 앱 최초 로딩 시 잠깐 보여주는 인트로(스플래시) 화면이에요. 레퍼런스
// "스플래쉬.png" 기준으로, Sky Blue 배경 위에 로고 + 음식 콜라주 + 고양이
// 스티커를 배치한 정적 포스터형이에요. 이전 버전(다이어리 표지가 열렸다
// 닫히는 3D 애니메이션)은 완전히 교체됐고, 이후 확정 PNG 스티커("다이어트
// 할 거면 나가.png")가 생겨서 그 자리만 실제 에셋으로 바꿨어요. 음식
// 6종(라멘/케이크/짜장면/커피/스테이크/떡볶이)은 아직 배경 제거된 실사
// 에셋이 없어서 이모지로 임시 구현했어요 — FOOD_STICKERS 주석 참고.
export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsExiting(true), HOLD_DURATION_MS);
    const finishTimer = setTimeout(
      onFinish,
      HOLD_DURATION_MS + EXIT_DURATION_MS,
    );

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`splash-screen${isExiting ? " splash-screen--exiting" : ""}`}
    >
      <div className="splash-doodle splash-doodle--star-left" aria-hidden="true">
        <StarDoodle color={DARK_NAVY} />
      </div>
      <div className="splash-doodle splash-doodle--star-right" aria-hidden="true">
        <StarDoodle color={DARK_NAVY} />
      </div>
      <div className="splash-doodle splash-doodle--star-coral" aria-hidden="true">
        <StarDoodle color="#D95145" size={14} />
      </div>

      <div className="splash-logo">
        <h1
          className="splash-logo__title"
          style={{ fontFamily: BRAND_DISPLAY_FONT_FAMILY }}
        >
          이게맛다
        </h1>
        <p className="splash-logo__subtitle">FOOD MEMORIES SINCE 2026</p>
      </div>

      <div className="splash-collage">
        {FOOD_STICKERS.map((item) => (
          <div
            key={item.label}
            className="splash-food"
            role="img"
            aria-label={item.label}
            style={{
              ...item.style,
              width: `${item.size}px`,
              height: `${item.size}px`,
              fontSize: `${item.size * 0.52}px`,
              animationDelay: `${item.animationDelay}s`,
              animationDuration: `${item.animationDuration}s`,
              // CSS 커스텀 프로퍼티로 회전 기준값을 넘겨서, 키프레임 하나를
              // 모든 아이템이 공유하면서도 각자 다른 각도에서 살짝씩만
              // 왔다갔다 하도록 했어요.
              ["--splash-food-rotation" as string]: `${item.rotation}deg`,
            }}
          >
            <span aria-hidden="true">{item.emoji}</span>
          </div>
        ))}
      </div>

      <div className="splash-cat-row">
        {/* 확정 PNG 스티커예요("다이어트 할 거면 나가.png"). 예전에는 CSS로
            말풍선 모양을 흉내 냈는데, 실제 스티커 에셋이 생겨서 그대로
            교체했어요(찢어진 종이 느낌의 테두리·밑줄까지 이미지 안에 다
            있어서 별도 배경/테두리를 더 추가하지 않았어요). */}
        <img
          src={dietSpeechBubble}
          alt="다이어트 할 거면 나가."
          className="splash-speech-bubble-image"
        />
        <img
          src={catSunglassesSplash}
          alt=""
          aria-hidden="true"
          className="splash-cat"
        />
      </div>

      <div className="splash-loading">
        <span className="splash-loading__dot" aria-hidden="true">
          •
        </span>
        LOADING...
        <span className="splash-loading__dot" aria-hidden="true">
          •
        </span>
      </div>
      <div className="splash-loading-bar">
        <div className="splash-loading-bar__fill" />
      </div>
    </div>
  );
}

// 로고 주변에 흩뿌리는 손그림 별 도들이에요.
function StarDoodle({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path
        d="M10 1 L11.6 7.8 L18.5 9.5 L11.6 11.2 L10 18 L8.4 11.2 L1.5 9.5 L8.4 7.8 Z"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
