import { Zap, Sparkles, Compass } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSettings } from '../store';

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

export function Header({ currentStop, points, onPredict, onDiscover }: Props) {
  const settings = useSettings();
  const name = useTypewriter(settings.header.typewriterNames);
  return (
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

      <div className="flex items-center gap-1.5">
        {onDiscover && (
          <button
            onClick={onDiscover}
            className="hidden lg:flex items-center gap-1.5 h-8 rounded-full font-ui"
            style={{ background: 'var(--accent-500)', color: '#fff', fontWeight: 700, fontSize: 12, padding: '0 14px', boxShadow: '0 2px 10px rgba(255,99,31,0.3)' }}
          >
            <Compass size={13} strokeWidth={2.5} /> Khám Phá
          </button>
        )}
        <div className="flex items-center gap-1 px-2.5 h-8 rounded-full"
          style={{ background: 'var(--accent-100)', border: '1px solid var(--accent-300)', color: 'var(--accent-600)', fontSize: 12, fontWeight: 700 }}>
          <Zap size={11} strokeWidth={2.5} />
          <span className="font-ui">{points}</span>
        </div>
        <button onClick={onPredict}
          aria-label="Dự đoán"
          className="w-8 h-8 rounded-full grid place-items-center transition"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
          <Sparkles size={15} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
