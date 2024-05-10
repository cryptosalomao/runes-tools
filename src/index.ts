function splitBigIntInto128BitChunksLE(bigIntValue: bigint): bigint[] {
  const chunks: bigint[] = [];
  let remainingBits = bigIntValue;

  // Extract and store little-endian 128-bit chunks
  while (remainingBits > 0n) {
    const chunk = remainingBits & ((1n << 128n) - 1n);
    chunks.push(chunk);
    remainingBits >>= 128n;
  }

  return chunks;
}

function splitBigIntInto128BitChunks(bigIntValue: bigint): bigint[] {
  const chunks: bigint[] = [];
  let remainingBits = bigIntValue;

  // Extract and store 128-bit chunks
  while (remainingBits >= BigInt(1) << BigInt(128)) {
    const chunk = remainingBits & ((BigInt(1) << BigInt(128)) - BigInt(1));
    chunks.push(chunk);
    remainingBits >>= BigInt(128);
  }

  // Store any remaining bits as unpadded
  if (remainingBits > 0) {
    chunks.push(remainingBits);
  }

  return chunks;
}

// Your decoder function
export const decoder = (encodedValue: bigint) => {
  const bufferLength = encodedValue < BigInt(1) << BigInt(128) ? 8 : 16;
  const buffer = Buffer.alloc(bufferLength);

  buffer.writeBigUInt64BE(encodedValue >> BigInt(64), 0);
  buffer.writeBigUInt64BE(
    encodedValue & ((BigInt(1) << BigInt(64)) - BigInt(1)),
    bufferLength - 8
  );

  const decodedValues: bigint[] = [];
  let offset = 0;

  while (offset < buffer.length) {
    let byte = buffer[offset++];

    if (byte >= 128) {
      let value = BigInt(byte & 0x7f);
      let shift = BigInt(7);

      while (byte >= 128) {
        byte = buffer[offset++];
        value |= BigInt(byte & 0x7f) << shift;
        shift += BigInt(7);
      }

      decodedValues.push(value);
    } else {
      decodedValues.push(BigInt(byte));
    }
  }

  return decodedValues;
};

export const decoderLE = (encodedValue: bigint): bigint[] => {
  const bufferLength = encodedValue < 1n << 64n ? 8 : 16;
  const buffer = Buffer.alloc(bufferLength);

  // Write the 128-bit encoded value into the buffer
  buffer.writeBigUInt64LE(encodedValue & ((1n << 64n) - 1n), 0); // Write the lower 64 bits
  buffer.writeBigUInt64LE(encodedValue >> 64n, 8); // Write the higher 64 bits

  const decodedValues: bigint[] = [];
  let offset = 0;

  while (offset < buffer.length) {
    let byte = buffer[offset++];
    let value = 0n;
    let shift = 0n;

    while (byte !== undefined && byte >= 128) {
      value |= (BigInt(byte) & 0x7fn) << shift;
      byte = buffer[offset++];
      shift += 7n;
    }

    if (byte !== undefined) {
      value |= BigInt(byte) << shift;
    }

    decodedValues.push(value);
  }

  return decodedValues;
};

function renderRuneWithSpacers(runeName: string, spacers: bigint): string {
  let result = "";

  // Iterate over each character in the rune name
  for (let i = 0; i < runeName.length; i++) {
    // Append the current character
    result += runeName[i];

    // Check if there should be a spacer after this character
    if (
      i < runeName.length - 1 &&
      (spacers & (BigInt(1) << BigInt(i))) !== BigInt(0)
    ) {
      result += "•"; // Add spacer
    }
  }

  return result;
}

// Example usage
const runeName = "OTTORUINEDHERE";
const spacers = BigInt("0b1000001000"); // Bitfield indicating spacers

const renderedRune = renderRuneWithSpacers(runeName, spacers);
console.log(renderedRune); // Output: "A•A•A•A"

// Decode the 128-bit integer represented by the string
const encodedValueString =
  "12726290652238989602505641910606236365404823884817486090318";
const encodedValue = BigInt(encodedValueString);

// Output the decoded values
// console.log(encodedValue);

const split = splitBigIntInto128BitChunks(encodedValue);

console.log(split);

const [high, low] = split;

console.log(high, low);

console.log(decoderLE(high));
console.log(decoderLE(low));

// @ts-ignore
function encodeToRuneName(num: bigint): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";

  while (num > 0n) {
    const remainder = num % 26n;
    result = alphabet[Number(remainder)] + result;
    num = (num - remainder) / 26n;
  }

  return result;
}

// Example usage

// 12726290652238989602505641910606236365404823884817486090318n
