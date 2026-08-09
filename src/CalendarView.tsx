import {
  Badge,
  Button,
  Result,
  TextArea,
  TextField,
  useBottomSheet,
  useDialog,
} from "@toss/tds-mobile";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { EmptyCalendarIcon, EmptyStateFigure } from "./lib/emptyStateIcons";
import {
  formatDDay,
  getDaysUntil,
  sortPlannedVisitsByDate,
  type PlannedVisit,
} from "./lib/plannedVisitStorage";
import {
  formatDisplayDate,
  toDateInputValue,
  todayDateInputValue,
} from "./restaurantStorage";
import { SheetHeader } from "./lib/SheetHeader";
import {
  BRAND_DISPLAY_FONT_FAMILY,
  CORAL_RED,
  DARK_NAVY,
  PAPER_CREAM,
  SAGE_GREEN,
} from "./theme";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

// "NEXT BITE" 헤더의 "AUG. 2026" 같은 영문 월 표기용이에요.
const MONTH_ABBREVIATIONS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// 헤더에 놓는 작은 손그림 노트 도들이에요. 이 화면(캘린더)은 기능성이
// 강해서 장식을 이거 하나로만 제한했어요.
function NotebookDoodle() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <rect
        x="5"
        y="4"
        width="18"
        height="20"
        rx="2.5"
        stroke={DARK_NAVY}
        strokeWidth="1.6"
      />
      <path d="M5 9.5 L23 9.5" stroke={DARK_NAVY} strokeWidth="1.4" />
      <path d="M9 4.5 L9 7" stroke={DARK_NAVY} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M19 4.5 L19 7" stroke={DARK_NAVY} strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M9.5 15 L12.5 18 L18.5 12"
        stroke={SAGE_GREEN}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 브랜드 색(노란색)이 밝아서 흰 글씨는 가독성이 떨어져요. App.tsx의 동명
// 상수와 같은 이유로, variant="fill" 버튼의 글자색을 진하게 덮어써요.
const PRIMARY_FILL_BUTTON_TEXT_STYLE = {
  "--button-color": "#000000",
} as CSSProperties;

const FORM_CARD_BACKGROUND_COLOR = "#f9fafb";
const FORM_SECTION_PADDING = "20px 20px";

// year/month(0-indexed) 달력 한 칸 한 칸을 채울 날짜 배열이에요. 그 달 1일 이전의
// 빈칸은 null로 채워서, 요일 위치가 맞도록 해요.
function getMonthCells(year: number, month: number): (string | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toDateInputValue(new Date(year, month, day)));
  }
  return cells;
}

export interface PlannedVisitFormValues {
  name: string;
  visitDate: string;
  memo: string;
}

// 바텀시트에 넘기는 children은 open() 호출 시점에 한 번 고정되기 때문에,
// 입력 상태는 이 컴포넌트 자신이 들고 있어요. 새 방문 예정을 등록할 때와
// 기존 예정을 수정할 때 모두 사용해요.
function PlannedVisitForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialValues?: PlannedVisitFormValues;
  submitLabel: string;
  onSubmit: (values: PlannedVisitFormValues) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [visitDate, setVisitDate] = useState(
    initialValues?.visitDate ?? todayDateInputValue(),
  );
  const [memo, setMemo] = useState(initialValues?.memo ?? "");

  const canSubmit = name.trim().length > 0 && visitDate.length > 0;

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
        <div style={{ padding: FORM_SECTION_PADDING }}>
          <div
            style={{
              marginBottom: "8px",
              color: "#6b7684",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            방문 예정일
          </div>
          <input
            type="date"
            value={visitDate}
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
        <div style={{ padding: FORM_SECTION_PADDING }}>
          <div
            style={{
              marginBottom: "8px",
              color: "#6b7684",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            메모 (선택)
          </div>
          <TextArea
            variant="box"
            placeholder="예) 저녁 7시 예약, 2명"
            minHeight={72}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
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
          disabled={!canSubmit}
          onClick={() =>
            onSubmit({
              name: name.trim(),
              visitDate,
              memo: memo.trim(),
            })
          }
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

// 방문 예정 목록의 한 줄이에요. 지난 날짜(daysUntil < 0)면 "다녀왔어요" 버튼을,
// 아직 지나지 않았으면 "수정"/"취소" 버튼을 보여줘요.
function PlannedVisitRow({
  visit,
  onEdit,
  onDelete,
  onMarkVisited,
}: {
  visit: PlannedVisit;
  onEdit: () => void;
  onDelete: () => void;
  onMarkVisited: () => void;
}) {
  const daysUntil = getDaysUntil(visit.visitDate);
  const isPast = daysUntil < 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "16px 24px",
        borderBottom: "1px solid #f2f4f6",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#191f28" }}>
          {visit.name}
        </span>
        <Badge size="small" variant="weak" color={isPast ? "red" : "blue"}>
          {formatDDay(daysUntil)}
        </Badge>
      </div>
      <div style={{ fontSize: "13px", color: "#8b95a1" }}>
        {formatDisplayDate(visit.visitDate)}
        {visit.memo ? ` · ${visit.memo}` : ""}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        {isPast ? (
          <Button
            size="small"
            variant="fill"
            style={PRIMARY_FILL_BUTTON_TEXT_STYLE}
            onClick={onMarkVisited}
          >
            다녀왔어요
          </Button>
        ) : (
          <>
            <Button size="small" variant="weak" color="dark" onClick={onEdit}>
              수정
            </Button>
            <Button
              size="small"
              variant="weak"
              color="danger"
              onClick={onDelete}
            >
              취소
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// 달력 탭 화면이에요. 이번 달 달력에서 방문 예정이 있는 날짜에 점을 표시하고,
// 날짜를 누르면 그 날짜로 방문 예정을 등록할 수 있어요. 아래에는 방문 예정
// 전체를 가까운 날짜순으로 보여주는 목록이 있고, 날짜가 지난 항목은
// "다녀왔어요"로 맛집 기록 등록으로 이어져요.
export default function CalendarView({
  plannedVisits,
  isLoaded,
  onAdd,
  onUpdate,
  onDelete,
  onMarkVisited,
}: {
  plannedVisits: PlannedVisit[];
  isLoaded: boolean;
  onAdd: (values: PlannedVisitFormValues) => void;
  onUpdate: (id: string, values: PlannedVisitFormValues) => void;
  onDelete: (id: string) => void;
  onMarkVisited: (visit: PlannedVisit) => void;
}) {
  const now = new Date();
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const { open, close } = useBottomSheet();
  const { openConfirm } = useDialog();

  const cells = useMemo(
    () => getMonthCells(cursor.year, cursor.month),
    [cursor],
  );

  const visitDatesWithPlan = useMemo(
    () => new Set(plannedVisits.map((visit) => visit.visitDate)),
    [plannedVisits],
  );

  const sortedVisits = useMemo(
    () => sortPlannedVisitsByDate(plannedVisits),
    [plannedVisits],
  );

  const today = todayDateInputValue();

  const openAddSheet = (defaultDate?: string) => {
    open({
      header: <SheetHeader title="방문 예정 등록" onClose={close} />,
      children: (
        <PlannedVisitForm
          submitLabel="등록"
          initialValues={
            defaultDate
              ? { name: "", visitDate: defaultDate, memo: "" }
              : undefined
          }
          onCancel={close}
          onSubmit={(values) => {
            onAdd(values);
            close();
          }}
        />
      ),
    });
  };

  const openEditSheet = (visit: PlannedVisit) => {
    open({
      header: <SheetHeader title="방문 예정 수정" onClose={close} />,
      children: (
        <PlannedVisitForm
          submitLabel="저장"
          initialValues={visit}
          onCancel={close}
          onSubmit={(values) => {
            onUpdate(visit.id, values);
            close();
          }}
        />
      ),
    });
  };

  const handleDelete = async (visit: PlannedVisit) => {
    const confirmed = await openConfirm({
      title: `${visit.name} 방문 예정을 취소할까요?`,
      description: "취소한 방문 예정은 다시 되돌릴 수 없어요.",
      confirmButton: "취소하기",
      cancelButton: "닫기",
    });

    if (confirmed) {
      onDelete(visit.id);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        backgroundColor: PAPER_CREAM,
        paddingBottom: "8px",
      }}
    >
      {/* "NEXT BITE" 헤더예요(레퍼런스 "04_다가올_한입.png" 기준). 이
          화면은 기능성이 강한 캘린더라, 장식은 헤더의 작은 노트 도들
          하나로 최소화했어요. */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "16px 24px 0",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: BRAND_DISPLAY_FONT_FAMILY,
              fontSize: "26px",
              color: DARK_NAVY,
              lineHeight: 1.1,
            }}
          >
            NEXT BITE
          </div>
          <div
            style={{
              marginTop: "2px",
              fontSize: "12px",
              fontWeight: 700,
              color: DARK_NAVY,
              opacity: 0.65,
              letterSpacing: "1px",
            }}
          >
            {MONTH_ABBREVIATIONS[cursor.month]}. {cursor.year}
          </div>
        </div>
        <NotebookDoodle />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <button
          type="button"
          aria-label="이전 달"
          onClick={() =>
            setCursor((prev) => {
              const date = new Date(prev.year, prev.month - 1, 1);
              return { year: date.getFullYear(), month: date.getMonth() };
            })
          }
          style={{
            display: "flex",
            border: "none",
            background: "none",
            padding: "8px",
            cursor: "pointer",
            color: "#191f28",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#191f28" }}>
          {cursor.year}년 {cursor.month + 1}월
        </span>
        <button
          type="button"
          aria-label="다음 달"
          onClick={() =>
            setCursor((prev) => {
              const date = new Date(prev.year, prev.month + 1, 1);
              return { year: date.getFullYear(), month: date.getMonth() };
            })
          }
          style={{
            display: "flex",
            border: "none",
            background: "none",
            padding: "8px",
            cursor: "pointer",
            color: "#191f28",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          padding: "0 24px",
        }}
      >
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#8b95a1",
              paddingBottom: "8px",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          rowGap: "6px",
          padding: "0 24px 8px",
        }}
      >
        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} />;
          }
          const isToday = date === today;
          const hasPlan = visitDatesWithPlan.has(date);
          const dayNumber = Number(date.slice(-2));

          return (
            <button
              key={date}
              type="button"
              onClick={() => openAddSheet(date)}
              aria-label={`${formatDisplayDate(date)} 방문 예정 등록`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                padding: "6px 0",
                border: "none",
                background: "none",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "14px",
                  fontSize: "13px",
                  fontWeight: isToday ? 700 : 400,
                  color: isToday ? "#ffffff" : "#191f28",
                  backgroundColor: isToday ? SAGE_GREEN : "transparent",
                }}
              >
                {dayNumber}
              </span>
              <span
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: hasPlan ? CORAL_RED : "transparent",
                }}
              />
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 24px 0",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#191f28" }}>
          다가오는 예정
        </span>
        <Button
          size="small"
          variant="weak"
          color="dark"
          onClick={() => openAddSheet()}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Plus size={14} />
            추가
          </span>
        </Button>
      </div>

      {!isLoaded ? null : sortedVisits.length === 0 ? (
        <Result
          figure={
            <EmptyStateFigure
              icon={<EmptyCalendarIcon size={32} color="#4A6350" />}
            />
          }
          title="아직 계획한 방문이 없어요"
          description={"달력에서 날짜를 눌러\n다음 맛집 방문을 계획해보세요."}
        />
      ) : (
        <div>
          {sortedVisits.map((visit) => (
            <PlannedVisitRow
              key={visit.id}
              visit={visit}
              onEdit={() => openEditSheet(visit)}
              onDelete={() => handleDelete(visit)}
              onMarkVisited={() => onMarkVisited(visit)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
