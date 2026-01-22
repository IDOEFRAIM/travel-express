"use client";
import { useState } from "react";

export default function DescriptionWithExpand({ description, maxWords = 25 }: { description: string, maxWords?: number }) {
  const [expanded, setExpanded] = useState(false);
  const words = description.split(' ');
  if (words.length <= maxWords) return <span>{description}</span>;
  return (
    <>
      {expanded ? description : words.slice(0, maxWords).join(' ') + '...'}
      <button
        className="ml-2 text-blue-600 underline text-xs font-bold"
        onClick={e => { e.preventDefault(); setExpanded(v => !v); }}
      >
        {expanded ? 'Réduire' : 'Lire plus'}
      </button>
    </>
  );
}