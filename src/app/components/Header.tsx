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

function LeaderboardScreen({ onClose }: { onClose: () => void }) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitors().then(v => {
      setVisitors(v.sort((a, b) => (b.points ?? 0) - (a.points ?? 0)).slice(0, 10));
      setLoading(false);
    });
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}>
    <motion.div className="flex flex-col w-full max-w-[480px] h-full" style={{ background: 'var(--bg-warm)' }}
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}>
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <button onClick={onClose} className="grid place-items-center rounded-full shrink-0"
          style={{ width: 36, height: 36, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: 16 }}>✕</span>
        </button>
        <div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 800 }}>Bảng Xếp Hạng</div>
          <div className="font-ui" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Top 10 cày gem nhiều nhất</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
        {loading ? (
          <div className="text-center py-12 font-ui" style={{ color: 'var(--text-tertiary)' }}>Đang tải...</div>
        ) : visitors.length === 0 ? (
          <div className="text-center py-12 font-ui" style={{ color: 'var(--text-tertiary)' }}>Chưa có dữ liệu</div>
        ) : (
          <div className="flex flex-col gap-2">
            {visitors.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: i === 0 ? 'linear-gradient(135deg, #FFF3CD, #FFE082)' : i === 1 ? 'linear-gradient(135deg, #F5F5F5, #E8E8E8)' : i === 2 ? 'linear-gradient(135deg, #FFDCC7, #FFC9A0)' : 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 22, minWidth: 28, textAlign: 'center' }}>
                  {medals[i] ?? `${i + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-display truncate" style={{ fontSize: 15, fontWeight: 700 }}>{v.name}</div>
                  <div className="font-ui" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                    {v.device ?? ''}{v.os ? ` · ${v.os}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-1 font-ui shrink-0"
                  style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-500)' }}>
                  <Gem size={13} strokeWidth={2} />
                  {(v.points ?? 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
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
