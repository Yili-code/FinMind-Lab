// Candlestick.tsx - K線圖自定義組件

import React from 'react'

interface CandlestickProps {
  x: number
  y: number
  width: number
  open: number
  close: number
  high: number
  low: number
  yScale: (value: number) => number
}

export const Candlestick: React.FC<CandlestickProps> = ({
  x,
  width,
  open,
  close,
  high,
  low,
  yScale,
}) => {
  const isUp = close >= open
  const bodyTop = yScale(Math.max(open, close))
  const bodyBottom = yScale(Math.min(open, close))
  const bodyHeight = Math.abs(bodyBottom - bodyTop)
  const wickTop = yScale(high)
  const wickBottom = yScale(low)
  const centerX = x + width / 2
  const candleWidth = width * 0.6

  return (
    <g>
      {/* 影線（最高到最低） */}
      <line
        x1={centerX}
        y1={wickTop}
        x2={centerX}
        y2={wickBottom}
        stroke={isUp ? '#ef4444' : '#22c55e'}
        strokeWidth={1.5}
      />
      {/* 實體（開盤到收盤） */}
      <rect
        x={x + (width - candleWidth) / 2}
        y={bodyTop}
        width={candleWidth}
        height={Math.max(bodyHeight, 1)}
        fill={isUp ? '#ef4444' : '#22c55e'}
        stroke={isUp ? '#dc2626' : '#16a34a'}
        strokeWidth={0.5}
      />
    </g>
  )
}

