import { Anchor } from "@/components/Anchor";

/**
 * A link whose letters roll over on hover. The word slides up out of its box
 * while a second copy rolls up into the empty space, a letter at a time.
 *
 * The link's own text is left in place, so it still sets the size of the
 * link, still carries the page's underline and still reads and copies as one
 * word. Only its ink is turned off: the underline is drawn by the link in the
 * hairline colour, not in the text colour, so it survives. The moving letters
 * are an overlay laid over the invisible text, taken out of the accessibility
 * tree and out of selection. Replacing the text with the
 * two moving copies instead was the obvious way to build this and it moved
 * everything below the link down the page: the copies have to sit in a box
 * that clips them, and a clipped box cannot be the same shape as a line of
 * text.
 */
export function FlipLink({
  href,
  children,
  className,
}: {
  href: string;
  children: string;
  className?: string;
}) {
  const letters = Array.from(children);

  /** One copy of the word, a span per letter, each starting a beat later. */
  const row = (extra?: string) => (
    <span className={extra ? `flip-row ${extra}` : "flip-row"}>
      {letters.map((letter, i) => (
        <span key={`${letter}-${i}`} style={{ transitionDelay: `${i * 25}ms` }}>
          {letter === " " ? " " : letter}
        </span>
      ))}
    </span>
  );

  return (
    <Anchor href={href} className={className ? `flip ${className}` : "flip"}>
      <span className="flip-text">{children}</span>
      <span className="flip-anim" aria-hidden="true">
        {row()}
        {row("flip-under")}
      </span>
    </Anchor>
  );
}
