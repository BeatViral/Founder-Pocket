import { Fragment } from "react";
import type { ReactElement } from "react";

function inline(text: string) {
  return text;
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: ReactElement[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (!listItems.length) return;
    elements.push(
      <ul key={`list-${elements.length}`} className="my-4 space-y-2 pl-5 text-slate-700">
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`} className="list-disc">
            {inline(item)}
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      return;
    }

    flushList();

    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={index} className="mb-4 mt-1 text-3xl font-bold text-slate-950">
          {inline(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={index} className="mb-2 mt-7 text-xl font-bold text-slate-950">
          {inline(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={index} className="mb-1 mt-5 text-base font-bold text-slate-900">
          {inline(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    elements.push(
      <p key={index} className="my-3 text-sm leading-7 text-slate-700 md:text-base">
        {inline(trimmed)}
      </p>
    );
  });

  flushList();

  return <Fragment>{elements}</Fragment>;
}
