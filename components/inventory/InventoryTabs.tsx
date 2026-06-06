import { TABS, type TabKey } from "./helpers";

export function InventoryTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  return (
    <div className="px-4 pt-4 flex gap-1 flex-wrap border-b border-border-subtle pb-0">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2.5 text-xs font-semibold transition-colors rounded-t-md -mb-px ${
            active === tab.key
              ? "bg-brand text-brand-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
