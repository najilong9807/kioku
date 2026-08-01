import { Asset, Button } from "@toss/tds-mobile";
import { ArrowLeft, Bookmark } from "lucide-react";
import type { CSSProperties } from "react";
import {
  formatFullKoreanDate,
  type Restaurant,
} from "./restaurantStorage";
import { HANDWRITING_TEXT_STYLE } from "./theme";

// 브랜드 색(노란색)이 밝아서 흰 글씨는 가독성이 떨어져요.
// variant="fill" + color="primary"(기본값) 버튼은 이 스타일로 글자색을 진하게 덮어써요.
const PRIMARY_FILL_BUTTON_TEXT_STYLE = {
  "--button-color": "#000000",
} as CSSProperties;

// 맛집 기록을 "일기 한 페이지"처럼 훑어보는 읽기 전용 상세보기예요. 목록/홈
// 미리보기에서 항목을 클릭하면 이 화면이 열리고, 여기서 "수정하기"를 눌러야만
// 기존 수정 폼(openEditSheet)으로 넘어가요.
//
// 배지/섹션을 나열하던 예전 구조 대신, 날짜 제목 + 소제목(구분선) + 흐르는
// 손글씨 본문 + 하단 사진 나열로 구성했어요. 카테고리/별점/동네/날씨/같이 간
// 사람/예약/특별한 날 같은 부가 정보는 큰 배지로 강조하지 않고, 본문 위에
// 한 줄로 간결하게 모아서 보조 정보 톤으로만 보여줘요.
export default function RestaurantDetailView({
  restaurant,
  onEdit,
  onClose,
}: {
  restaurant: Restaurant;
  onEdit: () => void;
  onClose: () => void;
}) {
  const photos = restaurant.photos ?? [];
  // 커스텀 제목이 있으면 그걸 소제목으로, 없으면 가게 이름을 그대로 써요.
  const subtitle = restaurant.title.trim() || restaurant.name;

  const infoLine = [
    restaurant.category,
    `★${restaurant.rating}`,
    restaurant.neighborhood,
    restaurant.weather,
    restaurant.companion,
    restaurant.isReservation ? "예약" : null,
    restaurant.isSpecialDay ? "⭐특별한 날" : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" · ");

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px 12px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            border: "none",
            background: "none",
            padding: 0,
            cursor: "pointer",
            color: "#191f28",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <ArrowLeft size={22} />
        </button>
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#191f28" }}>
          {formatFullKoreanDate(restaurant.visitDate)}의 기록
        </span>
        {/* 스크랩 기능은 아직 없어요. 나중에 붙일 자리를 남겨두는 시각적
            요소라서 클릭 동작은 일부러 넣지 않았어요. */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            color: "#b0b8c1",
          }}
        >
          <Bookmark size={20} />
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          padding: "8px 24px 24px",
        }}
      >
        <div>
          <div
            style={{
              marginBottom: "12px",
              fontSize: "22px",
              fontWeight: 700,
              color: "#191f28",
            }}
          >
            {subtitle}
          </div>
          <div style={{ height: "1px", backgroundColor: "#e5e8eb" }} />
        </div>

        {infoLine && (
          <div style={{ fontSize: "13px", color: "#8b95a1" }}>{infoLine}</div>
        )}

        <div
          style={{
            minHeight: "140px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            ...HANDWRITING_TEXT_STYLE,
            fontSize: "20px",
            lineHeight: 2,
            color: restaurant.memo ? "#191f28" : "#b0b8c1",
          }}
        >
          {restaurant.memo || "기록된 메모가 없어요."}
        </div>

        {restaurant.menus.length > 0 && (
          <div style={{ fontSize: "13px", color: "#8b95a1" }}>
            먹은 메뉴 · {restaurant.menus.join(", ")}
          </div>
        )}

        {photos.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`${restaurant.name} 사진 ${index + 1}`}
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
              />
            ))}
          </div>
        )}

        {restaurant.receiptImage && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Asset.Image
              src={restaurant.receiptImage}
              alt="영수증 사진"
              scaleType="crop"
              frameShape={{ width: 44, height: 44, radius: 10 }}
            />
            <span style={{ fontSize: "12px", color: "#b0b8c1" }}>영수증</span>
          </div>
        )}

        <Button
          display="block"
          variant="fill"
          style={PRIMARY_FILL_BUTTON_TEXT_STYLE}
          onClick={onEdit}
        >
          수정하기
        </Button>
      </div>
    </div>
  );
}
