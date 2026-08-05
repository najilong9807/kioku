import { Badge } from "@toss/tds-mobile";
import { useMemo } from "react";
import koreaMapImage from "./assets/korea-map.png";
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
// 보여주는 클러스터 지도예요. 배경은 실제 행정구역 경계가 아니라 손그림으로 그린
// 한반도 일러스트(korea-map.png)이고, 실제 정보는 그 위에 얹은 배지(숫자)들이
// 전부예요.

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
          // 배경 이미지의 실제 픽셀 비율을 그대로 유지해서, 백분율로 계산한
          // 배지 위치가 이미지 위 실제 좌표와 항상 일치하도록 해요.
          aspectRatio: `${KOREA_MAP_VIEWBOX_WIDTH} / ${KOREA_MAP_VIEWBOX_HEIGHT}`,
          margin: "0 auto",
          maxWidth: "280px",
        }}
      >
        <img
          src={koreaMapImage}
          alt=""
          aria-hidden="true"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "contain",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />

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
