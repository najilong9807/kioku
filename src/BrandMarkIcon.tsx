// 앱 CI(정체성) 아이콘이에요. 스플래시 화면의 초록 노트 표지와 같은 모티프(초록
// 표지 + 책등의 어두운 그림자 줄)를 아주 작은 크기로 단순화해서, 홈 화면 상단
// "이게맛다" 글자 앞에 놓는 작은 로고처럼 써요.
export function BrandMarkIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect
        x="3"
        y="2"
        width="18"
        height="20"
        rx="3.5"
        fill="#2E6F4C"
        stroke="#191f28"
        strokeWidth="1.4"
      />
      <rect x="8.2" y="2" width="2.1" height="20" fill="#191f28" opacity="0.18" />
    </svg>
  );
}
