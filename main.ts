/**
 * One Word, First Thought.
 *
 * Chosen word: "guddle" — to catch trout bare-handed by groping under the
 * stones of a stream. A real verb, a vanished trade, and a sound that makes
 * the tongue fumble the way the hands do. It beats every listicle word
 * (petrichor, liminal, sonder) because nobody has read it forty times today.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const WORD = "guddle";

const MIN_LEN = 1;
const MAX_LEN = 24;

/**
 * Rejects anything that could not be a single dictionary word:
 * whitespace, control characters, invisible format marks, or a wrong length.
 * Length is counted in Unicode code points, not UTF-16 units, so a word
 * carrying a combining mark is measured the way a lexicographer would.
 */
function validate(word: string): void {
  if (typeof word !== "string") throw new Error("word must be a string");
  const chars = [...word];
  if (chars.length < MIN_LEN || chars.length > MAX_LEN) {
    throw new Error(
      `word must be ${MIN_LEN}..${MAX_LEN} characters (got ${chars.length})`,
    );
  }
  if (/\s/.test(word)) {
    throw new Error("word must be a single token: whitespace found");
  }
  if (/[\u0000-\u001f\u007f-\u009f]/.test(word)) {
    throw new Error("word must be a single token: control character found");
  }
  if (/[\u200b-\u200f\u2028-\u202f\ufeff]/.test(word)) {
    throw new Error("word must be a single token: invisible formatting found");
  }
  if (word !== word.trim()) {
    throw new Error("word must be a single token: leading or trailing space");
  }
}

function describe(word: string): string[] {
  const chars = [...word];
  const vowels = chars.filter((c) => /[aeiouy]/i.test(c)).length;
  return [
    `word:      ${word}`,
    `length:    ${chars.length} characters`,
    `bytes:     ${Buffer.byteLength(word, "utf8")} UTF-8 bytes`,
    `shape:     ${vowels} vowel(s), ${chars.length - vowels} consonant(s)`,
  ];
}

async function main(): Promise<void> {
  validate(WORD);
  const dir = process.env.MAKEFUN_OUTPUT_DIR?.trim() || "/output";
  await mkdir(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  await writeFile(target, WORD, { encoding: "utf8" });
  for (const line of describe(WORD)) console.log(line);
  console.log(`written:   ${target} (UTF-8, no trailing newline)`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
