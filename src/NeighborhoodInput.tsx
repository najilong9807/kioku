import { Button, TextField } from "@toss/tds-mobile";

// 완전 자유 텍스트 입력 + 최근/기존에 쓰인 동네 이름을 칩으로 눌러서 바로 채울 수 있는
// 입력창이에요. RestaurantForm(맛집 기록)과 PostForm(오늘뭐먹)에서 동일하게 사용해요.
export function NeighborhoodInput({
  value,
  onChange,
  suggestions,
}: {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {suggestions.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {suggestions.map((neighborhood) => (
            <Button
              key={neighborhood}
              size="small"
              variant="weak"
              color="dark"
              style={{ flexShrink: 0 }}
              onClick={() => onChange(neighborhood)}
            >
              {neighborhood}
            </Button>
          ))}
        </div>
      )}
      <TextField
        variant="box"
        placeholder="예) 역삼동"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
