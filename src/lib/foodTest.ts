import { Storage } from "@apps-in-toss/web-framework";
import type { FoodStyle as AvatarFoodStyle } from "./avatars";

// "먹보조사" 음식 성향 테스트예요. 4개 축(여정스타일/선택기준/식사방식/음식취향)에
// 10문항씩, 총 40문항의 3지선다로 구성돼요. 앞 3개 축은 A/B/C에 각각 +1/0/-1
// 점수를 매겨 합산 후 성향 코드를 정하고, 음식취향 축은 각 보기가 가리키는
// 음식 카테고리의 등장 빈도로 판정해요. 두 결과를 조합해서 최종 별명을 만들어요.

const RESULT_STORAGE_KEY = "kioku:foodTestResult";
const HIDE_INTRO_STORAGE_KEY = "kioku:foodTestHideIntro";

export type ScoredAxis = "journey" | "choice" | "dining";
export type FoodCategory =
  | "한식"
  | "분식"
  | "중식"
  | "일식"
  | "동남아"
  | "양식"
  | "패스트푸드"
  | "디저트";

export interface ScoredQuestion {
  id: string;
  axis: ScoredAxis;
  // 문항 상단에 작게 표시하는 상황 라벨이에요. 예: "낯선 동네 탐방"
  situationLabel: string;
  prompt: string;
  // [A, B, C] 순서예요. A=+1, B=0, C=-1로 채점해요.
  options: [string, string, string];
}

export interface FoodQuestion {
  id: string;
  axis: "food";
  situationLabel: string;
  prompt: string;
  options: [string, string, string];
  categories: [FoodCategory, FoodCategory, FoodCategory];
}

export type FoodTestQuestion = ScoredQuestion | FoodQuestion;

// ── 여정스타일 (A=모험형 / C=안정형) ────────────────────────────
const JOURNEY_QUESTIONS: ScoredQuestion[] = [
  {
    id: "journey-1",
    axis: "journey",
    situationLabel: "낯선 동네 탐방",
    prompt: "낯선 동네에 처음 내렸을 때, 내 발걸음은?",
    options: [
      "정해둔 목적지 없이 끌리는 대로 걸어간다",
      "대략적인 방향만 정해두고 걷는다",
      "미리 검색해둔 장소로 곧장 향한다",
    ],
  },
  {
    id: "journey-2",
    axis: "journey",
    situationLabel: "지도 앱 활용",
    prompt: "여행지에서 지도 앱을 켰을 때 나는?",
    options: [
      "지도에 없는 골목이나 수상해 보이는 길로 들어가 본다",
      "동선만 대충 확인하고 즉흥적으로 움직인다",
      "저장해둔 장소 순서대로만 이동한다",
    ],
  },
  {
    id: "journey-3",
    axis: "journey",
    situationLabel: "새 게임 시작",
    prompt: "새로운 게임이나 애플리케이션을 시작할 때 나는?",
    options: [
      "튜토리얼은 일단 건너뛰고 직접 눌러보며 익힌다",
      "대충 훑어보고 일단 시작해 본다",
      "공략집이나 설명서부터 정독하고 시작한다",
    ],
  },
  {
    id: "journey-4",
    axis: "journey",
    situationLabel: "재래시장 구경",
    prompt: "처음 가보는 동네의 전통시장에서 나는?",
    options: [
      "발길이 끌리는 아무 가게나 일단 들어가 본다",
      "사람들이 적당히 모여있는 곳 위주로 간다",
      "미리 블로그나 SNS로 찾아둔 맛집만 찾아간다",
    ],
  },
  {
    id: "journey-5",
    axis: "journey",
    situationLabel: "친구의 파격 패션",
    prompt: "친구가 한 번도 본 적 없는 파격적인 스타일로 나타났다면?",
    options: [
      "\"오, 신선한데? 나도 도전해 볼까?\" 생각한다",
      "\"오... 독특하네\" 하고 가볍게 넘긴다",
      "\"역시 패션은 익숙하고 정돈된 게 제일이지\" 생각한다",
    ],
  },
  {
    id: "journey-6",
    axis: "journey",
    situationLabel: "신제품 도전",
    prompt: "완전히 새로운 브랜드나 낯선 신제품을 발견했을 때 나는?",
    options: [
      "호기심이 생겨서 일단 사서 써본다",
      "후기나 리뷰를 몇 개 찾아보고 결정한다",
      "늘 쓰던 익숙한 브랜드만 계속 구매한다",
    ],
  },
  {
    id: "journey-7",
    axis: "journey",
    situationLabel: "외국어 메뉴판",
    prompt: "번역기가 안 되는 낯선 언어로 된 메뉴판을 받았다면?",
    options: [
      "어떤 게 나올지 기대하며 대충 아무거나 찍어본다",
      "직원에게 가장 잘나가는 메뉴가 뭔지 물어본다",
      "그나마 아는 단어가 하나라도 들어간 안전한 메뉴를 고른다",
    ],
  },
  {
    id: "journey-8",
    axis: "journey",
    situationLabel: "새로운 산책로",
    prompt: "우리 동네에 새로 생긴 산책로를 발견했을 때 나는?",
    options: [
      "궁금해서 그 자리에서 바로 걸어가 본다",
      "'다음에 시간 날 때 가봐야지' 하고 기억해둔다",
      "원래 늘 걷던 편안한 익숙한 길로 간다",
    ],
  },
  {
    id: "journey-9",
    axis: "journey",
    situationLabel: "괴식/이색 요리",
    prompt: "\"이 재료랑 이 재료가 어울린다고?\" 싶은 특이한 조합의 요리를 추천받는다면?",
    options: [
      "호기심이 폭발해서 당장 먹어보고 싶다",
      "남들이 먼저 먹어보고 괜찮다고 하면 도전한다",
      "검증된 맛의 조합만 먹는 게 마음 편하다",
    ],
  },
  {
    id: "journey-10",
    axis: "journey",
    situationLabel: "바뀐 교통 경로",
    prompt: "약속 장소로 가는 평소 길에 공사가 시작되어 돌아가야 할 때 나는?",
    options: [
      "\"이참에 새로운 길로 가볼까?\" 하며 안 가본 길로 돌아간다",
      "지도 앱이 추천하는 가장 무난한 돌아가는 길로 간다",
      "길을 잃을까 봐 제일 익숙하고 안전한 대로변으로만 돌아간다",
    ],
  },
];

// ── 선택기준 (A=감성 / C=효율) ──────────────────────────────────
const CHOICE_QUESTIONS: ScoredQuestion[] = [
  {
    id: "choice-1",
    axis: "choice",
    situationLabel: "물건 구매",
    prompt: "쇼핑할 때 내 마음을 먼저 사로잡는 것은?",
    options: [
      "보는 순간 기분 좋아지는 예쁜 디자인",
      "디자인과 실용성의 적절한 조화",
      "오래 쓸 수 있고 기능이 확실한 실용성",
    ],
  },
  {
    id: "choice-2",
    axis: "choice",
    situationLabel: "방 꾸미기",
    prompt: "내 방 인테리어를 바꾼다면 가장 먼저 살 것은?",
    options: [
      "방의 전체 분위기를 바꿔줄 감성 조명이나 소품",
      "디자인도 예쁘고 수납도 되는 가구",
      "공간 활용도를 극대화해 줄 효율적인 수납장",
    ],
  },
  {
    id: "choice-3",
    axis: "choice",
    situationLabel: "숙소 예약",
    prompt: "여행지 숙소를 고를 때 가장 중요하게 보는 것은?",
    options: [
      "탁 트인 뷰와 인스타그램 감성의 인테리어",
      "적당한 가격과 무난한 위치",
      "가성비 최고의 실속 있는 가격과 이동 효율성",
    ],
  },
  {
    id: "choice-4",
    axis: "choice",
    situationLabel: "선물 선호",
    prompt: "누군가에게 선물을 받는다면 더 기분 좋은 순간은?",
    options: [
      "정성스럽고 감성적으로 예쁘게 포장된 선물을 열 때",
      "예쁘면서도 실생활에 유용한 선물을 받았을 때",
      "내가 딱 필요했던 실용적인 생필품/기프티콘을 받았을 때",
    ],
  },
  {
    id: "choice-5",
    axis: "choice",
    situationLabel: "사진 촬영",
    prompt: "사진을 찍거나 찍힐 때 내가 가장 신경 쓰는 건?",
    options: [
      "전체적인 감성과 분위기, 감각적인 구도",
      "인물이 적당히 잘 나오는 무난한 구도",
      "피사체가 얼마나 또렷하고 사실적으로 찍혔는지",
    ],
  },
  {
    id: "choice-6",
    axis: "choice",
    situationLabel: "옷 쇼핑",
    prompt: "옷을 고를 때 나만의 철칙은?",
    options: [
      "입었을 때 내 핏과 분위기가 사는지 본다",
      "디자인도 예쁘고 여러 착장에 돌려 입을 수 있는지 본다",
      "세탁과 관리가 편하고 자주 입을 수 있는지 본다",
    ],
  },
  {
    id: "choice-7",
    axis: "choice",
    situationLabel: "카페 자리 선택",
    prompt: "카페에 들어섰을 때 내가 탐내는 자리는?",
    options: [
      "창가 쪽 뷰가 좋고 사진이 잘 나오는 자리",
      "의자가 편하고 수다 떨기 무난한 자리",
      "콘센트가 가깝고 작업하기 편한 자리",
    ],
  },
  {
    id: "choice-8",
    axis: "choice",
    situationLabel: "쇼핑의 만족감",
    prompt: "\"아, 오늘 쇼핑 진짜 잘했다!\"라고 느끼는 순간은?",
    options: [
      "보는 것만으로도 기분이 좋아지는 예쁜 물건을 샀을 때",
      "호불호 없이 유용하고 적당한 물건을 골랐을 때",
      "할인이나 이득을 챙겨 알뜰하게 잘 샀을 때",
    ],
  },
  {
    id: "choice-9",
    axis: "choice",
    situationLabel: "퇴근 후 위로",
    prompt: "고된 하루를 마치고 침대에 누웠을 때, 오늘 하루를 보상받는 느낌은?",
    options: [
      "오늘 본 예쁜 풍경이나 분위기 좋은 공간에서의 기억",
      "오늘 하루도 별탈 없이 무난하게 지나갔다는 편안함",
      "오늘 계획했던 일들을 차근차근 해냈다는 성취감",
    ],
  },
  {
    id: "choice-10",
    axis: "choice",
    situationLabel: "만족의 순간",
    prompt: "무언가를 구매한 뒤 최종적으로 드는 생각은?",
    options: [
      "\"아, 진짜 너무 예쁘다!\"",
      "\"딱히 아쉬울 것 없이 괜찮네.\"",
      "\"진짜 알차게 잘 샀다(개이득)!\"",
    ],
  },
];

// ── 식사방식 (A=함께 / C=혼자) ──────────────────────────────────
const DINING_QUESTIONS: ScoredQuestion[] = [
  {
    id: "dining-1",
    axis: "dining",
    situationLabel: "좋은 공간 발견",
    prompt: "취향저격인 공간이나 맛집을 발견했을 때 나의 행동은?",
    options: [
      "그 자리에서 바로 누군가에게 단톡방으로 공유한다",
      "나중에 생각나면 친한 사람에게 얘기해 준다",
      "나만의 비밀 장소로 간직하며 혼자 즐긴다",
    ],
  },
  {
    id: "dining-2",
    axis: "dining",
    situationLabel: "주말 일정",
    prompt: "주말에 갑자기 자유시간이 생겼을 때 나의 행동은?",
    options: [
      "누구한테 연락해서 만날지부터 생각한다",
      "상황과 컨디션에 따라 다르게 결정한다",
      "혼자서 뭘 하며 쉴지부터 즐겁게 구상한다",
    ],
  },
  {
    id: "dining-3",
    axis: "dining",
    situationLabel: "여행 스타일",
    prompt: "가장 이상적으로 생각하는 여행의 형태는?",
    options: [
      "여럿이 함께 하하호호 떠나는 시끌벅적한 여행",
      "마음 맞는 2~3명의 소수 정예 여행",
      "누구의 눈치도 보지 않고 떠나는 나 홀로 여행",
    ],
  },
  {
    id: "dining-4",
    axis: "dining",
    situationLabel: "웨이팅 대기시간",
    prompt: "핫플 식당에서 줄을 서서 오랫동안 기다릴 때 나는?",
    options: [
      "동행자와 끊임없이 수다를 떤다",
      "스마트폰을 보거나 적당히 대화를 나눈다",
      "조용히 이어폰을 끼거나 혼자만의 생각에 잠긴다",
    ],
  },
  {
    id: "dining-5",
    axis: "dining",
    situationLabel: "식사 중 대화",
    prompt: "맛있는 음식을 먹을 때 나에게 '대화'란?",
    options: [
      "식사의 즐거움을 2배로 늘려주는 필수 요소",
      "있어도 좋고 없어도 상관없는 것",
      "음식 본연의 맛에 집중하는 것을 방해하는 것",
    ],
  },
  {
    id: "dining-6",
    axis: "dining",
    situationLabel: "모임 분위기",
    prompt: "여럿이 모인 식사 자리에서 나는?",
    options: [
      "이 사람 저 사람 자리를 옮겨 다니며 대화를 주도한다",
      "옆 사람들과 소소하게 어울리며 분위기를 맞춘다",
      "구석에서 조용히 음식을 즐기며 상황을 관망한다",
    ],
  },
  {
    id: "dining-7",
    axis: "dining",
    situationLabel: "혼밥/혼술 반응",
    prompt: "\"나는 혼자 밥 먹고 혼자 여행하는 게 제일 편해\"라는 말을 들으면?",
    options: [
      "\"어떻게 혼자서 그래?\" 하고 잘 이해가 안 간다",
      "\"그럴 때도 있지\" 하고 어느 정도 이해한다",
      "\"격하게 공감한다! 혼자가 제일이다\"라고 생각한다",
    ],
  },
  {
    id: "dining-8",
    axis: "dining",
    situationLabel: "새 공간 입장",
    prompt: "한 번도 안 가본 힙한 레스토랑/바에 처음 들어설 때 나는?",
    options: [
      "여럿이 왁자지껄 함께 들어가는 게 편하다",
      "친한 친구 한 명 정도와 함께 들어가는 게 편하다",
      "혼자 스윽 들어가서 자리를 잡는 게 오히려 편하다",
    ],
  },
  {
    id: "dining-9",
    axis: "dining",
    situationLabel: "기념일 보내기",
    prompt: "생일이나 특별한 기념일을 보낼 때 내가 원하는 방식은?",
    options: [
      "사람들을 왁자지껄하게 불러 모아 파티를 하는 것",
      "정말 가까운 소수 인원과 조용히 축하하는 것",
      "나만을 위한 시간을 보내며 호캉스나 취미를 즐기는 것",
    ],
  },
  {
    id: "dining-10",
    axis: "dining",
    situationLabel: "최고의 순간",
    prompt: "\"아, 오늘 진짜 만족스러운 하루였다!\"라고 느껴지는 순간은?",
    options: [
      "좋은 사람들과 웃고 떠들며 추억을 쌓았을 때",
      "무난하고 무탈하게 하루가 지나갔을 때",
      "혼자만의 시간에 온전히 몰입해서 깊은 휴식을 취했을 때",
    ],
  },
];

// ── 음식 취향 (카테고리 다수결) ──────────────────────────────────
const FOOD_QUESTIONS: FoodQuestion[] = [
  {
    id: "food-1",
    axis: "food",
    situationLabel: "퇴근길 배고픔",
    prompt: "저녁 6시, 아무 계획 없이 배가 몹시 고플 때 가장 먼저 당기는 시각/소리는?",
    options: [
      "뚝배기에서 보글보글 끓어오르는 뜨끈한 국물 소리",
      "길거리 포장마차의 빨간 떡볶이와 튀김 냄새",
      "분위기 있는 조명 아래 스테이크 칼질하는 소리",
    ],
    categories: ["한식", "분식", "양식"],
  },
  {
    id: "food-2",
    axis: "food",
    situationLabel: "첫인상 맛",
    prompt: "머릿속에 '오늘 뭐 먹지?' 했을 때 가장 먼저 떠오르는 이미지는?",
    options: [
      "불길이 확 오르며 불향이 진하게 밴 볶음 요리",
      "정갈하고 깔끔하게 목판에 한 접시씩 나오는 요리",
      "에스닉한 향신료 향이 코끝을 확 자극하는 요리",
    ],
    categories: ["중식", "일식", "동남아"],
  },
  {
    id: "food-3",
    axis: "food",
    situationLabel: "타임 어택",
    prompt: "점심시간이 딱 20분밖에 안 남은 초긴급 상황! 나를 구원할 음식은?",
    options: [
      "30초 만에 나오는 든든한 국밥 한 그릇",
      "주문하자마자 나오는 편의점 햄버거나 샌드위치",
      "달콤한 조각 케이크와 아메리카노 한 잔으로 때우기",
    ],
    categories: ["한식", "패스트푸드", "디저트"],
  },
  {
    id: "food-4",
    axis: "food",
    situationLabel: "대접의 순간",
    prompt: "귀한 손님을 집으로 초대해 정성껏 요리해 대접한다면?",
    options: [
      "정갈한 초밥이나 스키야키처럼 정성이 들어간 요리",
      "와인과 어울리는 근사한 파스타나 스테이크",
      "커다란 웍에 볶아 다 함께 나눠 먹는 화려한 요리",
    ],
    categories: ["일식", "양식", "중식"],
  },
  {
    id: "food-5",
    axis: "food",
    situationLabel: "야근/스트레스",
    prompt: "스트레스 가득했던 야근 후, 지친 나를 치유해 줄 야식은?",
    options: [
      "얼큰하고 칼칼한 김치찌개에 쌀밥 한 공기",
      "똠얌꿍처럼 콤콤하고 매콤새콤한 이국적인 국물",
      "입안에서 녹아내리는 마카롱과 달콤한 디저트",
    ],
    categories: ["한식", "동남아", "디저트"],
  },
  {
    id: "food-6",
    axis: "food",
    situationLabel: "길거리의 유혹",
    prompt: "길을 걷다가 나도 모르게 발걸음을 멈추게 만드는 것은?",
    options: [
      "길가에서 풍기는 고소한 튀김과 떡볶이 냄새",
      "통유리너머 진열장 속 아기자기하고 영롱한 베이커리 비주얼",
      "빨간색 간판 아래 끊임없이 세트메뉴가 나오는 버거집",
    ],
    categories: ["분식", "디저트", "패스트푸드"],
  },
  {
    id: "food-7",
    axis: "food",
    situationLabel: "해외 여행의 묘미",
    prompt: "현지 여행지에서 절대 놓치고 싶지 않은 식경험은?",
    options: [
      "향신료와 고수가 듬뿍 들어간 독특한 야시장 음식",
      "화려한 불쇼와 함께 만들어지는 길거리 볶음면",
      "장인의 손길이 느껴지는 깔끔하고 정갈한 로컬 요리",
    ],
    categories: ["동남아", "중식", "일식"],
  },
  {
    id: "food-8",
    axis: "food",
    situationLabel: "기분 전환",
    prompt: "이유 없이 기분이 처지고 우울할 때, 나를 일으켜 세우는 음식은?",
    options: [
      "세련된 분위기의 레스토랑에서 먹는 정갈한 코스 요리",
      "뇌까지 달달해지는 기분 좋은 당 충전 디저트",
      "어머니가 해준 듯한 속이 풀리는 뜨끈한 집밥",
    ],
    categories: ["양식", "디저트", "한식"],
  },
  {
    id: "food-9",
    axis: "food",
    situationLabel: "집들이 선물",
    prompt: "친구 집들이에 직접 음식이나 소스를 챙겨간다면?",
    options: [
      "제대로 된 깊은 맛의 집된장이나 장아찌류",
      "피시소스나 스리라차 등 힙하고 이국적인 향신 소스",
      "정성스럽게 구워 간 달달한 수제 쿠키나 케이크",
    ],
    categories: ["한식", "동남아", "디저트"],
  },
  {
    id: "food-10",
    axis: "food",
    situationLabel: "나만의 필살기",
    prompt: "\"나 이거 하나는 진짜 자신 있게 만들지!\" 하는 요리는?",
    options: [
      "강력한 화력으로 볶아내는 볶음밥이나 중화 요리",
      "비주얼부터 근사한 크림 파스타나 감바스",
      "계란 톡 깨넣고 대파 썰어 넣은 완벽한 조리법의 라면",
    ],
    categories: ["중식", "양식", "분식"],
  },
];

export const FOOD_TEST_QUESTIONS: FoodTestQuestion[] = [
  ...JOURNEY_QUESTIONS,
  ...CHOICE_QUESTIONS,
  ...DINING_QUESTIONS,
  ...FOOD_QUESTIONS,
];

export const FOOD_TEST_QUESTION_COUNT = FOOD_TEST_QUESTIONS.length;

export function isFoodQuestion(
  question: FoodTestQuestion,
): question is FoodQuestion {
  return question.axis === "food";
}

// Fisher-Yates shuffle이에요. 문제 순서를 매번 새로 섞어서, 축이 뭉쳐 나오는
// 패턴을 사용자가 눈치채지 못하게 해요.
export function shuffleQuestions(
  questions: FoodTestQuestion[] = FOOD_TEST_QUESTIONS,
): FoodTestQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export type AnswerLetter = "A" | "B" | "C";
export type Answers = Record<string, AnswerLetter>;

export type PersonalityCode =
  | "탐험대장"
  | "방랑자"
  | "모험가"
  | "탐구자"
  | "인싸메이트"
  | "단골지킴이"
  | "정찬러"
  | "루틴러";

const PERSONALITY_MAP: Record<
  "adventurous" | "stable",
  Record<"emotional" | "efficient", Record<"together" | "alone", PersonalityCode>>
> = {
  adventurous: {
    emotional: { together: "탐험대장", alone: "방랑자" },
    efficient: { together: "모험가", alone: "탐구자" },
  },
  stable: {
    emotional: { together: "인싸메이트", alone: "단골지킴이" },
    efficient: { together: "정찬러", alone: "루틴러" },
  },
};

const PERSONALITY_DESCRIPTIONS: Record<PersonalityCode, string> = {
  탐험대장: "메뉴든 낯선 골목이든, 일단 가보고 사람들과 그 설렘을 나눠야 완성되는 타입이에요.",
  방랑자: "한 끼를 찾아 혼자 낯선 골목 구석구석을 누비는 타입이에요.",
  모험가: "한 끼도 새로운 시도로 접근하고, 그 경험을 사람들과 실속 있게 나누는 타입이에요.",
  탐구자: "메뉴를 마주치면 직접 부딪혀보고, 그 답을 혼자 차분히 파고드는 타입이에요.",
  인싸메이트: "단골집에서 좋아하는 사람들과 함께할 때 가장 편안한 타입이에요.",
  단골지킴이: "단골집의 분위기를 홀로 음미하며 조용히 지키는 타입이에요.",
  정찬러: "검증된 메뉴를 신뢰하고, 그 만족을 가까운 사람들과 나누는 타입이에요.",
  루틴러: "메뉴만 골라 나만의 루틴 속에서 안정을 찾는 타입이에요.",
};

const FOOD_ADJECTIVES: Record<FoodCategory, string> = {
  한식: "든든한",
  분식: "소소한",
  중식: "화끈한",
  일식: "깔끔한",
  동남아: "이색적인",
  양식: "근사한",
  패스트푸드: "간편한",
  디저트: "달콤한",
};

// 결과 화면에서 음식취향을 나타낼 때, 이미 만들어둔 프로필 아바타 음식
// 캐릭터(lib/avatars.tsx) 중 카테고리에 가장 잘 어울리는 것 하나를 재사용해요.
// "동남아"는 정확히 들어맞는 기존 캐릭터가 없어서, 꼬치 형태로 가장 가까운
// chicken_drumstick으로 대신해요.
export const FOOD_CATEGORY_AVATAR_STYLE: Record<FoodCategory, AvatarFoodStyle> = {
  한식: "bibimbap",
  분식: "tteokbokki",
  중식: "jjajangmyeon",
  일식: "sushi",
  동남아: "chicken_drumstick",
  양식: "steak",
  패스트푸드: "fries",
  디저트: "macaron",
};

export interface FoodTestResult {
  personalityCode: PersonalityCode;
  foodCategory: FoodCategory;
  adjective: string;
  title: string; // "{adjective} {personalityCode}"
  description: string;
  completedAt: string; // ISO
}

function scoreAxis(answers: Answers, questions: ScoredQuestion[]): number {
  return questions.reduce((sum, question) => {
    const answer = answers[question.id];
    if (answer === "A") return sum + 1;
    if (answer === "C") return sum - 1;
    return sum;
  }, 0);
}

function judgeFoodCategory(answers: Answers): FoodCategory {
  const counts = new Map<FoodCategory, number>();
  const firstSeenIndex = new Map<FoodCategory, number>();

  FOOD_QUESTIONS.forEach((question, index) => {
    const answer = answers[question.id];
    if (!answer) {
      return;
    }
    const letterIndex = answer === "A" ? 0 : answer === "B" ? 1 : 2;
    const category = question.categories[letterIndex];
    counts.set(category, (counts.get(category) ?? 0) + 1);
    if (!firstSeenIndex.has(category)) {
      firstSeenIndex.set(category, index);
    }
  });

  let best: FoodCategory = "한식";
  let bestCount = -1;
  let bestFirstSeen = Number.POSITIVE_INFINITY;

  for (const [category, count] of counts) {
    const seenAt = firstSeenIndex.get(category) ?? Number.POSITIVE_INFINITY;
    if (
      count > bestCount ||
      (count === bestCount && seenAt < bestFirstSeen)
    ) {
      best = category;
      bestCount = count;
      bestFirstSeen = seenAt;
    }
  }

  return best;
}

// 세 축(여정스타일/선택기준/식사방식) 합산 점수로 8가지 성향 중 하나를 정하고,
// 음식취향 축의 다수결 카테고리와 조합해서 최종 결과를 만들어요.
// 합산이 정확히 0인 동점 상황은(모험형/안정형처럼) 항상 A/C 개수도 같이
// 동점이 되므로 별도 기준이 필요해요 — 이 테스트에서는 0점을 "안정/효율/혼자"
// 같은 차분한 쪽이 아니라 A(모험형/감성/함께)쪽으로 판정해요. 완전히 무난하게
// 답했다는 건 오히려 이것저것 다 열려있다는 뜻으로 보고, 더 적극적인 쪽 손을
// 들어주기로 했어요.
export function computeFoodTestResult(answers: Answers): FoodTestResult {
  const journeyScore = scoreAxis(answers, JOURNEY_QUESTIONS);
  const choiceScore = scoreAxis(answers, CHOICE_QUESTIONS);
  const diningScore = scoreAxis(answers, DINING_QUESTIONS);

  const journeySide: "adventurous" | "stable" =
    journeyScore >= 0 ? "adventurous" : "stable";
  const choiceSide: "emotional" | "efficient" =
    choiceScore >= 0 ? "emotional" : "efficient";
  const diningSide: "together" | "alone" = diningScore >= 0 ? "together" : "alone";

  const personalityCode = PERSONALITY_MAP[journeySide][choiceSide][diningSide];
  const foodCategory = judgeFoodCategory(answers);
  const adjective = FOOD_ADJECTIVES[foodCategory];

  return {
    personalityCode,
    foodCategory,
    adjective,
    title: `${adjective} ${personalityCode}`,
    description: `${adjective} ${PERSONALITY_DESCRIPTIONS[personalityCode]}`,
    completedAt: new Date().toISOString(),
  };
}

function parseResult(value: string): FoodTestResult | null {
  try {
    return JSON.parse(value) as FoodTestResult;
  } catch {
    return null;
  }
}

// 다른 로컬 데이터(restaurantStorage.ts 등)와 동일하게, 네이티브 Storage를
// 먼저 시도하고 실패하면(일반 브라우저 미리보기 등) localStorage로 대체해요.
export async function loadFoodTestResult(): Promise<FoodTestResult | null> {
  try {
    const value = await Storage.getItem(RESULT_STORAGE_KEY);
    if (value) {
      return parseResult(value);
    }
  } catch {
    // 네이티브 브릿지를 사용할 수 없는 환경이에요.
  }

  try {
    const value = localStorage.getItem(RESULT_STORAGE_KEY);
    if (value) {
      return parseResult(value);
    }
  } catch {
    // ignore
  }

  return null;
}

export async function saveFoodTestResult(result: FoodTestResult): Promise<void> {
  const serialized = JSON.stringify(result);

  try {
    await Storage.setItem(RESULT_STORAGE_KEY, serialized);
    return;
  } catch {
    // 네이티브 브릿지를 사용할 수 없는 환경이에요.
  }

  try {
    localStorage.setItem(RESULT_STORAGE_KEY, serialized);
  } catch {
    // ignore
  }
}

export async function loadFoodTestHideIntro(): Promise<boolean> {
  try {
    const value = await Storage.getItem(HIDE_INTRO_STORAGE_KEY);
    if (value) {
      return value === "true";
    }
  } catch {
    // ignore
  }

  try {
    return localStorage.getItem(HIDE_INTRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export async function saveFoodTestHideIntro(hide: boolean): Promise<void> {
  const serialized = hide ? "true" : "false";

  try {
    await Storage.setItem(HIDE_INTRO_STORAGE_KEY, serialized);
    return;
  } catch {
    // ignore
  }

  try {
    localStorage.setItem(HIDE_INTRO_STORAGE_KEY, serialized);
  } catch {
    // ignore
  }
}
