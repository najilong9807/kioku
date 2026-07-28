// 사용자가 고른 이미지 파일을 캔버스로 다시 그려서 base64(JPEG) 문자열로 돌려줘요.
// 가로 폭이 maxWidth보다 크면 비율을 유지한 채 줄이고, quality로 압축해서
// DB에 저장되는 photo_url 크기가 과하게 커지지 않도록 해요.
export function resizeImageFile(
  file: File,
  maxWidth = 800,
  quality = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("파일을 읽지 못했어요."));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("이미지를 불러오지 못했어요."));
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const targetWidth = Math.max(1, Math.round(image.width * scale));
        const targetHeight = Math.max(1, Math.round(image.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const context = canvas.getContext("2d");
        if (!context) {
          // 캔버스를 못 그리는 환경이면 원본이라도 그대로 반환해요.
          resolve(reader.result as string);
          return;
        }

        context.drawImage(image, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
