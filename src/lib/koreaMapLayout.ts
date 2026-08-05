// MapView(지도 화면)에서 시/도 배지를 배치할 때 쓰는 대략적인 상대 좌표예요.
// GPS 좌표나 실제 행정구역 경계 데이터가 아니라, 배경으로 쓰는 손그림 한반도
// 이미지(src/assets/korea-map.png) 위에서 각 시/도가 대략 어느 쪽에 있는지
// (서울/경기는 북서쪽, 강원은 북동쪽, 충청은 중앙, 경상은 남동쪽, 전라는
// 남서쪽, 제주는 남쪽 별도 섬...)만 흉내 낸 "클러스터 위치"예요. 이 손그림은
// 실제 행정구역 경계선이 없는 자유곡선 스타일이라 정확한 좌표를 잡을 수 없어서,
// 이미지의 대략적인 형태만 참고해 배치했어요. korea-map.png의 실제 픽셀
// 크기(440x501) 기준 좌표이고, MapView에서 백분율로 변환해 배지를 절대 위치로
// 올려요.
export interface ProvinceMapPoint {
  province: string;
  x: number;
  y: number;
}

export const PROVINCE_MAP_POINTS: ProvinceMapPoint[] = [
  { province: "서울특별시", x: 139, y: 95 },
  { province: "인천광역시", x: 97, y: 114 },
  { province: "경기도", x: 169, y: 129 },
  { province: "강원특별자치도", x: 299, y: 90 },
  { province: "세종특별자치시", x: 184, y: 204 },
  { province: "충청북도", x: 254, y: 189 },
  { province: "충청남도", x: 144, y: 199 },
  { province: "대전광역시", x: 199, y: 221 },
  { province: "경상북도", x: 333, y: 209 },
  { province: "대구광역시", x: 299, y: 289 },
  { province: "울산광역시", x: 363, y: 313 },
  { province: "경상남도", x: 284, y: 328 },
  { province: "부산광역시", x: 353, y: 353 },
  { province: "전북특별자치도", x: 174, y: 264 },
  { province: "광주광역시", x: 154, y: 318 },
  { province: "전라남도", x: 134, y: 363 },
  { province: "제주특별자치도", x: 132, y: 455 },
];

// 배경 이미지(korea-map.png)의 실제 픽셀 크기예요. 이 좌표계를 기준으로
// PROVINCE_MAP_POINTS를 잡았기 때문에, 이미지 파일이 바뀌면 이 값도 함께
// 맞춰줘야 해요.
export const KOREA_MAP_VIEWBOX_WIDTH = 440;
export const KOREA_MAP_VIEWBOX_HEIGHT = 501;
