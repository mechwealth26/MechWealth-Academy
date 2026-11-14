import { Fragment, type ReactNode } from "react";

type ArticleBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "code"; text: string }
  | { type: "rule" };

function stripOuterEmphasis(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith("***") && trimmed.endsWith("***")) {
    return trimmed.slice(3, -3);
  }
  if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
    return trimmed.slice(2, -2);
  }
  if (trimmed.startsWith("*") && trimmed.endsWith("*")) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function inlineMarkup(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-stone-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={index} className="text-stone-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.9em] text-gold-400"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function isTableDivider(line: string) {
  return /^\|?\s*:?-{3,}/.test(line) && line.includes("|");
}

function tableCells(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseMarkdown(markdown: string): ArticleBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ArticleBlock[] = [];
  let index = 0;

  // The article title is already rendered by the reader header.
  if (lines[0]?.startsWith("# ")) index = 1;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line === "---") {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }

    if (line.startsWith("## ") || line.startsWith("### ")) {
      const level = line.startsWith("### ") ? 3 : 2;
      const text = stripOuterEmphasis(line.replace(/^#{2,3}\s+/, ""));
      if (level === 3 && blocks.length === 0) {
        blocks.push({ type: "paragraph", text });
        index += 1;
        continue;
      }
      blocks.push({
        type: "heading",
        level,
        text,
      });
      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quote.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }

    if (line.startsWith("|") && lines[index + 1] && isTableDivider(lines[index + 1].trim())) {
      const headers = tableCells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (/^-\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^-\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^-\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (
        !next ||
        next === "---" ||
        next.startsWith("#") ||
        next.startsWith("> ") ||
        next.startsWith("```") ||
        next.startsWith("|") ||
        /^-\s+/.test(next) ||
        /^\d+\.\s+/.test(next)
      ) {
        break;
      }
      paragraph.push(next);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

export default function ResourceArticleBody({ content }: { content: string }) {
  const blocks = parseMarkdown(content);

  return (
    <div data-resource-body className="mt-10 space-y-6">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return block.level === 2 ? (
            <h2
              key={index}
              className="pt-6 font-display text-2xl leading-tight text-stone-100 sm:text-3xl"
            >
              {block.text}
            </h2>
          ) : (
            <h3
              key={index}
              className="pt-3 font-display text-xl leading-snug text-stone-100"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="border-l-2 border-gold-400 bg-gold-400/[0.045] px-5 py-4 font-display text-lg italic leading-relaxed text-stone-200"
            >
              {inlineMarkup(block.text)}
            </blockquote>
          );
        }

        if (block.type === "unordered-list" || block.type === "ordered-list") {
          const List = block.type === "ordered-list" ? "ol" : "ul";
          return (
            <List
              key={index}
              className={`space-y-2 pl-5 text-base leading-relaxed text-stone-300 ${
                block.type === "ordered-list" ? "list-decimal" : "list-disc marker:text-gold-400"
              }`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} className="pl-1">
                  {inlineMarkup(item)}
                </li>
              ))}
            </List>
          );
        }

        if (block.type === "table") {
          return (
            <div key={index} className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[34rem] border-collapse text-left text-sm leading-relaxed">
                <thead className="bg-white/[0.045]">
                  <tr>
                    {block.headers.map((header, cellIndex) => (
                      <th
                        key={cellIndex}
                        className="border-b border-white/10 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-gold-400"
                      >
                        {inlineMarkup(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-white/[0.06] last:border-0">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3 align-top text-stone-300">
                          {inlineMarkup(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === "code") {
          return (
            <pre
              key={index}
              className="overflow-x-auto rounded-xl border border-gold-400/20 bg-gold-400/[0.045] p-5 font-mono text-sm leading-relaxed text-gold-400"
            >
              <code>{block.text}</code>
            </pre>
          );
        }

        if (block.type === "rule") {
          return <hr key={index} className="my-10 border-white/[0.08]" />;
        }

        const isDisclaimer = block.text.startsWith("*Educational content only.");
        return (
          <p
            key={index}
            className={
              isDisclaimer
                ? "border-t border-white/[0.08] pt-6 text-sm italic leading-relaxed text-stone-400"
                : index === 0
                  ? "font-display text-xl italic leading-relaxed text-stone-200"
                  : "text-base leading-relaxed text-stone-300"
            }
          >
            {inlineMarkup(block.text)}
          </p>
        );
      })}
    </div>
  );
}
