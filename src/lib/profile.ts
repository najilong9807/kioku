import { supabase } from "./supabase";

export interface Profile {
  id: string;
  user_hash: string;
  nickname: string;
  // 프로필 사진(base64 데이터 URL) 또는 아바타 식별자("avatar:onigiri_slim" 형태,
  // lib/avatars.ts 참고)예요. 아직 아무것도 설정하지 않았으면 null이에요.
  profile_image: string | null;
}

// user_hash로 저장된 프로필(닉네임/프로필 이미지)을 조회해요. 아직 등록되지 않았다면
// null을 반환해요.
// Supabase가 설정되어 있지 않거나 조회에 실패해도 조용히 null을 반환해서, 앱의 다른
// 기능(로컬에 저장된 맛집 목록 등)이 이 조회 실패로 영향받지 않도록 해요.
// id는 anon_profiles의 PK로, 다른 테이블(thread_posts 등)에서 작성자를 가리킬 때 사용해요.
export async function fetchProfile(userHash: string): Promise<Profile | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("anon_profiles")
      .select("id, user_hash, nickname, profile_image")
      .eq("user_hash", userHash)
      .maybeSingle();

    if (error) {
      console.error("프로필 조회에 실패했어요.", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("프로필 조회 중 오류가 발생했어요.", error);
    return null;
  }
}

// user_hash에 해당하는 프로필(닉네임/프로필 이미지)을 저장해요. profiles 테이블은
// user_hash가 고유(primary key 또는 unique)하다고 가정하고 upsert해요.
// profileImage를 생략하면 기존 값을 건드리지 않아요(닉네임만 바꿀 때 사용).
export async function saveProfile(
  userHash: string,
  nickname: string,
  profileImage?: string | null,
): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const values: Record<string, unknown> = { user_hash: userHash, nickname };
    if (profileImage !== undefined) {
      values.profile_image = profileImage;
    }

    const { error } = await supabase
      .from("anon_profiles")
      .upsert(values, { onConflict: "user_hash" });

    if (error) {
      console.error("프로필 저장에 실패했어요.", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("프로필 저장 중 오류가 발생했어요.", error);
    return false;
  }
}
