import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, RotateCcw, Download, Upload, Plus, Trash2, Lock, LogOut, ChevronRight, ChevronDown, CalendarDays, GripVertical, ChevronUp, X, Play, ImageIcon } from 'lucide-react';
import {
  useSettings,
  setSettings,
  resetSettings,
  DEFAULT_SETTINGS,
  type AppSettings,
  type VideoItem,
  verifyPassword,
  verifyAdminLogin,
  setPassword,
  setAdminCredentials,
  fetchVisitors,
  deleteVisitor,
  type Visitor,
  isAuthed,
  setAuthed,
  pullSettings,
  pushSettings,
  patchProvince,
  patchSubLocation,
  deleteSubLocation,
  patchVideo,
  createCategory,
  patchCategory,
  deleteCategory,
  patchTrip,
  patchHeader,
  setViPointBalance,
  uploadImage,
  setAppCredentials,
  useSyncStatus,
  type VideoCategory,
  fetchOnboardingPhotos,
  uploadOnboardingPhoto,
  deleteOnboardingPhoto,
  type OnboardingPhoto,
} from '../store';
import type { Badge, Province, SubLocation } from './data';

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23F3F4F6'/%3E%3Crect x='160' y='100' width='80' height='60' rx='6' fill='%23D1D5DB'/%3E%3Ccircle cx='230' cy='115' r='8' fill='%23E5E7EB'/%3E%3Cpolyline points='160,160 190,130 215,150 235,135 280,160' fill='%23D1D5DB' stroke='none'/%3E%3C/svg%3E";

// ── Base44 tokens ───────────────────────────────────────────────────────────
const B = {
  canvas: '#FAF9F7',
  canvasPure: '#FFFFFF',
  ink: '#232529',
  inkMuted: '#727272',
  inkSubtle: '#B0B0B0',
  orange: '#FF631F',
  lime: '#EBFFB1',
  limeHover: '#D6F090',
  amber: '#FF983B',
  danger: '#FF854F',
  hairline: 'rgba(35,37,41,0.08)',
  shadowNav: '0 2px 16px rgba(35,37,41,0.08)',
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 20,
  radiusXl: 24,
  radiusPill: 100,
};

type Section = 'header' | 'trip' | 'badges' | 'provinces' | 'sublocations' | 'videos' | 'categories' | 'visitors' | 'onboarding-photos' | 'security';

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'header', label: 'Header' },
  { key: 'trip', label: 'Hành Trình' },
  { key: 'badges', label: 'Huy Hiệu' },
  { key: 'provinces', label: 'Khu Vực' },
  { key: 'sublocations', label: 'Địa Điểm' },
  { key: 'videos', label: 'Nội Dung' },
  { key: 'categories', label: 'Danh Mục' },
  { key: 'visitors', label: 'Người Dùng' },
  { key: 'onboarding-photos', label: 'Ảnh Onboarding' },
  { key: 'security', label: 'Bảo Mật' },
];

export function AdminPage() {
  const [authed, setAuthedState] = useState(isAuthed());
  if (!authed) return <LoginGate onSuccess={() => setAuthedState(true)} />;
  return <AdminPanel onLogout={() => { setAuthed(false); setAuthedState(false); }} />;
}

function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const ok = await verifyAdminLogin(user, pw);
    setBusy(false);
    if (ok) { setAuthed(true, pw); onSuccess(); }
    else setErr('Sai tên đăng nhập hoặc mật khẩu.');
  };
  return (
    <div className="min-h-dvh w-full grid place-items-center px-5"
      style={{ background: `linear-gradient(180deg, #B4D8E8 0%, #FAE8D0 50%, #FAEABF 100%)`, color: B.ink }}>
      <form onSubmit={submit} className="w-full max-w-sm p-8"
        style={{ background: B.canvasPure, borderRadius: B.radiusXl }}>
        <div className="inline-flex items-center gap-2 mb-5" style={{ color: B.orange }}>
          <Lock size={16} />
          <span style={{ fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Admin</span>
        </div>
        <div className="font-display mb-4" style={{ fontSize: 32, lineHeight: 1.1, color: B.ink }}>
          Đăng nhập
        </div>
        <input
          autoFocus
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Tên đăng nhập"
          autoCapitalize="none" autoCorrect="off"
          className="w-full h-11 px-4 font-ui outline-none mb-3"
          style={{ background: B.canvas, border: `1px solid ${B.hairline}`, borderRadius: B.radiusMd, fontSize: 14, color: B.ink }}
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Mật khẩu"
          className="w-full h-11 px-4 font-ui outline-none mb-3"
          style={{ background: B.canvas, border: `1px solid ${B.hairline}`, borderRadius: B.radiusMd, fontSize: 14, color: B.ink }}
        />
        {err && <div className="mb-3" style={{ fontSize: 13, color: B.orange }}>{err}</div>}
        <button type="submit" disabled={busy || !user || !pw}
          className="w-full h-11 font-ui transition"
          style={{ background: B.ink, color: B.canvasPure, borderRadius: B.radiusPill, fontSize: 14, opacity: busy ? 0.6 : 1 }}>
          {busy ? '...' : 'Vào'}
        </button>
        <div className="mt-4" style={{ fontSize: 12, color: B.inkMuted }}>
          Đổi mật khẩu trong tab Bảo Mật sau khi đăng nhập.
        </div>
      </form>
    </div>
  );
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const settings = useSettings();
  const sync = useSyncStatus();
  const [section, setSection] = useState<Section>('header');
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pulledOnce, setPulledOnce] = useState(false);

  useEffect(() => {
    (async () => {
      await pullSettings();
      setPulledOnce(true);
    })();
  }, []);
  // When upstream settings change (after pull), reset draft if user hasn't edited.
  useEffect(() => {
    if (!pulledOnce) return;
    setDraft((d) => (JSON.stringify(d) === JSON.stringify(settings) ? d : settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pulledOnce]);

  // onboardingPhotos are managed directly via state (not draft) — always take live value
  const draftWithLivePhotos = { ...draft, onboardingPhotos: settings.onboardingPhotos ?? [] };
  const dirty = JSON.stringify(draftWithLivePhotos) !== JSON.stringify(settings);

  const save = async () => {
    setSettings(draftWithLivePhotos);
    await pushSettings(draftWithLivePhotos);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 1800);
  };
  const discard = () => setDraft({ ...settings, onboardingPhotos: settings.onboardingPhotos ?? [] });
  const reset = () => {
    if (!confirm('Khôi phục về mặc định? Tất cả thay đổi sẽ mất.')) return;
    resetSettings();
    setDraft(DEFAULT_SETTINGS);
  };

  return (
    <div className="min-h-dvh w-full" style={{ background: B.canvas, color: B.ink }}>
      <div className="sticky top-0 z-30 px-5 pt-4">
        <header
          className="mx-auto flex items-center justify-between px-3 h-14"
          style={{
            background: B.canvasPure, borderRadius: B.radiusPill, boxShadow: B.shadowNav,
            maxWidth: 1240,
          }}
        >
          <div className="flex items-center gap-2 pl-1">
            <button
              onClick={() => { window.location.href = '/'; }}
              className="w-10 h-10 grid place-items-center"
              style={{ background: B.canvas, borderRadius: B.radiusPill }}
              title="Về trang chính"
            >
              <ArrowLeft size={16} color={B.ink} />
            </button>
            <div className="flex items-center gap-2 pl-1">
              <span className="w-7 h-7 grid place-items-center" style={{ background: B.orange, borderRadius: 9999 }}>
                <Lock size={13} color={B.canvasPure} />
              </span>
              <div style={{ fontSize: 15, fontWeight: 600, color: B.ink, letterSpacing: '-0.01em' }}>
                Sổ Tay Admin
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pr-1">
            {/* Sync status — ẩn text trên mobile nhỏ */}
            <span className="hidden sm:inline" style={{ fontSize: 12, color: sync.status === 'error' ? B.orange : B.inkMuted }}>
              {sync.status === 'pulling' && '⟳ đang tải...'}
              {sync.status === 'pushing' && '⟳ đang đẩy...'}
              {sync.status === 'ok' && (savedAt ? '✓ đã lưu' : '✓ sync')}
              {sync.status === 'error' && '⚠ lỗi'}
            </span>
            {/* Pull — icon only on mobile */}
            <button onClick={() => pullSettings()}
              className="h-9 px-2 sm:px-3 inline-flex items-center gap-1"
              style={{ background: B.canvas, color: B.ink, borderRadius: B.radiusPill, fontSize: 13 }}>
              <RotateCcw size={13} /><span className="hidden sm:inline">Pull</span>
            </button>
            <button onClick={onLogout}
              className="h-9 px-2 sm:px-3 inline-flex items-center gap-1"
              style={{ background: B.canvas, color: B.ink, borderRadius: B.radiusPill, fontSize: 13 }}>
              <LogOut size={13} /><span className="hidden sm:inline">Thoát</span>
            </button>
            {dirty && (
              <button onClick={discard}
                className="h-9 px-2 sm:px-3 inline-flex items-center"
                style={{ background: B.canvas, color: B.ink, borderRadius: B.radiusPill, fontSize: 13 }}>
                <span className="hidden sm:inline">Huỷ</span><span className="sm:hidden">✕</span>
              </button>
            )}
            <button
              onClick={save} disabled={!dirty}
              className="h-9 px-3 sm:px-5 inline-flex items-center gap-1.5"
              style={{
                background: dirty ? B.ink : B.canvas,
                color: dirty ? B.canvasPure : B.inkSubtle,
                borderRadius: B.radiusPill, fontSize: 13,
                cursor: dirty ? 'pointer' : 'not-allowed',
              }}
            >
              <Save size={13} /><span className="hidden sm:inline">Lưu thay đổi</span><span className="sm:hidden">Lưu</span>
            </button>
          </div>
        </header>
      </div>

      <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row px-3 md:px-5 pt-4 md:pt-6 pb-10 gap-4 md:gap-6">
        {/* Sidebar — vertical on md+, horizontal scroll on mobile */}
        <aside className="w-full md:w-52 md:shrink-0 md:self-start md:sticky" style={{ top: 88 }}>
          <nav className="flex md:flex-col gap-1 p-2 overflow-x-auto no-scrollbar"
            style={{ background: B.canvasPure, borderRadius: B.radiusLg }}>
            {SECTIONS.map((s) => {
              const active = section === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setSection(s.key)}
                  className="shrink-0 text-left px-4 h-10"
                  style={{
                    background: active ? B.ink : 'transparent',
                    color: active ? B.canvasPure : B.inkMuted,
                    borderRadius: B.radiusPill,
                    fontSize: 14,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 overflow-x-hidden">
          {section === 'header' && <HeaderSection draft={draft} setDraft={setDraft} />}
          {section === 'trip' && <TripSection draft={draft} setDraft={setDraft} />}
          {section === 'badges' && <BadgesSection draft={draft} setDraft={setDraft} />}
          {section === 'provinces' && <ProvincesSection draft={draft} setDraft={setDraft} />}
          {section === 'sublocations' && <SubLocationsSection draft={draft} setDraft={setDraft} />}
          {section === 'videos' && <VideosSection draft={draft} setDraft={setDraft} />}
          {section === 'categories' && <CategoriesSection draft={draft} setDraft={setDraft} />}
          {section === 'visitors' && <VisitorsSection />}
          {section === 'onboarding-photos' && <OnboardingPhotosSection />}
          {section === 'security' && <SecuritySection />}
        </main>
      </div>
    </div>
  );
}

// ── Reusable inputs ─────────────────────────────────────────────────────────
function PillBtn({ children, icon, onClick }: { children: React.ReactNode; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-9 px-3 inline-flex items-center gap-1"
      style={{ background: B.canvas, color: B.ink, borderRadius: B.radiusPill, fontSize: 13 }}
    >
      {icon}{children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <div className="mb-1.5" style={{ fontSize: 12, color: B.inkMuted, letterSpacing: '0.02em' }}>
        {label}
      </div>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  background: B.canvas,
  border: `1px solid ${B.hairline}`,
  borderRadius: B.radiusMd,
  color: B.ink,
};

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full h-10 px-4 outline-none" style={{ ...inputStyle, fontSize: 14, ...(props.style || {}) }} />;
}
function NumInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" {...props} className="w-full h-10 px-4 outline-none" style={{ ...inputStyle, fontSize: 14, ...(props.style || {}) }} />;
}
function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full px-4 py-2.5 outline-none" style={{ ...inputStyle, fontSize: 14, minHeight: 72, ...(props.style || {}) }} />;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8 mb-4" style={{ background: B.canvasPure, borderRadius: B.radiusXl }}>
      {children}
    </div>
  );
}
function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display" style={{ fontSize: 40, lineHeight: 1.1, color: B.ink, letterSpacing: '-0.01em' }}>{children}</h2>
      {hint && <div className="mt-2" style={{ fontSize: 14, color: B.inkMuted }}>{hint}</div>}
    </div>
  );
}

// ── Sections ────────────────────────────────────────────────────────────────
type SP = { draft: AppSettings; setDraft: React.Dispatch<React.SetStateAction<AppSettings>> };

function HeaderSection({ draft, setDraft }: SP) {
  const h = draft.header;
  const setH = (patch: Partial<typeof h>) => {
    setDraft({ ...draft, header: { ...h, ...patch } });
  };
  const setHAndSave = (patch: Partial<typeof h>) => {
    setH(patch);
    patchHeader(patch);
  };
  const updateName = (i: number, v: string) => {
    const next = [...h.typewriterNames];
    next[i] = v;
    setH({ typewriterNames: next });
  };
  return (
    <>
      <SectionTitle hint="Cấu hình hiển thị trên header của app.">Header</SectionTitle>
      <Card>
        <Field label="Ảnh Avatar">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative rounded-full overflow-hidden shrink-0"
              style={{ width: 56, height: 56, background: 'var(--accent-100)', border: '2px solid var(--accent-300)' }}>
              {h.avatarText?.startsWith('data:') || h.avatarText?.startsWith('http')
                ? <img src={h.avatarText} alt="avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }} />
                : <div className="w-full h-full grid place-items-center font-ui" style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-600)' }}>{h.avatarText || 'LT'}</div>
              }
              <div className="absolute inset-0 grid place-items-center opacity-0 hover:opacity-100 transition-opacity rounded-full"
                style={{ background: 'rgba(35,37,41,0.5)' }}>
                <span style={{ fontSize: 18, color: '#fff' }}>↑</span>
              </div>
            </div>
            <div>
              <div className="font-ui" style={{ fontSize: 13, fontWeight: 600, color: B.ink }}>Tải lên ảnh</div>
              <div className="font-ui" style={{ fontSize: 11, color: B.inkMuted }}>PNG, JPG — hiển thị tròn trên header</div>
            </div>
            <input type="file" accept="image/*" className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  // Nén ảnh xuống max 200×200, JPEG 80% để tránh quá tải storage
                  const img = new window.Image();
                  img.onload = () => {
                    const MAX = 200;
                    let w = img.width, h = img.height;
                    if (w > h) { h = Math.round(MAX * h / w); w = MAX; }
                    else { w = Math.round(MAX * w / h); h = MAX; }
                    const canvas = document.createElement('canvas');
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
                    setHAndSave({ avatarText: canvas.toDataURL('image/jpeg', 0.8) });
                  };
                  img.src = ev.target?.result as string;
                };
                reader.readAsDataURL(file);
              }} />
          </label>
        </Field>
        <Field label="Đang ở (địa điểm hiện tại)">
          <TextInput value={h.currentStop}
            onChange={(e) => setH({ currentStop: e.target.value })}
            onBlur={(e) => patchHeader({ currentStop: e.target.value })} />
        </Field>
        <div className="font-ui mb-1" style={{ fontSize: 12, color: B.inkMuted, fontWeight: 600 }}>
          Các tên hiển thị (gõ luân phiên)
        </div>
        {h.typewriterNames.map((n, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <TextInput value={n} onChange={(e) => updateName(i, e.target.value)} />
            <button
              onClick={() => setH({ typewriterNames: h.typewriterNames.filter((_, j) => j !== i) })}
              className="h-9 w-9 rounded grid place-items-center"
              style={{ background: B.canvas, border: `1px solid ${B.hairline}` }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={() => setH({ typewriterNames: [...h.typewriterNames, ''] })}
          className="h-8 px-3 rounded font-ui inline-flex items-center gap-1"
          style={{ background: B.lime, color: B.ink, fontSize: 12, fontWeight: 700 }}
        >
          <Plus size={13} /> Thêm tên
        </button>
      </Card>
      <Card>
        <Field label="Gem — số dư ban đầu / hiện tại">
          <div className="flex gap-2 items-center">
            <NumInput
              value={draft.viPoint ?? 0}
              onChange={(e) => setDraft({ ...draft, viPoint: Number(e.target.value) })}
              onBlur={(e) => setViPointBalance(Number(e.target.value))}
            />
            <span className="font-ui shrink-0" style={{ fontSize: 12, color: B.inkMuted }}>
              điểm
            </span>
          </div>
          <div className="mt-1 font-ui" style={{ fontSize: 11, color: B.inkSubtle }}>
            Số điểm này tích lũy qua mini game (Quẹt Card, Quiz, Dự đoán). Thay đổi sẽ lưu ngay lên server.
          </div>
        </Field>
      </Card>
    </>
  );
}

function TripSection({ draft, setDraft }: SP) {
  const pct = draft.trip.totalKm > 0
    ? Math.round((draft.trip.currentKm / draft.trip.totalKm) * 100)
    : 0;

  const setTrip = (patch: Partial<typeof draft.trip>) =>
    setDraft({ ...draft, trip: { ...draft.trip, ...patch } });

  const saveTotalKm = (v: number) => patchTrip({ totalKm: v });
  const saveCurrentKm = (v: number) => patchTrip({ currentKm: v });

  return (
    <>
      <SectionTitle hint="Tổng quãng đường và km đã đi — ảnh hưởng trực tiếp tới thanh tiến độ trên bản đồ.">
        Hành Trình
      </SectionTitle>
      <Card>
        <Field label="Tổng số km (điểm đích)">
          <NumInput
            value={draft.trip.totalKm}
            onChange={(e) => setTrip({ totalKm: Number(e.target.value) })}
            onBlur={(e) => saveTotalKm(Number(e.target.value))}
          />
        </Field>
        <Field label="Đã đi (km hiện tại)">
          <NumInput
            value={draft.trip.currentKm}
            onChange={(e) => setTrip({ currentKm: Number(e.target.value) })}
            onBlur={(e) => saveCurrentKm(Number(e.target.value))}
          />
        </Field>

        {/* Live progress preview */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-ui" style={{ fontSize: 11, color: B.inkMuted }}>Tiến độ hành trình</span>
            <span className="font-ui" style={{ fontSize: 11, fontWeight: 700, color: B.orange }}>
              {draft.trip.currentKm.toLocaleString()} / {draft.trip.totalKm.toLocaleString()} km · {pct}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: B.hairline }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(pct, 100)}%`, background: 'linear-gradient(90deg,#FFBA80,#FF631F)' }} />
          </div>
        </div>
      </Card>
    </>
  );
}

function BadgesSection({ draft, setDraft }: SP) {
  const update = (i: number, patch: Partial<Badge>) => {
    const next = draft.badges.map((b, j) => (j === i ? { ...b, ...patch } : b));
    setDraft({ ...draft, badges: next });
  };
  const add = () => setDraft({ ...draft, badges: [...draft.badges, { icon: 'Star', name: '', desc: '', earned: false }] });
  const remove = (i: number) => setDraft({ ...draft, badges: draft.badges.filter((_, j) => j !== i) });
  return (
    <>
      <SectionTitle hint="Danh sách huy hiệu hiển thị trên hồ sơ.">Huy Hiệu</SectionTitle>
      {draft.badges.map((b, i) => (
        <Card key={i}>
          <div className="grid grid-cols-[1fr_1fr_2fr_auto_auto] gap-2 items-end">
            <Field label="Icon (lucide)"><TextInput value={b.icon} onChange={(e) => update(i, { icon: e.target.value })} /></Field>
            <Field label="Tên"><TextInput value={b.name} onChange={(e) => update(i, { name: e.target.value })} /></Field>
            <Field label="Mô tả"><TextInput value={b.desc} onChange={(e) => update(i, { desc: e.target.value })} /></Field>
            <div className="inline-flex flex-col items-center gap-1 mb-3">
              <div
                onClick={() => update(i, { earned: !b.earned })}
                className="relative cursor-pointer shrink-0"
                style={{ width: 44, height: 24, borderRadius: 12, background: b.earned ? B.ink : B.hairline, transition: 'background 200ms' }}
              >
                <div style={{ position: 'absolute', top: 2, borderRadius: '50%', width: 20, height: 20, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', left: b.earned ? 22 : 2, transition: 'left 200ms' }} />
              </div>
              <span className="font-ui" style={{ fontSize: 11, color: B.inkMuted }}>Đã đạt</span>
            </div>
            <button onClick={() => remove(i)} className="h-9 w-9 rounded grid place-items-center mb-3" style={{ background: B.canvas, border: `1px solid ${B.hairline}` }}>
              <Trash2 size={14} />
            </button>
          </div>
        </Card>
      ))}
      <button onClick={add} className="h-9 px-3 rounded font-ui inline-flex items-center gap-1" style={{ background: B.lime, color: B.ink, fontSize: 13, fontWeight: 700 }}>
        <Plus size={14} /> Thêm huy hiệu
      </button>
    </>
  );
}

function parseLocationLines(text: string): Array<{ name: string; lat: number; lng: number }> {
  return text.split('\n').flatMap(line => {
    const t = line.trim();
    if (!t) return [];
    // Google Maps URL — extract @lat,lng or q=lat,lng or ll=lat,lng
    const urlCoord = t.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/) ||
                     t.match(/[?&]q=(-?\d+\.?\d+),(-?\d+\.?\d+)/) ||
                     t.match(/ll=(-?\d+\.?\d+),(-?\d+\.?\d+)/);
    if (urlCoord) {
      // Try to extract place name from URL path
      const nm = t.match(/maps\/place\/([^/@]+)/);
      const name = nm ? decodeURIComponent(nm[1].replace(/\+/g, ' ')).split(',')[0].trim() : '';
      return [{ name, lat: parseFloat(urlCoord[1]), lng: parseFloat(urlCoord[2]) }];
    }
    // "Tên | lat, lng" or "Tên, lat, lng" (3+ comma-parts)
    const pipe = t.split('|').map(s => s.trim());
    if (pipe.length === 2) {
      const coords = pipe[1].split(',').map(s => parseFloat(s.trim()));
      if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1]))
        return [{ name: pipe[0], lat: coords[0], lng: coords[1] }];
    }
    // Plain "lat, lng"
    const plain = t.split(',').map(s => parseFloat(s.trim()));
    if (plain.length >= 2 && !isNaN(plain[0]) && !isNaN(plain[1]) && Math.abs(plain[0]) <= 90)
      return [{ name: '', lat: plain[0], lng: plain[1] }];
    return [];
  });
}

function ProvincesSection({ draft, setDraft }: SP) {
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [confirmed, setConfirmed] = useState<Set<number>>(new Set());
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [expandedLatLng, setExpandedLatLng] = useState<Set<number>>(new Set());
  const toggleLatLng = (id: number) => setExpandedLatLng(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const [bulkPid, setBulkPid] = useState<number | null>(null);
  const [bulkText, setBulkText] = useState('');
  const dragItemRef = useRef<number | null>(null);
  const toggleExpanded = (id: number) => setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const confirm_ = (id: number) => setConfirmed(prev => { const s = new Set(prev); s.add(id); return s; });
  const unconfirm = (id: number) => setConfirmed(prev => { const s = new Set(prev); s.delete(id); return s; });
  const update = (id: number, patch: Partial<Province>) => {
    setDraft({ ...draft, provinces: draft.provinces.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  };
  const updateAndSave = (id: number, patch: Partial<Province>) => {
    update(id, patch);
    patchProvince(id, patch);
  };
  const remove = (id: number) => {
    const prov = draft.provinces.find(p => p.id === id);
    if (prov?.protected) { alert('Khu vực này được bảo vệ và không thể xoá.'); return; }
    if (!confirm('Xoá khu vực này? Các địa điểm thuộc khu vực cũng sẽ bị xoá.')) return;
    setDraft({
      ...draft,
      provinces: draft.provinces.filter((p) => p.id !== id),
      subLocations: draft.subLocations.filter((s) => s.provinceId !== id),
    });
  };
  const add = () => {
    const nextId = draft.provinces.reduce((m, p) => Math.max(m, p.id), 0) + 1;
    const np: Province = {
      id: nextId, name: 'Tỉnh mới', lat: 16, lng: 107, region: 'central', episode: 1,
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400', status: 'locked',
    };
    setDraft({ ...draft, provinces: [...draft.provinces, np] });
  };
  const filtered = draft.provinces.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <SectionTitle hint="Bấm trạng thái để xoay vòng: Chưa đến → Đã ghé → Hoàn thành. Khu vực có 🔒 không thể xoá.">Khu Vực</SectionTitle>
      <div className="mb-3 flex gap-2">
        <TextInput placeholder="Tìm tỉnh..." value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={add} className="h-9 px-3 rounded font-ui inline-flex items-center gap-1 shrink-0"
          style={{ background: B.ink, color: B.canvasPure, fontSize: 12, fontWeight: 700 }}>
          <Plus size={14} /> Thêm tỉnh
        </button>
      </div>
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${B.hairline}` }}>
        <div className="grid gap-2 px-3 py-2 font-ui"
          style={{ gridTemplateColumns: '40px 1fr 110px', background: B.canvas, fontSize: 11, fontWeight: 700, color: B.inkMuted }}>
          <div>ID</div><div>Tên</div><div>Trạng thái</div>
        </div>
        {filtered.map((p) => {
          const subs = draft.subLocations.filter((s) => s.provinceId === p.id);
          const isOpen = expanded.has(p.id);
          return (
            <div key={p.id} style={{ borderTop: `1px solid ${B.hairline}` }}
              onMouseEnter={() => setHoveredId(p.id)} onMouseLeave={() => setHoveredId(null)}>
              {(() => {
                const isNew = p.id > 36;
                const isConfirmed = confirmed.has(p.id);
                const isEditing = isNew && !isConfirmed;
                const showHoverActions = isNew && isConfirmed && hoveredId === p.id;
                return (
                  <div className="grid gap-2 px-3 py-2 items-center"
                    style={{ gridTemplateColumns: isEditing ? '40px 48px 1fr 110px 64px 36px 36px' : showHoverActions ? '40px 48px 1fr 110px 64px 36px 36px' : '40px 48px 1fr 110px 64px' }}>
                    <button onClick={() => toggleExpanded(p.id)}
                      className="inline-flex items-center gap-0.5 font-ui"
                      style={{ fontSize: 12, color: B.inkMuted }}>
                      {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      {p.id}
                    </button>

                    {/* Avatar upload */}
                    <label title="Tải lên ảnh avatar" className="relative cursor-pointer shrink-0 rounded overflow-hidden"
                      style={{ width: 48, height: 48, background: B.canvas, border: `1px solid ${B.hairline}` }}>
                      {p.image
                        ? <img src={p.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }} />
                        : <img src={PLACEHOLDER_IMG} alt="" className="w-full h-full object-cover" />
                      }
                      <div className="absolute inset-0 grid place-items-center opacity-0 hover:opacity-100 transition-opacity"
                        style={{ background: 'rgba(35,37,41,0.55)' }}>
                        <span style={{ fontSize: 12, color: '#fff' }}>↑</span>
                      </div>
                      <input type="file" accept="image/*" className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            const img = new window.Image();
                            img.onload = () => {
                              const MAX = 400;
                              let w = img.width, h = img.height;
                              if (w > h) { h = Math.round(MAX * h / w); w = MAX; }
                              else { w = Math.round(MAX * w / h); h = MAX; }
                              const cv = document.createElement('canvas');
                              cv.width = w; cv.height = h;
                              cv.getContext('2d')!.drawImage(img, 0, 0, w, h);
                              updateAndSave(p.id, { image: cv.toDataURL('image/jpeg', 0.85) });
                            };
                            img.src = ev.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }} />
                    </label>

                    {isEditing
                      ? <TextInput value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} />
                      : <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-ui truncate" style={{ fontSize: 13, fontWeight: 700, color: B.ink }}>{p.name}</span>
                          {p.protected && <span title="Khu vực được bảo vệ" style={{ fontSize: 11 }}>🔒</span>}
                        </div>
                    }
                    <StatusButton status={p.status} onChange={(s) => updateAndSave(p.id, { status: s })} />
                    <button
                      title="Check-in tại đây"
                      onClick={() => setDraft({ ...draft, header: { ...draft.header, currentStop: p.name } })}
                      className="h-8 px-2 rounded font-ui inline-flex items-center justify-center gap-1 transition"
                      style={{
                        background: draft.header.currentStop === p.name ? B.orange : B.canvas,
                        color: draft.header.currentStop === p.name ? B.canvasPure : B.inkMuted,
                        border: `1px solid ${draft.header.currentStop === p.name ? B.orange : B.hairline}`,
                        fontSize: 11, fontWeight: 700,
                      }}
                    >
                      {draft.header.currentStop === p.name ? '📍 Đây' : 'Check-in'}
                    </button>
                    {isEditing && <>
                      <button onClick={() => confirm_(p.id)} title="Xác nhận"
                        className="h-8 w-8 rounded grid place-items-center"
                        style={{ background: '#EBFFB1', border: `1px solid ${B.hairline}` }}>
                        <span className="font-ui" style={{ fontSize: 14, color: B.ink }}>✓</span>
                      </button>
                      <button onClick={() => remove(p.id)} title="Xoá"
                        className="h-8 w-8 rounded grid place-items-center"
                        style={{ background: B.canvas, border: `1px solid ${B.hairline}` }}>
                        <Trash2 size={13} />
                      </button>
                    </>}
                    {showHoverActions && <>
                      <button onClick={() => unconfirm(p.id)} title="Sửa tên"
                        className="h-8 w-8 rounded grid place-items-center"
                        style={{ background: B.canvas, border: `1px solid ${B.hairline}` }}>
                        <span className="font-ui" style={{ fontSize: 13 }}>✎</span>
                      </button>
                      <button onClick={() => remove(p.id)} title="Xoá"
                        className="h-8 w-8 rounded grid place-items-center"
                        style={{ background: B.canvas, border: `1px solid ${B.hairline}` }}>
                        <Trash2 size={13} />
                      </button>
                    </>}
                  </div>
                );
              })()}
              {isOpen && (() => {
                const provSubs = draft.subLocations.filter((s) => s.provinceId === p.id).sort((a, b) => a.locNum - b.locNum);
                const updateSub = (sid: number, patch: Partial<SubLocation>) =>
                  setDraft(prev => ({ ...prev, subLocations: prev.subLocations.map((s) => s.id === sid ? { ...s, ...patch } : s) }));
                const removeSub = (sid: number) => {
                  if (!confirm('Xoá địa điểm này?')) return;
                  setDraft(prev => {
                    const provId = prev.subLocations.find(s => s.id === sid)?.provinceId;
                    const remaining = prev.subLocations.filter(s => s.id !== sid);
                    const renum = remaining
                      .filter(s => s.provinceId === provId)
                      .sort((a, b) => a.locNum - b.locNum)
                      .map((s, i) => ({ ...s, locNum: i + 1 }));
                    // Sync new locNums to server
                    renum.forEach(s => patchSubLocation(s.id, { locNum: s.locNum }));
                    return { ...prev, subLocations: remaining.map(s => renum.find(r => r.id === s.id) ?? s) };
                  });
                  deleteSubLocation(sid);
                };
                const updateSubStatus = (sid: number, status: SubLocation['status']) => {
                  updateSub(sid, { status });
                  patchSubLocation(sid, { status });
                };
                const moveSubUp = (sid: number) => {
                  const idx = provSubs.findIndex((s) => s.id === sid);
                  if (idx <= 0) return;
                  const a = provSubs[idx - 1], b = provSubs[idx];
                  setDraft(prev => ({ ...prev, subLocations: prev.subLocations.map((s) => s.id === b.id ? { ...s, locNum: a.locNum } : s.id === a.id ? { ...s, locNum: b.locNum } : s) }));
                };
                const moveSubDown = (sid: number) => {
                  const idx = provSubs.findIndex((s) => s.id === sid);
                  if (idx < 0 || idx >= provSubs.length - 1) return;
                  const a = provSubs[idx], b = provSubs[idx + 1];
                  setDraft(prev => ({ ...prev, subLocations: prev.subLocations.map((s) => s.id === a.id ? { ...s, locNum: b.locNum } : s.id === b.id ? { ...s, locNum: a.locNum } : s) }));
                };
                const onDragOver = (e: React.DragEvent) => e.preventDefault();
                const onDrop = (e: React.DragEvent, targetId: number) => {
                  e.preventDefault();
                  const dragId = dragItemRef.current;
                  if (dragId === null || dragId === targetId) return;
                  const fromIdx = provSubs.findIndex((s) => s.id === dragId);
                  const toIdx = provSubs.findIndex((s) => s.id === targetId);
                  if (fromIdx < 0 || toIdx < 0) return;
                  const reordered = [...provSubs];
                  const [moved] = reordered.splice(fromIdx, 1);
                  reordered.splice(toIdx, 0, moved);
                  const nums = new Map(reordered.map((s, i) => [s.id, i + 1]));
                  setDraft(prev => ({ ...prev, subLocations: prev.subLocations.map((s) => nums.has(s.id) ? { ...s, locNum: nums.get(s.id)! } : s) }));
                  dragItemRef.current = null;
                };
                const addSub = () => {
                  setDraft(prev => {
                    const inProv = prev.subLocations.filter((s) => s.provinceId === p.id);
                    const nextId = prev.subLocations.reduce((m, s) => Math.max(m, s.id), 0) + 1;
                    const nextLoc = inProv.reduce((m, s) => Math.max(m, s.locNum), 0) + 1;
                    const ns: SubLocation = {
                      id: nextId, provinceId: p.id, episode: p.episode, locNum: nextLoc,
                      name: 'Địa điểm mới', province: p.name, region: p.region,
                      km: 0, date: '—', quote: '"..."',
                      image: p.image, status: 'locked', lat: p.lat, lng: p.lng,
                    };
                    return { ...prev, subLocations: [...prev.subLocations, ns] };
                  });
                };
                return (
                  <div className="pb-2 px-3" style={{ background: `rgba(35,37,41,0.02)` }}>
                    <div className="overflow-x-auto mb-2">
                    <div className="rounded overflow-hidden" style={{ border: `1px solid ${B.hairline}`, minWidth: 560 }}>
                      <div className="grid px-3 py-1.5 font-ui"
                        style={{ gridTemplateColumns: '16px 20px 1fr 120px 110px 52px 30px 28px', background: B.canvas, fontSize: 10, fontWeight: 700, color: B.inkMuted }}>
                        <div></div><div>#</div><div>Tên địa điểm</div><div>Số tập</div><div>Trạng thái</div><div></div><div></div><div title="Toạ độ">📍</div>
                      </div>
                      {provSubs.length === 0 && (
                        <div className="px-3 py-2 font-ui" style={{ fontSize: 11, color: B.inkSubtle }}>Chưa có địa điểm</div>
                      )}
                      {provSubs.map((s, idx) => (
                        <div key={s.id} style={{ borderTop: `1px solid ${B.hairline}` }}>
                          {/* Main row */}
                          <div className="grid px-3 py-1.5 items-center gap-1"
                            draggable
                            onDragStart={() => { dragItemRef.current = s.id; }}
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, s.id)}
                            style={{ gridTemplateColumns: '16px 20px 1fr 120px 110px 52px 30px 28px', cursor: 'grab' }}>
                            <GripVertical size={12} style={{ color: B.inkSubtle }} />
                            <span className="font-ui" style={{ fontSize: 11, color: B.inkSubtle }}>{idx + 1}</span>
                            <TextInput value={s.name} onChange={(e) => updateSub(s.id, { name: e.target.value })} style={{ height: 30, fontSize: 11, padding: '0 8px' }} />
                            <select
                              value={s.episode ?? 1}
                              onChange={(e) => { const ep = Number(e.target.value); updateSub(s.id, { episode: ep }); patchSubLocation(s.id, { episode: ep }); }}
                              className="h-[30px] w-full px-2 font-ui outline-none rounded"
                              style={{ ...inputStyle, fontSize: 11 }}>
                              {Array.from({ length: 10 }, (_, i) => i + 1).map(ep => (
                                <option key={ep} value={ep}>Tập {ep}</option>
                              ))}
                            </select>
                            <StatusButton status={s.status} onChange={(st) => updateSubStatus(s.id, st)} />
                            <div className="flex flex-col gap-0.5">
                              <button onClick={() => moveSubUp(s.id)} disabled={idx === 0}
                                className="h-[22px] w-full rounded grid place-items-center"
                                style={{ background: B.canvas, border: `1px solid ${B.hairline}`, opacity: idx === 0 ? 0.3 : 1 }}>
                                <ChevronUp size={10} />
                              </button>
                              <button onClick={() => moveSubDown(s.id)} disabled={idx === provSubs.length - 1}
                                className="h-[22px] w-full rounded grid place-items-center"
                                style={{ background: B.canvas, border: `1px solid ${B.hairline}`, opacity: idx === provSubs.length - 1 ? 0.3 : 1 }}>
                                <ChevronDown size={10} />
                              </button>
                            </div>
                            <button onClick={() => removeSub(s.id)} className="h-7 w-7 rounded grid place-items-center"
                              style={{ background: B.canvas, border: `1px solid ${B.hairline}` }}>
                              <Trash2 size={11} />
                            </button>
                            {/* Toggle lat/lng */}
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleLatLng(s.id); }}
                              title="Nhập kinh độ / vĩ độ"
                              className="h-7 w-7 rounded grid place-items-center text-base"
                              style={{ background: expandedLatLng.has(s.id) ? B.ink : B.canvas, border: `1px solid ${B.hairline}`, fontSize: 13 }}>
                              <span style={{ filter: expandedLatLng.has(s.id) ? 'brightness(10)' : 'none' }}>📍</span>
                            </button>
                          </div>

                          {/* Lat/Lng expandable row */}
                          {expandedLatLng.has(s.id) && (
                            <div className="px-4 pb-2.5 pt-2" style={{ background: `${B.ink}06` }}>
                              {/* Quick paste */}
                              <div className="mb-2">
                                <div className="font-ui mb-1" style={{ fontSize: 10, color: B.inkMuted, fontWeight: 700, letterSpacing: '0.04em' }}>
                                  PASTE NHANH — link Google Maps hoặc "lat, lng"
                                </div>
                                <input
                                  type="text"
                                  placeholder='VD: 22.8026, 104.9784  hoặc link maps.google.com/...'
                                  className="w-full font-ui outline-none rounded"
                                  style={{ ...inputStyle, height: 30, fontSize: 11, padding: '0 10px' }}
                                  onPaste={(e) => {
                                    const text = e.clipboardData.getData('text');
                                    // Parse Google Maps URL: @lat,lng or q=lat,lng
                                    const urlMatch = text.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/) ||
                                                     text.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/) ||
                                                     text.match(/ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
                                    // Parse plain "lat, lng"
                                    const plainMatch = !urlMatch && text.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
                                    const m = urlMatch || plainMatch;
                                    if (m) {
                                      e.preventDefault();
                                      const lat = parseFloat(m[1]), lng = parseFloat(m[2]);
                                      updateSub(s.id, { lat, lng });
                                      patchSubLocation(s.id, { lat, lng });
                                      (e.target as HTMLInputElement).value = `${lat}, ${lng}`;
                                    }
                                  }}
                                />
                              </div>
                              {/* Manual inputs */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-ui" style={{ fontSize: 10, color: B.inkMuted }}>Vĩ độ</span>
                                  <input type="number" step="0.0001" value={s.lat}
                                    onChange={(e) => updateSub(s.id, { lat: Number(e.target.value) })}
                                    onBlur={(e) => patchSubLocation(s.id, { lat: Number(e.target.value) })}
                                    className="font-ui outline-none rounded"
                                    style={{ ...inputStyle, height: 28, width: 105, fontSize: 11, padding: '0 8px' }} />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-ui" style={{ fontSize: 10, color: B.inkMuted }}>Kinh độ</span>
                                  <input type="number" step="0.0001" value={s.lng}
                                    onChange={(e) => updateSub(s.id, { lng: Number(e.target.value) })}
                                    onBlur={(e) => patchSubLocation(s.id, { lng: Number(e.target.value) })}
                                    className="font-ui outline-none rounded"
                                    style={{ ...inputStyle, height: 28, width: 105, fontSize: 11, padding: '0 8px' }} />
                                </div>
                                <span className="font-ui" style={{ fontSize: 10, color: B.inkSubtle }}>Blur để lưu</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    </div>{/* end overflow-x-auto */}
                    <div className="flex gap-2">
                      <button onClick={addSub} className="h-7 px-3 rounded font-ui inline-flex items-center gap-1"
                        style={{ background: B.ink, color: B.canvasPure, fontSize: 11, fontWeight: 700 }}>
                        <Plus size={11} /> Thêm địa điểm
                      </button>
                      <button onClick={() => { setBulkPid(p.id); setBulkText(''); }}
                        className="h-7 px-3 rounded font-ui inline-flex items-center gap-1"
                        style={{ background: B.canvas, border: `1px solid ${B.hairline}`, fontSize: 11, fontWeight: 700, color: B.ink }}>
                        ⚡ Thêm nhanh
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* ── Bulk add modal ── */}
      {bulkPid !== null && (() => {
        const prov = draft.provinces.find(p => p.id === bulkPid)!;
        const parsed = parseLocationLines(bulkText);
        const addBulk = () => {
          if (!prov || parsed.length === 0) return;
          const inProv = draft.subLocations.filter(s => s.provinceId === prov.id);
          let nextId = draft.subLocations.reduce((m, s) => Math.max(m, s.id), 0) + 1;
          let nextLoc = inProv.reduce((m, s) => Math.max(m, s.locNum), 0) + 1;
          const newSubs = parsed.map(({ name, lat, lng }) => ({
            id: nextId++, provinceId: prov.id, episode: prov.episode, locNum: nextLoc++,
            name: name || `Địa điểm ${nextLoc - 1}`,
            province: prov.name, region: prov.region,
            km: 0, date: '—', quote: '"..."',
            image: prov.image, status: 'locked' as const, lat, lng,
          }));
          setDraft({ ...draft, subLocations: [...draft.subLocations, ...newSubs] });
          setExpanded(prev => new Set(prev).add(prov.id));
          setBulkPid(null); setBulkText('');
        };
        return (
          <div className="fixed inset-0 z-50 grid place-items-center px-4"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
            onClick={() => { setBulkPid(null); setBulkText(''); }}>
            <div className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: B.canvasPure, boxShadow: '0 24px 64px rgba(0,0,0,0.22)', maxHeight: '90dvh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${B.hairline}` }}>
                <div>
                  <div className="font-ui" style={{ fontSize: 15, fontWeight: 700, color: B.ink }}>⚡ Thêm nhanh nhiều địa điểm</div>
                  <div className="font-ui mt-0.5" style={{ fontSize: 12, color: B.inkMuted }}>Tỉnh: {prov?.name}</div>
                </div>
                <button onClick={() => { setBulkPid(null); setBulkText(''); }}
                  className="h-8 w-8 rounded grid place-items-center"
                  style={{ background: B.canvas, border: `1px solid ${B.hairline}` }}>
                  <X size={15} />
                </button>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="rounded-lg p-3 font-ui" style={{ background: B.canvas, fontSize: 11, color: B.inkMuted, lineHeight: 1.7 }}>
                  Mỗi dòng 1 địa điểm — hỗ trợ:<br/>
                  • <strong>Link Google Maps</strong> — tự lấy tên + tọa độ<br/>
                  • <code style={{ background: B.hairline, padding: '1px 4px', borderRadius: 3 }}>Tên | lat, lng</code> — VD: <code style={{ background: B.hairline, padding: '1px 4px', borderRadius: 3 }}>Chợ Đêm | 22.82, 104.97</code><br/>
                  • <code style={{ background: B.hairline, padding: '1px 4px', borderRadius: 3 }}>lat, lng</code> — VD: <code style={{ background: B.hairline, padding: '1px 4px', borderRadius: 3 }}>22.8226, 104.9784</code>
                </div>
                <textarea autoFocus rows={6}
                  placeholder={"https://maps.google.com/maps/place/...\nTên địa điểm | 22.82, 104.97\n22.8226, 104.9784"}
                  value={bulkText} onChange={e => setBulkText(e.target.value)}
                  className="w-full font-ui outline-none rounded resize-none"
                  style={{ ...inputStyle, fontSize: 12, padding: '10px 12px', lineHeight: 1.7 }}
                />
                {parsed.length > 0 && (
                  <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${B.hairline}` }}>
                    <div className="px-4 py-2 font-ui" style={{ background: B.canvas, fontSize: 11, fontWeight: 700, color: B.inkMuted }}>
                      XEM TRƯỚC — {parsed.length} địa điểm
                    </div>
                    {parsed.map((loc, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2 font-ui" style={{ borderTop: `1px solid ${B.hairline}`, fontSize: 12 }}>
                        <span style={{ color: B.inkSubtle, minWidth: 20 }}>{i + 1}.</span>
                        <span style={{ flex: 1, color: B.ink, fontWeight: 600 }}>{loc.name || <span style={{ color: B.inkSubtle, fontStyle: 'italic' }}>Chưa có tên</span>}</span>
                        <span style={{ fontSize: 10, color: B.inkMuted }}>{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {bulkText.trim() && parsed.length === 0 && (
                  <div className="font-ui px-3 py-2 rounded-lg" style={{ fontSize: 12, color: '#92400E', background: '#FEF3C7' }}>
                    ⚠ Không nhận ra định dạng. Thử paste link Google Maps hoặc "lat, lng".
                  </div>
                )}
                <div className="flex gap-2 pt-1" style={{ borderTop: `1px solid ${B.hairline}` }}>
                  <button onClick={addBulk} disabled={parsed.length === 0}
                    className="h-10 px-5 rounded-full font-ui inline-flex items-center gap-1.5 flex-1 justify-center"
                    style={{ background: parsed.length > 0 ? B.ink : B.canvas, color: parsed.length > 0 ? B.canvasPure : B.inkSubtle, fontSize: 13, fontWeight: 700, cursor: parsed.length > 0 ? 'pointer' : 'not-allowed' }}>
                    <Plus size={14} /> Thêm {parsed.length > 0 ? `${parsed.length} địa điểm` : '...'}
                  </button>
                  <button onClick={() => { setBulkPid(null); setBulkText(''); }}
                    className="h-10 px-4 rounded-full font-ui"
                    style={{ background: B.canvas, border: `1px solid ${B.hairline}`, fontSize: 13, color: B.inkMuted }}>
                    Huỷ
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

function SubLocationsSection({ draft, setDraft }: SP) {
  const [q, setQ] = useState('');
  const [pid, setPid] = useState<number | 'all'>('all');
  const [expandedPids, setExpandedPids] = useState<Set<number>>(new Set());

  const toggleProvince = (id: number) =>
    setExpandedPids((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const update = (id: number, patch: Partial<SubLocation>) => {
    setDraft(prev => ({ ...prev, subLocations: prev.subLocations.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
    if ('status' in patch) patchSubLocation(id, { status: patch.status });
    if ('images' in patch || 'image' in patch) patchSubLocation(id, { images: patch.images, image: patch.image });
  };
  const remove = (id: number) => {
    if (!confirm('Xoá địa điểm này?')) return;
    setDraft(prev => {
      const provId = prev.subLocations.find(s => s.id === id)?.provinceId;
      const remaining = prev.subLocations.filter(s => s.id !== id);
      const renum = remaining
        .filter(s => s.provinceId === provId)
        .sort((a, b) => a.locNum - b.locNum)
        .map((s, i) => ({ ...s, locNum: i + 1 }));
      renum.forEach(s => patchSubLocation(s.id, { locNum: s.locNum }));
      return { ...prev, subLocations: remaining.map(s => renum.find(r => r.id === s.id) ?? s) };
    });
    deleteSubLocation(id);
  };
  const add = (targetPid: number) => {
    setDraft(prev => {
      const prov = prev.provinces.find((p) => p.id === targetPid)!;
      if (!prov) return prev;
      const inProv = prev.subLocations.filter((s) => s.provinceId === targetPid);
      const nextId = prev.subLocations.reduce((m, s) => Math.max(m, s.id), 0) + 1;
      const nextLoc = inProv.reduce((m, s) => Math.max(m, s.locNum), 0) + 1;
      const ns: SubLocation = {
        id: nextId, provinceId: targetPid, episode: prov.episode, locNum: nextLoc,
        name: 'Địa điểm mới', province: prov.name, region: prov.region,
        km: 0, date: '—', quote: '"..."',
        image: prov.image, status: 'locked', lat: prov.lat, lng: prov.lng,
      };
      return { ...prev, subLocations: [...prev.subLocations, ns] };
    });
    setExpandedPids((prev) => new Set(prev).add(targetPid));
  };

  const provincesToShow = pid === 'all'
    ? draft.provinces
    : draft.provinces.filter((p) => p.id === pid);

  const filteredSubs = (pId: number) =>
    draft.subLocations
      .filter((s) => s.provinceId === pId)
      .filter((s) => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.quote.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.locNum - b.locNum);

  // Province-inherited fields that are READ-ONLY in this tab
  const ReadOnlyBadge = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex flex-col gap-0.5">
      <span className="font-ui" style={{ fontSize: 10, color: B.inkSubtle, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
      <div className="h-9 px-3 inline-flex items-center gap-1 font-ui rounded"
        style={{ background: B.canvas, border: `1px dashed ${B.hairline}`, fontSize: 13, color: B.inkMuted, cursor: 'not-allowed' }}>
        <Lock size={10} style={{ color: B.inkSubtle, flexShrink: 0 }} />
        {value}
      </div>
    </div>
  );

  return (
    <>
      <SectionTitle hint="Mỗi Tỉnh chứa các địa điểm cấp 2. Thông tin kế thừa từ Tỉnh được khoá — chỉ bổ sung thêm thông tin hiển thị lên Card.">
        Địa Điểm
      </SectionTitle>

      {/* Filter bar */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <TextInput placeholder="Tìm theo tên / quote..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={pid} onChange={(e) => setPid(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="h-10 px-2 font-ui" style={{ ...inputStyle, fontSize: 12, minWidth: 180 }}>
          <option value="all">Tất cả tỉnh</option>
          {draft.provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button
          onClick={() => {
            if (!confirm('Đánh số lại toàn bộ địa điểm từ #1 theo thứ tự hiện tại?')) return;
            setDraft(prev => {
              const allSubs = [...prev.subLocations];
              const provIds = [...new Set(allSubs.map(s => s.provinceId))];
              const renumbered = allSubs.map(s => ({ ...s }));
              provIds.forEach(pid => {
                const group = renumbered
                  .filter(s => s.provinceId === pid)
                  .sort((a, b) => a.locNum - b.locNum);
                group.forEach((s, i) => {
                  s.locNum = i + 1;
                  patchSubLocation(s.id, { locNum: i + 1 });
                });
              });
              return { ...prev, subLocations: renumbered };
            });
          }}
          className="h-10 px-3 rounded-full font-ui inline-flex items-center gap-1.5 shrink-0"
          style={{ background: B.canvas, border: `1px solid ${B.hairline}`, fontSize: 12, color: B.inkMuted }}>
          <RotateCcw size={12} /> Đánh số lại
        </button>
      </div>

      {/* Grouped by Province */}
      <div className="flex flex-col gap-3">
        {provincesToShow.map((prov) => {
          const subs = filteredSubs(prov.id);
          if (q && subs.length === 0) return null;
          const isOpen = expandedPids.has(prov.id);
          return (
            <div key={prov.id} style={{ background: B.canvasPure, borderRadius: B.radiusXl, border: `1px solid ${B.hairline}`, overflow: 'hidden' }}>
              {/* Province header — read-only info strip */}
              <button
                className="w-full flex items-center justify-between px-5 py-3"
                style={{ background: B.canvas }}
                onClick={() => toggleProvince(prov.id)}
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown size={14} color={B.inkMuted} /> : <ChevronRight size={14} color={B.inkMuted} />}
                  <span className="font-ui" style={{ fontSize: 14, fontWeight: 700, color: B.ink }}>{prov.name}</span>
                  <span className="font-ui px-2 py-0.5 rounded-full" style={{ fontSize: 11, background: B.hairline, color: B.inkMuted }}>
                    {subs.length} địa điểm
                  </span>
                </div>
                <div className="flex items-center gap-1.5" style={{ color: B.inkSubtle, fontSize: 11 }}>
                  <Lock size={10} />
                  <span className="font-ui">Kế thừa từ Tab Tỉnh</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-3 flex flex-col gap-4">
                  {subs.length === 0 && !q && (
                    <div className="font-ui py-3 text-center" style={{ fontSize: 12, color: B.inkSubtle }}>
                      Chưa có địa điểm nào. Bấm "+ Thêm địa điểm" bên dưới.
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {subs.map((s, idx) => (
                      <SubLocationCard
                        key={s.id}
                        s={s}
                        displayNum={idx + 1}
                        provImg={draft.provinces.find((p) => p.id === s.provinceId)?.image ?? ''}
                        onUpdate={(patch) => update(s.id, patch)}
                        onRemove={() => remove(s.id)}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => add(prov.id)}
                    className="h-8 px-3 rounded font-ui inline-flex items-center gap-1 self-start"
                    style={{ background: B.ink, color: B.canvasPure, fontSize: 12, fontWeight: 700 }}
                  >
                    <Plus size={12} /> Thêm địa điểm vào {prov.name}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function compressForUpload(file: File, maxPx = 1200, quality = 0.88): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > h) { h = Math.round(maxPx * h / w); w = maxPx; }
        else { w = Math.round(maxPx * w / h); h = maxPx; }
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(cv.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function SubLocationCard({
  s, displayNum, provImg, onUpdate, onRemove,
}: {
  s: SubLocation;
  displayNum: number;
  provImg: string;
  onUpdate: (patch: Partial<SubLocation>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<Set<number>>(new Set());
  const imgs = s.images ?? (s.image ? [s.image] : []);
  // If videoUrl set and no images, show YT thumbnail as default
  const ytId = s.videoUrl?.match(/(?:v=|youtu\.be\/|shorts\/)([^&?/\s]+)/)?.[1];
  const ytThumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;
  const displayImg = imgs[0] || ytThumb || provImg;

  const statusColors = {
    locked:  { bg: '#E5E7EB', fg: '#6B7280', dot: '#9CA3AF' },
    flagged: { bg: B.lime,    fg: B.ink,     dot: '#84cc16' },
    visited: { bg: '#D1FAE5', fg: '#065F46', dot: '#10b981' },
  }[s.status];

  return (
    <>
      {/* ── Mini swipe card ── */}
      <div
        className="relative overflow-hidden cursor-pointer group aspect-[3/4]"
        style={{ borderRadius: B.radiusLg, border: `1px solid ${B.hairline}` }}
        onClick={() => setOpen(true)}
      >
        {/* Background image */}
        {displayImg ? (
          <img src={displayImg || PLACEHOLDER_IMG} alt={s.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }} />
        ) : (
          <div className="absolute inset-0" style={{ background: B.canvas }} />
        )}

        {/* Gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.1) 55%, transparent 100%)' }} />

        {/* Hover edit hint */}
        <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(35,37,41,0.35)' }}>
          <div className="font-ui px-4 py-2 rounded-full"
            style={{ background: B.canvasPure, fontSize: 13, fontWeight: 700, color: B.ink }}>
            ✎ Chỉnh sửa
          </div>
        </div>

        {/* Status dot */}
        <div className="absolute top-2.5 left-3 flex items-center gap-1.5">
          <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: statusColors.dot }} />
          <span className="font-ui px-2 py-0.5 rounded-full"
            style={{ fontSize: 10, background: statusColors.bg, color: statusColors.fg, fontWeight: 700 }}>
            {STATUS_LABEL[s.status]}
          </span>
        </div>

        {/* Image count */}
        {imgs.length > 1 && (
          <div className="absolute top-2.5 right-3 font-ui px-2 py-0.5 rounded-full"
            style={{ fontSize: 10, background: 'rgba(0,0,0,0.45)', color: '#fff', backdropFilter: 'blur(4px)' }}>
            {imgs.length} ảnh
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
          <div className="font-ui mb-0.5" style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)' }}>
            #{displayNum} · {s.date !== '—' ? s.date : 'Chưa có ngày'}
          </div>
          <div className="font-display" style={{ fontSize: 15, color: '#fff', lineHeight: 1.2, fontWeight: 700 }}>
            {s.name}
          </div>
          {s.quote && s.quote !== '"..."' && (
            <div className="font-body italic mt-0.5 line-clamp-1" style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
              {s.quote.replace(/"/g, '')}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit dialog ── */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
          onClick={() => setOpen(false)}>
          <div
            className="w-full overflow-y-auto"
            style={{ maxWidth: 560, maxHeight: '90dvh', background: B.canvasPure, borderRadius: B.radiusXl, boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dialog header with mini card preview */}
            <div className="relative h-44 overflow-hidden" style={{ borderRadius: `${B.radiusXl}px ${B.radiusXl}px 0 0` }}>
              <img src={displayImg || PLACEHOLDER_IMG} alt={s.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 60%)' }} />
              <div className="absolute inset-x-0 bottom-0 px-5 pb-4">
                <div className="font-display" style={{ fontSize: 20, color: '#fff', fontWeight: 800 }}>{s.name || 'Địa điểm mới'}</div>
                <div className="font-ui mt-0.5" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>#{s.id} · {s.province}</div>
              </div>
              <button onClick={() => setOpen(false)}
                className="absolute top-3 right-3 grid place-items-center rounded-full"
                style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', color: '#fff' }}>
                <X size={15} strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3">
              {/* Row 1 */}
              <div className="grid grid-cols-[1fr_110px_100px] gap-2">
                <Field label="Tên địa điểm">
                  <TextInput value={s.name} onChange={(e) => onUpdate({ name: e.target.value })} />
                </Field>
                <Field label="Ngày">
                  <div className="relative">
                    <input type="date" value={s.date === '—' ? '' : s.date}
                      onChange={(e) => onUpdate({ date: e.target.value || '—' })}
                      className="h-10 w-full pl-3 pr-8 font-ui outline-none rounded"
                      style={{ ...inputStyle, fontSize: 13 }} />
                    <CalendarDays size={13} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: B.inkMuted }} />
                  </div>
                </Field>
                <Field label="Trạng thái">
                  <StatusButton status={s.status} onChange={(v) => onUpdate({ status: v })} />
                </Field>
              </div>

              {/* Row 2 — Episode */}
              <Field label="Số tập">
                <div className="flex gap-1.5 flex-wrap">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(ep => (
                    <button key={ep} onClick={() => onUpdate({ episode: ep })}
                      className="h-8 w-8 rounded-full font-ui shrink-0"
                      style={{ fontSize: 13, fontWeight: 700, background: s.episode === ep ? B.orange : B.canvas, color: s.episode === ep ? '#fff' : B.inkMuted, border: `1.5px solid ${s.episode === ep ? B.orange : B.hairline}` }}>
                      {ep}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Quiz toggle */}
              <div className="flex items-center justify-between py-1 px-1">
                <div>
                  <div className="font-ui" style={{ fontSize: 13, fontWeight: 600, color: B.ink }}>Hiện nút Quiz</div>
                  <div className="font-ui" style={{ fontSize: 11, color: B.inkMuted }}>Hiển thị nút "Quiz" trên popup bản đồ</div>
                </div>
                <div
                  onClick={() => onUpdate({ showQuiz: !(s.showQuiz !== false) })}
                  className="relative shrink-0 cursor-pointer"
                  style={{ width: 44, height: 24, borderRadius: 12, background: s.showQuiz !== false ? B.ink : B.hairline, transition: 'background 200ms' }}
                >
                  <div style={{
                    position: 'absolute', top: 2, borderRadius: '50%',
                    width: 20, height: 20, background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    left: s.showQuiz !== false ? 22 : 2,
                    transition: 'left 200ms',
                  }} />
                </div>
              </div>

              {/* Video URL */}
              <Field label="Link Video (YouTube)">
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-2 items-center">
                    {ytId && (
                      <div className="shrink-0 rounded overflow-hidden" style={{ width: 60, height: 34, border: `1px solid ${B.hairline}` }}>
                        <img src={`https://i.ytimg.com/vi/${ytId}/default.jpg`} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <TextInput
                      value={s.videoUrl ?? ''}
                      placeholder="https://youtube.com/watch?v=..."
                      onChange={async (e) => {
                        const url = e.target.value;
                        const id = url.match(/(?:v=|youtu\.be\/|shorts\/)([^&?/\s]+)/)?.[1];
                        const patch: Partial<SubLocation> = { videoUrl: url };
                        if (id && imgs.filter(Boolean).length === 0) {
                          patch.image = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
                        }
                        onUpdate(patch);
                        // Auto-fetch title from noembed
                        if (id) {
                          try {
                            const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
                            const d = await res.json();
                            if (d.title) onUpdate({ videoTitle: d.title });
                          } catch {}
                        }
                      }}
                    />
                    {s.videoUrl && (
                      <button onClick={() => onUpdate({ videoUrl: '', videoTitle: '' })}
                        className="shrink-0 h-9 w-9 rounded grid place-items-center"
                        style={{ background: B.canvas, border: `1px solid ${B.hairline}` }}>
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  {s.videoTitle && (
                    <div className="font-ui px-2 py-1 rounded" style={{ fontSize: 11, color: B.inkMuted, background: B.canvas, border: `1px solid ${B.hairline}` }}>
                      🎬 {s.videoTitle}
                    </div>
                  )}
                </div>
              </Field>

              {/* Quote */}
              <Field label="Quote hiển thị trên Card">
                <TextArea value={s.quote} onChange={(e) => onUpdate({ quote: e.target.value })} />
              </Field>

              {/* Images — upload to server */}
              <div>
                <div className="mb-2 font-ui" style={{ fontSize: 12, color: B.inkMuted }}>
                  Ảnh (tối đa 5) — ảnh đầu hiển thị chính · upload lên server
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const url = imgs[idx] ?? '';
                    const isUploading = uploadingIdx.has(idx);
                    return (
                      <div key={idx} className="relative group" style={{ aspectRatio: '1' }}>
                        <label className="block w-full h-full rounded-lg overflow-hidden cursor-pointer"
                          style={{ background: B.canvas, border: `1.5px dashed ${url ? B.hairline : B.inkSubtle + '44'}` }}>
                          {url ? (
                            <img src={url} alt="" className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }} />
                          ) : isUploading ? (
                            <div className="w-full h-full grid place-items-center">
                              <div className="font-ui animate-spin" style={{ fontSize: 18, color: B.inkMuted }}>⟳</div>
                            </div>
                          ) : (
                            <div className="w-full h-full grid place-items-center flex-col gap-1">
                              <ImageIcon size={18} style={{ color: B.inkSubtle }} />
                              <span className="font-ui block" style={{ fontSize: 9, color: B.inkSubtle, marginTop: 2 }}>
                                {idx === 0 ? 'Ảnh chính' : `Ảnh ${idx + 1}`}
                              </span>
                            </div>
                          )}
                          <input type="file" accept="image/*" className="sr-only"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingIdx(prev => new Set(prev).add(idx));
                              try {
                                const compressed = await compressForUpload(file);
                                const serverUrl = await uploadImage(compressed, file.name);
                                const next = [...imgs];
                                while (next.length <= idx) next.push('');
                                next[idx] = serverUrl;
                                onUpdate({ images: next.filter(Boolean), image: next[0] || provImg });
                              } catch (uploadErr: any) {
                                alert(`Lỗi upload: ${uploadErr?.message ?? uploadErr}`);
                              } finally {
                                setUploadingIdx(prev => { const s = new Set(prev); s.delete(idx); return s; });
                                e.target.value = '';
                              }
                            }} />
                        </label>
                        {/* Remove button */}
                        {url && (
                          <button
                            onClick={() => {
                              const next = [...imgs];
                              next[idx] = '';
                              const cleaned = next.filter(Boolean);
                              onUpdate({ images: cleaned, image: cleaned[0] || provImg });
                            }}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}>
                            <X size={10} strokeWidth={2.5} />
                          </button>
                        )}
                        {/* Upload overlay on hover (when has image) */}
                        {url && !isUploading && (
                          <label className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
                            style={{ background: 'rgba(0,0,0,0.35)' }}>
                            <Upload size={16} color="#fff" />
                            <input type="file" accept="image/*" className="sr-only"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setUploadingIdx(prev => new Set(prev).add(idx));
                                try {
                                  const compressed = await compressForUpload(file);
                                  const serverUrl = await uploadImage(compressed, file.name);
                                  const next = [...imgs];
                                  while (next.length <= idx) next.push('');
                                  next[idx] = serverUrl;
                                  onUpdate({ images: next.filter(Boolean), image: next[0] || provImg });
                                } catch (uploadErr: any) {
                                  alert(`Lỗi upload: ${uploadErr?.message ?? uploadErr}`);
                                } finally {
                                  setUploadingIdx(prev => { const s = new Set(prev); s.delete(idx); return s; });
                                  e.target.value = '';
                                }
                              }} />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${B.hairline}` }}>
                <button onClick={() => { onRemove(); setOpen(false); }}
                  className="h-9 px-3 rounded font-ui inline-flex items-center gap-1"
                  style={{ background: B.canvas, border: `1px solid ${B.hairline}`, fontSize: 12, color: B.inkMuted }}>
                  <Trash2 size={13} /> Xoá địa điểm
                </button>
                <button onClick={() => setOpen(false)}
                  className="h-9 px-5 rounded-full font-ui"
                  style={{ background: B.ink, color: B.canvasPure, fontSize: 13, fontWeight: 700 }}>
                  Xong
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const STATUS_LABEL: Record<'locked' | 'flagged' | 'visited', string> = {
  locked:  'Chưa đến',
  flagged: 'Đã ghé',
  visited: 'Hoàn thành',
};

function StatusButton({ status, onChange }: { status: 'locked' | 'flagged' | 'visited'; onChange: (s: 'locked' | 'flagged' | 'visited') => void }) {
  const next = status === 'locked' ? 'flagged' : status === 'flagged' ? 'visited' : 'locked';
  const colors = {
    locked:  { bg: '#E5E7EB', fg: '#6B7280' },
    flagged: { bg: B.lime, fg: B.ink },
    visited: { bg: '#D1FAE5', fg: '#065F46' },
  }[status];
  return (
    <button onClick={() => onChange(next)} className="h-9 px-2 rounded font-ui"
      style={{ background: colors.bg, color: colors.fg, fontSize: 12, borderRadius: B.radiusPill, border: `1px solid ${B.hairline}`, padding: '0 12px' }}>
      {STATUS_LABEL[status]}
    </button>
  );
}

function DataSection({ draft, setDraft }: SP) {
  const [text, setText] = useState('');
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `lao-tao-settings-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const importJson = () => {
    try {
      const parsed = JSON.parse(text);
      setDraft({ ...DEFAULT_SETTINGS, ...parsed });
      alert('Đã nạp dữ liệu vào draft. Bấm Lưu để áp dụng.');
    } catch (e) {
      alert('JSON không hợp lệ: ' + (e as Error).message);
    }
  };
  return (
    <>
      <SectionTitle hint="Xuất / nạp toàn bộ cấu hình bằng JSON.">Import / Export</SectionTitle>
      <Card>
        <button onClick={exportJson} className="h-9 px-3 rounded font-ui inline-flex items-center gap-1"
          style={{ background: B.ink, color: B.canvasPure, fontSize: 13, fontWeight: 700 }}>
          <Download size={14} /> Xuất JSON
        </button>
      </Card>
      <Card>
        <Field label="Dán JSON cấu hình vào đây">
          <TextArea value={text} onChange={(e) => setText(e.target.value)} style={{ minHeight: 200, fontFamily: 'ui-monospace, monospace' }} />
        </Field>
        <button onClick={importJson} className="h-9 px-3 rounded font-ui inline-flex items-center gap-1"
          style={{ background: B.canvas, border: `1px solid ${B.hairline}`, fontSize: 13, fontWeight: 700 }}>
          <Upload size={14} /> Nạp vào draft
        </button>
      </Card>
    </>
  );
}

const CAT_COLORS = ['#FF631F','#F59E0B','#10B981','#3B82F6','#8B5CF6','#EC4899','#06B6D4','#64748B'];

function VideosSection({ draft, setDraft }: SP) {
  const [fetching, setFetching] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const draftRef = useRef(draft);
  useEffect(() => { draftRef.current = draft; }, [draft]);

  const cats: VideoCategory[] = draft.videoCategories ?? [];

  const getYtId = (url: string) => url.match(/(?:v=|youtu\.be\/|shorts\/)([^&?/\s]+)/)?.[1] ?? null;
  const patchVideos = (d: typeof draft, id: number, patch: Partial<VideoItem>) =>
    ({ ...d, videos: d.videos.map((v) => v.id === id ? { ...v, ...patch } : v) });

  const update = (id: number, patch: Partial<VideoItem>) => {
    setDraft(patchVideos(draftRef.current, id, patch));
    if ('categoryId' in patch) patchVideo(id, { categoryId: patch.categoryId });
  };
  const remove = (id: number) => {
    if (!confirm('Xoá video này?')) return;
    setDraft({ ...draftRef.current, videos: draftRef.current.videos.filter((v) => v.id !== id) });
  };
  const add = () => {
    const d = draftRef.current;
    const nextId = d.videos.reduce((m, v) => Math.max(m, v.id), 0) + 1;
    setDraft({ ...d, videos: [...d.videos, { id: nextId, url: '', title: '', place: '', date: '', quote: '', image: '' }] });
  };
  const handleUrlChange = async (id: number, url: string) => {
    const ytId = getYtId(url.trim());
    // Always update URL immediately using latest ref
    setDraft(patchVideos(draftRef.current, id, {
      url: url.trim(),
      image: ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '',
    }));
    if (!ytId) return;
    setFetching(prev => new Set(prev).add(id));
    try {
      // noembed: reliable title + thumbnail
      const [noembedRes, proxyRes] = await Promise.allSettled([
        fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${ytId}`),
        fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${ytId}`)}`),
      ]);

      const patch: Partial<VideoItem> = {};

      if (noembedRes.status === 'fulfilled') {
        const nd = await noembedRes.value.json();
        if (nd.title) patch.title = nd.title;
        if (nd.thumbnail_url) patch.image = nd.thumbnail_url;
      }

      if (proxyRes.status === 'fulfilled') {
        const pd = await proxyRes.value.json();
        const html: string = pd.contents ?? '';
        const dateMatch = html.match(/"uploadDate":"(\d{4}-\d{2}-\d{2})"/);
        const descMatch = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
        if (dateMatch) {
          const d = new Date(dateMatch[1]);
          patch.date = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
        }
        if (descMatch) {
          const raw = descMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').replace(/\\\\/g, '\\').trim();
          patch.quote = raw.slice(0, 120) + (raw.length > 120 ? '...' : '');
        }
      }

      setDraft(patchVideos(draftRef.current, id, patch));
    } catch { /* keep existing */ }
    finally { setFetching(prev => { const s = new Set(prev); s.delete(id); return s; }); }
  };
  return (
    <>
      <SectionTitle hint="Video sẽ hiển thị ở tab Bảng Tin theo thứ tự từ trên xuống. Paste link YouTube để tự động điền thông tin.">Nội Dung</SectionTitle>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        {draft.videos.map((v) => {
          const ytId = getYtId(v.url);
          const isFetching = fetching.has(v.id);
          return (
            <React.Fragment key={v.id}>
            <article
              className="cursor-pointer group overflow-hidden"
              style={{ background: B.canvasPure, border: `1px solid ${B.hairline}`, borderRadius: B.radiusLg }}
              onClick={() => setEditingId(v.id)}
            >
              {/* Thumbnail — aspect-video like FeedTab */}
              <div className="relative aspect-video overflow-hidden">
                {ytId
                  ? <img src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`} alt="thumb" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMG; }} />
                  : <img src={PLACEHOLDER_IMG} alt="thumb" className="w-full h-full object-cover" />
                }
                {isFetching && (
                  <div className="absolute inset-0 grid place-items-center" style={{ background: 'rgba(255,255,255,0.65)' }}>
                    <div className="font-ui" style={{ fontSize: 11, color: B.inkMuted }}>Đang tải...</div>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/2" style={{ background: 'linear-gradient(to top, rgba(17,17,17,0.55), transparent)' }} />
                {/* ▶ badge + category */}
                <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-ui"
                    style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, fontWeight: 600 }}>
                    ▶ Video
                  </div>
                  {(() => { const cat = cats.find(c => c.id === v.categoryId); return cat ? (
                    <div className="px-2 py-0.5 rounded font-ui"
                      style={{ background: cat.color, color: '#fff', fontSize: 10, fontWeight: 700 }}>
                      {cat.name}
                    </div>
                  ) : null; })()}
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(35,37,41,0.3)' }}>
                  <div className="font-ui px-3 py-1.5 rounded-full"
                    style={{ background: B.canvasPure, fontSize: 12, fontWeight: 700, color: B.ink }}>
                    ✎ Chỉnh sửa
                  </div>
                </div>
                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); remove(v.id); }}
                  className="absolute top-2 right-2 grid place-items-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ width: 26, height: 26, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#fff' }}
                >
                  <Trash2 size={10} />
                </button>
              </div>

              {/* Info below — same structure as FeedTab */}
              <div className="p-3">
                <div className="font-ui" style={{ fontSize: 10, letterSpacing: '0.06em', color: B.inkSubtle }}>
                  {[v.place?.toUpperCase(), v.date].filter(Boolean).join(' · ') || '—'}
                </div>
                <div className="font-display mt-0.5" style={{ fontSize: 14, lineHeight: 1.25, color: v.title ? B.ink : B.inkSubtle, fontStyle: v.title ? 'normal' : 'italic' }}>
                  {v.title || 'Chưa có tiêu đề'}
                </div>
                {v.quote && (
                  <p className="font-body italic mt-0.5 line-clamp-2" style={{ fontSize: 12, color: B.inkMuted }}>{v.quote}</p>
                )}
              </div>
            </article>

            {/* Edit modal */}
            {editingId === v.id && (
              <div className="fixed inset-0 z-50 grid place-items-center px-4"
                style={{ background: 'rgba(0,0,0,0.4)' }}
                onClick={() => setEditingId(null)}>
                <div className="w-full max-w-lg rounded-xl overflow-hidden"
                  style={{ background: B.canvasPure, maxHeight: '90dvh', overflowY: 'auto' }}
                  onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${B.hairline}` }}>
                    <span className="font-ui" style={{ fontSize: 14, fontWeight: 700 }}>Chỉnh sửa video</span>
                    <button onClick={() => setEditingId(null)} className="h-7 w-7 rounded grid place-items-center"
                      style={{ background: B.canvas, border: `1px solid ${B.hairline}` }}>
                      <span style={{ fontSize: 16, lineHeight: 1, color: B.inkMuted }}>×</span>
                    </button>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <Field label="YouTube URL">
                      <TextInput value={v.url} placeholder="https://youtube.com/watch?v=..."
                        onChange={(e) => handleUrlChange(v.id, e.target.value)} />
                    </Field>
                    <Field label="Tiêu đề">
                      <TextInput value={v.title} onChange={(e) => update(v.id, { title: e.target.value })} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Địa điểm">
                        <TextInput value={v.place} onChange={(e) => update(v.id, { place: e.target.value })} />
                      </Field>
                      <Field label="Ngày">
                        <div className="relative">
                          <input type="date"
                            value={(() => {
                              const parts = v.date?.split('.');
                              if (parts?.length === 2) return `${new Date().getFullYear()}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
                              return new Date().toISOString().split('T')[0];
                            })()}
                            onChange={(e) => {
                              if (!e.target.value) return;
                              const [, mm, dd] = e.target.value.split('-');
                              update(v.id, { date: `${dd}.${mm}` });
                            }}
                            className="h-10 w-full pl-4 pr-9 font-ui outline-none rounded"
                            style={{ ...inputStyle, fontSize: 14 }} />
                          <CalendarDays size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: B.inkMuted }} />
                        </div>
                      </Field>
                    </div>
                    <Field label="Danh mục">
                      <select value={v.categoryId ?? ''}
                        onChange={e => update(v.id, { categoryId: e.target.value ? Number(e.target.value) : undefined })}
                        className="h-10 w-full pl-4 pr-3 font-ui outline-none rounded"
                        style={{ ...inputStyle, fontSize: 14 }}>
                        <option value="">— Không có danh mục —</option>
                        {cats.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Quote">
                      <TextArea value={v.quote} onChange={(e) => update(v.id, { quote: e.target.value })} />
                    </Field>
                    {ytId && (
                      <img src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`} alt="thumb"
                        className="w-full rounded-lg object-cover" style={{ maxHeight: 180 }} />
                    )}
                  </div>
                  <div className="px-4 pb-4 flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)}
                      className="h-9 px-4 rounded font-ui"
                      style={{ background: B.lime, fontSize: 13, fontWeight: 700, color: B.ink }}>
                      Xong
                    </button>
                  </div>
                </div>
              </div>
            )}
            </React.Fragment>
          );
        })}
        {draft.videos.length === 0 && (
          <div className="font-ui py-6 text-center" style={{ fontSize: 13, color: B.inkSubtle }}>Chưa có video nào</div>
        )}
      </div>
      <button onClick={add} className="h-9 px-3 rounded font-ui inline-flex items-center gap-1"
        style={{ background: B.ink, color: B.canvasPure, fontSize: 12, fontWeight: 700 }}>
        <Plus size={14} /> Thêm video
      </button>
    </>
  );
}

function CategoriesSection({ draft, setDraft }: SP) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(CAT_COLORS[0]);

  const cats: VideoCategory[] = draft.videoCategories ?? [];

  const videoCountFor = (catId: number) => draft.videos.filter(v => v.categoryId === catId).length;

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    const nextId = cats.reduce((m, c) => Math.max(m, c.id), 0) + 1;
    const nc: VideoCategory = { id: nextId, name, color: newColor };
    setDraft({ ...draft, videoCategories: [...cats, nc] });
    createCategory({ name, color: newColor });
    setNewName('');
    setNewColor(CAT_COLORS[(cats.length + 1) % CAT_COLORS.length]);
  };

  const remove = (id: number) => {
    if (!confirm('Xoá danh mục? Các video thuộc danh mục này sẽ bị bỏ liên kết.')) return;
    setDraft({
      ...draft,
      videoCategories: cats.filter(c => c.id !== id),
      videos: draft.videos.map(v => v.categoryId === id ? { ...v, categoryId: undefined } : v),
    });
    deleteCategory(id);
    if (editingId === id) setEditingId(null);
  };

  const updateName = (id: number, name: string) =>
    setDraft({ ...draft, videoCategories: cats.map(c => c.id === id ? { ...c, name } : c) });

  const saveName = (id: number, name: string) => {
    patchCategory(id, { name });
    setEditingId(null);
  };

  const updateColor = (id: number, color: string) => {
    setDraft({ ...draft, videoCategories: cats.map(c => c.id === id ? { ...c, color } : c) });
    patchCategory(id, { color });
  };

  return (
    <>
      <SectionTitle hint="Danh mục dùng để phân loại video ở Tab Bảng Tin. Bấm tên để đổi, bấm màu để chọn màu hiển thị.">Danh Mục</SectionTitle>

      {/* Add form */}
      <div className="flex gap-2 mb-5 items-center">
        <div className="relative shrink-0" style={{ width: 36, height: 36 }}>
          <div className="w-9 h-9 rounded-lg cursor-pointer border" style={{ background: newColor, borderColor: B.hairline }} />
          <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
        </div>
        <TextInput placeholder="Tên danh mục mới..."
          value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') add(); }} />
        <button onClick={add} disabled={!newName.trim()}
          className="h-10 px-4 rounded font-ui shrink-0 inline-flex items-center gap-1"
          style={{
            background: newName.trim() ? B.ink : B.canvas,
            color: newName.trim() ? B.canvasPure : B.inkSubtle,
            border: `1px solid ${B.hairline}`, fontSize: 13, fontWeight: 700,
            cursor: newName.trim() ? 'pointer' : 'not-allowed',
          }}>
          <Plus size={13} /> Tạo
        </button>
      </div>

      {/* Category list */}
      {cats.length === 0 ? (
        <div className="py-10 text-center font-ui" style={{ fontSize: 14, color: B.inkSubtle }}>
          Chưa có danh mục nào. Tạo danh mục đầu tiên ở trên.
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${B.hairline}` }}>
          <div className="grid px-4 py-2 font-ui"
            style={{ gridTemplateColumns: '40px 1fr 80px 80px', background: B.canvas, fontSize: 11, fontWeight: 700, color: B.inkMuted }}>
            <div>Màu</div><div>Tên danh mục</div><div className="text-center">Video</div><div></div>
          </div>
          {cats.map(cat => (
            <div key={cat.id} className="grid px-4 py-2 items-center gap-2"
              style={{ gridTemplateColumns: '40px 1fr 80px 80px', borderTop: `1px solid ${B.hairline}` }}>
              {/* Color picker */}
              <div className="relative" style={{ width: 28, height: 28 }}>
                <div className="w-7 h-7 rounded-md cursor-pointer"
                  style={{ background: cat.color, boxShadow: `0 0 0 2px ${cat.color}44` }} />
                <input type="color" value={cat.color} onChange={e => updateColor(cat.id, e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              </div>

              {/* Editable name */}
              {editingId === cat.id ? (
                <input autoFocus value={cat.name}
                  onChange={e => updateName(cat.id, e.target.value)}
                  onBlur={e => saveName(cat.id, e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') saveName(cat.id, (e.target as HTMLInputElement).value);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="h-9 w-full px-3 font-ui outline-none rounded"
                  style={{ ...inputStyle, fontSize: 13, fontWeight: 600 }} />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-0.5 rounded-full font-ui inline-block"
                    style={{ background: cat.color + '22', border: `1px solid ${cat.color}55`, fontSize: 13, fontWeight: 600, color: cat.color }}>
                    {cat.name}
                  </div>
                  <button onClick={() => setEditingId(cat.id)} className="opacity-50 hover:opacity-100 transition-opacity"
                    style={{ fontSize: 13, color: B.inkMuted }}>✎</button>
                </div>
              )}

              {/* Video count */}
              <div className="text-center font-ui" style={{ fontSize: 13, color: B.inkMuted }}>
                {videoCountFor(cat.id)} video
              </div>

              {/* Delete */}
              <div className="flex justify-end">
                <button onClick={() => remove(cat.id)} className="h-8 w-8 rounded grid place-items-center"
                  style={{ background: B.canvas, border: `1px solid ${B.hairline}` }}>
                  <Trash2 size={13} style={{ color: B.inkMuted }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function VisitorsSection() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'joined'>('points');

  const load = () => { setLoading(true); fetchVisitors().then(v => { setVisitors(v); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const remove = async (id: number) => {
    if (!confirm('Xoá người dùng này?')) return;
    await deleteVisitor(id);
    setVisitors(prev => prev.filter(v => v.id !== id));
  };

  const filtered = visitors
    .filter(v => !q || v.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => sortBy === 'points' ? (b.points ?? 0) - (a.points ?? 0) : b.id - a.id);

  const fmt = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    } catch { return iso; }
  };

  const totalPoints = visitors.reduce((s, v) => s + (v.points ?? 0), 0);

  return (
    <>
      <SectionTitle hint="Danh sách người dùng đã nhập tên khi vào trang. Điểm được đồng bộ tự động khi họ chơi.">
        Người Dùng
      </SectionTitle>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Tổng người dùng', value: visitors.length },
          { label: 'Tổng gem tích luỹ', value: totalPoints.toLocaleString() + ' gem' },
          { label: 'Trung bình gem', value: visitors.length ? Math.round(totalPoints / visitors.length).toLocaleString() + ' gem' : '—' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3" style={{ background: B.canvasPure, border: `1px solid ${B.hairline}` }}>
            <div className="font-ui" style={{ fontSize: 10, color: B.inkMuted, letterSpacing: '0.04em' }}>{s.label}</div>
            <div className="font-display mt-1" style={{ fontSize: 20, fontWeight: 700, color: B.ink }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <TextInput placeholder="Tìm theo tên..." value={q} onChange={e => setQ(e.target.value)} />
        <div className="flex gap-1">
          {(['points', 'joined'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className="h-8 px-3 rounded-full font-ui"
              style={{ fontSize: 11, fontWeight: 600, background: sortBy === s ? B.orange : B.canvas, color: sortBy === s ? '#fff' : B.inkMuted, border: `1px solid ${sortBy === s ? B.orange : B.hairline}` }}>
              {s === 'points' ? '↓ Gem' : '↓ Mới nhất'}
            </button>
          ))}
        </div>
        <span className="font-ui shrink-0 ml-auto" style={{ fontSize: 12, color: B.inkMuted }}>{filtered.length} / {visitors.length}</span>
        <button onClick={load} className="h-8 px-3 rounded font-ui inline-flex items-center gap-1"
          style={{ background: B.canvas, border: `1px solid ${B.hairline}`, fontSize: 12, color: B.inkMuted }}>
          <RotateCcw size={11} /> Làm mới
        </button>
      </div>

      {loading ? (
        <div className="font-ui py-8 text-center" style={{ fontSize: 13, color: B.inkMuted }}>Đang tải...</div>
      ) : visitors.length === 0 ? (
        <div className="font-ui py-8 text-center" style={{ fontSize: 13, color: B.inkSubtle }}>
          Chưa có người dùng nào. Họ sẽ xuất hiện khi ai đó nhập tên và vào trang.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((v, i) => (
            <div key={v.id} className="rounded-xl p-4" style={{ background: B.canvasPure, border: `1px solid ${B.hairline}` }}>
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-ui" style={{ fontSize: 11, color: B.inkSubtle, minWidth: 20 }}>{i + 1}.</span>
                  <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: B.ink }}>{v.name}</span>
                  {(v.points ?? 0) > 0 && (
                    <span className="px-2 py-0.5 rounded-full font-ui inline-flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, background: '#FFF3ED', color: B.orange }}>
                      {v.points.toLocaleString()} gem
                    </span>
                  )}
                </div>
                <button onClick={() => remove(v.id)} className="h-7 w-7 rounded-full grid place-items-center shrink-0"
                  style={{ background: B.canvas, border: `1px solid ${B.hairline}` }}>
                  <Trash2 size={11} style={{ color: B.inkMuted }} />
                </button>
              </div>

              {/* Info chips */}
              <div className="flex flex-wrap gap-1.5">
                {v.device && (
                  <span className="px-2 py-0.5 rounded-full font-ui" style={{ fontSize: 10, background: B.canvas, color: B.inkMuted, border: `1px solid ${B.hairline}` }}>
                    {v.device === 'mobile' ? '📱' : v.device === 'tablet' ? '📲' : '🖥'} {v.device}
                  </span>
                )}
                {v.os && (
                  <span className="px-2 py-0.5 rounded-full font-ui" style={{ fontSize: 10, background: B.canvas, color: B.inkMuted, border: `1px solid ${B.hairline}` }}>
                    {v.os}
                  </span>
                )}
                {v.browser && (
                  <span className="px-2 py-0.5 rounded-full font-ui" style={{ fontSize: 10, background: B.canvas, color: B.inkMuted, border: `1px solid ${B.hairline}` }}>
                    {v.browser}
                  </span>
                )}
                {v.language && (
                  <span className="px-2 py-0.5 rounded-full font-ui" style={{ fontSize: 10, background: B.canvas, color: B.inkMuted, border: `1px solid ${B.hairline}` }}>
                    🌐 {v.language.toUpperCase()}
                  </span>
                )}
                {v.timezone && (
                  <span className="px-2 py-0.5 rounded-full font-ui" style={{ fontSize: 10, background: B.canvas, color: B.inkMuted, border: `1px solid ${B.hairline}` }}>
                    🕐 {v.timezone}
                  </span>
                )}
                {v.screen && (
                  <span className="px-2 py-0.5 rounded-full font-ui" style={{ fontSize: 10, background: B.canvas, color: B.inkMuted, border: `1px solid ${B.hairline}` }}>
                    {v.screen}
                  </span>
                )}
                {v.referrer && (
                  <span className="px-2 py-0.5 rounded-full font-ui" style={{ fontSize: 10, background: B.canvas, color: B.inkMuted, border: `1px solid ${B.hairline}` }}>
                    🔗 {v.referrer.replace(/^https?:\/\//, '').slice(0, 30)}
                  </span>
                )}
              </div>

              {/* Timestamps */}
              <div className="flex gap-4 mt-2">
                <span className="font-ui" style={{ fontSize: 10, color: B.inkSubtle }}>
                  Tham gia: {fmt(v.joinedAt)}
                </span>
                {v.lastSeen && v.lastSeen !== v.joinedAt && (
                  <span className="font-ui" style={{ fontSize: 10, color: B.inkSubtle }}>
                    Lần cuối: {fmt(v.lastSeen)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function OnboardingPhotosSection() {
  const settings = useSettings();
  const photos = settings.onboardingPhotos ?? [];
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setErr('');
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const compressed = await compressForUpload(file, 1200, 0.88);
        await uploadOnboardingPhoto(compressed);
      } catch (e: any) {
        setErr(e?.message ?? 'Tải lên thất bại');
        break;
      }
    }
    setUploading(false);
  };

  const remove = async (id: number) => {
    if (!confirm('Xoá ảnh này?')) return;
    await deleteOnboardingPhoto(id);
  };

  return (
    <>
      <SectionTitle hint="Ảnh hiển thị trong slide onboarding. Tỉ lệ 3:4 đẹp nhất.">
        Ảnh Onboarding
      </SectionTitle>

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }} />
      <button onClick={() => fileRef.current?.click()} disabled={uploading}
        className="mb-3 h-10 px-4 rounded-full font-ui inline-flex items-center gap-2"
        style={{ background: B.orange, color: '#fff', fontSize: 13, fontWeight: 700, opacity: uploading ? 0.6 : 1 }}>
        <ImageIcon size={14} /> {uploading ? 'Đang tải lên...' : 'Thêm ảnh'}
      </button>
      {err && <div className="mb-3 font-ui" style={{ fontSize: 12, color: B.danger }}>{err}</div>}

      {photos.length === 0 ? (
        <div
          className="rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer"
          style={{ border: `2px dashed ${B.hairline}`, minHeight: 160, color: B.inkSubtle }}
          onClick={() => fileRef.current?.click()}
        >
          <ImageIcon size={32} strokeWidth={1.5} />
          <span className="font-ui" style={{ fontSize: 13 }}>Chưa có ảnh. Nhấn để upload.</span>
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
          {photos.map(p => (
            <div key={p.id} className="relative rounded-xl overflow-hidden group" style={{ aspectRatio: '3/4' }}>
              <img src={p.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                style={{ background: 'rgba(0,0,0,0.45)' }}>
                <button onClick={() => remove(p.id)}
                  className="h-8 w-8 rounded-full grid place-items-center"
                  style={{ background: '#fff' }}>
                  <Trash2 size={14} style={{ color: B.orange }} />
                </button>
              </div>
            </div>
          ))}
          <div
            className="rounded-xl flex items-center justify-center cursor-pointer transition"
            style={{ aspectRatio: '3/4', border: `2px dashed ${B.hairline}`, color: B.inkSubtle }}
            onClick={() => fileRef.current?.click()}
          >
            <Plus size={24} strokeWidth={1.5} />
          </div>
        </div>
      )}
    </>
  );
}

function SecuritySection() {
  const settings = useSettings();

  const [curUser, setCurUser] = useState('');
  const [curPw, setCurPw] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newPw1, setNewPw1] = useState('');
  const [newPw2, setNewPw2] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const ok = await verifyAdminLogin(curUser, curPw);
    if (!ok) return setMsg({ kind: 'err', text: 'Tên đăng nhập hoặc mật khẩu hiện tại sai.' });
    if (!newUser.trim()) return setMsg({ kind: 'err', text: 'Tên đăng nhập mới không được trống.' });
    if (newPw1 && newPw1.length < 4) return setMsg({ kind: 'err', text: 'Mật khẩu mới ≥ 4 ký tự.' });
    if (newPw1 && newPw1 !== newPw2) return setMsg({ kind: 'err', text: 'Xác nhận mật khẩu không khớp.' });
    await setAdminCredentials(newUser.trim(), newPw1);
    setCurUser(''); setCurPw(''); setNewUser(''); setNewPw1(''); setNewPw2('');
    setMsg({ kind: 'ok', text: 'Đã cập nhật thông tin đăng nhập.' });
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <>
      <SectionTitle hint="Đổi tên đăng nhập và mật khẩu cho trang /admin. Mặc định: admin / 123312.">
        Bảo Mật
      </SectionTitle>
      <Card>
        <div className="font-ui mb-3" style={{ fontSize: 12, color: B.inkMuted }}>
          Xác thực thông tin hiện tại trước khi đổi.
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="rounded-lg p-3 flex flex-col gap-2" style={{ background: B.canvas }}>
            <div className="font-ui" style={{ fontSize: 11, fontWeight: 700, color: B.inkMuted, letterSpacing: '0.04em' }}>HIỆN TẠI</div>
            <Field label="Tên đăng nhập hiện tại">
              <TextInput value={curUser} onChange={e => setCurUser(e.target.value)} placeholder="admin" autoCapitalize="none" />
            </Field>
            <Field label="Mật khẩu hiện tại">
              <TextInput type="password" value={curPw} onChange={e => setCurPw(e.target.value)} placeholder="123312" />
            </Field>
          </div>
          <div className="rounded-lg p-3 flex flex-col gap-2" style={{ background: B.canvas }}>
            <div className="font-ui" style={{ fontSize: 11, fontWeight: 700, color: B.inkMuted, letterSpacing: '0.04em' }}>MỚI</div>
            <Field label="Tên đăng nhập mới">
              <TextInput value={newUser} onChange={e => setNewUser(e.target.value)} placeholder="Tên đăng nhập mới..." autoCapitalize="none" />
            </Field>
            <Field label="Mật khẩu mới (≥ 4 ký tự)">
              <TextInput type="password" value={newPw1} onChange={e => setNewPw1(e.target.value)} placeholder="Mật khẩu mới..." />
            </Field>
            {newPw1 && (
              <Field label="Xác nhận mật khẩu mới">
                <TextInput type="password" value={newPw2} onChange={e => setNewPw2(e.target.value)} />
              </Field>
            )}
          </div>
          {msg && (
            <div className="font-ui" style={{ fontSize: 12, color: msg.kind === 'ok' ? '#16a34a' : B.orange }}>
              {msg.text}
            </div>
          )}
          <button type="submit" disabled={!curUser || !curPw || !newUser}
            className="h-10 px-4 rounded-full font-ui self-start inline-flex items-center gap-1.5"
            style={{ background: B.ink, color: B.canvasPure, fontSize: 13, fontWeight: 700, opacity: (!curUser||!curPw||!newUser)?0.5:1 }}>
            <Save size={14} /> Cập nhật đăng nhập
          </button>
        </form>
      </Card>
    </>
  );
}

type MakeLocation = {
  id: number;
  province_name: string;
  location_name: string;
  lat: number;
  lng: number;
  episode: number;
  region: 'north' | 'central' | 'south';
  km: number;
  date: string;
  quote: string;
  image_url: string;
  status: 'draft' | 'published';
  created_at: string;
};

function ImportMakeSection({ draft, setDraft }: SP) {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<MakeLocation[]>([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchDraftLocations();
  }, []);

  const fetchDraftLocations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/rest/v1/locations?status=eq.draft&select=*`,
        {
          headers: {
            apikey: publicAnonKey,
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      setLocations(data || []);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === locations.length) setSelected(new Set());
    else setSelected(new Set(locations.map((l) => l.id)));
  };

  const importSelected = () => {
    if (selected.size === 0) {
      alert('Chọn ít nhất 1 địa điểm để import.');
      return;
    }
    const toImport = locations.filter((l) => selected.has(l.id));
    // TODO: Map Make locations → draft.provinces + draft.subLocations
    alert(`Sẽ import ${toImport.length} địa điểm (chưa implement logic merge)`);
  };

  return (
    <>
      <SectionTitle hint="Nhập dữ liệu địa điểm từ Make.com webhook (bảng locations, status=draft).">
        Import Make
      </SectionTitle>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Workflow size={16} color={B.orange} />
            <span className="font-ui" style={{ fontSize: 14, fontWeight: 600 }}>
              Dữ liệu Draft từ Supabase
            </span>
          </div>
          <button
            onClick={fetchDraftLocations}
            disabled={loading}
            className="h-8 px-3 rounded font-ui inline-flex items-center gap-1"
            style={{
              background: B.canvas,
              border: `1px solid ${B.hairline}`,
              fontSize: 12,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RotateCcw size={12} /> {loading ? 'Đang tải...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div
            className="px-3 py-2 mb-3 rounded font-ui"
            style={{ background: '#FEE2E2', color: '#991B1B', fontSize: 12, borderRadius: B.radiusSm }}
          >
            ⚠ {error}
          </div>
        )}

        {!loading && locations.length === 0 && !error && (
          <div className="text-center py-8" style={{ color: B.inkMuted, fontSize: 13 }}>
            Không có địa điểm draft nào trong Supabase.
          </div>
        )}

        {locations.length > 0 && (
          <>
            <div className="flex gap-2 mb-3">
              <button
                onClick={selectAll}
                className="h-8 px-3 rounded font-ui"
                style={{ background: B.lime, fontSize: 12, fontWeight: 700 }}
              >
                {selected.size === locations.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
              <button
                onClick={importSelected}
                disabled={selected.size === 0}
                className="h-8 px-3 rounded font-ui"
                style={{
                  background: selected.size > 0 ? B.ink : B.canvas,
                  color: selected.size > 0 ? B.canvasPure : B.inkSubtle,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Import {selected.size > 0 && `(${selected.size})`}
              </button>
            </div>

            <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${B.hairline}` }}>
              <div
                className="grid gap-2 px-3 py-2 font-ui"
                style={{
                  gridTemplateColumns: '40px 60px 1fr 1fr 60px 80px 80px',
                  background: B.canvas,
                  fontSize: 11,
                  fontWeight: 700,
                  color: B.inkMuted,
                }}
              >
                <div></div>
                <div>ID</div>
                <div>Tỉnh</div>
                <div>Địa điểm</div>
                <div>Ep</div>
                <div>Region</div>
                <div>Km</div>
              </div>
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="grid gap-2 px-3 py-2 items-center"
                  style={{
                    gridTemplateColumns: '40px 60px 1fr 1fr 60px 80px 80px',
                    borderTop: `1px solid ${B.hairline}`,
                    background: selected.has(loc.id) ? '#FFFBEB' : 'transparent',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(loc.id)}
                    onChange={() => toggleSelect(loc.id)}
                  />
                  <div className="font-ui" style={{ fontSize: 12 }}>
                    {loc.id}
                  </div>
                  <div className="font-ui truncate" style={{ fontSize: 12 }}>
                    {loc.province_name}
                  </div>
                  <div className="font-ui truncate" style={{ fontSize: 12 }}>
                    {loc.location_name}
                  </div>
                  <div className="font-ui" style={{ fontSize: 12 }}>
                    {loc.episode}
                  </div>
                  <div className="font-ui" style={{ fontSize: 12 }}>
                    {loc.region}
                  </div>
                  <div className="font-ui" style={{ fontSize: 12 }}>
                    {loc.km}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </>
  );
}
