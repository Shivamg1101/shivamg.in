import type { ReactNode } from "react";

/**
 * A small Markdown renderer that emits React elements rather than HTML.
 *
 * Post bodies arrive from an automated pipeline, so the safety property that
 * matters is that no path can ever produce raw markup: there is no
 * dangerouslySetInnerHTML here, and any HTML in the source is rendered as the
 * literal text it is. That makes injection structurally impossible rather than
 * dependent on a sanitiser being configured correctly.
 *
 * Supports the subset that blog posts actually use: headings, paragraphs,
 * ordered and unordered lists, fenced code, blockquotes, horizontal rules, and
 * inline bold / italic / code / links.
 */

type Token =
  | { kind: "heading"; level: 2 | 3 | 4; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "code"; lang: string | null; text: string }
  | { kind: "quote"; text: string }
  | { kind: "rule" };

function tokenize(src: string): Token[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: Token[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // fenced code — consumed verbatim, never parsed for inline markup
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const lang = fence[1] ?? null;
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
      i++; // closing fence
      out.push({ kind: "code", lang, text: buf.join("\n") });
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      out.push({ kind: "rule" });
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      // h1 belongs to the page, not the body, so clamp everything into h2..h4
      const level = Math.min(4, Math.max(2, heading[1].length)) as 2 | 3 | 4;
      out.push({ kind: "heading", level, text: heading[2].trim() });
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ""));
      out.push({ kind: "quote", text: buf.join(" ").trim() });
      continue;
    }

    const bullet = /^[-*+]\s+(.*)$/;
    const numbered = /^\d+[.)]\s+(.*)$/;
    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line);
      const re = ordered ? numbered : bullet;
      const items: string[] = [];
      while (i < lines.length && re.test(lines[i])) {
        items.push(lines[i].match(re)![1].trim());
        i++;
        // fold indented continuation lines into the item above
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !re.test(lines[i].trim())) {
          items[items.length - 1] += " " + lines[i].trim();
          i++;
        }
      }
      out.push({ kind: "list", ordered, items });
      continue;
    }

    // paragraph: consume until a blank line or the start of another block
    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^```/.test(lines[i]) &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !bullet.test(lines[i]) &&
      !numbered.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    out.push({ kind: "paragraph", text: buf.join(" ") });
  }

  return out;
}

/** Inline markup. Returns React nodes, so nothing here can emit markup. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Order matters: code first, so ** inside a code span stays literal.
  const pattern =
    /(`[^`]+`)|(\[[^\]]+\]\([^)\s]+\))|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*]+\*)|(_[^_]+_)/g;

  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyPrefix}-${n++}`;

    if (tok.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
          {tok.slice(1, -1)}
        </code>
      );
    } else if (tok.startsWith("[")) {
      const link = tok.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)!;
      const href = link[2];
      // Only http(s), mailto and site-relative links survive. Anything else —
      // javascript:, data:, vbscript: — renders as plain text.
      const safe = /^(https?:\/\/|mailto:|\/)/i.test(href);
      nodes.push(
        safe ? (
          <a
            key={key}
            href={href}
            className="text-primary underline underline-offset-2 hover:opacity-80"
            {...(href.startsWith("/") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          >
            {link[1]}
          </a>
        ) : (
          <span key={key}>{link[1]}</span>
        )
      );
    } else if (tok.startsWith("**") || tok.startsWith("__")) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {tok.slice(2, -2)}
        </strong>
      );
    } else {
      nodes.push(<em key={key}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  const tokens = tokenize(source);

  return (
    <div className="space-y-5">
      {tokens.map((t, i) => {
        switch (t.kind) {
          case "heading": {
            const cls =
              t.level === 2
                ? "pt-4 text-2xl font-bold"
                : t.level === 3
                  ? "pt-2 text-xl font-semibold"
                  : "pt-1 text-lg font-semibold";
            const Tag = (`h${t.level}`) as "h2" | "h3" | "h4";
            return (
              <Tag key={i} className={cls}>
                {inline(t.text, `h${i}`)}
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p key={i} className="text-[16px] leading-relaxed text-muted-foreground">
                {inline(t.text, `p${i}`)}
              </p>
            );
          case "list": {
            const Tag = t.ordered ? "ol" : "ul";
            return (
              <Tag
                key={i}
                className={`space-y-2 pl-5 text-[16px] leading-relaxed text-muted-foreground ${
                  t.ordered ? "list-decimal" : "list-disc"
                }`}
              >
                {t.items.map((it, j) => (
                  <li key={j}>{inline(it, `l${i}-${j}`)}</li>
                ))}
              </Tag>
            );
          }
          case "code":
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-xl border border-border bg-muted/50 p-4 text-[13px] leading-relaxed"
              >
                <code className="font-mono">{t.text}</code>
              </pre>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-2 border-primary/40 pl-4 text-[16px] italic leading-relaxed text-muted-foreground"
              >
                {inline(t.text, `q${i}`)}
              </blockquote>
            );
          case "rule":
            return <hr key={i} className="border-border" />;
        }
      })}
    </div>
  );
}

/** Word count of the rendered prose, used for the reading-time estimate. */
export function readingTime(source: string): number {
  const words = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`\[\]()]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 225));
}
