import { useEffect, useState } from "react";
import "./SplashScreen.css";
import { HANDWRITING_FONT_FAMILY } from "./theme";

// 책이 나타난 뒤(0.45s) 잠깐 멈췄다가(0.45s) 첫 장이 넘어가기 시작해요(0.9s 지연).
// 그 뒤로 장마다 360ms씩 시차를 두고(스태거) 1.12s짜리 낱장 넘김이 이어져서, 캐스케이드
// 전체는 약 1.84초가 걸리고 마지막 장(3번째)은 2.74s에 넘어가기 끝나요(스태거·재생시간
// 모두 이전의 4배로 늦춰서 "촤르르"를 여유 있게 볼 수 있게 했어요). 다 넘어간 뒤로도
// 잠깐(0.8s) 더 멈춰 있다가 사라지기 시작해요. 이 값들은 SplashScreen.css의 애니메이션
// 지연/지속시간과 맞춰져 있어요(총 재생 시간 약 3.89초).
const FLIP_START_DELAY_MS = 900;
const FLIP_STAGGER_MS = 360;
const FLIP_DURATION_MS = 1120;
const HOLD_DURATION_MS = 3540;
const EXIT_DURATION_MS = 350;

// 낱장으로 겹쳐 넘어가는 페이지들이에요. 맨 위(제일 먼저 넘어가는) 장에만 "이게"가
// 쓰여 있고, 그 밑의 장들은 줄만 그어진 빈 페이지예요 — 실제 다이어리를 촤르르
// 넘길 때처럼, 글씨 없는 장들이 함께 팔랑거리며 넘어가는 느낌을 위해서예요.
const FLIP_LEAVES = [
  { key: "leaf-1", text: "이게", ruled: false },
  { key: "leaf-2", text: null, ruled: true },
  { key: "leaf-3", text: null, ruled: true },
] as const;

// 앱 최초 로딩 시 잠깐 보여주는 인트로(스플래시) 화면이에요.
// 펼쳐진 다이어리의 오른쪽에 "이게"가 쓰인 장이 있다가, 여러 장이 촤르르 연달아
// 넘어가면서 마지막에 "맛다"가 쓰인 장이 드러나요. 연출이 끝나면 잠시 멈췄다가
// 자연스럽게 사라지고 onFinish를 호출해요.
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
      <div className="splash-book-wrap">
        {/* 책의 정적인 부분(표지, 왼쪽 페이지, 책등 그림자, 바닥 그림자)만 그리는
            일러스트예요. 오른쪽 페이지는 아래 HTML 레이어들로 직접 겹쳐서 표현해요 —
            CSS 3D 회전/backface-visibility를 SVG 안에서 쓰는 것보다 HTML 레이어로
            다루는 쪽이 브라우저마다 훨씬 안정적으로 동작해요. */}
        <svg
          className="splash-book__art"
          viewBox="0 0 260 188"
          aria-hidden="true"
        >
          <ellipse
            cx="130"
            cy="182"
            rx="112"
            ry="6"
            fill="#191f28"
            opacity="0.12"
          />
          <rect
            x="8"
            y="10"
            width="244"
            height="168"
            rx="12"
            fill="#191f28"
          />
          <path
            d="M130,16 L24,16 A9,9 0 0 0 15,25 L15,161 A9,9 0 0 0 24,170 L130,170 Z"
            fill="#fffef7"
            stroke="#191f28"
            strokeWidth="2.5"
          />
          {/* 왼쪽 페이지에 글씨가 쓰여 있는 느낌을 주는 장식 줄이에요. */}
          <rect x="32" y="52" width="70" height="4" rx="2" fill="#191f28" opacity="0.15" />
          <rect x="32" y="68" width="86" height="4" rx="2" fill="#191f28" opacity="0.15" />
          <rect x="32" y="84" width="58" height="4" rx="2" fill="#191f28" opacity="0.12" />
          <rect x="32" y="100" width="78" height="4" rx="2" fill="#191f28" opacity="0.12" />
          <defs>
            <linearGradient id="splash-spine-shadow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#191f28" stopOpacity="0" />
              <stop offset="50%" stopColor="#191f28" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#191f28" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect
            x="122"
            y="16"
            width="16"
            height="154"
            fill="url(#splash-spine-shadow)"
          />
        </svg>

        {/* 오른쪽 페이지 자리예요. "맛다" 장이 항상 맨 밑에 깔려 있고, 그 위를
            여러 장(FLIP_LEAVES)이 겹쳐 덮고 있다가 촤르르 순서대로 넘어가면서
            아래 장을 드러내요. */}
        <div className="splash-book__right-slot">
          <div className="splash-page splash-page--base">
            <span
              className="splash-page__text"
              style={{ fontFamily: HANDWRITING_FONT_FAMILY }}
            >
              맛다
            </span>
          </div>
          {FLIP_LEAVES.map((leaf, index) => (
            <div
              key={leaf.key}
              className={`splash-page splash-page--flip${
                leaf.ruled ? " splash-page--ruled" : ""
              }`}
              style={{
                zIndex: FLIP_LEAVES.length - index + 1,
                animationDelay: `${FLIP_START_DELAY_MS + index * FLIP_STAGGER_MS}ms`,
                animationDuration: `${FLIP_DURATION_MS}ms`,
              }}
            >
              {leaf.text && (
                <span
                  className="splash-page__text"
                  style={{ fontFamily: HANDWRITING_FONT_FAMILY }}
                >
                  {leaf.text}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
