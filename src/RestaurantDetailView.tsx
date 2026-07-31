import { Asset, Badge, Border, Button, Rating } from "@toss/tds-mobile";
import type { CSSProperties } from "react";
import { formatDisplayDate, type Restaurant } from "./restaurantStorage";
import { HANDWRITING_TEXT_STYLE } from "./theme";

// 브랜드 색(노란색)이 밝아서 흰 글씨는 가독성이 떨어져요.
// variant="fill" + color="primary"(기본값) 버튼은 이 스타일로 글자색을 진하게 덮어써요.
const PRIMARY_FILL_BUTTON_TEXT_STYLE = {
  "--button-color": "#000000",
} as CSSProperties;

function SectionTitle({ children }: { children: string }) {
  return (
    <div
      style={{
        marginBottom: "10px",
        fontSize: "14px",
        fontWeight: 700,
        color: "#6b7684",
      }}
    >
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}
    >
      <span style={{ fontSize: "14px", color: "#8b95a1" }}>{label}</span>
      <span
        style={{
          fontSize: "14px",
          color: "#191f28",
          fontWeight: 500,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function MenuTag({ children }: { children: string }) {
  return (
    <span
      style={{
        padding: "6px 12px",
        borderRadius: "16px",
        backgroundColor: "#f2f4f6",
        fontSize: "14px",
        color: "#191f28",
      }}
    >
      {children}
    </span>
  );
}

// 맛집 기록을 "일기 한 페이지"처럼 훑어보는 읽기 전용 상세보기예요.
// 목록/홈 미리보기에서 항목을 클릭하면 이 화면이 열리고, 여기서 "수정하기"를
// 눌러야만 기존 수정 폼(openEditSheet)으로 넘어가요.
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
  const hasCompanionOrWeather = Boolean(
    restaurant.companion || restaurant.weather,
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "0 24px 24px",
      }}
    >
      {photos.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {photos.map((photo, index) => (
            <Asset.Image
              key={index}
              src={photo}
              alt={`${restaurant.name} 사진 ${index + 1}`}
              scaleType="crop"
              frameShape={{ width: 240, height: 240, radius: 20 }}
            />
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Badge size="small" variant="weak" color="blue">
            {restaurant.category}
          </Badge>
          {restaurant.isReservation && (
            <Badge size="small" variant="weak" color="green">
              예약
            </Badge>
          )}
          {restaurant.isSpecialDay && (
            <Badge size="small" variant="weak" color="yellow">
              ⭐ 특별한 날
            </Badge>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Rating
            readOnly
            value={restaurant.rating}
            max={5}
            size="small"
            variant="iconOnly"
          />
          <span style={{ fontSize: "14px", color: "#8b95a1" }}>
            {[formatDisplayDate(restaurant.visitDate), restaurant.neighborhood]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
      </div>

      {hasCompanionOrWeather && (
        <>
          <Border />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {restaurant.companion && (
              <InfoRow label="같이 간 사람" value={restaurant.companion} />
            )}
            {restaurant.weather && (
              <InfoRow label="날씨" value={restaurant.weather} />
            )}
          </div>
        </>
      )}

      {restaurant.menus.length > 0 && (
        <div>
          <SectionTitle>먹은 메뉴</SectionTitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {restaurant.menus.map((menu, index) => (
              <MenuTag key={`${menu}-${index}`}>{menu}</MenuTag>
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionTitle>이 곳에서의 기억</SectionTitle>
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: "20px",
            padding: "20px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            ...HANDWRITING_TEXT_STYLE,
            color: restaurant.memo ? "#191f28" : "#b0b8c1",
          }}
        >
          {restaurant.memo || "기록된 메모가 없어요."}
        </div>
      </div>

      {restaurant.receiptImage && (
        <div>
          <SectionTitle>영수증</SectionTitle>
          <Asset.Image
            src={restaurant.receiptImage}
            alt="영수증 사진"
            scaleType="crop"
            frameShape={{ width: 96, height: 96, radius: 12 }}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <Button
          style={{ flex: 1 }}
          variant="weak"
          color="dark"
          onClick={onClose}
        >
          닫기
        </Button>
        <Button
          style={{ flex: 1, ...PRIMARY_FILL_BUTTON_TEXT_STYLE }}
          variant="fill"
          onClick={onEdit}
        >
          수정하기
        </Button>
      </div>
    </div>
  );
}
