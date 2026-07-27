import { Asset, Badge, Button, Top } from "@toss/tds-mobile";
import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Top
        title={<Top.TitleParagraph size={22}>반가워요</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={17}>
            앱인토스 개발을 시작해 보세요.
          </Top.SubtitleParagraph>
        }
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "24px",
        }}
      >
        <Button
          as="a"
          variant="weak"
          href="https://developers-apps-in-toss.toss.im"
          target="_blank"
          rel="noopener noreferrer"
        >
          개발자센터
        </Button>
        <Button
          as="a"
          variant="weak"
          href="https://techchat-apps-in-toss.toss.im"
          target="_blank"
          rel="noopener noreferrer"
        >
          개발자 커뮤니티
        </Button>
        <Button variant="fill" onClick={() => setCount((prev) => prev + 1)}>
          버튼 눌러보기 <Badge size="small" color="blue" variant="weak">{count}</Badge>
        </Button>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <Asset.Image
          alt="apps in toss logo"
          frameShape={{ width: 160 }}
          backgroundColor="transparent"
          src={`${import.meta.env.BASE_URL}appsintoss-logo.png`}
        />
      </div>
    </>
  );
}

export default App;
