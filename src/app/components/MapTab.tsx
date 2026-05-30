import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import { motion, AnimatePresence } from 'motion/react';
import { Flag, HelpCircle, Play, X, Lock, MousePointer2, Bike, ChevronLeft, ChevronRight, MapPin, Locate } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { type Province, type SubLocation } from './data';
import { useSettings } from '../store';
import { ImageWithFallback } from './figma/ImageWithFallback';

type Props = {
  flagged: Set<number>;
  onFlag: (id: number) => void;
  onQuiz: (stop: SubLocation) => void;
};

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const DEFAULT_VIEW = { longitude: 106.5, latitude: 16.5, zoom: 4.6 };

// Marching-ants dash sequence
const DASH_SEQ: number[][] = [
  [3,3],[2.5,3.5],[2,4],[1.5,4.5],[1,5],[0.5,5.5],[0,6],[0.5,5.5],[1,5],[1.5,4.5],[2,4],[2.5,3.5],
];

const SUB_LINE_PREFIX = 'sub-line-ep';
const SUB_SRC_PREFIX  = 'sub-src-ep';

export function MapTab({ flagged, onFlag, onQuiz }: Props) {
  const settings = useSettings();
  const { trip: { totalKm: TOTAL_KM, currentKm: CURRENT_KM } } = settings;
  const PROVINCES = settings.provinces;
  const SUB_LOCATIONS = settings.subLocations;

  // Initial view: center on currentStop province, fallback to Vietnam center
  const INIT_VIEW = useMemo(() => {
    const stop = settings.header.currentStop;
    const prov = PROVINCES.find(p => p.name === stop);
    return prov
      ? { longitude: prov.lng, latitude: prov.lat, zoom: 5 }
      : DEFAULT_VIEW;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — intentionally fixed on mount
  const PRIMARY = '#FF631F';
  const EPISODE_COLOR_MAP = new Proxy({} as Record<number, string>, { get: () => PRIMARY });
  const provColor = (p: Province) => p.status === 'locked' ? '#C4BBAF' : PRIMARY;
  const subColor = (s: SubLocation) => s.status === 'locked' ? '#C4BBAF' : PRIMARY;
  const [level, setLevel]                   = useState<'provinces' | 'sub'>('provinces');
  const [activeProvince, setActiveProvince] = useState<Province | null>(null);
  const [selected, setSelected]             = useState<SubLocation | null>(null);
  const [filterChip, setFilterChip]         = useState<number>(0); // 0=all; provinceId in lvl1; episodeNum in lvl2

  const mapGLRef = useRef<any>(null);
  const animRef  = useRef<number>(0);

  const progressPct = (CURRENT_KM / TOTAL_KM) * 100;

  // Sub-locations for the active province
  const provinceSubs = useMemo(
    () => activeProvince ? SUB_LOCATIONS.filter(s => s.provinceId === activeProvince.id) : [],
    [activeProvince, SUB_LOCATIONS],
  );

  // Episodes that visit the active province
  const provinceEpisodes = useMemo(
    () => [...new Set(provinceSubs.map(s => s.episode))].sort(),
    [provinceSubs],
  );

  // Sub-locations visible in level-2 (filtered by episode chip)
  const visibleSubs = useMemo(
    () => filterChip === 0 ? provinceSubs : provinceSubs.filter(s => s.episode === filterChip),
    [provinceSubs, filterChip],
  );

  // ── Dash animation ──────────────────────────────────────────────────────
  useEffect(() => {
    let step = 0;
    let lastT = 0;
    const tick = (t: number) => {
      if (t - lastT > 130) {
        lastT = t;
        step = (step + 1) % DASH_SEQ.length;
        const map = mapGLRef.current;
        if (map) {
          for (let ep = 1; ep <= 7; ep++) {
            const id = `${SUB_LINE_PREFIX}${ep}`;
            if (map.getLayer(id)) map.setPaintProperty(id, 'line-dasharray', DASH_SEQ[step]);
          }
        }
      }
      animRef.current = requestAnimationFrame(tick);
    };
    const t = setTimeout(() => { animRef.current = requestAnimationFrame(tick); }, 800);
    return () => { clearTimeout(t); cancelAnimationFrame(animRef.current); };
  }, []);

  // ── Add/remove episode dashed lines for the current province ──────────
  const applySubLines = useCallback((subs: SubLocation[]) => {
    const map = mapGLRef.current;
    if (!map) return;

    // Remove previous sub lines
    for (let ep = 1; ep <= 7; ep++) {
      if (map.getLayer(`${SUB_LINE_PREFIX}${ep}`)) map.removeLayer(`${SUB_LINE_PREFIX}${ep}`);
      if (map.getSource(`${SUB_SRC_PREFIX}${ep}`)) map.removeSource(`${SUB_SRC_PREFIX}${ep}`);
    }

    // Group by episode and add lines
    const groups: Record<number, [number, number][]> = {};
    subs.forEach(s => {
      if (!groups[s.episode]) groups[s.episode] = [];
      groups[s.episode][s.locNum - 1] = [s.lng, s.lat];
    });

    Object.entries(groups).forEach(([ep, coords]) => {
      const validCoords = coords.filter(Boolean);
      if (validCoords.length < 2) return;
      const epNum = Number(ep);
      const color = EPISODE_COLOR_MAP[epNum] ?? '#9A948C';
      map.addSource(`${SUB_SRC_PREFIX}${ep}`, {
        type: 'geojson',
        data: { type: 'Feature', geometry: { type: 'LineString', coordinates: validCoords }, properties: {} },
      });
      map.addLayer({
        id: `${SUB_LINE_PREFIX}${ep}`,
        type: 'line',
        source: `${SUB_SRC_PREFIX}${ep}`,
        paint: { 'line-color': color, 'line-width': 2, 'line-dasharray': [3, 3], 'line-opacity': 0.9 },
      });
    });
  }, [EPISODE_COLOR_MAP]);

  const clearSubLines = useCallback(() => {
    const map = mapGLRef.current;
    if (!map) return;
    for (let ep = 1; ep <= 7; ep++) {
      if (map.getLayer(`${SUB_LINE_PREFIX}${ep}`)) map.removeLayer(`${SUB_LINE_PREFIX}${ep}`);
      if (map.getSource(`${SUB_SRC_PREFIX}${ep}`)) map.removeSource(`${SUB_SRC_PREFIX}${ep}`);
    }
  }, []);

  // ── Province click → drill down ──────────────────────────────────────
  const handleProvinceClick = useCallback((p: Province, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveProvince(p);
    setLevel('sub');
    setSelected(null);
    setFilterChip(0);
    const subs = SUB_LOCATIONS.filter(s => s.provinceId === p.id);
    // Fly to the highest-locNum sublocation (furthest point), fallback to province center
    const topSub = subs.length > 0 ? subs.reduce((a, b) => b.locNum > a.locNum ? b : a) : null;
    const center: [number, number] = topSub ? [topSub.lng, topSub.lat] : [p.lng, p.lat];
    mapGLRef.current?.flyTo({ center, zoom: 12, duration: 700 });
    setTimeout(() => applySubLines(subs), 100);
  }, [applySubLines, SUB_LOCATIONS]);

  // ── Back to level 1 ──────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    clearSubLines();
    setLevel('provinces');
    setActiveProvince(null);
    setSelected(null);
    setFilterChip(0);
    mapGLRef.current?.flyTo({ center: [INIT_VIEW.longitude, INIT_VIEW.latitude], zoom: INIT_VIEW.zoom, duration: 700 });
  }, [clearSubLines]);

  // ── Chip click ───────────────────────────────────────────────────────
  const handleChip = (val: number) => {
    setFilterChip(val);
    if (level === 'provinces' && val > 0) {
      const p = PROVINCES.find(p => p.id === val);
      if (p) {
        handleProvinceClick(p, { stopPropagation: () => {} } as any);
      }
    }
  };

  useEffect(() => {
    if (level === 'sub' && activeProvince) applySubLines(provinceSubs);
  }, [level, activeProvince, provinceSubs, EPISODE_COLOR_MAP, applySubLines]);

  const isFlagged = (s: SubLocation) => flagged.has(s.id) || s.status === 'flagged';
  const [imgIdx, setImgIdx] = useState(0);
  useEffect(() => { setImgIdx(0); }, [selected?.id]);

  // Provinces to show as chips depend on filter
  const visibleProvinces = level === 'provinces'
    ? (filterChip === 0 ? PROVINCES : PROVINCES.filter(p => p.id === filterChip))
    : [];

  return (
    <div className="relative" style={{ height: '100%' }}>

      {/* ── Map ── */}
      <Map
        initialViewState={INIT_VIEW}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setSelected(null)}
        onLoad={(e) => { mapGLRef.current = e.target; }}
      >
        <NavigationControl position="top-right" style={{ marginTop: 80, marginRight: 12 }} />

        {/* ── Level 1: Province markers ── */}
        {level === 'provinces' && PROVINCES.map(p => {
          const color = provColor(p);
          const isActive = activeProvince?.id === p.id;
          return (
            <Marker key={`prov-${p.id}`} longitude={p.lng} latitude={p.lat} anchor="center">
              <button
                onClick={(e) => handleProvinceClick(p, e)}
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  cursor: 'pointer', overflow: 'visible', padding: 0,
                  background: 'transparent', flexShrink: 0,
                  transition: 'all 200ms cubic-bezier(0.34,1.56,0.64,1)',
                  zIndex: isActive ? 10 : 1,
                }}
                aria-label={p.name}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: 40, height: 40,
                  borderRadius: '50%', overflow: 'hidden',
                  border: `2.5px solid ${color}`,
                  boxShadow: `0 2px 10px rgba(0,0,0,0.18)`,
                  background: '#F7F3EE',
                }}>
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: p.status === 'locked' ? 0.4 : 1 }} />
                  {p.status === 'locked' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock size={10} strokeWidth={2.5} color={color} />
                    </div>
                  )}
                </div>
                {/* Province number badge */}
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  minWidth: 16, height: 16, borderRadius: 8,
                  background: color, color: '#fff',
                  fontSize: 8, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  border: '1.5px solid #fff', padding: '0 3px', lineHeight: 1, zIndex: 3,
                }}>
                  {SUB_LOCATIONS.filter(s => s.provinceId === p.id).length}
                </span>
              </button>
            </Marker>
          );
        })}

        {/* ── Level 2: Sub-location markers ── */}
        {level === 'sub' && visibleSubs.map(s => {
          const locked = s.status === 'locked';
          const color  = subColor(s);
          const isSel  = selected?.id === s.id;
          return (
            <Marker key={`sub-${s.id}`} longitude={s.lng} latitude={s.lat} anchor="center">
              <button
                onClick={(e) => { e.stopPropagation(); setSelected(sel => sel?.id === s.id ? null : s); }}
                style={{
                  width: isSel ? 44 : 36, height: isSel ? 44 : 36,
                  borderRadius: '50%', cursor: 'pointer',
                  overflow: 'visible', padding: 0, background: 'transparent', flexShrink: 0,
                  transition: 'all 200ms cubic-bezier(0.34,1.56,0.64,1)',
                  zIndex: isSel ? 10 : 1,
                }}
                aria-label={s.name}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  width: isSel ? 44 : 36, height: isSel ? 44 : 36,
                  borderRadius: '50%', overflow: 'hidden',
                  border: `2.5px solid ${color}`,
                  boxShadow: isSel ? `0 0 0 4px ${color}30, 0 4px 16px rgba(0,0,0,0.22)` : '0 2px 8px rgba(0,0,0,0.14)',
                  background: '#F7F3EE',
                  flexShrink: 0,
                }}>
                  <img src={s.image} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: locked ? 0.4 : 1 }} />
                  {locked && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock size={11} strokeWidth={2.5} color={color} />
                    </div>
                  )}
                </div>
                {/* locNum badge */}
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  minWidth: 16, height: 16, borderRadius: 8,
                  background: color, color: '#fff',
                  fontSize: 8, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Be Vietnam Pro', sans-serif",
                  border: '1.5px solid #fff', padding: '0 3px', lineHeight: 1, zIndex: 3,
                }}>
                  {s.locNum}
                </span>
              </button>
            </Marker>
          );
        })}
      </Map>

      {/* ── Recenter button ── */}
      <button
        onClick={() => mapGLRef.current?.flyTo({ center: [DEFAULT_VIEW.longitude, DEFAULT_VIEW.latitude], zoom: DEFAULT_VIEW.zoom, duration: 700 })}
        className="absolute grid place-items-center rounded-full"
        style={{
          right: 12, top: '50%', transform: 'translateY(-50%)',
          width: 36, height: 36,
          background: 'rgba(253,250,246,0.93)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(216,210,200,0.8)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          color: 'var(--accent-600)', zIndex: 5,
        }}
        aria-label="Về trung tâm"
      >
        <Locate size={16} strokeWidth={2} />
      </button>

      {/* ── Progress overlay ── */}
      <div className="absolute left-3 right-3" style={{
        top: 12, background: 'rgba(253,250,246,0.93)', backdropFilter: 'blur(10px)',
        borderRadius: 12, border: '1px solid rgba(216,210,200,0.8)', padding: '10px 14px', zIndex: 5,
      }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-ui" style={{ fontSize: 10, letterSpacing: '0.07em', color: 'var(--text-tertiary)', fontWeight: 600 }}>TIẾN ĐỘ HÀNH TRÌNH</span>
          <span className="font-ui" style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600 }}>{CURRENT_KM} / {TOTAL_KM} km</span>
        </div>
        <div className="relative h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg,#FFBA80 0%,#FF7B40 60%,#FF631F 100%)', transition: 'width 800ms ease' }} />
          <div className="absolute flex items-center justify-center" style={{ left: `${progressPct}%`, top: '50%', transform: 'translate(-50%,-50%)', color: 'var(--accent-600)', animation: 'floatBike 2s ease-in-out infinite' }}>
            <Bike size={14} strokeWidth={2} />
          </div>
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="font-ui" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>HÀ NỘI</span>
          <span className="font-ui" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>SÀI GÒN</span>
        </div>
      </div>

      {/* ── Level-2 back button + province name ── */}
      <AnimatePresence>
        {level === 'sub' && activeProvince && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute left-3 flex items-center gap-2"
            style={{ top: 88, zIndex: 5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full font-ui"
              style={{ background: 'rgba(253,250,246,0.93)', backdropFilter: 'blur(8px)', border: '1px solid rgba(216,210,200,0.7)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <ChevronLeft size={13} strokeWidth={2.5} />
              Tất cả tỉnh
            </button>
            <span className="px-3 py-1.5 rounded-full font-ui" style={{
              background: EPISODE_COLOR_MAP[activeProvince.episode] ?? 'var(--accent-500)',
              color: '#fff', fontSize: 12, fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
              {activeProvince.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hint when nothing selected (level 1 only) ── */}
      <AnimatePresence>
        {level === 'provinces' && !selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.5, duration: 0.25 }}
            className="absolute left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-ui"
            style={{ top: 88, background: 'rgba(253,250,246,0.93)', backdropFilter: 'blur(8px)', border: '1px solid rgba(216,210,200,0.7)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', zIndex: 5, whiteSpace: 'nowrap' }}
          >
            <MousePointer2 size={13} strokeWidth={2.5} style={{ color: 'var(--accent-500)' }} />
            Chọn tỉnh thành để khám phá
          </motion.div>
        )}
      </AnimatePresence>


      {/* ── Filter chips ── */}
      <div className="absolute left-3 right-3" style={{ bottom: 12, zIndex: 5 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-0.5 py-1.5">
          {level === 'provinces' ? (
            /* Level 1: 34 province chips */
            <>
              {PROVINCES.map(p => {
                const active = filterChip === p.id;
                const color  = EPISODE_COLOR_MAP[p.episode] ?? '#9A948C';
                return (
                  <button key={p.id} onClick={(e) => { e.stopPropagation(); handleChip(p.id); }}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-ui"
                    style={{ background: active ? color : 'rgba(253,250,246,0.93)', border: `1.5px solid ${active ? color : 'rgba(216,210,200,0.9)'}`, color: active ? '#fff' : p.status==='locked' ? 'var(--text-tertiary)' : color, fontSize: 11, fontWeight: 700, backdropFilter: 'blur(8px)', boxShadow: active ? `0 2px 8px ${color}40` : '0 1px 4px rgba(0,0,0,0.08)', opacity: p.status==='locked' && !active ? 0.7 : 1, transition: 'all 150ms ease' }}>
                    <MapPin size={9} strokeWidth={2.5} style={{ flexShrink: 0, color: active ? 'rgba(255,255,255,0.9)' : p.status==='locked' ? 'var(--text-tertiary)' : color }} />
                    {p.name}
                  </button>
                );
              })}
            </>
          ) : (
            /* Level 2: episode chips for this province */
            <>
              {provinceEpisodes.map(ep => {
                const active = filterChip === ep;
                const color  = EPISODE_COLOR_MAP[ep] ?? '#9A948C';
                return (
                  <button key={ep} onClick={(e) => { e.stopPropagation(); setFilterChip(active ? 0 : ep); }}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-ui"
                    style={{ background: active ? color : 'rgba(253,250,246,0.93)', border: `1.5px solid ${active ? color : 'rgba(216,210,200,0.9)'}`, color: active ? '#fff' : color, fontSize: 11, fontWeight: 700, backdropFilter: 'blur(8px)', boxShadow: active ? `0 2px 8px ${color}40` : '0 1px 4px rgba(0,0,0,0.08)', transition: 'all 150ms ease' }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background: active ? 'rgba(255,255,255,0.75)' : color, display:'inline-block', flexShrink:0 }} />
                    Tập {String(ep).padStart(2,'0')}
                  </button>
                );
              })}
              {/* Sub-location name chips */}
              {visibleSubs.map(s => {
                const active = selected?.id === s.id;
                const color  = subColor(s);
                return (
                  <button key={s.id} onClick={(e) => { e.stopPropagation(); setSelected(sel => sel?.id===s.id ? null : s); mapGLRef.current?.flyTo({ center:[s.lng,s.lat], zoom:12, duration:500 }); }}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-ui"
                    style={{ background: active ? color : 'rgba(253,250,246,0.93)', border: `1.5px solid ${active ? color : 'rgba(216,210,200,0.9)'}`, color: active ? '#fff' : s.status==='locked' ? 'var(--text-tertiary)' : color, fontSize: 11, fontWeight: 700, backdropFilter: 'blur(8px)', boxShadow: active ? `0 2px 8px ${color}40` : '0 1px 4px rgba(0,0,0,0.08)', opacity: s.status==='locked' && !active ? 0.7 : 1, transition: 'all 150ms ease' }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background: active ? 'rgba(255,255,255,0.75)' : s.status==='locked' ? 'var(--text-tertiary)' : color, display:'inline-block', flexShrink:0 }} />
                    {s.locNum}. {s.name}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ── Popup card (sub-location detail) ── */}
      <AnimatePresence>
        {selected && (
          <div
            className="absolute"
            style={{ left: 12, right: 12, bottom: 68, display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.34, 1.2, 0.64, 1] }}
            className="overflow-hidden"
            style={{
              width: 320, maxWidth: '100%',
              background: 'var(--bg-base)',
              borderRadius: 20,
              boxShadow: '0 8px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)',
              pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            {(() => {
              const ytId = selected.videoUrl?.match(/(?:v=|youtu\.be\/|shorts\/)([^&?/\s]+)/)?.[1];
              const ytThumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;
              const uploadedImgs = (selected.images ?? (selected.image ? [selected.image] : [])).filter(Boolean);
              const allImgs = [...(ytThumb ? [ytThumb] : []), ...uploadedImgs];
              const clampedIdx = Math.min(imgIdx, Math.max(0, allImgs.length - 1));
              const currentImg = allImgs[clampedIdx] ?? '';
              const isVideo = clampedIdx === 0 && !!ytId;
              const hasMultiple = allImgs.length > 1;
              return (
            <div className="relative overflow-hidden" style={{ aspectRatio: '2/1' }}>
              <ImageWithFallback
                src={currentImg}
                alt={selected.name}
                className="w-full h-full object-cover"
              />
              {isVideo && (
                <div className="absolute inset-0 grid place-items-center" style={{ pointerEvents: 'none' }}>
                  <div className="grid place-items-center rounded-full"
                    style={{ width: 36, height: 36, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    <Play size={14} fill="#fff" strokeWidth={0} />
                  </div>
                </div>
              )}
              {/* Gradient overlay — pointer-events none so it doesn't block buttons */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(10,10,10,0.55) 0%,transparent 55%)', pointerEvents: 'none' }} />

              {/* Prev / Next buttons — above gradient */}
              {hasMultiple && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i - 1 + allImgs.length) % allImgs.length); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center rounded-full"
                    style={{ width: 30, height: 30, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#fff', zIndex: 2 }}>
                    <ChevronLeft size={15} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i + 1) % allImgs.length); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center rounded-full"
                    style={{ width: 30, height: 30, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', color: '#fff', zIndex: 2 }}>
                    <ChevronRight size={15} strokeWidth={2.5} />
                  </button>
                </>
              )}

              {/* Top-left badges */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full font-ui" style={{ background: PRIMARY, color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>
                  TẬP {String(selected.episode).padStart(2,'0')}
                </span>
                <span className="px-2 py-0.5 rounded-full font-ui" style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--text-primary)', fontSize: 10, fontWeight: 700 }}>
                  #{selected.locNum}
                </span>
              </div>

              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 grid place-items-center rounded-full"
                style={{ width: 28, height: 28, background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(4px)', color: '#fff' }}
              >
                <X size={14} strokeWidth={2.5} />
              </button>

              {/* Dots indicator */}
              {hasMultiple && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1" style={{ pointerEvents: 'none' }}>
                  {allImgs.map((_, i) => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i === clampedIdx ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'background 200ms' }} />
                  ))}
                </div>
              )}

              {/* Date badge bottom-right */}
              {selected.status !== 'locked' && selected.date && selected.date !== '—' && (
                <div className="absolute bottom-2.5 right-3 font-ui" style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {selected.date}
                </div>
              )}

              {/* Locked overlay */}
              {selected.status === 'locked' && (
                <div className="absolute inset-0 grid place-items-center" style={{ background: 'rgba(237,232,224,0.82)', backdropFilter: 'blur(6px)' }}>
                  <div className="text-center">
                    <Lock size={24} strokeWidth={1.5} style={{ color: 'var(--text-tertiary)', margin: '0 auto 4px' }} />
                    <div className="font-ui" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>VÙNG CHƯA PHÁ ĐẢO</div>
                  </div>
                </div>
              )}
            </div>
              );
            })()}

            {/* Info — layout giống FeedTab card */}
            <div className="px-4 pt-3 pb-3">
              {/* Province · date chip */}
              <div className="font-ui inline-flex items-center gap-1 mb-1"
                style={{ fontSize: 11, letterSpacing: '0.05em', color: 'var(--text-tertiary)' }}>
                <MapPin size={10} strokeWidth={2.5} />
                {selected.province.toUpperCase()}
                {selected.date && selected.date !== '—' && ` · ${selected.date}`}
              </div>

              {/* Title: video title if available, else location name */}
              <h2 className="font-display line-clamp-2" style={{ fontSize: 16, lineHeight: 1.25, fontWeight: 700, marginBottom: selected.videoUrl ? 4 : 0 }}>
                {selected.videoTitle || selected.name}
              </h2>

              {/* Sub-info: if video, show location name below title; else show quote */}
              {selected.videoUrl && selected.videoTitle && (
                <div className="font-ui" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  📍 {selected.name}
                </div>
              )}
              {!selected.videoUrl && selected.quote && selected.quote !== '"..."' && (
                <p className="font-body italic mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5 }}>
                  {selected.quote.replace(/"/g, '')}
                </p>
              )}

              {selected.status !== 'locked' && (
                <div className="flex gap-2 mt-3">
                  {isFlagged(selected) ? (
                    <button disabled className="h-9 px-3 rounded-full font-ui inline-flex items-center gap-1.5 flex-1 justify-center"
                      style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)', fontSize: 12, fontWeight: 700 }}>
                      <Flag size={12} strokeWidth={2.5} /> Đã Cắm Cờ
                    </button>
                  ) : (
                    <button onClick={() => onFlag(selected.id)} className="h-9 px-3 rounded-full font-ui inline-flex items-center gap-1.5 flex-1 justify-center"
                      style={{ background: 'var(--accent-500)', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                      <Flag size={12} strokeWidth={2.5} /> Cắm Cờ
                    </button>
                  )}
                  {selected.showQuiz !== false && (
                    <button onClick={() => onQuiz(selected)} className="h-9 px-3 rounded-full font-ui inline-flex items-center gap-1"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }}>
                      <HelpCircle size={12} strokeWidth={2} /> Quiz
                    </button>
                  )}
                  {selected.videoUrl && (
                    <a href={selected.videoUrl} target="_blank" rel="noopener noreferrer"
                      className="h-9 px-3 rounded-full font-ui inline-flex items-center gap-1"
                      style={{ background: '#FF0000', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                      <Play size={11} fill="#fff" strokeWidth={0} /> Xem
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
