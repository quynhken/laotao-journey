import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

const OPTIONS = ['Hội An', 'Đà Nẵng', 'Huế', 'Phong Nha'];

export function PredictModal({ onClose, onBet }: { onClose: () => void; onBet: (province: string) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(17,17,17,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md p-6 space-y-4"
        style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-xl)' }}
      >
        <div className="text-center">
          <div className="flex justify-center mb-2" style={{ color: 'var(--accent-500)' }}>
            <Sparkles size={36} strokeWidth={1.5} />
          </div>
          <h2 className="font-display mt-1" style={{ fontSize: 22 }}>Tao Biết Mày Đi Đâu</h2>
          <p className="font-body italic" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Đoán chặng tiếp theo Lão Tào sẽ đến
          </p>
        </div>

        {done ? (
          <div className="text-center space-y-3 py-2">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'var(--accent-100)', border: '1px solid var(--accent-300)', color: 'var(--accent-600)', fontWeight: 700 }}
            >
              <Sparkles size={13} strokeWidth={2} /> Đã đặt: {picked}
            </div>
            <p className="font-body italic" style={{ color: 'var(--text-secondary)' }}>
              Chờ Lão Tào ra video tiếp theo nhé!
            </p>
            <button onClick={onClose}
              className="w-full h-11 rounded-[10px] font-ui"
              style={{ background: 'var(--accent-500)', color: '#fff', fontWeight: 700 }}>
              Đóng
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              {OPTIONS.map((o) => {
                const on = picked === o;
                return (
                  <button key={o} onClick={() => setPicked(o)}
                    className="px-4 py-3 font-ui transition"
                    style={{
                      background: on ? 'var(--accent-100)' : 'var(--bg-surface)',
                      border: `1px solid ${on ? 'var(--accent-500)' : 'var(--border-default)'}`,
                      color: on ? 'var(--accent-600)' : 'var(--text-primary)',
                      borderRadius: 'var(--radius-md)', fontWeight: 600,
                    }}>
                    {o}
                  </button>
                );
              })}
            </div>
            <button disabled={!picked}
              onClick={() => { if (picked) { onBet(picked); setDone(true); } }}
              className="w-full h-11 rounded-[10px] font-ui transition"
              style={{
                background: picked ? 'var(--accent-500)' : 'var(--bg-elevated)',
                color: picked ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                cursor: picked ? 'pointer' : 'not-allowed',
              }}>
              Đặt Cược +20đ
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
