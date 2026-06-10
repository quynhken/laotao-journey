import {
  Compass, Film, Flag, Sparkles, BookOpen, Star, Layers, PenLine,
  Map, Gem, Award, ChevronRight, type LucideIcon,
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
      <a href="https://www.youtube.com/@laotaovlog" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      <div className="relative overflow-hidden" style={{
        background: 'linear-gradient(160deg, #FEF6E8 0%, #FDF0D5 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '14px 16px',
        boxShadow: '0 2px 12px rgba(180,100,20,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
        border: '1px solid #F0D8A8',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(180,100,20,0.18)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(180,100,20,0.10)'; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
      >
        {/* Subtle texture overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,160,50,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Corner dots */}
        {['top-2 left-2','top-2 right-2','bottom-2 left-2','bottom-2 right-2'].map(pos => (
          <div key={pos} className={`absolute ${pos} w-1.5 h-1.5 rounded-full`} style={{ background: '#E8C070', opacity: 0.6 }} />
        ))}

        {/* Top label */}
        <div className="font-ui mb-2.5" style={{ fontSize: 7.5, letterSpacing: '0.2em', color: '#C4873A' }}>
          HỘ CHIẾU HÀNH TRÌNH · LAOTAO.BLOG
        </div>

        {/* Avatar + Info row */}
        <div className="flex items-center gap-3">
          {/* Avatar circle */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
            border: '2.5px solid #F0C870',
            boxShadow: '0 2px 8px rgba(200,130,30,0.25)',
            overflow: 'hidden', background: '#FFE4A0',
          }}>
            {settings.header?.avatarText ? (
              <img src={settings.header.avatarText} alt="Lão Tào" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🧭</div>
            )}
          </div>

          {/* Name + subtitle */}
          <div className="flex-1 min-w-0">
            <div className="font-display" style={{ fontSize: 20, fontWeight: 900, color: '#7A3A00', letterSpacing: '0.01em', lineHeight: 1.1 }}>
              Lão Tào
            </div>
            <div className="font-body" style={{ fontSize: 11.5, color: '#B06820', marginTop: 3 }}>
              Xuyên Việt · {provinces.filter(p => p.status === 'flagged').length} Tỉnh Cắm Cờ
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight size={18} strokeWidth={2.5} style={{ color: '#C4873A', flexShrink: 0, opacity: 0.7 }} />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-3 pt-2.5" style={{ borderTop: '1px solid #EDD090' }}>
          {[
            { icon: <Flag size={10} strokeWidth={2.5} />, value: provinces.filter(p => p.status === 'flagged').length, label: 'Cắm Cờ' },
            { icon: <Map size={10} strokeWidth={2} />, value: subLocations.filter(s => s.status !== 'locked').length, label: 'Địa Điểm' },
            { icon: <Award size={10} strokeWidth={2} />, value: earnedBadges, label: 'Huy Hiệu' },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-1.5 font-ui" style={{
              fontSize: 11,
              paddingLeft: i > 0 ? 12 : 0,
              borderLeft: i > 0 ? '1px solid #EDD090' : 'none',
            }}>
              <span style={{ color: '#C4873A' }}>{s.icon}</span>
              <span style={{ fontWeight: 700, color: '#7A3A00' }}>{s.value}</span>
              <span style={{ color: '#B06820', fontSize: 10 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      </a>

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
