import { useEffect, useMemo, useState } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { ArrowLeft, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import type { Article } from '../store';

const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
};

export function ArticleEditor({
  article,
  onSave,
  onDelete,
  onBack,
}: {
  article: Article | null;
  onSave: (a: Article) => void;
  onDelete?: (id: number) => void;
  onBack: () => void;
}) {
  const isNew = !article;
  const [title, setTitle] = useState(article?.title ?? '');
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? '');
  const [published, setPublished] = useState(article?.published ?? false);
  const [saving, setSaving] = useState(false);

  const initialContent = useMemo(() => {
    if (article?.content && Array.isArray(article.content) && (article.content as unknown[]).length > 0) {
      return article.content as Parameters<typeof useCreateBlockNote>[0]['initialContent'];
    }
    return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);

  const editor = useCreateBlockNote({ initialContent });

  useEffect(() => {
    setTitle(article?.title ?? '');
    setExcerpt(article?.excerpt ?? '');
    setPublished(article?.published ?? false);
  }, [article?.id]);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const blocks = editor.document;
    const saved: Article = {
      id: article?.id ?? Date.now(),
      title: title.trim(),
      slug: article?.slug ?? title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      excerpt: excerpt.trim(),
      content: blocks,
      date: article?.date ?? today(),
      published,
    };
    onSave(saved);
    setSaving(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Toolbar */}
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
        <span className="font-ui" style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>
          {isNew ? 'Bài viết mới' : 'Chỉnh sửa bài viết'}
        </span>

        {/* Published toggle */}
        <button
          onClick={() => setPublished(p => !p)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
            border: `1px solid ${published ? 'var(--accent-500)' : 'var(--border-subtle)'}`,
            background: published ? 'var(--accent-100)' : 'var(--bg-surface)',
            color: published ? 'var(--accent-600)' : 'var(--text-secondary)',
            fontSize: 12, fontWeight: 600,
          }}>
          {published ? <Eye size={14} strokeWidth={2} /> : <EyeOff size={14} strokeWidth={2} />}
          {published ? 'Hiện' : 'Ẩn'}
        </button>

        {!isNew && onDelete && (
          <button
            onClick={() => { if (confirm('Xoá bài viết này?')) onDelete(article!.id); }}
            style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Trash2 size={14} strokeWidth={2} />
          </button>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
            background: 'var(--accent-500)', color: '#fff',
            fontSize: 12, fontWeight: 700, border: 'none',
            opacity: saving || !title.trim() ? 0.6 : 1,
          }}>
          <Save size={14} strokeWidth={2.5} />
          {saving ? 'Đang lưu…' : 'Lưu'}
        </button>
      </div>

      {/* Meta fields */}
      <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Tiêu đề bài viết…"
          className="font-display"
          style={{
            width: '100%', border: 'none', outline: 'none',
            fontSize: 24, fontWeight: 800, color: 'var(--text-primary)',
            background: 'transparent', padding: 0,
          }}
        />
        <input
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="Tóm tắt ngắn (hiện trên danh sách)…"
          className="font-body"
          style={{
            width: '100%', border: 'none', outline: 'none',
            fontSize: 13, color: 'var(--text-secondary)',
            background: 'transparent', padding: 0,
          }}
        />
        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
      </div>

      {/* BlockNote Editor */}
      <div style={{ flex: 1, padding: '0 4px' }}>
        <BlockNoteView
          editor={editor}
          theme="light"
          style={{ minHeight: 400 }}
        />
      </div>
    </div>
  );
}
