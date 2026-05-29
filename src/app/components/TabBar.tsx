import { Map, Layers, BookOpen, Newspaper, type LucideIcon } from 'lucide-react';

export type TabKey = 'map' | 'discover' | 'flex' | 'feed';

const TABS: { key: TabKey; Icon: LucideIcon; label: string }[] = [
  { key: 'map',      Icon: Map,       label: 'Bản Đồ'   },
  { key: 'discover', Icon: Layers,    label: 'Khám Phá' },
  { key: 'flex',     Icon: BookOpen,  label: 'Flex Book' },
  { key: 'feed',     Icon: Newspaper, label: 'Bảng Tin' },
];

export function TabBar({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <nav
      className="sticky bottom-0 z-30 grid grid-cols-4"
      style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}
    >
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className="relative flex flex-col items-center justify-center h-[60px] gap-0.5 transition"
            style={{ color: isActive ? 'var(--accent-500)' : 'var(--text-tertiary)' }}
          >
            <span style={{ transform: isActive ? 'translateY(-1px)' : 'none', transition: 'transform 250ms var(--ease-spring)' }}>
              <t.Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
            </span>
            <span className="font-ui" style={{ fontSize: 11, fontWeight: isActive ? 700 : 500 }}>
              {t.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full"
                style={{ background: 'var(--accent-500)' }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
