export function throttle<T extends (...args: any) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => ReturnType<T> {
  let progress: boolean;
  let result: ReturnType<T>;

  return function (): ReturnType<T> {
    if (!progress) {
      progress = true;

      setTimeout(() => (progress = false), delay);

      result = fn();
    }

    return result;
  };
}
