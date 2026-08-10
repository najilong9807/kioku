import {
  Asset,
  Badge,
  Border,
  Button,
  Result,
  SegmentedControl,
  TextArea,
  TextField,
  useBottomSheet,
  useDialog,
} from "@toss/tds-mobile";
import { Heart, MessageCircle } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { PhotoSticker } from "./components/scrapbook/PhotoSticker";
import { WashiTape } from "./components/scrapbook/WashiTape";
import { fetchLikedCommentIds, toggleCommentLike } from "./lib/commentLikes";
import { EmptyChatIcon, EmptyStateFigure } from "./lib/emptyStateIcons";
import { resizeImageFile } from "./lib/imageResize";
import {
  buildFullRegionOptions,
  formatRegionLabel,
  matchesRegion,
} from "./lib/koreanRegions";
import {
  createNotification,
  fetchUserHashByProfileId,
} from "./lib/notifications";
import { fetchLikedPostIds, toggleLike } from "./lib/postLikes";
import { fetchScrapedPostIds, toggleScrap } from "./lib/postScraps";
import { fetchProfile } from "./lib/profile";
import { BookmarkRibbonIcon } from "./lib/quickActionIcons";
import { pickRandomItem } from "./lib/random";
import { SheetHeader } from "./lib/SheetHeader";
import {
  createComment,
  createTodayMealPost,
  deleteThreadPost,
  fetchComments,
  fetchPostsByAuthor,
  fetchTodayMealPosts,
  type ThreadComment,
  type ThreadPost,
} from "./lib/threadPosts";
import { getUserIdentityHash } from "./lib/userIdentity";
import { RegionFilterSheetContent, RegionPicker } from "./RegionPicker";
import {
  BRAND_DISPLAY_FONT_FAMILY,
  CORAL_RED,
  DARK_NAVY,
  HANDWRITING_TEXT_STYLE,
  PAPER_CREAM,
} from "./theme";

// 첨부 사진은 가로 폭 기준 이 값 이하로 리사이즈해서 저장해요.
const MAX_PHOTO_WIDTH = 800;

// "오늘의 한 입" 탭 검색창(관심 있는 맛집 검색 버튼) 문구예요. 탭에 들어갈
// 때마다 랜덤으로 하나 골라서 보여줘요.
const TODAY_MEAL_SEARCH_PLACEHOLDERS = [
  "다른 사람들의 한 입을 검색해보세요",
  "궁금한 메뉴나 맛집을 찾아보세요",
] as const;

type PostSortOption = "latest" | "popular";
type CommentSortOption = "latest" | "popular";

// 브랜드 색(노란색)이 밝아서 흰 글씨는 가독성이 떨어져요.
// variant="fill" + color="primary"(기본값) 버튼은 이 스타일로 글자색을 진하게 덮어써요.
const PRIMARY_FILL_BUTTON_TEXT_STYLE = {
  "--button-color": "#000000",
} as CSSProperties;

// 메인 피드의 "글쓰기" CTA만 리디자인 브랜드 컬러(Coral Red)로 강조해요.
// 다른 화면(작성 시트 제출 버튼 등)의 노란 버튼은 이번 스코프에서는
// 그대로 둬요.
const CORAL_FILL_BUTTON_STYLE = {
  "--button-background-color": CORAL_RED,
  "--button-color": "#ffffff",
} as CSSProperties;

// 닉네임이 아무리 길어도 옆에 나란히 있는 배지·시간이 밀려나지 않도록, 닉네임
// 쪽에만 한 줄 말줄임을 적용해요. App.tsx의 동명 상수 주석에 -webkit-line-clamp를
// 쓰는 이유가 설명되어 있어요.
const NAME_ELLIPSIS_STYLE: CSSProperties = {
  flex: "1 1 auto",
  minWidth: 0,
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  wordBreak: "break-all",
};

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

// 글/댓글의 작성자 닉네임이에요. 클릭하면 그 사람이 쓴 글만 모아보는 화면으로
// 이동해요. 작성자 id를 알 수 없는 경우("알 수 없음")엔 클릭할 수 없어요.
function NicknameButton({
  userId,
  nickname,
  onClick,
  style,
}: {
  userId: string;
  nickname: string;
  onClick: (userId: string, nickname: string) => void;
  style?: CSSProperties;
}) {
  if (!userId) {
    return <span style={style}>{nickname}</span>;
  }

  return (
    <button
      type="button"
      onClick={() => onClick(userId, nickname)}
      style={{
        border: "none",
        background: "none",
        padding: 0,
        margin: 0,
        font: "inherit",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      {nickname}
    </button>
  );
}

// 바텀시트에 넘기는 children은 open() 호출 시점에 한 번 고정돼요.
// 그래서 입력 상태는 바깥 컴포넌트가 아니라 이 컴포넌트 자신이 들고 있어야
// 타이핑마다 이 컴포넌트만 다시 렌더링되어 반영돼요.
function PostForm({
  onCancel,
  onSubmit,
  onDirtyChange,
}: {
  onCancel: () => void;
  onSubmit: (
    content: string,
    photoUrl: string | null,
    neighborhood: string,
    isReservation: boolean,
  ) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}) {
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [neighborhood, setNeighborhood] = useState("");
  const [isReservation, setIsReservation] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const trimmed = content.trim();

  useEffect(() => {
    onDirtyChange?.(
      trimmed.length > 0 ||
        photo !== null ||
        neighborhood.trim().length > 0 ||
        isReservation,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed, photo, neighborhood, isReservation]);

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

      <RegionPicker value={neighborhood} onChange={setNeighborhood} />

      <label
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderRadius: "12px",
          backgroundColor: "#f2f4f6",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: "15px", color: "#191f28", fontWeight: 500 }}>
          예약하고 갔어요
        </span>
        <input
          type="checkbox"
          checked={isReservation}
          onChange={(e) => setIsReservation(e.target.checked)}
          style={{ width: "22px", height: "22px" }}
        />
      </label>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handlePhotoChange}
      />
      {photo ? (
        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
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
          onClick={() =>
            onSubmit(trimmed, photo, neighborhood.trim(), isReservation)
          }
        >
          작성
        </Button>
      </div>
    </div>
  );
}

// 닉네임을 클릭했을 때 열리는, 그 사람이 쓴 오늘뭐먹 글만 모아보는 화면이에요.
// 팔로우 관계를 저장하지 않고 그때그때 훑어보는 가벼운 용도라, 좋아요/댓글 같은
// 상호작용 없이 내용만 읽기 전용으로 보여줘요.
function AuthorPostsSheetContent({
  authorId,
  authorNickname,
}: {
  authorId: string;
  authorNickname: string;
}) {
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchPostsByAuthor(authorId).then((loaded) => {
      if (isMounted) {
        setPosts(loaded);
        setIsLoaded(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [authorId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* 이 화면(누군가의 글 모아보기)에서만 붙이는 테이프예요. 다른 장식은
          더하지 않았어요. */}
      <div style={{ position: "relative", height: "18px", margin: "0 24px" }}>
        <WashiTape
          color="sage"
          rotation={-2}
          width={110}
          height={18}
          style={{ top: 0, left: 0 }}
        />
      </div>
      {!isLoaded ? null : posts.length === 0 ? (
        <Result
          title="아직 쓴 글이 없어요"
          description={`${authorNickname}님이 오늘의 한 입에\n쓴 글이 아직 없어요.`}
        />
      ) : (
        <div
          style={{
            maxHeight: "60vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "12px 24px",
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
                <span style={{ fontSize: "12px", color: "#8b95a1" }}>
                  {post.neighborhood ?? ""}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {post.isReservation && (
                    <Badge size="xsmall" variant="weak" color="green">
                      예약
                    </Badge>
                  )}
                  <span style={{ fontSize: "12px", color: "#8b95a1" }}>
                    {formatPostTime(post.createdAt)}
                  </span>
                </span>
              </div>
              {post.photoUrl && (
                <PhotoSticker src={post.photoUrl} alt="게시글 사진" size={120} />
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
              <span style={{ fontSize: "12px", color: "#8b95a1" }}>
                좋아요 {post.likeCount} · 댓글 {post.commentCount}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 댓글 바텀시트의 내용이에요. 목록/입력 상태를 이 컴포넌트가 직접 들고 있어서
// 댓글을 달거나 지울 때마다 이 부분만 다시 렌더링돼요. onChanged는 댓글 개수가
// 달라졌을 때 바깥 게시글 목록(댓글 수 표시)을 새로고침하기 위한 콜백이에요.
function CommentsSheetContent({
  postId,
  postAuthorId,
  currentUserId,
  currentUserNickname,
  currentUserHash,
  onChanged,
  onOpenAuthorPosts,
  onDirtyChange,
}: {
  postId: string;
  postAuthorId: string;
  currentUserId: string | null;
  currentUserNickname: string | null;
  currentUserHash: string | null;
  onChanged: () => void;
  onOpenAuthorPosts: (authorId: string, authorNickname: string) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}) {
  const [comments, setComments] = useState<ThreadComment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(
    new Set(),
  );
  const [commentSortOption, setCommentSortOption] =
    useState<CommentSortOption>("latest");

  const { openConfirm, openAlert } = useDialog();

  useEffect(() => {
    onDirtyChange?.(commentInput.trim().length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentInput]);

  const loadComments = useCallback(async () => {
    const loaded = await fetchComments(postId);
    setComments(loaded);
    setIsLoaded(true);
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // 댓글 목록이나 현재 사용자가 바뀔 때마다, 그중 내가 좋아요를 누른 댓글 id 집합을
  // 다시 계산해요. 게시글 좋아요와 같은 패턴이에요.
  useEffect(() => {
    if (!currentUserHash || comments.length === 0) {
      setLikedCommentIds(new Set());
      return;
    }

    let isMounted = true;

    fetchLikedCommentIds(
      comments.map((comment) => comment.id),
      currentUserHash,
    ).then((liked) => {
      if (isMounted) {
        setLikedCommentIds(liked);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [comments, currentUserHash]);

  // 기본은 최신순(작성일 내림차순)이고, 인기순을 고르면 좋아요 개수 기준으로
  // 다시 정렬해요. fetchComments는 항상 오래된순(대화 순서)으로 가져오기 때문에,
  // 정렬은 화면에서 클라이언트 사이드로 처리해요.
  const sortedComments = useMemo(() => {
    if (commentSortOption === "popular") {
      return [...comments].sort((a, b) => b.likeCount - a.likeCount);
    }
    return [...comments].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [comments, commentSortOption]);

  const handleToggleCommentLike = async (comment: ThreadComment) => {
    if (!currentUserHash) {
      await openAlert({
        title: "닉네임 설정이 필요해요",
        description: "닉네임을 먼저 설정한 뒤에 좋아요를 누를 수 있어요.",
        alertButton: "확인",
        closeOnDimmerClick: true,
      });
      return;
    }

    const result = await toggleCommentLike(comment.id, currentUserHash);
    if (result === null) {
      await openAlert({
        title: "요청에 실패했어요",
        description: "잠시 후 다시 시도해 주세요.",
        alertButton: "확인",
        closeOnDimmerClick: true,
      });
      return;
    }

    setLikedCommentIds((prev) => {
      const next = new Set(prev);
      if (result) {
        next.add(comment.id);
      } else {
        next.delete(comment.id);
      }
      return next;
    });
    setComments((prev) =>
      prev.map((item) =>
        item.id === comment.id
          ? {
              ...item,
              likeCount: item.likeCount + (result ? 1 : -1),
            }
          : item,
      ),
    );
  };

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
        closeOnDimmerClick: true,
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

      // 본인 글에 본인이 단 댓글이 아닐 때만 글 작성자에게 알림을 남겨요.
      if (postAuthorId !== currentUserId) {
        const recipientHash = await fetchUserHashByProfileId(postAuthorId);
        if (recipientHash) {
          await createNotification(
            recipientHash,
            currentUserNickname ?? "알 수 없음",
            "comment",
            postId,
          );
        }
      }
    } else {
      await openAlert({
        title: "댓글 작성에 실패했어요",
        description: "잠시 후 다시 시도해 주세요.",
        alertButton: "확인",
        closeOnDimmerClick: true,
      });
    }
  };

  const handleDelete = async (comment: ThreadComment) => {
    const confirmed = await openConfirm({
      title: "이 댓글을 삭제할까요?",
      description: "삭제한 댓글은 다시 되돌릴 수 없어요.",
      confirmButton: "삭제",
      cancelButton: "취소",
      closeOnDimmerClick: true,
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
        closeOnDimmerClick: true,
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
      {comments.length > 0 && (
        <SegmentedControl
          size="small"
          value={commentSortOption}
          onChange={(value) => setCommentSortOption(value as CommentSortOption)}
        >
          <SegmentedControl.Item value="latest">최신순</SegmentedControl.Item>
          <SegmentedControl.Item value="popular">인기순</SegmentedControl.Item>
        </SegmentedControl>
      )}

      <div
        style={{
          maxHeight: "320px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!isLoaded ? null : sortedComments.length === 0 ? (
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
          sortedComments.map((comment) => (
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
                  gap: "6px",
                }}
              >
                <NicknameButton
                  userId={comment.userId}
                  nickname={comment.authorNickname}
                  onClick={onOpenAuthorPosts}
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#191f28",
                    ...NAME_ELLIPSIS_STYLE,
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "#8b95a1",
                    flexShrink: 0,
                  }}
                >
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "4px",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleToggleCommentLike(comment)}
                  aria-label={
                    likedCommentIds.has(comment.id) ? "좋아요 취소" : "좋아요"
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    border: "none",
                    background: "none",
                    padding: "4px 6px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: likedCommentIds.has(comment.id)
                      ? "#f04452"
                      : "#6b7684",
                    fontSize: "12px",
                    fontWeight: 600,
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <Heart
                    size={14}
                    color={
                      likedCommentIds.has(comment.id) ? "#f04452" : "#6b7684"
                    }
                    fill={likedCommentIds.has(comment.id) ? "#f04452" : "none"}
                  />
                  {comment.likeCount > 0 ? comment.likeCount : ""}
                </button>
                {comment.userId === currentUserId && (
                  <Button
                    size="small"
                    variant="weak"
                    color="danger"
                    onClick={() => handleDelete(comment)}
                  >
                    삭제
                  </Button>
                )}
              </div>
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

function TodayMealBoard({
  onOpenRestaurantSearch,
}: {
  onOpenRestaurantSearch: () => void;
}) {
  // 탭에 들어올 때마다(컴포넌트가 새로 마운트될 때마다) 랜덤으로 하나 골라요.
  const [searchEntryLabel] = useState(() =>
    pickRandomItem(TODAY_MEAL_SEARCH_PLACEHOLDERS),
  );
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserHash, setCurrentUserHash] = useState<string | null>(null);
  const [currentUserNickname, setCurrentUserNickname] = useState<string | null>(
    null,
  );
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [scrapedPostIds, setScrapedPostIds] = useState<Set<string>>(new Set());
  // null이면 "전체"예요.
  const [filterProvince, setFilterProvince] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<PostSortOption>("latest");

  const { open, close } = useBottomSheet();
  const { openConfirm, openAlert } = useDialog();

  // App.tsx의 동명 패턴과 같아요: 폼(글쓰기/댓글)이 있는 바텀시트가
  // 열려있는 동안 입력값이 있는지 ref로 추적해요.
  const isFormDirtyRef = useRef(false);

  const handleGuardedDimmerClick = async () => {
    if (!isFormDirtyRef.current) {
      close();
      return;
    }
    const confirmed = await openConfirm({
      title: "작성 중인 내용이 있어요",
      description: "지금 닫으면 입력한 내용이 사라져요. 닫으시겠어요?",
      confirmButton: "닫기",
      cancelButton: "계속 작성",
      closeOnDimmerClick: true,
    });
    if (confirmed) {
      close();
    }
  };

  const loadPosts = useCallback(async () => {
    const loaded = await fetchTodayMealPosts();
    setPosts(loaded);
    setIsLoaded(true);
  }, []);

  // 글이 아직 없는 지역도 미리 선택할 수 있도록, 실제 글 유무와 상관없이 전국
  // 시/도-시/군/구 전체를 필터 옵션으로 써요. 글이 없는 지역을 고르면 아래
  // visiblePosts가 자연히 비어서 "해당 동네의 글이 없어요" 빈 화면으로 이어져요.
  const regionFilterOptions = useMemo(() => buildFullRegionOptions(), []);

  // 기본은 최신순(fetchTodayMealPosts가 이미 created_at 최신순으로 가져와요)이고,
  // 인기순을 고르면 좋아요 개수 기준으로 다시 정렬해요.
  const visiblePosts = useMemo(() => {
    const filtered = posts.filter(
      (post) =>
        !filterProvince ||
        matchesRegion(post.neighborhood, filterProvince, filterDistrict ?? ""),
    );

    if (sortOption === "popular") {
      return [...filtered].sort((a, b) => b.likeCount - a.likeCount);
    }
    return filtered;
  }, [posts, filterProvince, filterDistrict, sortOption]);

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
      setCurrentUserHash(userHash);
      setCurrentUserId(profile?.id ?? null);
      setCurrentUserNickname(profile?.nickname ?? null);
    })();

    return () => {
      isMounted = false;
    };
  }, [loadPosts]);

  // 글 목록이나 현재 사용자가 바뀔 때마다, 그중 내가 좋아요를 누른 글 id 집합을
  // 다시 계산해요. 하트 아이콘을 채워서 보여줄지 판단하는 데 써요.
  useEffect(() => {
    if (!currentUserHash || posts.length === 0) {
      setLikedPostIds(new Set());
      return;
    }

    let isMounted = true;

    fetchLikedPostIds(
      posts.map((post) => post.id),
      currentUserHash,
    ).then((liked) => {
      if (isMounted) {
        setLikedPostIds(liked);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [posts, currentUserHash]);

  // 좋아요와 동일한 방식으로, 내가 스크랩한 글 id 집합을 다시 계산해요. 북마크
  // 아이콘을 채워서 보여줄지 판단하는 데 써요.
  useEffect(() => {
    if (!currentUserHash || posts.length === 0) {
      setScrapedPostIds(new Set());
      return;
    }

    let isMounted = true;

    fetchScrapedPostIds(
      posts.map((post) => post.id),
      currentUserHash,
    ).then((scraped) => {
      if (isMounted) {
        setScrapedPostIds(scraped);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [posts, currentUserHash]);

  const openWriteSheet = () => {
    open({
      header: <SheetHeader title="오늘 뭐 드셨나요?" onClose={close} />,
      onDimmerClick: handleGuardedDimmerClick,
      children: (
        <PostForm
          onCancel={close}
          onDirtyChange={(dirty) => {
            isFormDirtyRef.current = dirty;
          }}
          onSubmit={async (content, photoUrl, neighborhood, isReservation) => {
            close();

            if (!currentUserId) {
              await openAlert({
                title: "닉네임 설정이 필요해요",
                description: "닉네임을 먼저 설정한 뒤에 글을 쓸 수 있어요.",
                alertButton: "확인",
                closeOnDimmerClick: true,
              });
              return;
            }

            const success = await createTodayMealPost(
              currentUserId,
              content,
              photoUrl,
              neighborhood || null,
              isReservation,
            );
            if (success) {
              await loadPosts();
            } else {
              await openAlert({
                title: "글 작성에 실패했어요",
                description: "잠시 후 다시 시도해 주세요.",
                alertButton: "확인",
                closeOnDimmerClick: true,
              });
            }
          }}
        />
      ),
    });
  };

  const openNeighborhoodFilterSheet = () => {
    open({
      header: <SheetHeader title="동네 선택" onClose={close} />,
      onDimmerClick: close,
      children: (
        <RegionFilterSheetContent
          regionOptions={regionFilterOptions}
          selectedProvince={filterProvince}
          selectedDistrict={filterDistrict}
          onSelect={(province, district) => {
            setFilterProvince(province);
            setFilterDistrict(district);
            close();
          }}
        />
      ),
    });
  };

  const handleDelete = async (post: ThreadPost) => {
    const confirmed = await openConfirm({
      title: "이 글을 삭제할까요?",
      description: "삭제한 글은 다시 되돌릴 수 없어요.",
      confirmButton: "삭제",
      cancelButton: "취소",
      closeOnDimmerClick: true,
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
        closeOnDimmerClick: true,
      });
    }
  };

  const openCommentsSheet = (post: ThreadPost) => {
    open({
      header: <SheetHeader title="댓글" onClose={close} />,
      onDimmerClick: handleGuardedDimmerClick,
      children: (
        <CommentsSheetContent
          postId={post.id}
          postAuthorId={post.userId}
          currentUserId={currentUserId}
          currentUserNickname={currentUserNickname}
          currentUserHash={currentUserHash}
          onChanged={loadPosts}
          onOpenAuthorPosts={openAuthorPostsSheet}
          onDirtyChange={(dirty) => {
            isFormDirtyRef.current = dirty;
          }}
        />
      ),
    });
  };

  // 닉네임을 클릭하면 그 사람이 쓴 오늘뭐먹 글만 모아보는 화면을 열어요. 팔로우
  // 관계를 저장하지 않는 가벼운 방식이라, 바텀시트 내용을 그 사람의 글 목록으로
  // 바꿔치기만 해요(댓글 시트 안에서 눌러도 자연스럽게 그 화면으로 넘어가요).
  const openAuthorPostsSheet = (authorId: string, authorNickname: string) => {
    // 댓글 시트(폼 있음)에서 넘어올 수도 있는 화면이라, 여기로 넘어오는
    // 순간 이전 화면의 dirty 상태는 더 이상 유효하지 않아요.
    isFormDirtyRef.current = false;
    open({
      header: (
        <SheetHeader title={`${authorNickname}님의 글`} onClose={close} />
      ),
      onDimmerClick: close,
      children: (
        <AuthorPostsSheetContent
          authorId={authorId}
          authorNickname={authorNickname}
        />
      ),
    });
  };

  const handleToggleLike = async (post: ThreadPost) => {
    if (!currentUserHash) {
      await openAlert({
        title: "닉네임 설정이 필요해요",
        description: "닉네임을 먼저 설정한 뒤에 좋아요를 누를 수 있어요.",
        alertButton: "확인",
        closeOnDimmerClick: true,
      });
      return;
    }

    const result = await toggleLike(post.id, currentUserHash);
    if (result === null) {
      await openAlert({
        title: "요청에 실패했어요",
        description: "잠시 후 다시 시도해 주세요.",
        alertButton: "확인",
        closeOnDimmerClick: true,
      });
      return;
    }

    setLikedPostIds((prev) => {
      const next = new Set(prev);
      if (result) {
        next.add(post.id);
      } else {
        next.delete(post.id);
      }
      return next;
    });
    setPosts((prev) =>
      prev.map((item) =>
        item.id === post.id
          ? { ...item, likeCount: item.likeCount + (result ? 1 : -1) }
          : item,
      ),
    );

    // 좋아요를 새로 눌렀고(취소가 아니고) 본인 글이 아니면 알림을 남겨요.
    if (result && post.userId !== currentUserId) {
      const recipientHash = await fetchUserHashByProfileId(post.userId);
      if (recipientHash) {
        await createNotification(
          recipientHash,
          currentUserNickname ?? "알 수 없음",
          "like",
          post.id,
        );
      }
    }
  };

  // 좋아요와 달리 스크랩은 상대방에게 알리지 않아요(나만 보는 북마크 목록이라
  // 굳이 알림까지 남길 필요는 없다고 판단했어요). likeCount 같은 표시용 카운트도
  // 화면에 없어서, posts 배열을 따로 갱신할 필요 없이 scrapedPostIds만 바꿔요.
  const handleToggleScrap = async (post: ThreadPost) => {
    if (!currentUserHash) {
      await openAlert({
        title: "닉네임 설정이 필요해요",
        description: "닉네임을 먼저 설정한 뒤에 스크랩할 수 있어요.",
        alertButton: "확인",
        closeOnDimmerClick: true,
      });
      return;
    }

    const result = await toggleScrap(post.id, currentUserHash);
    if (result === null) {
      await openAlert({
        title: "요청에 실패했어요",
        description: "잠시 후 다시 시도해 주세요.",
        alertButton: "확인",
        closeOnDimmerClick: true,
      });
      return;
    }

    setScrapedPostIds((prev) => {
      const next = new Set(prev);
      if (result) {
        next.add(post.id);
      } else {
        next.delete(post.id);
      }
      return next;
    });
  };

  return (
    <div style={{ backgroundColor: PAPER_CREAM }}>
      {/* "TODAY'S BITE" 헤더예요(레퍼런스 "03_오늘의_한입.png" 기준). 이
          화면은 피드라 장식은 헤더 문구 톤 정도로만 최소화했어요. */}
      <div style={{ padding: "16px 24px 12px" }}>
        <div
          style={{
            fontFamily: BRAND_DISPLAY_FONT_FAMILY,
            fontSize: "26px",
            color: DARK_NAVY,
            lineHeight: 1.1,
          }}
        >
          TODAY&apos;S BITE
        </div>
        <div
          style={{
            marginTop: "2px",
            fontSize: "12px",
            fontWeight: 700,
            color: DARK_NAVY,
            opacity: 0.65,
            letterSpacing: "1px",
          }}
        >
          SHORT NOTES, BIG MEMORIES.
        </div>
      </div>

      <div style={{ padding: "0 24px 12px" }}>
        <button
          type="button"
          onClick={onOpenRestaurantSearch}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#f2f4f6",
            color: "#8b95a1",
            fontSize: "15px",
            textAlign: "left",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {/* App.tsx의 실제 SearchField와 같은 TDS 내장 돋보기 아이콘으로
              맞춰서, lucide 아이콘과 획 굵기가 미묘하게 달라 보이던 문제를
              없앴어요. */}
          <Asset.Icon
            name="icon-search-bold-mono"
            color="#8b95a1"
            frameShape={{ width: 18, height: 18 }}
            backgroundColor="transparent"
          />
          {searchEntryLabel}
        </button>
      </div>

      <div style={{ padding: "0 24px 16px" }}>
        <Button
          display="block"
          variant="fill"
          style={CORAL_FILL_BUTTON_STYLE}
          onClick={openWriteSheet}
        >
          글쓰기
        </Button>
      </div>

      <div style={{ padding: "0 24px 16px" }}>
        <SegmentedControl
          size="small"
          value={sortOption}
          onChange={(value) => setSortOption(value as PostSortOption)}
        >
          <SegmentedControl.Item value="latest">최신순</SegmentedControl.Item>
          <SegmentedControl.Item value="popular">인기순</SegmentedControl.Item>
        </SegmentedControl>
      </div>

      <div style={{ padding: "0 24px 16px" }}>
        <Button
          size="medium"
          variant="weak"
          color="dark"
          onClick={openNeighborhoodFilterSheet}
        >
          {filterProvince
            ? formatRegionLabel(filterProvince, filterDistrict)
            : "전체"}{" "}
          ▾
        </Button>
      </div>

      {!isLoaded ? null : posts.length === 0 ? (
        <Result
          figure={
            <EmptyStateFigure
              icon={<EmptyChatIcon size={32} color="#4A6350" />}
            />
          }
          title="아직 올라온 한 입이 없어요"
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
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#191f28",
                      ...NAME_ELLIPSIS_STYLE,
                    }}
                  >
                    <NicknameButton
                      userId={post.userId}
                      nickname={post.authorNickname}
                      onClick={openAuthorPostsSheet}
                    />
                    {post.neighborhood && (
                      <span style={{ fontWeight: 400, color: "#8b95a1" }}>
                        {" "}
                        · {post.neighborhood}
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexShrink: 0,
                    }}
                  >
                    {post.isReservation && (
                      <Badge size="xsmall" variant="weak" color="green">
                        예약
                      </Badge>
                    )}
                    <span style={{ fontSize: "12px", color: "#8b95a1" }}>
                      {formatPostTime(post.createdAt)}
                    </span>
                  </span>
                </div>
                {post.photoUrl && (
                  // 피드는 반복적으로 스크롤하며 훑어보는 콘텐츠 영역이라,
                  // 사진마다 기본 -4도 기울임(PhotoSticker 기본값)을 주면
                  // 산만해져서 rotation={0}으로 평평하게 둬요(가독성 우선).
                  <PhotoSticker
                    src={post.photoUrl}
                    alt="게시글 사진"
                    size={140}
                    rotation={0}
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleLike(post)}
                      aria-label={
                        likedPostIds.has(post.id) ? "좋아요 취소" : "좋아요"
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        border: "none",
                        background: "none",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        color: likedPostIds.has(post.id)
                          ? "#f04452"
                          : "#6b7684",
                        fontSize: "13px",
                        fontWeight: 600,
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <Heart
                        size={16}
                        color={
                          likedPostIds.has(post.id) ? "#f04452" : "#6b7684"
                        }
                        fill={likedPostIds.has(post.id) ? "#f04452" : "none"}
                      />
                      {post.likeCount > 0 ? post.likeCount : ""}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleScrap(post)}
                      aria-label={
                        scrapedPostIds.has(post.id) ? "스크랩 취소" : "스크랩"
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        border: "none",
                        background: "none",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        color: scrapedPostIds.has(post.id)
                          ? "#4A6350"
                          : "#6b7684",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <BookmarkRibbonIcon
                        size={16}
                        color={
                          scrapedPostIds.has(post.id) ? "#4A6350" : "#6b7684"
                        }
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => openCommentsSheet(post)}
                      aria-label="댓글"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        border: "none",
                        background: "none",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        color: "#6b7684",
                        fontSize: "13px",
                        fontWeight: 600,
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      <MessageCircle size={16} color="#6b7684" />
                      {post.commentCount > 0 ? post.commentCount : ""}
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
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
              </div>
              <Border />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TodayMealBoard;
