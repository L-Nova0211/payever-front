export function getAbbreviation(value: string): string {
  const chunks: string[] = String(value || '').split(/\s+/);
  const lastChar = chunks.length === 1
    ? chunks[0].charAt(chunks[0].length - 1)
    : chunks[1].charAt(0);

  return chunks[0].charAt(0) + lastChar;
}
