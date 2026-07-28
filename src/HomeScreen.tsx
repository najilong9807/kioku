import { Border, Button, List, ListRow } from "@toss/tds-mobile";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { fetchTodayMealPosts, type ThreadPost } from "./lib/threadPosts";
import type { Restaurant } from "./restaurantStorage";

// 브랜드 색(노란색)이 밝아서 흰 글씨는 가독성이 떨어져요.
// variant="fill" + color="primary"(기본값) 버튼은 이 스타일로 글자색을 진하게 덮어써요.
const PRIMARY_FILL_BUTTON_TEXT_STYLE = {
  "--button-color": "#000000",
} as CSSProperties;

const RECENT_RESTAURANT_LIMIT = 2;
const RECENT_POST_LIMIT = 2;
const POST_PREVIEW_MAX_LENGTH = 40;

function formatTodayGreetingDate(): string {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// 여러 줄 글 내용을 카드 한 줄 미리보기로 줄여요.
function truncateForPreview(text: string, maxLength: number): string {
  const singleLine = text.replace(/\s+/g, " ").trim();
  return singleLine.length > maxLength
    ? `${singleLine.slice(0, maxLength)}…`
    : singleLine;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        padding: "0 24px 8px",
        fontSize: "16px",
        fontWeight: 700,
        color: "#191f28",
      }}
    >
      {children}
    </div>
  );
}

function EmptyPreview({ children }: { children: string }) {
  return (
    <div
      style={{
        padding: "20px 24px",
        textAlign: "center",
        color: "#8b95a1",
        fontSize: "14px",
      }}
    >
      {children}
    </div>
  );
}

export default function HomeScreen({
  nickname,
  restaurants,
  onWriteRestaurant,
  onViewRestaurants,
  onViewTodayMeal,
}: {
  nickname: string | null;
  restaurants: Restaurant[];
  onWriteRestaurant: () => void;
  onViewRestaurants: () => void;
  onViewTodayMeal: () => void;
}) {
  const [recentPosts, setRecentPosts] = useState<ThreadPost[]>([]);
  const [isPostsLoaded, setIsPostsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchTodayMealPosts().then((posts) => {
      if (!isMounted) {
        return;
      }
      setRecentPosts(posts.slice(0, RECENT_POST_LIMIT));
      setIsPostsLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // 방문일 기준 최신순으로 최근 기록 1~2개만 골라요. App.tsx의 "최신순" 정렬과 동일한 기준이에요.
  const recentRestaurants = useMemo(
    () =>
      [...restaurants]
        .sort(
          (a, b) =>
            b.visitDate.localeCompare(a.visitDate) ||
            Number(b.id) - Number(a.id),
        )
        .slice(0, RECENT_RESTAURANT_LIMIT),
    [restaurants],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ padding: "0 24px" }}>
        <div
          style={{ fontSize: "20px", fontWeight: 700, color: "#191f28" }}
        >
          안녕하세요, {nickname ?? "회원"}님
        </div>
        <div style={{ marginTop: "4px", fontSize: "14px", color: "#8b95a1" }}>
          {formatTodayGreetingDate()}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "0 24px",
        }}
      >
        <Button
          display="block"
          variant="fill"
          style={PRIMARY_FILL_BUTTON_TEXT_STYLE}
          onClick={onWriteRestaurant}
        >
          맛집 기록하기
        </Button>
        <Button
          display="block"
          variant="weak"
          color="dark"
          onClick={onViewTodayMeal}
        >
          오늘뭐먹 보기
        </Button>
      </div>

      <div>
        <SectionLabel>최근 맛집 기록</SectionLabel>
        {recentRestaurants.length === 0 ? (
          <EmptyPreview>아직 기록이 없어요.</EmptyPreview>
        ) : (
          <List>
            {recentRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={onViewRestaurants}
                style={{ cursor: "pointer" }}
              >
                <ListRow
                  withTouchEffect
                  left={
                    <ListRow.AssetText shape="squircle" size="medium">
                      {restaurant.name.slice(0, 1)}
                    </ListRow.AssetText>
                  }
                  contents={
                    <ListRow.Texts
                      type="2RowTypeA"
                      top={restaurant.name}
                      bottom={[
                        restaurant.neighborhood,
                        `★ ${restaurant.rating}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                  }
                />
              </div>
            ))}
          </List>
        )}
      </div>

      <div>
        <SectionLabel>최근 오늘뭐먹 글</SectionLabel>
        {!isPostsLoaded ? null : recentPosts.length === 0 ? (
          <EmptyPreview>아직 올라온 글이 없어요.</EmptyPreview>
        ) : (
          <List>
            {recentPosts.map((post) => (
              <div
                key={post.id}
                onClick={onViewTodayMeal}
                style={{ cursor: "pointer" }}
              >
                <ListRow
                  withTouchEffect
                  contents={
                    <ListRow.Texts
                      type="2RowTypeA"
                      top={truncateForPreview(
                        post.content,
                        POST_PREVIEW_MAX_LENGTH,
                      )}
                      bottom={[post.authorNickname, post.neighborhood]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                  }
                />
              </div>
            ))}
          </List>
        )}
      </div>

      <Border />
    </div>
  );
}
