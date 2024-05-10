type Rune = bigint;

export type RuneId = {
  block: bigint;
  tx: bigint;
};

export type Edict = {
  id: RuneId;
  amount: bigint;
  output: bigint;
};

type Terms = {
  amount: bigint | null;
  cap: bigint | null;
  height: [bigint | null, bigint | null];
  offset: [bigint | null, bigint | null];
};

export type Etching = {
  divisibility: bigint | null;
  premine: bigint | null;
  rune: Rune | null;
  spacers: bigint | null;
  symbol: string | null;
  terms: Terms | null;
  turbo: boolean;
};

export type Runestone = {
  edicts: Edict[];
  etching: Etching | null;
  mint: RuneId | null;
  pointer: bigint | null;
};

type Field = {
  tag: number;
  value: bigint;
};

type Message = {
  fields: [];
  edicts: Edict[];
};
