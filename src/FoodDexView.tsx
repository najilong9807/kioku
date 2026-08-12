import { ProgressBar } from "@toss/tds-mobile";
import { useMemo, useState } from "react";
import dexEmptyStateImage from "./assets/images/archive/dex-empty-state.png";
import { PhotoSticker } from "./components/scrapbook/PhotoSticker";
import { computeFoodDexDiscoveries } from "./lib/foodDex";
import { FOOD_DEX_MASTER, FOOD_DEX_TOTAL_COUNT } from "./lib/foodDexData";
import { FieldGuideIcon } from "./lib/quickActionIcons";
import { RatingStars } from "./lib/rating";
import type { Restaurant } from "./restaurantStorage";
import {
  BRAND_DISPLAY_FONT_FAMILY,
  CARD_RADIUS,
  DARK_NAVY,
  SAGE_GREEN,
  SAGE_GREEN_BG,
  SAGE_GREEN_DARK,
} from "./theme";

type DexFilter = "all" | "discovered" | "undiscovered";

// 맛있는 하루 기록에 붙인 메뉴 태그를 "도감"처럼 모아 보여줘요. 도감
// 항목(번호/이름)은 lib/foodDexData.ts에 70개 고정되어 있고, 그중 사용자가
// 실제로 먹고 기록한(=태그로 남긴) 것만 "발견"으로 표시해요. 발견한 항목은
// 대표 맛집(별점 최고, 동점이면 최근 방문)을 보여주고, 아직 못 먹어본
// 항목은 이름만 보이고 흐릿한 상태로 남아있어요. 계산은 매번 로컬 기록에서
// 다시 하고, 별도 저장 테이블은 없어요.
export default function FoodDexView({
  restaurants,
  onSelectTag,
}: {
  restaurants: Restaurant[];
  onSelectTag: (tag: string) => void;
}) {
  const discoveries = useMemo(
    () => computeFoodDexDiscoveries(restaurants),
    [restaurants],
  );
  const discoveredCount = discoveries.size;
  const progress =
    FOOD_DEX_TOTAL_COUNT > 0 ? discoveredCount / FOOD_DEX_TOTAL_COUNT : 0;

  const [filter, setFilter] = useState<DexFilter>("all");
  const visibleEntries = useMemo(
    () =>
      FOOD_DEX_MASTER.filter((entry) => {
        if (filter === "all") {
          return true;
        }
        const isDiscovered = discoveries.has(entry.name);
        return filter === "discovered" ? isDiscovered : !isDiscovered;
      }),
    [discoveries, filter],
  );

  return (
    <div style={{ backgroundColor: "#ffffff", padding: "0 24px 24px" }}>
      {/* "맛집 도감" 타이틀이에요. 탭이라 뒤로가기 화살표는 두지 않았어요. */}
      <div style={{ padding: "16px 0 12px" }}>
        <div
          style={{
            fontFamily: BRAND_DISPLAY_FONT_FAMILY,
            fontSize: "24px",
            color: DARK_NAVY,
          }}
        >
          맛집 도감
        </div>
      </div>

      {/* 진행률 표시는 이 카드 하나로 통합했어요. 예전에는 상단 일러스트
          배너("34/70" 예시 숫자가 박힌 그림)와 이 카드가 진행률을 중복
          표시했는데, 배너는 지우고 실제 데이터를 보여주는 이 카드만
          남겼어요. 장식(테이프/반짝임)도 가독성을 위해 뺐어요. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "16px 18px",
          borderRadius: CARD_RADIUS,
          backgroundColor: SAGE_GREEN_BG,
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FieldGuideIcon size={18} color={SAGE_GREEN_DARK} />
            <span
              style={{ fontSize: "13px", fontWeight: 700, color: SAGE_GREEN_DARK }}
            >
              나의 도감
            </span>
          </div>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#191f28" }}>
            {discoveredCount}/{FOOD_DEX_TOTAL_COUNT}개 발견
          </span>
        </div>
        <ProgressBar progress={progress} size="normal" color={SAGE_GREEN_DARK} />
      </div>

      {discoveredCount === 0 ? (
        // 발견한 맛집이 하나도 없을 때는 70칸짜리 "?" 그리드를 그대로
        // 보여주는 대신, 확정 PNG 에셋(전체 화면 empty state 일러스트)으로
        // 대체해요. 개별 미발견 칸(UndiscoveredCell)의 "?" 표시는 발견한
        // 항목이 1개 이상 있을 때만 그리드에 등장하므로 그대로 유지돼요.
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "8px 0 24px",
          }}
        >
          <img
            src={dexEmptyStateImage}
            alt="아직 기록하지 않은 맛집이에요! 새로운 맛집을 기록해 나만의 도감을 채워보세요."
            style={{
              display: "block",
              maxWidth: "320px",
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {(
              [
                { value: "all", label: "전체" },
                { value: "discovered", label: "발견됨" },
                { value: "undiscovered", label: "미발견" },
              ] as const
            ).map((option) => {
              const selected = filter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "999px",
                    border: selected ? "none" : "1.5px solid #E5DFC9",
                    backgroundColor: selected ? SAGE_GREEN_DARK : "transparent",
                    color: selected ? "#ffffff" : DARK_NAVY,
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {visibleEntries.length === 0 ? (
            <div
              style={{
                padding: "40px 0",
                textAlign: "center",
                fontSize: "13px",
                color: "#8b95a1",
              }}
            >
              해당하는 항목이 없어요.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
              }}
            >
              {visibleEntries.map((entry) => {
                const representative = discoveries.get(entry.name);
                return representative ? (
                  <DiscoveredCell
                    key={entry.name}
                    dexNumber={entry.dexNumber}
                    name={entry.name}
                    representative={representative}
                    onClick={() => onSelectTag(entry.name)}
                  />
                ) : (
                  <UndiscoveredCell
                    key={entry.name}
                    dexNumber={entry.dexNumber}
                    name={entry.name}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DexNumberBadge({ dexNumber }: { dexNumber: number }) {
  return (
    <span
      style={{
        position: "absolute",
        top: "6px",
        left: "6px",
        padding: "2px 6px",
        borderRadius: "999px",
        backgroundColor: "rgba(25, 31, 40, 0.55)",
        color: "#ffffff",
        fontSize: "10px",
        fontWeight: 700,
      }}
    >
      No.{dexNumber}
    </span>
  );
}

function DiscoveredCell({
  dexNumber,
  name,
  representative,
  onClick,
}: {
  dexNumber: number;
  name: string;
  representative: Restaurant;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: "8px",
        borderRadius: "14px",
        border: `1px solid ${SAGE_GREEN_BG}`,
        background: "#ffffff",
        textAlign: "left",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PhotoSticker
          src={representative.photos?.[0]}
          alt=""
          size={84}
          rotation={dexNumber % 2 === 0 ? -5 : 5}
        />
        <DexNumberBadge dexNumber={dexNumber} />
        {/* 발견 완료 배지예요. No. 배지(왼쪽 위)와 겹치지 않게 오른쪽
            위에 뒀어요. */}
        <span
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: SAGE_GREEN_DARK,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(24, 35, 56, 0.3)",
          }}
          aria-hidden="true"
        >
          <svg width="10" height="8" viewBox="0 0 12 10" fill="none">
            <path
              d="M1.5 5.2 L4.3 8 L10.5 1.5"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: SAGE_GREEN_DARK }}>
          #{name}
        </span>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#191f28",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {representative.name}
        </span>
        <RatingStars value={representative.rating} size={11} color={SAGE_GREEN} />
      </div>
    </button>
  );
}

function UndiscoveredCell({
  dexNumber,
  name,
}: {
  dexNumber: number;
  name: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: "8px",
        borderRadius: "14px",
        border: "1px solid #f2f4f6",
        background: "#fafafa",
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#eceef0",
          }}
        >
          <span style={{ fontSize: "22px", fontWeight: 700, color: "#c3c9d1" }}>
            ?
          </span>
        </div>
        <span
          style={{
            position: "absolute",
            top: "6px",
            left: "6px",
            padding: "2px 6px",
            borderRadius: "999px",
            backgroundColor: "rgba(140, 146, 153, 0.55)",
            color: "#ffffff",
            fontSize: "10px",
            fontWeight: 700,
          }}
        >
          No.{dexNumber}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#b0b8c1" }}>
          {name}
        </span>
        <span style={{ fontSize: "11px", color: "#b0b8c1" }}>
          아직 못 먹어봤어요
        </span>
      </div>
    </div>
  );
}
