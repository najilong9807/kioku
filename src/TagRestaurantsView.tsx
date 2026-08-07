import { List, ListRow, Rating, Result } from "@toss/tds-mobile";
import { useMemo, type CSSProperties } from "react";
import { EmptyDiaryIcon, EmptyStateFigure } from "./lib/emptyStateIcons";
import { formatDisplayDate, type Restaurant } from "./restaurantStorage";

// 이름이 아무리 길어도 옆에 나란히 있는 배지가 밀려나지 않도록, 이름 쪽에만
// 한 줄 말줄임을 적용해요. App.tsx의 동명 상수 주석에 이유가 설명되어 있어요.
const NAME_ELLIPSIS_STYLE: CSSProperties = {
  flex: "1 1 auto",
  minWidth: 0,
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  wordBreak: "break-all",
};

// 상세보기 화면에서 메뉴 태그 칩을 탭하면 열리는 "태그 모아보기"예요. 검색과는
// 별개로, 같은 메뉴(태그)를 먹었던 기록만 모아서 작은 회고처럼 훑어볼 수 있게
// 해줘요. restaurant.menus 배열에 정확히 이 태그가 포함된 기록만 골라요.
export function TagRestaurantsSheetContent({
  tag,
  restaurants,
  onSelectRestaurant,
}: {
  tag: string;
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
}) {
  const matches = useMemo(
    () =>
      restaurants
        .filter((restaurant) => restaurant.menus.includes(tag))
        .sort((a, b) => b.visitDate.localeCompare(a.visitDate)),
    [restaurants, tag],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "0 24px 24px",
      }}
    >
      <div style={{ fontSize: "13px", color: "#8b95a1" }}>
        "{tag}"를 먹은 기록 {matches.length}건
      </div>

      {matches.length === 0 ? (
        <Result
          figure={
            <EmptyStateFigure
              icon={<EmptyDiaryIcon size={32} color="#4A6350" />}
            />
          }
          title="아직 이 태그로 기록한 곳이 없어요"
          description={"다음에 이 메뉴를 먹으면\n기록에 태그로 남겨보세요."}
        />
      ) : (
        <List>
          {matches.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => onSelectRestaurant(restaurant)}
              style={{ cursor: "pointer" }}
            >
              <ListRow
                withTouchEffect
                left={
                  restaurant.photos && restaurant.photos.length > 0 ? (
                    <ListRow.AssetImage
                      src={restaurant.photos[0]}
                      shape="squircle"
                      size="medium"
                    />
                  ) : (
                    <ListRow.AssetText shape="squircle" size="medium">
                      {restaurant.name.slice(0, 1)}
                    </ListRow.AssetText>
                  )
                }
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top={
                      <span style={NAME_ELLIPSIS_STYLE}>
                        {restaurant.name}
                      </span>
                    }
                    bottom={[
                      restaurant.category,
                      formatDisplayDate(restaurant.visitDate),
                      restaurant.neighborhood,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                }
                right={
                  <Rating
                    readOnly
                    value={restaurant.rating}
                    max={5}
                    size="small"
                    variant="iconOnly"
                  />
                }
              />
            </div>
          ))}
        </List>
      )}
    </div>
  );
}
