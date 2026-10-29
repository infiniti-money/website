import { Fragment, type ReactNode } from "react";
function safeLink(url: string) {
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}
function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i}>{part.slice(2, -2)}</strong>;
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
export function articleHeadings(body: string) {
  return body
    .split("\n")
    .flatMap((line, index) =>
      /^## /.test(line) ? [{ id: `muc-${index}`, title: line.slice(3) }] : [],
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
    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{2,3}\s|[-*] |\d+\. )/.test(lines[i].trim())
    ) {
      paragraph.push(lines[i].trim());
      i++;
    }
    blocks.push(<p key={index}>{inline(paragraph.join(" "))}</p>);
  }
  return <div className="article-prose">{blocks}</div>;
}
