import { Button } from "@toss/tds-mobile";
import { CalendarDays } from "lucide-react";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BrandMarkIcon } from "./BrandMarkIcon";
import { ChatHeartIcon, RiceBowlIcon } from "./lib/quickActionIcons";
import { PersonalityIcon } from "./lib/personalityIcons";
import "./OnboardingSlides.css";

// 브랜드 색(노란색)이 밝아서 흰 글씨는 가독성이 떨어져요. 다른 화면들의 동명
// 상수와 같은 이유로, "시작하기" 버튼 글자색을 진하게 덮어써요.
const PRIMARY_FILL_BUTTON_TEXT_STYLE = {
  "--button-color": "#000000",
} as CSSProperties;

interface OnboardingSlide {
  icon: ReactNode;
  title: string;
  description: string;
}

// 큰 원형 배지 안에 아이콘을 하나 놓는 공통 레이아웃이에요. ResultStep(먹보조사
// 결과)의 아바타+성향 배지 겹침 연출과 같은 톤을 써서, 온보딩도 같은 앱이라는
// 느낌이 자연스럽게 이어지도록 했어요.
function IconBadge({
  children,
  accessory,
}: {
  children: ReactNode;
  accessory?: ReactNode;
}) {
  return (
    <div style={{ position: "relative", width: "120px", height: "120px" }}>
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          backgroundColor: "#EAF0EA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
      {accessory && (
        <div
          style={{
            position: "absolute",
            bottom: "-2px",
            right: "-2px",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: "#9CAF9A",
            border: "3px solid #ffffff",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {accessory}
        </div>
      )}
    </div>
  );
}

const SLIDES: OnboardingSlide[] = [
  {
    icon: (
      <IconBadge>
        <BrandMarkIcon size={56} />
      </IconBadge>
    ),
    title: `"이게맛다"에 오신 걸 환영해요`,
    description: "맛집을 기록하고, 나만의 다이어리로 남겨보세요.",
  },
  {
    icon: (
      <IconBadge>
        <RiceBowlIcon size={56} color="#4A6350" />
      </IconBadge>
    ),
    title: "맛있는 하루",
    description: "다녀온 곳을 사진과 메모로, 일기처럼 차곡차곡 기록해요.",
  },
  {
    icon: (
      <IconBadge
        accessory={<CalendarDays size={20} color="#ffffff" />}
      >
        <ChatHeartIcon size={56} color="#4A6350" />
      </IconBadge>
    ),
    title: "오늘의 한 입, 다가올 한 입",
    description:
      "다른 사람들과 오늘 먹은 한 입을 나누고, 다음에 갈 곳을 미리 계획해보세요.",
  },
  {
    icon: <PersonalityIcon code="탐험대장" size={64} />,
    title: "먹보조사",
    description: "26가지 질문으로 알아보는 나만의 음식 취향, 재미로 확인해보세요!",
  },
];

// 앱 최초 실행 시 스플래시 다음, 닉네임 입력 전에 한 번만 보여주는 소개
// 슬라이드예요. "최초 1회"만 노출되면 되므로, 언제 다시 봤는지 여부는 여기서
// 신경 쓰지 않고 onFinish를 부른 뒤 App.tsx가 localStorage 플래그를 남겨요.
// 스와이프(가로 스크롤 스냅)와 점 인디케이터, 하단 버튼(다음/시작하기)으로
// 넘길 수 있어요. 화려한 전환 효과 없이 스크롤 스냅만 써서 스플래시의 차분한
// 톤을 그대로 이어가요.
export default function OnboardingSlides({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isLast = index === SLIDES.length - 1;

  const scrollToIndex = (nextIndex: number) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    track.scrollTo({ left: nextIndex * track.clientWidth, behavior: "smooth" });
    setIndex(nextIndex);
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) {
      return;
    }
    const nextIndex = Math.round(track.scrollLeft / track.clientWidth);
    if (nextIndex !== index) {
      setIndex(nextIndex);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        // 스플래시(999999)가 사라진 뒤에 이어서 보여야 하고, BottomSheet(30000)
        // 등 다른 오버레이보다도 위에 있어야 해요. 스플래시 바로 아래 값을 써요.
        zIndex: 999998,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 16px" }}>
        <button
          type="button"
          onClick={onFinish}
          style={{
            border: "none",
            background: "none",
            padding: "8px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#8b95a1",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          건너뛰기
        </button>
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="onboarding-slides__track"
        style={{
          flex: "1 1 auto",
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {SLIDES.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            style={{
              flex: "0 0 100%",
              scrollSnapAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              padding: "0 32px 40px",
              textAlign: "center",
            }}
          >
            {slide.icon}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "21px", fontWeight: 800, color: "#191f28" }}>
                {slide.title}
              </div>
              <div
                style={{
                  fontSize: "15px",
                  color: "#4e5968",
                  lineHeight: 1.6,
                }}
              >
                {slide.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "8px 0 20px" }}>
        {SLIDES.map((_, dotIndex) => (
          <span
            key={dotIndex}
            onClick={() => scrollToIndex(dotIndex)}
            className={`onboarding-dot${dotIndex === index ? " onboarding-dot--active" : ""}`}
            style={{ cursor: "pointer" }}
          />
        ))}
      </div>

      <div style={{ padding: "0 24px 28px" }}>
        {isLast ? (
          <Button
            display="block"
            variant="fill"
            style={PRIMARY_FILL_BUTTON_TEXT_STYLE}
            onClick={onFinish}
          >
            시작하기
          </Button>
        ) : (
          <Button
            display="block"
            variant="weak"
            color="dark"
            onClick={() => scrollToIndex(index + 1)}
          >
            다음
          </Button>
        )}
      </div>
    </div>
  );
}
