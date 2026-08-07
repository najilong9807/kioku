// "오늘의 한 입" 게시글에서 "나도 기록할래요"를 누르면, 맛있는 하루 등록폼의
// 이름 필드에 미리 채워 넣을 "짐작한 가게 이름"을 뽑아요. 오늘의 한 입은 자유
// 게시판이라 별도 "가게 이름" 필드가 없어서, 완벽한 추출은 애초에 불가능해요.
// 그래서 첫 문장(또는 첫 줄)을 적당한 길이로 잘라 후보로 제안하고, 등록폼에서
// 사용자가 바로 고쳐 쓸 수 있게 해요. DB 연결(FK)은 전혀 만들지 않는 단순
// 텍스트 프리필이에요.
const MAX_GUESS_LENGTH = 24;

export function guessRestaurantNameFromPost(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return "";
  }

  const firstLine = trimmed.split("\n")[0];
  const firstSentenceMatch = firstLine.match(/^[^.!?~。]+/);
  const candidate = (firstSentenceMatch?.[0] ?? firstLine).trim();

  return candidate.length > MAX_GUESS_LENGTH
    ? `${candidate.slice(0, MAX_GUESS_LENGTH)}…`
    : candidate;
}
