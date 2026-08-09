import { Button, Checkbox, Modal, ProgressBar, useToast } from "@toss/tds-mobile";
import { ChevronLeft, Share2, X } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { AvatarIcon } from "./lib/avatars";
import {
  computeFoodTestResult,
  FOOD_CATEGORY_AVATAR_STYLE,
  FOOD_TEST_QUESTION_COUNT,
  loadFoodTestHideIntro,
  saveFoodTestHideIntro,
  saveFoodTestResult,
  shuffleQuestions,
  type AnswerLetter,
  type Answers,
  type FoodTestQuestion,
  type FoodTestResult,
} from "./lib/foodTest";
import { PersonalityIcon } from "./lib/personalityIcons";
import { QuestionIllustration } from "./lib/questionIcons";
import { shareImage } from "./lib/share";
import { renderFoodTestResultCard } from "./lib/shareCard";
import {
  SAGE_GREEN,
  SAGE_GREEN_BG,
  SAGE_GREEN_DARK,
  THEME_YELLOW,
  THEME_YELLOW_TEXT,
} from "./theme";

const ANSWER_LETTERS: readonly AnswerLetter[] = ["A", "B", "C"];

// 브랜드 색(노란색)이 밝아서 흰 글씨는 가독성이 떨어져요. App.tsx/ProfileView.tsx의
// 동명 상수와 같은 이유예요.
const PRIMARY_FILL_BUTTON_TEXT_STYLE = {
  "--button-color": "#000000",
} as CSSProperties;

// 결과 카드 이미지(shareCard.ts의 drawStampBadge)와 같은 톱니 원 + 별 모양을
// 화면에도 작게 넣어서, 저장한 이미지와 화면이 같은 느낌을 갖게 해요.
function ResultStampDecoration() {
  const size = 40;
  const center = size / 2;
  const perforationRadius = size / 2 - 1;
  const dots = Array.from({ length: 14 }, (_, index) => {
    const angle = (index / 14) * Math.PI * 2;
    return {
      cx: center + Math.cos(angle) * perforationRadius,
      cy: center + Math.sin(angle) * perforationRadius,
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ position: "absolute", top: "12px", right: "12px" }}
      aria-hidden="true"
    >
      {dots.map((dot) => (
        <circle
          key={`${dot.cx}-${dot.cy}`}
          cx={dot.cx}
          cy={dot.cy}
          r={1.3}
          fill={SAGE_GREEN}
        />
      ))}
      <circle
        cx={center}
        cy={center}
        r={center - 6}
        fill="#ffffff"
        stroke={SAGE_GREEN}
        strokeWidth="1.2"
      />
      <text
        x={center}
        y={center + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.4}
        fill={SAGE_GREEN_DARK}
      >
        ★
      </text>
    </svg>
  );
}

type Step = "intro" | "questions" | "result";

// "먹보조사" 전체 흐름(안내 → 문항 → 결과)을 하나의 전체 화면 모달로 관리해요.
// open이 true가 될 때마다 문항을 새로 섞고 처음부터 시작해요.
export default function FoodTestModal({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete?: (result: FoodTestResult) => void;
}) {
  const [step, setStep] = useState<Step>("intro");
  const [hideIntroChecked, setHideIntroChecked] = useState(false);
  const [questions, setQuestions] = useState<FoodTestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<FoodTestResult | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setQuestions(shuffleQuestions());
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setHideIntroChecked(false);

    let isMounted = true;
    loadFoodTestHideIntro().then((hide) => {
      if (isMounted) {
        setStep(hide ? "questions" : "intro");
      }
    });
    return () => {
      isMounted = false;
    };
  }, [open]);

  const currentQuestion = questions[currentIndex];

  const handleStart = () => {
    if (hideIntroChecked) {
      saveFoodTestHideIntro(true);
    }
    setStep("questions");
  };

  const handleAnswer = (letter: AnswerLetter) => {
    if (!currentQuestion) {
      return;
    }
    const nextAnswers = { ...answers, [currentQuestion.id]: letter };
    setAnswers(nextAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const nextResult = computeFoodTestResult(nextAnswers);
    setResult(nextResult);
    saveFoodTestResult(nextResult);
    onComplete?.(nextResult);
    setStep("result");
  };

  // 직전 문항으로 돌아가요. 그 문항에서 골랐던 답은 answers에 그대로 남아있어서
  // (지우지 않음), QuestionStep에 selectedLetter로 넘겨 선택 상태를 보여주고,
  // 다시 답을 고르면 handleAnswer가 같은 id로 값을 덮어써서 수정돼요.
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRetry = () => {
    setQuestions(shuffleQuestions());
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setStep("questions");
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <Modal.Overlay />
      <Modal.Content
        style={{
          width: "min(92vw, 440px)",
          height: "min(88vh, 720px)",
          maxHeight: "88vh",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.16)",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        {step === "intro" && (
          <IntroStep
            checked={hideIntroChecked}
            onCheckedChange={setHideIntroChecked}
            onClose={onClose}
            onStart={handleStart}
          />
        )}
        {step === "questions" && currentQuestion && (
          <QuestionStep
            index={currentIndex}
            total={questions.length}
            question={currentQuestion}
            selectedLetter={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
            onBack={currentIndex > 0 ? handleBack : undefined}
            onClose={onClose}
          />
        )}
        {step === "result" && result && (
          <ResultStep result={result} onRetry={handleRetry} onDone={onClose} />
        )}
      </Modal.Content>
    </Modal>
  );
}

function IntroStep({
  checked,
  onCheckedChange,
  onClose,
  onStart,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onClose: () => void;
  onStart: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          style={{
            background: "none",
            border: "none",
            padding: "4px",
            cursor: "pointer",
          }}
        >
          <X size={22} color="#8b95a1" />
        </button>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: "16px",
        }}
      >
        <div style={{ fontSize: "40px" }}>🍽️</div>
        <div style={{ fontSize: "22px", fontWeight: 700, color: "#191f28" }}>
          먹보조사
        </div>
        <div style={{ fontSize: "15px", color: "#4e5968", lineHeight: 1.6 }}>
          나는 어떤 방식으로 먹고 즐기는 사람일까요?
          <br />
          여정 스타일과 음식 취향을 알아보는 {FOOD_TEST_QUESTION_COUNT}문항 테스트예요.
          <br />약 5~7분 정도 걸려요.
        </div>
      </div>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 4px",
          cursor: "pointer",
        }}
      >
        <Checkbox.Circle checked={checked} onCheckedChange={onCheckedChange} />
        <span style={{ fontSize: "14px", color: "#4e5968" }}>
          다음부터 이 안내 다시 보지 않기
        </span>
      </label>
      <div style={{ display: "flex", gap: "8px" }}>
        <Button
          display="block"
          variant="weak"
          color="dark"
          onClick={onClose}
          style={{ flex: 1 }}
        >
          닫기
        </Button>
        <Button
          display="block"
          variant="fill"
          onClick={onStart}
          style={{ flex: 1, ...PRIMARY_FILL_BUTTON_TEXT_STYLE }}
        >
          시작하기
        </Button>
      </div>
    </div>
  );
}

function QuestionStep({
  index,
  total,
  question,
  selectedLetter,
  onAnswer,
  onBack,
  onClose,
}: {
  index: number;
  total: number;
  question: FoodTestQuestion;
  selectedLetter?: AnswerLetter;
  onAnswer: (letter: AnswerLetter) => void;
  onBack?: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack}
          aria-label="이전 문항으로"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            background: "none",
            border: "none",
            padding: "4px",
            cursor: onBack ? "pointer" : "default",
            opacity: onBack ? 1 : 0,
            color: "#8b95a1",
          }}
        >
          <ChevronLeft size={18} />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>이전 문항</span>
        </button>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#8b95a1" }}>
          {index + 1}/{total}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          style={{
            background: "none",
            border: "none",
            padding: "4px",
            cursor: "pointer",
          }}
        >
          <X size={20} color="#8b95a1" />
        </button>
      </div>
      <ProgressBar progress={index / total} size="normal" color={THEME_YELLOW} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <QuestionIllustration questionId={question.id} size={64} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#9CAF9A",
                letterSpacing: "0.5px",
              }}
            >
              Q{index + 1}
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: SAGE_GREEN_DARK,
                backgroundColor: SAGE_GREEN_BG,
                borderRadius: "999px",
                padding: "3px 10px",
              }}
            >
              {question.situationLabel}
            </span>
          </div>
        </div>
        <div
          style={{
            fontSize: "19px",
            fontWeight: 700,
            color: "#191f28",
            lineHeight: 1.4,
            textAlign: "center",
          }}
        >
          {question.prompt}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {question.options.map((text, optionIndex) => {
            const letter = ANSWER_LETTERS[optionIndex];
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={optionIndex}
                type="button"
                data-food-test-option="true"
                onClick={() => onAnswer(letter)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  textAlign: "left",
                  padding: "16px",
                  borderRadius: "14px",
                  border: isSelected
                    ? `2px solid ${SAGE_GREEN}`
                    : "1px solid #e5e8eb",
                  backgroundColor: isSelected ? SAGE_GREEN_BG : "#f9fafb",
                  fontSize: "15px",
                  fontWeight: isSelected ? 700 : 400,
                  color: "#191f28",
                  cursor: "pointer",
                  outline: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    fontWeight: 700,
                    color: isSelected ? SAGE_GREEN_DARK : SAGE_GREEN,
                  }}
                >
                  {letter}.
                </span>
                <span>{text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ResultStep({
  result,
  onRetry,
  onDone,
}: {
  result: FoodTestResult;
  onRetry: () => void;
  onDone: () => void;
}) {
  const toast = useToast();
  const [isSharing, setIsSharing] = useState(false);

  // 카드 이미지를 만들고, Web Share API(또는 앱인토스/클립보드/다운로드 폴백)로
  // 공유해요. 실제 공유/저장 동작은 lib/share.ts가 맡아요.
  const handleShare = async () => {
    if (isSharing) {
      return;
    }
    setIsSharing(true);
    try {
      const blob = await renderFoodTestResultCard(result);
      const outcome = await shareImage({
        blob,
        fileName: `이게맛다-먹보조사-${result.personalityCode}.png`,
        title: `이게맛다 먹보조사 - ${result.title}`,
        text: result.description,
      });

      if (outcome === "saved") {
        toast.openToast("이미지를 기기에 저장했어요");
      } else if (outcome === "copied") {
        toast.openToast("이미지를 클립보드에 복사했어요");
      } else if (outcome === "downloaded") {
        toast.openToast("이미지를 다운로드했어요");
      } else if (outcome === "failed") {
        toast.openToast("공유에 실패했어요. 다시 시도해주세요");
      }
      // "shared"/"cancelled"는 공유 시트 자체가 충분한 피드백이라 토스트를 따로 띄우지 않아요.
    } catch (error) {
      console.error("먹보조사 결과 카드를 만들지 못했어요.", error);
      toast.openToast("이미지를 만들지 못했어요. 다시 시도해주세요");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onDone}
          aria-label="닫기"
          style={{
            background: "none",
            border: "none",
            padding: "4px",
            cursor: "pointer",
          }}
        >
          <X size={22} color="#8b95a1" />
        </button>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            width: "100%",
            padding: "28px 20px 24px",
            borderRadius: "20px",
            border: `1.5px solid ${SAGE_GREEN}`,
            backgroundColor: SAGE_GREEN_BG,
          }}
        >
          <ResultStampDecoration />
          <div
            style={{ fontSize: "13px", fontWeight: 600, color: THEME_YELLOW_TEXT }}
          >
            먹보조사 결과
          </div>
          <div style={{ position: "relative", width: "96px", height: "96px" }}>
            <AvatarIcon
              category="food"
              style={FOOD_CATEGORY_AVATAR_STYLE[result.foodCategory]}
              size={96}
            />
            <div
              style={{
                position: "absolute",
                bottom: -4,
                right: -6,
                borderRadius: "50%",
                border: "3px solid #ffffff",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.18)",
                lineHeight: 0,
              }}
            >
              <PersonalityIcon code={result.personalityCode} size={38} />
            </div>
          </div>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#191f28" }}>
            {result.title}
          </div>
          <div
            style={{
              fontSize: "15px",
              color: "#4e5968",
              lineHeight: 1.6,
              padding: "0 8px",
            }}
          >
            {result.description}
          </div>
        </div>
        <Button
          display="block"
          variant="weak"
          color="dark"
          onClick={handleShare}
          loading={isSharing}
          style={{ width: "100%", marginTop: "16px" }}
        >
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Share2 size={16} />
            결과 카드 공유하기
          </span>
        </Button>
        <div
          style={{
            display: "flex",
            gap: "8px",
            width: "100%",
            marginTop: "8px",
          }}
        >
          <Button
            display="block"
            variant="weak"
            color="dark"
            onClick={onRetry}
            style={{ flex: 1 }}
          >
            다시 하기
          </Button>
          <Button
            display="block"
            variant="fill"
            onClick={onDone}
            style={{ flex: 1, ...PRIMARY_FILL_BUTTON_TEXT_STYLE }}
          >
            프로필로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}
