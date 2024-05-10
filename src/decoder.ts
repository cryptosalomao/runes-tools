function decode(buffer: Buffer): [bigint, number] | string {
  let n = 0n;

  for (let i = 0; i < buffer.length; i++) {
    if (i > 31) {
      return "Overlong";
    }

    const byte = BigInt(buffer[i]);
    const value = byte & 0x7fn; // Extract the value bits

    if (i === 31 && (value & 0b0111_1100n) !== 0n) {
      return "Overflow";
    }

    n |= value << (7n * BigInt(i)); // Shift and add the value bits to the result

    if ((byte & 0x80n) === 0n) {
      // Check the continuation bit
      return [n, i + 1]; // Return the decoded value and the number of bytes consumed
    }
  }

  return "Unterminated";
}

const numberString =
  "12726290652238989602505641910606236365404823884817486090318";

// Convert the number to a BigInt
const numberToDecode = BigInt(numberString);

// Convert the BigInt to little-endian byte array
const buffer = Buffer.allocUnsafe(16); // Allocate a buffer for 16 bytes (128 bits)
buffer.writeBigUInt64LE(numberToDecode & BigInt("0xFFFFFFFFFFFFFFFF"), 0); // Write lower 64 bits
buffer.writeBigUInt64LE(numberToDecode >> BigInt(64), 8); // Write higher 64 bits

// Call the decode function
const result = decode(buffer);

// Print the result
if (Array.isArray(result)) {
  console.log("Decoded value:", result[0].toString()); // Output the decoded bigint
  console.log("Bytes consumed:", result[1]); // Output the number of bytes consumed
} else {
  console.error("Error:", result); // Output the error message
}
