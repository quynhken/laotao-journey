import { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Frown } from 'lucide-react';

type Q = { q: string; options: string[]; correct: number };

const QUESTIONS: Q[] = [
  { q: 'Đèo Mã Pí Lèng nằm trên cung đường nào nối Đồng Văn với địa danh nào?', options: ['Mèo Vạc', 'Yên Minh', 'Quản Bạ', 'Lũng Cú'], correct: 0 },
  { q: 'Sông chảy bên dưới đèo Mã Pí Lèng tên là gì?', options: ['Sông Lô', 'Sông Gâm', 'Sông Nho Quế', 'Sông Hồng'], correct: 2 },
  { q: 'Đèo Mã Pí Lèng có chiều dài khoảng bao nhiêu km?', options: ['10 km', '20 km', '50 km', '100 km'], correct: 1 },
];

export function QuizModal({ placeName, onClose, onComplete }: {
  placeName: string; onClose: () => void; onComplete: (correctCount: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUESTIONS[idx];

  const handlePick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === q.correct;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 >= QUESTIONS.length) {
        setDone(true);
        onComplete(correct ? score + 1 : score);
      } else {
        setIdx(idx + 1);
        setPicked(null);
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(17,17,17,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md overflow-hidden"
        style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-xl)' }}
      >
        <div className="flex items-center justify-between px-5 py-3"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="font-ui" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
            QUIZ · {placeName.toUpperCase()}
          </div>
          {!done && (
            <div className="px-2 py-0.5 rounded-full font-ui"
              style={{ background: 'var(--accent-100)', color: 'var(--accent-600)', fontSize: 11, fontWeight: 700 }}>
              {idx + 1}/{QUESTIONS.length}
            </div>
          )}
        </div>

        <div className="p-6">
          {done ? (
            <div className="text-center space-y-3">
              <div className="flex justify-center" style={{ color: score >= 2 ? 'var(--accent-500)' : 'var(--text-tertiary)' }}>
                {score >= 2
                  ? <Trophy size={52} strokeWidth={1.5} />
                  : <Frown size={52} strokeWidth={1.5} />
                }
              </div>
              <h2 className="font-display" style={{ fontSize: 22 }}>
                {score}/{QUESTIONS.length} câu đúng
              </h2>
              <p className="font-body italic" style={{ color: 'var(--text-secondary)' }}>
                +{score * 50} Flex Điểm
              </p>
              <button onClick={onClose}
                className="w-full h-11 rounded-[10px] font-ui mt-2"
                style={{ background: 'var(--accent-500)', color: '#fff', fontWeight: 700 }}>
                Tiếp Tục
              </button>
            </div>
          ) : (
            <>
              <p className="font-body" style={{ fontSize: 17, lineHeight: 1.5, color: 'var(--text-primary)' }}>
                {q.q}
              </p>
              <div className="space-y-2 mt-4">
                {q.options.map((o, i) => {
                  const isPicked = picked === i;
                  const isCorrect = picked !== null && i === q.correct;
                  const isWrong = isPicked && i !== q.correct;
                  let bg = 'var(--bg-surface)', border = 'var(--border-default)', color = 'var(--text-primary)';
                  if (isCorrect) { bg = 'var(--success-bg)'; border = 'var(--success)'; color = 'var(--success)'; }
                  else if (isWrong) { bg = 'var(--danger-bg)'; border = 'var(--danger)'; color = 'var(--danger)'; }
                  return (
                    <button key={i} onClick={() => handlePick(i)} disabled={picked !== null}
                      className="w-full text-left px-4 py-3 transition font-ui"
                      style={{ background: bg, border: `1px solid ${border}`, borderRadius: 'var(--radius-md)', color, fontWeight: 600 }}>
                      {String.fromCharCode(65 + i)}. {o}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
