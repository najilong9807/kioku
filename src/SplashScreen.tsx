import { useEffect, useState } from "react";
import "./SplashScreen.css";
import { HANDWRITING_FONT_FAMILY } from "./theme";

// 책이 나타난 뒤(0.45s) 잠깐 멈췄다가(0.45s) 표지가 닫히기 시작해요(0.9s 지연).
// 표지는 1.5s에 걸쳐 펼쳐진 상태(-118deg)에서 완전히 닫힌 상태(0deg)까지 회전하고,
// 다 닫힌 뒤로도 잠깐(0.75s) 더 멈춰서 표지의 글씨를 보여주다가 사라지기 시작해요.
// 이 값들은 SplashScreen.css의 애니메이션 지연/지속시간과 맞춰져 있어요
// (총 재생 시간 약 3.5초).
const COVER_START_DELAY_MS = 900;
const COVER_CLOSE_DURATION_MS = 1500;
const HOLD_DURATION_MS = 3150;
const EXIT_DURATION_MS = 350;

// 표지 앞면(닫혔을 때 보이는 면)에 세로로 쓰여 있는 글자들이에요.
const COVER_TITLE_CHARACTERS = ["이", "게", "맛", "다"];

// 앱 최초 로딩 시 잠깐 보여주는 인트로(스플래시) 화면이에요.
// 펼쳐진 다이어리로 시작해서(표지가 책등을 축으로 젖혀져 있어 안쪽 페이지가 보여요),
// 표지가 서서히 닫히면서 완전히 덮이는 순간 표지 앞면에 "이게맛다" 글씨가 자연스럽게
// 드러나요. 연출이 끝나면 잠시 멈췄다가 자연스럽게 사라지고 onFinish를 호출해요.
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
        {/* 책의 정적인 부분(표지 테두리, 왼쪽 페이지, 책등 그림자, 바닥 그림자)만
            그리는 일러스트예요. 오른쪽 안쪽 페이지와 그 위를 덮는 표지는 아래 HTML
            레이어들로 직접 겹쳐서 표현해요 — CSS 3D 회전/backface-visibility를 SVG
            안에서 쓰는 것보다 HTML 레이어로 다루는 쪽이 브라우저마다 훨씬 안정적으로
            동작해요.

            핵심 아이디어: 초록 표지(+노란 노트)는 "펼친 스프레드 전체 폭"이 아니라
            처음부터 "표지가 다 닫혔을 때의 폭"(책 한 권 폭)으로 그려요. 그래서 이
            도형들은 애니메이션 내내 위치/크기가 전혀 바뀌지 않아요. 왼쪽 페이지는 그
            옆(책등 경계) 왼쪽에 별도로 붙여 그리고, 표지가 닫히는 동안 페이드아웃만
            시켜요. 왼쪽 페이지가 사라지고 나면 처음부터 좁게 그려져 있던 초록 책이
            그대로 화면 중앙에 남기 때문에, 폭이 실제로 좁아진 "책 한 권" 모습이 돼요. */}
        <svg
          className="splash-book__art"
          viewBox="-25 0 310 206"
          aria-hidden="true"
        >
          {/* 뒤에 살짝 삐져나온 노란 노트예요. 초록 노트(메인)보다 오른쪽/아래로
              조금 어긋나게 그려서 두 권이 쌓여 있는 느낌을 줘요. */}
          <rect
            x="78"
            y="30"
            width="120"
            height="168"
            rx="12"
            fill="#FBC02D"
            stroke="#191f28"
            strokeWidth="2.5"
          />
          <ellipse
            cx="134"
            cy="198"
            rx="64"
            ry="6"
            fill="#191f28"
            opacity="0.12"
          />
          {/* 메인(초록) 노트의 정적인 부분이에요. 표지가 다 닫혔을 때의 책 폭으로
              그려져 있고, 중앙(x=130)에 오도록 배치했어요. 오른쪽 안쪽 페이지와 그
              위를 덮는 표지는 아래 HTML 레이어로 겹쳐서 표현해요. */}
          <rect
            x="70"
            y="14"
            width="120"
            height="168"
            rx="12"
            fill="#2E6F4C"
          />
          {/* 표지가 열려 있는 동안에만 의미가 있는 부분(왼쪽 크림색 페이지, 페이지
              장식 줄, 책등 그림자)이에요. 초록 책의 왼쪽(책등)에 붙여 그렸고, 표지가
              닫히는 애니메이션과 같은 시간(딜레이/지속시간)에 맞춰 opacity를 0으로
              페이드아웃해요. 이 부분이 사라져도 초록 책 자체는 처음부터 좁게 그려져
              있어서 폭이 그대로 유지되고, 결과적으로 왼쪽 페이지 없이 책 한 권만
              남아요. */}
          <g
            className="splash-book__open-only"
            style={{
              animationDelay: `${COVER_START_DELAY_MS}ms`,
              animationDuration: `${COVER_CLOSE_DURATION_MS}ms`,
            }}
          >
            <path
              d="M70,20 L15,20 A9,9 0 0 0 6,29 L6,165 A9,9 0 0 0 15,174 L70,174 Z"
              fill="#fffef7"
              stroke="#191f28"
              strokeWidth="2.5"
            />
            {/* 왼쪽 페이지에 글씨가 쓰여 있는 느낌을 주는 장식 줄이에요. */}
            <rect x="14" y="56" width="30" height="4" rx="2" fill="#191f28" opacity="0.15" />
            <rect x="14" y="72" width="38" height="4" rx="2" fill="#191f28" opacity="0.15" />
            <rect x="14" y="88" width="24" height="4" rx="2" fill="#191f28" opacity="0.12" />
            <rect x="14" y="104" width="34" height="4" rx="2" fill="#191f28" opacity="0.12" />
            <defs>
              <linearGradient id="splash-spine-shadow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#191f28" stopOpacity="0" />
                <stop offset="50%" stopColor="#191f28" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#191f28" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect
              x="62"
              y="20"
              width="16"
              height="154"
              fill="url(#splash-spine-shadow)"
            />
          </g>
        </svg>

        {/* 안쪽 페이지 자리예요. 이제 초록 책 자체가 "닫힌 폭"으로 그려져 있어서,
            이 자리도 그 책 전체 폭(왼쪽 절반이 아니라)에 맞춰요. 표지가 열려
            있는 동안엔 이 줄쳐진 빈 페이지가 그대로 보이고, 표지가 닫히면서 이
            자리를 덮어요. */}
        <div className="splash-book__right-slot">
          <div className="splash-page splash-page--base splash-page--ruled" />

          {/* 표지예요. 처음엔 책등을 축으로 -118deg만큼 젖혀져 있다가(그래서 안쪽
              페이지가 보여요) 0deg까지 회전하며 닫혀요. 앞면(splash-cover__face--front,
              글씨 있음)과 뒷면(splash-cover__face--back, 빈 표지색)은
              backface-visibility로 서로 반대쪽만 보이게 되어 있어서, 표지가 열려
              있을 때는 뒷면만, 다 닫히면 앞면만 자연스럽게 보여요. */}
          <div
            className="splash-cover"
            style={{
              animationDelay: `${COVER_START_DELAY_MS}ms`,
              animationDuration: `${COVER_CLOSE_DURATION_MS}ms`,
            }}
          >
            <div className="splash-cover__face splash-cover__face--back" />
            <div className="splash-cover__face splash-cover__face--front">
              {COVER_TITLE_CHARACTERS.map((char, index) => (
                <span
                  key={index}
                  className="splash-cover__char"
                  style={{ fontFamily: HANDWRITING_FONT_FAMILY }}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
