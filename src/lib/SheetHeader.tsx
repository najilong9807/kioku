import { X } from "lucide-react";
import type { ReactNode } from "react";

// useBottomSheet()의 header 옵션에 넣는 공용 헤더예요. 문자열만 넘기면 h1로
// 감싸 t4 스타일이 적용되지만, 여기서는 그 자리에 우리가 만든 ReactNode를
// 대신 넣어서 제목 오른쪽에 항상 고정된 X 닫기 버튼을 붙여요. 헤더 영역은
// 바텀시트에서 스크롤되는 children과 분리되어 있어서, 내용이 아무리 길어도
// 이 X 버튼은 스크롤 없이 항상 눌러져요.
//
// 기존 h1 스타일(20px/700/#191f28, 좌측 정렬)을 그대로 흉내 내서, 문자열
// header를 쓰던 화면들과 시각적으로 달라 보이지 않도록 했어요.
export function SheetHeader({
  title,
  onClose,
}: {
  title: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        width: "100%",
      }}
    >
      <span
        style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#191f28",
          lineHeight: "29px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        style={{
          flexShrink: 0,
          display: "flex",
          background: "none",
          border: "none",
          padding: "4px",
          margin: "-4px",
          cursor: "pointer",
          color: "#8b95a1",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <X size={22} />
      </button>
    </div>
  );
}
