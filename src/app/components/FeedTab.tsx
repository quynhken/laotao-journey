import { useState } from 'react';
import { MapPin, Play } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSettings } from '../store';

export function FeedTab() {
  const [activeCatId, setActiveCatId] = useState<number | 'all'>('all');
  const settings = useSettings();
  const videos = settings.videos;
  const cats = settings.videoCategories ?? [];

  // date stored as "DD.MM" — sort newest first by converting to MM*100+DD
  const dateVal = (d: string) => { const [dd, mm] = (d ?? '').split('.'); return (parseInt(mm) || 0) * 100 + (parseInt(dd) || 0); };
  const filtered = (activeCatId === 'all'
    ? videos
    : videos.filter(v => v.categoryId === activeCatId)
  ).slice().sort((a, b) => dateVal(b.date) - dateVal(a.date));

  const count = filtered.length;
  const label = activeCatId === 'all'
    ? `${count} VIDEO`
    : `${count} VIDEO · ${cats.find(c => c.id === activeCatId)?.name ?? ''}`;

  return (
    <div className="py-4 space-y-4">
      <div className="px-4">
        <div className="font-ui" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
          BẢNG TIN · {label}
        </div>
        <h2 className="font-disp font-boldlay mt-0.5 font-bold" style={{ fontSize: 20 }}>Lão Tào lên sóng</h2>
      </div>

      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-1">
        <button
          onClick={() => setActiveCatId('all')}
          className="shrink-0 px-3 h-8 rounded-full font-ui transition"
          style={{
            background: activeCatId === 'all' ? 'var(--accent-100)' : 'var(--bg-surface)',
            border: `1px solid ${activeCatId === 'all' ? 'var(--accent-500)' : 'var(--border-subtle)'}`,
            color: activeCatId === 'all' ? 'var(--accent-600)' : 'var(--text-secondary)',
            fontSize: 12, fontWeight: 600,
          }}>
          Tất cả
        </button>
        {cats.map(cat => {
          const on = activeCatId === cat.id;
          return (
            <button key={cat.id} onClick={() => setActiveCatId(on ? 'all' : cat.id)}
              className="shrink-0 px-3 h-8 rounded-full font-ui transition"
              style={{
                background: on ? cat.color : 'var(--bg-surface)',
                border: `1px solid ${on ? cat.color : 'var(--border-subtle)'}`,
                color: on ? '#fff' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 600,
              }}>
              {cat.name}
            </button>
          );
        })}
      </div>

      <div className="px-4 space-y-4">
        {filtered.length === 0 && (
          <div className="font-ui py-10 text-center" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
            {videos.length === 0
              ? 'Chưa có video nào. Thêm video trong trang Admin → Videos.'
              : 'Không có video nào trong danh mục này.'}
          </div>
        )}
        {filtered.map((v) => {
          const cat = cats.find(c => c.id === v.categoryId);
          return (
            <article key={v.id} style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}>
              <div className="relative aspect-video">
                <ImageWithFallback src={v.image} alt={v.title} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-1/2"
                  style={{ background: 'linear-gradient(to top, rgba(17,17,17,0.55), transparent)' }} />
                <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md font-ui"
                    style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, fontWeight: 600 }}>
                    <Play size={9} fill="#fff" strokeWidth={0} /> Video
                  </div>
                  {cat && (
                    <div className="px-2 py-1 rounded-md font-ui"
                      style={{ background: cat.color, color: '#fff', fontSize: 11, fontWeight: 700 }}>
                      {cat.name}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="font-ui inline-flex items-center gap-1 mb-1"
                  style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
                  <MapPin size={11} strokeWidth={2} />
                  {v.place} · {v.date}
                </div>
                <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>{v.title}</h3>
                <a href={v.url} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 h-9 rounded-full font-ui"
                  style={{ background: '#FF0000', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                  <Play size={11} fill="#fff" strokeWidth={0} /> Xem Video
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
