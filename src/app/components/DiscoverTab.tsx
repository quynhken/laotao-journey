import { useState, useMemo } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { Navigation, Heart, X, Share2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSettings, setSettings, patchSubLocation } from '../store';
import type { SubLocation } from './data';

type Action = 'flag' | 'skip' | 'wishlist';

function fmtNum(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n);
}

const STATUS_TAG: Record<SubLocation['status'], string> = {
  locked:  'Khám phá',
  flagged: 'Đã ghé',
  visited: 'Đã ghé',
};

export function DiscoverTab({
  onAction,
  onAddPoints,
}: {
  onAction: (sub: SubLocation, action: Action) => void;
  onAddPoints: (n: number, label: string) => void;
}) {
  const settings = useSettings();

  // Shuffle once on mount — Fisher-Yates
  const allSubs = useMemo(() => {
    const arr = [...settings.subLocations];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [stack, setStack] = useState<SubLocation[]>(allSubs);
  const [reviewing, setReviewing] = useState<SubLocation | null>(null);

  const handleDone = (action: Action) => {
    const top = stack[0];
    if (!top) return;

    if (action === 'flag') {
      // Update status to flagged if not yet visited
      const newStatus = top.status === 'locked' ? 'flagged' : top.status;
      if (top.status === 'locked') {
        // Optimistic update in store
        setSettings((prev) => ({
          ...prev,
          subLocations: prev.subLocations.map((s) =>
            s.id === top.id ? { ...s, status: 'flagged' as const } : s,
          ),
        }));
        patchSubLocation(top.id, { status: 'flagged' });
      }
      onAction({ ...top, status: newStatus }, action);
      onAddPoints(100, 'Cắm Cờ');
      setReviewing(top);
    } else if (action === 'wishlist') {
      onAction(top, action);
      onAddPoints(10, 'Wishlist');
    } else {
      onAction(top, action);
    }

    setStack((s) => s.slice(1));
  };

  const top = stack[0];

  return (
    <div className="flex flex-col" style={{ padding: '16px 16px 0' }}>
      <div className="relative w-full" style={{ height: 460, overflow: 'hidden' }}>
        <AnimatePresence>
          {stack.length === 0 && (
            <div
              className="absolute inset-0 grid place-items-center text-center px-6"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}
            >
              <div>
                <div className="flex justify-center mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  <Navigation size={36} strokeWidth={1.5} />
                </div>
                <p className="font-body italic" style={{ color: 'var(--text-tertiary)' }}>
                  Lão Tào vẫn đang đi. Chặng mới sắp ra — chờ tí nhé!
                </p>
              </div>
            </div>
          )}
          {stack.slice(0, 3).reverse().map((sub, idx, arr) => {
            const depth = arr.length - 1 - idx;
            return (
              <SwipeCard
                key={sub.id}
                sub={sub}
                depth={depth}
                interactive={depth === 0}
                onDone={handleDone}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-10 mt-6">
        {[
          {
            icon: <X size={22} strokeWidth={2.5} />,
            label: 'Bỏ qua',
            count: top ? fmtNum(top.reviews ?? 0) : null,
            onClick: () => handleDone('skip'),
            btnStyle: { border: '2px solid #F97316', background: 'var(--bg-base)', color: '#F97316' },
          },
          {
            icon: <Share2 size={22} strokeWidth={2} />,
            label: 'Share',
            count: null as string | null,
            onClick: async () => {
              if (!top) return;
              const img = (top.images?.[0] || top.image) ?? '';
              const text = `${top.name} — ${top.province}\n${top.quote ? top.quote.replace(/"/g, '') : ''}`;
              const url = window.location.origin;
              if (navigator.share) {
                try {
                  await navigator.share({ title: top.name, text, url });
                } catch {}
              } else {
                await navigator.clipboard.writeText(`${top.name}\n${text}\n${url}`).catch(() => {});
                alert('Đã copy vào clipboard!');
              }
            },
            btnStyle: { border: '2px solid var(--border-default)', background: 'var(--bg-base)', color: 'var(--text-secondary)' },
          },
          {
            icon: <Heart size={22} strokeWidth={2} fill="currentColor" />,
            label: 'Thả tim',
            count: top ? fmtNum(top.rating ? Math.round(top.rating * 100) : 0) : null,
            onClick: () => handleDone('flag'),
            btnStyle: { border: 'none', background: 'var(--accent-500)', color: '#fff' },
          },
        ].map(({ icon, label, count, onClick, btnStyle }) => (
          <button key={label} onClick={onClick} className="flex flex-col items-center gap-1.5 active:scale-95 transition">
            <div className="grid place-items-center rounded-full"
              style={{ width: 56, height: 56, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', ...btnStyle }}>
              {icon}
            </div>
            <span className="font-ui" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
              {count ?? label}
            </span>
          </button>
        ))}
      </div>

      {reviewing && (
        <ReviewSheet
          sub={reviewing}
          onClose={() => setReviewing(null)}
          onSubmit={(stars, text) => {
            if (stars > 0) {
              patchSubLocation(reviewing.id, { rating: stars });
              setSettings((prev) => ({
                ...prev,
                subLocations: prev.subLocations.map((s) =>
                  s.id === reviewing.id ? { ...s, rating: stars } : s,
                ),
              }));
            }
            onAddPoints(20, 'Review');
            setReviewing(null);
          }}
        />
      )}
    </div>
  );
}

function SwipeCard({
  sub, depth, interactive, onDone,
}: {
  sub: SubLocation; depth: number; interactive: boolean; onDone: (a: Action) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const flagOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);
  const wishOpacity = useTransform(y, [-100, 0], [1, 0]);

  const img = (sub.images?.[0] || sub.image) ?? '';

  return (
    <motion.div
      drag={interactive}
      dragElastic={0.15}
      dragMomentum={false}
      style={{
        x, y, rotate,
        position: 'absolute', inset: 0,
        translateY: depth * 16,
        zIndex: 10 - depth,
        background: 'var(--bg-base)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        cursor: interactive ? 'grab' : 'default',
        display: 'flex', flexDirection: 'column',
        touchAction: 'none',
      }}
      onDragEnd={(_, info) => {
        const t = 100;
        if (info.offset.x > t) onDone('flag');
        else if (info.offset.x < -t) onDone('skip');
        else if (info.offset.y < -t) onDone('wishlist');
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: ([1, 0.36, 0.2] as number[])[depth] ?? 0.1,
        scale: ([1, 0.8, 0.64] as number[])[depth] ?? 0.5,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
    >
      {/* Image area */}
      <div className="relative flex-1">
        <ImageWithFallback src={img} alt={sub.name} className="w-full h-full object-cover" />
        <div className="absolute inset-x-0 bottom-0"
          style={{ height: '55%', background: 'linear-gradient(to top, rgba(10,10,10,0.72) 0%, transparent 100%)' }} />

        {/* Swipe overlays */}
        <motion.div className="absolute inset-0 grid place-items-center font-display"
          style={{ background: 'rgba(45,106,63,0.88)', opacity: flagOpacity, color: '#fff', fontSize: 32, fontWeight: 800 }}>
          CẮM CỜ
        </motion.div>
        <motion.div className="absolute inset-0 grid place-items-center font-display"
          style={{ background: 'rgba(155,44,44,0.88)', opacity: skipOpacity, color: '#fff', fontSize: 32, fontWeight: 800 }}>
          LẦN SAU
        </motion.div>
        <motion.div className="absolute inset-0 grid place-items-center font-display"
          style={{ background: 'rgba(255,99,31,0.88)', opacity: wishOpacity, color: '#fff', fontSize: 32, fontWeight: 800 }}>
          WISHLIST
        </motion.div>

        {/* Card info */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          <div className="font-ui mb-1.5" style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
            {sub.date !== '—' ? sub.date : ''}{sub.date !== '—' && sub.province ? ' / ' : ''}
            <span style={{ color: '#fff', fontWeight: 700 }}>{sub.province}</span>
            {sub.km > 0 && (
              <span style={{ color: 'rgba(255,255,255,0.6)' }}> · km {sub.km}</span>
            )}
          </div>
          <p className="font-display" style={{ fontSize: 20, color: '#fff', lineHeight: 1.3, marginBottom: 10 }}>
            {sub.quote ? sub.quote.replace(/"/g, '') : sub.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-ui px-2.5 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 11, fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)' }}>
              {STATUS_TAG[sub.status]}
            </span>
            {sub.rating && sub.rating > 0 && (
              <span className="font-ui px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', color: '#fff', fontSize: 11, fontWeight: 700, border: '1px solid rgba(255,255,255,0.3)' }}>
                ★ {sub.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ReviewSheet({
  sub, onClose, onSubmit,
}: {
  sub: SubLocation;
  onClose: () => void;
  onSubmit: (stars: number, text: string) => void;
}) {
  const [stars, setStars] = useState(0);
  const [text, setText] = useState('');
  const chips = ['Đẹp vãi', 'Đồ ăn ngon', 'Đường khó đi', 'Nhất định quay lại', 'Lạnh lắm', 'Đông khách'];
  const [sel, setSel] = useState<Set<string>>(new Set());
  const img = (sub.images?.[0] || sub.image) ?? '';

  return (
    <div className="fixed inset-0 z-40 flex items-end" onClick={onClose}
      style={{ background: 'rgba(17,17,17,0.4)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] mx-auto p-6 space-y-4"
        style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0' }}
      >
        <div className="w-9 h-1 rounded-full mx-auto" style={{ background: 'var(--border-default)' }} />
        <div className="flex items-center gap-3">
          {img && <ImageWithFallback src={img} alt={sub.name} className="w-10 h-10 rounded-lg object-cover" />}
          <div>
            <div className="font-ui" style={{ fontSize: 16, fontWeight: 700 }}>{sub.name}</div>
            <div className="font-ui" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{sub.province}</div>
          </div>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)}
              style={{ fontSize: 28, color: n <= stars ? 'var(--accent-500)' : 'var(--bg-elevated)' }}>
              ★
            </button>
          ))}
        </div>

        <textarea
          value={text} onChange={(e) => setText(e.target.value.slice(0, 150))}
          placeholder="Bạn thấy chỗ này thế nào?"
          rows={3}
          className="w-full p-3 outline-none resize-none font-ui"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, fontSize: 14 }}
        />
        <div className="font-ui text-right" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{text.length} / 150</div>

        <div className="flex flex-wrap gap-2">
          {chips.map((c) => {
            const on = sel.has(c);
            return (
              <button key={c}
                onClick={() => { const s = new Set(sel); on ? s.delete(c) : s.add(c); setSel(s); }}
                className="px-3 py-1.5 rounded-full font-ui transition"
                style={{
                  background: on ? 'var(--accent-100)' : 'var(--bg-surface)',
                  border: `1px solid ${on ? 'var(--accent-500)' : 'var(--border-default)'}`,
                  color: on ? 'var(--accent-600)' : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: 600,
                }}>
                {c}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={() => onSubmit(stars, text)} className="flex-1 h-11 rounded-full font-ui"
            style={{ background: 'var(--accent-500)', color: '#fff', fontWeight: 700 }}>
            Đăng Review +20đ
          </button>
          <button onClick={onClose} className="h-11 px-4 rounded-full font-ui"
            style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
            Bỏ qua
          </button>
        </div>
      </motion.div>
    </div>
  );
}
