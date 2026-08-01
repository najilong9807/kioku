import {
  Badge,
  Border,
  List,
  ListRow,
  Skeleton,
  useBottomSheet,
  useToast,
} from "@toss/tds-mobile";
import {
  Bookmark,
  CalendarDays,
  Headphones,
  MapPin,
  MessageCircle,
  UtensilsCrossed,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import CustomerSupportView from "./CustomerSupportView";
import {
  formatDDay,
  getDaysUntil,
  sortPlannedVisitsByDate,
  type PlannedVisit,
} from "./lib/plannedVisitStorage";
import { fetchTodayMealPosts, type ThreadPost } from "./lib/threadPosts";
import type { Restaurant } from "./restaurantStorage";

const RECENT_RESTAURANT_LIMIT = 2;
const RECENT_POST_LIMIT = 2;
const POST_PREVIEW_MAX_LENGTH = 40;

// 퀵 액션 아이콘 타일의 공통 톤. 브랜드 색(#FFC107)을 은은하게 눌러 아이콘 배경/글자에 써요.
const QUICK_ACTION_ACTIVE_BG = "#fff4cc";
const QUICK_ACTION_ACTIVE_ICON_COLOR = "#9a6b00";
const QUICK_ACTION_DISABLED_BG = "#f2f4f6";
const QUICK_ACTION_DISABLED_ICON_COLOR = "#b0b8c1";

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

// 총 기록 개수를 보여주는 작은 통계 카드예요. "맛집 기록" 탭 상단 문구(App.tsx)와
// 같은 restaurants.length 값을 재사용하고, 문구만 홈 화면에 맞게 다듬었어요.
function StatsCard({ isLoaded, count }: { isLoaded: boolean; count: number }) {
  return (
    <div style={{ padding: "0 24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          borderRadius: "16px",
          backgroundColor: "#fff8e1",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffecb3",
            flexShrink: 0,
          }}
        >
          <UtensilsCrossed size={18} color="#946200" />
        </div>
        {!isLoaded ? (
          <span style={{ fontSize: "14px", color: "#8b95a1" }}>
            불러오는 중...
          </span>
        ) : count > 0 ? (
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#333d4b" }}>
            지금까지 총 <span style={{ color: "#946200" }}>{count}곳</span>의
            맛집을 기록했어요
          </span>
        ) : (
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#333d4b" }}>
            첫 맛있는 하루를 기록해볼까요?
          </span>
        )}
      </div>
    </div>
  );
}

// 가장 가까운 방문 예정 하나를 D-day 형태로 보여주는 카드예요. 지난 일정(이미
// 지나버린 방문 예정)은 여기서는 제외하고, 오늘 포함 앞으로의 일정 중 가장
// 가까운 것만 보여줘요. 예정이 없으면 가벼운 안내 문구로 바꿔요. 눌러도
// 항상 달력 탭으로 이동해요.
function DDayCard({
  isLoaded,
  plannedVisits,
  onClick,
}: {
  isLoaded: boolean;
  plannedVisits: PlannedVisit[];
  onClick: () => void;
}) {
  if (!isLoaded) {
    return null;
  }

  const nextVisit = sortPlannedVisitsByDate(plannedVisits).find(
    (visit) => getDaysUntil(visit.visitDate) >= 0,
  );

  return (
    <div style={{ padding: "0 24px" }}>
      <div
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 20px",
          borderRadius: "16px",
          backgroundColor: "#eef2ff",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#dbe4ff",
            flexShrink: 0,
          }}
        >
          <CalendarDays size={18} color="#3654c9" />
        </div>
        {nextVisit ? (
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#333d4b" }}>
            {nextVisit.name}까지{" "}
            <span style={{ color: "#3654c9" }}>
              {formatDDay(getDaysUntil(nextVisit.visitDate))}
            </span>
          </span>
        ) : (
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#333d4b" }}>
            예정된 방문이 없어요. 다가올 한 입에서 계획해보세요.
          </span>
        )}
      </div>
    </div>
  );
}

function QuickActionButton({
  icon,
  label,
  comingSoon,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  comingSoon?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "4px 0 0",
        border: "none",
        background: "none",
        WebkitTapHighlightColor: "transparent",
        cursor: "pointer",
      }}
    >
      <span style={{ position: "relative", display: "inline-flex" }}>
        <span
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: comingSoon
              ? QUICK_ACTION_DISABLED_BG
              : QUICK_ACTION_ACTIVE_BG,
          }}
        >
          {icon}
        </span>
        {comingSoon ? (
          <span style={{ position: "absolute", top: "-8px", right: "-16px" }}>
            <Badge size="xsmall" color="elephant" variant="weak">
              준비중
            </Badge>
          </span>
        ) : null}
      </span>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: comingSoon ? "#b0b8c1" : "#333d4b",
        }}
      >
        {label}
      </span>
    </button>
  );
}

export default function HomeScreen({
  nickname,
  restaurants,
  isRestaurantsLoaded,
  plannedVisits,
  isPlannedVisitsLoaded,
  onWriteRestaurant,
  onSelectRestaurant,
  onViewTodayMeal,
  onViewCalendar,
}: {
  nickname: string | null;
  restaurants: Restaurant[];
  isRestaurantsLoaded: boolean;
  plannedVisits: PlannedVisit[];
  isPlannedVisitsLoaded: boolean;
  onWriteRestaurant: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onViewTodayMeal: () => void;
  onViewCalendar: () => void;
}) {
  const [recentPosts, setRecentPosts] = useState<ThreadPost[]>([]);
  const [isPostsLoaded, setIsPostsLoaded] = useState(false);
  const { openToast } = useToast();
  const { open, close } = useBottomSheet();

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

  const handleComingSoon = () => {
    openToast("곧 만나요!");
  };

  const openCustomerSupportSheet = () => {
    open({
      header: "고객센터",
      children: <CustomerSupportView onClose={close} />,
    });
  };

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

      <StatsCard isLoaded={isRestaurantsLoaded} count={restaurants.length} />

      <DDayCard
        isLoaded={isPlannedVisitsLoaded}
        plannedVisits={plannedVisits}
        onClick={onViewCalendar}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          columnGap: "8px",
          padding: "0 24px",
        }}
      >
        <QuickActionButton
          icon={
            <UtensilsCrossed size={24} color={QUICK_ACTION_ACTIVE_ICON_COLOR} />
          }
          label="맛집 기록하기"
          onClick={onWriteRestaurant}
        />
        <QuickActionButton
          icon={
            <MessageCircle size={24} color={QUICK_ACTION_ACTIVE_ICON_COLOR} />
          }
          label="오늘의 한 입 보기"
          onClick={onViewTodayMeal}
        />
        <QuickActionButton
          icon={<MapPin size={24} color={QUICK_ACTION_DISABLED_ICON_COLOR} />}
          label="지도"
          comingSoon
          onClick={handleComingSoon}
        />
        <QuickActionButton
          icon={<Bookmark size={24} color={QUICK_ACTION_DISABLED_ICON_COLOR} />}
          label="스크랩"
          comingSoon
          onClick={handleComingSoon}
        />
      </div>

      <div>
        <SectionLabel>최근 맛있는 하루</SectionLabel>
        {!isRestaurantsLoaded ? (
          <div style={{ padding: "0 24px" }}>
            <Skeleton
              custom={["listWithIcon"]}
              repeatLastItemCount={RECENT_RESTAURANT_LIMIT}
            />
          </div>
        ) : recentRestaurants.length === 0 ? (
          <EmptyPreview>아직 기록이 없어요.</EmptyPreview>
        ) : (
          <List>
            {recentRestaurants.map((restaurant) => (
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
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span>{restaurant.name}</span>
                          {restaurant.isReservation && (
                            <Badge size="xsmall" variant="weak" color="green">
                              예약
                            </Badge>
                          )}
                          {restaurant.isSpecialDay && (
                            <Badge size="xsmall" variant="weak" color="yellow">
                              ⭐ 특별한 날
                            </Badge>
                          )}
                        </span>
                      }
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
        <SectionLabel>최근 오늘의 한 입</SectionLabel>
        {!isPostsLoaded ? (
          <div style={{ padding: "0 24px" }}>
            <Skeleton
              custom={["listWithIcon"]}
              repeatLastItemCount={RECENT_POST_LIMIT}
            />
          </div>
        ) : recentPosts.length === 0 ? (
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
                  left={
                    post.photoUrl ? (
                      <ListRow.AssetImage
                        src={post.photoUrl}
                        shape="squircle"
                        size="medium"
                      />
                    ) : undefined
                  }
                  contents={
                    <ListRow.Texts
                      type="2RowTypeA"
                      top={
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span>
                            {truncateForPreview(
                              post.content,
                              POST_PREVIEW_MAX_LENGTH,
                            )}
                          </span>
                          {post.isReservation && (
                            <Badge size="xsmall" variant="weak" color="green">
                              예약
                            </Badge>
                          )}
                        </span>
                      }
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

      <div
        onClick={openCustomerSupportSheet}
        style={{ cursor: "pointer" }}
      >
        <ListRow
          withTouchEffect
          withArrow
          left={
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                backgroundColor: "#f2f4f6",
              }}
            >
              <Headphones size={18} color="#6b7684" />
            </span>
          }
          contents={<ListRow.Texts type="1RowTypeA" top="고객센터" />}
        />
      </div>
    </div>
  );
}
