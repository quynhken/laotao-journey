import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { ArrowLeft, Calendar } from 'lucide-react';
import type { Article } from '../store';

export function ArticleView({ article, onBack }: { article: Article; onBack: () => void }) {
  const editor = useCreateBlockNote({
    initialContent: Array.isArray(article.content) && (article.content as unknown[]).length > 0
      ? article.content as Parameters<typeof useCreateBlockNote>[0]['initialContent']
      : undefined,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Back bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button onClick={onBack} style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={16} strokeWidth={2} />
        </button>
        <span className="font-ui" style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Bài viết
        </span>
      </div>

      {/* Cover image */}
      {article.coverImage && (
        <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
          <img src={article.coverImage} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '20px 20px 0' }}>
        <div className="font-ui inline-flex items-center gap-1.5 mb-2" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          <Calendar size={11} strokeWidth={2} /> {article.date}
        </div>
        <h1 className="font-display" style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2, margin: 0 }}>
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="font-body" style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
            {article.excerpt}
          </p>
        )}
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '16px 0' }} />
      </div>

      {/* Content — read-only */}
      <div style={{ flex: 1, padding: '0 4px 24px' }}>
        <MantineProvider>
          <BlockNoteView
            editor={editor}
            editable={false}
            theme="light"
          />
        </MantineProvider>
      </div>
    </div>
  );
}
