import { Gem, Compass, Gift, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSettings, fetchVisitors, type Visitor } from '../store';

const TYPE_SPEED = 80;
const DELETE_SPEED = 50;
const PAUSE = 1400;

function useTypewriter(names: string[]) {
  const [display, setDisplay] = useState(names[0] ?? '');
  const [nameIdx, setNameIdx] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('pause');

  useEffect(() => {
    if (!names.length) return;
    const target = names[nameIdx % names.length];
    if (phase === 'pause') {
      const t = setTimeout(() => setPhase('deleting'), PAUSE);
      return () => clearTimeout(t);
    }
    if (phase === 'deleting') {
      if (display.length === 0) {
        const next = (nameIdx + 1) % names.length;
        setNameIdx(next);
        setPhase('typing');
        return;
      }
      const t = setTimeout(() => setDisplay(d => d.slice(0, -1)), DELETE_SPEED);
      return () => clearTimeout(t);
    }
    if (phase === 'typing') {
      if (display === target) { setPhase('pause'); return; }
      const t = setTimeout(() => setDisplay(target.slice(0, display.length + 1)), TYPE_SPEED);
      return () => clearTimeout(t);
    }
  }, [display, phase, nameIdx]);

  return display;
}

type Props = { currentStop: string; points: number; onPredict: () => void; onDiscover?: () => void };

function Avatar({ name, size = 52 }: { name: string; size?: number }) {
  const bgColors = ['#FFE9DA','#FFF3CD','#E8F0FB','#E8F5EE','#F0EBFF','#FFE8F3'];
  const txtColors = ['#FF631F','#E8A000','#2D6A9F','#2D6A3F','#7C3AED','#DB2777'];
  const idx = name.charCodeAt(0) % bgColors.length;
  return (
    <div className="grid place-items-center font-display shrink-0"
      style={{ width: size, height: size, borderRadius: '50%', background: bgColors[idx], color: txtColors[idx], fontSize: size * 0.38, fontWeight: 800 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function LeaderboardScreen({ onClose }: { onClose: () => void }) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitors().then(v => {
      setVisitors(v.sort((a, b) => (b.points ?? 0) - (a.points ?? 0)).slice(0, 10));
      setLoading(false);
    });
  }, []);

  const top3 = visitors.slice(0, 3); // [1st, 2nd, 3rd]
  const rest = visitors.slice(3);

  // Podium order: 2nd | 1st | 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumColors = [
    'linear-gradient(180deg, #A8C4E8 0%, #7BA3D0 100%)',   // 2nd — blue
    'linear-gradient(180deg, #F5C842 0%, #E8A000 100%)',   // 1st — gold
    'linear-gradient(180deg, #E8A090 0%, #D07060 100%)',   // 3rd — salmon
  ];
  const podiumHeights = [90, 130, 75];
  const podiumRanks = [2, 1, 3];

  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}>
    <motion.div className="flex flex-col w-full max-w-[480px] h-full" style={{ background: 'var(--bg-warm)' }}
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 shrink-0">
        <button onClick={onClose} className="grid place-items-center rounded-full shrink-0"
          style={{ width: 36, height: 36, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 16 }}>✕</span>
        </button>
        <div className="flex-1 text-center">
          <div className="font-display" style={{ fontSize: 20, fontWeight: 800 }}>Bảng Xếp Hạng</div>
          <div className="font-ui" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Top 10 cày gem nhiều nhất</div>
        </div>
        <div style={{ width: 36 }} />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="text-center py-12 font-ui" style={{ color: 'var(--text-tertiary)' }}>Đang tải...</div>
        ) : visitors.length === 0 ? (
          <div className="text-center py-12 font-ui" style={{ color: 'var(--text-tertiary)' }}>Chưa có dữ liệu</div>
        ) : (<>
          {/* Podium — Top 3 */}
          {top3.length >= 1 && (
            <div className="px-6 pt-4 pb-0">
              <div className="flex items-end justify-center gap-3">
                {podiumOrder.map((v, pi) => v ? (
                  <div key={v.id} className="flex flex-col items-center" style={{ flex: 1 }}>
                    {/* Avatar + name above podium */}
                    <Avatar name={v.name} size={pi === 1 ? 60 : 48} />
                    <div className="font-display mt-2 text-center truncate w-full px-1"
                      style={{ fontSize: pi === 1 ? 13 : 11, fontWeight: 700 }}>{v.name}</div>
                    <div className="flex items-center gap-0.5 font-ui mt-0.5"
                      style={{ fontSize: 11, color: 'var(--accent-500)', fontWeight: 700 }}>
                      <Gem size={10} strokeWidth={2} />{(v.points ?? 0).toLocaleString()}
                    </div>
                    {/* Podium block */}
                    <div className="w-full mt-2 flex items-center justify-center rounded-t-2xl"
                      style={{ height: podiumHeights[pi], background: podiumColors[pi] }}>
                      <span className="font-display" style={{ fontSize: podiumHeights[pi] * 0.38, fontWeight: 900, color: 'rgba(255,255,255,0.85)' }}>
                        {podiumRanks[pi]}
                      </span>
                    </div>
                  </div>
                ) : <div key={pi} style={{ flex: 1 }} />)}
              </div>
            </div>
          )}

          {/* Rest #4–10 */}
          {rest.length > 0 && (
            <div className="px-4 pt-3 pb-6 flex flex-col gap-2">
              {rest.map((v, i) => (
                <div key={v.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <span className="font-ui shrink-0" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)', minWidth: 20 }}>{i + 4}</span>
                  <Avatar name={v.name} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="font-display truncate" style={{ fontSize: 14, fontWeight: 700 }}>{v.name}</div>
                    <div className="font-ui" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {v.device ?? ''}{v.os ? ` · ${v.os}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-ui shrink-0"
                    style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-500)' }}>
                    <Gem size={12} strokeWidth={2} />{(v.points ?? 0).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>)}
      </div>
    </motion.div>
    </motion.div>
  );
}

function MissionScreen({ onClose }: { onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}>
    <motion.div className="relative flex flex-col w-full max-w-[480px] h-full" style={{ background: 'var(--bg-warm)' }}
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}>
      {/* Close button */}
      <button onClick={onClose} className="absolute top-12 right-4 grid place-items-center rounded-full"
        style={{ width: 36, height: 36, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', zIndex: 1 }}>
        <span style={{ fontSize: 16 }}>✕</span>
      </button>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <div className="grid place-items-center rounded-3xl mb-6"
          style={{ width: 96, height: 96, background: 'var(--accent-100)', color: 'var(--accent-500)', animation: 'floatY 2.5s ease-in-out infinite' }}>
          <Gift size={48} strokeWidth={1.5} />
        </div>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800 }}>Nhiệm Vụ</h1>
        <p className="font-ui mt-3" style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Tính năng nhiệm vụ đang được<br />phát triển. Sắp ra mắt!
        </p>
        <div className="mt-5 px-5 py-3 rounded-full font-ui"
          style={{ background: 'var(--accent-100)', color: 'var(--accent-600)', fontSize: 13, fontWeight: 700 }}>
          🚧 Coming soon
        </div>
      </div>
    </motion.div>
    </motion.div>
  );
}

export function Header({ currentStop, points, onPredict, onDiscover }: Props) {
  const settings = useSettings();
  const name = useTypewriter(settings.header.typewriterNames);
  const [showMission, setShowMission] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  return (
    <>
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 h-14"
      style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-ui shrink-0"
          style={{ background: 'var(--accent-100)', color: 'var(--accent-600)', fontWeight: 800, fontSize: 13 }}
        >
          {settings.header.avatarText?.startsWith('data:') || settings.header.avatarText?.startsWith('http')
            ? <img src={settings.header.avatarText} alt="avatar" className="w-full h-full object-cover" />
            : settings.header.avatarText
          }
        </div>
        <div className="leading-tight">
          <div className="font-ui" style={{ fontSize: 14, fontWeight: 700 }}>
            Sổ Tay hành trình của{' '}
            <span style={{ color: 'var(--accent-600)' }}>{name}</span>
            <span style={{ color: 'var(--accent-500)', opacity: 0.7 }}>|</span>
          </div>
<div className="flex items-center gap-1 mt-0.5">
            <span className="relative inline-flex w-2 h-2">
              <span className="absolute inset-0 rounded-full" style={{ background: '#E53E3E', animation: 'pulseDot 1.5s ease infinite' }} />
              <span className="absolute -inset-1 rounded-full" style={{ background: 'var(--accent-500)', opacity: 0.3, animation: 'pulseRing 1.5s ease infinite' }} />
            </span>
            <span className="font-ui" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Đang ở <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{currentStop}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onDiscover && (
          <button
            onClick={onDiscover}
            className="hidden lg:flex items-center gap-1.5 h-8 rounded-full font-ui"
            style={{ background: 'var(--accent-500)', color: '#fff', fontWeight: 700, fontSize: 12, padding: '0 14px', boxShadow: '0 2px 10px rgba(255,99,31,0.3)' }}
          >
            <Compass size={13} strokeWidth={2.5} /> Khám Phá
          </button>
        )}
        <div className="flex items-center gap-1 px-2.5 h-8 rounded-full shrink-0"
          style={{ background: 'var(--accent-100)', border: '1px solid var(--accent-300)', color: 'var(--accent-600)', fontSize: 12, fontWeight: 700 }}>
          <Gem size={11} strokeWidth={2} />
          <span className="font-ui">{points}</span>
        </div>
        <button onClick={() => setShowLeaderboard(true)}
          aria-label="Bảng xếp hạng"
          className="w-8 h-8 rounded-full grid place-items-center transition active:scale-90 shrink-0"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
          <Trophy size={15} strokeWidth={2} />
        </button>
        <button onClick={() => setShowMission(true)}
          aria-label="Nhiệm vụ"
          className="w-8 h-8 rounded-full grid place-items-center transition active:scale-90 shrink-0"
          style={{ background: 'var(--accent-500)', color: '#fff', animation: 'floatY 2s ease-in-out infinite', boxShadow: '0 2px 8px rgba(255,99,31,0.3)' }}>
          <Gift size={15} strokeWidth={2} />
        </button>
      </div>
    </header>

    <AnimatePresence>
      {showLeaderboard && <LeaderboardScreen onClose={() => setShowLeaderboard(false)} />}
    </AnimatePresence>
    <AnimatePresence>
      {showMission && <MissionScreen onClose={() => setShowMission(false)} />}
    </AnimatePresence>
    </>
  );
}
