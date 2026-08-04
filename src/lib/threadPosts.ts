import { fetchCommentLikes } from "./commentLikes";
import { fetchPostLikes } from "./postLikes";
import { supabase } from "./supabase";

// thread_posts 테이블은 board_type 컬럼에 CHECK 제약이 걸려 있어서
// 'restaurant' | 'free' 두 값만 허용돼요. "오늘뭐먹"은 자유 게시판이라 'free'를 써요.
// 댓글도 원글과 같은 board_type('free')을 쓰고, parent_post_id로 원글/댓글을 구분해요.
export const TODAY_MEAL_BOARD_TYPE = "free";

export interface ThreadPost {
  id: string;
  content: string;
  photoUrl: string | null;
  neighborhood: string | null;
  createdAt: string;
  userId: string;
  authorNickname: string;
  commentCount: number;
  likeCount: number;
  isReservation: boolean;
}

export interface ThreadComment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  authorNickname: string;
  likeCount: number;
}

interface RawThreadPost {
  id: string;
  content: string;
  photo_url: string | null;
  neighborhood: string | null;
  created_at: string;
  user_id: string | null;
  is_reservation: boolean | null;
}

interface RawThreadComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
}

// thread_posts.user_id는 anon_profiles.id를 가리키지만 두 테이블 사이에 외래키 관계가
// 없어서(Supabase에 별도로 설정되어 있지 않음) PostgREST의 관계 임베딩을 쓸 수 없어요.
// 그래서 글/댓글 목록을 가져온 뒤 작성자 id들을 모아 anon_profiles를 한 번 더 조회하고,
// 클라이언트에서 닉네임을 매칭해요.
async function fetchNicknamesByUserIds(
  userIds: string[],
): Promise<Map<string, string>> {
  const nicknameByUserId = new Map<string, string>();

  if (!supabase || userIds.length === 0) {
    return nicknameByUserId;
  }

  const { data: profiles, error } = await supabase
    .from("anon_profiles")
    .select("id, nickname")
    .in("id", userIds);

  if (error) {
    console.error("작성자 정보 조회에 실패했어요.", error);
    return nicknameByUserId;
  }

  for (const profile of profiles ?? []) {
    nicknameByUserId.set(profile.id, profile.nickname);
  }

  return nicknameByUserId;
}

// postIds에 달린 댓글 개수를 원글 id별로 세요. parent_post_id가 postIds 중 하나인
// 행(=댓글)만 가져와서 개수만 세고, 댓글 내용 자체는 필요 없으니 조회하지 않아요.
async function fetchCommentCounts(
  postIds: string[],
): Promise<Map<string, number>> {
  const commentCountByPostId = new Map<string, number>();

  if (!supabase || postIds.length === 0) {
    return commentCountByPostId;
  }

  const { data, error } = await supabase
    .from("thread_posts")
    .select("parent_post_id")
    .eq("board_type", TODAY_MEAL_BOARD_TYPE)
    .in("parent_post_id", postIds);

  if (error) {
    console.error("댓글 개수 조회에 실패했어요.", error);
    return commentCountByPostId;
  }

  for (const row of (data ?? []) as { parent_post_id: string | null }[]) {
    if (!row.parent_post_id) {
      continue;
    }
    commentCountByPostId.set(
      row.parent_post_id,
      (commentCountByPostId.get(row.parent_post_id) ?? 0) + 1,
    );
  }

  return commentCountByPostId;
}

// parent_post_id가 null인, 즉 댓글이 아닌 원글만 최신순으로 가져와요. authorId를
// 주면 그 작성자의 글만 걸러서 가져와요(닉네임 클릭 -> 모아보기 화면에서 사용).
// onlyIds를 주면 그 id들만 가져와요(스크랩한 글 모아보기에서 사용). 둘 다 없으면
// 전체 원글을 가져와요. onlyIds가 빈 배열이면(스크랩이 하나도 없는 경우) 전체를
// 가져오지 않도록 조회 없이 바로 빈 배열을 반환해요.
// (이름을 postIds가 아니라 onlyIds로 지은 건, 아래에서 조회 결과 id 목록을 담는
// 지역 변수 postIds와 이름이 겹치면 그 블록 전체에서 매개변수 대신 아직 초기화
// 안 된 지역 변수가 참조돼서 TDZ 오류가 나기 때문이에요.)
async function fetchThreadPosts(
  authorId?: string,
  onlyIds?: string[],
): Promise<ThreadPost[]> {
  if (!supabase) {
    return [];
  }
  if (onlyIds && onlyIds.length === 0) {
    return [];
  }

  try {
    let query = supabase
      .from("thread_posts")
      .select(
        "id, content, photo_url, neighborhood, created_at, user_id, is_reservation",
      )
      .eq("board_type", TODAY_MEAL_BOARD_TYPE)
      .is("parent_post_id", null);

    if (authorId) {
      query = query.eq("user_id", authorId);
    }
    if (onlyIds) {
      query = query.in("id", onlyIds);
    }

    const { data: posts, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("게시글 목록 조회에 실패했어요.", error);
      return [];
    }

    const rawPosts = (posts ?? []) as RawThreadPost[];
    if (rawPosts.length === 0) {
      return [];
    }

    const userIds = Array.from(
      new Set(
        rawPosts.map((post) => post.user_id).filter((id): id is string => Boolean(id)),
      ),
    );
    const postIds = rawPosts.map((post) => post.id);

    const [nicknameByUserId, commentCountByPostId, likeCountByPostId] =
      await Promise.all([
        fetchNicknamesByUserIds(userIds),
        fetchCommentCounts(postIds),
        fetchPostLikes(postIds),
      ]);

    return rawPosts.map((post) => ({
      id: post.id,
      content: post.content,
      photoUrl: post.photo_url,
      neighborhood: post.neighborhood,
      createdAt: post.created_at,
      userId: post.user_id ?? "",
      authorNickname: post.user_id
        ? (nicknameByUserId.get(post.user_id) ?? "알 수 없음")
        : "알 수 없음",
      commentCount: commentCountByPostId.get(post.id) ?? 0,
      likeCount: likeCountByPostId.get(post.id) ?? 0,
      isReservation: post.is_reservation ?? false,
    }));
  } catch (error) {
    console.error("게시글 목록 조회 중 오류가 발생했어요.", error);
    return [];
  }
}

export async function fetchTodayMealPosts(): Promise<ThreadPost[]> {
  return fetchThreadPosts();
}

// 특정 작성자(userId=anon_profiles.id)가 쓴 오늘뭐먹 글만 모아서 가져와요.
// 닉네임을 클릭해서 그 사람의 글을 모아보는 화면에서 사용해요.
export async function fetchPostsByAuthor(authorId: string): Promise<ThreadPost[]> {
  return fetchThreadPosts(authorId);
}

// postIds에 해당하는 원글들을 가져와요. 스크랩 목록(lib/postScraps.ts)처럼 특정
// id 집합의 글만 모아 보여줘야 할 때 사용해요. 반환 순서는 postIds 순서와 무관하니
// (조회 결과는 created_at 최신순), 스크랩한 순서로 보여주려면 호출부에서 다시
// 정렬해야 해요.
export async function fetchPostsByIds(postIds: string[]): Promise<ThreadPost[]> {
  return fetchThreadPosts(undefined, postIds);
}

// userId는 anon_profiles.id예요. restaurant_id는 이 게시판에서 쓰지 않아서 insert에
// 포함하지 않고 컬럼 기본값(null)에 맡겨요. photoUrl/neighborhood는 선택 입력이라
// 없으면 null로 저장하고, 원글이라 parent_post_id는 넣지 않아요(null).
// isReservation은 예약하고 갔는지 여부로, 기본값은 false예요.
export async function createTodayMealPost(
  userId: string,
  content: string,
  photoUrl?: string | null,
  neighborhood?: string | null,
  isReservation?: boolean,
): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase.from("thread_posts").insert({
      board_type: TODAY_MEAL_BOARD_TYPE,
      user_id: userId,
      content,
      photo_url: photoUrl ?? null,
      neighborhood: neighborhood ?? null,
      is_reservation: isReservation ?? false,
    });

    if (error) {
      console.error("게시글 작성에 실패했어요.", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("게시글 작성 중 오류가 발생했어요.", error);
    return false;
  }
}

// postId(원글)에 달린 댓글을 오래된순(대화 순서)으로 가져와요.
export async function fetchComments(postId: string): Promise<ThreadComment[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data: comments, error } = await supabase
      .from("thread_posts")
      .select("id, content, created_at, user_id")
      .eq("board_type", TODAY_MEAL_BOARD_TYPE)
      .eq("parent_post_id", postId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("댓글 목록 조회에 실패했어요.", error);
      return [];
    }

    const rawComments = (comments ?? []) as RawThreadComment[];
    if (rawComments.length === 0) {
      return [];
    }

    const userIds = Array.from(
      new Set(
        rawComments
          .map((comment) => comment.user_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const commentIds = rawComments.map((comment) => comment.id);
    const [nicknameByUserId, likeCountByCommentId] = await Promise.all([
      fetchNicknamesByUserIds(userIds),
      fetchCommentLikes(commentIds),
    ]);

    return rawComments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      userId: comment.user_id ?? "",
      authorNickname: comment.user_id
        ? (nicknameByUserId.get(comment.user_id) ?? "알 수 없음")
        : "알 수 없음",
      likeCount: likeCountByCommentId.get(comment.id) ?? 0,
    }));
  } catch (error) {
    console.error("댓글 목록 조회 중 오류가 발생했어요.", error);
    return [];
  }
}

// userId는 anon_profiles.id, parentPostId는 댓글이 달릴 원글의 id예요.
// 댓글에는 사진 첨부가 없어서 photo_url은 항상 null이에요.
export async function createComment(
  userId: string,
  parentPostId: string,
  content: string,
): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase.from("thread_posts").insert({
      board_type: TODAY_MEAL_BOARD_TYPE,
      user_id: userId,
      parent_post_id: parentPostId,
      content,
    });

    if (error) {
      console.error("댓글 작성에 실패했어요.", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("댓글 작성 중 오류가 발생했어요.", error);
    return false;
  }
}

// 원글과 댓글 모두 thread_posts의 한 행이라 id만으로 지울 수 있어요.
// 실제 소유권 검증은 DB(RLS)가 아니라 화면에서만 하고 있어요(anon_profiles와 동일한 방식).
// 그래서 작성자가 현재 사용자와 같을 때만 이 함수를 호출하도록 호출부에서 막아야 해요.
export async function deleteThreadPost(postId: string): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase.from("thread_posts").delete().eq("id", postId);

    if (error) {
      console.error("삭제에 실패했어요.", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("삭제 중 오류가 발생했어요.", error);
    return false;
  }
}
