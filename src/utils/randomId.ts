// see https://github.com/ai/nanoid
export const randomId = function (t = 21) {
  return crypto.getRandomValues(new Uint8Array(t)).reduce(
    (t, e) =>
      // eslint-disable-next-line no-param-reassign
      (t +=
        // eslint-disable-next-line no-param-reassign
        (e &= 63) < 36
          ? e.toString(36)
          : e < 62
          ? (e - 26).toString(36).toUpperCase()
          : e < 63
          ? '_'
          : '-'),
    '',
  );
};
