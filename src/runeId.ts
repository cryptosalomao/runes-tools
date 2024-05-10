import type { RuneId } from "./types";

export const delta = (current: RuneId, next: RuneId): RuneId => {
  const block = current.block - next.block;

  const tx = block === 0n ? next.tx - current.tx : next.tx;

  return { block, tx };
};
