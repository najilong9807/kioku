import { Button, List, ListRow, Rating, SearchField } from "@toss/tds-mobile";
import { useMemo, useState } from "react";
import { formatDisplayDate, type Restaurant } from "./restaurantStorage";

// "오늘뭐먹" 탭 상단 검색창(또는 다른 진입점)을 누르면 뜨는 바텀시트예요. "맛집 기록"
// 탭에 있는 이름 검색(restaurant.name에 검색어가 포함되는지)과 같은 방식으로
// 필터링해서, 탭을 옮기지 않고도 어디서든 바로 찾아볼 수 있어요.
export function RestaurantSearchSheetContent({
  restaurants,
  onSelectRestaurant,
  onClose,
}: {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return [];
    }
    return restaurants.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(trimmed),
    );
  }, [restaurants, query]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "0 24px 24px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button size="small" variant="weak" color="dark" onClick={onClose}>
          닫기
        </Button>
      </div>

      <SearchField
        placeholder="맛집 이름으로 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onDeleteClick={() => setQuery("")}
      />

      {query.trim().length === 0 ? (
        <div
          style={{
            padding: "40px 0",
            textAlign: "center",
            color: "#8b95a1",
            fontSize: "14px",
          }}
        >
          맛집 이름을 입력해서 검색해 보세요.
        </div>
      ) : results.length === 0 ? (
        <div
          style={{
            padding: "40px 0",
            textAlign: "center",
            color: "#8b95a1",
            fontSize: "14px",
          }}
        >
          검색 결과가 없어요.
        </div>
      ) : (
        <List>
          {results.map((restaurant) => (
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
                    top={restaurant.name}
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
