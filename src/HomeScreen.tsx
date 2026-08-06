import {
  Badge,
  Border,
  List,
  ListRow,
  Skeleton,
  useBottomSheet,
} from "@toss/tds-mobile";
import {
  CalendarDays,
  Headphones,
  History,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import CustomerSupportView from "./CustomerSupportView";
import FoodTestModal from "./FoodTestView";
import {
  formatDDay,
  getDaysUntil,
  sortPlannedVisitsByDate,
  type PlannedVisit,
} from "./lib/plannedVisitStorage";
import {
  BookmarkRibbonIcon,
  ChatHeartIcon,
  FoldedMapPinIcon,
  RiceBowlIcon,
} from "./lib/quickActionIcons";
import { SheetHeader } from "./lib/SheetHeader";
import { fetchTodayMealPosts, type ThreadPost } from "./lib/threadPosts";
import { oneYearAgoDateInputValue, type Restaurant } from "./restaurantStorage";

const RECENT_RESTAURANT_LIMIT = 2;
const RECENT_POST_LIMIT = 2;
const POST_PREVIEW_MAX_LENGTH = 40;

// 퀵 액션 아이콘 타일의 공통 톤이에요. 아바타/문항 일러스트에서 쓰는 세이지그린
// 계열(#9CAF9A)로 통일해서, 차분하고 정갈한 느낌을 줘요. 준비중(비활성) 타일은
// 기존과 같이 중립 회색 톤을 유지해서 "아직 쓸 수 없다"는 신호를 그대로 남겨요.
const QUICK_ACTION_ACTIVE_BG = "#E7EFE6";
const QUICK_ACTION_ACTIVE_ICON_COLOR = "#4A6350";
const QUICK_ACTION_DISABLED_BG = "#f2f4f6";

// 이름이 아무리 길어도 옆에 나란히 있는 배지가 밀려나지 않도록, 이름 쪽에만
// 한 줄 말줄임을 적용해요. white-space: nowrap 대신 -webkit-line-clamp를 쓰는
// 이유는 App.tsx의 동명 상수 주석을 참고해주세요(ListRow 내부 래퍼가 nowrap
// 텍스트 때문에 억지로 넓어지는 문제가 있어요).
const NAME_ELLIPSIS_STYLE: CSSProperties = {
  flex: "1 1 auto",
  minWidth: 0,
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  wordBreak: "break-all",
};

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

// 정확히 1년 전 오늘 방문한 맛집 기록이 있을 때만 보여주는 회고 카드예요.
// 여러 곳이면 사진이 있는 기록을 대표로 앞세우고(없으면 그냥 첫 기록),
// 나머지는 "+N곳 더보기"로 펼쳐볼 수 있게 해요. 다른 홈 카드(StatsCard,
// DDayCard)와 같은 구조(아이콘 칩 + 문구, 16px 라운드 카드)를 쓰되, 색만
// 세이지그린 톤으로 구분해요. 매번 화면을 흔들거나 강조 애니메이션을 넣지
// 않고 차분한 카드로만 보여줘서, 그날 홈을 여러 번 오가도 부담스럽지 않게 해요.
function AnniversaryCard({
  restaurants,
  onSelectRestaurant,
  onViewMore,
}: {
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onViewMore: () => void;
}) {
  const featured =
    restaurants.find((restaurant) => (restaurant.photos?.length ?? 0) > 0) ??
    restaurants[0];
  const extraCount = restaurants.length - 1;
  const photo = featured.photos?.[0];
  const preview = featured.memo
    ? truncateForPreview(featured.memo, POST_PREVIEW_MAX_LENGTH)
    : null;

  return (
    <div style={{ padding: "0 24px" }}>
      <div
        style={{
          borderRadius: "16px",
          backgroundColor: "#EAF0EA",
          overflow: "hidden",
        }}
      >
        <div
          onClick={() => onSelectRestaurant(featured)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 20px",
            cursor: "pointer",
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt=""
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#DCE7DB",
                flexShrink: 0,
              }}
            >
              <History size={18} color="#4A6350" />
            </div>
          )}
          <div
            style={{
              flex: "1 1 auto",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#4A6350" }}>
              1년 전 오늘
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#333d4b",
                ...NAME_ELLIPSIS_STYLE,
              }}
            >
              {featured.name}에 다녀왔어요
            </span>
            {preview && (
              <span
                style={{
                  fontSize: "13px",
                  color: "#6b7684",
                  ...NAME_ELLIPSIS_STYLE,
                }}
              >
                {preview}
              </span>
            )}
          </div>
        </div>
        {extraCount > 0 && (
          <div
            onClick={onViewMore}
            style={{
              padding: "0 20px 14px",
              textAlign: "right",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#4A6350" }}>
              +{extraCount}곳 더보기 ›
            </span>
          </div>
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
            width: "56px",
            height: "56px",
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: comingSoon
              ? QUICK_ACTION_DISABLED_BG
              : QUICK_ACTION_ACTIVE_BG,
            boxShadow: comingSoon ? "none" : "0 3px 8px rgba(74, 99, 80, 0.16)",
          }}
        >
          {icon}
        </span>
        {comingSoon ? (
          <span style={{ position: "absolute", top: "-6px", right: "-8px" }}>
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
  onViewMap,
  onViewScraps,
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
  onViewMap: () => void;
  onViewScraps: () => void;
}) {
  const [recentPosts, setRecentPosts] = useState<ThreadPost[]>([]);
  const [isPostsLoaded, setIsPostsLoaded] = useState(false);
  const [isFoodTestOpen, setIsFoodTestOpen] = useState(false);
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

  // 정확히 1년 전 오늘(같은 월/일) 방문한 기록만 골라요. 날짜가 바뀌는 자정
  // 경계에서만 값이 바뀌면 되니 매 렌더마다 다시 계산해도 부담 없어요.
  const oneYearAgoRestaurants = useMemo(() => {
    const target = oneYearAgoDateInputValue();
    return restaurants.filter((restaurant) => restaurant.visitDate === target);
  }, [restaurants]);

  const openCustomerSupportSheet = () => {
    open({
      header: <SheetHeader title="고객센터" onClose={close} />,
      children: <CustomerSupportView onClose={close} />,
    });
  };

  const openAnniversarySheet = () => {
    open({
      header: <SheetHeader title="1년 전 오늘" onClose={close} />,
      children: (
        <List>
          {oneYearAgoRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => {
                close();
                onSelectRestaurant(restaurant);
              }}
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
                    bottom={[restaurant.neighborhood, `★ ${restaurant.rating}`]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                }
              />
            </div>
          ))}
        </List>
      ),
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ padding: "0 24px" }}>
        <div style={{ fontSize: "20px", fontWeight: 700, color: "#191f28" }}>
          안녕하세요, {nickname ?? "회원"}님
        </div>
        <div style={{ marginTop: "4px", fontSize: "14px", color: "#8b95a1" }}>
          {formatTodayGreetingDate()}
        </div>
      </div>

      {isRestaurantsLoaded && oneYearAgoRestaurants.length > 0 && (
        <AnniversaryCard
          restaurants={oneYearAgoRestaurants}
          onSelectRestaurant={onSelectRestaurant}
          onViewMore={openAnniversarySheet}
        />
      )}

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
            <RiceBowlIcon size={26} color={QUICK_ACTION_ACTIVE_ICON_COLOR} />
          }
          label="오늘의 식사"
          onClick={onWriteRestaurant}
        />
        <QuickActionButton
          icon={
            <ChatHeartIcon size={26} color={QUICK_ACTION_ACTIVE_ICON_COLOR} />
          }
          label="오늘의 한 입"
          onClick={onViewTodayMeal}
        />
        <QuickActionButton
          icon={
            <FoldedMapPinIcon
              size={26}
              color={QUICK_ACTION_ACTIVE_ICON_COLOR}
            />
          }
          label="지도"
          onClick={onViewMap}
        />
        <QuickActionButton
          icon={
            <BookmarkRibbonIcon
              size={26}
              color={QUICK_ACTION_ACTIVE_ICON_COLOR}
            />
          }
          label="스크랩"
          onClick={onViewScraps}
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
                            width: "100%",
                            minWidth: 0,
                          }}
                        >
                          <span style={NAME_ELLIPSIS_STYLE}>
                            {restaurant.name}
                          </span>
                          {(restaurant.isReservation ||
                            restaurant.isSpecialDay) && (
                            <span
                              style={{
                                display: "flex",
                                gap: "6px",
                                flexShrink: 0,
                              }}
                            >
                              {restaurant.isReservation && (
                                <Badge
                                  size="xsmall"
                                  variant="weak"
                                  color="green"
                                >
                                  예약
                                </Badge>
                              )}
                              {restaurant.isSpecialDay && (
                                <Badge
                                  size="xsmall"
                                  variant="weak"
                                  color="yellow"
                                >
                                  ⭐ 특별한 날
                                </Badge>
                              )}
                            </span>
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
        onClick={() => setIsFoodTestOpen(true)}
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
              <Sparkles size={18} color="#6b7684" />
            </span>
          }
          contents={<ListRow.Texts type="1RowTypeA" top="먹보조사" />}
        />
      </div>

      <div onClick={openCustomerSupportSheet} style={{ cursor: "pointer" }}>
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

      <FoodTestModal
        open={isFoodTestOpen}
        onClose={() => setIsFoodTestOpen(false)}
      />
    </div>
  );
}
