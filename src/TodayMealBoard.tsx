import {
  Asset,
  Border,
  Button,
  Result,
  SegmentedControl,
  TextArea,
  TextField,
  useBottomSheet,
  useDialog,
} from "@toss/tds-mobile";
import { Heart, Search } from "lucide-react";
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
import {
  buildRegionFilterOptions,
  formatRegionLabel,
  matchesRegion,
} from "./lib/koreanRegions";
import {
  createNotification,
  fetchUserHashByProfileId,
} from "./lib/notifications";
import { fetchLikedPostIds, toggleLike } from "./lib/postLikes";
import { fetchProfile } from "./lib/profile";
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
import { RegionFilterSheetContent, RegionPicker } from "./RegionPicker";
import { HANDWRITING_TEXT_STYLE } from "./theme";

// 첨부 사진은 가로 폭 기준 이 값 이하로 리사이즈해서 저장해요.
const MAX_PHOTO_WIDTH = 800;

type PostSortOption = "latest" | "popular";

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
  onCancel,
  onSubmit,
}: {
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

      <RegionPicker value={neighborhood} onChange={setNeighborhood} />

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
  postAuthorId,
  currentUserId,
  currentUserNickname,
  onChanged,
  onClose,
}: {
  postId: string;
  postAuthorId: string;
  currentUserId: string | null;
  currentUserNickname: string | null;
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

function TodayMealBoard({
  onOpenRestaurantSearch,
}: {
  onOpenRestaurantSearch: () => void;
}) {
  const [posts, setPosts] = useState<ThreadPost[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserHash, setCurrentUserHash] = useState<string | null>(null);
  const [currentUserNickname, setCurrentUserNickname] = useState<
    string | null
  >(null);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  // null이면 "전체"예요.
  const [filterProvince, setFilterProvince] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<PostSortOption>("latest");

  const { open, close } = useBottomSheet();
  const { openConfirm, openAlert } = useDialog();

  const loadPosts = useCallback(async () => {
    const loaded = await fetchTodayMealPosts();
    setPosts(loaded);
    setIsLoaded(true);
  }, []);

  // 글 목록에 실제로 등장한 동네들 중, 전국 시/도-시/군/구에 매칭되는 것만 추려서
  // 필터 옵션(시/도 -> 시/군/구 목록)을 만들어요. 예전에 자유 텍스트로 저장된 값도
  // matchesRegion의 느슨한 매칭 덕분에 이 목록에 포함돼요.
  const regionFilterOptions = useMemo(
    () => buildRegionFilterOptions(posts.map((post) => post.neighborhood)),
    [posts],
  );

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

  const openWriteSheet = () => {
    open({
      header: "오늘 뭐 드셨나요?",
      children: (
        <PostForm
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
          postAuthorId={post.userId}
          currentUserId={currentUserId}
          currentUserNickname={currentUserNickname}
          onChanged={loadPosts}
          onClose={close}
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
      });
      return;
    }

    const result = await toggleLike(post.id, currentUserHash);
    if (result === null) {
      await openAlert({
        title: "요청에 실패했어요",
        description: "잠시 후 다시 시도해 주세요.",
        alertButton: "확인",
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

  return (
    <>
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
          <Search size={18} color="#8b95a1" />
          관심 있는 맛집 검색
        </button>
      </div>

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

      {regionFilterOptions.size > 0 && (
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
                    <Button
                      size="small"
                      variant="weak"
                      color="dark"
                      onClick={() => openCommentsSheet(post)}
                    >
                      댓글{post.commentCount > 0 ? ` ${post.commentCount}` : ""}
                    </Button>
                  </div>
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
