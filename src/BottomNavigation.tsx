// 리디자인("뜸부기" 레퍼런스) 반영: 화면 상단 텍스트 탭바를 대체하는 하단
// 아이콘 네비게이션이에요. 실제 앱의 5개 탭(홈/맛있는 하루/오늘의 한 입/
// 다가올 한 입/맛집 도감) 이름·개수·순서·라우팅은 App.tsx의 selectedTab
// 하나 그대로 쓰고, 이 컴포넌트는 그 값을 보여주고 바꾸는 "뷰"만 담당해요.
import {
  DiaryNavIcon,
  FoodDexNavIcon,
  HomeNavIcon,
  TodayBiteNavIcon,
  UpcomingNavIcon,
} from "./lib/bottomNavIcons";
import { DARK_NAVY, PAPER_CREAM, SAGE_GREEN } from "./theme";

const NAV_ITEMS = [
  { label: "홈", Icon: HomeNavIcon },
  { label: "맛있는 하루", Icon: DiaryNavIcon },
  { label: "오늘의 한 입", Icon: TodayBiteNavIcon },
  { label: "다가올 한 입", Icon: UpcomingNavIcon },
  { label: "맛집 도감", Icon: FoodDexNavIcon },
] as const;

export default function BottomNavigation({
  selectedTab,
  onSelectTab,
}: {
  selectedTab: number;
  onSelectTab: (index: number) => void;
}) {
  return (
    <nav
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 10,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "flex-start",
        gap: "2px",
        padding: "10px 4px calc(10px + env(safe-area-inset-bottom, 0px))",
        borderTopLeftRadius: "20px",
        borderTopRightRadius: "20px",
        backgroundColor: "rgba(253, 246, 233, 0.94)",
        backdropFilter: "blur(6px)",
        boxShadow: "0 -2px 10px rgba(24, 35, 56, 0.08)",
      }}
    >
      {NAV_ITEMS.map(({ label, Icon }, index) => {
        const selected = selectedTab === index;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelectTab(index)}
            aria-label={label}
            aria-current={selected ? "page" : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "4px",
              flex: "1 1 0",
              minWidth: 0,
              border: "none",
              background: "none",
              padding: "2px 0 0",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: selected ? SAGE_GREEN : "transparent",
                transition: "background-color 0.15s ease",
              }}
            >
              <Icon size={22} color={selected ? "#ffffff" : DARK_NAVY} />
            </span>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: selected ? 700 : 500,
                color: selected ? DARK_NAVY : "#7c8698",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "clip",
                maxWidth: "100%",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
