// "오늘의 한 입" 글 스크랩(북마크) 기능이에요. post_likes.ts와 구조가 완전히
// 똑같은데, 대상 테이블만 post_scraps예요.
//
// post_scraps 테이블은 아래 스키마로 Supabase 대시보드에서 직접 만들어야 해요.
// (이 앱은 예전에 트랙②용으로 만든 "scraps" 테이블(restaurant_id, user_id 기반)이
// 이미 있지만, 그건 이 기능과 대상(글이 아니라 맛집)도 다르고 정체성 컬럼도
// user_hash가 아니라 user_id라 재사용할 수 없어서, 새 테이블로 분리했어요.)
//
//   create table post_scraps (
//     id uuid primary key default gen_random_uuid(),
//     post_id uuid not null references thread_posts(id) on delete cascade,
//     user_hash text not null,
//     created_at timestamptz not null default now(),
//     unique (post_id, user_hash)
//   );
import { supabase } from "./supabase";
import { fetchPostsByIds, type ThreadPost } from "./threadPosts";

interface RawPostScrap {
  post_id: string;
  user_hash: string;
}

// postIds 중 userHash가 스크랩한 게시글 id 집합이에요. 북마크 아이콘을 채워서
// 보여줄지 판단할 때 써요. (postLikes.ts의 fetchLikedPostIds와 동일한 패턴이에요.)
export async function fetchScrapedPostIds(
  postIds: string[],
  userHash: string,
): Promise<Set<string>> {
  if (!supabase || postIds.length === 0) {
    return new Set();
  }

  const { data, error } = await supabase
    .from("post_scraps")
    .select("post_id, user_hash")
    .eq("user_hash", userHash)
    .in("post_id", postIds);

  if (error) {
    console.error("스크랩 여부 조회에 실패했어요.", error);
    return new Set();
  }

  return new Set((data ?? []).map((row: RawPostScrap) => row.post_id));
}

// 스크랩 상태를 토글해요. 이미 스크랩했으면 취소(delete)하고, 안 했으면 새로
// 추가(insert)해요. 반환값은 토글 후 상태(true=스크랩됨, false=취소됨)이고,
// 실패하면 null이에요.
export async function toggleScrap(
  postId: string,
  userHash: string,
): Promise<boolean | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data: existing, error: selectError } = await supabase
      .from("post_scraps")
      .select("id")
      .eq("post_id", postId)
      .eq("user_hash", userHash)
      .maybeSingle();

    if (selectError) {
      console.error("스크랩 상태 확인에 실패했어요.", selectError);
      return null;
    }

    if (existing) {
      const { error: deleteError } = await supabase
        .from("post_scraps")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
        console.error("스크랩 취소에 실패했어요.", deleteError);
        return null;
      }
      return false;
    }

    const { error: insertError } = await supabase
      .from("post_scraps")
      .insert({ post_id: postId, user_hash: userHash });

    if (insertError) {
      console.error("스크랩 등록에 실패했어요.", insertError);
      return null;
    }
    return true;
  } catch (error) {
    console.error("스크랩 처리 중 오류가 발생했어요.", error);
    return null;
  }
}

// userHash가 스크랩한 글 전체를 "스크랩한 순서(최신 스크랩이 먼저)"로 가져와요.
// 홈 화면 "스크랩" 퀵액션에서 모아보기 화면을 채울 때 써요.
export async function fetchScrapedPosts(userHash: string): Promise<ThreadPost[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("post_scraps")
    .select("post_id, created_at")
    .eq("user_hash", userHash)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("스크랩 목록 조회에 실패했어요.", error);
    return [];
  }

  const postIds = (data ?? []).map((row: { post_id: string }) => row.post_id);
  if (postIds.length === 0) {
    return [];
  }

  const posts = await fetchPostsByIds(postIds);

  // fetchPostsByIds는 글 작성 시각(created_at) 순으로 돌려주기 때문에, 스크랩한
  // 순서(postIds 순서)로 다시 정렬해요. 원글이 삭제돼서 더는 존재하지 않는
  // 스크랩은 postsById에 없을 테니 자연히 목록에서 빠져요.
  const postById = new Map(posts.map((post) => [post.id, post]));
  return postIds
    .map((id) => postById.get(id))
    .filter((post): post is ThreadPost => Boolean(post));
}
