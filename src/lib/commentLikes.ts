import { supabase } from "./supabase";

interface RawCommentLike {
  comment_id: string;
  user_hash: string;
}

// commentIds에 달린 좋아요를 한 번에 조회해서 댓글별 좋아요 개수를 계산해요.
// postLikes.ts의 fetchPostLikes와 같은 패턴이에요.
export async function fetchCommentLikes(
  commentIds: string[],
): Promise<Map<string, number>> {
  const likeCountByCommentId = new Map<string, number>();

  if (!supabase || commentIds.length === 0) {
    return likeCountByCommentId;
  }

  const { data, error } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .in("comment_id", commentIds);

  if (error) {
    console.error("댓글 좋아요 개수 조회에 실패했어요.", error);
    return likeCountByCommentId;
  }

  for (const row of (data ?? []) as { comment_id: string }[]) {
    likeCountByCommentId.set(
      row.comment_id,
      (likeCountByCommentId.get(row.comment_id) ?? 0) + 1,
    );
  }

  return likeCountByCommentId;
}

// commentIds 중 userHash가 좋아요를 누른 댓글 id 집합이에요. 하트 아이콘을 채워서
// 보여줄지 판단할 때 써요.
export async function fetchLikedCommentIds(
  commentIds: string[],
  userHash: string,
): Promise<Set<string>> {
  if (!supabase || commentIds.length === 0) {
    return new Set();
  }

  const { data, error } = await supabase
    .from("comment_likes")
    .select("comment_id, user_hash")
    .eq("user_hash", userHash)
    .in("comment_id", commentIds);

  if (error) {
    console.error("댓글 좋아요 여부 조회에 실패했어요.", error);
    return new Set();
  }

  return new Set((data ?? []).map((row: RawCommentLike) => row.comment_id));
}

// 댓글 좋아요 상태를 토글해요. 이미 눌렀으면 취소(delete)하고, 안 눌렀으면 새로
// 추가(insert)해요. 반환값은 토글 후 상태(true=좋아요 눌림, false=취소됨)이고,
// 실패하면 null이에요.
export async function toggleCommentLike(
  commentId: string,
  userHash: string,
): Promise<boolean | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data: existing, error: selectError } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_hash", userHash)
      .maybeSingle();

    if (selectError) {
      console.error("댓글 좋아요 상태 확인에 실패했어요.", selectError);
      return null;
    }

    if (existing) {
      const { error: deleteError } = await supabase
        .from("comment_likes")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
        console.error("댓글 좋아요 취소에 실패했어요.", deleteError);
        return null;
      }
      return false;
    }

    const { error: insertError } = await supabase
      .from("comment_likes")
      .insert({ comment_id: commentId, user_hash: userHash });

    if (insertError) {
      console.error("댓글 좋아요 등록에 실패했어요.", insertError);
      return null;
    }
    return true;
  } catch (error) {
    console.error("댓글 좋아요 처리 중 오류가 발생했어요.", error);
    return null;
  }
}
