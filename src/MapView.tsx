import { Badge } from "@toss/tds-mobile";
import { useMemo } from "react";
import {
  findProvinceForNeighborhood,
  getProvinceShortName,
} from "./lib/koreanRegions";
import {
  KOREA_MAP_VIEWBOX_HEIGHT,
  KOREA_MAP_VIEWBOX_WIDTH,
  PROVINCE_MAP_POINTS,
} from "./lib/koreaMapLayout";
import type { Restaurant } from "./restaurantStorage";

// GPS나 외부 지도 API 없이, 시/도 단위로 "어디에 얼마나 기록했는지"만 한눈에
// 보여주는 클러스터 지도예요. 배경은 실제 행정구역 경계가 아니라 한반도 실루엣을
// 흉내 낸 장식용 SVG이고, 실제 정보는 그 위에 얹은 배지(숫자)들이 전부예요.
const MAP_LAND_FILL = "#E7EFE6";
const MAP_LAND_STROKE = "#9CAF9A";

export default function MapView({
  restaurants,
  onSelectProvince,
}: {
  restaurants: Restaurant[];
  onSelectProvince: (province: string) => void;
}) {
  const countByProvince = useMemo(() => {
    const counts = new Map<string, number>();
    for (const restaurant of restaurants) {
      const province = findProvinceForNeighborhood(restaurant.neighborhood);
      if (!province) {
        continue;
      }
      counts.set(province, (counts.get(province) ?? 0) + 1);
    }
    return counts;
  }, [restaurants]);

  const hasAnyRecord = countByProvince.size > 0;

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div
        style={{
          marginBottom: "16px",
          fontSize: "14px",
          color: "#6b7684",
          textAlign: "center",
        }}
      >
        {hasAnyRecord
          ? "숫자를 누르면 그 지역 기록만 모아볼 수 있어요."
          : "아직 지역별 기록이 없어요. 맛집을 기록하면 여기에 표시돼요."}
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          // viewBox 비율(300:400)을 그대로 유지해서, 백분율로 계산한 배지
          // 위치가 SVG 위 실제 좌표와 항상 일치하도록 해요.
          aspectRatio: `${KOREA_MAP_VIEWBOX_WIDTH} / ${KOREA_MAP_VIEWBOX_HEIGHT}`,
          margin: "0 auto",
          maxWidth: "280px",
        }}
      >
        <svg
          viewBox={`0 0 ${KOREA_MAP_VIEWBOX_WIDTH} ${KOREA_MAP_VIEWBOX_HEIGHT}`}
          style={{ width: "100%", height: "100%", display: "block" }}
          aria-hidden="true"
        >
          {/* 한반도를 정확히 그린 게 아니라, "지도처럼 보이는" 부드러운
              실루엣이에요. 실제 정보는 이 위에 얹는 배지들이 전달해요. */}
          <path
            d="M150,20
               Q210,30 230,70
               Q260,110 250,160
               Q260,210 230,250
               Q215,300 170,330
               Q120,335 90,300
               Q60,260 55,190
               Q45,140 75,90
               Q95,50 150,20 Z"
            fill={MAP_LAND_FILL}
            stroke={MAP_LAND_STROKE}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* 제주도예요. 본토와 이어지지 않은 별도 섬으로 남쪽에 작게 그려요. */}
          <ellipse
            cx="95"
            cy="368"
            rx="30"
            ry="15"
            fill={MAP_LAND_FILL}
            stroke={MAP_LAND_STROKE}
            strokeWidth="2.5"
          />
        </svg>

        {PROVINCE_MAP_POINTS.map(({ province, x, y }) => {
          const count = countByProvince.get(province) ?? 0;
          const leftPercent = (x / KOREA_MAP_VIEWBOX_WIDTH) * 100;
          const topPercent = (y / KOREA_MAP_VIEWBOX_HEIGHT) * 100;
          const shortName = getProvinceShortName(province);

          if (count === 0) {
            // 기록이 없는 지역은 배지 없이, 흐린 점으로만 위치를 표시해요.
            return (
              <span
                key={province}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: "translate(-50%, -50%)",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #b7c4b5",
                  opacity: 0.6,
                }}
              />
            );
          }

          return (
            <button
              key={province}
              type="button"
              onClick={() => onSelectProvince(province)}
              aria-label={`${province} 기록 ${count}곳 보기`}
              style={{
                position: "absolute",
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                border: "none",
                background: "none",
                padding: "4px",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <Badge size="small" color="green" variant="fill">
                {count}
              </Badge>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#333d4b",
                  backgroundColor: "rgba(255,255,255,0.85)",
                  borderRadius: "6px",
                  padding: "0 4px",
                  whiteSpace: "nowrap",
                }}
              >
                {shortName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
