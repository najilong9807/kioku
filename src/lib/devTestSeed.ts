// TODO: 출시 전 제거 — 이 파일 전체와, ProfileView.tsx에서 이 파일을 참조하는
// import/버튼 블록(같은 "TODO: 출시 전 제거" 주석으로 표시돼 있어요)을 함께
// 지우세요. 개발 중 "맛있는 하루"/"다가올 한 입"/"오늘의 한 입" 세 탭에 테스트
// 데이터를 빠르게 채워 넣기 위한 임시 유틸이에요.
//
// 맛있는 하루/다가올 한 입은 기기 로컬 저장(localStorage)만 건드려서 서버에는
// 아무 영향이 없지만, 오늘의 한 입은 실제 Supabase 서버(thread_posts 테이블)에
// 지금 로그인한 사용자 이름으로 진짜 글이 등록돼요. 출시 전에 이 파일을 지우기 전,
// 테스트하면서 넣은 서버 데이터도 함께 정리해야 해요.

import { fetchProfile } from "./profile";
import {
  oneYearAgoDateInputValue,
  toDateInputValue,
  todayDateInputValue,
  type Category,
  type Restaurant,
} from "../restaurantStorage";
import type { PlannedVisit } from "./plannedVisitStorage";
import {
  createTodayMealPost,
  deleteThreadPost,
  fetchPostsByAuthor,
} from "./threadPosts";

const RESTAURANTS_STORAGE_KEY = "kioku:restaurants";
const PLANNED_VISITS_STORAGE_KEY = "kioku:plannedVisits";

// 오늘부터 offset일만큼 떨어진 날짜를 "YYYY-MM-DD"로 돌려줘요(음수면 과거).
// 버튼을 누르는 그 시점의 "오늘"을 기준으로 매번 새로 계산해요.
function daysFromToday(offset: number): string {
  const date = new Date(todayDateInputValue());
  date.setDate(date.getDate() + offset);
  return toDateInputValue(date);
}

interface RestaurantSeed {
  name: string;
  title?: string;
  category: Category;
  companion?: string;
  weather?: string;
  neighborhood: string;
  menus: string[];
  memo: string;
  rating: number;
  isReservation?: boolean;
  isSpecialDay?: boolean;
}

// 9개 카테고리가 골고루 섞이도록(카테고리당 5~6개) 구성했고, 동네도 여러
// 시/도에 흩어지도록 했어요. 순서 그대로 buildTestRestaurants()에서 날짜를
// 붙여 넣는데, 맨 마지막 항목은 항상 "정확히 1년 전 오늘"로 고정돼서 홈 화면
// 회고 카드도 함께 테스트할 수 있어요.
const RESTAURANT_SEEDS: RestaurantSeed[] = [
  // 한식 (6)
  {
    name: "든든해장국",
    category: "한식",
    neighborhood: "서울특별시 종로구",
    menus: ["설렁탕"],
    memo: "오늘은 컨디션이 안 좋았는데, 뜨끈한 국물 한 그릇 먹으니까 살 것 같았다. 역시 몸이 아플 땐 뜨끈한 게 최고인 것 같다.",
    rating: 5,
  },
  {
    name: "정든식당",
    category: "한식",
    companion: "친구",
    neighborhood: "서울특별시 마포구",
    menus: ["한정식"],
    memo: "친구랑 오랜만에 만나서 여기 왔는데, 웨이팅이 좀 있었지만 기다린 보람이 있었다. 특히 이 집 반찬이 진짜 맛있었다.",
    rating: 4,
  },
  {
    name: "효도한상",
    category: "한식",
    companion: "가족",
    neighborhood: "경기도 수원시",
    menus: ["갈비탕"],
    memo: "오랜만에 부모님 모시고 왔다. 두 분 다 만족하셔서 다행이었고, 특히 반찬이 정갈했다.",
    rating: 5,
    isReservation: true,
  },
  {
    name: "시골밥상집",
    category: "한식",
    companion: "가족",
    neighborhood: "전라남도 순천시",
    menus: ["한정식", "된장찌개"],
    memo: "부모님이랑 여행 가서 들렀는데 반찬 가짓수에 놀랐다. 집밥 그리운 날 또 오고 싶은 곳.",
    rating: 5,
  },
  {
    name: "우리동네국수",
    category: "한식",
    weather: "비",
    neighborhood: "대전광역시 유성구",
    menus: ["잔치국수"],
    memo: "비 오는 날 혼자 후루룩 먹기 딱 좋은 국수. 국물이 슴슴한데 자꾸 생각나는 맛이다.",
    rating: 4,
  },
  {
    name: "옛날불고기",
    category: "한식",
    companion: "친구",
    neighborhood: "경상북도 경주시",
    menus: ["불고기"],
    memo: "여행 중에 유명하다길래 찾아갔는데 웨이팅이 진짜 길었다. 그래도 불맛 제대로 나서 후회는 없었다.",
    rating: 4,
  },

  // 중식 (5)
  {
    name: "얼큰짬뽕집",
    category: "중식",
    companion: "동료",
    neighborhood: "서울특별시 영등포구",
    menus: ["짬뽕"],
    memo: "회사 근처인데 이제야 알았다니 너무 늦게 왔다. 점심시간마다 여기서 살 것 같은 예감이 든다.",
    rating: 4,
  },
  {
    name: "홍콩반점",
    category: "중식",
    companion: "가족",
    neighborhood: "인천광역시 중구",
    menus: ["짜장면", "탕수육"],
    memo: "차이나타운 나들이 겸 온 가족 외식. 애들도 어른도 다 좋아해서 부담 없는 메뉴 같다.",
    rating: 4,
  },
  {
    name: "딤섬하우스",
    category: "중식",
    companion: "연인",
    weather: "",
    neighborhood: "서울특별시 강남구",
    menus: ["딤섬"],
    memo: "기념일이라 예쁜 딤섬 코스로 예약해서 갔다. 하나하나 정성이 느껴져서 만족스러웠다.",
    rating: 5,
    isReservation: true,
    isSpecialDay: true,
  },
  {
    name: "마라향궁",
    category: "중식",
    companion: "친구",
    neighborhood: "경기도 안양시",
    menus: ["마라탕", "마라샹궈"],
    memo: "친구랑 매운맛 챌린지 하듯 시켰는데 둘 다 땀 뻘뻘 흘리면서도 맛있다고 계속 먹었다.",
    rating: 4,
  },
  {
    name: "사천성",
    category: "중식",
    companion: "동료",
    neighborhood: "부산광역시 동래구",
    menus: ["탕수육", "팔보채"],
    memo: "팀 회식으로 방문. 요리가 하나같이 정갈하게 나와서 다음 회식도 여기로 잡자는 얘기가 나왔다.",
    rating: 4,
    isReservation: true,
  },

  // 일식 (6)
  {
    name: "빗소리라멘",
    category: "일식",
    weather: "비",
    neighborhood: "서울특별시 서대문구",
    menus: ["라멘"],
    memo: "비 오는 날엔 역시 따뜻한 국물이지. 창밖으로 비 내리는 거 보면서 먹으니까 감성 폭발이었다.",
    rating: 5,
  },
  {
    name: "스시장인",
    category: "일식",
    companion: "친구",
    neighborhood: "부산광역시 해운대구",
    menus: ["오마카세"],
    memo: "친구가 극찬해서 기대 반 의심 반으로 왔는데, 기대 이상이었다. 특히 메인 메뉴가 인상적이었다.",
    rating: 5,
  },
  {
    name: "정성돈카츠",
    category: "일식",
    neighborhood: "서울특별시 관악구",
    menus: ["돈카츠"],
    memo: "혼밥하기 좋은 조용한 가게. 튀김옷이 두껍지 않고 바삭해서 계속 손이 갔다.",
    rating: 4,
  },
  {
    name: "우동한그릇",
    category: "일식",
    companion: "친구",
    neighborhood: "강원특별자치도 속초시",
    menus: ["우동"],
    memo: "여행 마지막 날 배 든든하게 채우고 가려고 들렀다. 면이 쫄깃해서 국물까지 다 비웠다.",
    rating: 4,
  },
  {
    name: "이자카야스미",
    category: "일식",
    companion: "동료",
    neighborhood: "서울특별시 용산구",
    menus: ["꼬치구이", "사케"],
    memo: "회식으로 갔는데 안주가 다채로워서 부서 사람들 취향 다 맞추기 딱 좋았다.",
    rating: 4,
  },
  {
    name: "오마카세하루",
    category: "일식",
    companion: "연인",
    neighborhood: "서울특별시 서초구",
    menus: ["오마카세"],
    memo: "기념일 맞아서 큰맘 먹고 예약했다. 코스 순서마다 설명도 자세해서 특별한 하루가 됐다.",
    rating: 5,
    isReservation: true,
    isSpecialDay: true,
  },

  // 양식 (6)
  {
    name: "라뜰리에",
    title: "생일 기념 저녁",
    category: "양식",
    companion: "연인",
    neighborhood: "서울특별시 용산구",
    menus: ["스테이크"],
    memo: "생일 기념으로 큰맘 먹고 왔는데, 가격은 좀 있어도 서비스랑 분위기가 완전 만족스러웠다.",
    rating: 4,
    isReservation: true,
    isSpecialDay: true,
  },
  {
    name: "파스타공방",
    category: "양식",
    companion: "친구",
    neighborhood: "경기도 성남시",
    menus: ["오일파스타"],
    memo: "친구랑 근처 지나가다 즉흥으로 들어갔는데 면 삶은 정도가 딱 좋았다. 재방문 확정.",
    rating: 4,
  },
  {
    name: "스테이크하우스본",
    category: "양식",
    companion: "가족",
    neighborhood: "서울특별시 강남구",
    menus: ["스테이크"],
    memo: "부모님 결혼기념일 축하드리려고 예약해서 갔다. 굽기 조절이 완벽해서 다들 만족하셨다.",
    rating: 5,
    isReservation: true,
    isSpecialDay: true,
  },
  {
    name: "브런치가든",
    category: "양식",
    companion: "연인",
    neighborhood: "제주특별자치도 제주시",
    menus: ["브런치"],
    memo: "제주 여행 첫날 아침으로 딱이었다. 테라스 자리에서 바다 보면서 먹으니 여행 온 게 실감 났다.",
    rating: 5,
  },
  {
    name: "화덕피자연구소",
    category: "양식",
    companion: "친구",
    neighborhood: "서울특별시 마포구",
    menus: ["화덕피자"],
    memo: "도우가 얇고 불맛이 살아 있어서 한 판 순삭했다. 다음엔 다른 맛도 먹어보고 싶다.",
    rating: 4,
  },
  {
    name: "리조또키친",
    category: "양식",
    neighborhood: "대구광역시 수성구",
    menus: ["리조또"],
    memo: "혼자 조용히 먹기 좋은 작은 가게. 크림리조또가 느끼하지 않고 담백했다.",
    rating: 4,
  },

  // 분식 (5)
  {
    name: "산골밥상",
    title: "여행 중 우연히",
    category: "분식",
    neighborhood: "강원도 강릉시",
    menus: ["시래기밥"],
    memo: "혼자 훌쩍 떠난 여행에서 우연히 발견한 곳. 간판도 허름한데 맛은 진짜였다. 다음에 또 이 동네 오면 꼭 다시 와야지.",
    rating: 5,
  },
  {
    name: "떡볶이명가",
    category: "분식",
    companion: "친구",
    neighborhood: "서울특별시 노원구",
    menus: ["떡볶이", "튀김"],
    memo: "학교 다닐 때부터 다니던 곳인데 여전히 그 맛 그대로였다. 친구랑 추억 얘기하며 한 접시 뚝딱.",
    rating: 4,
  },
  {
    name: "왕만두집",
    category: "분식",
    neighborhood: "경기도 부천시",
    menus: ["고기만두"],
    memo: "혼자 출출할 때 찾는 단골집. 만두피가 얇고 육즙이 많아서 몇 개든 들어간다.",
    rating: 4,
  },
  {
    name: "김밥천국은아니지만",
    category: "분식",
    companion: "동료",
    neighborhood: "서울특별시 은평구",
    menus: ["김밥", "라면"],
    memo: "이름은 장난스러운데 맛은 진지하다. 점심시간에 동료랑 빠르게 먹기 좋았다.",
    rating: 3,
  },
  {
    name: "튀김소보로",
    category: "분식",
    companion: "가족",
    neighborhood: "부산광역시 중구",
    menus: ["모듬튀김"],
    memo: "여행 중 시장 구경하다 발견한 튀김집. 가족 다 같이 서서 하나씩 집어먹는 재미가 있었다.",
    rating: 4,
  },

  // 패스트푸드 (5)
  {
    name: "수제버거스탠드",
    category: "패스트푸드",
    companion: "친구",
    neighborhood: "서울특별시 성동구",
    menus: ["수제버거"],
    memo: "패티가 두툼해서 한 입에 다 안 들어갈 정도였다. 친구랑 사진부터 찍고 먹었다.",
    rating: 4,
  },
  {
    name: "텍사스핫도그",
    category: "패스트푸드",
    neighborhood: "경기도 고양시",
    menus: ["핫도그"],
    memo: "혼자 산책하다 냄새에 홀려서 하나 사 먹었다. 치즈가 쭉 늘어나는 게 보는 재미도 있었다.",
    rating: 3,
  },
  {
    name: "프라이드킹",
    category: "패스트푸드",
    companion: "가족",
    neighborhood: "광주광역시 서구",
    menus: ["후라이드치킨"],
    memo: "동생 생일이라 온 가족이 모여서 치킨 파티. 다들 배부르게 먹고 케이크까지 완벽한 하루였다.",
    rating: 4,
    isSpecialDay: true,
  },
  {
    name: "멕시칸부리또",
    category: "패스트푸드",
    companion: "친구",
    neighborhood: "서울특별시 마포구",
    menus: ["부리또"],
    memo: "친구랑 재료 골라 담는 재미로 자주 가는 곳. 소스 조합 바꿔가며 먹는 게 은근 중독성 있다.",
    rating: 4,
  },
  {
    name: "샌드위치정거장",
    category: "패스트푸드",
    neighborhood: "인천광역시 연수구",
    menus: ["샌드위치"],
    memo: "출근길에 포장해서 자리에서 먹었다. 야채가 신선해서 아침부터 든든했다.",
    rating: 3,
  },

  // 카페·디저트 (6)
  {
    name: "산책카페",
    category: "카페·디저트",
    neighborhood: "경기도 성남시",
    menus: ["아인슈페너"],
    memo: "동네 산책하다 우연히 들어간 곳인데 완전 대박이었음. 왜 이제야 발견했지 싶을 정도로 좋았다.",
    rating: 5,
  },
  {
    name: "브런치말고카페",
    category: "카페·디저트",
    neighborhood: "서울특별시 종로구",
    menus: ["크루아상", "아메리카노"],
    memo: "출근 전 혼자 들러서 크루아상 하나. 조용한 아침 루틴으로 딱 좋은 곳이다.",
    rating: 4,
  },
  {
    name: "베이커리소소",
    category: "카페·디저트",
    companion: "가족",
    neighborhood: "경상남도 창원시",
    menus: ["식빵"],
    memo: "가족이랑 장 보러 갔다가 들른 빵집. 갓 나온 식빵 냄새에 홀려서 두 개나 샀다.",
    rating: 4,
  },
  {
    name: "빙수전문점",
    category: "카페·디저트",
    companion: "친구",
    weather: "더움",
    neighborhood: "대전광역시 서구",
    menus: ["팥빙수"],
    memo: "너무 더운 날 친구랑 급하게 찾아간 빙수집. 얼음이 눈처럼 고와서 순삭했다.",
    rating: 4,
  },
  {
    name: "로스터리카페",
    category: "카페·디저트",
    neighborhood: "서울특별시 마포구",
    menus: ["드립커피"],
    memo: "혼자 책 읽으러 자주 가는 곳. 원두 향이 진해서 자리에 앉기만 해도 기분이 좋아진다.",
    rating: 5,
  },
  {
    name: "마카롱공방",
    category: "카페·디저트",
    companion: "연인",
    neighborhood: "제주특별자치도 서귀포시",
    menus: ["마카롱"],
    memo: "여행 기념품 삼아 마카롱 한 상자 포장. 색깔별로 맛이 다 달라서 고르는 재미가 있었다.",
    rating: 4,
  },

  // 술집 (6)
  {
    name: "밤참포차",
    category: "술집",
    neighborhood: "서울특별시 동작구",
    menus: ["닭꼬치", "소주"],
    memo: "야근하고 늦은 밤에 혼자 먹으러 왔는데, 이 시간에도 이렇게 붐빌 줄이야. 그만큼 맛있다는 뜻이겠지.",
    rating: 4,
  },
  {
    name: "이자카야밤",
    category: "술집",
    companion: "친구",
    neighborhood: "서울특별시 마포구",
    menus: ["사케", "가라아게"],
    memo: "친구랑 오랜만에 술 한잔. 사케 종류가 다양해서 골라 마시는 재미가 있었다.",
    rating: 4,
  },
  {
    name: "곱창의밤",
    category: "술집",
    companion: "동료",
    neighborhood: "대구광역시 중구",
    menus: ["곱창", "소주"],
    memo: "회식 2차로 간 곱창집. 불판 위에서 지글지글 굽는 냄새에 다들 말이 없어졌다.",
    rating: 4,
  },
  {
    name: "와인바소로",
    category: "술집",
    companion: "연인",
    neighborhood: "서울특별시 강남구",
    menus: ["와인", "치즈플레이트"],
    memo: "기념일이라 조용한 와인바로 예약. 잔잔한 음악에 대화만으로도 시간 가는 줄 몰랐다.",
    rating: 5,
    isReservation: true,
    isSpecialDay: true,
  },
  {
    name: "요리주점정담",
    category: "술집",
    companion: "친구",
    neighborhood: "경기도 수원시",
    menus: ["안주모둠"],
    memo: "안주 종류가 많아서 이것저것 시켜 나눠 먹기 좋았다. 다음 모임 장소도 여기로 정했다.",
    rating: 4,
  },
  {
    name: "전통주점",
    category: "술집",
    companion: "가족",
    neighborhood: "전북특별자치도 전주시",
    menus: ["막걸리", "파전"],
    memo: "여행 중 부모님이랑 막걸리 한잔. 파전 부치는 냄새가 여행 감성을 더해줬다.",
    rating: 4,
  },

  // 기타 (5)
  {
    name: "푸드트럭야시장",
    category: "기타",
    companion: "친구",
    neighborhood: "서울특별시 영등포구",
    menus: ["길거리음식 모둠"],
    memo: "야시장 나들이로 이것저것 조금씩 사서 나눠 먹었다. 다 맛있어서 뭘 먼저 먹을지 행복한 고민이었다.",
    rating: 4,
  },
  {
    name: "브런치뷔페",
    category: "기타",
    companion: "가족",
    neighborhood: "서울특별시 송파구",
    menus: ["뷔페"],
    memo: "어머니 생신이라 온 가족이 모여서 예약하고 갔다. 메뉴가 다양해서 다들 원하는 걸 골라 먹었다.",
    rating: 5,
    isReservation: true,
    isSpecialDay: true,
  },
  {
    name: "인도커리하우스",
    category: "기타",
    neighborhood: "서울특별시 용산구",
    menus: ["버터커리", "난"],
    memo: "혼자 새로운 맛에 도전해보고 싶어서 갔다. 난에 커리 찍어 먹는 재미에 계속 시켰다.",
    rating: 4,
  },
  {
    name: "베트남쌀국수",
    category: "기타",
    companion: "동료",
    neighborhood: "경기도 안산시",
    menus: ["쌀국수"],
    memo: "점심시간에 동료랑 가볍게 먹으러 갔다. 국물이 깔끔해서 부담 없이 잘 넘어갔다.",
    rating: 4,
  },
  {
    name: "채식레스토랑",
    category: "기타",
    companion: "친구",
    neighborhood: "서울특별시 서초구",
    menus: ["비건플레이트"],
    memo: "채식하는 친구 따라 처음 가본 곳. 고기 없이도 든든하게 먹을 수 있어서 신기했다.",
    rating: 4,
  },
];

function buildTestRestaurants(): Restaurant[] {
  return RESTAURANT_SEEDS.map((seed, index) => ({
    id: `dev-seed-restaurant-${index + 1}`,
    name: seed.name,
    title: seed.title ?? "",
    category: seed.category,
    companion: seed.companion ?? "",
    weather: seed.weather ?? "",
    neighborhood: seed.neighborhood,
    menus: seed.menus,
    memo: seed.memo,
    rating: seed.rating,
    // 마지막 항목은 "1년 전 오늘" 회고 카드를 테스트할 수 있도록 정확히
    // 1년 전 같은 날짜로 고정하고, 나머지는 최근~1년 전 사이로 흩어놓아요.
    visitDate:
      index === RESTAURANT_SEEDS.length - 1
        ? oneYearAgoDateInputValue()
        : daysFromToday(-(index * 7 + 2)),
    photos: [],
    isReservation: seed.isReservation ?? false,
    isSpecialDay: seed.isSpecialDay ?? false,
  }));
}

interface PlannedVisitSeed {
  name: string;
  memo: string;
}

// 전부 "오늘 이후" 날짜로만 구성해서 D-day 카운트다운과 캘린더 화면을
// 폭넓게(오늘부터 약 8개월 뒤까지) 테스트할 수 있도록 했어요.
const PLANNED_VISIT_SEEDS: PlannedVisitSeed[] = [
  { name: "베이글맛집 오픈런", memo: "오픈런 도전! 아침 일찍 가보기로." },
  { name: "기념일 오마카세", memo: "특별한 날 기념으로 예약해둔 스시 오마카세." },
  { name: "회사앞 칼국수", memo: "점심시간에 팀원들이랑 가기로 한 곳." },
  { name: "제주 흑돼지 맛집", memo: "제주 여행 가서 꼭 들르기로 한 곳." },
  { name: "동창회 삼겹살집", memo: "오랜만에 동창들 모여서 가기로 한 곳." },
  { name: "인스타 찜한 파스타집", memo: "SNS에서 보고 찜해둔 파스타집." },
  { name: "부모님이랑 갈비집", memo: "부모님 모시고 가기로 약속한 날." },
  { name: "가로수길 브런치", memo: "친구 생일 기념 브런치 약속." },
  { name: "신상 라멘집", memo: "오픈한 지 얼마 안 됐다는데 벌써 줄이 길다던 곳." },
  { name: "소개팅 예약 레스토랑", memo: "떨리는 마음으로 미리 예약해둔 곳." },
  { name: "친구 생일 치킨집", memo: "생일 파티 겸 예약해둔 치킨집." },
  { name: "야구장 앞 맥주집", memo: "직관 끝나고 뒤풀이하기로 한 곳." },
  { name: "한강뷰 카페", memo: "날씨 좋을 때 가려고 아껴둔 곳." },
  { name: "조카 돌잔치 뷔페", memo: "조카 돌잔치라 온 가족이 모이기로 한 날." },
  { name: "동료 환송회 이자카야", memo: "퇴사하는 동료 배웅하러 가기로 한 곳." },
  { name: "벚꽃길 브런치집", memo: "벚꽃 시즌 맞춰서 예약해둔 브런치집." },
  { name: "새로 생긴 스시집", memo: "예약 오픈하자마자 바로 잡은 자리." },
  { name: "산책 후 냉면집", memo: "가볍게 걷고 나서 시원한 냉면 먹기로." },
  { name: "부부동반 모임 한정식집", memo: "오랜만에 부부동반으로 모이기로 한 곳." },
  { name: "졸업식 축하 레스토랑", memo: "졸업 축하 겸 예약해둔 곳." },
  { name: "캠핑 가는 길 국밥집", memo: "캠핑장 가는 길에 들르기로 미리 봐둔 곳." },
  { name: "프러포즈 예정 레스토랑", memo: "떨리지만 미리 예약해둔 그 장소." },
  { name: "동네 신상 카페", memo: "리뉴얼 오픈했다는 소식 듣고 가보기로." },
  { name: "친구 이사 집들이 맛집", memo: "집들이 선물 사서 가기로 한 날." },
  { name: "여름휴가 첫날 맛집", memo: "휴가 시작하자마자 가기로 찜해둔 곳." },
  { name: "팀 프로젝트 회식", memo: "프로젝트 끝나고 다 같이 가기로 한 곳." },
  { name: "결혼기념일 파인다이닝", memo: "미리 예약해둔 결혼기념일 저녁." },
  { name: "가족 여행 중 맛집", memo: "여행 일정에 넣어둔 현지 맛집." },
  { name: "동생 취업 축하 스테이크집", memo: "취업 축하 겸 크게 쏘기로 한 곳." },
  { name: "가을 단풍놀이 맛집", memo: "단풍 보러 가는 길에 들르기로 한 곳." },
  { name: "친구 생일 파티룸 근처 케이크집", memo: "케이크 미리 예약해둔 곳." },
  { name: "부모님 생신 한정식", memo: "생신상 차려드리려고 예약한 곳." },
  { name: "연휴 첫날 브런치", memo: "긴 연휴 시작을 여유롭게 즐기려고." },
  { name: "회사 워크숍 근처 맛집", memo: "워크숍 저녁 회식으로 잡아둔 곳." },
  { name: "겨울 붕어빵 골목", memo: "날 추워지면 꼭 가려고 아껴둔 골목." },
  { name: "동아리 정기모임 술집", memo: "오랜만에 동아리 사람들 모이는 날." },
  { name: "고등학교 친구 결혼 축하 자리", memo: "결혼 축하해주러 가기로 한 모임." },
  { name: "새해 첫 해돋이 맛집", memo: "해돋이 보고 나서 아침 먹기로 한 곳." },
  { name: "이직 환영회 고깃집", memo: "새 팀원 환영하러 가기로 한 곳." },
  { name: "연말 파인다이닝", memo: "미리 예약해둔 연말 기념 파인다이닝." },
  { name: "부모님 칠순잔치 연회장", memo: "온 가족이 모이는 큰 잔치가 있는 날." },
  { name: "밸런타인데이 레스토랑", memo: "미리 예약해야 자리 잡을 수 있는 곳." },
  { name: "봄나들이 피크닉 맛집", memo: "포장해서 피크닉 갈 때 들르기로 한 곳." },
  { name: "친구 개업식 축하 자리", memo: "개업 축하하러 가기로 약속한 날." },
  { name: "설 연휴 명절 음식점", memo: "귀성길에 온 가족이 들르기로 한 곳." },
  { name: "여름 보양식집", memo: "복날 맞춰 예약해둔 삼계탕집." },
  { name: "가족 여름휴가 마지막 만찬", memo: "휴가 마무리로 근사하게 먹기로 한 곳." },
  { name: "동생 생일 파티 룸카페", memo: "동생 생일 파티 예약해둔 곳." },
  { name: "출산 축하 미역국집", memo: "친구 출산 축하하러 가기로 한 곳." },
  { name: "1주년 기념 레스토랑", memo: "1년 전 처음 만난 날을 기념해서 예약." },
];

function buildTestPlannedVisits(): PlannedVisit[] {
  return PLANNED_VISIT_SEEDS.map((seed, index) => ({
    id: `dev-seed-visit-${index + 1}`,
    name: seed.name,
    memo: seed.memo,
    visitDate: daysFromToday(index * 5),
  }));
}

interface TestTodayMealPost {
  content: string;
  neighborhood: string;
  isReservation: boolean;
}

function buildTestTodayMealPosts(): TestTodayMealPost[] {
  return [
    {
      content:
        "오늘 점심은 회사 앞 국밥집! 국물이 진해서 해장까지 됐다. 역시 국밥은 배신을 안 함.",
      neighborhood: "서울특별시 중구",
      isReservation: false,
    },
    {
      content:
        "친구랑 강릉 여행 가서 초당순두부 먹었는데 진짜 고소했다. 다음엔 가족이랑 또 오고 싶다.",
      neighborhood: "강원특별자치도 강릉시",
      isReservation: false,
    },
    {
      content:
        "생일이라 미리 예약해둔 오마카세 다녀왔어요. 코스 하나하나 다 좋았는데 특히 마지막 디저트가 인상적이었어요.",
      neighborhood: "서울특별시 강남구",
      isReservation: true,
    },
    {
      content: "비 오는 날엔 역시 파전에 막걸리지. 동네 포차에서 소소하게 한 잔.",
      neighborhood: "부산광역시 해운대구",
      isReservation: false,
    },
    {
      content:
        "새로 생긴 베이글 가게 오픈런 성공! 웨이팅 30분이었는데 먹어보니 이해감.",
      neighborhood: "경기도 성남시",
      isReservation: false,
    },
    {
      content:
        "회사 동료들이랑 팀 회식으로 삼겹살집 다녀왔어요. 다들 만족해서 다음 회식도 여기로 예약하려고요.",
      neighborhood: "인천광역시 연수구",
      isReservation: true,
    },
    {
      content: "혼자 조용히 갈 만한 라멘집 찾았다. 국물이 진짜 진했음.",
      neighborhood: "서울특별시 마포구",
      isReservation: false,
    },
    {
      content:
        "제주 여행 마지막 날, 흑돼지 구워 먹고 왔어요. 여행 마무리로 완벽했습니다.",
      neighborhood: "제주특별자치도 제주시",
      isReservation: false,
    },
  ];
}

// "맛있는 하루"/"다가올 한 입" 로컬 저장 데이터를 테스트용 10개씩으로 덮어쓰고,
// 지금 로그인한 사용자(userHash)의 프로필이 있으면 "오늘의 한 입"에도 실제
// Supabase 글을 채워 넣어요(profile이 없으면, 즉 아직 닉네임을 설정하지 않았으면
// 서버 쪽은 건드리지 않고 로컬 데이터만 채워요).
//
// 여러 번 눌러도 오늘의 한 입 글이 쌓이지 않도록, 새로 넣기 전에 지금 이 함수가
// 만드는 것과 정확히 같은 내용의 "내 글"을 먼저 지워요(로컬 데이터처럼 매번
// 정해진 id로 덮어쓸 수 없어서, 내용 일치로 이전 시딩 결과를 찾아요). 확인
// 다이얼로그는 화면(ProfileView.tsx)에서 먼저 띄우고, 사용자가 계속하기를
// 눌렀을 때만 이 함수를 호출해요.
export async function applyDevTestSeed(
  userHash: string | null,
): Promise<{ seededPostCount: number; failedPostCount: number }> {
  localStorage.setItem(
    RESTAURANTS_STORAGE_KEY,
    JSON.stringify(buildTestRestaurants()),
  );
  localStorage.setItem(
    PLANNED_VISITS_STORAGE_KEY,
    JSON.stringify(buildTestPlannedVisits()),
  );

  let seededPostCount = 0;
  let failedPostCount = 0;

  if (userHash) {
    const profile = await fetchProfile(userHash);
    if (profile) {
      const testPosts = buildTestTodayMealPosts();
      const testContents = new Set(testPosts.map((post) => post.content));

      const existingPosts = await fetchPostsByAuthor(profile.id);
      const stalePosts = existingPosts.filter((post) =>
        testContents.has(post.content),
      );
      for (const stalePost of stalePosts) {
        await deleteThreadPost(stalePost.id);
      }

      for (const testPost of testPosts) {
        const success = await createTodayMealPost(
          profile.id,
          testPost.content,
          null,
          testPost.neighborhood,
          testPost.isReservation,
        );
        if (success) {
          seededPostCount++;
        } else {
          failedPostCount++;
        }
      }
    }
  }

  return { seededPostCount, failedPostCount };
}
