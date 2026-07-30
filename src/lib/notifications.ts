import { supabase } from "./supabase";

export type NotificationType = "comment" | "like";

export interface AppNotification {
  id: string;
  actorNickname: string;
  type: NotificationType;
  postId: string;
  isRead: boolean;
  createdAt: string;
}

interface RawNotification {
  id: string;
  actor_nickname: string;
  type: NotificationType;
  post_id: string;
  is_read: boolean;
  created_at: string;
}

// thread_posts.user_id는 anon_profiles.id를 가리켜서, 알림을 보낼 대상(글 작성자)의
// user_hash를 구하려면 anon_profiles를 한 번 더 조회해야 해요. threadPosts.ts의
// fetchNicknamesByUserIds와 같은 이유예요(두 테이블 사이에 외래키 관계가 없음).
export async function fetchUserHashByProfileId(
  profileId: string,
): Promise<string | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("anon_profiles")
    .select("user_hash")
    .eq("id", profileId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("작성자 정보 조회에 실패했어요.", error);
    }
    return null;
  }

  return data.user_hash;
}

// 글 작성자(recipientUserHash)에게 알림을 남겨요. 본인이 본인 글/댓글에 남긴 경우는
// 알림을 만들지 않아야 하는데, 그 판단(actorUserHash === recipientUserHash 등)은
// 호출부에서 미리 하고 이 함수는 호출된 그대로 저장만 해요.
export async function createNotification(
  recipientUserHash: string,
  actorNickname: string,
  type: NotificationType,
  postId: string,
): Promise<void> {
  if (!supabase) {
    return;
  }

  try {
    const { error } = await supabase.from("notifications").insert({
      recipient_user_hash: recipientUserHash,
      actor_nickname: actorNickname,
      type,
      post_id: postId,
    });

    if (error) {
      console.error("알림 생성에 실패했어요.", error);
    }
  } catch (error) {
    console.error("알림 생성 중 오류가 발생했어요.", error);
  }
}

// userHash가 받은 알림을 최신순으로 가져와요.
export async function fetchNotifications(
  userHash: string,
): Promise<AppNotification[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, actor_nickname, type, post_id, is_read, created_at")
      .eq("recipient_user_hash", userHash)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("알림 목록 조회에 실패했어요.", error);
      return [];
    }

    return ((data ?? []) as RawNotification[]).map((row) => ({
      id: row.id,
      actorNickname: row.actor_nickname,
      type: row.type,
      postId: row.post_id,
      isRead: row.is_read,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error("알림 목록 조회 중 오류가 발생했어요.", error);
    return [];
  }
}

// 상단 알림 아이콘의 빨간 점 표시 여부를 정하기 위한, 읽지 않은 알림 개수예요.
export async function countUnreadNotifications(
  userHash: string,
): Promise<number> {
  if (!supabase) {
    return 0;
  }

  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_user_hash", userHash)
      .eq("is_read", false);

    if (error) {
      console.error("읽지 않은 알림 개수 조회에 실패했어요.", error);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.error("읽지 않은 알림 개수 조회 중 오류가 발생했어요.", error);
    return 0;
  }
}

// 알림 목록을 열람하면 전부 읽음 처리해요.
export async function markAllNotificationsRead(
  userHash: string,
): Promise<void> {
  if (!supabase) {
    return;
  }

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_user_hash", userHash)
      .eq("is_read", false);

    if (error) {
      console.error("알림 읽음 처리에 실패했어요.", error);
    }
  } catch (error) {
    console.error("알림 읽음 처리 중 오류가 발생했어요.", error);
  }
}
