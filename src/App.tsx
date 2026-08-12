import {
  Asset,
  Badge,
  BottomSheet,
  Border,
  Button,
  Checkbox,
  List,
  ListRow,
  Result,
  SearchField,
  Tab,
  TextArea,
  TextField,
  Top,
  useBottomSheet,
  useDialog,
} from "@toss/tds-mobile";
import { Clock, Star } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
} from "react";
import "./App.css";
import { BrandMarkIcon } from "./BrandMarkIcon";
import CalendarView, { type PlannedVisitFormValues } from "./CalendarView";
import { SwashUnderline } from "./components/scrapbook/decorations";
import FoodDexView from "./FoodDexView";
import HomeScreen from "./HomeScreen";
import {
  EmptyDiaryIcon,
  EmptyStateFigure,
} from "./lib/emptyStateIcons";
import {
  FOOD_DEX_CATEGORIES,
  FOOD_DEX_MASTER,
  type FoodDexCategory,
  type FoodDexMasterEntry,
} from "./lib/foodDexData";
import { resizeImageFile } from "./lib/imageResize";
import {
  buildRegionFilterOptions,
  formatRegionLabel,
  matchesRegion,
} from "./lib/koreanRegions";
import { countUnreadNotifications } from "./lib/notifications";
import {
  archivePhotoOriginal,
  createPhotoArchiveKey,
} from "./lib/photoArchive";
import {
  loadPlannedVisits,
  savePlannedVisits,
  type PlannedVisit,
} from "./lib/plannedVisitStorage";
import { fetchProfile, saveProfile } from "./lib/profile";
import { pickRandomItem } from "./lib/random";
import {
  clampToHalfStepRating,
  RatingStars,
  RatingStarsInput,
  type Rating,
} from "./lib/rating";
import { SheetHeader } from "./lib/SheetHeader";
import { getUserIdentityHash } from "./lib/userIdentity";
import MapView from "./MapView";
import {
  NotificationBellButton,
  NotificationsSheetContent,
} from "./NotificationsView";
import OnboardingSlides from "./OnboardingSlides";
import ProfileView, { ProfileIconButton } from "./ProfileView";
import { RegionFilterSheetContent, RegionPicker } from "./RegionPicker";
import RestaurantDetailView from "./RestaurantDetailView";
import { RestaurantSearchSheetContent } from "./RestaurantSearchOverlay";
import SplashScreen from "./SplashScreen";
import {
  BRAND_DISPLAY_FONT_FAMILY,
  CORAL_RED,
  DARK_NAVY,
  DIVIDER_COLOR,
  HANDWRITING_TEXT_STYLE,
  LIST_THUMBNAIL_RADIUS,
  LIST_THUMBNAIL_SIZE,
  META_TEXT_COLOR,
  PAPER_CREAM,
  SAGE_GREEN_DARK,
  THEME_YELLOW,
  WARM_PAPER,
} from "./theme";
import {
  CATEGORIES,
  formatDisplayDate,
  formatFullKoreanDate,
  loadRestaurants,
  saveRestaurants,
  todayDateInputValue,
  type Category,
  type Restaurant,
} from "./restaurantStorage";
import { TagRestaurantsSheetContent } from "./TagRestaurantsView";
import TodayMealBoard from "./TodayMealBoard";

// 목록에서 메뉴가 많으면 2개까지만 보여주고 나머지는 "+N"으로 축약해요.
function summarizeMenus(menus: string[]): string {
  if (menus.length === 0) {
    return "";
  }
  const shown = menus.slice(0, 2).join(", ");
  const remaining = menus.length - 2;
  return remaining > 0 ? `${shown} +${remaining}` : shown;
}

// 브랜드 색(노란색)이 밝아서 흰 글씨는 가독성이 떨어져요.
// variant="fill" + color="primary"(기본값) 버튼은 이 스타일로 글자색을 진하게 덮어써요.
const PRIMARY_FILL_BUTTON_TEXT_STYLE = {
  "--button-color": "#000000",
} as CSSProperties;

// 이름이 아무리 길어도 옆에 나란히 있는 배지·별점·버튼이 밀려나지 않도록, 이름
// 쪽에만 한 줄 말줄임을 적용해요. white-space: nowrap 방식은 ListRow 내부
// 래퍼(TDS)의 min-width가 auto라서 오히려 그 래퍼를 텍스트 전체 너비만큼 늘려
// 버려요(줄바꿈이 아예 불가능한 콘텐츠는 min-content 크기가 전체 너비가
// 되기 때문이에요). 그 대신 -webkit-line-clamp로 "1줄까지만 보여주고 넘치면
// 말줄임" 방식을 써요 — 줄바꿈 자체는 허용하기 때문에 조상 요소가 억지로
// 넓어지지 않아요. 맛집 메모 미리보기(2줄 클램프)와 같은 방식이에요.
const NAME_ELLIPSIS_STYLE: CSSProperties = {
  flex: "1 1 auto",
  minWidth: 0,
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  wordBreak: "break-all",
};

// 폼의 각 섹션(라벨 + 입력)이 공통으로 사용하는 안팎 여백과 카드 배경이에요.
// 여기서만 값을 바꾸면 모든 섹션의 여백이 동일하게 유지돼요.
const FORM_SECTION_PADDING = "20px 20px";
const FORM_CARD_BACKGROUND_COLOR = "#f9fafb";

const ALL_CATEGORY = "전체";
const FILTER_CATEGORIES = [ALL_CATEGORY, ...CATEGORIES] as const;

type SortOption = "latest" | "oldest" | "ratingDesc" | "ratingAsc" | "name";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
  { value: "ratingDesc", label: "별점 높은순" },
  { value: "ratingAsc", label: "별점 낮은순" },
  { value: "name", label: "이름순" },
];

interface QuickPickOption {
  emoji: string;
  label: string;
}

// label은 입력창 placeholder 예시 문장으로만 쓰이고, 아이콘을 눌렀을 때는
// emoji만 입력창에 채워져요.
const WEATHER_QUICK_OPTIONS: QuickPickOption[] = [
  { emoji: "☀️", label: "햇살이 유난히 따스했던 날" },
  { emoji: "☁️", label: "구름이 낮게 드리운 하루" },
  { emoji: "🌧️", label: "빗소리가 창밖을 두드리던 날" },
  { emoji: "❄️", label: "하얀 눈이 소복이 내려앉은 날" },
  { emoji: "🍂", label: "가을바람이 살랑하니 내 콧등을 간지럽혔다" },
  { emoji: "🌬️", label: "선선한 바람이 옷깃을 스치던 날" },
];

// 날씨 입력창 placeholder로 번갈아 보여줄 감성 문장 예시예요. 실제로 입력되지는 않아요.
const WEATHER_PLACEHOLDER_EXAMPLES = WEATHER_QUICK_OPTIONS.map(
  (option) => option.label,
);

// 날씨 입력창 위에 나열되는 아이콘 칩이에요. 눌렀을 때 보이는 이모지 그대로
// 입력창에 채워줘요.
function WeatherMoodIcons({ onSelect }: { onSelect: (emoji: string) => void }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        paddingBottom: "4px",
      }}
    >
      {WEATHER_QUICK_OPTIONS.map((option) => (
        <Button
          key={option.label}
          variant="weak"
          color="dark"
          onClick={() => onSelect(option.emoji)}
          style={{
            flexShrink: 0,
            width: "40px",
            height: "40px",
            minWidth: "40px",
            padding: 0,
            borderRadius: "20px",
            fontSize: "18px",
          }}
        >
          {option.emoji}
        </Button>
      ))}
    </div>
  );
}

const COMPANION_QUICK_OPTIONS: QuickPickOption[] = [
  { emoji: "👤", label: "혼자" },
  { emoji: "👥", label: "2명" },
  { emoji: "👨‍👩‍👧", label: "가족" },
  { emoji: "💑", label: "연인" },
  { emoji: "👥+", label: "여러명" },
];

// 텍스트 필드 위에 나열되는 빠른 선택 칩이에요. 눌러도 텍스트 필드 값을
// 채워줄 뿐이라, 그 뒤에 자유롭게 텍스트를 고쳐 쓸 수 있어요.
function QuickPickChips({
  options,
  onSelect,
}: {
  options: QuickPickOption[];
  onSelect: (label: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        paddingBottom: "4px",
      }}
    >
      {options.map((option) => (
        <Button
          key={option.label}
          size="small"
          variant="weak"
          color="dark"
          style={{ flexShrink: 0 }}
          onClick={() => onSelect(option.label)}
        >
          {option.emoji} {option.label}
        </Button>
      ))}
    </div>
  );
}

// 카테고리(음식 종류) 후보를 리스트로 보여주는 바텀시트 내용이에요. "맛집 기록" 탭의
// 음식 종류 필터와, 등록/수정 폼의 음식 종류 선택 바텀시트가 이 컴포넌트를 함께 써요.
function CategoryListSheetContent<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: readonly T[];
  selected: T;
  onSelect: (option: T) => void;
}) {
  return (
    <List>
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <div
            key={option}
            onClick={() => onSelect(option)}
            style={{ cursor: "pointer" }}
          >
            <ListRow
              withTouchEffect
              contents={
                <ListRow.Texts
                  type="1RowTypeA"
                  top={
                    <span style={{ fontWeight: isSelected ? 700 : 400 }}>
                      {option}
                    </span>
                  }
                />
              }
              right={isSelected ? "✓" : undefined}
            />
          </div>
        );
      })}
    </List>
  );
}

interface AddRestaurantFormValues {
  name: string;
  title: string;
  category: Category;
  menus: string[];
  companion: string;
  weather: string;
  neighborhood: string;
  memo: string;
  rating: number;
  visitDate: string;
  receiptImage?: string;
  photos: string[];
  photoArchiveKeys?: string[];
  isReservation: boolean;
  isSpecialDay: boolean;
}

// 음식/가게 사진은 최대 이만큼만 첨부할 수 있어요.
const MAX_PHOTOS = 4;

// 도감에 있는 이름만 모은 집합이에요. menus 배열 중 "도감에 없는" 이름(예전
// 자유 텍스트 태그)을 가려낼 때 써요.
const FOOD_DEX_NAME_SET = new Set(FOOD_DEX_MASTER.map((entry) => entry.name));

// 메뉴 태그를 "도감(FOOD_DEX_MASTER)"에서 골라 담는 바텀시트의 내용이에요.
// RestaurantForm 자신도 이미 useBottomSheet()로 연 바텀시트라(싱글턴이라
// 또 열면 이 폼이 그 내용으로 통째로 바뀌어요) 카테고리 선택 바텀시트와
// 같은 방법으로, <BottomSheet> 컴포넌트를 로컬 상태로 직접 다뤄서 폼 위에
// 겹쳐 뜨는 별개의 바텀시트로 만들어요.
//
// 선택 완료(onConfirm)는 "이 화면이 아는 도감 항목들"만 교체해요. 기존
// menus 배열에 도감에 없는 옛날 자유 텍스트 태그가 남아 있어도 그대로
// 보존돼요(RestaurantForm 쪽에서 병합).
function FoodDexPickerSheetContent({
  selectedNames,
  onConfirm,
}: {
  selectedNames: string[];
  onConfirm: (names: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [draftSelected, setDraftSelected] = useState<Set<string>>(
    () => new Set(selectedNames),
  );

  const groupedEntries = useMemo(() => {
    const trimmedQuery = query.trim();
    const filtered = trimmedQuery
      ? FOOD_DEX_MASTER.filter((entry) => entry.name.includes(trimmedQuery))
      : FOOD_DEX_MASTER;

    const groups = new Map<FoodDexCategory, FoodDexMasterEntry[]>();
    for (const entry of filtered) {
      const list = groups.get(entry.category) ?? [];
      list.push(entry);
      groups.set(entry.category, list);
    }
    return FOOD_DEX_CATEGORIES.map((category) => ({
      category,
      items: groups.get(category) ?? [],
    })).filter((group) => group.items.length > 0);
  }, [query]);

  const toggle = (name: string) => {
    setDraftSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "0 24px 16px",
      }}
    >
      <TextField
        variant="box"
        placeholder="메뉴 이름으로 검색"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {groupedEntries.length === 0 ? (
        <div
          style={{
            padding: "40px 0",
            textAlign: "center",
            fontSize: "14px",
            color: "#8b95a1",
          }}
        >
          검색 결과가 없어요.
        </div>
      ) : (
        groupedEntries.map((group) => (
          <div key={group.category}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#8b95a1",
                marginBottom: "2px",
              }}
            >
              {group.category}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {group.items.map((entry) => (
                <label
                  key={entry.name}
                  onClick={() => toggle(entry.name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 4px",
                    cursor: "pointer",
                  }}
                >
                  <Checkbox.Circle
                    checked={draftSelected.has(entry.name)}
                    onCheckedChange={() => toggle(entry.name)}
                    aria-label={entry.name}
                  />
                  <span style={{ fontSize: "15px", color: "#191f28" }}>
                    {entry.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))
      )}

      <Button
        display="block"
        variant="fill"
        style={PRIMARY_FILL_BUTTON_TEXT_STYLE}
        onClick={() => onConfirm(Array.from(draftSelected))}
      >
        {draftSelected.size > 0 ? `${draftSelected.size}개 담기` : "담기"}
      </Button>
    </div>
  );
}

// 바텀시트에 넘기는 children은 open() 호출 시점에 한 번 고정돼요.
// 그래서 입력 상태는 바깥 App이 아니라 이 컴포넌트 자신이 들고 있어야
// 타이핑/별점 선택마다 이 컴포넌트만 다시 렌더링되어 반영돼요.
// 새 맛집을 등록할 때와 기존 맛집을 수정할 때 모두 사용해요.
function RestaurantForm({
  initialValues,
  submitLabel = "기록하기",
  onSubmit,
  onCancel,
  onDirtyChange,
}: {
  initialValues?: AddRestaurantFormValues;
  submitLabel?: string;
  onSubmit: (values: AddRestaurantFormValues) => void;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [category, setCategory] = useState<Category>(
    initialValues?.category ?? CATEGORIES[0],
  );
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [menus, setMenus] = useState<string[]>(initialValues?.menus ?? []);
  const [isDexPickerOpen, setIsDexPickerOpen] = useState(false);
  const [companion, setCompanion] = useState(initialValues?.companion ?? "");
  const [weather, setWeather] = useState(initialValues?.weather ?? "");
  const [neighborhood, setNeighborhood] = useState(
    initialValues?.neighborhood ?? "",
  );
  const [memo, setMemo] = useState(initialValues?.memo ?? "");
  const [rating, setRating] = useState<Rating>(
    clampToHalfStepRating(initialValues?.rating ?? 5),
  );
  const [visitDate, setVisitDate] = useState(
    initialValues?.visitDate ?? todayDateInputValue(),
  );
  const [receiptImage, setReceiptImage] = useState(initialValues?.receiptImage);
  const [isReceiptProcessing, setIsReceiptProcessing] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<string[]>(initialValues?.photos ?? []);
  // photos와 같은 순서로, 각 사진의 고화질 원본이 lib/photoArchive.ts에
  // 저장된 키예요. 화면에는 안 쓰고 제출할 때만 함께 넘겨요.
  const [photoArchiveKeys, setPhotoArchiveKeys] = useState<string[]>(
    initialValues?.photoArchiveKeys ?? [],
  );
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const [isReservation, setIsReservation] = useState(
    initialValues?.isReservation ?? false,
  );
  const [isSpecialDay, setIsSpecialDay] = useState(
    initialValues?.isSpecialDay ?? false,
  );

  // 오버레이(딤) 클릭으로 폼 바텀시트를 닫을 때, 입력값이 있으면 한 번 더
  // 확인하기 위한 dirty 체크예요. 최초 렌더 시점의 값(=initialValues 또는
  // 빈 기본값)을 스냅샷으로 고정해두고, 현재 값과 비교해요. 등록/수정 폼
  // 둘 다 같은 컴포넌트라, "수정" 폼은 initialValues 자체가 이미 채워져
  // 있어서 그 값을 그대로 스냅샷으로 써야 "열자마자는 dirty 아님"이 맞아요.
  const initialSnapshotRef = useRef(
    JSON.stringify({
      name: initialValues?.name ?? "",
      title: initialValues?.title ?? "",
      category: initialValues?.category ?? CATEGORIES[0],
      menus: initialValues?.menus ?? [],
      companion: initialValues?.companion ?? "",
      weather: initialValues?.weather ?? "",
      neighborhood: initialValues?.neighborhood ?? "",
      memo: initialValues?.memo ?? "",
      rating: clampToHalfStepRating(initialValues?.rating ?? 5),
      visitDate: initialValues?.visitDate ?? todayDateInputValue(),
      receiptImage: initialValues?.receiptImage ?? null,
      photos: initialValues?.photos ?? [],
      isReservation: initialValues?.isReservation ?? false,
      isSpecialDay: initialValues?.isSpecialDay ?? false,
    }),
  );

  useEffect(() => {
    const currentSnapshot = JSON.stringify({
      name,
      title,
      category,
      menus,
      companion,
      weather,
      neighborhood,
      memo,
      rating,
      visitDate,
      receiptImage: receiptImage ?? null,
      photos,
      isReservation,
      isSpecialDay,
    });
    onDirtyChange?.(currentSnapshot !== initialSnapshotRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    name,
    title,
    category,
    menus,
    companion,
    weather,
    neighborhood,
    memo,
    rating,
    visitDate,
    receiptImage,
    photos,
    isReservation,
    isSpecialDay,
  ]);

  // 폼이 열릴 때 한 번만 예시 문장을 골라서, 타이핑 중에 placeholder가 바뀌지 않게 해요.
  const weatherPlaceholder = useMemo(() => {
    const example =
      WEATHER_PLACEHOLDER_EXAMPLES[
        Math.floor(Math.random() * WEATHER_PLACEHOLDER_EXAMPLES.length)
      ];
    return `예) ${example}`;
  }, []);

  const isPastVisit = visitDate < todayDateInputValue();
  const requiresReceipt = isPastVisit && !receiptImage;
  const hasNoMenu = menus.length === 0;

  const removeMenu = (index: number) => {
    setMenus((prev) => prev.filter((_, i) => i !== index));
  };

  // 도감 피커에서 "담기"를 누르면 호출돼요. 도감에 있는 이름들은 피커가 돌려준
  // 선택 결과로 완전히 교체하고(체크 해제하면 빠지도록), 도감에 없는 예전
  // 자유 텍스트 태그는 건드리지 않고 그대로 남겨둬요.
  const handleDexPickerConfirm = (selectedDexNames: string[]) => {
    setMenus((prev) => [
      ...prev.filter((menu) => !FOOD_DEX_NAME_SET.has(menu)),
      ...selectedDexNames,
    ]);
  };

  // 날씨 아이콘을 누르면 기존에 입력해 둔 텍스트는 지우지 않고, emoji만 맨 앞에
  // 붙여줘요. 여러 아이콘을 연달아 누르면 최신 선택이 계속 맨 앞으로 와요.
  const handleWeatherIconSelect = (emoji: string) => {
    setWeather((prev) => (prev ? `${emoji} ${prev}` : emoji));
  };

  // 원본 사진을 그대로 base64로 저장하면(특히 카메라 원본은 수 MB) 기기 Storage
  // 용량을 넘겨 saveRestaurants가 조용히 실패해서, 사진을 첨부해도 기록 자체가
  // 저장되지 않는 문제가 있었어요. ProfileView/TodayMealBoard와 동일하게
  // resizeImageFile로 줄여서 저장해요.
  const handleReceiptChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 연달아 선택해도 매번 onChange가 발생하도록 값을 비워둬요.
    event.target.value = "";
    if (!file) {
      return;
    }

    setIsReceiptProcessing(true);
    try {
      const resized = await resizeImageFile(file);
      setReceiptImage(resized);
    } catch (error) {
      console.error("영수증 사진을 처리하지 못했어요.", error);
    } finally {
      setIsReceiptProcessing(false);
    }
  };

  const handlePhotosChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 연달아 선택해도 매번 onChange가 발생하도록 값을 비워둬요.
    event.target.value = "";
    if (!file) {
      return;
    }

    setIsPhotoProcessing(true);
    try {
      const resized = await resizeImageFile(file);
      if (photos.length >= MAX_PHOTOS) {
        return;
      }
      setPhotos((prev) => [...prev, resized]);

      // 화면에 쓰는 리사이즈본과 별개로, 고화질 원본을 IndexedDB에 조용히
      // 보관해요. 실패해도(용량 초과 등) 기록 저장 자체는 막지 않으니 await
      // 하지 않고 백그라운드로 진행해요.
      const archiveKey = createPhotoArchiveKey();
      setPhotoArchiveKeys((prev) => [...prev, archiveKey]);
      void archivePhotoOriginal(archiveKey, file);
    } catch (error) {
      console.error("사진을 처리하지 못했어요.", error);
    } finally {
      setIsPhotoProcessing(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoArchiveKeys((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name.trim() || requiresReceipt || hasNoMenu) {
      return;
    }

    onSubmit({
      name: name.trim(),
      title: title.trim(),
      category,
      menus,
      companion: companion.trim(),
      weather: weather.trim(),
      neighborhood: neighborhood.trim(),
      memo: memo.trim(),
      rating,
      visitDate,
      receiptImage,
      photos,
      photoArchiveKeys,
      isReservation,
      isSpecialDay,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "0 24px 24px",
      }}
    >
      <div
        style={{
          backgroundColor: FORM_CARD_BACKGROUND_COLOR,
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: FORM_SECTION_PADDING }}>
          <div
            style={{
              marginBottom: "8px",
              color: "#6b7684",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            가게 이름
          </div>
          <TextField
            variant="box"
            placeholder="예) 우래옥"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Border />
        <div style={{ padding: FORM_SECTION_PADDING }}>
          <div
            style={{
              marginBottom: "8px",
              color: "#6b7684",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            제목 (선택)
          </div>
          <TextField
            variant="box"
            placeholder="예) 과천 데이트"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <Border />
        <div style={{ padding: FORM_SECTION_PADDING }}>
          <div
            style={{
              marginBottom: "8px",
              color: "#6b7684",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            방문일
          </div>
          <input
            type="date"
            value={visitDate}
            max={todayDateInputValue()}
            onChange={(e) => setVisitDate(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#f2f4f6",
              fontSize: "16px",
              fontFamily: "inherit",
              color: "#191f28",
            }}
          />
        </div>
        <Border />
        <div style={{ padding: FORM_SECTION_PADDING }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "15px",
                color: "#191f28",
                fontWeight: 500,
              }}
            >
              <Clock size={16} color="#6b7684" />
              예약하고 갔어요
            </span>
            <input
              type="checkbox"
              checked={isReservation}
              onChange={(e) => setIsReservation(e.target.checked)}
              style={{ width: "22px", height: "22px" }}
            />
          </label>
        </div>
        <Border />
        <div style={{ padding: FORM_SECTION_PADDING }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "15px",
                color: "#191f28",
                fontWeight: 500,
              }}
            >
              <Star size={16} color={THEME_YELLOW} fill={THEME_YELLOW} />
              특별한 날이었어요
            </span>
            <input
              type="checkbox"
              checked={isSpecialDay}
              onChange={(e) => setIsSpecialDay(e.target.checked)}
              style={{ width: "22px", height: "22px" }}
            />
          </label>
        </div>
        <Border />
        <div style={{ padding: FORM_SECTION_PADDING }}>
          <div
            style={{
              marginBottom: "8px",
              color: "#6b7684",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            영수증 사진{isPastVisit ? " (필수)" : " (선택)"}
          </div>
          <input
            ref={receiptInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleReceiptChange}
          />
          {receiptImage ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Asset.Image
                src={receiptImage}
                alt="영수증 사진"
                scaleType="crop"
                frameShape={{ width: 64, height: 64, radius: 12 }}
              />
              <Button
                size="small"
                variant="weak"
                color="dark"
                disabled={isReceiptProcessing}
                onClick={() => receiptInputRef.current?.click()}
              >
                {isReceiptProcessing ? "처리 중..." : "다시 선택"}
              </Button>
              <Button
                size="small"
                variant="weak"
                color="danger"
                onClick={() => setReceiptImage(undefined)}
              >
                삭제
              </Button>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="weak"
                color="dark"
                disabled={isReceiptProcessing}
                onClick={() => receiptInputRef.current?.click()}
              >
                {isReceiptProcessing ? "처리 중..." : "📷 영수증 사진 첨부"}
              </Button>
            </div>
          )}
          {requiresReceipt && (
            <div
              style={{ marginTop: "8px", color: "#f04452", fontSize: "13px" }}
            >
              과거 날짜로 기록하려면 영수증 사진을 첨부해야 해요.
            </div>
          )}
        </div>
        <Border />
        <div style={{ padding: FORM_SECTION_PADDING }}>
          <div
            style={{
              marginBottom: "8px",
              color: "#6b7684",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            음식/가게 사진 (선택)
          </div>
          <input
            ref={photosInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotosChange}
          />
          {photos.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              {photos.map((photo, index) => (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    width: "64px",
                    height: "64px",
                  }}
                >
                  <Asset.Image
                    src={photo}
                    alt={`음식/가게 사진 ${index + 1}`}
                    scaleType="crop"
                    frameShape={{ width: 64, height: 64, radius: 12 }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    aria-label={`음식/가게 사진 ${index + 1} 삭제`}
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "10px",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(25, 31, 40, 0.7)",
                      color: "#ffffff",
                      fontSize: "12px",
                      lineHeight: 1,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {photos.length < MAX_PHOTOS && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="weak"
                color="dark"
                disabled={isPhotoProcessing}
                onClick={() => photosInputRef.current?.click()}
              >
                {isPhotoProcessing ? "처리 중..." : "📷 음식/가게 사진 추가"}
              </Button>
            </div>
          )}
        </div>
        <Border />
        <div style={{ padding: FORM_SECTION_PADDING }}>
          <div
            style={{
              marginBottom: "8px",
              color: "#6b7684",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            음식 종류
          </div>
          <button
            type="button"
            onClick={() => setIsCategorySheetOpen(true)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#f2f4f6",
              fontSize: "16px",
              fontFamily: "inherit",
              color: "#191f28",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span>{category}</span>
            <span style={{ color: "#8b95a1" }}>▾</span>
          </button>
        </div>
        <Border />
        <div style={{ padding: FORM_SECTION_PADDING }}>
          <div
            style={{
              marginBottom: "8px",
              color: "#6b7684",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            먹은 메뉴
          </div>
          <Button
            display="block"
            size="large"
            variant="weak"
            color="dark"
            onClick={() => setIsDexPickerOpen(true)}
          >
            📖 도감에서 담기
          </Button>
          {menus.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "12px",
              }}
            >
              {menus.map((menu, index) => (
                <div
                  key={`${menu}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {/* 상세보기(RestaurantDetailView)의 메뉴 태그 칩과 같은 스타일로
                      맞춰서, 등록 폼에서 붙인 태그가 상세보기에서도 똑같은
                      모양으로 보이도록 했어요. */}
                  <Badge size="small" variant="weak" color="elephant">
                    #{menu}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => removeMenu(index)}
                    aria-label={`${menu} 삭제`}
                    style={{
                      border: "none",
                      background: "none",
                      padding: "2px",
                      cursor: "pointer",
                      color: "#8b95a1",
                      fontSize: "14px",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {hasNoMenu && (
            <div
              style={{ marginTop: "8px", color: "#f04452", fontSize: "13px" }}
            >
              메뉴를 1개 이상 등록해야 저장할 수 있어요.
            </div>
          )}
        </div>
        <Border />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: FORM_SECTION_PADDING,
          }}
        >
          <div
            style={{ color: "#6b7684", fontSize: "14px", textAlign: "center" }}
          >
            같이 간 사람
          </div>
          <QuickPickChips
            options={COMPANION_QUICK_OPTIONS}
            onSelect={setCompanion}
          />
          <TextField
            variant="box"
            placeholder="예) 민수, 지영"
            value={companion}
            onChange={(e) => setCompanion(e.target.value)}
          />
        </div>
        <Border />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: FORM_SECTION_PADDING,
          }}
        >
          <div
            style={{ color: "#6b7684", fontSize: "14px", textAlign: "center" }}
          >
            동네 (선택)
          </div>
          <RegionPicker value={neighborhood} onChange={setNeighborhood} />
        </div>
        <Border />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            padding: FORM_SECTION_PADDING,
          }}
        >
          <div
            style={{ color: "#6b7684", fontSize: "14px", textAlign: "center" }}
          >
            날씨
          </div>
          <WeatherMoodIcons onSelect={handleWeatherIconSelect} />
          <TextField
            variant="box"
            placeholder={weatherPlaceholder}
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
          />
        </div>
        <Border />
        <div style={{ padding: FORM_SECTION_PADDING }}>
          <div
            style={{
              marginBottom: "8px",
              color: "#6b7684",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            이 곳에서의 기억
          </div>
          <TextArea
            variant="box"
            placeholder="오늘 이 곳에서의 기억을 자유롭게 남겨보세요"
            minHeight={96}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            style={HANDWRITING_TEXT_STYLE}
          />
        </div>
        <Border />
        <div style={{ padding: FORM_SECTION_PADDING }}>
          <div
            style={{
              marginBottom: "8px",
              color: "#6b7684",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            별점
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <RatingStarsInput value={rating} onChange={setRating} size={32} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <Button
          style={{ flex: 1 }}
          variant="weak"
          color="dark"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button
          style={{ flex: 1, ...PRIMARY_FILL_BUTTON_TEXT_STYLE }}
          variant="fill"
          disabled={requiresReceipt || hasNoMenu}
          onClick={handleSubmit}
        >
          {submitLabel}
        </Button>
      </div>

      {/* 이 폼 자체가 이미 useBottomSheet()로 열린 바텀시트의 children이라, 같은
          훅으로 카테고리 바텀시트를 또 열면(싱글턴이라) 이 폼이 그 내용으로
          통째로 바뀌어버려요. 그래서 RegionPicker처럼 별도 오버레이를 직접
          로컬 상태로 다뤄요. useBottomSheet 대신 BottomSheet 컴포넌트를 직접
          써서, 폼 위에 겹쳐 뜨는 별개의 바텀시트로 만들어요. */}
      <BottomSheet
        open={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
        header={
          <SheetHeader
            title="음식 종류 선택"
            onClose={() => setIsCategorySheetOpen(false)}
          />
        }
      >
        <CategoryListSheetContent
          options={CATEGORIES}
          selected={category}
          onSelect={(value) => {
            setCategory(value);
            setIsCategorySheetOpen(false);
          }}
        />
      </BottomSheet>

      <BottomSheet
        open={isDexPickerOpen}
        onClose={() => setIsDexPickerOpen(false)}
        header={
          <SheetHeader
            title="도감에서 담기"
            onClose={() => setIsDexPickerOpen(false)}
          />
        }
      >
        {/* key로 열 때마다 새로 마운트해서, 지난번 검색어/체크 상태가 남지
            않고 매번 현재 menus 기준으로 다시 시작하게 해요. */}
        <FoodDexPickerSheetContent
          key={String(isDexPickerOpen)}
          selectedNames={menus}
          onConfirm={(names) => {
            handleDexPickerConfirm(names);
            setIsDexPickerOpen(false);
          }}
        />
      </BottomSheet>
    </div>
  );
}

// 앱 최초 실행 시 닉네임이 없는 사용자에게 한 번 띄우는 간단한 입력 폼이에요.
function NicknameForm({
  onSubmit,
  onDirtyChange,
}: {
  onSubmit: (nickname: string) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}) {
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    onDirtyChange?.(nickname.trim().length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nickname]);

  const handleSubmit = () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "0 24px 24px",
      }}
    >
      <TextField
        variant="box"
        placeholder="예) 맛있는하마"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <Button
        display="block"
        variant="fill"
        style={PRIMARY_FILL_BUTTON_TEXT_STYLE}
        disabled={!nickname.trim()}
        onClick={handleSubmit}
      >
        시작하기
      </Button>
    </div>
  );
}

// "맛있는 하루" 헤더의 영문 월 이름이에요. 원래는 PNG 배너였는데, 매달 자동으로
// 바뀌도록 순수 코드(SVG+텍스트)로 재구현했어요.
const MONTH_NAMES_EN = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;

function getCurrentMonthLabel(): string {
  return MONTH_NAMES_EN[new Date().getMonth()];
}

// 살짝 찢어진 종이 태그 모양 배경이에요. viewBox 기준 좌우 테두리에 지그재그
// 노치를 넣어 "손으로 찢은 라벨" 느낌을 내요. 월 이름 길이(MAY vs SEPTEMBER)에
// 따라 태그 너비가 달라져도 자연스럽도록 preserveAspectRatio="none"으로 채워요.
function TornPaperTag({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        viewBox="0 0 200 90"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          filter: "drop-shadow(0 2px 3px rgba(24, 35, 56, 0.18))",
        }}
        aria-hidden="true"
      >
        <path
          d="M4 0 L196 0 L192 8 L200 16 L193 26 L200 36 L191 46 L200 56 L194 66 L200 76 L190 84 L196 90 L4 90 L10 82 L2 74 L9 64 L1 54 L8 44 L0 34 L7 24 L1 14 L6 6 Z"
          fill={WARM_PAPER}
        />
      </svg>
      <div style={{ position: "relative", padding: "10px 22px" }}>
        {children}
      </div>
    </div>
  );
}

// 상단 탭바에 실제로 노출되는 4개 탭이에요. 맛집 도감(FOOD_DEX_TAB_INDEX)은
// 더 이상 탭이 아니라 홈 화면의 메뉴 리스트를 통해서만 들어가는 화면이라
// 이 배열에는 없지만, selectedTab 값 자체는 그대로 4를 가질 수 있어요.
const MAIN_TABS = ["홈", "맛있는 하루", "오늘의 한 입", "다가올 한 입"] as const;

const HOME_TAB_INDEX = 0;
const RESTAURANT_TAB_INDEX = 1;
const TODAY_MEAL_TAB_INDEX = 2;
const CALENDAR_TAB_INDEX = 3;
const FOOD_DEX_TAB_INDEX = 4;

// "맛있는 하루" 탭 검색창 placeholder예요. 탭에 들어갈 때마다 랜덤으로 하나
// 골라서 보여줘요(하루 고정 같은 건 필요 없어요).
const RESTAURANT_SEARCH_PLACEHOLDERS = [
  "어떤 맛집을 찾아볼까요?",
  "다녀온 곳을 검색해보세요",
] as const;

// 인트로를 봤는지는 세션에 저장해요. 완전히 종료했다가 다시 켤 때는 새 세션이라
// 다시 보여주지만, 같은 세션 안에서(예: 미니앱이 백그라운드→포그라운드) 반복해서
// 보이지 않도록 해요.
const SPLASH_SESSION_STORAGE_KEY = "kioku:introShown";

function hasSeenSplashThisSession(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_SESSION_STORAGE_KEY) === "true";
  } catch {
    // sessionStorage를 사용할 수 없는 환경이면 매번 인트로를 보여줘요.
    return false;
  }
}

// 온보딩 슬라이드는 세션이 아니라 "최초 1회"만 봐야 해서, 세션이 끝나도
// 유지되는 localStorage에 저장해요(위 SPLASH_SESSION_STORAGE_KEY는 세션마다
// 다시 보여줘야 해서 sessionStorage를 쓰는 것과 대비돼요).
const ONBOARDING_SEEN_STORAGE_KEY = "kioku:onboardingSeen";

function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_SEEN_STORAGE_KEY) === "true";
  } catch {
    // localStorage를 사용할 수 없는 환경이면 매번 온보딩을 보여줘요.
    return false;
  }
}

function markOnboardingSeen(): void {
  try {
    localStorage.setItem(ONBOARDING_SEEN_STORAGE_KEY, "true");
  } catch {
    // ignore
  }
}

function App() {
  const [showSplash, setShowSplash] = useState(
    () => !hasSeenSplashThisSession(),
  );
  const [showOnboarding, setShowOnboarding] = useState(
    () => !hasSeenOnboarding(),
  );
  const [selectedTab, setSelectedTab] = useState(HOME_TAB_INDEX);
  const [nickname, setNickname] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [homeNeighborhood, setHomeNeighborhood] = useState<string | null>(null);
  const [userHash, setUserHash] = useState<string | null>(null);
  // 닉네임이 없는 사용자라는 걸 확인해도, 온보딩 슬라이드가 떠 있는 동안에는
  // 바로 닉네임 바텀시트를 열지 않고 여기 잠깐 담아둬요. 두 오버레이가 동시에
  // 뜨면(닉네임 시트의 다이얼로그가 온보딩 위에서 클릭을 가로채는 문제가 있어서)
  // 온보딩부터 다 보여준 뒤에 이어서 열어요.
  const [pendingNicknameUserHash, setPendingNicknameUserHash] = useState<
    string | null
  >(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [plannedVisits, setPlannedVisits] = useState<PlannedVisit[]>([]);
  const [isPlannedVisitsLoaded, setIsPlannedVisitsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantSearchPlaceholder, setRestaurantSearchPlaceholder] =
    useState(() => pickRandomItem(RESTAURANT_SEARCH_PLACEHOLDERS));
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof FILTER_CATEGORIES)[number]>(ALL_CATEGORY);
  // null이면 "전체"예요. 필터는 시/도만 고르거나(시/군/구 없는 세종특별자치시 등),
  // 시/도+시/군/구까지 고른 상태 두 가지가 있어요.
  const [filterProvince, setFilterProvince] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [specialDayOnly, setSpecialDayOnly] = useState(false);

  const { open, close } = useBottomSheet();
  const { openConfirm } = useDialog();

  // 폼이 있는 바텀시트(닉네임/프로필/맛집 등록·수정)가 열려있는 동안, 그 폼에
  // 입력값이 있는지를 추적해요. ref를 쓰는 이유는 onDimmerClick 콜백이
  // open()을 호출하는 시점에 한 번만 만들어지는데, 그 안에서 항상 "지금 이
  // 순간"의 최신 dirty 상태를 읽어야 하기 때문이에요(state였다면 클로저가
  // open() 호출 시점의 값에 고정돼요). useBottomSheet는 싱글턴이라 한 번에
  // 폼 시트 하나만 열려있으니, 앱 전체에서 이 ref 하나만 공유해도 안전해요.
  const isFormDirtyRef = useRef(false);

  // 폼이 있는 바텀시트의 배경(딤) 영역을 클릭했을 때 호출해요. 입력값이
  // 하나도 없으면 바로 닫고, 입력값이 있으면 "정말 닫을까요?" 확인을 한 번
  // 거쳐요.
  const handleGuardedDimmerClick = async () => {
    if (!isFormDirtyRef.current) {
      close();
      return;
    }
    const confirmed = await openConfirm({
      title: "작성 중인 내용이 있어요",
      description: "지금 닫으면 입력한 내용이 사라져요. 닫으시겠어요?",
      confirmButton: "닫기",
      cancelButton: "계속 작성",
      closeOnDimmerClick: true,
    });
    if (confirmed) {
      close();
    }
  };

  // 기록에 실제로 등장한 동네들 중, 전국 시/도-시/군/구에 매칭되는 것만 추려서
  // 필터 옵션(시/도 -> 시/군/구 목록)을 만들어요. 예전에 자유 텍스트로 저장된 값도
  // matchesRegion의 느슨한 매칭 덕분에 이 목록에 포함돼요.
  const regionFilterOptions = useMemo(
    () => buildRegionFilterOptions(restaurants.map((r) => r.neighborhood)),
    [restaurants],
  );

  // 최신/오래된순은 사용자가 고른 방문일(visitDate) 기준이고, 방문일이 같으면
  // 등록 시각(id, Date.now() 기반)을 기준으로 순서를 정해요.
  const visibleRestaurants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = restaurants.filter((restaurant) => {
      const matchesCategory =
        selectedCategory === ALL_CATEGORY ||
        restaurant.category === selectedCategory;
      const matchesNeighborhood =
        !filterProvince ||
        matchesRegion(
          restaurant.neighborhood,
          filterProvince,
          filterDistrict ?? "",
        );
      const matchesQuery =
        query.length === 0 || restaurant.name.toLowerCase().includes(query);
      const matchesSpecialDay = !specialDayOnly || restaurant.isSpecialDay;
      return (
        matchesCategory &&
        matchesNeighborhood &&
        matchesQuery &&
        matchesSpecialDay
      );
    });

    const sorted = [...filtered];
    switch (sortOption) {
      case "latest":
        sorted.sort(
          (a, b) =>
            b.visitDate.localeCompare(a.visitDate) ||
            Number(b.id) - Number(a.id),
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) =>
            a.visitDate.localeCompare(b.visitDate) ||
            Number(a.id) - Number(b.id),
        );
        break;
      case "ratingDesc":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "ratingAsc":
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
        break;
    }
    return sorted;
  }, [
    restaurants,
    selectedCategory,
    filterProvince,
    filterDistrict,
    searchQuery,
    sortOption,
    specialDayOnly,
  ]);

  // 기기에 저장된 기록을 앱 시작 시 한 번 불러와요.
  useEffect(() => {
    let isMounted = true;

    loadRestaurants().then((loaded) => {
      if (!isMounted) {
        return;
      }
      setRestaurants(loaded);
      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // 기록이 바뀔 때마다 기기에 저장해요. 초기 로딩이 끝나기 전에는
  // 빈 배열로 덮어쓰지 않도록 isLoaded를 확인해요.
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    saveRestaurants(restaurants);
  }, [restaurants, isLoaded]);

  // "맛있는 하루" 탭에 들어갈 때마다 검색창 placeholder를 새로 랜덤하게 골라요.
  useEffect(() => {
    if (selectedTab === RESTAURANT_TAB_INDEX) {
      setRestaurantSearchPlaceholder(
        pickRandomItem(RESTAURANT_SEARCH_PLACEHOLDERS),
      );
    }
  }, [selectedTab]);

  // 방문 예정도 맛집 기록과 똑같이 기기 저장이에요(restaurants와 같은 패턴).
  useEffect(() => {
    let isMounted = true;

    loadPlannedVisits().then((loaded) => {
      if (!isMounted) {
        return;
      }
      setPlannedVisits(loaded);
      setIsPlannedVisitsLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isPlannedVisitsLoaded) {
      return;
    }
    savePlannedVisits(plannedVisits);
  }, [plannedVisits, isPlannedVisitsLoaded]);

  // 앱 최초 실행 시 사용자 식별 해시로 Supabase profiles 테이블에 닉네임이
  // 등록되어 있는지 확인해요. 없으면 닉네임 입력 바텀시트를 한 번 띄우고,
  // 이미 있으면 바텀시트 없이 그대로 홈 화면을 사용할 수 있어요.
  useEffect(() => {
    let isMounted = true;

    (async () => {
      const userHash = await getUserIdentityHash();
      const profile = await fetchProfile(userHash);

      if (!isMounted) {
        return;
      }

      setUserHash(userHash);

      if (!profile?.nickname) {
        setPendingNicknameUserHash(userHash);
      } else {
        setNickname(profile.nickname);
        setProfileImage(profile.profile_image);
        setHomeNeighborhood(profile.neighborhood);
      }

      const unreadCount = await countUnreadNotifications(userHash);
      if (isMounted) {
        setHasUnreadNotifications(unreadCount > 0);
      }
    })();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 스플래시/온보딩이 모두 끝난 뒤에야 닉네임 바텀시트를 열어요.
  useEffect(() => {
    if (showSplash || showOnboarding || !pendingNicknameUserHash) {
      return;
    }
    openNicknameSheet(pendingNicknameUserHash);
    setPendingNicknameUserHash(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSplash, showOnboarding, pendingNicknameUserHash]);

  const openNicknameSheet = (userHash: string) => {
    open({
      header: <SheetHeader title="닉네임을 알려주세요" onClose={close} />,
      onDimmerClick: handleGuardedDimmerClick,
      children: (
        <NicknameForm
          onDirtyChange={(dirty) => {
            isFormDirtyRef.current = dirty;
          }}
          onSubmit={async (nickname) => {
            await saveProfile(userHash, nickname);
            setNickname(nickname);
            close();
          }}
        />
      ),
    });
  };

  const openNotificationsSheet = () => {
    open({
      header: <SheetHeader title="알림" onClose={close} />,
      onDimmerClick: close,
      children: (
        <NotificationsSheetContent
          userHash={userHash}
          onRead={() => setHasUnreadNotifications(false)}
        />
      ),
    });
  };

  const openProfileSheet = () => {
    open({
      header: <SheetHeader title="내 프로필" onClose={close} />,
      onDimmerClick: handleGuardedDimmerClick,
      children: (
        <ProfileView
          userHash={userHash}
          nickname={nickname ?? ""}
          profileImage={profileImage}
          neighborhood={homeNeighborhood}
          restaurantCount={restaurants.length}
          restaurants={restaurants}
          onDirtyChange={(dirty) => {
            isFormDirtyRef.current = dirty;
          }}
          onSaved={(nextNickname, nextProfileImage, nextNeighborhood) => {
            setNickname(nextNickname);
            setProfileImage(nextProfileImage);
            setHomeNeighborhood(nextNeighborhood);
          }}
          onClose={close}
        />
      ),
    });
  };

  // 시/도 배지를 누르면 그 지역 필터를 걸어서 "맛있는 하루" 탭으로 보내요.
  // 시/군/구까지는 좁히지 않고 시/도 전체로만 걸어요(지도가 딱 그 정도 해상도예요).
  const openMapSheet = () => {
    open({
      header: <SheetHeader title="지역별 기록" onClose={close} />,
      onDimmerClick: close,
      children: (
        <MapView
          restaurants={restaurants}
          onSelectProvince={(province) => {
            setFilterProvince(province);
            setFilterDistrict(null);
            setSelectedTab(RESTAURANT_TAB_INDEX);
            close();
          }}
        />
      ),
    });
  };

  const handleDelete = async (restaurant: Restaurant) => {
    const confirmed = await openConfirm({
      title: `${restaurant.name}을(를) 삭제할까요?`,
      description: "삭제한 기록은 다시 되돌릴 수 없어요.",
      confirmButton: "삭제",
      cancelButton: "취소",
      closeOnDimmerClick: true,
    });

    if (!confirmed) {
      return;
    }

    setRestaurants((prev) => prev.filter((item) => item.id !== restaurant.id));
  };

  const openAddSheet = () => {
    open({
      header: <SheetHeader title="오늘의 식사" onClose={close} />,
      onDimmerClick: handleGuardedDimmerClick,
      children: (
        <RestaurantForm
          submitLabel="기록하기"
          onCancel={close}
          onDirtyChange={(dirty) => {
            isFormDirtyRef.current = dirty;
          }}
          onSubmit={(values) => {
            setRestaurants((prev) => [
              {
                id: `${Date.now()}`,
                ...values,
              },
              ...prev,
            ]);
            close();
          }}
        />
      ),
    });
  };

  const handleAddPlannedVisit = (values: PlannedVisitFormValues) => {
    setPlannedVisits((prev) => [...prev, { id: `${Date.now()}`, ...values }]);
  };

  const handleUpdatePlannedVisit = (
    id: string,
    values: PlannedVisitFormValues,
  ) => {
    setPlannedVisits((prev) =>
      prev.map((item) => (item.id === id ? { id, ...values } : item)),
    );
  };

  const handleDeletePlannedVisit = (id: string) => {
    setPlannedVisits((prev) => prev.filter((item) => item.id !== id));
  };

  // 방문 예정에서 "다녀왔어요"를 누르면, 그 예정 정보(가게 이름/메모/방문
  // 예정일 → 실제 방문일)로 미리 채운 맛집 기록 폼을 열어요. 등록을 마치면
  // 새 맛집 기록을 추가하고 원래 방문 예정은 목록에서 제거해요. 맛집 기록 탭에서
  // 결과를 바로 볼 수 있도록 탭도 함께 옮겨요.
  const openAddSheetFromPlannedVisit = (visit: PlannedVisit) => {
    open({
      header: <SheetHeader title="오늘의 식사" onClose={close} />,
      onDimmerClick: handleGuardedDimmerClick,
      children: (
        <RestaurantForm
          submitLabel="기록하기"
          initialValues={{
            name: visit.name,
            title: "",
            category: CATEGORIES[0],
            menus: [],
            companion: "",
            weather: "",
            neighborhood: "",
            memo: visit.memo,
            rating: 5,
            visitDate: visit.visitDate,
            photos: [],
            isReservation: false,
            isSpecialDay: false,
          }}
          onCancel={close}
          onDirtyChange={(dirty) => {
            isFormDirtyRef.current = dirty;
          }}
          onSubmit={(values) => {
            setRestaurants((prev) => [
              {
                id: `${Date.now()}`,
                ...values,
              },
              ...prev,
            ]);
            setPlannedVisits((prev) =>
              prev.filter((item) => item.id !== visit.id),
            );
            setSelectedTab(RESTAURANT_TAB_INDEX);
            close();
          }}
        />
      ),
    });
  };

  const openCategoryFilterSheet = () => {
    open({
      header: <SheetHeader title="음식 종류 선택" onClose={close} />,
      onDimmerClick: close,
      children: (
        <CategoryListSheetContent
          options={FILTER_CATEGORIES}
          selected={selectedCategory}
          onSelect={(category) => {
            setSelectedCategory(category);
            close();
          }}
        />
      ),
    });
  };

  const openSortSheet = () => {
    open({
      header: <SheetHeader title="정렬 기준 선택" onClose={close} />,
      onDimmerClick: close,
      children: (
        <>
          <List>
            {SORT_OPTIONS.map((option) => {
              const isSelected = option.value === sortOption;
              return (
                <div
                  key={option.value}
                  onClick={() => {
                    setSortOption(option.value);
                    close();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <ListRow
                    withTouchEffect
                    contents={
                      <ListRow.Texts
                        type="1RowTypeA"
                        top={
                          <span style={{ fontWeight: isSelected ? 700 : 400 }}>
                            {option.label}
                          </span>
                        }
                      />
                    }
                    right={isSelected ? "✓" : undefined}
                  />
                </div>
              );
            })}
          </List>
        </>
      ),
    });
  };

  const openNeighborhoodFilterSheet = () => {
    open({
      header: <SheetHeader title="동네 선택" onClose={close} />,
      onDimmerClick: close,
      children: (
        <RegionFilterSheetContent
          regionOptions={regionFilterOptions}
          selectedProvince={filterProvince}
          selectedDistrict={filterDistrict}
          onSelect={(province, district) => {
            setFilterProvince(province);
            setFilterDistrict(district);
            close();
          }}
        />
      ),
    });
  };

  const openEditSheet = (restaurant: Restaurant) => {
    open({
      header: <SheetHeader title="맛집 수정하기" onClose={close} />,
      onDimmerClick: handleGuardedDimmerClick,
      children: (
        <RestaurantForm
          initialValues={{
            name: restaurant.name,
            title: restaurant.title,
            category: restaurant.category,
            menus: restaurant.menus,
            companion: restaurant.companion,
            weather: restaurant.weather,
            neighborhood: restaurant.neighborhood,
            memo: restaurant.memo,
            rating: restaurant.rating,
            visitDate: restaurant.visitDate,
            receiptImage: restaurant.receiptImage,
            photos: restaurant.photos ?? [],
            photoArchiveKeys: restaurant.photoArchiveKeys ?? [],
            isReservation: restaurant.isReservation,
            isSpecialDay: restaurant.isSpecialDay,
          }}
          submitLabel="수정하기"
          onCancel={close}
          onDirtyChange={(dirty) => {
            isFormDirtyRef.current = dirty;
          }}
          onSubmit={(values) => {
            setRestaurants((prev) =>
              prev.map((item) =>
                item.id === restaurant.id ? { ...item, ...values } : item,
              ),
            );
            close();
          }}
        />
      ),
    });
  };

  // 목록/홈에서 항목을 클릭하면 우선 이 읽기 전용 상세보기를 열어요.
  // 여기서 "수정하기"를 눌러야만 기존 수정 폼(openEditSheet)으로 넘어가요.
  const openDetailSheet = (restaurant: Restaurant) => {
    open({
      header: (
        <SheetHeader
          title={`${formatFullKoreanDate(restaurant.visitDate)}의 기록`}
          onClose={close}
        />
      ),
      onDimmerClick: close,
      children: (
        <RestaurantDetailView
          restaurant={restaurant}
          onEdit={() => {
            close();
            openEditSheet(restaurant);
          }}
          onSelectTag={(tag) => openTagSheet(tag)}
        />
      ),
    });
  };

  // 상세보기에서 메뉴 태그 칩을 탭하면 열리는 "태그 모아보기"예요. 검색과는
  // 별개 진입점이라, 상세보기 → 태그 모아보기 → (다시) 상세보기로만 이어져요.
  const openTagSheet = (tag: string) => {
    open({
      header: <SheetHeader title={`#${tag}`} onClose={close} />,
      onDimmerClick: close,
      children: (
        <TagRestaurantsSheetContent
          tag={tag}
          restaurants={restaurants}
          onSelectRestaurant={(selected) => {
            close();
            openDetailSheet(selected);
          }}
        />
      ),
    });
  };

  const handleSplashFinish = () => {
    try {
      sessionStorage.setItem(SPLASH_SESSION_STORAGE_KEY, "true");
    } catch {
      // sessionStorage를 사용할 수 없는 환경이면 그냥 넘어가요.
    }
    setShowSplash(false);
  };

  const handleOnboardingFinish = () => {
    markOnboardingSeen();
    setShowOnboarding(false);
  };

  const openSearchSheet = () => {
    open({
      header: <SheetHeader title="검색" onClose={close} />,
      onDimmerClick: close,
      children: (
        <RestaurantSearchSheetContent
          restaurants={restaurants}
          onSelectRestaurant={(restaurant) => {
            close();
            setSelectedTab(RESTAURANT_TAB_INDEX);
            openDetailSheet(restaurant);
          }}
        />
      ),
    });
  };

  return (
    <>
      {/* 다른 화면들이 뒤에서 준비되는 동안 잠깐 덮어서 보여주는 인트로예요.
          사라지고 나면 이미 로드된 홈 화면이 바로 보여요. */}
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      {/* 스플래시가 끝난 뒤, 최초 1회만(localStorage 플래그) 보여주는 온보딩
          소개 슬라이드예요. 닉네임 입력 바텀시트는 이미 별도 useEffect에서
          열려 있을 수 있지만, 이 오버레이가 z-index로 그 위를 덮고 있다가
          "시작하기"/"건너뛰기"로 닫히면 자연스럽게 그 아래 있던 화면이 드러나요. */}
      {!showSplash && showOnboarding && (
        <OnboardingSlides onFinish={handleOnboardingFinish} />
      )}

      {/* 탭을 전환해도 항상 보이는 전역 상단바예요. 스크롤해도 화면 위에 고정돼요. */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#ffffff",
        }}
      >
        <Top
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <BrandMarkIcon size={22} />
              <Top.TitleParagraph size={22}>이게맛다</Top.TitleParagraph>
            </div>
          }
          right={
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <ProfileIconButton
                profileImage={profileImage}
                onClick={openProfileSheet}
              />
              <NotificationBellButton
                hasUnread={hasUnreadNotifications}
                onClick={openNotificationsSheet}
              />
            </div>
          }
          subtitleBottom={
            <Top.SubtitleParagraph size={17}>
              {selectedTab === HOME_TAB_INDEX
                ? "오늘도 맛있는 하루 보내세요."
                : selectedTab === RESTAURANT_TAB_INDEX
                  ? restaurants.length > 0
                    ? `지금까지 ${restaurants.length}곳의 맛집을 기록했어요.`
                    : "다녀온 맛집을 기록하고 모아보세요."
                  : selectedTab === CALENDAR_TAB_INDEX
                    ? "다음 맛집 방문을 미리 계획해보세요."
                    : selectedTab === FOOD_DEX_TAB_INDEX
                      ? "먹어본 메뉴를 하나씩 채워보세요."
                      : "오늘 먹은 메뉴를 자유롭게 나눠보세요."}
            </Top.SubtitleParagraph>
          }
        />
      </div>

      <div className="kioku-main-tabs" style={{ padding: "0 4px 16px" }}>
        <Tab
          size="small"
          onChange={(index) => setSelectedTab(index)}
        >
          {MAIN_TABS.map((label, index) => (
            <Tab.Item key={label} selected={selectedTab === index}>
              {label}
            </Tab.Item>
          ))}
        </Tab>
      </div>

      {selectedTab === HOME_TAB_INDEX ? (
        <HomeScreen
          nickname={nickname}
          restaurants={restaurants}
          isRestaurantsLoaded={isLoaded}
          plannedVisits={plannedVisits}
          isPlannedVisitsLoaded={isPlannedVisitsLoaded}
          onWriteRestaurant={() => {
            setSelectedTab(RESTAURANT_TAB_INDEX);
            openAddSheet();
          }}
          onSelectRestaurant={(restaurant) => {
            setSelectedTab(RESTAURANT_TAB_INDEX);
            openDetailSheet(restaurant);
          }}
          onViewTodayMeal={() => setSelectedTab(TODAY_MEAL_TAB_INDEX)}
          onViewCalendar={() => setSelectedTab(CALENDAR_TAB_INDEX)}
          onViewMap={openMapSheet}
        />
      ) : selectedTab === RESTAURANT_TAB_INDEX ? (
        <div style={{ backgroundColor: PAPER_CREAM }}>
          {/* "AUGUST FOOD ARCHIVE" 매거진 헤더예요. PNG 대신 순수 코드(SVG
              찢어진 종이 태그 + 텍스트)로 재구현해서, 월/연도가 항상 오늘
              날짜 기준으로 자동 갱신돼요. */}
          <div style={{ padding: "16px 24px 12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ transform: "rotate(-3deg)" }}>
                <TornPaperTag>
                  <div
                    style={{
                      fontFamily: BRAND_DISPLAY_FONT_FAMILY,
                      fontSize: "26px",
                      color: CORAL_RED,
                      lineHeight: 1.1,
                    }}
                  >
                    {getCurrentMonthLabel()}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: DARK_NAVY,
                      letterSpacing: "2px",
                      marginTop: "4px",
                    }}
                  >
                    FOOD ARCHIVE
                  </div>
                  <div style={{ marginTop: "2px" }}>
                    <SwashUnderline width={104} strokeWidth={1.6} color={DARK_NAVY} />
                  </div>
                </TornPaperTag>
              </div>
              <span
                style={{
                  marginTop: "4px",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  border: `1.5px solid ${SAGE_GREEN_DARK}`,
                  fontSize: "12px",
                  fontWeight: 700,
                  color: SAGE_GREEN_DARK,
                  flexShrink: 0,
                }}
              >
                {new Date().getFullYear()}
              </span>
            </div>
          </div>

          <div style={{ padding: "0 24px 16px" }}>
            <Button
              display="block"
              variant="fill"
              style={PRIMARY_FILL_BUTTON_TEXT_STYLE}
              onClick={openAddSheet}
            >
              오늘의 식사
            </Button>
          </div>

          {isLoaded && restaurants.length > 0 && (
            <>
              <div style={{ padding: "0 24px 16px" }}>
                <SearchField
                  placeholder={restaurantSearchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onDeleteClick={() => setSearchQuery("")}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  padding: "0 24px 16px",
                  overflowX: "auto",
                }}
              >
                <Button
                  size="medium"
                  variant="weak"
                  color="dark"
                  style={{ flexShrink: 0 }}
                  onClick={openCategoryFilterSheet}
                >
                  {selectedCategory === ALL_CATEGORY
                    ? "카테고리"
                    : selectedCategory}{" "}
                  ▾
                </Button>
                <Button
                  size="medium"
                  variant="weak"
                  color="dark"
                  style={{ flexShrink: 0 }}
                  onClick={openSortSheet}
                >
                  {
                    SORT_OPTIONS.find((option) => option.value === sortOption)
                      ?.label
                  }{" "}
                  ▾
                </Button>
                {regionFilterOptions.size > 0 && (
                  <Button
                    size="medium"
                    variant="weak"
                    color="dark"
                    style={{ flexShrink: 0 }}
                    onClick={openNeighborhoodFilterSheet}
                  >
                    {filterProvince
                      ? formatRegionLabel(filterProvince, filterDistrict)
                      : "동네"}{" "}
                    ▾
                  </Button>
                )}
                <Button
                  size="medium"
                  variant={specialDayOnly ? "fill" : "weak"}
                  color={specialDayOnly ? "primary" : "dark"}
                  style={{
                    flexShrink: 0,
                    ...(specialDayOnly ? PRIMARY_FILL_BUTTON_TEXT_STYLE : {}),
                  }}
                  onClick={() => setSpecialDayOnly((prev) => !prev)}
                >
                  ⭐ 특별한 날만
                </Button>
              </div>
            </>
          )}

          {!isLoaded ? null : restaurants.length === 0 ? (
            <Result
              figure={
                <EmptyStateFigure
                  icon={<EmptyDiaryIcon size={32} color="#4A6350" />}
                />
              }
              title="아직 기록한 맛집이 없어요"
              description={"첫 기록을 남겨보세요."}
            />
          ) : visibleRestaurants.length === 0 ? (
            <Result
              title="검색 결과가 없어요"
              description={
                "다른 이름으로 검색하거나\n다른 음식 종류를 선택해 보세요."
              }
            />
          ) : (
            // 당근마켓 스타일 리스트 정리: 정사각형 썸네일(고정 72x72) +
            // 굵은 제목 + 회색 부가정보 한 줄 + 우측 뱃지, 얇은 구분선으로
            // 아이템을 나눠요. 예전 "매거진 인덱스 번호(01/02/03…)"와 메모
            // 2줄 미리보기는 장식성이 강해서 뺐어요 — 목록에서는 가게 이름과
            // 핵심 정보만 빠르게 훑을 수 있게 하고, 메모는 상세보기에서
            // 보여줘요. 클릭/삭제 등 기존 동작은 전부 그대로예요.
            <div style={{ padding: "0 24px" }}>
              {visibleRestaurants.map((restaurant, index) => (
                <div key={restaurant.id}>
                  <div
                    onClick={() => openDetailSheet(restaurant)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 0",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: `${LIST_THUMBNAIL_SIZE}px`,
                        height: `${LIST_THUMBNAIL_SIZE}px`,
                        borderRadius: LIST_THUMBNAIL_RADIUS,
                        overflow: "hidden",
                        flexShrink: 0,
                        backgroundColor: "#EAF0EA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {restaurant.photos && restaurant.photos.length > 0 ? (
                        <img
                          src={restaurant.photos[0]}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            fontSize: "22px",
                            fontWeight: 700,
                            color: SAGE_GREEN_DARK,
                          }}
                        >
                          {restaurant.name.slice(0, 1)}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          width: "100%",
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            ...NAME_ELLIPSIS_STYLE,
                            fontSize: "15px",
                            fontWeight: 700,
                            color: DARK_NAVY,
                          }}
                        >
                          {restaurant.name}
                        </span>
                        {(restaurant.isReservation ||
                          restaurant.isSpecialDay) && (
                          <span
                            style={{ display: "flex", gap: "6px", flexShrink: 0 }}
                          >
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
                        )}
                      </div>
                      <div
                        style={{
                          marginTop: "3px",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: META_TEXT_COLOR,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {[
                          restaurant.category,
                          summarizeMenus(restaurant.menus),
                          formatDisplayDate(restaurant.visitDate),
                          restaurant.neighborhood,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "8px",
                        flexShrink: 0,
                      }}
                    >
                      <RatingStars value={restaurant.rating} size={14} />
                      <Button
                        size="small"
                        variant="weak"
                        color="danger"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(restaurant);
                        }}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                  {index < visibleRestaurants.length - 1 && (
                    <div
                      style={{ height: "1px", backgroundColor: DIVIDER_COLOR }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : selectedTab === CALENDAR_TAB_INDEX ? (
        <CalendarView
          plannedVisits={plannedVisits}
          isLoaded={isPlannedVisitsLoaded}
          onAdd={handleAddPlannedVisit}
          onUpdate={handleUpdatePlannedVisit}
          onDelete={handleDeletePlannedVisit}
          onMarkVisited={openAddSheetFromPlannedVisit}
        />
      ) : selectedTab === FOOD_DEX_TAB_INDEX ? (
        <FoodDexView
          restaurants={restaurants}
          onSelectTag={(tag) => openTagSheet(tag)}
        />
      ) : (
        <TodayMealBoard onOpenRestaurantSearch={openSearchSheet} />
      )}
    </>
  );
}

export default App;
