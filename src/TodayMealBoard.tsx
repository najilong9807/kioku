import {
  Asset,
  Border,
  Button,
  List,
  ListRow,
  Result,
  TextArea,
  TextField,
  useBottomSheet,
  useDialog,
} from "@toss/tds-mobile";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { resizeImageFile } from "./lib/imageResize";
import { fetchProfile } from "./lib/profile";
import {
  addRecentNeighborhood,
  getRecentNeighborhoods,
} from "./lib/recentNeighborhoods";
import {
  createComment,
  createTodayMealPost,
  deleteThreadPost,
  fetchComments,
  fetchTodayMealPosts,
  type ThreadComment,
  type ThreadPost,
} from "./lib/threadPosts";
import { getUserIdentityHash } from "./lib/userIdentity";
import { NeighborhoodInput } from "./NeighborhoodInput";
import { HANDWRITING_TEXT_STYLE } from "./theme";

// 첨부 사진은 가로 폭 기준 이 값 이하로 리사이즈해서 저장해요.
const MAX_PHOTO_WIDTH = 800;

const ALL_NEIGHBORHOODS = "전체";

// 브랜드 색(노란색)이 밝아서 흰 글씨는 가독성이 떨어져요.
// variant="fill" + color="primary"(기본값) 버튼은 이 스타일로 글자색을 진하게 덮어써요.
const PRIMARY_FILL_BUTTON_TEXT_STYLE = {
  "--button-color": "#000000",
} as CSSProperties;

function formatPostTime(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isSameDay) {
    return time;
  }

  const dateLabel = date.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
  return `${dateLabel} ${time}`;
}

// 바텀시트에 넘기는 children은 open() 호출 시점에 한 번 고정돼요.
// 그래서 입력 상태는 바깥 컴포넌트가 아니라 이 컴포넌트 자신이 들고 있어야
// 타이핑마다 이 컴포넌트만 다시 렌더링되어 반영돼요.
function PostForm({
  neighborhoodSuggestions,
  onCancel,
  onSubmit,
}: {
  neighborhoodSuggestions: string[];
  onCancel: () => void;
  onSubmit: (
    content: string,
    photoUrl: string | null,
    neighborhood: string,
  ) => void;
}) {
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [neighborhood, setNeighborhood] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const trimmed = content.trim();

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 연달아 선택해도 매번 onChange가 발생하도록 값을 비워둬요.
    event.target.value = "";
    if (!file) {
      return;
    }

    setIsResizing(true);
    try {
      const resized = await resizeImageFile(file, MAX_PHOTO_WIDTH);
      setPhoto(resized);
    } catch (error) {
      console.error("사진을 처리하지 못했어요.", error);
    } finally {
      setIsResizing(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "0 24px 24px",
      }}
    >
      <TextArea
        variant="box"
        placeholder="오늘 뭐 드셨나요? 자유롭게 남겨보세요"
        minHeight={120}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={HANDWRITING_TEXT_STYLE}
      />

      <NeighborhoodInput
        value={neighborhood}
        onChange={setNeighborhood}
        suggestions={neighborhoodSuggestions}
      />

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handlePhotoChange}
      />
      {photo ? (
        <div
          style={{ display: "flex", justifyContent: "center", gap: "12px" }}
        >
          <Asset.Image
            src={photo}
            alt="첨부한 사진"
            scaleType="crop"
            frameShape={{ width: 64, height: 64, radius: 12 }}
          />
          <Button
            size="small"
            variant="weak"
            color="dark"
            onClick={() => photoInputRef.current?.click()}
          >
            다시 선택
          </Button>
          <Button
            size="small"
            variant="weak"
            color="danger"
            onClick={() => setPhoto(null)}
          >
            삭제
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="weak"
            color="dark"
            loading={isResizing}
            onClick={() => photoInputRef.current?.click()}
          >
            📷 사진 첨부 (선택)
          </Button>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <Button
          style={{ flex: 1 }}
          variant="weak"
          color="dark"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button
          style={{ flex: 1, ...PRIMARY_FILL_BUTTON_TEXT_STYLE }}
          variant="fill"
          disabled={!trimmed || isResizing}
          onClick={() => onSubmit(trimmed, photo, neighborhood.trim())}
        >
          작성
        </Button>
      </div>
    </div>
  );
}

// 댓글 바텀시트의 내용이에요. 목록/입력 상태를 이 컴포넌트가 직접 들고 있어서
// 댓글을 달거나 지울 때마다 이 부분만 다시 렌더링돼요. onChanged는 댓글 개수가
// 달라졌을 때 바깥 게시글 목록(댓글 수 표시)을 새로고침하기 위한 콜백이에요.
function CommentsSheetContent({
  postId,
  currentUserId,
  onChanged,
  onClose,
}: {
  postId: string;
  currentUserId: string | null;
  onChanged: () => void;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<ThreadComment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { openConfirm, openAlert } = useDialog();

  const loadComments = useCallback(async () => {
    const loaded = await fetchComments(postId);
    setComments(loaded);
    setIsLoaded(true);
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async () => {
    const trimmed = commentInput.trim();
    if (!trimmed) {
      return;
    }

    if (!currentUserId) {
      await openAlert({
        title: "닉네임 설정이 필요해요",
        description: "닉네임을 먼저 설정한 뒤에 댓글을 쓸 수 있어요.",
        alertButton: "확인",
      });
      return;
    }

    setIsSubmitting(true);
    const success = await createComment(currentUserId, postId, trimmed);
    setIsSubmitting(false);

    if (success) {
      setCommentInput("");
      await loadComments();
      onChanged();
    } else {
      await openAlert({
        title: "댓글 작성에 실패했어요",
        description: "잠시 후 다시 시도해 주세요.",
        alertButton: "확인",
      });
    }
  };

  const handleDelete = async (comment: ThreadComment) => {
    const confirmed = await openConfirm({
      title: "이 댓글을 삭제할까요?",
      description: "삭제한 댓글은 다시 되돌릴 수 없어요.",
      confirmButton: "삭제",
      cancelButton: "취소",
    });

    if (!confirmed) {
      return;
    }

    const success = await deleteThreadPost(comment.id);
    if (success) {
      setComments((prev) => prev.filter((item) => item.id !== comment.id));
      onChanged();
    } else {
      await openAlert({
        title: "삭제에 실패했어요",
        description: "잠시 후 다시 시도해 주세요.",
        alertButton: "확인",
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "0 24px 24px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button size="small" variant="weak" color="dark" onClick={onClose}>
          닫기
        </Button>
      </div>

      <div
        style={{
          maxHeight: "320px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!isLoaded ? null : comments.length === 0 ? (
          <div
            style={{
              padding: "24px 0",
              textAlign: "center",
              color: "#8b95a1",
              fontSize: "14px",
            }}
          >
            아직 댓글이 없어요. 첫 댓글을 남겨보세요.
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #f2f4f6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#191f28",
                  }}
                >
                  {comment.authorNickname}
                </span>
                <span style={{ fontSize: "11px", color: "#8b95a1" }}>
                  {formatPostTime(comment.createdAt)}
                </span>
              </div>
              <div
                style={{
                  marginTop: "4px",
                  fontSize: "14px",
                  color: "#191f28",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {comment.content}
              </div>
              {comment.userId === currentUserId && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "4px",
                  }}
                >
                  <Button
                    size="small"
                    variant="weak"
                    color="danger"
                    onClick={() => handleDelete(comment)}
                  >
                    삭제
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <TextField
          variant="box"
          placeholder="댓글을 남겨보세요"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button
          variant="fill"
          style={PRIMARY_FILL_BUTTON_TEXT_STYLE}
          disabled={!commentInput.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          등록
        </Button>
      </div>
    </div>
  );
}

function TodayMealBoard() {
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState(ALL_NEIGHBORHOODS);

  const { open, close } = useBottomSheet();
  const { openConfirm, openAlert } = useDialog();

  const loadPosts = useCallback(async () => {
    const loaded = await fetchTodayMealPosts();
    setPosts(loaded);
    setIsLoaded(true);
  }, []);

  // 글 목록에 실제로 등장한 동네들이에요. 필터 목록과, 글쓰기 폼의 추천 칩에도 함께 써요.
  const neighborhoodsInPosts = useMemo(
    () =>
      Array.from(
        new Set(
          posts
            .map((post) => post.neighborhood)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    [posts],
  );

  const neighborhoodFilterOptions = useMemo(
    () => [ALL_NEIGHBORHOODS, ...neighborhoodsInPosts],
    [neighborhoodsInPosts],
  );

  // 글쓰기 폼에 보여줄 추천 동네예요. 내가 최근에 직접 입력했던 동네를 먼저 보여주고,
  // 그동안 이 게시판에 올라온 동네들도 이어서 보여줘요.
  const neighborhoodSuggestions = useMemo(() => {
    const recent = getRecentNeighborhoods();
    return Array.from(new Set([...recent, ...neighborhoodsInPosts])).slice(
      0,
      12,
    );
  }, [neighborhoodsInPosts]);

  const visiblePosts = useMemo(() => {
    if (selectedNeighborhood === ALL_NEIGHBORHOODS) {
      return posts;
    }
    return posts.filter((post) => post.neighborhood === selectedNeighborhood);
  }, [posts, selectedNeighborhood]);

  // 게시글 목록을 불러오고, 삭제 버튼 노출 여부를 판단할 현재 사용자의
  // anon_profiles.id를 함께 조회해요.
  useEffect(() => {
    let isMounted = true;

    loadPosts();

    (async () => {
      const userHash = await getUserIdentityHash();
      const profile = await fetchProfile(userHash);
      if (!isMounted) {
        return;
      }
      setCurrentUserId(profile?.id ?? null);
    })();

    return () => {
      isMounted = false;
    };
  }, [loadPosts]);

  const openWriteSheet = () => {
    open({
      header: "오늘 뭐 드셨나요?",
      children: (
        <PostForm
          neighborhoodSuggestions={neighborhoodSuggestions}
          onCancel={close}
          onSubmit={async (content, photoUrl, neighborhood) => {
            close();

            if (!currentUserId) {
              await openAlert({
                title: "닉네임 설정이 필요해요",
                description: "닉네임을 먼저 설정한 뒤에 글을 쓸 수 있어요.",
                alertButton: "확인",
              });
              return;
            }

            const success = await createTodayMealPost(
              currentUserId,
              content,
              photoUrl,
              neighborhood || null,
            );
            if (success) {
              if (neighborhood) {
                addRecentNeighborhood(neighborhood);
              }
              await loadPosts();
            } else {
              await openAlert({
                title: "글 작성에 실패했어요",
                description: "잠시 후 다시 시도해 주세요.",
                alertButton: "확인",
              });
            }
          }}
        />
      ),
    });
  };

  const openNeighborhoodFilterSheet = () => {
    open({
      header: "동네 선택",
      children: (
        <List>
          {neighborhoodFilterOptions.map((neighborhood) => {
            const isSelected = neighborhood === selectedNeighborhood;
            return (
              <div
                key={neighborhood}
                onClick={() => {
                  setSelectedNeighborhood(neighborhood);
                  close();
                }}
                style={{ cursor: "pointer" }}
              >
                <ListRow
                  withTouchEffect
                  contents={
                    <ListRow.Texts
                      type="1RowTypeA"
                      top={
                        <span style={{ fontWeight: isSelected ? 700 : 400 }}>
                          {neighborhood}
                        </span>
                      }
                    />
                  }
                  right={isSelected ? "✓" : undefined}
                />
              </div>
            );
          })}
        </List>
      ),
    });
  };

  const handleDelete = async (post: ThreadPost) => {
    const confirmed = await openConfirm({
      title: "이 글을 삭제할까요?",
      description: "삭제한 글은 다시 되돌릴 수 없어요.",
      confirmButton: "삭제",
      cancelButton: "취소",
    });

    if (!confirmed) {
      return;
    }

    const success = await deleteThreadPost(post.id);
    if (success) {
      setPosts((prev) => prev.filter((item) => item.id !== post.id));
    } else {
      await openAlert({
        title: "삭제에 실패했어요",
        description: "잠시 후 다시 시도해 주세요.",
        alertButton: "확인",
      });
    }
  };

  const openCommentsSheet = (post: ThreadPost) => {
    open({
      header: "댓글",
      children: (
        <CommentsSheetContent
          postId={post.id}
          currentUserId={currentUserId}
          onChanged={loadPosts}
          onClose={close}
        />
      ),
    });
  };

  return (
    <>
      <div style={{ padding: "0 24px 16px" }}>
        <Button
          display="block"
          variant="fill"
          style={PRIMARY_FILL_BUTTON_TEXT_STYLE}
          onClick={openWriteSheet}
        >
          글쓰기
        </Button>
      </div>

      {neighborhoodsInPosts.length > 0 && (
        <div style={{ padding: "0 24px 16px" }}>
          <Button
            size="medium"
            variant="weak"
            color="dark"
            onClick={openNeighborhoodFilterSheet}
          >
            {selectedNeighborhood} ▾
          </Button>
        </div>
      )}

      {!isLoaded ? null : posts.length === 0 ? (
        <Result
          title="아직 올라온 글이 없어요"
          description={"오늘 먹은 메뉴를\n자유롭게 나눠보세요."}
        />
      ) : visiblePosts.length === 0 ? (
        <Result
          title="해당 동네의 글이 없어요"
          description={"다른 동네를 선택하거나\n전체 글을 확인해 보세요."}
        />
      ) : (
        <div>
          {visiblePosts.map((post) => (
            <div key={post.id}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  padding: "16px 24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#191f28",
                    }}
                  >
                    {post.authorNickname}
                    {post.neighborhood && (
                      <span style={{ fontWeight: 400, color: "#8b95a1" }}>
                        {" "}
                        · {post.neighborhood}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: "12px", color: "#8b95a1" }}>
                    {formatPostTime(post.createdAt)}
                  </span>
                </div>
                {post.photoUrl && (
                  <Asset.Image
                    src={post.photoUrl}
                    alt="게시글 사진"
                    scaleType="crop"
                    frameShape={{ width: 160, height: 160, radius: 16 }}
                  />
                )}
                <div
                  style={{
                    ...HANDWRITING_TEXT_STYLE,
                    color: "#191f28",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {post.content}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Button
                    size="small"
                    variant="weak"
                    color="dark"
                    onClick={() => openCommentsSheet(post)}
                  >
                    댓글{post.commentCount > 0 ? ` ${post.commentCount}` : ""}
                  </Button>
                  {post.userId === currentUserId && (
                    <Button
                      size="small"
                      variant="weak"
                      color="danger"
                      onClick={() => handleDelete(post)}
                    >
                      삭제
                    </Button>
                  )}
                </div>
              </div>
              <Border />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default TodayMealBoard;
