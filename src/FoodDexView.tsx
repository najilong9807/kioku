import { ProgressBar } from "@toss/tds-mobile";
import { useMemo } from "react";
import { PhotoSticker } from "./components/scrapbook/PhotoSticker";
import { WashiTape } from "./components/scrapbook/WashiTape";
import { computeFoodDexDiscoveries } from "./lib/foodDex";
import { FOOD_DEX_MASTER, FOOD_DEX_TOTAL_COUNT } from "./lib/foodDexData";
import { FieldGuideIcon } from "./lib/quickActionIcons";
import { RatingStars } from "./lib/rating";
import type { Restaurant } from "./restaurantStorage";
import { SAGE_GREEN, SAGE_GREEN_BG, SAGE_GREEN_DARK } from "./theme";

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

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          padding: "16px 18px",
          borderRadius: "16px",
          backgroundColor: SAGE_GREEN_BG,
          marginBottom: "16px",
        }}
      >
        {/* 진행률 카드에만 붙인 테이프예요. 도감 항목별 사진은 아래에서
            PhotoSticker로 따로 꾸며서, 장식이 겹치지 않게 했어요. */}
        <WashiTape
          color="sage"
          rotation={-3}
          width={70}
          height={20}
          style={{ top: "-10px", right: "18px" }}
        />
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
        }}
      >
        {FOOD_DEX_MASTER.map((entry) => {
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
