export function shuffleArray<T>(arr: T[]) {
  arr = [...arr];

  for (let i = arr.length - 1; i > 0; i--) {
    const idx = Math.floor(Math.random() * i);
    const tmp = arr[i];
    arr[i] = arr[idx];
    arr[idx] = tmp;
  }

  return arr;
}
