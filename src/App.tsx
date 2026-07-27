import {
  Asset,
  Button,
  List,
  ListRow,
  Rating,
  Result,
  SearchField,
  SegmentedControl,
  TextArea,
  TextField,
  Top,
  useBottomSheet,
  useDialog,
} from "@toss/tds-mobile";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import "./App.css";
import {
  CATEGORIES,
  formatDisplayDate,
  loadRestaurants,
  saveRestaurants,
  todayDateInputValue,
  type Category,
  type Restaurant,
} from "./restaurantStorage";

// 목록에서 메뉴가 많으면 2개까지만 보여주고 나머지는 "+N"으로 축약해요.
function summarizeMenus(menus: string[]): string {
  if (menus.length === 0) {
    return "";
  }
  const shown = menus.slice(0, 2).join(", ");
  const remaining = menus.length - 2;
  return remaining > 0 ? `${shown} +${remaining}` : shown;
}

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

// 날씨 아이콘은 이제 텍스트를 채워주지 않는 순수 장식용이라, 이모지만 나열해요.
const WEATHER_MOOD_ICONS = ["☀️", "☁️", "🌧️", "❄️", "🍂", "🌬️"];

// 날씨 입력창 placeholder로 번갈아 보여줄 감성 문장 예시예요. 실제로 입력되지는 않아요.
const WEATHER_PLACEHOLDER_EXAMPLES = [
  "햇살이 유난히 따스했던 날",
  "구름이 낮게 드리운 하루",
  "빗소리가 창밖을 두드리던 날",
  "하얀 눈이 소복이 내려앉은 날",
  "가을바람이 살랑하니 내 콧등을 간지럽혔다",
];

// 날씨 입력창 위에 나열되는 장식용 아이콘이에요. 눌러도 아무 동작도 하지 않고,
// 그저 날씨를 문장으로 적어보라는 분위기만 환기시켜줘요.
function WeatherMoodIcons() {
  return (
    <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
      {WEATHER_MOOD_ICONS.map((emoji, index) => (
        <div
          key={`${emoji}-${index}`}
          style={{
            flexShrink: 0,
            width: "40px",
            height: "40px",
            borderRadius: "20px",
            backgroundColor: "#f2f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          {emoji}
        </div>
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
    <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
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
  category: Category;
  menus: string[];
  companion: string;
  weather: string;
  memo: string;
  rating: number;
  visitDate: string;
  receiptImage?: string;
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
}: {
  initialValues?: AddRestaurantFormValues;
  submitLabel?: string;
  onSubmit: (values: AddRestaurantFormValues) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [category, setCategory] = useState<Category>(initialValues?.category ?? CATEGORIES[0]);
  const [menus, setMenus] = useState<string[]>(initialValues?.menus ?? []);
  const [menuInput, setMenuInput] = useState("");
  const [companion, setCompanion] = useState(initialValues?.companion ?? "");
  const [weather, setWeather] = useState(initialValues?.weather ?? "");
  const [memo, setMemo] = useState(initialValues?.memo ?? "");
  const [rating, setRating] = useState(initialValues?.rating ?? 5);
  const [visitDate, setVisitDate] = useState(initialValues?.visitDate ?? todayDateInputValue());
  const [receiptImage, setReceiptImage] = useState(initialValues?.receiptImage);
  const receiptInputRef = useRef<HTMLInputElement>(null);

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

  const handleReceiptChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setReceiptImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name.trim() || requiresReceipt || hasNoMenu) {
      return;
    }

    onSubmit({
      name: name.trim(),
      category,
      menus,
      companion: companion.trim(),
      weather: weather.trim(),
      memo: memo.trim(),
      rating,
      visitDate,
      receiptImage,
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
      <TextField
        variant="box"
        label="가게 이름"
        labelOption="sustain"
        placeholder="예) 우래옥"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div>
        <div style={{ marginBottom: "8px", color: "#6b7684", fontSize: "14px" }}>
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
      <div>
        <div style={{ marginBottom: "8px", color: "#6b7684", fontSize: "14px" }}>
          영수증 사진{isPastVisit ? " (필수)" : " (선택)"}
        </div>
        <input
          ref={receiptInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={handleReceiptChange}
        />
        {receiptImage ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
              onClick={() => receiptInputRef.current?.click()}
            >
              다시 선택
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
          <Button variant="weak" color="dark" onClick={() => receiptInputRef.current?.click()}>
            📷 영수증 사진 첨부
          </Button>
        )}
        {requiresReceipt && (
          <div style={{ marginTop: "8px", color: "#f04452", fontSize: "13px" }}>
            과거 날짜로 기록하려면 영수증 사진을 첨부해야 해요.
          </div>
        )}
      </div>
      <div>
        <div style={{ marginBottom: "8px", color: "#6b7684", fontSize: "14px" }}>
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
      <div>
        <div style={{ marginBottom: "8px", color: "#6b7684", fontSize: "14px" }}>
          먹은 메뉴
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
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
          <Button variant="weak" color="dark" onClick={addMenu}>
            추가
          </Button>
        </div>
        {menus.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
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
          <div style={{ marginTop: "8px", color: "#f04452", fontSize: "13px" }}>
            메뉴를 1개 이상 등록해야 저장할 수 있어요.
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <QuickPickChips options={COMPANION_QUICK_OPTIONS} onSelect={setCompanion} />
        <TextField
          variant="box"
          label="같이 간 사람"
          labelOption="sustain"
          placeholder="예) 민수, 지영"
          value={companion}
          onChange={(e) => setCompanion(e.target.value)}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <WeatherMoodIcons />
        <TextField
          variant="box"
          label="날씨"
          labelOption="sustain"
          placeholder={weatherPlaceholder}
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
        />
      </div>
      <TextArea
        variant="box"
        label="이 곳에서의 기억"
        labelOption="sustain"
        placeholder="오늘 이 곳에서의 기억을 자유롭게 남겨보세요"
        minHeight={96}
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
      <div>
        <div style={{ marginBottom: "8px", color: "#6b7684", fontSize: "14px" }}>
          별점
        </div>
        <Rating
          readOnly={false}
          value={rating}
          max={5}
          size="large"
          onValueChange={setRating}
        />
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <Button style={{ flex: 1 }} variant="weak" color="dark" onClick={onCancel}>
          취소
        </Button>
        <Button
          style={{ flex: 1 }}
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

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof FILTER_CATEGORIES)[number]>(ALL_CATEGORY);
  const [sortOption, setSortOption] = useState<SortOption>("latest");

  const { open, close } = useBottomSheet();
  const { openConfirm } = useDialog();

  // 최신/오래된순은 사용자가 고른 방문일(visitDate) 기준이고, 방문일이 같으면
  // 등록 시각(id, Date.now() 기반)을 기준으로 순서를 정해요.
  const visibleRestaurants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = restaurants.filter((restaurant) => {
      const matchesCategory =
        selectedCategory === ALL_CATEGORY || restaurant.category === selectedCategory;
      const matchesQuery =
        query.length === 0 || restaurant.name.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    const sorted = [...filtered];
    switch (sortOption) {
      case "latest":
        sorted.sort(
          (a, b) => b.visitDate.localeCompare(a.visitDate) || Number(b.id) - Number(a.id),
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) => a.visitDate.localeCompare(b.visitDate) || Number(a.id) - Number(b.id),
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
  }, [restaurants, selectedCategory, searchQuery, sortOption]);

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
      header: "맛집 기록하기",
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

  const openCategoryFilterSheet = () => {
    open({
      header: "음식 종류 선택",
      children: (
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
      ),
    });
  };

  const openSortSheet = () => {
    open({
      header: "정렬 기준 선택",
      children: (
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
      ),
    });
  };

  const openEditSheet = (restaurant: Restaurant) => {
    open({
      header: "맛집 수정하기",
      children: (
        <RestaurantForm
          initialValues={{
            name: restaurant.name,
            category: restaurant.category,
            menus: restaurant.menus,
            companion: restaurant.companion,
            weather: restaurant.weather,
            memo: restaurant.memo,
            rating: restaurant.rating,
            visitDate: restaurant.visitDate,
            receiptImage: restaurant.receiptImage,
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

  return (
    <>
      <Top
        title={<Top.TitleParagraph size={22}>이게맛다</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={17}>
            {restaurants.length > 0
              ? `지금까지 ${restaurants.length}곳의 맛집을 기록했어요.`
              : "다녀온 맛집을 기록하고 모아보세요."}
          </Top.SubtitleParagraph>
        }
      />

      <div style={{ padding: "0 24px 16px" }}>
        <Button display="block" variant="fill" onClick={openAddSheet}>
          맛집 기록하기
        </Button>
      </div>

      {isLoaded && restaurants.length > 0 && (
        <>
          <div style={{ padding: "0 24px 16px" }}>
            <SearchField
              placeholder="맛집 이름으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onDeleteClick={() => setSearchQuery("")}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", padding: "0 24px 16px" }}>
            <Button
              size="medium"
              variant="weak"
              color="dark"
              onClick={openCategoryFilterSheet}
            >
              {selectedCategory} ▾
            </Button>
            <Button size="medium" variant="weak" color="dark" onClick={openSortSheet}>
              {SORT_OPTIONS.find((option) => option.value === sortOption)?.label} ▾
            </Button>
          </div>
        </>
      )}

      {!isLoaded ? null : restaurants.length === 0 ? (
        <Result
          title="아직 기록된 맛집이 없어요"
          description={"다녀온 맛집을 기록하면\n여기에 모아서 볼 수 있어요."}
        />
      ) : visibleRestaurants.length === 0 ? (
        <Result
          title="검색 결과가 없어요"
          description={"다른 이름으로 검색하거나\n다른 음식 종류를 선택해 보세요."}
        />
      ) : (
        <List>
          {visibleRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => openEditSheet(restaurant)}
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
                      restaurant.category,
                      summarizeMenus(restaurant.menus),
                      formatDisplayDate(restaurant.visitDate),
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
            </div>
          ))}
        </List>
      )}
    </>
  );
}

export default App;
