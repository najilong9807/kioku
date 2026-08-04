import { Button, Checkbox, Modal, ProgressBar } from "@toss/tds-mobile";
import { ChevronLeft, X } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { AvatarIcon } from "./lib/avatars";
import {
  computeFoodTestResult,
  FOOD_CATEGORY_AVATAR_STYLE,
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

const ANSWER_LETTERS: readonly AnswerLetter[] = ["A", "B", "C"];

// 브랜드 색(노란색)이 밝아서 흰 글씨는 가독성이 떨어져요. App.tsx/ProfileView.tsx의
// 동명 상수와 같은 이유예요.
const PRIMARY_FILL_BUTTON_TEXT_STYLE = {
  "--button-color": "#000000",
} as CSSProperties;

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
          여정 스타일과 음식 취향을 알아보는 40문항 테스트예요.
          <br />약 8~10분 정도 걸려요.
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
      <ProgressBar progress={index / total} size="normal" color="#ffc107" />
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
                color: "#6b8f71",
                backgroundColor: "#EAF0EA",
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
                    ? "2px solid #9CAF9A"
                    : "1px solid #e5e8eb",
                  backgroundColor: isSelected ? "#EAF0EA" : "#f9fafb",
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
                    color: isSelected ? "#6b8f71" : "#9CAF9A",
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
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#9a6b00" }}>
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
        <div style={{ fontSize: "24px", fontWeight: 800, color: "#191f28" }}>
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
        <div
          style={{
            display: "flex",
            gap: "8px",
            width: "100%",
            marginTop: "16px",
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
