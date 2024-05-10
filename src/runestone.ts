import { cloneDeep, chunk, min, isArray } from "lodash";
import { decode, encodeToVector } from "./varint";
import { Flag, set } from "./flags";
import { Tag, NumberEncodedTag, encode, encodeOptional, parseTag } from "./tag";
import { delta } from "./runeId";
import { encoder } from "./name";

import type { Runestone, Edict, RuneId } from "./types";
import { encodeUnicodeToBigInt } from "./helpers";
import { fromIntegers } from "./message";

const payload = (data: string) => {
  const buffer = Buffer.from(data, "hex");

  const payload: bigint[] = [];

  for (let i = 0; i < buffer.length; i++) {
    payload.push(BigInt(buffer[i]));
  }

  return payload;
};

const integers = (payload: Uint8Array): bigint[] => {
  const integers: bigint[] = [];
  let i = 0;

  while (i < payload.length) {
    let [integer, length] = decode(payload.slice(i));

    integers.push(integer);
    i += length;
  }

  return integers;
};

type ParsedRunestone = {
  fields: Map<bigint, bigint[]>;
  edicts: Edict[];
  flaw: string | null;
};

const decipher = (data: string): ParsedRunestone => {
  const meta = payload(data);

  // @ts-ignore
  const parsedMetaData = integers(meta);

  const fromInt = fromIntegers(parsedMetaData);

  return fromInt as ParsedRunestone;
};

const parseRunestone = (data: ParsedRunestone) => {
  const { fields } = data;

  const parsedFields: { [key: string]: bigint } = {};

  for (const [tag, value] of fields) {
    const parsedTag = Number(tag);

    const key = NumberEncodedTag[parsedTag];

    const parsedValue = isArray(value) && value.length === 1 ? value[0] : value;

    if (key) {
      // @ts-ignore
      parsedFields[key] = parseTag[key](parsedValue);
    }
  }

  return parsedFields;
};

const encipher = (runestone: Runestone) => {
  const { etching, mint, edicts } = runestone;
  let payload: bigint[] = [];
  let flags = 0n;

  if (etching !== null) {
    flags = set(Flag.Etching, flags);

    if (runestone.etching?.terms !== null) {
      flags = set(Flag.Terms, flags);
    }

    if (runestone.etching?.turbo) {
      flags = set(Flag.Turbo, flags);
    }

    payload = encode(Tag.Flags, [flags], payload);

    payload = encodeOptional(Tag.Rune, etching.rune, payload);
    payload = encodeOptional(Tag.Divisibility, etching.divisibility, payload);
    payload = encodeOptional(Tag.Spacers, etching?.spacers, payload);

    const symbol =
      (etching?.symbol && encodeUnicodeToBigInt(etching.symbol)) || null;

    payload = encodeOptional(Tag.Symbol, symbol, payload);
    payload = encodeOptional(Tag.Premine, etching?.premine, payload);

    if (etching?.terms) {
      payload = encodeOptional(Tag.Amount, etching.terms.amount, payload);
      payload = encodeOptional(Tag.Cap, etching.terms.cap, payload);
      payload = encodeOptional(
        Tag.HeightStart,
        etching.terms.height[0],
        payload
      );
      payload = encodeOptional(Tag.HeightEnd, etching.terms.height[1], payload);
      payload = encodeOptional(
        Tag.OffsetStart,
        etching.terms.offset[0],
        payload
      );
      payload = encodeOptional(Tag.OffsetEnd, etching.terms.offset[1], payload);
    }

    if (mint) {
      payload = encodeOptional(Tag.Mint, [mint.block, mint.tx], payload);
    }

    payload = encodeOptional(Tag.Pointer, runestone.pointer, payload);

    if (edicts.length > 0) {
      payload = encodeToVector(Tag.Body, payload);

      const edictsClone = cloneDeep(edicts);

      let sortedEdicts = edictsClone.sort((edictA: Edict, edictB: Edict) => {
        if (edictA.id.block !== edictB.id.block) {
          return Number(edictA.id.block - edictB.id.block);
        }

        return Number(edictA.id.tx - edictB.id.tx);
      });

      let previous: RuneId = { block: 0n, tx: 0n };

      for (const edict of sortedEdicts) {
        const { block, tx } = delta(previous, edict.id);

        payload = encodeToVector(block, payload);
        payload = encodeToVector(tx, payload);
        payload = encodeToVector(edict.amount, payload);
        payload = encodeToVector(edict.output, payload);

        previous = edict.id;
      }

      const script: bigint[] = [];

      for (const dataChunk of chunk(payload, 520)) {
        script.push(...dataChunk.map((byte) => byte));
      }

      console.log(script);

      return script;
    }
  }
};

const runestone: Runestone = {
  edicts: [
    {
      id: { block: 0n, tx: 0n },
      amount: 110n,
      output: 0n,
    },
  ],
  etching: {
    divisibility: 10n,
    premine: 110n,
    rune: encoder("SALOMAOISHERE"),
    spacers: 0n,
    symbol: "$",
    terms: {
      amount: 1000n,
      cap: 100000n,
      height: [0n, 0n],
      offset: [0n, 0n],
    },
    turbo: true,
  },
  mint: { block: 110n, tx: 1n },
  pointer: 0n,
};

const decodedRunestone = decipher(
  "020704e4de99de01010a030405410a80c8afa02508641601"
);

console.log(decodedRunestone);

const parsedRunestone = parseRunestone(decodedRunestone);

console.log(parsedRunestone);
