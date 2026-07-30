import { Button, List, ListRow, Menu } from "@toss/tds-mobile";
import { useState } from "react";
import {
  DISTRICTS_BY_PROVINCE,
  formatRegionLabel,
  PROVINCES,
} from "./lib/koreanRegions";

// 시/도를 먼저 고르고, 그 시/도의 시/군/구를 이어서 고르는 인라인 드롭다운이에요.
// 바텀시트 안(글쓰기 폼 등)에 넣어도 안전하도록, 또 다른 바텀시트를 열지 않고
// Menu(팝오버) 컴포넌트로만 구현했어요.
//
// value/onChange는 "{시도} {시군구}" 형태의 문자열 하나로 주고받아요. (세종특별자치시처럼
// 시/군/구가 없는 경우엔 시/도 이름만 들어가요.) 예전에 자유 텍스트로 저장된 값은 이
// 두 드롭다운으로 다시 분해되지 않을 수 있어서, 그런 경우엔 현재 값을 그대로 아래에
// 작게 보여줘요.
export function RegionPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [provinceMenuOpen, setProvinceMenuOpen] = useState(false);
  const [districtMenuOpen, setDistrictMenuOpen] = useState(false);

  // value("대전광역시 유성구")를 시/도 + 시/군/구로 되돌려요. 지금 알고 있는 시/도로
  // 시작하지 않으면(예전 자유 텍스트) 아직 아무것도 선택 안 한 상태로 취급해요.
  const matchedProvince = PROVINCES.find(
    (province) => value === province || value.startsWith(`${province} `),
  );
  const selectedProvince = matchedProvince ?? null;
  const selectedDistrict = matchedProvince
    ? value.slice(matchedProvince.length).trim() || null
    : null;
  const isLegacyValue = Boolean(value) && !matchedProvince;

  const districts = selectedProvince
    ? (DISTRICTS_BY_PROVINCE[selectedProvince] ?? [])
    : [];

  const handleSelectProvince = (province: string) => {
    setProvinceMenuOpen(false);
    const provinceDistricts = DISTRICTS_BY_PROVINCE[province] ?? [];
    if (provinceDistricts.length === 0) {
      // 세종특별자치시처럼 시/군/구가 없는 시/도예요.
      onChange(formatRegionLabel(province, null));
      return;
    }
    onChange(province);
    setDistrictMenuOpen(true);
  };

  const handleSelectDistrict = (district: string) => {
    setDistrictMenuOpen(false);
    if (selectedProvince) {
      onChange(formatRegionLabel(selectedProvince, district));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <Menu.Trigger
          open={provinceMenuOpen}
          onOpen={() => setProvinceMenuOpen(true)}
          onClose={() => setProvinceMenuOpen(false)}
          placement="bottom-start"
          dropdown={
            <Menu.Dropdown header={<Menu.Header>시/도 선택</Menu.Header>}>
              {PROVINCES.map((province) => (
                <Menu.DropdownItem
                  key={province}
                  onClick={() => handleSelectProvince(province)}
                >
                  {province}
                </Menu.DropdownItem>
              ))}
            </Menu.Dropdown>
          }
        >
          <Button
            size="small"
            variant="weak"
            color="dark"
            style={{ flex: 1 }}
          >
            {selectedProvince ?? "시/도"} ▾
          </Button>
        </Menu.Trigger>

        <Menu.Trigger
          open={districtMenuOpen}
          onOpen={() => selectedProvince && setDistrictMenuOpen(true)}
          onClose={() => setDistrictMenuOpen(false)}
          placement="bottom-start"
          dropdown={
            <Menu.Dropdown header={<Menu.Header>시/군/구 선택</Menu.Header>}>
              {districts.map((district) => (
                <Menu.DropdownItem
                  key={district}
                  onClick={() => handleSelectDistrict(district)}
                >
                  {district}
                </Menu.DropdownItem>
              ))}
            </Menu.Dropdown>
          }
        >
          <Button
            size="small"
            variant="weak"
            color="dark"
            disabled={districts.length === 0}
            style={{ flex: 1 }}
          >
            {selectedDistrict ?? "시/군/구"} ▾
          </Button>
        </Menu.Trigger>
      </div>

      {isLegacyValue && (
        <div style={{ fontSize: "12px", color: "#8b95a1" }}>
          현재 저장된 동네: {value}
        </div>
      )}
    </div>
  );
}

// 동네 필터 바텀시트 내용이에요. 시/도를 먼저 고르고, 시/군/구가 있는 시/도라면
// 이어서 시/군/구를 고르게 해요(세종특별자치시처럼 시/군/구가 없으면 바로 확정).
// 바텀시트 children은 open() 호출 시점에 고정되기 때문에, 단계 전환은 이 컴포넌트
// 자신의 로컬 상태로 처리하고 최종 선택 결과만 onSelect로 알려줘요.
// "맛집 기록"/"오늘뭐먹" 두 탭의 동네 필터에서 공통으로 써요.
export function RegionFilterSheetContent({
  regionOptions,
  selectedProvince,
  selectedDistrict,
  onSelect,
}: {
  regionOptions: Map<string, string[]>;
  selectedProvince: string | null;
  selectedDistrict: string | null;
  onSelect: (province: string | null, district: string | null) => void;
}) {
  const [draftProvince, setDraftProvince] = useState<string | null>(null);
  const provinces = Array.from(regionOptions.keys());

  if (!draftProvince) {
    return (
      <List>
        <div onClick={() => onSelect(null, null)} style={{ cursor: "pointer" }}>
          <ListRow
            withTouchEffect
            contents={
              <ListRow.Texts
                type="1RowTypeA"
                top={
                  <span
                    style={{ fontWeight: !selectedProvince ? 700 : 400 }}
                  >
                    전체
                  </span>
                }
              />
            }
            right={!selectedProvince ? "✓" : undefined}
          />
        </div>
        {provinces.map((province) => {
          const districts = regionOptions.get(province) ?? [];
          const isSelected = province === selectedProvince && !selectedDistrict;
          return (
            <div
              key={province}
              onClick={() => {
                if (districts.length === 0) {
                  onSelect(province, null);
                } else {
                  setDraftProvince(province);
                }
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
                        {province}
                      </span>
                    }
                  />
                }
                right={isSelected ? "✓" : districts.length > 0 ? "›" : undefined}
              />
            </div>
          );
        })}
      </List>
    );
  }

  const districts = regionOptions.get(draftProvince) ?? [];
  return (
    <div>
      <div
        onClick={() => setDraftProvince(null)}
        style={{
          cursor: "pointer",
          padding: "0 24px 12px",
          color: "#8b95a1",
          fontSize: "14px",
        }}
      >
        ‹ {draftProvince} 다시 선택
      </div>
      <List>
        {districts.map((district) => {
          const isSelected =
            draftProvince === selectedProvince && district === selectedDistrict;
          return (
            <div
              key={district}
              onClick={() => onSelect(draftProvince, district)}
              style={{ cursor: "pointer" }}
            >
              <ListRow
                withTouchEffect
                contents={
                  <ListRow.Texts
                    type="1RowTypeA"
                    top={
                      <span style={{ fontWeight: isSelected ? 700 : 400 }}>
                        {district}
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
    </div>
  );
}
