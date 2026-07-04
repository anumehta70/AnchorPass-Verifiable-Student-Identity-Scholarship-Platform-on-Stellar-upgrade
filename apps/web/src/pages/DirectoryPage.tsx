import { useState } from "react";
import { Link } from "react-router-dom";

const MOCK_INSTITUTIONS = [
  { id: 1, name: "Stanford University", country: "USA", verified: true, count: 124 },
  { id: 2, name: "University of Cambridge", country: "UK", verified: true, count: 89 },
  { id: 3, name: "Indian Institute of Technology", country: "India", verified: true, count: 210 },
  { id: 4, name: "University of Toronto", country: "Canada", verified: true, count: 45 },
  { id: 5, name: "National University of Singapore", country: "Singapore", verified: true, count: 112 },
];

export function DirectoryPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_INSTITUTIONS.filter(inst => 
    inst.name.toLowerCase().includes(search.toLowerCase()) || 
    inst.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-semibold text-ink">Public Directory</h1>
        <p className="mt-4 font-body text-ink/70 max-w-xl mx-auto">
          A public directory of all verified educational institutions issuing credentials on AnchorPass.
        </p>
      </div>
      
      <div className="mb-8 relative">
        <input 
          type="text" 
          placeholder="Search by university or country..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-ink/20 bg-paper py-3 pl-12 pr-4 font-body outline-none focus:border-institution"
        />
        <span className="absolute left-4 top-3.5 text-ink/40">🔍</span>
      </div>

      <div className="space-y-4">
        {filtered.map(inst => (
          <div key={inst.id} className="flex items-center justify-between rounded-xl border border-ink/10 bg-paper p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-institution text-paper text-xl">
                🏛️
              </div>
              <div>
                <h3 className="font-display font-semibold text-ink flex items-center gap-2">
                  {inst.name}
                  {inst.verified && <span className="text-verified text-sm">✓ Verified</span>}
                </h3>
                <p className="font-body text-sm text-ink/60">{inst.country}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-institution">{inst.count}</p>
              <p className="font-body text-xs text-ink/50">Credentials Issued</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 font-body text-ink/60">
            No institutions found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
