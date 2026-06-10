import { useState } from 'react';
import { MapPin, Play, FileText, Calendar } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useSettings } from '../store';
import type { Article } from '../store';
import { ArticleView } from './ArticleView';

type FeedMode = 'video' | 'article';

export function FeedTab() {
  const [mode, setMode] = useState<FeedMode>('video');
  const [activeCatId, setActiveCatId] = useState<number | 'all'>('all');
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const settings = useSettings();
  const videos = settings.videos;
  const cats = settings.videoCategories ?? [];
  const articles = (settings.articles ?? []).filter(a => a.published);

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

  // Article detail view
  if (openArticle) {
    return <ArticleView article={openArticle} onBack={() => setOpenArticle(null)} />;
  }

  return (
    <div className="py-4 space-y-4">
      <div className="px-4">
        <div className="font-ui" style={{ fontSize: 11, letterSpacing: '0.06em', color: 'var(--text-tertiary)' }}>
          {mode === 'video' ? `BẢNG TIN · ${label}` : `BÀI VIẾT · ${articles.length} BÀI`}
        </div>
        <h2 className="font-display font-bold mt-0.5" style={{ fontSize: 20 }}>
          {mode === 'video' ? 'Lão Tào lên sóng' : 'Nhật ký hành trình'}
        </h2>
      </div>

      {/* Mode + Category filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-1">
        {/* Mode toggle */}
        <button
          onClick={() => setMode('video')}
          className="shrink-0 px-3 h-8 rounded-full font-ui transition flex items-center gap-1.5"
          style={{
            background: mode === 'video' ? 'var(--accent-100)' : 'var(--bg-surface)',
            border: `1px solid ${mode === 'video' ? 'var(--accent-500)' : 'var(--border-subtle)'}`,
            color: mode === 'video' ? 'var(--accent-600)' : 'var(--text-secondary)',
            fontSize: 12, fontWeight: 600,
          }}>
          <Play size={10} strokeWidth={2.5} /> Video
        </button>
        <button
          onClick={() => setMode('article')}
          className="shrink-0 px-3 h-8 rounded-full font-ui transition flex items-center gap-1.5"
          style={{
            background: mode === 'article' ? 'var(--accent-100)' : 'var(--bg-surface)',
            border: `1px solid ${mode === 'article' ? 'var(--accent-500)' : 'var(--border-subtle)'}`,
            color: mode === 'article' ? 'var(--accent-600)' : 'var(--text-secondary)',
            fontSize: 12, fontWeight: 600,
          }}>
          <FileText size={10} strokeWidth={2} /> Bài viết
        </button>

        {/* Video category chips — only in video mode */}
        {mode === 'video' && cats.map(cat => {
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

      {/* ── VIDEO LIST ── */}
      {mode === 'video' && (
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
              <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'block',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
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
                  <div className="mt-3 inline-flex items-center gap-1.5 px-4 h-9 rounded-full font-ui"
                    style={{ background: '#FF0000', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                    <Play size={11} fill="#fff" strokeWidth={0} /> Xem Video
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* ── ARTICLE LIST ── */}
      {mode === 'article' && (
        <div className="px-4 space-y-3">
          {articles.length === 0 && (
            <div className="font-ui py-10 text-center" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>
              Chưa có bài viết nào. Admin có thể thêm bài trong trang Quản lý.
            </div>
          )}
          {[...articles].sort((a, b) => b.id - a.id).map(article => (
            <button
              key={article.id}
              onClick={() => setOpenArticle(article)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                cursor: 'pointer', padding: 0,
              }}>
              {article.coverImage && (
                <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                  <img src={article.coverImage} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '14px 16px' }}>
                <div className="font-ui inline-flex items-center gap-1 mb-1.5"
                  style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <Calendar size={10} strokeWidth={2} /> {article.date}
                </div>
                <h3 className="font-display" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25, margin: 0 }}>
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="font-body" style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                    {article.excerpt}
                  </p>
                )}
                <div className="mt-3 inline-flex items-center gap-1.5 font-ui"
                  style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-600)' }}>
                  <FileText size={11} strokeWidth={2} /> Đọc bài viết →
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
