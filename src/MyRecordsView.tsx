import { Modal } from "@toss/tds-mobile";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { AvatarIcon } from "./lib/avatars";
import {
  FOOD_CATEGORY_AVATAR_STYLE,
  loadFoodTestResult,
  type FoodTestResult,
} from "./lib/foodTest";
import { getLevelInfo } from "./lib/levels";
import { LevelStamp } from "./lib/levelStamp";
import { PersonalityIcon } from "./lib/personalityIcons";
import { computeSeasonStamps } from "./lib/recordSummary";
import { SEASON_ICONS, SEASON_LABELS, type Season } from "./lib/seasonIcon";
import type { Restaurant } from "./restaurantStorage";
import { HANDWRITING_TEXT_STYLE, SAGE_GREEN, SAGE_GREEN_BG, SAGE_GREEN_DARK } from "./theme";

const SEASON_ORDER: Season[] = ["spring", "summer", "autumn", "winter"];

// ProfileView가 이미 갖고 있는 등급 배지, 먹보조사 결과, 계절 스탬프를 다이어리
// 표지처럼 한 화면에 모아 보여줘요. 새로 요청하는 데이터는 없고, ProfileView가
// 전달해주는 restaurants와 세션에 저장된 먹보조사 결과만으로 그려요.
// ProfileView가 이미 바텀시트 안에 있어서(바텀시트는 싱글턴이라 또 다른
// 바텀시트를 열면 지금 화면이 통째로 바뀌어버려요) LevelTableModal과 같은
// 이유로, 여기서도 별도 오버레이인 Modal을 로컬로 열고 닫아요.
export default function MyRecordsView({
  open,
  onClose,
  nickname,
  restaurantCount,
  restaurants,
}: {
  open: boolean;
  onClose: () => void;
  nickname: string;
  restaurantCount: number;
  restaurants: Restaurant[];
}) {
  const [foodTestResult, setFoodTestResult] = useState<FoodTestResult | null>(
    null,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    let isMounted = true;
    loadFoodTestResult().then((value) => {
      if (isMounted) {
        setFoodTestResult(value);
        setIsLoaded(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [open]);

  const { tier } = getLevelInfo(restaurantCount);
  const year = new Date().getFullYear();
  const stamps = computeSeasonStamps(restaurants, year);

  return (
    <Modal open={open} onOpenChange={(next) => !next && onClose()}>
      <Modal.Overlay onClick={onClose} />
      <Modal.Content
        style={{
          width: "min(88vw, 360px)",
          maxHeight: "84vh",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#191f28" }}>
            나의 기록
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              display: "flex",
              border: "none",
              background: "none",
              padding: "4px",
              cursor: "pointer",
              color: "#8b95a1",
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "18px",
            padding: "28px 20px 24px",
            borderRadius: "20px",
            border: `1.5px solid ${SAGE_GREEN}`,
            backgroundColor: SAGE_GREEN_BG,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <LevelStamp level={tier.level} size={48} />
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#191f28" }}>
              {nickname}님의 {tier.name}
            </span>
            <span
              style={{
                ...HANDWRITING_TEXT_STYLE,
                fontSize: "13px",
                lineHeight: 1.4,
                color: SAGE_GREEN_DARK,
              }}
            >
              지금까지 {restaurantCount}곳을 기록했어요
            </span>
          </div>

          {isLoaded && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "14px",
                backgroundColor: "#ffffff",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {foodTestResult ? (
                <>
                  <AvatarIcon
                    category="food"
                    style={FOOD_CATEGORY_AVATAR_STYLE[foodTestResult.foodCategory]}
                    size={40}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      minWidth: 0,
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#8b95a1" }}>
                      먹보조사 결과
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#191f28",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {foodTestResult.title}
                    </span>
                  </div>
                  <PersonalityIcon code={foodTestResult.personalityCode} size={28} />
                </>
              ) : (
                <span style={{ fontSize: "13px", color: "#8b95a1" }}>
                  아직 먹보조사를 하지 않았어요
                </span>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{ fontSize: "12px", color: SAGE_GREEN_DARK, fontWeight: 600 }}
            >
              {year}년 계절별 기록
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              {SEASON_ORDER.map((season) => {
                const Icon = SEASON_ICONS[season];
                return (
                  <div
                    key={season}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      padding: "8px 10px",
                      borderRadius: "12px",
                      backgroundColor: "#ffffff",
                      minWidth: "48px",
                    }}
                  >
                    <Icon size={18} color={SAGE_GREEN_DARK} />
                    <span
                      style={{
                        fontSize: "10px",
                        color: SAGE_GREEN_DARK,
                        fontWeight: 600,
                      }}
                    >
                      {SEASON_LABELS[season]}
                    </span>
                    <span
                      style={{ fontSize: "12px", color: "#191f28", fontWeight: 700 }}
                    >
                      {stamps[season]}곳
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
}
