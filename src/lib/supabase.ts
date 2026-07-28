import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// .env 파일에 URL/anon key가 없으면(예: 아직 설정 전이거나 로컬 미리보기 환경) 클라이언트를
// 만들지 않아요. createClient는 URL 형식을 즉시 검사해서 빈 문자열이면 바로 예외를 던지기
// 때문에, 여기서 막지 않으면 Supabase 설정 여부와 무관하게 앱 전체가 실행되지 않아요.
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        // 이 앱은 Supabase Auth를 쓰지 않고 앱인토스 사용자 식별 해시(user_hash)로
        // profiles 테이블을 직접 조회/저장해요. 세션을 유지할 필요가 없어서 꺼두면,
        // 앱인토스 웹뷰의 저장소 제약(오리진별 localStorage 격리, iOS IndexedDB
        // 자동 삭제 등)에 영향받지 않아요.
        auth: { persistSession: false },
      })
    : null;

if (!supabase) {
  console.warn(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 환경 변수가 비어 있어요. .env 파일을 채워야 Supabase 기능이 동작해요.",
  );
}
