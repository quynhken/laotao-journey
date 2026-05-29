import {
  Compass, Film, Flag, Sparkles, BookOpen, Star, Layers, PenLine,
  Map, Zap, Award, type LucideIcon,
} from 'lucide-react';
import { STOPS, BADGES, REGION_COLOR, REGION_LABEL, type Region } from './data';
import { useSettings } from '../store';

const BADGE_ICON_MAP: Record<string, LucideIcon> = {
  Compass, Film, Flag, Sparkles, BookOpen, Star, Layers, PenLine,
};

export function FlexBookTab({ flagged, points }: { flagged: Set<number>; points: number }) {
  useSettings();
  const totalFlagged = STOPS.filter((s) => s.status === 'flagged' || flagged.has(s.id)).length;
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
          <Stat label="Danh Hiệu" value={earnedBadges} divider icon={<Award size={11} strokeWidth={2} />} />
          <Stat label="Flex Điểm" value={points} accent icon={<Zap size={11} strokeWidth={2.5} />} />
        </div>
      </div>

      {/* Stamp Grid */}
      <section>
        <div className="font-ui mb-2" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
          TRANG CẮM CỜ ({totalFlagged}/{STOPS.length})
        </div>
        <div className="grid grid-cols-4 gap-3">
          {STOPS.map((s) => {
            const earned = s.status === 'flagged' || flagged.has(s.id);
            return <Stamp key={s.id} id={s.id} name={s.name} date={s.date} region={s.region} earned={earned} />;
          })}
        </div>
      </section>

      {/* Badge Collection */}
      <section>
        <div className="font-ui mb-2" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>
          DANH HIỆU ({earnedBadges}/{BADGES.length})
        </div>
        <div className="grid grid-cols-3 gap-3">
          {BADGES.map((b) => {
            const IconComp = BADGE_ICON_MAP[b.icon] ?? Compass;
            return (
              <div key={b.name}
                className="p-3 text-center"
                style={{
                  background: b.earned ? 'var(--accent-100)' : 'var(--bg-surface)',
                  border: `1px solid ${b.earned ? 'var(--accent-300)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-lg)',
                  opacity: b.earned ? 1 : 0.55,
                  filter: b.earned ? 'none' : 'grayscale(1)',
                }}>
                <div className="flex justify-center mb-1"
                  style={{ color: b.earned ? 'var(--accent-500)' : 'var(--text-tertiary)' }}>
                  <IconComp size={24} strokeWidth={1.8} />
                </div>
                <div className="font-ui mt-1" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {b.name}
                </div>
                <div className="font-ui mt-0.5" style={{ fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1.3 }}>
                  {b.desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>
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

function Stamp({ id, name, date, region, earned }: {
  id: number; name: string; date: string; region: Region; earned: boolean;
}) {
  const color = REGION_COLOR[region];
  const label = REGION_LABEL[region];
  return (
    <div
      className="relative aspect-square grid place-items-center text-center p-1"
      style={{
        border: `2px dashed ${earned ? color : 'var(--border-default)'}`,
        borderRadius: '50%',
        background: earned ? `${color}14` : 'transparent',
        opacity: earned ? 1 : 0.35,
        filter: earned ? 'none' : 'grayscale(1)',
        animation: earned ? 'stampIn 500ms var(--ease-spring) both' : 'none',
      }}
    >
      <div>
        <div className="font-ui" style={{ fontSize: 9, color: earned ? color : 'var(--text-muted)', fontWeight: 700 }}>
          #{String(id).padStart(2, '0')}
        </div>
        <div className="font-display" style={{ fontSize: 10, lineHeight: 1.1, color: earned ? color : 'var(--text-muted)', fontWeight: 700 }}>
          {name}
        </div>
        <div className="font-ui" style={{ fontSize: 8, color: earned ? color : 'var(--text-muted)', opacity: 0.7 }}>
          {earned ? date : label}
        </div>
      </div>
    </div>
  );
}
