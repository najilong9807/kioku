import { Asset, Badge, Button, useToast } from "@toss/tds-mobile";
import { Share2 } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { shareImage } from "./lib/share";
import { renderRestaurantCard } from "./lib/shareCard";
import type { Restaurant } from "./restaurantStorage";
import { HANDWRITING_TEXT_STYLE } from "./theme";

// 브랜드 색(노란색)이 밝아서 흰 글씨는 가독성이 떨어져요.
// variant="fill" + color="primary"(기본값) 버튼은 이 스타일로 글자색을 진하게 덮어써요.
const PRIMARY_FILL_BUTTON_TEXT_STYLE = {
  "--button-color": "#000000",
} as CSSProperties;

// 맛집 기록을 "일기 한 페이지"처럼 훑어보는 읽기 전용 상세보기예요. 목록/홈
// 미리보기에서 항목을 클릭하면 이 화면이 열리고, 여기서 "수정하기"를 눌러야만
// 기존 수정 폼(openEditSheet)으로 넘어가요. 다른 바텀시트들과 동일하게, 제목과
// 닫기(X) 버튼은 호출부(App.tsx)에서 공용 SheetHeader로 넘겨줘요.
//
// 배지/섹션을 나열하던 예전 구조 대신, 소제목(구분선) + 흐르는 손글씨 본문 +
// 하단 사진 나열로 구성했어요. 카테고리/별점/동네/날씨/같이 간 사람/예약/특별한
// 날 같은 부가 정보는 큰 배지로 강조하지 않고, 본문 위에 한 줄로 간결하게 모아서
// 보조 정보 톤으로만 보여줘요.
export default function RestaurantDetailView({
  restaurant,
  onEdit,
  onSelectTag,
}: {
  restaurant: Restaurant;
  onEdit: () => void;
  // 메뉴 태그 칩을 탭했을 때 실행돼요. 검색과 별개인 "태그 모아보기" 진입점이에요.
  // 넘기지 않으면(예: 미리보기 등 다른 맥락) 태그가 그냥 일반 텍스트로만 보여요.
  onSelectTag?: (tag: string) => void;
}) {
  const toast = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const photos = restaurant.photos ?? [];
  // 커스텀 제목이 있으면 그걸 소제목으로, 없으면 가게 이름을 그대로 써요.
  const subtitle = restaurant.title.trim() || restaurant.name;

  // 카드 이미지를 만들고, Web Share API(또는 앱인토스/클립보드/다운로드 폴백)로
  // 공유해요. 실제 공유/저장 동작은 lib/share.ts가 맡아요.
  const handleShare = async () => {
    if (isSharing) {
      return;
    }
    setIsSharing(true);
    try {
      const blob = await renderRestaurantCard(restaurant);
      const outcome = await shareImage({
        blob,
        fileName: `이게맛다-${subtitle}.png`,
        title: `이게맛다 - ${subtitle}`,
        text: restaurant.memo || `${subtitle}에 다녀왔어요.`,
      });

      if (outcome === "saved") {
        toast.openToast("이미지를 기기에 저장했어요");
      } else if (outcome === "copied") {
        toast.openToast("이미지를 클립보드에 복사했어요");
      } else if (outcome === "downloaded") {
        toast.openToast("이미지를 다운로드했어요");
      } else if (outcome === "failed") {
        toast.openToast("공유에 실패했어요. 다시 시도해주세요");
      }
      // "shared"/"cancelled"는 공유 시트 자체가 충분한 피드백이라 토스트를 따로 띄우지 않아요.
    } catch (error) {
      console.error("맛집 기록 카드를 만들지 못했어요.", error);
      toast.openToast("이미지를 만들지 못했어요. 다시 시도해주세요");
    } finally {
      setIsSharing(false);
    }
  };

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "0 24px 24px",
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
          // 이 화면(상세보기)에서만, 손글씨 폰트 특유의 "짜치는" 느낌을 줄이려고
          // 기본값(theme.ts의 letterSpacing 0.2px)보다 자간은 살짝 좁히고, 줄간격은
          // 기존 이 화면의 2보다 살짝 더 넓혔어요. 다른 화면(오늘의 한 입 등)의
          // HANDWRITING_TEXT_STYLE 사용부는 그대로예요.
          letterSpacing: "-0.2px",
          lineHeight: 2.15,
          color: restaurant.memo ? "#191f28" : "#b0b8c1",
        }}
      >
        {restaurant.memo || "기록된 메모가 없어요."}
      </div>

      {restaurant.menus.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#8b95a1" }}>먹은 메뉴</span>
          {restaurant.menus.map((menu) =>
            onSelectTag ? (
              <button
                key={menu}
                type="button"
                onClick={() => onSelectTag(menu)}
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <Badge size="small" variant="weak" color="green">
                  #{menu}
                </Badge>
              </button>
            ) : (
              <Badge key={menu} size="small" variant="weak" color="green">
                #{menu}
              </Badge>
            ),
          )}
        </div>
      )}

      {photos.length > 0 && (
        <div
          style={{
            // 종이 다이어리에서 사진을 붙여넣은 것처럼, 본문 텍스트와 사진 사이는
            // 다른 화면의 기본 flex gap(20px)보다 조금 더 여유 있게 둬요. 이
            // marginTop은 부모의 flex gap 위에 "추가로" 더해지는 간격이에요.
            marginTop: "16px",
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

      <div style={{ display: "flex", gap: "8px" }}>
        <Button
          display="block"
          variant="weak"
          color="dark"
          onClick={handleShare}
          loading={isSharing}
          style={{ flex: 1 }}
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Share2 size={16} />
            공유하기
          </span>
        </Button>
        <Button
          display="block"
          variant="fill"
          style={{ flex: 1, ...PRIMARY_FILL_BUTTON_TEXT_STYLE }}
          onClick={onEdit}
        >
          수정하기
        </Button>
      </div>
    </div>
  );
}
