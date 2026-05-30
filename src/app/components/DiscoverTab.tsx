import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { Navigation, Heart, X, Share2, ThumbsDown, MapPin, Star } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSettings, setSettings, patchSubLocation, fetchReactions, recordReaction, type ReactionCounts, fetchSubReviews, submitSubReview, type SubReview, getVisitorName } from '../store';
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
  const [reviewInitStars, setReviewInitStars] = useState(0);
  const [detail, setDetail] = useState<SubLocation | null>(null);
  const [reactions, setReactions] = useState<Record<string, ReactionCounts>>({});

  useEffect(() => { fetchReactions().then(setReactions); }, []);

  const topReactions = (id: number): ReactionCounts => reactions[String(id)] ?? { like: 0, dislike: 0, share: 0 };

  const react = async (id: number, type: 'like' | 'dislike' | 'share') => {
    const updated = await recordReaction(id, type);
    if (updated) setReactions(prev => ({ ...prev, [String(id)]: updated }));
  };

  const openReview = (sub: SubLocation, initStars = 0) => {
    setReviewInitStars(initStars);
    setReviewing(sub);
  };

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
                onTap={() => depth === 0 && setDetail(sub)}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-8 mt-6">
        {/* Không thích */}
        <button onClick={() => { if (top) { react(top.id, 'dislike'); handleDone('skip'); } }}
          className="flex flex-col items-center gap-1.5 active:scale-95 transition">
          <div className="grid place-items-center rounded-full"
            style={{ width: 56, height: 56, border: '2px solid #F97316', background: 'var(--bg-base)', color: '#F97316', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
            <ThumbsDown size={22} strokeWidth={2} />
          </div>
          <span className="font-ui" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {top ? fmtNum(topReactions(top.id).dislike) || 'Không thích' : 'Không thích'}
          </span>
        </button>

        {/* Chia sẻ */}
        <button onClick={async () => {
          if (!top) return;
          react(top.id, 'share');
          const text = `${top.name} — ${top.province}\n${top.quote ? top.quote.replace(/"/g, '') : ''}`;
          const url = window.location.origin;
          if (navigator.share) {
            try { await navigator.share({ title: top.name, text, url }); } catch {}
          } else {
            await navigator.clipboard.writeText(`${top.name}\n${text}\n${url}`).catch(() => {});
            alert('Đã copy vào clipboard!');
          }
        }} className="flex flex-col items-center gap-1.5 active:scale-95 transition">
          <div className="grid place-items-center rounded-full"
            style={{ width: 56, height: 56, border: '2px solid var(--border-default)', background: 'var(--bg-base)', color: 'var(--text-secondary)', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
            <Share2 size={22} strokeWidth={2} />
          </div>
          <span className="font-ui" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {top ? fmtNum(topReactions(top.id).share) || 'Chia sẻ' : 'Chia sẻ'}
          </span>
        </button>

        {/* Thích → mở review với 5 sao mặc định */}
        <button onClick={() => { if (top) { react(top.id, 'like'); openReview(top, 5); } }}
          className="flex flex-col items-center gap-1.5 active:scale-95 transition">
          <div className="grid place-items-center rounded-full"
            style={{ width: 56, height: 56, border: 'none', background: 'var(--accent-500)', color: '#fff', boxShadow: '0 4px 14px rgba(255,99,31,0.35)' }}>
            <Heart size={22} strokeWidth={2} fill="currentColor" />
          </div>
          <span className="font-ui" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {top ? fmtNum(topReactions(top.id).like) || 'Thích' : 'Thích'}
          </span>
        </button>
      </div>

      {reviewing && (
        <ReviewSheet
          sub={reviewing}
          initStars={reviewInitStars}
          onClose={() => setReviewing(null)}
          onSubmit={(stars, text, chips) => {
            const name = getVisitorName();
            if (stars > 0) {
              patchSubLocation(reviewing.id, { rating: stars });
              setSettings((prev) => ({
                ...prev,
                subLocations: prev.subLocations.map((s) =>
                  s.id === reviewing.id ? { ...s, rating: stars } : s,
                ),
              }));
            }
            submitSubReview(reviewing.id, { name, stars, text, chips });
            onAddPoints(20, 'Review');
            setReviewing(null);
          }}
        />
      )}
      {detail && (
        <DetailSheet
          sub={detail}
          onClose={() => setDetail(null)}
          onReview={() => { openReview(detail, 0); setDetail(null); }}
        />
      )}
    </div>
  );
}

function SwipeCard({
  sub, depth, interactive, onDone, onTap,
}: {
  sub: SubLocation; depth: number; interactive: boolean; onDone: (a: Action) => void; onTap?: () => void;
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
        else if (Math.abs(info.offset.x) < 10 && Math.abs(info.offset.y) < 10) onTap?.();
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
  sub, initStars = 0, onClose, onSubmit,
}: {
  sub: SubLocation;
  initStars?: number;
  onClose: () => void;
  onSubmit: (stars: number, text: string, chips: string[]) => void;
}) {
  const [stars, setStars] = useState(initStars);
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
          <button onClick={() => onSubmit(stars, text, Array.from(sel))} className="flex-1 h-11 rounded-full font-ui"
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

function DetailSheet({ sub, onClose, onReview }: {
  sub: SubLocation; onClose: () => void; onReview: () => void;
}) {
  const [reviews, setReviews] = useState<SubReview[]>([]);
  const [loading, setLoading] = useState(true);
  const img = (sub.images?.[0] || sub.image) ?? '';

  useEffect(() => {
    fetchSubReviews(sub.id).then(r => { setReviews(r); setLoading(false); });
  }, [sub.id]);

  const fmtDate = (iso: string) => {
    try { const d = new Date(iso); return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; } catch { return ''; }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end" onClick={onClose}
      style={{ background: 'rgba(17,17,17,0.5)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[480px] mx-auto overflow-y-auto no-scrollbar"
        style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', maxHeight: '88dvh' }}
      >
        {/* Handle */}
        <div className="sticky top-0 z-10 pt-3 pb-2 px-5" style={{ background: 'var(--bg-base)' }}>
          <div className="w-9 h-1 rounded-full mx-auto mb-3" style={{ background: 'var(--border-default)' }} />
        </div>

        {/* Image */}
        {img && (
          <div className="relative mx-4 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <ImageWithFallback src={img} alt={sub.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Info */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin size={11} strokeWidth={2} style={{ color: 'var(--text-tertiary)' }} />
            <span className="font-ui" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              {sub.province}{sub.km > 0 ? ` · km ${sub.km}` : ''}{sub.date !== '—' ? ` · ${sub.date}` : ''}
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15 }}>{sub.name}</h2>
          {sub.rating && sub.rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {[1,2,3,4,5].map(n => (
                <Star key={n} size={13} strokeWidth={0} fill={n <= Math.round(sub.rating!) ? 'var(--accent-500)' : 'var(--border-default)'} />
              ))}
              <span className="font-ui ml-1" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sub.rating.toFixed(1)}</span>
            </div>
          )}
          {sub.quote && sub.quote !== '"..."' && (
            <p className="font-body italic mt-3" style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {sub.quote}
            </p>
          )}
        </div>

        {/* Review button */}
        <div className="px-5 pb-4">
          <button onClick={onReview}
            className="w-full h-11 rounded-full font-ui mt-2"
            style={{ background: 'var(--accent-500)', color: '#fff', fontWeight: 700, fontSize: 14 }}>
            ✍️ Viết đánh giá +20đ
          </button>
        </div>

        {/* Reviews list */}
        <div className="px-5 pb-6">
          <div className="font-ui mb-3" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
            ĐÁNH GIÁ ({reviews.length})
          </div>
          {loading ? (
            <div className="font-ui text-center py-4" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Đang tải...</div>
          ) : reviews.length === 0 ? (
            <div className="font-ui text-center py-4" style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              Chưa có đánh giá. Là người đầu tiên nhé!
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map(r => (
                <div key={r.id} className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-ui" style={{ fontSize: 13, fontWeight: 700 }}>{r.name}</span>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} size={11} strokeWidth={0} fill={n <= r.stars ? 'var(--accent-500)' : 'var(--border-default)'} />
                      ))}
                    </div>
                  </div>
                  {r.chips?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {r.chips.map(c => (
                        <span key={c} className="font-ui px-2 py-0.5 rounded-full" style={{ fontSize: 10, background: 'var(--accent-100)', color: 'var(--accent-600)' }}>{c}</span>
                      ))}
                    </div>
                  )}
                  {r.text && <p className="font-ui" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{r.text}</p>}
                  <div className="font-ui mt-1.5" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{fmtDate(r.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
