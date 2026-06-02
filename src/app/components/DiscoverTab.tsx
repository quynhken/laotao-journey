import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { Navigation, Heart, X, Share2, ThumbsDown, MapPin, Star, Play } from 'lucide-react';
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
      react(top.id, 'like');
      onAddPoints(1, 'Thích');
    } else {
      onAction(top, action);
    }

    setStack((s) => s.slice(1));
  };

  const top = stack[0];

  return (
    <div className="flex flex-col h-full" style={{ padding: '16px 32px 0' }}>
      <div className="relative w-full flex-1 min-h-0" style={{ overflow: 'visible' }}>
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

      <div className="relative flex items-center justify-center gap-8 mt-6" style={{ zIndex: 20 }}>
        {/* Không thích */}
        <button onClick={() => { if (top) { react(top.id, 'dislike'); handleDone('skip'); } }}
          className="flex flex-col items-center gap-1.5 active:scale-95 transition">
          <div className="grid place-items-center rounded-full"
            style={{ width: 60, height: 60, border: '2px solid #F97316', background: '#fff', color: '#F97316', boxShadow: '0 6px 20px rgba(249,115,22,0.25), 0 2px 6px rgba(0,0,0,0.08)' }}>
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
            style={{ width: 60, height: 60, border: '1.5px solid var(--border-default)', background: '#fff', color: 'var(--text-secondary)', boxShadow: '0 6px 20px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)' }}>
            <Share2 size={22} strokeWidth={2} />
          </div>
          <span className="font-ui" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
            {top ? fmtNum(topReactions(top.id).share) || 'Chia sẻ' : 'Chia sẻ'}
          </span>
        </button>

        {/* Thích → +1 point, chuyển card */}
        <button onClick={() => { if (top) { react(top.id, 'like'); onAddPoints(1, 'Thích'); setStack(s => s.slice(1)); } }}
          className="flex flex-col items-center gap-1.5 active:scale-95 transition">
          <div className="grid place-items-center rounded-full"
            style={{ width: 60, height: 60, border: 'none', background: 'var(--accent-500)', color: '#fff', boxShadow: '0 8px 24px rgba(255,99,31,0.45), 0 2px 8px rgba(255,99,31,0.25)' }}>
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
      <AnimatePresence>
        {detail && (
          <DetailSheet
            sub={detail}
            onClose={() => setDetail(null)}
            onReview={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function QuoteText({ quote }: { quote: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = quote.length > 120;
  return (
    <div className="mb-3">
      <p className="font-body italic" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45,
        display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: expanded ? 'unset' : 3, overflow: 'hidden' } as any}>
        {quote}
      </p>
      {isLong && !expanded && (
        <button onPointerDown={e => { e.stopPropagation(); setExpanded(true); }}
          className="font-ui mt-0.5" style={{ fontSize: 12, color: 'var(--accent-500)', fontWeight: 600 }}>
          Xem thêm
        </button>
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
  const didDrag = useRef(false);

  const img = (sub.images?.[0] || sub.image) ?? '';

  return (
    <motion.div
      drag={interactive ? 'x' : false}
      dragElastic={0.08}
      dragMomentum={false}
      dragSnapToOrigin={false}
      style={{
        x, y, rotate,
        position: 'absolute', inset: 0,
        zIndex: 10 - depth,
        background: 'var(--bg-base)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        cursor: interactive ? 'grab' : 'default',
        display: 'flex', flexDirection: 'column',
        touchAction: 'none',
        transformOrigin: 'bottom center',
        translateY: ([0, 14, 26] as number[])[depth] ?? 36,
        boxShadow: depth === 0
          ? '0 8px 32px rgba(0,0,0,0.14)'
          : depth === 1 ? '0 4px 16px rgba(0,0,0,0.08)'
          : '0 2px 8px rgba(0,0,0,0.05)',
      }}
      onClick={() => { if (interactive && !didDrag.current) onTap?.(); didDrag.current = false; }}
      onDragStart={() => { didDrag.current = true; }}
      onDragEnd={(_, info) => {
        const ox = info.offset.x, oy = info.offset.y;
        const vx = info.velocity.x, vy = info.velocity.y;
        const swipedRight = ox > 60 || vx > 400;
        const swipedLeft  = ox < -60 || vx < -400;
        if (swipedRight) { didDrag.current = false; onDone('flag'); }
        else if (swipedLeft) { didDrag.current = false; onDone('skip'); }
      }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{
        opacity: ([1, 0.7, 0.45] as number[])[depth] ?? 0,
        scale: ([1, 0.93, 0.86] as number[])[depth] ?? 0.8,
      }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Swipe overlays — on top of everything */}
      <motion.div className="absolute inset-0 z-20 grid place-items-center font-display rounded-[inherit]"
        style={{ background: 'rgba(255,99,31,0.88)', opacity: flagOpacity, color: '#fff', fontSize: 32, fontWeight: 800, pointerEvents: 'none' }}>
        ❤️ THÍCH
      </motion.div>
      <motion.div className="absolute inset-0 z-20 grid place-items-center font-display rounded-[inherit]"
        style={{ background: 'rgba(60,60,60,0.88)', opacity: skipOpacity, color: '#fff', fontSize: 32, fontWeight: 800, pointerEvents: 'none' }}>
        👎 KHÔNG THÍCH
      </motion.div>

      {/* Card layout — address card style */}
      <div className="flex flex-col h-full px-5 pt-5 pb-1">
        {/* Header label — province · date on same line */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={13} strokeWidth={2.5} style={{ color: 'var(--accent-500)', flexShrink: 0 }} />
          <span className="font-ui" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-tertiary)' }}>
            {sub.province.toUpperCase()}
            {sub.date !== '—' && ` · ${sub.date}`}
          </span>
        </div>

        {/* Location name */}
        <h2 className="font-display mb-2" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15, color: 'var(--text-primary)' }}>
          {sub.name}
        </h2>

        {/* Quote below title — max 3 lines + Xem thêm */}
        {sub.quote && sub.quote !== '"..."' && (
          <QuoteText quote={sub.quote.replace(/"/g, '')} />
        )}

        {/* Image — fill remaining height */}
        {img && (
          <div className="mt-auto flex-1 min-h-0 -mx-4 mb-1" style={{ pointerEvents: 'none', marginTop: 8 }}>
            <div className="h-full overflow-hidden" style={{ borderRadius: 12 }}>
              <ImageWithFallback src={img} alt={sub.name} className="w-full h-full object-cover" draggable={false} />
            </div>
          </div>
        )}
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
            Đăng Review +20 gem
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
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  const [chips, setChips] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const chipOptions = ['Đẹp vãi', 'Đồ ăn ngon', 'Đường khó đi', 'Nhất định quay lại', 'Lạnh lắm', 'Đông khách'];
  const img = (sub.images?.[0] || sub.image) ?? '';

  useEffect(() => {
    fetchSubReviews(sub.id).then(r => { setReviews(r); setLoading(false); });
  }, [sub.id]);

  const fmtDate = (iso: string) => {
    try { const d = new Date(iso); return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; } catch { return ''; }
  };

  const handleSubmitReview = async () => {
    setSubmitting(true);
    const name = getVisitorName();
    const result = await submitSubReview(sub.id, { name, stars, text, chips: Array.from(chips) });
    if (result) {
      setReviews(prev => [result, ...prev]);
      setShowReviewForm(false);
      setText(''); setChips(new Set());
    }
    setSubmitting(false);
    onReview();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-center"
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
    >
      <div
        className="relative w-full max-w-[480px] h-full overflow-y-auto no-scrollbar flex flex-col"
        style={{ background: 'var(--bg-base)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10" style={{ background: 'var(--bg-base)' }}>
          <div className="flex items-center gap-3 px-4 pt-12 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex-1 min-w-0">
              <div className="font-ui" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                {sub.province}{sub.date !== '—' ? ` · ${sub.date}` : ''}
              </div>
              <div className="font-display truncate" style={{ fontSize: 16, fontWeight: 700 }}>{sub.name}</div>
            </div>
            <button onClick={onClose} className="grid place-items-center rounded-full shrink-0"
              style={{ width: 32, height: 32, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>

      {/* Scrollable content */}
        {/* Image */}
        {img && (
          <div className="relative" style={{ aspectRatio: '4/3' }}>
            <ImageWithFallback src={img} alt={sub.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Info */}
        <div className="px-5 pt-4 pb-2">
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.15 }}>{sub.name}</h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {sub.km > 0 && <span className="font-ui px-2.5 py-1 rounded-full" style={{ fontSize: 11, background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>km {sub.km}</span>}
            {sub.rating && sub.rating > 0 && (
              <span className="font-ui px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ fontSize: 11, background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                <Star size={10} strokeWidth={0} fill="var(--accent-500)" /> {sub.rating.toFixed(1)}
              </span>
            )}
          </div>
          {sub.quote && sub.quote !== '"..."' && (
            <p className="font-body italic mt-3" style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {sub.quote}
            </p>
          )}
        </div>

        {/* Video link box */}
        {sub.videoUrl && (
          <div className="px-5 pb-3">
            <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 transition active:scale-[0.98]"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, textDecoration: 'none' }}>
              {(() => {
                const ytId = sub.videoUrl.match(/(?:v=|youtu\.be\/|shorts\/)([^&?/\s]+)/)?.[1];
                return ytId ? (
                  <div className="overflow-hidden shrink-0" style={{ width: 96, height: 64, borderRadius: 10 }}>
                    <img src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="grid place-items-center shrink-0" style={{ width: 64, height: 64, borderRadius: 10, background: 'var(--bg-elevated)', color: 'var(--accent-500)' }}>
                    <Play size={24} fill="currentColor" strokeWidth={0} />
                  </div>
                );
              })()}
              <div className="flex-1 min-w-0">
                <div className="font-ui" style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em' }}>XEM VIDEO</div>
                <div className="font-ui mt-0.5 line-clamp-3" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {sub.videoTitle || 'Xem video hành trình'}
                </div>
              </div>
              <div className="grid place-items-center rounded-full shrink-0"
                style={{ width: 32, height: 32, background: '#FF0000', color: '#fff' }}>
                <Play size={12} fill="#fff" strokeWidth={0} />
              </div>
            </a>
          </div>
        )}

        {/* Review form (inline toggle) */}
        <div className="px-5 pb-4">
          {!showReviewForm ? (
            <button onClick={() => setShowReviewForm(true)}
              className="w-full h-11 rounded-full font-ui"
              style={{ background: 'var(--accent-500)', color: '#fff', fontWeight: 700, fontSize: 14 }}>
              ✍️ Viết đánh giá +20 gem
            </button>
          ) : (
            <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="font-ui" style={{ fontSize: 13, fontWeight: 700 }}>Đánh giá của bạn</div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setStars(n)} style={{ fontSize: 28, color: n <= stars ? 'var(--accent-500)' : 'var(--border-default)' }}>★</button>
                ))}
              </div>
              <textarea value={text} onChange={e => setText(e.target.value.slice(0, 150))}
                placeholder="Bạn thấy chỗ này thế nào?"
                rows={3} className="w-full p-3 outline-none resize-none font-ui"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 12, fontSize: 14 }} />
              <div className="flex flex-wrap gap-1.5">
                {chipOptions.map(c => {
                  const on = chips.has(c);
                  return (
                    <button key={c} onClick={() => { const s = new Set(chips); on ? s.delete(c) : s.add(c); setChips(s); }}
                      className="px-3 py-1.5 rounded-full font-ui"
                      style={{ fontSize: 12, fontWeight: 600, background: on ? 'var(--accent-100)' : 'var(--bg-base)', border: `1px solid ${on ? 'var(--accent-500)' : 'var(--border-default)'}`, color: on ? 'var(--accent-600)' : 'var(--text-secondary)' }}>
                      {c}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button onClick={handleSubmitReview} disabled={submitting}
                  className="flex-1 h-10 rounded-full font-ui"
                  style={{ background: 'var(--accent-500)', color: '#fff', fontWeight: 700, opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
                <button onClick={() => setShowReviewForm(false)} className="h-10 px-4 rounded-full font-ui"
                  style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                  Huỷ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reviews list */}
        <div className="px-5 pb-8">
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
                      {[1,2,3,4,5].map(n => <Star key={n} size={11} strokeWidth={0} fill={n <= r.stars ? 'var(--accent-500)' : 'var(--border-default)'} />)}
                    </div>
                  </div>
                  {r.chips?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {r.chips.map(c => <span key={c} className="font-ui px-2 py-0.5 rounded-full" style={{ fontSize: 10, background: 'var(--accent-100)', color: 'var(--accent-600)' }}>{c}</span>)}
                    </div>
                  )}
                  {r.text && <p className="font-ui" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{r.text}</p>}
                  <div className="font-ui mt-1.5" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{fmtDate(r.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
