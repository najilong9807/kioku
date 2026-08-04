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
  toDateInputValue,
  todayDateInputValue,
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

function buildTestRestaurants(): Restaurant[] {
  return [
    {
      id: "dev-seed-restaurant-1",
      name: "든든해장국",
      title: "",
      category: "한식",
      companion: "",
      weather: "",
      neighborhood: "서울특별시 종로구",
      menus: ["설렁탕"],
      memo: "오늘은 컨디션이 안 좋았는데, 뜨끈한 국물 한 그릇 먹으니까 살 것 같았다. 역시 몸이 아플 땐 뜨끈한 게 최고인 것 같다.",
      rating: 5,
      visitDate: daysFromToday(-19),
      photos: [],
      isReservation: false,
      isSpecialDay: false,
    },
    {
      id: "dev-seed-restaurant-2",
      name: "정든식당",
      title: "",
      category: "한식",
      companion: "친구",
      weather: "",
      neighborhood: "서울특별시 마포구",
      menus: ["한정식"],
      memo: "친구랑 오랜만에 만나서 여기 왔는데, 웨이팅이 좀 있었지만 기다린 보람이 있었다. 특히 이 집 반찬이 진짜 맛있었다.",
      rating: 4,
      visitDate: daysFromToday(-16),
      photos: [],
      isReservation: false,
      isSpecialDay: false,
    },
    {
      id: "dev-seed-restaurant-3",
      name: "산골밥상",
      title: "여행 중 우연히",
      category: "분식",
      companion: "",
      weather: "",
      neighborhood: "강원도 강릉시",
      menus: ["시래기밥"],
      memo: "혼자 훌쩍 떠난 여행에서 우연히 발견한 곳. 간판도 허름한데 맛은 진짜였다. 다음에 또 이 동네 오면 꼭 다시 와야지.",
      rating: 5,
      visitDate: daysFromToday(-34),
      photos: [],
      isReservation: false,
      isSpecialDay: false,
    },
    {
      id: "dev-seed-restaurant-4",
      name: "얼큰짬뽕집",
      title: "",
      category: "중식",
      companion: "동료",
      weather: "",
      neighborhood: "서울특별시 영등포구",
      menus: ["짬뽕"],
      memo: "회사 근처인데 이제야 알았다니 너무 늦게 왔다. 점심시간마다 여기서 살 것 같은 예감이 든다.",
      rating: 4,
      visitDate: daysFromToday(-9),
      photos: [],
      isReservation: false,
      isSpecialDay: false,
    },
    {
      id: "dev-seed-restaurant-5",
      name: "빗소리라멘",
      title: "",
      category: "일식",
      companion: "",
      weather: "비",
      neighborhood: "서울특별시 서대문구",
      menus: ["라멘"],
      memo: "비 오는 날엔 역시 따뜻한 국물이지. 창밖으로 비 내리는 거 보면서 먹으니까 감성 폭발이었다.",
      rating: 5,
      visitDate: daysFromToday(-24),
      photos: [],
      isReservation: false,
      isSpecialDay: false,
    },
    {
      id: "dev-seed-restaurant-6",
      name: "라뜰리에",
      title: "생일 기념 저녁",
      category: "양식",
      companion: "연인",
      weather: "",
      neighborhood: "서울특별시 용산구",
      menus: ["스테이크"],
      memo: "생일 기념으로 큰맘 먹고 왔는데, 가격은 좀 있어도 서비스랑 분위기가 완전 만족스러웠다.",
      rating: 4,
      visitDate: daysFromToday(-29),
      photos: [],
      isReservation: true,
      isSpecialDay: true,
    },
    {
      id: "dev-seed-restaurant-7",
      name: "산책카페",
      title: "",
      category: "카페·디저트",
      companion: "",
      weather: "",
      neighborhood: "경기도 성남시",
      menus: ["아인슈페너"],
      memo: "동네 산책하다 우연히 들어간 곳인데 완전 대박이었음. 왜 이제야 발견했지 싶을 정도로 좋았다.",
      rating: 5,
      visitDate: daysFromToday(-12),
      photos: [],
      isReservation: false,
      isSpecialDay: false,
    },
    {
      id: "dev-seed-restaurant-8",
      name: "효도한상",
      title: "",
      category: "한식",
      companion: "가족",
      weather: "",
      neighborhood: "경기도 수원시",
      menus: ["갈비탕"],
      memo: "오랜만에 부모님 모시고 왔다. 두 분 다 만족하셔서 다행이었고, 특히 반찬이 정갈했다.",
      rating: 5,
      visitDate: daysFromToday(-49),
      photos: [],
      isReservation: true,
      isSpecialDay: false,
    },
    {
      id: "dev-seed-restaurant-9",
      name: "밤참포차",
      title: "",
      category: "술집",
      companion: "",
      weather: "",
      neighborhood: "서울특별시 동작구",
      menus: ["닭꼬치", "소주"],
      memo: "야근하고 늦은 밤에 혼자 먹으러 왔는데, 이 시간에도 이렇게 붐빌 줄이야. 그만큼 맛있다는 뜻이겠지.",
      rating: 4,
      visitDate: daysFromToday(-6),
      photos: [],
      isReservation: false,
      isSpecialDay: false,
    },
    {
      id: "dev-seed-restaurant-10",
      name: "스시장인",
      title: "",
      category: "일식",
      companion: "친구",
      weather: "",
      neighborhood: "부산광역시 해운대구",
      menus: ["오마카세"],
      memo: "친구가 극찬해서 기대 반 의심 반으로 왔는데, 기대 이상이었다. 특히 메인 메뉴가 인상적이었다.",
      rating: 5,
      visitDate: daysFromToday(-14),
      photos: [],
      isReservation: false,
      isSpecialDay: false,
    },
  ];
}

function buildTestPlannedVisits(): PlannedVisit[] {
  return [
    // 과거 4개 — "다녀왔어요" 전환 버튼이 뜨는 걸 테스트할 수 있어요.
    {
      id: "dev-seed-visit-1",
      name: "평양냉면집 다림",
      memo: "친구가 추천해준 냉면집, 꼭 가보고 싶었다.",
      visitDate: daysFromToday(-14),
    },
    {
      id: "dev-seed-visit-2",
      name: "회사앞 칼국수",
      memo: "점심시간에 팀원들이랑 가기로 한 곳.",
      visitDate: daysFromToday(-9),
    },
    {
      id: "dev-seed-visit-3",
      name: "부모님이랑 갈비집",
      memo: "부모님 모시고 가기로 약속한 날.",
      visitDate: daysFromToday(-5),
    },
    {
      id: "dev-seed-visit-4",
      name: "친구 생일 치킨집",
      memo: "생일 파티 겸 예약해둔 치킨집.",
      visitDate: daysFromToday(-2),
    },
    // 오늘/미래 6개 — D-day 카운트다운이 뜨는 걸 테스트할 수 있어요.
    {
      id: "dev-seed-visit-5",
      name: "베이글맛집 오픈런",
      memo: "오픈런 도전! 아침 일찍 가보기로.",
      visitDate: daysFromToday(0),
    },
    {
      id: "dev-seed-visit-6",
      name: "기념일 오마카세",
      memo: "특별한 날 기념으로 예약해둔 스시 오마카세.",
      visitDate: daysFromToday(1),
    },
    {
      id: "dev-seed-visit-7",
      name: "제주 흑돼지 맛집",
      memo: "제주 여행 가서 꼭 들르기로 한 곳.",
      visitDate: daysFromToday(4),
    },
    {
      id: "dev-seed-visit-8",
      name: "인스타 찜한 파스타집",
      memo: "SNS에서 보고 찜해둔 파스타집.",
      visitDate: daysFromToday(9),
    },
    {
      id: "dev-seed-visit-9",
      name: "가로수길 브런치",
      memo: "친구 생일 기념 브런치 약속.",
      visitDate: daysFromToday(17),
    },
    {
      id: "dev-seed-visit-10",
      name: "연말 파인다이닝",
      memo: "미리 예약해둔 연말 기념 파인다이닝.",
      visitDate: daysFromToday(29),
    },
  ];
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
