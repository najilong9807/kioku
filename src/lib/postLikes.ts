import { supabase } from "./supabase";

interface RawPostLike {
  post_id: string;
  user_hash: string;
}

// postIds에 달린 좋아요를 한 번에 조회해서, 게시글별 좋아요 개수와 현재 사용자(userHash)가
// 좋아요를 누른 게시글 id 집합을 함께 계산해요. 개수(likeCountByPostId)는
// threadPosts.ts의 fetchTodayMealPosts()에서, 좋아요 여부(likedPostIds)는 화면 쪽에서
// 각각 필요해서 한 조회로 둘 다 만들어 돌려줘요.
export async function fetchPostLikes(
  postIds: string[],
): Promise<Map<string, number>> {
  const likeCountByPostId = new Map<string, number>();

  if (!supabase || postIds.length === 0) {
    return likeCountByPostId;
  }

  const { data, error } = await supabase
    .from("post_likes")
    .select("post_id")
    .in("post_id", postIds);

  if (error) {
    console.error("좋아요 개수 조회에 실패했어요.", error);
    return likeCountByPostId;
  }

  for (const row of (data ?? []) as { post_id: string }[]) {
    likeCountByPostId.set(row.post_id, (likeCountByPostId.get(row.post_id) ?? 0) + 1);
  }

  return likeCountByPostId;
}

// postIds 중 userHash가 좋아요를 누른 게시글 id 집합이에요. 하트 아이콘을 채워서
// 보여줄지 판단할 때 써요.
export async function fetchLikedPostIds(
  postIds: string[],
  userHash: string,
): Promise<Set<string>> {
  if (!supabase || postIds.length === 0) {
    return new Set();
  }

  const { data, error } = await supabase
    .from("post_likes")
    .select("post_id, user_hash")
    .eq("user_hash", userHash)
    .in("post_id", postIds);

  if (error) {
    console.error("좋아요 여부 조회에 실패했어요.", error);
    return new Set();
  }

  return new Set((data ?? []).map((row: RawPostLike) => row.post_id));
}

// 좋아요 상태를 토글해요. 이미 눌렀으면 취소(delete)하고, 안 눌렀으면 새로 추가(insert)해요.
// 반환값은 토글 후 상태(true=좋아요 눌림, false=취소됨)이고, 실패하면 null이에요.
export async function toggleLike(
  postId: string,
  userHash: string,
): Promise<boolean | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data: existing, error: selectError } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_hash", userHash)
      .maybeSingle();

    if (selectError) {
      console.error("좋아요 상태 확인에 실패했어요.", selectError);
      return null;
    }

    if (existing) {
      const { error: deleteError } = await supabase
        .from("post_likes")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
        console.error("좋아요 취소에 실패했어요.", deleteError);
        return null;
      }
      return false;
    }

    const { error: insertError } = await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_hash: userHash });

    if (insertError) {
      console.error("좋아요 등록에 실패했어요.", insertError);
      return null;
    }
    return true;
  } catch (error) {
    console.error("좋아요 처리 중 오류가 발생했어요.", error);
    return null;
  }
}
