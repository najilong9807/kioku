import {
  Button,
  List,
  ListRow,
  Rating,
  Result,
  TextField,
  Top,
  useBottomSheet,
  useDialog,
} from "@toss/tds-mobile";
import { useEffect, useState } from "react";
import "./App.css";
import { loadRestaurants, saveRestaurants, type Restaurant } from "./restaurantStorage";

function formatToday() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

interface AddRestaurantFormValues {
  name: string;
  category: string;
  memo: string;
  rating: number;
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
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [memo, setMemo] = useState(initialValues?.memo ?? "");
  const [rating, setRating] = useState(initialValues?.rating ?? 5);

  const handleSubmit = () => {
    if (!name.trim()) {
      return;
    }

    onSubmit({
      name: name.trim(),
      category: category.trim() || "기타",
      memo: memo.trim(),
      rating,
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
      <TextField
        variant="box"
        label="음식 종류"
        labelOption="sustain"
        placeholder="예) 냉면, 한식"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <TextField
        variant="box"
        label="메모"
        labelOption="sustain"
        placeholder="맛, 분위기, 다음에 먹을 메뉴 등"
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
        <Button style={{ flex: 1 }} variant="fill" onClick={handleSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

function App() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const { open, close } = useBottomSheet();
  const { openConfirm } = useDialog();

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
                visitedAt: formatToday(),
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

  const openEditSheet = (restaurant: Restaurant) => {
    open({
      header: "맛집 수정하기",
      children: (
        <RestaurantForm
          initialValues={{
            name: restaurant.name,
            category: restaurant.category,
            memo: restaurant.memo,
            rating: restaurant.rating,
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

      {!isLoaded ? null : restaurants.length === 0 ? (
        <Result
          title="아직 기록된 맛집이 없어요"
          description={"다녀온 맛집을 기록하면\n여기에 모아서 볼 수 있어요."}
        />
      ) : (
        <List>
          {restaurants.map((restaurant) => (
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
                    bottom={`${restaurant.category} · ${restaurant.visitedAt}`}
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
