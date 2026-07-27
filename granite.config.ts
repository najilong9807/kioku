import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "kioku",
  brand: {
    displayName: "이게맛다", // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: "#FF91D5", // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "https://static.toss.im/appsintoss/63125/14e4fa09-8e99-4dae-bf3e-cd26d424447d.png", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
