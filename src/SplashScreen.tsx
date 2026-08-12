import { useEffect, useState } from "react";
import catImage from "./assets/images/splash/cat.png";
import condensedMilkCoffeeImage from "./assets/images/splash/condensed-milk-coffee.png";
import dietSpeechBubble from "./assets/images/splash/diet-speech-bubble.png";
import goodFoodGoodMemoryImage from "./assets/images/splash/good-food-good-memory.png";
import heartImage from "./assets/images/splash/heart.png";
import heartStarSetImage from "./assets/images/splash/heart-star-set.png";
import logoImage from "./assets/images/splash/logo.png";
import orangeStarImage from "./assets/images/splash/orange-star.png";
import ramenImage from "./assets/images/splash/ramen.png";
import shootingStarImage from "./assets/images/splash/shooting-star.png";
import steakImage from "./assets/images/splash/steak.png";
import strawberryCakeImage from "./assets/images/splash/strawberry-cake.png";
import tteokbokkiImage from "./assets/images/splash/tteokbokki.png";
import "./SplashScreen.css";

// 정적인 포스터형 화면을 잠깐 멈춰서 보여주는 시간이에요(진입 애니메이션
// 이후). 이 값이 끝나면 페이드아웃(EXIT_DURATION_MS)하고 onFinish를 불러요.
const HOLD_DURATION_MS = 2600;
const EXIT_DURATION_MS = 400;

interface FoodStickerSpec {
  src: string;
  label: string;
  style: React.CSSProperties;
  width: number;
  rotation: number;
  animationDelay: number;
  animationDuration: number;
}

// 음식 콜라주예요. 확정 PNG 스티커(라멘/딸기 케이크/떡볶이/스테이크/연유커피)를
// 살짝씩 겹치고 각도를 다르게 배치해요. 각 아이템은 위치·회전·애니메이션
// 타이밍을 조금씩 다르게 줘서, 모두 똑같이 움직이지 않고 콜라주 전체가
// 자연스럽게 살아있는 느낌이 나도록 했어요.
const FOOD_STICKERS: FoodStickerSpec[] = [
  {
    src: ramenImage,
    label: "라멘",
    style: { top: "0px", left: "0px" },
    width: 138,
    rotation: -5,
    animationDelay: 0,
    animationDuration: 1.7,
  },
  {
    src: strawberryCakeImage,
    label: "딸기 케이크",
    style: { top: "-6px", right: "0px" },
    width: 98,
    rotation: 7,
    animationDelay: 0.35,
    animationDuration: 1.5,
  },
  {
    src: steakImage,
    label: "스테이크",
    style: { top: "84px", left: "108px" },
    width: 138,
    rotation: -2,
    animationDelay: 0.6,
    animationDuration: 2,
  },
  {
    src: tteokbokkiImage,
    label: "떡볶이",
    style: { bottom: "-4px", left: "4px" },
    width: 120,
    rotation: 4,
    animationDelay: 0.9,
    animationDuration: 1.8,
  },
  {
    src: condensedMilkCoffeeImage,
    label: "연유커피",
    style: { bottom: "0px", right: "-4px" },
    width: 102,
    rotation: -6,
    animationDelay: 1.2,
    animationDuration: 1.6,
  },
];

// 화면 곳곳에 소량만 흩뿌리는 확정 PNG 장식이에요. 4개뿐이라 과하지 않아요.
interface ScatterDecorationSpec {
  src: string;
  label: string;
  style: React.CSSProperties;
  width: number;
  rotation: number;
}

const SCATTER_DECORATIONS: ScatterDecorationSpec[] = [
  {
    src: orangeStarImage,
    label: "",
    style: { top: "6%", left: "6%" },
    width: 36,
    rotation: -8,
  },
  {
    src: shootingStarImage,
    label: "",
    style: { top: "11%", right: "7%" },
    width: 42,
    rotation: 6,
  },
  {
    src: heartImage,
    label: "",
    style: { top: "47%", left: "5%" },
    width: 30,
    rotation: -10,
  },
  {
    src: heartStarSetImage,
    label: "",
    style: { top: "45%", right: "4%" },
    width: 56,
    rotation: 4,
  },
];

// 앱 최초 로딩 시 잠깐 보여주는 인트로(스플래시) 화면이에요. Sky Blue 배경
// 위에 확정 PNG 에셋(로고/고양이/음식 콜라주/장식 스티커)을 그대로 얹은
// 정적 포스터형이에요. 에셋은 다시 그리지 않고 원본을 그대로 쓰고, 위치·
// 회전·애니메이션 타이밍만 코드에서 배치해요.
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
      {SCATTER_DECORATIONS.map((item, index) => (
        <img
          key={index}
          src={item.src}
          alt=""
          aria-hidden="true"
          className="splash-scatter-decoration"
          style={{
            ...item.style,
            width: `${item.width}px`,
            transform: `rotate(${item.rotation}deg)`,
          }}
        />
      ))}

      <div className="splash-logo-wrap">
        {/* 고양이.png는 로고 뒤쪽에 배경처럼 은은하게 깔아요(불투명도를
            낮추고 가장자리를 마스크로 페이드아웃해서, 사진 원본의 사각
            프레임이 도드라지지 않게 했어요). */}
        <img
          src={catImage}
          alt=""
          aria-hidden="true"
          className="splash-hero-cat-bg"
        />
        <img
          src={logoImage}
          alt="이게맛다 - FOOD MEMORIES SINCE 2026"
          className="splash-logo-image"
        />
      </div>

      <div className="splash-collage">
        {FOOD_STICKERS.map((item) => (
          <img
            key={item.label}
            src={item.src}
            alt={item.label}
            className="splash-food"
            style={{
              ...item.style,
              width: `${item.width}px`,
              animationDelay: `${item.animationDelay}s`,
              animationDuration: `${item.animationDuration}s`,
              // CSS 커스텀 프로퍼티로 회전 기준값을 넘겨서, 키프레임 하나를
              // 모든 아이템이 공유하면서도 각자 다른 각도에서 살짝씩만
              // 왔다갔다 하도록 했어요.
              ["--splash-food-rotation" as string]: `${item.rotation}deg`,
            }}
          />
        ))}
        {/* "good food, good memory!" 텍스트 스티커예요. 콜라주 왼쪽 위
            모서리에 살짝 걸치듯 놓아서 보조 장식처럼 보이게 했어요. */}
        <img
          src={goodFoodGoodMemoryImage}
          alt="good food, good memory!"
          className="splash-good-food-sticker"
        />
      </div>

      <img
        src={dietSpeechBubble}
        alt="다이어트 할 거면 나가."
        className="splash-speech-bubble-image"
      />

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
