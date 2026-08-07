// 배열에서 랜덤으로 하나를 골라줘요. 검색창 placeholder처럼, 매번 조금씩
// 다른 문구를 보여주고 싶을 때 사용해요.
export function pickRandomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
