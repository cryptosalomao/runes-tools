export const Flag = {
  Etching: 0n,
  Terms: 1n,
  Turbo: 2n,
  Cenotaph: 127n,
};

export const mask = (flag: bigint): bigint => 1n << flag;

export const take = (flag: bigint, bitmap: bigint): boolean => {
  const masked = mask(flag);
  const set = (bitmap & masked) != 0n;

  bitmap &= ~masked;

  return set;
};

export const set = (flag: bigint, bitmap: bigint): bigint =>
  (bitmap |= mask(flag));
