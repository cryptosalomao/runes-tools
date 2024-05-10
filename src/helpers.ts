import { reduce, flatMap } from "lodash";

export const encodeUnicodeToBigInt = (data: string): bigint => {
  return reduce(
    data,
    (resultBigInt: bigint, char: string) => {
      const charCode = char.charCodeAt(0);

      return (resultBigInt << 16n) + BigInt(charCode);
    },
    0n
  );
};

export const decodeUnicodeFromBigInt = (n: bigint): string => {
  const num = Number(n);

  return String.fromCharCode(num);
};

export const convertBigIntArrayToUint8Array = (
  bigints: bigint[]
): Uint8Array => {
  return new Uint8Array(
    flatMap(bigints, (bigintValue) => {
      const bytes: number[] = [];
      for (let i = 0; i < 8; i++) {
        // Extract each byte from the bigint value
        const byteValue = Number((bigintValue >> (8n * BigInt(i))) & 0xffn);
        bytes.push(byteValue);
      }
      return bytes;
    })
  );
};
