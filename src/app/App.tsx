import { useEffect, useState } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Bike, X } from 'lucide-react';
import { Header } from './components/Header';
import { TabBar, type TabKey } from './components/TabBar';
import { MapTab } from './components/MapTab';
import { DiscoverTab } from './components/DiscoverTab';
import { FlexBookTab } from './components/FlexBookTab';
import { FeedTab } from './components/FeedTab';
import { QuizModal } from './components/QuizModal';
import { PredictModal } from './components/PredictModal';
import { AdminPage } from './components/AdminPage';
import { useSettings, pullSettings, earnViPoint } from './store';
import type { Stop } from './components/data';

type Toast = { id: number; label: string; points: number };

const router = createBrowserRouter([
  { path: '/admin', Component: AdminPage },
  { path: '*', Component: MainApp },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

function MainApp() {
  const settings = useSettings();

  useEffect(() => {
    pullSettings();
  }, []);
  const [onboarded, setOnboarded] = useState(false);
  const [name, setName] = useState('');
  const [tab, setTab] = useState<TabKey>('map');
  const points = settings.viPoint ?? 0;
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [quizStop, setQuizStop] = useState<Stop | null>(null);
  const [predictOpen, setPredictOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);

  const addPoints = (n: number, label: string) => {
    earnViPoint(n);
    const t: Toast = { id: Date.now() + Math.random(), label, points: n };
    setToasts((arr) => [...arr, t]);
    setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== t.id)), 1700);
  };

  const handleFlag = (id: number) => {
    if (flagged.has(id)) return;
    const next = new Set(flagged);
    next.add(id);
    setFlagged(next);
    addPoints(100, 'Cắm Cờ');
  };

  if (!onboarded) {
    return <Onboarding name={name} setName={setName} onStart={() => setOnboarded(true)} />;
  }

  return (
    <div className="min-h-dvh lg:h-dvh lg:overflow-hidden w-full flex justify-center" style={{ background: 'var(--bg-warm)' }}>
      {/* Mobile layout (≤lg) — unchanged tab-based UI */}
      <div
        className="lg:hidden w-full max-w-[480px] flex flex-col"
        style={{ background: 'var(--bg-warm)', minHeight: '100dvh' }}
      >
        <Header currentStop={settings.header.currentStop} points={points} onPredict={() => setPredictOpen(true)} />

        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              {tab === 'map' && <MapTab flagged={flagged} onFlag={handleFlag} onQuiz={(s) => setQuizStop(s)} />}
              {tab === 'discover' && (
                <div className="overflow-y-auto no-scrollbar" style={{ height: 'calc(100dvh - 56px - 60px)' }}>
                  <DiscoverTab onAction={() => {}} onAddPoints={addPoints} />
                </div>
              )}
              {tab === 'flex' && (
                <div className="overflow-y-auto no-scrollbar" style={{ height: 'calc(100dvh - 56px - 60px)' }}>
                  <FlexBookTab flagged={flagged} points={points} />
                </div>
              )}
              {tab === 'feed' && (
                <div className="overflow-y-auto no-scrollbar" style={{ height: 'calc(100dvh - 56px - 60px)' }}>
                  <FeedTab />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <TabBar active={tab} onChange={setTab} />
      </div>

      {/* Desktop layout (≥lg) — 3 columns: Feed | Map | Discover+FlexBook */}
      <div className="hidden lg:flex w-full max-w-[1600px] flex-col" style={{ height: '100dvh', overflow: 'hidden' }}>
        <Header currentStop={settings.header.currentStop} points={points} onPredict={() => setPredictOpen(true)} onDiscover={() => setDiscoverOpen(true)} />
        <main
          className="flex-1 grid gap-3 p-3 overflow-hidden min-h-0"
          style={{ gridTemplateColumns: 'minmax(300px, 1fr) minmax(440px, 1.7fr) minmax(340px, 1fr)' }}
        >
          <section
            className="overflow-y-auto no-scrollbar rounded-2xl"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <FeedTab />
          </section>
          <section
            className="overflow-hidden rounded-2xl h-full"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <MapTab flagged={flagged} onFlag={handleFlag} onQuiz={(s) => setQuizStop(s)} />
          </section>
          <section
            className="overflow-y-auto no-scrollbar rounded-2xl relative"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <FlexBookTab flagged={flagged} points={points} />
          </section>
        </main>
      </div>

      {/* Discover modal — desktop only */}
      <AnimatePresence>
        {discoverOpen && (
          <motion.div
            className="fixed inset-0 z-50 hidden lg:flex items-center justify-center"
            style={{ background: 'rgba(17,17,17,0.5)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setDiscoverOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full overflow-y-auto no-scrollbar"
              style={{ maxWidth: 420, maxHeight: '88dvh', background: 'var(--bg-warm)', borderRadius: 'var(--radius-xl)', boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-1">
                <span className="font-display" style={{ fontSize: 17, fontWeight: 700 }}>Khám Phá Địa Điểm</span>
                <button
                  onClick={() => setDiscoverOpen(false)}
                  className="grid place-items-center rounded-full"
                  style={{ width: 32, height: 32, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  <X size={15} strokeWidth={2.5} />
                </button>
              </div>
              <DiscoverTab onAction={() => {}} onAddPoints={addPoints} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast — shared across mobile & desktop */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id}
              initial={{ y: -16, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="px-4 py-2 rounded-full font-ui"
              style={{
                background: 'var(--accent-500)', color: '#fff',
                fontSize: 13, fontWeight: 700,
                boxShadow: '0 4px 16px rgba(255,99,31,0.35)',
              }}>
              +{t.points}đ · {t.label}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {quizStop && (
        <QuizModal
          placeName={quizStop.name}
          onClose={() => setQuizStop(null)}
          onComplete={(c) => addPoints(c * 50, `Quiz ${c} đúng`)}
        />
      )}
      {predictOpen && (
        <PredictModal
          onClose={() => setPredictOpen(false)}
          onBet={() => addPoints(20, 'Đặt cược')}
        />
      )}
    </div>
  );
}

function Onboarding({ name, setName, onStart }: {
  name: string; setName: (s: string) => void; onStart: () => void;
}) {
  const [bikeX, setBikeX] = useState(-40);
  useEffect(() => {
    const id = setInterval(() => setBikeX((x) => (x > 110 ? -40 : x + 1.5)), 40);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-dvh w-full flex justify-center paper-noise"
      style={{ background: 'var(--bg-warm)' }}>
      <div className="w-full max-w-[480px] flex flex-col px-6 py-10">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
            style={{ background: 'var(--accent-100)', border: '1px solid var(--accent-300)', color: 'var(--accent-600)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>
            <Bike size={13} strokeWidth={2} /> COMPANION APP
          </div>
          <h1 className="font-display" style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Sổ Tay<br />Hành Trình<br />Của <span style={{ color: 'var(--accent-500)' }}>Lão Tào</span>
          </h1>
          <p className="font-body italic mt-4" style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            "Thôi đi thôi."
          </p>
          <p className="font-ui mt-2" style={{ color: 'var(--text-tertiary)', fontSize: 13, maxWidth: 320 }}>
            Không tốn tiền vé. Không xin phép sếp. Không lo say xe.
          </p>

          <div className="relative w-full mt-10 h-12">
            <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: 'var(--border-default)' }} />
            <div
              className="absolute flex items-center justify-center"
              style={{
                left: `${bikeX}%`, top: 0,
                color: 'var(--accent-600)',
                transition: 'left 40ms linear',
                width: 32, height: 48,
              }}
            >
              <Bike size={26} strokeWidth={1.8} />
            </div>
          </div>

          <div className="w-full mt-10 space-y-3">
            <div className="font-ui text-left" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Bạn tên gì để Lão Tào gọi?
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Tèo"
              className="w-full h-12 px-4 outline-none font-ui"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}
            />
            <button onClick={onStart}
              className="w-full h-12 rounded-[10px] font-ui transition"
              style={{ background: 'var(--accent-500)', color: '#fff', fontWeight: 700, fontSize: 15, boxShadow: '0 4px 16px rgba(255,99,31,0.3)' }}>
              Bắt Đầu Đi Ké →
            </button>
          </div>
        </div>

        <div className="text-center mt-6 font-ui" style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>
          HÀ NỘI → SÀI GÒN · 1.726 KM
        </div>
      </div>
    </div>
  );
}
