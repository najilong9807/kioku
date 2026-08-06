// 이미지 카드(공유 카드) 공유를 담당해요. 우선순위는 다음과 같아요.
//
//   1. 브라우저 Web Share API(navigator.share)로 이미지 파일 공유를 시도해요.
//   2. 실패/미지원이고 앱인토스(토스 미니앱) 환경이면, saveBase64Data 브릿지로
//      기기에 이미지를 저장해요. WebView 안에서는 <a download> 클릭이 기대대로
//      동작하지 않을 수 있어서, 이 환경에서는 브라우저 다운로드 대신 이 방식을 써요.
//   3. 클립보드에 이미지 복사를 시도해요.
//   4. 마지막으로 일반적인 <a download> 방식으로 다운로드해요.
//
// 이 프로젝트에는 아직 이미지를 "공유"하는 앱인토스 전용 브릿지가 없어요(텍스트만
// 보내는 share({ message })만 있고, 이미지 파일은 지원하지 않아요). 그래서 이미지
// 공유 자체는 Web Share API를 기본으로 쓰고, 앱인토스 환경에서 그게 안 될 때만
// saveBase64Data로 보완해요.
import { getOperationalEnvironment, saveBase64Data } from "@apps-in-toss/web-framework";

export type ShareImageOutcome =
  | "shared" // Web Share API로 공유 시트가 뜸(성공적으로 넘어감)
  | "cancelled" // 사용자가 공유 시트를 취소함
  | "saved" // 앱인토스 브릿지로 기기에 저장함
  | "copied" // 클립보드에 이미지로 복사함
  | "downloaded" // 브라우저 다운로드로 저장함
  | "failed"; // 모든 방법이 실패함

export interface ShareImageOptions {
  blob: Blob;
  fileName: string;
  title: string;
  text: string;
}

// createConstantBridge로 만들어진 함수(getOperationalEnvironment 등)는 네이티브
// 브릿지가 없는 환경(일반 브라우저 미리보기 등)에서 호출하면 동기적으로 예외를
// 던져요. Storage/restaurantStorage.ts 등 프로젝트 전반에서 쓰는 것과 같은
// try/catch 패턴이에요.
function isAppsInTossRuntime(): boolean {
  try {
    getOperationalEnvironment();
    return true;
  } catch {
    return false;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("이미지를 base64로 변환하지 못했어요."));
        return;
      }
      // "data:image/png;base64,AAAA..." 형태에서 콤마 뒤 실제 데이터만 잘라내요.
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("이미지를 읽지 못했어요."));
    reader.readAsDataURL(blob);
  });
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // revokeObjectURL을 너무 빨리 부르면 일부 브라우저에서 다운로드가 취소될 수
  // 있어서, 다운로드가 시작될 시간을 준 뒤에 정리해요.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

async function tryWebShare(options: ShareImageOptions): Promise<"shared" | "cancelled" | null> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return null;
  }

  let file: File;
  try {
    file = new File([options.blob], options.fileName, { type: options.blob.type });
  } catch {
    return null;
  }

  const shareData: ShareData = { files: [file], title: options.title, text: options.text };

  if (typeof navigator.canShare === "function" && !navigator.canShare(shareData)) {
    // 이 브라우저는 Web Share API는 있지만 파일 공유는 지원하지 않아요.
    return null;
  }

  try {
    await navigator.share(shareData);
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      // 사용자가 공유 시트를 취소한 거라, 폴백으로 넘어가지 않고 그대로 끝내요.
      return "cancelled";
    }
    // 다른 이유로 실패했으면 아래 폴백들을 계속 시도해요.
    return null;
  }
}

async function trySaveInAppsInToss(options: ShareImageOptions): Promise<"saved" | null> {
  if (!isAppsInTossRuntime()) {
    return null;
  }
  try {
    const data = await blobToBase64(options.blob);
    await saveBase64Data({
      data,
      fileName: options.fileName,
      mimeType: options.blob.type || "image/png",
    });
    return "saved";
  } catch {
    return null;
  }
}

async function tryClipboardCopy(blob: Blob): Promise<"copied" | null> {
  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    typeof navigator.clipboard.write !== "function" ||
    typeof ClipboardItem === "undefined"
  ) {
    return null;
  }
  try {
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    return "copied";
  } catch {
    return null;
  }
}

// 이미지를 공유해요. 파일 앞부분의 우선순위 설명을 참고하세요.
export async function shareImage(options: ShareImageOptions): Promise<ShareImageOutcome> {
  const webShareResult = await tryWebShare(options);
  if (webShareResult) {
    return webShareResult;
  }

  const savedResult = await trySaveInAppsInToss(options);
  if (savedResult) {
    return savedResult;
  }

  const copiedResult = await tryClipboardCopy(options.blob);
  if (copiedResult) {
    return copiedResult;
  }

  try {
    downloadBlob(options.blob, options.fileName);
    return "downloaded";
  } catch {
    return "failed";
  }
}
