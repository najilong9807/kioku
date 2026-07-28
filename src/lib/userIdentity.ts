import { getAnonymousKey } from "@apps-in-toss/web-framework";

const FALLBACK_USER_HASH_STORAGE_KEY = "kioku:fallbackUserHash";

function createRandomId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  // crypto.randomUUID를 지원하지 않는 아주 오래된 환경을 위한 대체 구현이에요.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

// 앱인토스 브릿지를 사용할 수 없는 로컬 브라우저 미리보기 환경을 위한 임시 식별값이에요.
// 한 번 생성하면 localStorage에 저장해두고 계속 재사용해요.
function getFallbackUserHash(): string {
  try {
    const stored = localStorage.getItem(FALLBACK_USER_HASH_STORAGE_KEY);
    if (stored) {
      return stored;
    }

    const generated = createRandomId();
    localStorage.setItem(FALLBACK_USER_HASH_STORAGE_KEY, generated);
    return generated;
  } catch {
    // localStorage마저 사용할 수 없는 환경이면 매번 새로 생성해요.
    return createRandomId();
  }
}

// 사용자를 구분하는 데 쓸 식별 해시값을 가져와요.
// 토스 앱/샌드박스 웹뷰에서는 getAnonymousKey로 실제 식별 해시를 받아오고,
// 브릿지를 사용할 수 없는 환경(예: 로컬 브라우저 미리보기)에서는 실패하므로
// localStorage 기반 임시 식별값으로 대체해요.
export async function getUserIdentityHash(): Promise<string> {
  try {
    const result = await getAnonymousKey();
    if (result && result !== "ERROR" && result.type === "HASH") {
      return result.hash;
    }
  } catch {
    // 네이티브 브릿지를 사용할 수 없는 환경이에요. 아래 폴백을 사용해요.
  }

  return getFallbackUserHash();
}
