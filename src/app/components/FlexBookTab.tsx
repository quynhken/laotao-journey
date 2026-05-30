import {
  Compass, Film, Flag, Sparkles, BookOpen, Star, Layers, PenLine,
  Map, Zap, Award, type LucideIcon,
} from 'lucide-react';
import { STOPS, BADGES, REGION_COLOR, REGION_LABEL, type Region } from './data';
import { useSettings } from '../store';
import type { Province } from './data';

const BADGE_ICON_MAP: Record<string, LucideIcon> = {
  Compass, Film, Flag, Sparkles, BookOpen, Star, Layers, PenLine,
};

export function FlexBookTab({ flagged, points }: { flagged: Set<number>; points: number }) {
  const settings = useSettings();
  const provinces: Province[] = settings.provinces ?? [];
  const subLocations = settings.subLocations ?? [];

  const totalFlagged = STOPS.filter((s) => s.status === 'flagged' || flagged.has(s.id)).length;

  // Get the earliest date from a province's sublocations
  const provinceDate = (pid: number): string => {
    const subs = subLocations.filter(s => s.provinceId === pid && s.date && s.date !== '—').sort((a, b) => a.locNum - b.locNum);
    return subs[0]?.date ?? '';
  };
  const earnedBadges = BADGES.filter((b) => b.earned).length;

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Passport Cover */}
      <div
        className="paper-noise relative overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, var(--bg-surface), var(--bg-warm))',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: 24,
        }}
      >
        <div className="font-ui" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--text-tertiary)' }}>
          CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </div>
        <div className="flex items-center justify-between mt-2">
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>
            FLEX BOOK
          </h1>
          <Map size={34} strokeWidth={1.5} style={{ color: 'var(--accent-400)' }} />
        </div>
        <div className="font-body italic mt-1" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Sổ tay hành trình của bạn đồng hành cùng Lão Tào
        </div>

        <div className="grid grid-cols-3 mt-5">
          <Stat label="Cắm Cờ" value={totalFlagged} accent icon={<Flag size={11} strokeWidth={2.5} />} />
          <Stat label="Flex Điểm" value={points} accent icon={<Zap size={11} strokeWidth={2.5} />} />
        </div>
      </div>

      {/* Stamp Grid */}
      <section>
        <div className="font-ui mb-2" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
          TRANG CẮM CỜ ({provinces.filter(p => p.status !== 'locked').length}/{provinces.length})
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[...provinces].sort((a, b) => a.id - b.id).map((p, idx) => {
            const visited = p.status === 'visited' || p.status === 'flagged';
            return (
              <Stamp
                key={p.id}
                num={idx + 1}
                name={p.name}
                date={provinceDate(p.id)}
                region={p.region}
                visited={visited}
                locked={p.status === 'locked'}
              />
            );
          })}
        </div>
      </section>

      {/* Badge Collection — ẩn tạm */}
    </div>
  );
}

function Stat({ label, value, accent, divider, icon }: {
  label: string; value: number; accent?: boolean; divider?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div className="text-center px-2" style={{
      borderLeft: divider ? '1px solid var(--border-subtle)' : undefined,
      borderRight: divider ? '1px solid var(--border-subtle)' : undefined,
    }}>
      <div className="font-display" style={{ fontSize: 26, fontWeight: 800, color: accent ? 'var(--accent-500)' : 'var(--text-primary)' }}>
        {value}
      </div>
      <div className="font-ui inline-flex items-center gap-1 justify-center"
        style={{ fontSize: 10, letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
        {icon}{label}
      </div>
    </div>
  );
}

function Stamp({ num, name, date, region, visited, locked }: {
  num: number; name: string; date: string; region: Region; visited: boolean; locked: boolean;
}) {
  const color = REGION_COLOR[region];
  return (
    <div
      className="relative aspect-square grid place-items-center text-center p-1"
      style={{
        border: `2px dashed ${visited ? color : 'var(--border-default)'}`,
        borderRadius: '50%',
        background: visited ? `${color}14` : 'transparent',
        opacity: locked ? 0.3 : 1,
        filter: locked ? 'grayscale(1)' : 'none',
        animation: visited ? 'stampIn 500ms var(--ease-spring) both' : 'none',
      }}
    >
      <div>
        <div className="font-ui" style={{ fontSize: 9, color: visited ? color : 'var(--text-tertiary)', fontWeight: 700 }}>
          #{String(num).padStart(2, '0')}
        </div>
        <div className="font-display" style={{ fontSize: 10, lineHeight: 1.1, color: visited ? color : 'var(--text-tertiary)', fontWeight: 700 }}>
          {name}
        </div>
        <div className="font-ui" style={{ fontSize: 8, color: visited ? color : 'var(--text-tertiary)', opacity: 0.7 }}>
          {visited ? date : 'Chưa đến'}
        </div>
      </div>
    </div>
  );
}
