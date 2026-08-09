// 인쇄물 제작 등 나중에 필요할 수 있는 고해상도 원본 사진을 로컬에 보관해요.
// 화면에는 계속 리사이즈본(Restaurant.photos)을 쓰고, 이 아카이브는 화면에
// 노출하거나 UI를 만들 필요 없이 "나중에 꺼내 쓸 수 있게 데이터만" 남겨두는
// 용도예요.
//
// restaurants는 @apps-in-toss/web-framework의 Storage에 저장하는데, 이
// Storage는 용량이 작아서 사진을 그대로(리사이즈 없이) 넣으면 조용히 저장
// 실패하는 문제가 있었어요(App.tsx의 handleReceiptChange 주석 참고). 그래서
// 원본급 이미지는 훨씬 넉넉한 브라우저 IndexedDB에 별도로 보관해요.
import { resizeImageFile } from "./imageResize";

const DB_NAME = "kioku-photo-archive";
const DB_VERSION = 1;
const STORE_NAME = "originals";

// 인쇄에도 쓸 수 있을 만큼 화면용보다는 확실히 고화질이면서도, IndexedDB
// 용량 부담이 과하지 않도록 긴 변 기준 이 크기까지만 허용해요.
const ARCHIVE_MAX_LONG_EDGE = 1600;
const ARCHIVE_QUALITY = 0.9;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("이 환경에서는 IndexedDB를 사용할 수 없어요."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 사진 원본마다 발급하는 고유 키예요. Restaurant.photoArchiveKeys에
// photos와 같은 순서로 저장해 둬서, 나중에 이 키로 원본을 다시 찾을 수 있어요.
export function createPhotoArchiveKey(): string {
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// 실패해도(용량 초과, IndexedDB 미지원 등) 기록 저장 자체를 막지 않도록
// 항상 조용히 실패해요 — 원본 보관은 어디까지나 부가 기능이에요.
export async function archivePhotoOriginal(
  key: string,
  file: File,
): Promise<void> {
  try {
    const highRes = await resizeImageFile(
      file,
      ARCHIVE_MAX_LONG_EDGE,
      ARCHIVE_QUALITY,
      "longEdge",
    );
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(highRes, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error("사진 원본을 보관하지 못했어요.", error);
  }
}

// 나중에 인쇄물 제작 등에서 원본을 꺼내 쓸 때 사용할 조회 함수예요(현재는
// 호출하는 화면이 없어요).
export async function getArchivedPhotoOriginal(
  key: string,
): Promise<string | undefined> {
  try {
    const db = await openDb();
    return await new Promise<string | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result as string | undefined);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("사진 원본을 불러오지 못했어요.", error);
    return undefined;
  }
}
