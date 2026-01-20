import React from "react";

export function ProposalsList({ proposals }: { proposals: any[] }) {
  if (!proposals?.length) {
    return <div className="text-slate-500">Aucune offre d'université trouvée.</div>;
  }
  return (
    <ul className="space-y-4">
      {proposals.map((univ) => (
        <li key={univ.id} className="border rounded-xl p-4 bg-white shadow">
          <h2 className="font-bold text-lg text-blue-700">{univ.name}</h2>
          <p className="text-slate-600 mb-1">{univ.city}</p>
          {univ.summary && <p className="text-slate-500 mb-2">{univ.summary}</p>}
          {univ.costRange && <p className="text-xs text-slate-400">Coût: {univ.costRange}</p>}
        </li>
      ))}
    </ul>
  );
}
