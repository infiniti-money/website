import { Fragment, type ReactNode } from "react";

function safeLink(url: string, image = false) {
  if (/[\\\u0000-\u0020]/.test(url)) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  if (!image && /^tel:\+?[0-9]{8,15}$/.test(url)) return true;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}
function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i}>{inline(part.slice(2, -2))}</strong>;
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={i}>{inline(part.slice(1, -1))}</em>;
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link && safeLink(link[2]))
        return (
          <a
            key={i}
            href={link[2]}
            {...(link[2].startsWith("https:")
              ? { target: "_blank", rel: "noreferrer" }
              : {})}
          >
            {link[1]}
          </a>
        );
      return <Fragment key={i}>{part}</Fragment>;
    });
}
function cells(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}
function isTable(lines: string[], index: number) {
  const header = lines[index]?.trim() || "",
    divider = lines[index + 1]?.trim() || "";
  return (
    header.startsWith("|") &&
    header.endsWith("|") &&
    divider.startsWith("|") &&
    cells(header).length === cells(divider).length &&
    cells(divider).every((c) => /^:?-{3,}:?$/.test(c))
  );
}
function isBlock(lines: string[], index: number) {
  return (
    /^(#{2,3}\s|[-*] |\d+\. |>|!\[)/.test(lines[index].trim()) ||
    isTable(lines, index)
  );
}
export function articleHeadings(body: string) {
  return body
    .split("\n")
    .flatMap((line, index) =>
      /^## /.test(line.trim())
        ? [{ id: `muc-${index}`, title: line.trim().slice(3) }]
        : [],
    );
}
export default function ArticleContent({ body }: { body: string }) {
  const lines = body.split("\n"),
    blocks: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim(),
      index = i;
    if (!line) {
      i++;
      continue;
    }
    const heading = line.match(/^(#{2,3})\s+(.+)/);
    if (heading) {
      blocks.push(
        heading[1].length === 2 ? (
          <h2 id={`muc-${i}`} key={i}>
            {inline(heading[2])}
          </h2>
        ) : (
          <h3 id={`muc-${i}`} key={i}>
            {inline(heading[2])}
          </h3>
        ),
      );
      i++;
      continue;
    }
    if (isTable(lines, i)) {
      const header = cells(line),
        rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(cells(lines[i]));
        i++;
      }
      blocks.push(
        <div
          className="article-table-scroll"
          role="region"
          aria-label="Bảng thông tin dịch vụ"
          tabIndex={0}
          key={index}
        >
          <table>
            <thead>
              <tr>
                {header.map((c, j) => (
                  <th scope="col" key={j}>
                    {inline(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, j) => (
                <tr key={j}>
                  {header.map((_, k) => (
                    <td key={k}>{inline(row[k] || "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (line.startsWith(">")) {
      const quote: ReactNode[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(
          <p key={i}>{inline(lines[i].trim().replace(/^>\s?/, ""))}</p>,
        );
        i++;
      }
      blocks.push(<blockquote key={index}>{quote}</blockquote>);
      continue;
    }
    if (line.startsWith("![")) {
      const img = line.match(/^!\[([^\]]*)\]\(([^\s)]+)\)$/);
      blocks.push(
        img && safeLink(img[2], true) ? (
          <figure key={i}>
            <img src={img[2]} alt={img[1]} loading="lazy" decoding="async" />
            <figcaption>{img[1]}</figcaption>
          </figure>
        ) : (
          <p key={i}>{line}</p>
        ),
      );
      i++;
      continue;
    }
    if (/^[-*] /.test(line) || /^\d+\. /.test(line)) {
      const ordered = /^\d+\. /.test(line),
        items: ReactNode[] = [];
      while (
        i < lines.length &&
        (ordered ? /^\d+\. / : /^[-*] /).test(lines[i].trim())
      ) {
        items.push(
          <li key={i}>
            {inline(
              lines[i].trim().replace(ordered ? /^\d+\. / : /^[-*] /, ""),
            )}
          </li>,
        );
        i++;
      }
      blocks.push(
        ordered ? <ol key={index}>{items}</ol> : <ul key={index}>{items}</ul>,
      );
      continue;
    }
    const paragraph = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlock(lines, i)) {
      paragraph.push(lines[i].trim());
      i++;
    }
    blocks.push(<p key={index}>{inline(paragraph.join(" "))}</p>);
  }
  return <div className="article-prose">{blocks}</div>;
}
