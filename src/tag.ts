import { encodeToVector } from "./varint";
import { decoder } from "./name";
import { decodeUnicodeFromBigInt } from "./helpers";

export const Tag = {
  Body: 0n,
  Flags: 2n,
  Rune: 4n,
  Premine: 6n,
  Cap: 8n,
  Amount: 10n,
  HeightStart: 12n,
  HeightEnd: 14n,
  OffsetStart: 16n,
  OffsetEnd: 18n,
  Mint: 20n,
  Pointer: 22n,
  Cenotaph: 126n,

  Divisibility: 1n,
  Spacers: 3n,
  Symbol: 5n,
  Nop: 127n,
};

export const NumberEncodedTag = Object.fromEntries(
  Object.entries(Tag).map(([key, value]) => [Number(value), key])
);

export const parseTag = {
  ["Body"]: (v: bigint) => v,
  ["Flags"]: (v: bigint) => v,
  ["Rune"]: (v: bigint) => decoder(v),
  ["Premine"]: (v: bigint) => Number(v),
  ["Cap"]: (v: bigint) => Number(v),
  ["Amount"]: (v: bigint) => Number(v),
  ["HeightStart"]: (v: bigint) => Number(v),
  ["HeightEnd"]: (v: bigint) => Number(v),
  ["OffsetStart"]: (v: bigint) => Number(v),
  ["OffsetEnd"]: (v: bigint) => Number(v),
  ["Mint"]: (v: any) => v,
  ["Pointer"]: (v: any) => v,
  ["Cenotaph"]: (v: any) => v,
  ["Divisibility"]: (v: bigint) => Number(v),
  ["Spacers"]: (v: bigint) => Number(v),
  ["Symbol"]: (v: bigint) => decodeUnicodeFromBigInt(v),
  ["Nop"]: (v: any) => v,
};

type Tag = bigint;

export const encode = (tag: Tag, values: bigint[], payload: bigint[]) => {
  const localPayload: bigint[] = [...payload];

  for (const value of values) {
    localPayload.push(tag);
    localPayload.push(value);
  }

  return localPayload;
};

export const encodeOptional = (
  tag: Tag,
  value: bigint | bigint[] | null,
  payload: any[]
) => {
  let localPayload = [...payload];

  if (value !== null && value !== undefined) {
    const finalValue = Array.isArray(value) ? value : [value];

    localPayload = encode(tag, finalValue, payload);
  }

  return localPayload;
};
