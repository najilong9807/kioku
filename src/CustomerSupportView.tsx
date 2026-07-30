import { openURL } from "@apps-in-toss/web-framework";
import { BoardRow, Border, Button } from "@toss/tds-mobile";

const SUPPORT_EMAIL = "najilong9807@naver.com";
const SUPPORT_EMAIL_SUBJECT = "[이게맛다 문의]";
const SUPPORT_MAILTO_URL = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  SUPPORT_EMAIL_SUBJECT,
)}`;

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "닉네임을 바꾸고 싶어요",
    answer:
      "아직 닉네임을 직접 바꾸는 화면은 준비 중이에요. 설정 화면이 추가되면 그곳에서 바로 바꿀 수 있도록 할게요. 지금 바로 바꾸고 싶다면 아래 문의하기로 알려주세요.",
  },
  {
    question: "기록한 맛집이 사라졌어요",
    answer:
      "맛집 기록은 지금 사용 중인 기기에만 저장돼요. 기기를 바꾸거나 앱을 지웠다가 다시 설치하면 이전 기록을 불러올 수 없어요. 다른 기기에서도 기록을 이어보고 싶다면 문의해 주세요.",
  },
  {
    question: "영수증 사진은 꼭 첨부해야 하나요?",
    answer:
      "오늘보다 이전 날짜로 방문 기록을 남길 때만 영수증 사진이 필요해요. 오늘 날짜로 기록할 때는 영수증 없이도 저장할 수 있어요.",
  },
];

function SectionTitle({ children }: { children: string }) {
  return (
    <div
      style={{
        marginBottom: "10px",
        fontSize: "14px",
        fontWeight: 700,
        color: "#6b7684",
      }}
    >
      {children}
    </div>
  );
}

// mailto 링크는 openURL(네이티브 브릿지)로 열고, 브릿지가 없는 환경(로컬 개발
// 미리보기 등)에서는 location.href로 대체해요. restaurantStorage.ts의
// Storage/localStorage 폴백과 같은 패턴이에요.
function handleContactClick() {
  openURL(SUPPORT_MAILTO_URL).catch(() => {
    window.location.href = SUPPORT_MAILTO_URL;
  });
}

export default function CustomerSupportView({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "0 24px 24px",
      }}
    >
      <div>
        <SectionTitle>자주 묻는 질문</SectionTitle>
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          {FAQ_ITEMS.map((item, index) => (
            <BoardRow
              key={item.question}
              title={item.question}
              prefix={<BoardRow.Prefix>Q</BoardRow.Prefix>}
              icon={<BoardRow.ArrowIcon />}
              liAttributes={
                index === FAQ_ITEMS.length - 1
                  ? undefined
                  : { style: { borderBottom: "1px solid #e5e8eb" } }
              }
            >
              <BoardRow.Text>{item.answer}</BoardRow.Text>
            </BoardRow>
          ))}
        </div>
      </div>

      <Border />

      <div>
        <SectionTitle>문의하기</SectionTitle>
        <div
          style={{
            marginBottom: "16px",
            fontSize: "14px",
            color: "#8b95a1",
          }}
        >
          원하는 답을 찾지 못했다면 이메일로 문의해 주세요. 최대한 빠르게
          답변드릴게요.
        </div>
        <Button display="block" variant="weak" color="dark" onClick={handleContactClick}>
          이메일로 문의하기
        </Button>
      </div>

      <Button display="block" variant="weak" color="dark" onClick={onClose}>
        닫기
      </Button>
    </div>
  );
}
