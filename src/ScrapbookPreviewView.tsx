// TODO: 출시 전 제거 — "스크랩북 다이어리" 디자인 시스템(components/scrapbook/)
// 컴포넌트 5종을 한 화면에서 확인하기 위한 개발용 미리보기예요. 정식 스토리북이
// 없어서 임시로 만들었고, ProfileView.tsx의 숨김 개발자 메뉴에서만 열려요.
import type { ReactNode } from "react";
import { PhotoSticker } from "./components/scrapbook/PhotoSticker";
import { ScrapbookCard } from "./components/scrapbook/ScrapbookCard";
import { WashiTape } from "./components/scrapbook/WashiTape";
import {
  HandDrawnHeartIcon,
  SparkleIcon,
  SparkleStarIcon,
  SwashUnderline,
} from "./components/scrapbook/decorations";
import { HANDWRITING_TEXT_STYLE, SAGE_GREEN_DARK } from "./theme";

function PreviewSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#191f28" }}>
          {title}
        </div>
        {description && (
          <div style={{ fontSize: "12px", color: "#8b95a1", marginTop: "2px" }}>
            {description}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function IconLabel({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
      <span style={{ fontSize: "12px", color: "#4e5968" }}>{label}</span>
    </div>
  );
}

export default function ScrapbookPreviewView() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        padding: "0 24px 32px",
      }}
    >
      <PreviewSection
        title="1. WashiTape"
        description="세이지/핑크 2색, 회전각·길이 조절 가능"
      >
        <div
          style={{
            position: "relative",
            height: "90px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <WashiTape color="sage" rotation={-8} width={110} style={{ top: 30, left: 16 }} />
          <WashiTape color="pink" rotation={6} width={90} style={{ top: 30, left: 170 }} />
          <WashiTape color="sage" rotation={0} width={70} height={20} style={{ top: 55, left: 250 }} />
        </div>
      </PreviewSection>

      <PreviewSection
        title="2. PhotoSticker"
        description="흰 테두리 + 그림자 + 회전, src 없으면 자리표시 아이콘"
      >
        <div style={{ position: "relative", height: "180px" }}>
          <PhotoSticker
            rotation={-7}
            size={120}
            style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}
          />
          <PhotoSticker
            rotation={9}
            size={120}
            style={{ position: "absolute", top: 40, left: 110, zIndex: 2 }}
          />
        </div>
      </PreviewSection>

      <PreviewSection
        title="3. 손그림 장식 아이콘 + 물결 밑줄"
        description="별 · 하트 · 스파클(X자 반짝임) · 물결 밑줄(width 가변)"
      >
        <div style={{ display: "flex", gap: "16px" }}>
          <IconLabel label="별">
            <SparkleStarIcon size={30} />
          </IconLabel>
          <IconLabel label="하트">
            <HandDrawnHeartIcon size={30} />
          </IconLabel>
          <IconLabel label="스파클">
            <SparkleIcon size={22} />
          </IconLabel>
        </div>
        <div
          style={{
            padding: "16px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
          }}
        >
          <div style={{ ...HANDWRITING_TEXT_STYLE, color: "#191f28" }}>
            오늘도 맛있는 하루 보내세요
          </div>
          <SwashUnderline width={190} />
        </div>
      </PreviewSection>

      <PreviewSection
        title="4. ScrapbookCard"
        description="크림 종이 + 그리드 패턴, showRings로 좌측 바인더 링 표시"
      >
        <ScrapbookCard>
          <div style={{ fontSize: "13px", color: "#4e5968" }}>
            showRings 기본값(false) — 그리드 패턴이 있는 카드 배경만이에요.
          </div>
        </ScrapbookCard>
        <div style={{ height: "16px" }} />
        <ScrapbookCard showRings ringCount={4}>
          <div style={{ fontSize: "13px", color: "#4e5968" }}>
            showRings=true — 왼쪽에 스프링 바인더 링 4개가 붙어요.
          </div>
        </ScrapbookCard>
      </PreviewSection>

      <PreviewSection title="5. 조합 예시" description="다섯 컴포넌트를 함께 써본 모습">
        <ScrapbookCard showRings ringCount={3}>
          <div style={{ position: "relative" }}>
            <WashiTape color="pink" rotation={-10} width={90} style={{ top: -10, right: 10 }} />
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
              <PhotoSticker rotation={-5} size={100} />
              <div style={{ flex: 1 }}>
                <div style={{ ...HANDWRITING_TEXT_STYLE, fontSize: "16px", color: "#191f28" }}>
                  1년 전 오늘의 기록
                </div>
                <SwashUnderline width={120} />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "6px",
                  }}
                >
                  <SparkleIcon size={14} />
                  <span style={{ fontSize: "12px", color: SAGE_GREEN_DARK }}>
                    그날의 기억
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrapbookCard>
      </PreviewSection>
    </div>
  );
}
