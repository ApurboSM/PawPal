/** Average adult reading speed, words per minute. */
const WORDS_PER_MINUTE = 200;

export function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function readingTimeMinutes(content: string) {
  return Math.max(1, Math.round(wordCount(content) / WORDS_PER_MINUTE));
}

/**
 * Splits stored article text into paragraphs.
 *
 * Content is plain text, so blank lines are the paragraph break. Single newlines
 * are treated as soft wraps and collapsed, which keeps text pasted from a word
 * processor from rendering as a ragged column.
 */
export function toParagraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}
