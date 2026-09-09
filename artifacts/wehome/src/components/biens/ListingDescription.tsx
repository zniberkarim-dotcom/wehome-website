/**
 * Renders an agent-written listing description.
 *
 * Agents type these by hand in the CRM, and some use markdown-style bullets
 * ("* Surface foncière : 2 008 m²"). Rendered as raw text those asterisks show
 * up literally. This turns consecutive bullet lines into a real list and leaves
 * everything else as plain paragraphs, preserving line breaks the way the rest
 * of the site already does with `whitespace-pre-line`.
 *
 * Content is never modified — only how it is displayed.
 */

type Block = { type: "ul"; items: string[] } | { type: "p"; text: string };

const BULLET_PREFIXES = ["* ", "- ", "• "];

export function toBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push({ type: "ul", items: bullets });
      bullets = [];
    }
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const prefix = BULLET_PREFIXES.find((p) => line.startsWith(p));
    if (prefix) {
      bullets.push(line.slice(prefix.length).trim());
      continue;
    }
    flush();
    if (line) blocks.push({ type: "p", text: raw });
  }
  flush();
  return blocks;
}

export function ListingDescription({ text, className }: { text: string; className?: string }) {
  const blocks = toBlocks(text);

  // Nothing bullet-shaped: keep the existing single-paragraph treatment untouched.
  if (!blocks.some((b) => b.type === "ul")) {
    return <p className={`whitespace-pre-line ${className ?? ""}`}>{text}</p>;
  }

  return (
    <div className={className}>
      {blocks.map((block, i) =>
        block.type === "ul" ? (
          <ul key={i} className="list-disc pl-5 space-y-1 my-3 marker:text-primary/50">
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="whitespace-pre-line">
            {block.text}
          </p>
        )
      )}
    </div>
  );
}
