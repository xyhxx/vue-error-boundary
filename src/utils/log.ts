export function warn(message: string) {
  if (!__DEV__) return;
  // eslint-disable-next-line no-console
  console.warn(`[VeBoundary varn]: ${message}`);
}
