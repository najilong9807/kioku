import { Button, List, ListRow, Result, Skeleton } from "@toss/tds-mobile";
import { useEffect, useState, type MouseEvent } from "react";
import { EmptyBookmarkIcon, EmptyStateFigure } from "./lib/emptyStateIcons";
import { fetchScrapedPosts, toggleScrap } from "./lib/postScraps";
import type { ThreadPost } from "./lib/threadPosts";

const PREVIEW_MAX_LENGTH = 44;

function truncateForPreview(text: string, maxLength: number): string {
  const singleLine = text.replace(/\s+/g, " ").trim();
  return singleLine.length > maxLength
    ? `${singleLine.slice(0, maxLength)}…`
    : singleLine;
}

function formatScrapDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// 홈 화면 "스크랩" 퀵액션에서 여는 모아보기 목록이에요. TodayMealBoard가 갖고 있는
// 댓글/좋아요 등 무거운 상호작용 없이, 내가 스크랩한 글만 가볍게 훑어보고
// 필요하면 스크랩을 해제할 수 있게 하는 용도라 별도 화면으로 분리했어요.
// 글 자체를 눌렀을 때는(원글 상세/댓글로 바로 들어가지 않고) "오늘의 한 입" 탭으로
// 이동해요 — 홈 화면의 "최근 오늘의 한 입" 미리보기와 같은 방식이에요.
export default function ScrapsView({
  userHash,
  onViewPost,
}: {
  userHash: string | null;
  onViewPost: (post: ThreadPost) => void;
}) {
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!userHash) {
      setPosts([]);
      setIsLoaded(true);
      return;
    }

    let isMounted = true;
    setIsLoaded(false);

    fetchScrapedPosts(userHash).then((scraped) => {
      if (isMounted) {
        setPosts(scraped);
        setIsLoaded(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [userHash]);

  const handleUnscrap = async (event: MouseEvent, post: ThreadPost) => {
    event.stopPropagation();
    if (!userHash) {
      return;
    }
    // 실패해도 조용히 목록에 그대로 남겨둬요(다음에 열었을 때 다시 시도할 수 있어요).
    const result = await toggleScrap(post.id, userHash);
    if (result === false) {
      setPosts((prev) => prev.filter((item) => item.id !== post.id));
    }
  };

  return (
    <div style={{ padding: "0 0 24px" }}>
      {!isLoaded ? (
        <div style={{ padding: "0 24px" }}>
          <Skeleton custom={["listWithIcon"]} repeatLastItemCount={3} />
        </div>
      ) : posts.length === 0 ? (
        <Result
          figure={
            <EmptyStateFigure
              icon={<EmptyBookmarkIcon size={32} color="#4A6350" />}
            />
          }
          title="아직 스크랩한 글이 없어요"
          description={"오늘의 한 입에서 마음에 드는 글을\n스크랩해보세요."}
        />
      ) : (
        <List>
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => onViewPost(post)}
              style={{ cursor: "pointer" }}
            >
              <ListRow
                withTouchEffect
                left={
                  post.photoUrl ? (
                    <ListRow.AssetImage
                      src={post.photoUrl}
                      shape="squircle"
                      size="medium"
                    />
                  ) : undefined
                }
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top={truncateForPreview(post.content, PREVIEW_MAX_LENGTH)}
                    bottom={[
                      post.authorNickname,
                      post.neighborhood,
                      formatScrapDate(post.createdAt),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                }
                right={
                  <Button
                    size="small"
                    variant="weak"
                    color="dark"
                    onClick={(event) => handleUnscrap(event, post)}
                  >
                    해제
                  </Button>
                }
              />
            </div>
          ))}
        </List>
      )}
    </div>
  );
}
