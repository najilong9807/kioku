import { useEffect, useState } from "react";
import heartImage from "./assets/images/splash/heart.png";
import heartStarSetImage from "./assets/images/splash/heart-star-set.png";
import logoImage from "./assets/images/splash/logo.png";
import orangeStarImage from "./assets/images/splash/orange-star.png";
import pizzaCatImage from "./assets/images/splash/pizza-cat.png";
import shootingStarImage from "./assets/images/splash/shooting-star.png";
import "./SplashScreen.css";

// 정적인 포스터형 화면을 잠깐 멈춰서 보여주는 시간이에요(진입 애니메이션
// 이후). 이 값이 끝나면 페이드아웃(EXIT_DURATION_MS)하고 onFinish를 불러요.
const HOLD_DURATION_MS = 2600;
const EXIT_DURATION_MS = 400;

// 화면 곳곳에 소량만 흩뿌리는 확정 PNG 장식이에요. 4개뿐이라 과하지 않아요.
// 음식 콜라주가 빠지면서 이제 화면에서 유일하게 움직이는 요소라, 각자
// 다른 타이밍으로 미세하게 흔들리는 부유 애니메이션을 얹었어요.
interface ScatterDecorationSpec {
  src: string;
  label: string;
  style: React.CSSProperties;
  width: number;
  rotation: number;
  animationDelay: number;
  animationDuration: number;
}

const SCATTER_DECORATIONS: ScatterDecorationSpec[] = [
  {
    src: orangeStarImage,
    label: "",
    style: { top: "6%", left: "9%" },
    width: 38,
    rotation: -8,
    animationDelay: 0,
    animationDuration: 1.8,
  },
  {
    src: shootingStarImage,
    label: "",
    style: { top: "34%", right: "8%" },
    width: 44,
    rotation: 6,
    animationDelay: 0.5,
    animationDuration: 1.6,
  },
  {
    src: heartImage,
    label: "",
    style: { top: "56%", left: "11%" },
    width: 32,
    rotation: -10,
    animationDelay: 0.9,
    animationDuration: 2,
  },
  {
    src: heartStarSetImage,
    label: "",
    style: { top: "59%", right: "7%" },
    width: 58,
    rotation: 4,
    animationDelay: 1.3,
    animationDuration: 1.7,
  },
];

// 앱 최초 로딩 시 잠깐 보여주는 인트로(스플래시) 화면이에요. Sky Blue 배경
// 위에 확정 PNG 에셋(로고/피자 고양이/장식 스티커)을 그대로 얹은 정적
// 포스터형이에요. 에셋은 다시 그리지 않고 원본을 그대로 쓰고, 위치·회전·
// 애니메이션 타이밍만 코드에서 배치해요.
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
            animationDelay: `${item.animationDelay}s`,
            animationDuration: `${item.animationDuration}s`,
            // CSS 커스텀 프로퍼티로 회전 기준값을 넘겨서, 키프레임 하나를
            // 모든 아이템이 공유하면서도 각자 다른 각도에서 살짝씩만
            // 왔다갔다 하도록 했어요.
            ["--splash-decoration-rotation" as string]: `${item.rotation}deg`,
          }}
        />
      ))}

      {/* 고양이+로고 그룹이에요. 로딩 인디케이터를 화면 하단에 절대
          위치로 따로 고정한 덕분에, 이 그룹은 화면 전체 높이 기준
          정중앙(justify-content: center)에 놓여요. */}
      <div className="splash-logo-wrap">
        {/* 피자 고양이.png는 진짜 알파 투명 배경이라 화면 배경(Sky Blue)
            위에 바로 얹어도 자연스러워요. 화면 폭 전체에 맞춰 배치하고,
            로고와 겹치지 않도록 아래로 충분한 간격을 뒀어요. */}
        <img
          src={pizzaCatImage}
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

      {/* 로딩 인디케이터는 그룹 중앙 정렬과 무관하게 화면 하단에 고정돼요. */}
      <div className="splash-loading-dock">
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
    </div>
  );
}
