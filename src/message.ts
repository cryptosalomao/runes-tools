import _ from "lodash";

import { Tag } from "./tag";
import type { RuneId, Edict } from "./types";

export const fromIntegers = (payload: bigint[]) => {
  const edicts: Edict[] = [];
  const fields = new Map<bigint, bigint[]>();
  let flaw: string | null = null;

  const payloadLength = payload.length;

  for (let i = 0; i < payloadLength; i += 2) {
    const tag = payload[i];

    if (Tag.Body == tag) {
      const runeId: RuneId = {
        block: 0n,
        tx: 0n,
      };

      const chunks = payload.slice(i + 1);

      for (const chunk of _.chunk(chunks, 4)) {
        if (chunk.length !== 4) {
          flaw = "TrailingIntegers";

          break;
        }

        const [block, tx, amount, output] = chunk;

        if (block == 0n && tx > 0n) {
          flaw = "EdictRuneId";

          break;
        }

        // todo: check if output returned from chunk is not greater than txn output count
        const edict: Edict = {
          id: runeId,
          amount,
          output,
        };

        edicts.push(edict);

        runeId.block = block;
        runeId.tx = tx;
      }

      break;
    }

    const value: bigint = payload[i + 1];

    if (value === undefined) {
      flaw = "TruncatedField";

      break;
    }

    const entry = fields.get(tag) || [];

    entry.push(value);
    fields.set(tag, entry);
  }

  return {
    fields,
    edicts,
    flaw,
  };
};
