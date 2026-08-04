import {
  Asset,
  Badge,
  Border,
  Button,
  List,
  ListRow,
  Rating,
  Result,
  SearchField,
  SegmentedControl,
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
} from "react";
import "./App.css";
import { BrandMarkIcon } from "./BrandMarkIcon";
import CalendarView, { type PlannedVisitFormValues } from "./CalendarView";
import HomeScreen from "./HomeScreen";
import { resizeImageFile } from "./lib/imageResize";
import {
  buildRegionFilterOptions,
  formatRegionLabel,
  matchesRegion,
} from "./lib/koreanRegions";
import { countUnreadNotifications } from "./lib/notifications";
import {
  loadPlannedVisits,
  savePlannedVisits,
  type PlannedVisit,
} from "./lib/plannedVisitStorage";
import { fetchProfile, saveProfile } from "./lib/profile";
import { SheetHeader } from "./lib/SheetHeader";
import { getUserIdentityHash } from "./lib/userIdentity";
import {
  NotificationBellButton,
  NotificationsSheetContent,
} from "./NotificationsView";
import ProfileView, { ProfileIconButton } from "./ProfileView";
import { RegionFilterSheetContent, RegionPicker } from "./RegionPicker";
import RestaurantDetailView from "./RestaurantDetailView";
import { RestaurantSearchSheetContent } from "./RestaurantSearchOverlay";
import SplashScreen from "./SplashScreen";
import { HANDWRITING_TEXT_STYLE } from "./theme";
import {
  CATEGORIES,
  formatDisplayDate,
  loadRestaurants,
  saveRestaurants,
  todayDateInputValue,
  type Category,
  type Restaurant,
} from "./restaurantStorage";
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
  isReservation: boolean;
  isSpecialDay: boolean;
}

// 음식/가게 사진은 최대 이만큼만 첨부할 수 있어요.
const MAX_PHOTOS = 4;

// 바텀시트에 넘기는 children은 open() 호출 시점에 한 번 고정돼요.
// 그래서 입력 상태는 바깥 App이 아니라 이 컴포넌트 자신이 들고 있어야
// 타이핑/별점 선택마다 이 컴포넌트만 다시 렌더링되어 반영돼요.
// 새 맛집을 등록할 때와 기존 맛집을 수정할 때 모두 사용해요.
function RestaurantForm({
  initialValues,
  submitLabel = "기록하기",
  onSubmit,
  onCancel,
}: {
  initialValues?: AddRestaurantFormValues;
  submitLabel?: string;
  onSubmit: (values: AddRestaurantFormValues) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [category, setCategory] = useState<Category>(
    initialValues?.category ?? CATEGORIES[0],
  );
  const [menus, setMenus] = useState<string[]>(initialValues?.menus ?? []);
  const [menuInput, setMenuInput] = useState("");
  const [companion, setCompanion] = useState(initialValues?.companion ?? "");
  const [weather, setWeather] = useState(initialValues?.weather ?? "");
  const [neighborhood, setNeighborhood] = useState(
    initialValues?.neighborhood ?? "",
  );
  const [memo, setMemo] = useState(initialValues?.memo ?? "");
  const [rating, setRating] = useState(initialValues?.rating ?? 5);
  const [visitDate, setVisitDate] = useState(
    initialValues?.visitDate ?? todayDateInputValue(),
  );
  const [receiptImage, setReceiptImage] = useState(initialValues?.receiptImage);
  const [isReceiptProcessing, setIsReceiptProcessing] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<string[]>(initialValues?.photos ?? []);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const [isReservation, setIsReservation] = useState(
    initialValues?.isReservation ?? false,
  );
  const [isSpecialDay, setIsSpecialDay] = useState(
    initialValues?.isSpecialDay ?? false,
  );

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

  const addMenu = () => {
    const trimmed = menuInput.trim();
    if (!trimmed) {
      return;
    }
    setMenus((prev) => [...prev, trimmed]);
    setMenuInput("");
  };

  const removeMenu = (index: number) => {
    setMenus((prev) => prev.filter((_, i) => i !== index));
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
      setPhotos((prev) =>
        prev.length >= MAX_PHOTOS ? prev : [...prev, resized],
      );
    } catch (error) {
      console.error("사진을 처리하지 못했어요.", error);
    } finally {
      setIsPhotoProcessing(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
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
              <Star size={16} color="#FFC107" fill="#FFC107" />
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
          <SegmentedControl
            alignment="fluid"
            size="small"
            value={category}
            onChange={(value) => setCategory(value as Category)}
          >
            {CATEGORIES.map((item) => (
              <SegmentedControl.Item key={item} value={item}>
                {item}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl>
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TextField
              variant="box"
              placeholder="예) 짜장면"
              value={menuInput}
              onChange={(e) => setMenuInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMenu();
                }
              }}
              style={{ flex: 1 }}
            />
            <Button size="large" variant="weak" color="dark" onClick={addMenu}>
              추가
            </Button>
          </div>
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
                    gap: "6px",
                    padding: "6px 10px",
                    borderRadius: "16px",
                    backgroundColor: "#f2f4f6",
                    fontSize: "14px",
                    color: "#191f28",
                  }}
                >
                  <span>{menu}</span>
                  <button
                    type="button"
                    onClick={() => removeMenu(index)}
                    aria-label={`${menu} 삭제`}
                    style={{
                      border: "none",
                      background: "none",
                      padding: 0,
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
            <Rating
              readOnly={false}
              value={rating}
              max={5}
              size="large"
              onValueChange={setRating}
            />
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
    </div>
  );
}

// 앱 최초 실행 시 닉네임이 없는 사용자에게 한 번 띄우는 간단한 입력 폼이에요.
function NicknameForm({ onSubmit }: { onSubmit: (nickname: string) => void }) {
  const [nickname, setNickname] = useState("");

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

const MAIN_TABS = [
  "홈",
  "맛있는 하루",
  "오늘의 한 입",
  "다가올 한 입",
] as const;
const HOME_TAB_INDEX = 0;
const RESTAURANT_TAB_INDEX = 1;
const TODAY_MEAL_TAB_INDEX = 2;
const CALENDAR_TAB_INDEX = 3;

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

function App() {
  const [showSplash, setShowSplash] = useState(
    () => !hasSeenSplashThisSession(),
  );
  const [selectedTab, setSelectedTab] = useState(HOME_TAB_INDEX);
  const [nickname, setNickname] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [homeNeighborhood, setHomeNeighborhood] = useState<string | null>(null);
  const [userHash, setUserHash] = useState<string | null>(null);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [plannedVisits, setPlannedVisits] = useState<PlannedVisit[]>([]);
  const [isPlannedVisitsLoaded, setIsPlannedVisitsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
        openNicknameSheet(userHash);
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

  const openNicknameSheet = (userHash: string) => {
    open({
      header: <SheetHeader title="닉네임을 알려주세요" onClose={close} />,
      children: (
        <NicknameForm
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
      children: (
        <NotificationsSheetContent
          userHash={userHash}
          onRead={() => setHasUnreadNotifications(false)}
          onClose={close}
        />
      ),
    });
  };

  const openProfileSheet = () => {
    open({
      header: <SheetHeader title="내 프로필" onClose={close} />,
      children: (
        <ProfileView
          userHash={userHash}
          nickname={nickname ?? ""}
          profileImage={profileImage}
          neighborhood={homeNeighborhood}
          restaurantCount={restaurants.length}
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

  const handleDelete = async (restaurant: Restaurant) => {
    const confirmed = await openConfirm({
      title: `${restaurant.name}을(를) 삭제할까요?`,
      description: "삭제한 기록은 다시 되돌릴 수 없어요.",
      confirmButton: "삭제",
      cancelButton: "취소",
    });

    if (!confirmed) {
      return;
    }

    setRestaurants((prev) => prev.filter((item) => item.id !== restaurant.id));
  };

  const openAddSheet = () => {
    open({
      header: <SheetHeader title="오늘의 식사" onClose={close} />,
      children: (
        <RestaurantForm
          submitLabel="기록하기"
          onCancel={close}
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
      children: (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "0 24px 12px",
            }}
          >
            <Button size="small" variant="weak" color="dark" onClick={close}>
              닫기
            </Button>
          </div>
          <List>
            {FILTER_CATEGORIES.map((category) => {
              const isSelected = category === selectedCategory;
              return (
                <div
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
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
                            {category}
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

  const openSortSheet = () => {
    open({
      header: <SheetHeader title="정렬 기준 선택" onClose={close} />,
      children: (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "0 24px 12px",
            }}
          >
            <Button size="small" variant="weak" color="dark" onClick={close}>
              닫기
            </Button>
          </div>
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
          onClose={close}
        />
      ),
    });
  };

  const openEditSheet = (restaurant: Restaurant) => {
    open({
      header: <SheetHeader title="맛집 수정하기" onClose={close} />,
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
            isReservation: restaurant.isReservation,
            isSpecialDay: restaurant.isSpecialDay,
          }}
          submitLabel="수정하기"
          onCancel={close}
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
  // 일기장 스타일 헤더(뒤로가기+날짜 제목+북마크)를 RestaurantDetailView가 직접
  // 그리기 때문에, 바텀시트 기본 header는 쓰지 않아요.
  const openDetailSheet = (restaurant: Restaurant) => {
    open({
      children: (
        <RestaurantDetailView
          restaurant={restaurant}
          onClose={close}
          onEdit={() => {
            close();
            openEditSheet(restaurant);
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

  const openSearchSheet = () => {
    open({
      header: <SheetHeader title="검색" onClose={close} />,
      children: (
        <RestaurantSearchSheetContent
          restaurants={restaurants}
          onSelectRestaurant={(restaurant) => {
            close();
            setSelectedTab(RESTAURANT_TAB_INDEX);
            openDetailSheet(restaurant);
          }}
          onClose={close}
        />
      ),
    });
  };

  return (
    <>
      {/* 다른 화면들이 뒤에서 준비되는 동안 잠깐 덮어서 보여주는 인트로예요.
          사라지고 나면 이미 로드된 홈 화면이 바로 보여요. */}
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

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
                    : "오늘 먹은 메뉴를 자유롭게 나눠보세요."}
            </Top.SubtitleParagraph>
          }
        />
      </div>

      <div className="kioku-main-tabs" style={{ padding: "0 8px 16px" }}>
        <Tab size="small" onChange={(index) => setSelectedTab(index)}>
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
        />
      ) : selectedTab === RESTAURANT_TAB_INDEX ? (
        <>
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
                  placeholder="어디 가볼까요?"
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
              title="아직 기록된 맛집이 없어요"
              description={
                "다녀온 맛집을 기록하면\n여기에 모아서 볼 수 있어요."
              }
            />
          ) : visibleRestaurants.length === 0 ? (
            <Result
              title="검색 결과가 없어요"
              description={
                "다른 이름으로 검색하거나\n다른 음식 종류를 선택해 보세요."
              }
            />
          ) : (
            <List>
              {visibleRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  onClick={() => openDetailSheet(restaurant)}
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
                              <Badge
                                size="xsmall"
                                variant="weak"
                                color="yellow"
                              >
                                ⭐ 특별한 날
                              </Badge>
                            )}
                          </span>
                        }
                        bottom={[
                          restaurant.category,
                          summarizeMenus(restaurant.menus),
                          formatDisplayDate(restaurant.visitDate),
                          restaurant.neighborhood,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      />
                    }
                    right={
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "8px",
                        }}
                      >
                        <Rating
                          readOnly
                          value={restaurant.rating}
                          max={5}
                          size="small"
                          variant="iconOnly"
                        />
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
                    }
                  />
                  {restaurant.memo.trim() && (
                    <div
                      style={{
                        padding: "0 24px 12px 76px",
                        fontSize: "13px",
                        lineHeight: 1.4,
                        color: "#8b95a1",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {restaurant.memo.trim()}
                    </div>
                  )}
                </div>
              ))}
            </List>
          )}
        </>
      ) : selectedTab === CALENDAR_TAB_INDEX ? (
        <CalendarView
          plannedVisits={plannedVisits}
          isLoaded={isPlannedVisitsLoaded}
          onAdd={handleAddPlannedVisit}
          onUpdate={handleUpdatePlannedVisit}
          onDelete={handleDeletePlannedVisit}
          onMarkVisited={openAddSheetFromPlannedVisit}
        />
      ) : (
        <TodayMealBoard onOpenRestaurantSearch={openSearchSheet} />
      )}
    </>
  );
}

export default App;
