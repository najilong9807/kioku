// 대한민국 시/도 - 시/군/구 행정구역 데이터예요. 동/읍/면 단위는 다루지 않아요.
// 2024년 12월 기준 데이터로, 강원특별자치도(2023.6~)/전북특별자치도(2024.1~) 개편과
// 대구광역시 군위군 편입(2023.7~)이 반영되어 있어요.
// 출처: https://github.com/cosmosfarm/korea-administrative-district (version 20241209)
export const DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
  서울특별시: [
    "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구", "성북구",
    "강북구", "도봉구", "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구",
    "구로구", "금천구", "영등포구", "동작구", "관악구", "서초구", "강남구", "송파구",
    "강동구",
  ],
  부산광역시: [
    "중구", "서구", "동구", "영도구", "부산진구", "동래구", "남구", "북구", "강서구",
    "해운대구", "사하구", "금정구", "연제구", "수영구", "사상구", "기장군",
  ],
  인천광역시: [
    "중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구",
    "강화군", "옹진군",
  ],
  대구광역시: [
    "중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "달성군", "군위군",
  ],
  광주광역시: ["동구", "서구", "남구", "북구", "광산구"],
  대전광역시: ["동구", "중구", "서구", "유성구", "대덕구"],
  울산광역시: ["중구", "남구", "동구", "북구", "울주군"],
  세종특별자치시: [],
  경기도: [
    "가평군", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시",
    "남양주시", "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시",
    "안양시", "양주시", "양평군", "여주시", "연천군", "오산시", "용인시", "의왕시",
    "의정부시", "이천시", "파주시", "평택시", "포천시", "하남시", "화성시",
  ],
  강원특별자치도: [
    "원주시", "춘천시", "강릉시", "동해시", "속초시", "삼척시", "홍천군", "태백시",
    "철원군", "횡성군", "평창군", "영월군", "정선군", "인제군", "고성군", "양양군",
    "화천군", "양구군",
  ],
  충청북도: [
    "청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군",
    "괴산군", "음성군", "단양군",
  ],
  충청남도: [
    "천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시",
    "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군",
  ],
  경상북도: [
    "포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시",
    "문경시", "경산시", "의성군", "청송군", "영양군", "영덕군", "청도군", "고령군",
    "성주군", "칠곡군", "예천군", "봉화군", "울진군", "울릉군",
  ],
  경상남도: [
    "창원시", "김해시", "진주시", "양산시", "거제시", "통영시", "사천시", "밀양시",
    "함안군", "거창군", "창녕군", "고성군", "하동군", "합천군", "남해군", "함양군",
    "산청군", "의령군",
  ],
  전북특별자치도: [
    "전주시", "익산시", "군산시", "정읍시", "완주군", "김제시", "남원시", "고창군",
    "부안군", "임실군", "순창군", "진안군", "장수군", "무주군",
  ],
  전라남도: [
    "여수시", "순천시", "목포시", "광양시", "나주시", "무안군", "해남군", "고흥군",
    "화순군", "영암군", "영광군", "완도군", "담양군", "장성군", "보성군", "신안군",
    "장흥군", "강진군", "함평군", "진도군", "곡성군", "구례군",
  ],
  제주특별자치도: ["제주시", "서귀포시"],
};

// 시/도는 위 데이터 객체의 키 순서(공식 행정구역 코드 순)를 그대로 써요.
export const PROVINCES: string[] = Object.keys(DISTRICTS_BY_PROVINCE);

// 시/도 이름에서 접미사를 뗀 짧은 이름이에요. (예: "서울특별시" -> "서울")
// 예전에 자유 텍스트로 저장된 동네("서울시 강남구" 등)와 새 구조화 값을 느슨하게
// 매칭할 때 써요.
export function getProvinceShortName(province: string): string {
  return province
    .replace(/특별자치시$/, "")
    .replace(/특별자치도$/, "")
    .replace(/특별시$/, "")
    .replace(/광역시$/, "")
    .replace(/도$/, "");
}

// 시/도 + 시/군/구를 하나의 문자열로 합쳐요. 세종특별자치시처럼 시/군/구가 없는
// 경우엔 시/도 이름만 반환해요.
export function formatRegionLabel(
  province: string,
  district: string | null,
): string {
  return district ? `${province} ${district}` : province;
}

// 기존에 저장된 동네 문자열(neighborhood)이 특정 시/도-시/군/구에 해당하는지 느슨하게
// 판단해요. 새 구조화 값("대전광역시 유성구")은 정확히 일치하고, 예전 자유 텍스트
// 값("대전 유성구", "대전시 유성구" 등)은 시/군/구 이름과 시/도 짧은 이름이 모두
// 포함되어 있으면 매칭돼요. (짧은 이름까지 함께 확인해서, 같은 시/군/구 이름이
// 여러 시/도에 있는 경우 - 예: 중구, 서구 등 - 다른 지역과 섞이지 않게 해요.)
export function matchesRegion(
  neighborhood: string | null | undefined,
  province: string,
  district: string,
): boolean {
  if (!neighborhood) {
    return false;
  }
  if (neighborhood === formatRegionLabel(province, district || null)) {
    return true;
  }
  if (!district) {
    return neighborhood.includes(getProvinceShortName(province));
  }
  return (
    neighborhood.includes(district) &&
    neighborhood.includes(getProvinceShortName(province))
  );
}

// 실제로 존재하는 동네 문자열들(neighborhoods) 중에 매칭되는 시/도-시/군/구만
// 골라서 필터 옵션으로 써요. 시/군/구가 없는 시/도(세종특별자치시)는 빈 배열로 들어가요.
// 반환되는 Map은 PROVINCES/DISTRICTS_BY_PROVINCE 순서를 그대로 따라요.
export function buildRegionFilterOptions(
  neighborhoods: (string | null | undefined)[],
): Map<string, string[]> {
  const result = new Map<string, string[]>();

  for (const province of PROVINCES) {
    const districts = DISTRICTS_BY_PROVINCE[province];
    if (districts.length === 0) {
      if (neighborhoods.some((n) => matchesRegion(n, province, ""))) {
        result.set(province, []);
      }
      continue;
    }

    const matchedDistricts = districts.filter((district) =>
      neighborhoods.some((n) => matchesRegion(n, province, district)),
    );
    if (matchedDistricts.length > 0) {
      result.set(province, matchedDistricts);
    }
  }

  return result;
}
