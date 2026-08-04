// MapView(지도 화면)에서 시/도 배지를 배치할 때 쓰는 대략적인 상대 좌표예요.
// GPS 좌표나 실제 행정구역 경계 데이터가 아니라, 실제 한반도 지도에서 각 시/도가
// 대략 어느 쪽에 있는지(서울/경기는 서북쪽, 강원은 동북쪽, 부산/울산은 동남쪽,
// 제주는 남쪽 별도 섬...)만 흉내 낸 "클러스터 위치"예요. MapView.tsx의 SVG
// viewBox(0 0 300 400) 기준 좌표이고, 컴포넌트에서 백분율로 변환해 배지를
// 절대 위치로 올려요.
export interface ProvinceMapPoint {
  province: string;
  x: number;
  y: number;
}

export const PROVINCE_MAP_POINTS: ProvinceMapPoint[] = [
  { province: "서울특별시", x: 140, y: 92 },
  { province: "인천광역시", x: 95, y: 100 },
  { province: "경기도", x: 150, y: 130 },
  { province: "강원특별자치도", x: 210, y: 90 },
  { province: "세종특별자치시", x: 148, y: 200 },
  { province: "충청북도", x: 190, y: 195 },
  { province: "충청남도", x: 115, y: 210 },
  { province: "대전광역시", x: 160, y: 220 },
  { province: "경상북도", x: 225, y: 190 },
  { province: "대구광역시", x: 210, y: 240 },
  { province: "전북특별자치도", x: 130, y: 255 },
  { province: "울산광역시", x: 245, y: 250 },
  { province: "광주광역시", x: 110, y: 285 },
  { province: "경상남도", x: 205, y: 280 },
  { province: "부산광역시", x: 240, y: 285 },
  { province: "전라남도", x: 105, y: 315 },
  { province: "제주특별자치도", x: 95, y: 368 },
];

export const KOREA_MAP_VIEWBOX_WIDTH = 300;
export const KOREA_MAP_VIEWBOX_HEIGHT = 400;
