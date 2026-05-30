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
      <div className="relative overflow-hidden" style={{
        background: 'linear-gradient(150deg, #FF7A3C 0%, #FF4F00 55%, #C93A00 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '18px 20px 16px',
        boxShadow: '0 8px 32px rgba(201,58,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}>
        {/* Shimmer sweep */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '40%', height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
          animation: 'shimmer 3s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Corner dots */}
        {['top-2.5 left-2.5','top-2.5 right-2.5','bottom-2.5 left-2.5','bottom-2.5 right-2.5'].map(pos => (
          <div key={pos} className={`absolute ${pos} w-1.5 h-1.5 rounded-full`} style={{ background: 'rgba(255,255,255,0.5)' }} />
        ))}

        {/* Header row */}
        <div className="font-ui" style={{ fontSize: 8.5, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.65)' }}>
          CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <h1 className="font-display" style={{ fontSize: 26, fontWeight: 900, letterSpacing: '0.02em', color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.25)' }}>
            HỘ CHIẾU SỐ
          </h1>
          <div className="flex items-center justify-center" style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.12)',
            animation: 'starPulse 2.5s ease-in-out infinite',
          }}>
            <span style={{ fontSize: 20, color: '#fff' }}>★</span>
          </div>
        </div>
        <div className="font-body italic" style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, marginTop: 2 }}>
          Sổ tay hành trình của bạn đồng hành cùng Lão Tào
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.25)' }} />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 8 }}>✦</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.25)' }} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3">
          {[
            { label: 'Tỉnh Cắm Cờ', value: provinces.filter(p => p.status === 'flagged').length, icon: <Flag size={10} strokeWidth={2.5} /> },
            { label: 'Địa Điểm', value: subLocations.filter(s => s.status !== 'locked').length, icon: <Map size={10} strokeWidth={2} /> },
            { label: 'Flex Point', value: points, icon: <Zap size={10} strokeWidth={2.5} /> },
          ].map((s, i) => (
            <div key={s.label} className="text-center px-2" style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
              <div className="font-display" style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1, textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>{s.value}</div>
              <div className="font-ui mt-1 inline-flex items-center gap-1" style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                {s.icon} {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* MRZ strip */}
        <div className="mt-3 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="font-mono" style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', wordBreak: 'break-all' }}>
            VNMLAOTAO&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
          </div>
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
        opacity: locked ? 0.55 : 1,
        filter: locked ? 'grayscale(0.6)' : 'none',
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
