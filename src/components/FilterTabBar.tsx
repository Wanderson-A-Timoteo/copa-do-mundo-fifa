import React from "react";

interface FilterTab {
  id: string;
  label: string;
  count?: number;
}

export default function FilterTabBar({
  tabs,
  activeId,
  onChange,
}: {
  tabs: FilterTab[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
            activeId === tab.id
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-1 text-xs opacity-60">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
