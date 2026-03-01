import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';

// Seating multiplier map
const SEATING_MAP = { Single: 1, Two: 2, Three: 3 };

// Color palette — architectural blueprint aesthetic
const COLORS = {
    bg: '#0a0f1a',
    panel: '#0d1321',
    gridLine: 'rgba(56, 189, 248, 0.06)',
    benchBg: 'rgba(56, 189, 248, 0.04)',
    benchBorder: 'rgba(56, 189, 248, 0.15)',
    benchHover: 'rgba(56, 189, 248, 0.12)',
    seatSingle: '#22d3ee',
    seatDouble: '#a78bfa',
    seatTriple: '#f472b6',
    podium: 'rgba(56, 189, 248, 0.08)',
    text: '#e2e8f0',
    textDim: '#64748b',
    accent: '#38bdf8',
};

const seatColor = (type) => {
    if (type === 'Three') return COLORS.seatTriple;
    if (type === 'Two') return COLORS.seatDouble;
    return COLORS.seatSingle;
};

/* ─── Single Seat SVG ─── */
const SeatIcon = ({ color, size = 18, label }) => (
    <div className="rv-seat" style={{ '--seat-c': color }}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="14" rx="3" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.2" />
            <rect x="6" y="18" width="3" height="3" rx="1" fill={color} fillOpacity="0.5" />
            <rect x="15" y="18" width="3" height="3" rx="1" fill={color} fillOpacity="0.5" />
        </svg>
        {label && <span className="rv-seat-label">{label}</span>}
    </div>
);

/* ─── Bench (group of seats) ─── */
const Bench = ({ seatingType, rowIdx, colIdx, seatStart }) => {
    const count = SEATING_MAP[seatingType] || 1;
    const color = seatColor(seatingType);

    const seats = Array.from({ length: count }, (_, s) => {
        const seatNum = seatStart + s + 1;
        const rowLetter = String.fromCharCode(65 + rowIdx);
        return `${rowLetter}${seatNum}`;
    });

    return (
        <div className="rv-bench" data-type={seatingType.toLowerCase()}>
            <div className="rv-bench-seats">
                {seats.map((label) => (
                    <SeatIcon key={label} color={color} size={count === 1 ? 40 : count === 2 ? 34 : 28} label={label} />
                ))}
            </div>
        </div>
    );
};

const RoomView = ({ room, building, onBack }) => {
    const seatingType = room.seating_type || 'Single';
    const rows = room.rows || 6;
    const cols = room.columns || 3;
    const multiplier = SEATING_MAP[seatingType] || 1;
    const totalSeats = rows * cols * multiplier;
    const color = seatColor(seatingType);

    // Build grid data
    const grid = useMemo(() => {
        return Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => ({
                rowIdx: r,
                colIdx: c,
                seatStart: (r * cols + c) * multiplier,
            }))
        );
    }, [rows, cols, multiplier]);

    return (
        <div className="rv-root">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=DM+Sans:wght@400;500;600;700&display=swap');
                .rv-root {
                    --rv-bg: ${COLORS.bg};
                    --rv-panel: ${COLORS.panel};
                    --rv-accent: ${COLORS.accent};
                    --rv-text: ${COLORS.text};
                    --rv-dim: ${COLORS.textDim};
                    font-family: 'DM Sans', sans-serif;
                    background: var(--rv-bg);
                    min-height: 100%;
                    display: flex;
                    flex-direction: column;
                    animation: rv-fadeIn 0.5s ease-out;
                }
                @keyframes rv-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

                /* Header */
                .rv-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 0 24px 0;
                    border-bottom: 1px solid rgba(56, 189, 248, 0.08);
                    margin-bottom: 24px;
                }
                .rv-back {
                    display: flex; align-items: center; gap: 8px;
                    background: none; border: none; color: var(--rv-dim);
                    cursor: pointer; font-size: 12px; text-transform: uppercase;
                    letter-spacing: 0.15em; font-family: 'JetBrains Mono', monospace;
                    transition: color 0.2s;
                }
                .rv-back:hover { color: var(--rv-accent); }
                .rv-title-block { text-align: right; }
                .rv-title {
                    font-size: 22px; font-weight: 700; color: var(--rv-text);
                    letter-spacing: -0.02em; margin: 0;
                }
                .rv-subtitle {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px; color: var(--rv-accent); margin-top: 2px;
                }

                /* Stats ribbon */
                .rv-stats {
                    display: flex; gap: 6px; flex-wrap: wrap;
                    margin-bottom: 20px;
                }
                .rv-stat {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    padding: 4px 10px;
                    border-radius: 4px;
                    background: rgba(56, 189, 248, 0.05);
                    border: 1px solid rgba(56, 189, 248, 0.1);
                    color: var(--rv-dim);
                }
                .rv-stat strong { color: var(--rv-text); font-weight: 500; }

                /* Podium */
                .rv-podium {
                    width: 60%;
                    max-width: 500px;
                    margin: 0 auto 32px;
                    height: 36px;
                    background: ${COLORS.podium};
                    border: 1px solid rgba(56, 189, 248, 0.12);
                    border-radius: 4px 4px 0 0;
                    display: flex; align-items: center; justify-content: center;
                    position: relative;
                }
                .rv-podium::after {
                    content: 'PODIUM';
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    letter-spacing: 0.35em;
                    color: rgba(56, 189, 248, 0.25);
                }

                /* Aisle labels */
                .rv-aisle-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    color: rgba(56, 189, 248, 0.3);
                    text-align: center;
                    padding: 2px 0;
                }

                /* Grid container */
                .rv-grid-wrap {
                    flex: 1;
                    overflow: auto;
                    padding: 0 8px 20px;
                }
                .rv-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-width: 100%;
                    margin: 0 auto;
                }
                .rv-row {
                    display: flex;
                    align-items: center;
                    gap: 0;
                }
                .rv-row-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    color: rgba(56, 189, 248, 0.25);
                    width: 28px;
                    text-align: center;
                    flex-shrink: 0;
                }
                .rv-row-benches {
                    display: flex;
                    gap: 16px;
                    flex: 1;
                    justify-content: center;
                }

                /* Bench */
                .rv-bench {
                    background: ${COLORS.benchBg};
                    border: 1px solid ${COLORS.benchBorder};
                    border-radius: 6px;
                    padding: 6px 8px;
                    transition: all 0.25s ease;
                    cursor: default;
                    position: relative;
                }
                .rv-bench:hover {
                    background: ${COLORS.benchHover};
                    border-color: rgba(56, 189, 248, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(56, 189, 248, 0.08);
                }
                .rv-bench[data-type="three"] {
                    border-color: rgba(244, 114, 182, 0.2);
                }
                .rv-bench[data-type="three"]:hover {
                    border-color: rgba(244, 114, 182, 0.4);
                    box-shadow: 0 4px 20px rgba(244, 114, 182, 0.08);
                }
                .rv-bench[data-type="two"] {
                    border-color: rgba(167, 139, 250, 0.2);
                }
                .rv-bench[data-type="two"]:hover {
                    border-color: rgba(167, 139, 250, 0.4);
                    box-shadow: 0 4px 20px rgba(167, 139, 250, 0.08);
                }
                .rv-bench-seats {
                    display: flex;
                    gap: 6px;
                    align-items: center;
                }

                /* Seat */
                .rv-seat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                }
                .rv-seat-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    color: var(--rv-dim);
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .rv-bench:hover .rv-seat-label { opacity: 1; }

                /* Legend */
                .rv-legend {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    padding: 16px 0;
                    border-top: 1px solid rgba(56, 189, 248, 0.06);
                    margin-top: auto;
                }
                .rv-legend-item {
                    display: flex; align-items: center; gap: 6px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px; color: var(--rv-dim);
                    text-transform: uppercase; letter-spacing: 0.08em;
                }
                .rv-legend-dot {
                    width: 8px; height: 8px; border-radius: 2px;
                }

                /* Col headers */
                .rv-col-headers {
                    display: flex; gap: 12px; justify-content: center;
                    padding-left: 28px;
                    margin-bottom: 4px;
                }
                .rv-col-header {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    color: rgba(56, 189, 248, 0.25);
                    text-align: center;
                    flex: 0 0 auto;
                }
            `}</style>

            {/* Header */}
            <div className="rv-header">
                <button onClick={onBack} className="rv-back">
                    <ArrowLeft size={16} /> Return
                </button>
                <div className="rv-title-block">
                    <h2 className="rv-title">{room.name}</h2>
                    <div className="rv-subtitle">{building.name} · Room {room.id}</div>
                </div>
            </div>

            {/* Stats */}
            <div className="rv-stats">
                <div className="rv-stat"><strong>{totalSeats}</strong> seats</div>
                <div className="rv-stat"><strong>{rows}</strong> rows × <strong>{cols}</strong> cols</div>
                <div className="rv-stat">
                    Seating: <strong style={{ color }}> {seatingType === 'Three' ? '3-seat bench' : seatingType === 'Two' ? '2-seat bench' : 'Individual'}</strong>
                </div>
                <div className="rv-stat">Floor <strong>{room.floor_id || 1}</strong></div>
            </div>

            {/* Podium */}
            <div className="rv-podium" />

            {/* Grid */}
            <div className="rv-grid-wrap">
                {/* Column headers */}
                <div className="rv-col-headers">
                    {Array.from({ length: cols }, (_, c) => (
                        <div key={c} className="rv-col-header" style={{ width: seatingType === 'Three' ? 74 : seatingType === 'Two' ? 56 : 42 }}>
                            C{c + 1}
                        </div>
                    ))}
                </div>

                <div className="rv-grid">
                    {grid.map((row, rIdx) => (
                        <div key={rIdx} className="rv-row">
                            <div className="rv-row-label">{String.fromCharCode(65 + rIdx)}</div>
                            <div className="rv-row-benches">
                                {row.map((cell) => (
                                    <Bench
                                        key={`${cell.rowIdx}-${cell.colIdx}`}
                                        seatingType={seatingType}
                                        rowIdx={cell.rowIdx}
                                        colIdx={cell.colIdx}
                                        seatStart={cell.seatStart}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="rv-legend">
                <div className="rv-legend-item">
                    <div className="rv-legend-dot" style={{ background: COLORS.seatSingle }} /> Single
                </div>
                <div className="rv-legend-item">
                    <div className="rv-legend-dot" style={{ background: COLORS.seatDouble }} /> Two-Seat
                </div>
                <div className="rv-legend-item">
                    <div className="rv-legend-dot" style={{ background: COLORS.seatTriple }} /> Three-Seat
                </div>
            </div>
        </div>
    );
};

export default RoomView;
