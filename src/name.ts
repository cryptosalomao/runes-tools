export const decoder = (encodedName: bigint): string => {
  const recursiveSymbolBuilder = (num: bigint, acc: string[]): string[] => {
    if (num <= 0n) {
      return acc;
    }
    const char = String.fromCharCode(
      "A".charCodeAt(0) + Number((BigInt(num) - 1n) % 26n)
    );
    return recursiveSymbolBuilder((BigInt(num) - 1n) / 26n, [...acc, char]);
  };

  const symbol = recursiveSymbolBuilder(encodedName + 1n, [])
    .reverse()
    .join("");

  return symbol === "" ? "BCGDENLQRQWDSLRUGSNLBTMFIJAV" : symbol;
};

export const encoder = (name: string): bigint => {
  const baseCharCode = "A".charCodeAt(0);

  const recursiveBigIntBuilder = (name: string): bigint => {
    if (name === "") {
      return 0n;
    }

    const charCode = name.charCodeAt(0);
    const value = BigInt(charCode - baseCharCode + 1);
    const remaining = name.slice(1);

    return recursiveBigIntBuilder(remaining) * 26n + value;
  };

  const reversedStr = name.split("").reverse().join("");

  return recursiveBigIntBuilder(reversedStr) - 1n;
};

export const renderNameWithSpacers = (
  name: string,
  spacers: bigint
): string => {
  const runeChars = name.split("");
  const spacerArray = Array.from(
    { length: name.length - 1 },
    (_, i) => (spacers & (1n << BigInt(i))) !== 0n
  );

  return runeChars
    .map((char, i) => char + (spacerArray[i] ? "•" : ""))
    .join("");
};
