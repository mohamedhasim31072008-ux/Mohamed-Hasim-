import { useState } from 'react';
import type { MonthlyCirculation } from '../types/library';

interface CirculationChartProps {
  data: MonthlyCirculation[];
}

export function CirculationChart({ data }: CirculationChartProps) {
  const [range, setRange] = useState<'6m' | '12m'>('12m');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const visibleData = range === '6m' ? data.slice(-6) : data;
  const maxVal = Math.max(
    320,
    ...visibleData.map((d) => Math.max(d.checkouts, d.returns))
  );

  const chartHeight = 200;
  const chartWidth = 680;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 28;
  const innerWidth = chartWidth - padLeft - padRight;
  const innerHeight = chartHeight - padTop - padBottom;

  const groupWidth = innerWidth / visibleData.length;
  const barWidth = Math.min(18, groupWidth * 0.28);

  const yTicks = [0, Math.round(maxVal * 0.33), Math.round(maxVal * 0.66), maxVal];
  const activePoint = hoveredIdx !== null ? visibleData[hoveredIdx] : visibleData[visibleData.length - 1];

  return (
    <div className="bg-white dark:bg-[#151921] border border-slate-200 dark:border-slate-800 rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Circulation Velocity
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
            {activePoint.month} — {activePoint.checkouts} checkouts · {activePoint.returns} returns ·{' '}
            {activePoint.digitalReads.toLocaleString()} digital reads
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-[#1E40AF] dark:bg-blue-500" />
              Checkouts
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-slate-300 dark:bg-slate-600" />
              Returns
            </span>
          </div>

          <div
            role="group"
            aria-label="Chart timeframe"
            className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-md"
          >
            <button
              type="button"
              onClick={() => {
                setRange('6m');
                setHoveredIdx(null);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors whitespace-nowrap shrink-0 ${
                range === '6m'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              6M
            </button>
            <button
              type="button"
              onClick={() => {
                setRange('12m');
                setHoveredIdx(null);
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors whitespace-nowrap shrink-0 ${
                range === '12m'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              12M
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full min-w-[460px] h-52 select-none"
          role="img"
          aria-label="Monthly library checkouts and returns chart"
        >
          {yTicks.map((tick) => {
            const y = padTop + innerHeight - (tick / maxVal) * innerHeight;
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  x2={chartWidth - padRight}
                  y1={y}
                  y2={y}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth={1}
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono tabular-nums"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {visibleData.map((d, idx) => {
            const cx = padLeft + groupWidth * idx + groupWidth / 2;
            const checkoutH = (d.checkouts / maxVal) * innerHeight;
            const returnH = (d.returns / maxVal) * innerHeight;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={d.month}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                <rect
                  x={padLeft + groupWidth * idx + 2}
                  y={padTop}
                  width={groupWidth - 4}
                  height={innerHeight}
                  rx={4}
                  className={`transition-opacity duration-150 ${
                    isHovered
                      ? 'fill-slate-100/80 dark:fill-slate-800/50 opacity-100'
                      : 'fill-transparent opacity-0'
                  }`}
                />
                <rect
                  x={cx - barWidth - 1.5}
                  y={padTop + innerHeight - checkoutH}
                  width={barWidth}
                  height={checkoutH}
                  rx={2}
                  className="fill-[#1E40AF] dark:fill-blue-500 transition-opacity duration-150"
                />
                <rect
                  x={cx + 1.5}
                  y={padTop + innerHeight - returnH}
                  width={barWidth}
                  height={returnH}
                  rx={2}
                  className="fill-slate-300 dark:fill-slate-600 transition-opacity duration-150"
                />
                <text
                  x={cx}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className={`text-[10px] font-mono ${
                    isHovered
                      ? 'fill-slate-900 dark:fill-slate-100 font-semibold'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
