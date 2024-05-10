export const bigIntToLE = (v: bigint): Uint8Array => {
  const bytes = new Uint8Array(16);

  for (let i = 0; i < 16; i++) {
    bytes[i] = Number((v >> BigInt(8 * i)) & BigInt(0xff));
  }

  const leBytes = new Uint8Array(16);

  for (let i = 0; i < 16; i++) {
    leBytes[i] = bytes[15 - i];
  }

  return leBytes;
};

export const encodeToVector = (n: bigint, vector: bigint[]) => {
  const localVector: bigint[] = [...vector];

  while (n >> 7n > 0n) {
    localVector.push((n & 0x7fn) | 0x80n);
    n >>= 7n;
  }

  localVector.push(BigInt(n));

  return localVector;
};

export const decode = (buffer: Uint8Array): [bigint, number] => {
  let n = 0n;

  for (const [i, byte] of buffer.entries()) {
    if (i > 18) return [0n, 0];

    let value = BigInt(byte) & BigInt(0b0111_1111);

    if (i == 18 && (value & BigInt(0b0111_1100)) != 0n) {
      return [0n, 0];
    }

    n |= value << BigInt(7 * i);

    if ((BigInt(byte) & BigInt(0b1000_0000)) == 0n) {
      return [n, i + 1];
    }
  }

  return [0n, 0];
};

/* const encode = (n: bigint): Uint8Array => {
  let buffer = new Uint8Array(18);
  encodeToVector(n, buffer);

  return buffer;
};
 */
